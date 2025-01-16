<script lang="ts">
	import { onMount } from 'svelte';
	import loader from '@monaco-editor/loader';
	import { configureGenesisDarkTheme } from './theme/genesis-dark';
	import { setupGenesisLanguage } from './lang/genesis';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

	export let value = '';
	export let language = 'genesis';
	export let theme = 'genesis-theme';

	let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
	let monacoElement: HTMLElement;
	let monaco: typeof Monaco;
	let showAssistant = false;
	type ChatMessage = {
		role: 'user' | 'assistant';
		content: string;
	};

	let chatMessages: ChatMessage[] = [];
	let userInput = '';
	let isLoading = false;
	let errorMessage = '';
	let conversationId: string | null = null;

	async function sendMessage() {
		if (!userInput.trim() || isLoading) return;
		
		try {
			isLoading = true;
			errorMessage = '';
			
			// Add user message to chat
			chatMessages = [...chatMessages, { role: 'user', content: userInput }];
			const currentInput = userInput;
			userInput = '';
			
			const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer sk-f047f47a765f4996aebc2381002a821a`
				},
				body: JSON.stringify({
					model: "deepseek-chat",
					messages: [
						{
							role: "system",
							content: `You are a journaling assistant. Follow these rules:
1. Only provide assistance when explicitly asked
2. Keep responses concise and to the point
3. Never offer unsolicited advice or analysis
4. When asked about specific content, quote it exactly and provide brief, relevant suggestions
5. Maintain a neutral, helpful tone
6. If unsure what's being asked, request clarification
7. Never use markdown formatting (no **, *, etc.)
8. Use these HTML-like tags for styling:
   - <highlight> for important references
   - <important> for key points
   - <suggestion> for recommendations
   
Current journal content:
${getContent()}`
						},
						...chatMessages
					],
					temperature: 0.7
				})
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.statusText}`);
			}

			const data = await response.json();
			const assistantMessage = data.choices[0].message.content;
			
			// Add assistant response to chat
			chatMessages = [...chatMessages, { role: 'assistant', content: assistantMessage }];
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
			console.error('Assistant error:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	export const getContent = () => {
		if (editor) {
			return editor.getValue();
		}
		return '';
	};

	let decorationIds: string[] = [];

	export const highlightContent = (ranges: { startLine: number, startColumn: number, endLine: number, endColumn: number }[], className: string) => {
		if (editor) {
			// Clear existing decorations
			decorationIds = editor.deltaDecorations(decorationIds, []);
			
			// Create new decorations
			const newDecorations = ranges.map(range => ({
				range: new monaco.Range(range.startLine, range.startColumn, range.endLine, range.endColumn),
				options: {
					className: className,
					inlineClassName: className,
					overviewRuler: {
						color: '#FFEB3B',
						position: monaco.editor.OverviewRulerLane.Full
					}
				}
			}));
			
			decorationIds = editor.deltaDecorations([], newDecorations);
		}
	};

	export const setContent = (content: string) => {
		if (editor) {
			editor.setValue(content);
		}
	};

	const eventListeners = new Map<string, (() => void)[]>();
	export const on = (event: string, callback: () => void) => {
		if (!eventListeners.has(event)) {
			eventListeners.set(event, []);
		}
		eventListeners.get(event)?.push(callback);
	};

	const dispatchEvent = (event: string) => {
		const listeners = eventListeners.get(event);
		if (listeners) {
			listeners.forEach(callback => callback());
		}
	};

	onMount(() => {
		const initializeEditor = async () => {
			try {
				monaco = await loader.init();
				configureGenesisDarkTheme(monaco);
				setupGenesisLanguage(monaco);

				editor = monaco.editor.create(monacoElement, {
					value,
					language,
					theme,
					automaticLayout: true,
					wordWrap: 'on',
					minimap: { enabled: false },
					lineNumbers: 'on',
					lineNumbersMinChars: 3,
					fontSize: 16,
					fontFamily: "'Source Serif Pro', 'Crimson Pro', Georgia, serif",
					lineHeight: 24,
					fontLigatures: true,
					placeholder: 'continue typing...'
				});

				if (editor) {
					dispatchEvent('ready');
					
					editor?.onKeyDown((e) => {
						if (e.keyCode === monaco.KeyCode.Enter) {
							e.preventDefault();
							const selection = editor?.getSelection();
							const position = selection?.getPosition();

							if (position) {
								editor?.executeEdits('insert-newline', [
									{
										range: new monaco.Selection(
											position.lineNumber,
											position.column,
											position.lineNumber,
											position.column
										),
										text: '\n'
									}
								]);
							}
						}
					});

					editor.onDidChangeModelContent(() => {
						// No automatic tilde handling
					});
				}
			} catch (error) {
				console.error('Failed to initialize Monaco editor:', error);
			}
		};

		initializeEditor();

		return () => {
			if (editor) {
				editor.dispose();
			}
		};
	});
