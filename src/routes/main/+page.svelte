<script lang="ts">
	//auth session
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { firebaseAuth, firestore } from '$lib/firebase';
	import { onAuthStateChanged, signOut } from 'firebase/auth';
	import { doc, setDoc, updateDoc, serverTimestamp, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
	let loggedInUserEmail: string | null = null;
	let userId: string | null = null;

	import MonacoEditor from '$lib/editor/monaco.svelte';
	import Menubar from '$lib/components/menubar.svelte';
	import ActivityBar from '$lib/components/activitybar.svelte';
	import { writable } from 'svelte/store';

	let code = 'console.log("Hello, Monaco!");';
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
				// Create new journal
				const journalId = crypto.randomUUID();
				const journalRef = doc(firestore, 'journals', journalId);
				await setDoc(journalRef, {
					id: journalId,
					content,
					title: 'Untitled Journal',
					lastSaved: serverTimestamp(),
					email: loggedInUserEmail,
					userId: userId
				});
				// Store the new journal ID
				currentJournalId = journalId;
				localStorage.setItem('currentJournalId', journalId);
			}
			
			console.log('Journal saved successfully');
		} catch (error) {
			console.error('Error saving journal:', error);
		}
	};

	let editorComponent: MonacoEditor;

	let journalList: Journal[] = [];
	
	onMount(() => {
		// Initialize current journal ID
		currentJournalId = localStorage.getItem('currentJournalId');
		
		// Check if the user is authenticated
		const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
			if (user) {
				// User is signed in, get their email
				loggedInUserEmail = user.email;
				console.log('Logged in user email:', loggedInUserEmail); // Debugging
				
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
				currentJournalId = localStorage.getItem('currentJournalId');
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
							console.log('Journal not found, creating new one');
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

<Menubar loggedInUserEmail={loggedInUserEmail} onSave={saveJournal} />
<ActivityBar 
  bind:isCollapsed={isActivityBarCollapsed} 
  onJournalSelect={loadJournal}
  journals={journalList}
/>

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
