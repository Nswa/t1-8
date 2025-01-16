<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { signOut } from 'firebase/auth';
	import { firebaseAuth } from '$lib/firebase';

	export let loggedInUserEmail: string | null = null; // Accept the prop

	let searchQuery = '';
	let showUserMenu = false; // State to control the visibility of the user menu

	export let onSave: () => void;
	export let onCreateNew: () => void = () => {};

	const menuItems = [
		{ name: 'New File', action: () => { 
			console.log('Creating new journal...');
			onCreateNew(); 
		} },
		{ name: 'Save', action: () => onSave() },
		{ name: 'Logout', action: () => logout() }
	];

	function performSearch() {
		if (searchQuery.trim()) {
			alert(`Searching for: ${searchQuery}`);
			// Here you would implement actual search functionality
		}
	}

	const toggleUserMenu = () => {
		showUserMenu = !showUserMenu;
	};

	const logout = async () => {
		try {
			await signOut(firebaseAuth);
			goto('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	onMount(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.shiftKey && e.key === 'F') {
				e.preventDefault();
				const searchInput = document.querySelector('.search-input') as HTMLInputElement;
				searchInput?.focus();
			}
		};

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<nav class="menu-bar">
	<div class="menu-items">
	{#each menuItems as item}
		<div class="menu-item" on:click={item.action}>
			{item.name}
		</div>
	{/each}
	</div>
	<div class="search-container">
		<input
			type="text"
			class="search-input"
			placeholder="Search (Ctrl+Shift+F)"
			bind:value={searchQuery}
			on:keyup={(e) => e.key === 'Enter' && performSearch()}
		/>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="search-icon" on:click={performSearch}>&#128269;</div>
	</div>
	{#if loggedInUserEmail}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="user-email" on:click={toggleUserMenu}>
			<p>You are logged in as: <strong>{loggedInUserEmail}</strong></p>
			{#if showUserMenu}
				<div class="user-menu">
					<div class="user-menu-item" on:click={logout}>Logout</div>
				</div>
			{/if}
		</div>
	{/if}
</nav>

<style>
	:root {
		--background: #1e1e1e;
		--menu-bar: #252526;
		--menu-text: #cccccc;
		--menu-hover: #094771;
		--menu-active: #007acc;
	}

	.menu-bar {
		background: var(--menu-bar);
		height: 30px;
		display: flex;
		align-items: center;
		padding: 0 10px;
		-webkit-app-region: drag;
	}

	.menu-items {
		display: flex;
		align-items: center;
		height: 100%;
		-webkit-app-region: no-drag;
	}

	.menu-item {
		color: var(--menu-text);
		padding: 0 8px;
		height: 100%;
		display: flex;
		align-items: center;
		font-size: 13px;
		cursor: pointer;
		position: relative;
	}

	.menu-item:hover {
		background: var(--menu-hover);
	}

	.menu-item:active {
		background: var(--menu-active);
	}

	.menu-item .dropdown {
		display: none;
		position: absolute;
		top: 30px;
		left: 0;
		background: var(--menu-bar);
		border: 1px solid rgba(255, 255, 255, 0.1);
		min-width: 200px;
		z-index: 1000;
	}

	.menu-item:hover .dropdown {
		display: block;
	}

	.dropdown-item {
		padding: 5px 20px;
		color: var(--menu-text);
		font-size: 13px;
	}

	.dropdown-item:hover {
		background: var(--menu-hover);
	}

	.search-container {
		margin-left: auto;
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		padding: 2px 8px;
		margin-right: 10px;
		height: 22px;
	}

	.search-input {
		background: transparent;
		border: none;
		color: var(--menu-text);
		font-size: 13px;
		width: 150px;
		outline: none;
	}

	.search-input::placeholder {
		color: rgba(204, 204, 204, 0.6);
	}

	.search-icon {
		color: var(--menu-text);
		font-size: 14px;
		margin-left: 4px;
		cursor: pointer;
	}

	.search-icon:hover {
		color: #ffffff;
	}

	.user-email {
		color: var(--menu-text);
		font-size: 13px;
		margin-left: 10px;
		padding: 0 8px;
		cursor: pointer;
		position: relative;
	}

	.user-menu {
		position: absolute;
		top: 30px;
		right: 0;
		background: var(--menu-bar);
		border: 1px solid rgba(255, 255, 255, 0.1);
		min-width: 150px;
		z-index: 1000;
	}

	.user-menu-item {
		padding: 5px 20px;
		color: var(--menu-text);
		font-size: 13px;
		cursor: pointer;
	}

	.user-menu-item:hover {
		background: var(--menu-hover);
	}
</style>
