<script lang="ts">
	import MonacoEditor from '$lib/editor/monaco.svelte';
	import Menubar from '$lib/components/menubar.svelte';
	let code = 'console.log("Hello, Monaco!");';

	let editorComponent: MonacoEditor;
</script>

<Menubar/>
<div class="editor-container">
	<MonacoEditor
		bind:this={editorComponent}
		value="~This is a regular atom with [an enveloped content] in it~Another atom with [multiple] [enveloped] [contents]"
		language="genesis"
		theme="genesis-theme"
	/>
</div>

<style>
	:global(:root) {
		font-size: 16px;
		font-family: 'Open Sans';
		--transition-speed: 400ms;
	}
	:global(html, body) {
		margin: 0%;
		height: 100%;
	}

	@media only screen and (max-width: 600px) {
		:global(.editor-container) {
			padding-left: 0;
		}
	}

	:global(body)::-webkit-scrollbar {
		width: 0.25rem;
		height: 0.5rem;
	}

	:global(body)::-webkit-scrollbar-track {
		background: #1e1e24;
	}

	:global(body)::-webkit-scrollbar-thumb {
		background: #6644b8;
	}

</style>
