<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { firebaseAuth } from '$lib/firebase';
	import { onAuthStateChanged,signOut } from 'firebase/auth';
	import { on } from 'svelte/events';

	let loggedInUserEmail: string | null = null;

	onMount(() => {
		// Check if the user is authenticated
		const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
			if (user) {
				// User is signed in, get their email
				loggedInUserEmail = user.email;
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

<h1>Main Page</h1>
<p>Welcome to the main page! You are now logged in.</p>

{#if loggedInUserEmail}
	<div class="logged-in-message">
		<p>You are logged in as: <strong>{loggedInUserEmail}</strong></p>
	</div>
{/if}

<button on:click={logout}>Logout</button>

<style>
	.logged-in-message {
		margin-top: 20px;
		padding: 10px;
		background-color: #4caf50;
		color: white;
		border-radius: 5px;
		text-align: center;
	}
</style>