</script>

<div bind:this={monacoElement} class="editor-container" />

<style>
	@import '$lib/editor/editor.css';

	.editor-container {
		height: calc(100vh - 60px);
		width: 100%;
	}

	.assistant-container {
		position: fixed;
		right: 20px;
		bottom: 20px;
		z-index: 1000;
	}

	.assistant-button {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background-color: #007bff;
		color: white;
		border: none;
		box-shadow: 0 2px 5px rgba(0,0,0,0.2);
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.assistant-button:hover {
		background-color: #0056b3;
	}

	.assistant-panel {
		position: fixed;
		right: 20px;
		bottom: 80px;
		width: 350px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		display: flex;
		flex-direction: column;
	}

	.assistant-header {
		padding: 12px;
		background: #f5f5f5;
		border-bottom: 1px solid #ddd;
		border-radius: 8px 8px 0 0;
	}

	.assistant-body {
		padding: 12px;
		flex-grow: 1;
		overflow-y: auto;
		max-height: 300px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.message {
		max-width: 90%;
		padding: 6px 10px;
		border-radius: 8px;
		word-wrap: break-word;
		line-height: 1.4;
		font-size: 14px;
		margin: 4px 0;
	}

	.user-message {
		background: #007bff;
		color: white;
		align-self: flex-end;
		border-bottom-right-radius: 4px;
	}

	.assistant-message {
		background: #f8f9fa;
		color: #212529;
		align-self: flex-start;
		border-bottom-left-radius: 4px;
		position: relative;
		border: 1px solid #dee2e6;
	}

	.highlight-reference {
		background-color: rgba(255, 235, 59, 0.3);
		border-radius: 2px;
		padding: 2px;
	}

	.important-text {
		color: #d32f2f;
		font-weight: 500;
	}

	.suggestion-text {
		color: #1976d2;
		font-style: italic;
	}

	.response-tag {
		position: absolute;
		right: 8px;
		top: 8px;
		font-size: 0.8em;
		color: #666;
		background: rgba(255, 255, 255, 0.8);
		padding: 2px 4px;
		border-radius: 4px;
	}

	.input-container {
		display: flex;
		gap: 8px;
		padding: 12px;
		border-top: 1px solid #ddd;
	}

	.chat-input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 8px;
		resize: none;
		min-height: 40px;
		max-height: 100px;
	}

	.send-button {
		padding: 8px 16px;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.send-button:hover {
		background: #0056b3;
	}

	.send-button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
</style>

<div class="assistant-container">
	<button class="assistant-button" on:click={() => {
		showAssistant = !showAssistant;
		if (showAssistant && chatMessages.length === 0) {
			chatMessages = [{
				role: 'assistant',
				content: 'Hello! I can help analyze your journal entries. Try asking about specific lines or requesting writing suggestions.'
			}];
		}
	}}>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" fill="currentColor"/>
		</svg>
	</button>

	{#if showAssistant}
		<div class="assistant-panel">
			<div class="assistant-header">
				<h3>Journaling Assistant</h3>
			</div>
			<div class="assistant-body">
				{#each chatMessages as message}
					<div class="message {message.role}-message">
						{@html message.content
							.replace(/<highlight>(.*?)<\/highlight>/g, '<span class="highlight-reference">$1</span>')
							.replace(/<important>(.*?)<\/important>/g, '<span class="important-text">$1</span>')
							.replace(/<suggestion>(.*?)<\/suggestion>/g, '<span class="suggestion-text">$1</span>')}
					</div>
				{/each}
				{#if isLoading}
					<div class="message assistant-message">
						Thinking...
					</div>
				{/if}
			</div>
			<div class="input-container">
				<textarea
					class="chat-input"
					bind:value={userInput}
					on:keydown={handleKeyPress}
					placeholder="Type your message..."
					disabled={isLoading}
				/>
				<button
					class="send-button"
					on:click={sendMessage}
					disabled={isLoading || !userInput.trim()}
				>
					Send
				</button>
			</div>
		</div>
	{/if}
</div>
