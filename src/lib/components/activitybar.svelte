<script lang="ts">
  import { fly } from 'svelte/transition';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { deleteDoc, doc } from 'firebase/firestore';
  import { firestore } from '$lib/firebase';

  interface Journal {
    id: string;
    title?: string;
    content: string;
    lastSaved: Date;
  }

  export let isCollapsed: Writable<boolean>;
  export let onJournalSelect: (journal: Journal) => void = () => {};
  export let journals: Journal[] = [];
  
  let isLoading = false;
  let error: string | null = null;
  let showContextMenu = false;
  let contextMenuPosition = { x: 0, y: 0 };
  let selectedJournal: Journal | undefined;

  async function handleDelete(journal: Journal) {
    if (!confirm('Are you sure you want to delete this journal?')) return;
    
    try {
      isLoading = true;
      await deleteDoc(doc(firestore, 'journals', journal.id));
      journals = journals.filter(j => j.id !== journal.id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete journal';
    } finally {
      isLoading = false;
      showContextMenu = false;
    }
  }
</script>

<style>
  .activity-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 250px;
    background: #2d2d2d;
    color: white;
    transition: transform 0.3s ease;
    z-index: 100;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .collapsed {
    transform: translateX(-240px);
  }

  .handle {
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 60px;
    background: #2d2d2d;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
    transition: background 0.2s ease;
  }

  .handle:hover {
    background: #3d3d3d;
  }

  .header {
    padding: 1rem;
    border-bottom: 1px solid #444;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .collapse-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0 0.5rem;
  }

  .collapse-btn:hover {
    color: #ddd;
  }

  .journal-list {
    padding: 0.5rem;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .journal-item {
    padding: 0.75rem;
    margin: 0.25rem 0;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .journal-item:hover {
    background: #444;
  }

  .loading,
  .error {
    padding: 1rem;
    text-align: center;
  }

  .error {
    color: #ff6b6b;
  }

  .context-menu {
    position: fixed;
    background: #2d2d2d;
    border: 1px solid #444;
    border-radius: 4px;
    z-index: 1000;
    min-width: 150px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .context-menu-item {
    padding: 0.75rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .context-menu-item:hover {
    background: #444;
  }
</style>

<div 
  class="activity-bar" 
  class:collapsed={$isCollapsed}
  on:mouseenter={() => $isCollapsed = false}
  on:mouseleave={() => $isCollapsed = true}
>
  {#if $isCollapsed}
    <div class="handle"></div>
  {/if}
  
  <div class="header">
    <span>My Journals</span>
    <button class="collapse-btn" on:click={() => $isCollapsed = !$isCollapsed}>
      {$isCollapsed ? '' : '«'}
    </button>
  </div>

  {#if showContextMenu && selectedJournal}
    <div 
      class="context-menu" 
      style={`left: ${contextMenuPosition.x}px; top: ${contextMenuPosition.y}px`}
    >
        <div 
          class="context-menu-item"
          on:click={() => {
            if (selectedJournal) {
              handleDelete(selectedJournal);
            }
          }}
        >
        Delete
      </div>
    </div>
  {/if}
  
  {#if isLoading}
    <div class="loading" transition:fly={{ y: 20, duration: 200 }}>
      Loading...
    </div>
  {:else if error}
    <div class="error" transition:fly={{ y: 20, duration: 200 }}>
      {error}
    </div>
  {:else}
    <div class="journal-list">
      {#each journals as journal}
        <div 
          class="journal-item" 
          transition:fly={{ y: 20, duration: 200 }}
          on:click={() => onJournalSelect(journal)}
          on:contextmenu|preventDefault={(e) => {
            selectedJournal = journal;
            contextMenuPosition = { x: e.clientX, y: e.clientY };
            showContextMenu = true;
          }}
        >
          {journal.title || 'Untitled Journal'}
        </div>
      {/each}
    </div>
  {/if}
</div>
