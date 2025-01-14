<script lang="ts">
  import { fly } from 'svelte/transition';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';

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
    transform: translateX(-100%);
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
</style>

<div class="activity-bar" class:collapsed={$isCollapsed}>
  <div class="header">
    <span>My Journals</span>
    <button class="collapse-btn" on:click={() => $isCollapsed = !$isCollapsed}>
      {$isCollapsed ? '»' : '«'}
    </button>
  </div>
  
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
        >
          {journal.title || 'Untitled Journal'}
        </div>
      {/each}
    </div>
  {/if}
</div>
