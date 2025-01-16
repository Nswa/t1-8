<script lang="ts">
	//auth session
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { firebaseAuth, firestore } from '$lib/firebase';
	import { onAuthStateChanged, signOut } from 'firebase/auth';
	import { doc, setDoc, updateDoc, serverTimestamp, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
	let loggedInUserEmail: string | null = null;

	import MonacoEditor from '$lib/editor/monaco.svelte';
	import Menubar from '$lib/components/menubar.svelte';
	import ActivityBar from '$lib/components/activitybar.svelte';
	import { writable } from 'svelte/store';

	let isActivityBarCollapsed = writable<boolean>(false);

	interface Journal {
		id: string;
		content: string;
		title?: string;
		lastSaved: Date;
	}

	const loadJournal = (journal: Journal) => {
		if (editorComponent) {
			editorComponent.setContent(journal.content);
		}
	};

	let currentJournalId: string | null = null;
	
	let editorInitialized = false;
	let isLayoutReady = false;
	
	// Initialize layout after mount
	onMount(async () => {
		await tick(); // Wait for initial layout
		isLayoutReady = true;
	});
	
	let onCreateNew = () => {
		// Clear current journal ID
		currentJournalId = null;
		localStorage.removeItem('currentJournalId');
		
		// Clear editor content immediately if component exists
		if (editorComponent) {
			editorComponent.setContent('~');
			console.log('New journal initialized');
		}
		
		// Set up ready listener as fallback
		const handleReady = () => {
			if (editorComponent) {
				editorComponent.setContent('~');
				console.log('New journal initialized after editor ready');
			}
		};
		
		// Set up ready listener using Svelte 5 event system
		if (editorComponent && editorComponent.on) {
			editorComponent.on('ready', handleReady);
		}
	};

	const fetchJournals = async () => {
		if (!firebaseAuth.currentUser) return;
		
		try {
			const q = query(
				collection(firestore, 'journals'),
				where('email', '==', firebaseAuth.currentUser.email)
			);
			
			const querySnapshot = await getDocs(q);
			journalList = querySnapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			} as Journal));
			
			// Store in localStorage
			localStorage.setItem('journalList', JSON.stringify(journalList));
		} catch (error) {
			console.error('Error fetching journals:', error);
		}
	};

	const saveJournal = async () => {
		if (typeof localStorage === 'undefined') return;
		if (!firebaseAuth.currentUser || !loggedInUserEmail) {
			console.error('No user logged in or email not available');
			return;
		}
		const userId = firebaseAuth.currentUser.uid;
		const content = editorComponent.getContent();
		
		try {
			// If we have a current journal ID, update it
			if (currentJournalId) {
				const journalRef = doc(firestore, 'journals', currentJournalId);
				await updateDoc(journalRef, {
					content,
					lastSaved: serverTimestamp()
				});
			} else {
				// Create new journal only when saving
				const journalId = crypto.randomUUID();
				// Extract first 5 words as title
				const firstLine = content.split('\n')[0];
				const title = firstLine.split(/\s+/).slice(0, 5).join(' ') || 'Untitled Journal';
				
				const journalRef = doc(firestore, 'journals', journalId);
				await setDoc(journalRef, {
					id: journalId,
					content,
					title,
					lastSaved: serverTimestamp(),
					email: loggedInUserEmail,
					userId: userId
				});
				// Store the new journal ID
				currentJournalId = journalId;
				localStorage.setItem('currentJournalId', journalId);
			}
			
			// Refresh journal list after saving
			await fetchJournals();
			console.log('Journal saved successfully');
		} catch (error) {
			console.error('Error saving journal:', error);
		}
	};

	interface MonacoEditorComponent {
		setContent: (content: string) => void;
		getContent: () => string;
		on?: (event: string, callback: () => void) => void;
	}
	
	let editorComponent: MonacoEditorComponent;

	let journalList: Journal[] = [];
	
	onMount(() => {
		// Initialize current journal ID
		currentJournalId = localStorage.getItem('currentJournalId');
		
		// Check if the user is authenticated
		const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
			if (user) {
				// User is signed in, get their email
				loggedInUserEmail = user.email;
				
				// Fetch journals from Firestore
				try {
					const q = query(
						collection(firestore, 'journals'),
						where('email', '==', user.email)
					);
					
					const querySnapshot = await getDocs(q);
					journalList = querySnapshot.docs.map(doc => ({
						id: doc.id,
						...doc.data()
					} as Journal));
					
					// Store in localStorage
					localStorage.setItem('journalList', JSON.stringify(journalList));
				} catch (error) {
					console.error('Error fetching journals:', error);
				}
				
				// Check for existing journal ID
				if (currentJournalId) {
					try {
						// Load existing journal
						const journalRef = doc(firestore, 'journals', currentJournalId);
						const journalDoc = await getDoc(journalRef);
						
						if (journalDoc.exists()) {
							const journalData = journalDoc.data();
							if (editorComponent) {
								editorComponent.setContent(journalData.content);
							}
						} else {
							console.log('Journal not found');
							currentJournalId = null;
							localStorage.removeItem('currentJournalId');
						}
					} catch (error) {
						console.error('Error loading journal:', error);
						currentJournalId = null;
						localStorage.removeItem('currentJournalId');
					}
				}
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

<Menubar 
  loggedInUserEmail={loggedInUserEmail} 
  onSave={saveJournal}
  onCreateNew={onCreateNew}
/>
<ActivityBar 
  bind:isCollapsed={isActivityBarCollapsed} 
  onJournalSelect={loadJournal}
  journals={journalList}
  activeJournalId={currentJournalId}
/>

<div class="editor-container">
	<svelte:component
		this={MonacoEditor}
		bind:this={editorComponent}
	value="~This is a regular atom with [an enveloped content] in it~Another atom with [multiple] [enveloped] [contents]"
		on:change={(e) => {
			const content = e.detail;
			const lines = content.split('\n');
			const modifiedLines = lines.map((line: string) => line.startsWith('~') ? line : `~${line}`);
			editorComponent.setContent(modifiedLines.join('\n'));
		}}
		language="genesis"
		theme="genesis-theme"
		on:ready={() => {
			editorInitialized = true;
			console.log('Editor initialized');
		}}
	/>
</div>

<style>
	:global(:root) {
		--transition-speed: 400ms;
		--font-ui: 'Inter', system-ui, -apple-system, sans-serif;
		--font-editor: 'JetBrains Mono', monospace;
	}

	:global(html, body) {
		margin: 0;
		height: 100%;
		width: 100%;
		overflow-x: hidden;
		font-family: var(--font-ui);
	}

	:global(#svelte) {
		width: 100vw;
		overflow-x: hidden;
	}

	/* Menubar specific styles */
	:global(.menubar) {
		font-family: var(--font-ui);
		font-size: 14px;
		width: 100vw;
		box-sizing: border-box;
		overflow: hidden;
	}

	/* ActivityBar specific styles */
	:global(.activitybar) {
		font-family: var(--font-ui);
		font-size: 14px;
	}

	/* Editor container */
	.editor-container {
		font-family: var(--font-editor);
	}

	@media only screen and (max-width: 600px) {
		.editor-container {
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
