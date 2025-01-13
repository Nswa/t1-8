<script lang="ts">
	//auth session
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { firebaseAuth } from '$lib/firebase';
	import { onAuthStateChanged, signOut } from 'firebase/auth';
	let loggedInUserEmail: string | null = null;

	import MonacoEditor from '$lib/editor/monaco.svelte';
	import Menubar from '$lib/components/menubar.svelte';
	let code = 'console.log("Hello, Monaco!");';

	let editorComponent: MonacoEditor;

	onMount(() => {
		// Check if the user is authenticated
		const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
			if (user) {
				// User is signed in, get their email
				loggedInUserEmail = user.email;
				console.log('Logged in user email:', loggedInUserEmail); // Debugging

			} else {
				// User is not signed in, redirect to login
				goto('/');
			}
		});
		// Cleanup the observer when the component is destroyed
		return () => unsubscribe();
	});

	const logout = async () => {
		try {
			await signOut(firebaseAuth);
			goto('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};
</script>

<Menubar loggedInUserEmail={loggedInUserEmail} />

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
