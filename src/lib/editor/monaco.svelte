<script lang="ts">
	import { onMount } from 'svelte';
	import loader from '@monaco-editor/loader';
	import { configureGenesisDarkTheme } from './theme/genesis-dark';
	import { setupGenesisLanguage } from './lang/genesis';
	import type * as Monaco from 'monaco-editor';

	export let value = '';
	export let language = 'genesis';
	export let theme = 'genesis-theme';

	let editor: Monaco.editor.IStandaloneCodeEditor;
	let monacoElement: HTMLElement;
	let monaco: typeof Monaco;
	let showModal = false;
	let userQuestion = '';
	let summary = '';
	let isLoading = false;
	let errorMessage = '';

	async function handleSummarize() {
		try {
			isLoading = true;
			errorMessage = '';
			const content = getContent();
			
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
							content: "You are a helpful assistant that summarizes and analyzes code content."
						},
						{
							role: "user",
							content: `Content: ${content}\n\nQuestion: ${userQuestion}`
						}
					],
					temperature: 0.7
				})
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.statusText}`);
			}

			const data = await response.json();
			summary = data.choices[0].message.content;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
			console.error('Summarization error:', error);
		} finally {
			isLoading = false;
		}
	}

	// Existing methods remain unchanged
	export const getContent = () => {
		if (editor) {
			return editor.getValue();
		}
		return '';
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
					fontSize: 16,
					fontFamily: "'Source Serif Pro', 'Crimson Pro', Georgia, serif",
					lineHeight: 24,
					fontLigatures: true,
					placeholder: '~continue typing...'
				});

				if (editor) {
					dispatchEvent('ready');
					
					editor.onKeyDown((e: Monaco.IKeyboardEvent) => {
						if (e.keyCode === monaco.KeyCode.Enter) {
							e.preventDefault();
							const selection = editor.getSelection();
							const position = selection?.getPosition();

							if (position) {
								editor.executeEdits('insert-newline', [
									{
										range: new monaco.Range(
											position.lineNumber,
											position.column,
											position.lineNumber,
											position.column
										),
										text: '\n~'
									}
								]);
							}
						}
					});

					editor.onDidChangeModelContent(() => {
						const model = editor.getModel();
						if (model) {
							const content = model.getValue();
							if (content && !content.startsWith('~')) {
								editor.setValue('~' + content);
							}
						}
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

<!-- svelte-ignore element_invalid_self_closing_tag -->
<div bind:this={monacoElement} class="editor-container" />

<style>
	@import '$lib/editor/editor.css';

	.floating-button-container {
		position: absolute;
		right: 20px;
		bottom: 20px;
		z-index: 1000;
	}

	.floating-button {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background-color: #007bff;
		color: white;
		border: none;
		box-shadow: 0 2px 5px rgba(0,0,0,0.2);
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.floating-button:hover {
		background-color: #0056b3;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0,0,0,0.5);
		z-index: 999;
	}

	.modal-content {
		position: absolute;
		right: 20px;
		bottom: 80px;
		background: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		min-width: 300px;
		max-width: 500px;
		z-index: 1000;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 20px;
	}

	.question-input {
		width: 100%;
		min-height: 100px;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		resize: vertical;
	}

	.submit-btn {
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.submit-btn:hover {
		background-color: #0056b3;
	}

	.submit-btn:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	.summary-result {
		margin-top: 20px;
		padding: 15px;
		background-color: #f5f5f5;
		border-radius: 4px;
	}

	.error-message {
		color: #dc3545;
		margin-top: 10px;
	}
</style>

<div class="floating-button-container">
	<button class="floating-button" on:click={() => showModal = !showModal}>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
			<path d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z" fill="currentColor"/>
		</svg>
	</button>

	{#if showModal}
		<div class="modal-overlay" on:click|self={() => showModal = false}>
			<div class="modal-content">
				<h3>Content Summarization</h3>
				<div class="input-group">
					<textarea 
						bind:value={userQuestion}
						placeholder="Ask a question about the content..."
						class="question-input"
					></textarea>
					<button 
						on:click={handleSummarize}
						class="submit-btn"
						disabled={isLoading}
					>
						{#if isLoading}
							Summarizing...
						{:else}
							Summarize
						{/if}
					</button>
				</div>
				
				{#if summary}
					<div class="summary-result">
						<h4>Summary:</h4>
						<p>{summary}</p>
					</div>
				{/if}

				{#if errorMessage}
					<div class="error-message">
						Error: {errorMessage}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
