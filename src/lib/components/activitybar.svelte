<script lang="ts">
    import { onMount } from 'svelte';
  
    interface FileItem {
      name: string;
      type: 'file';
    }
  
    interface FolderItem {
      name: string;
      type: 'folder';
      children?: (FileItem | FolderItem)[];
    }
  
    export let isCollapsed = false;
    let activityBar: HTMLElement;
  
    const fileStructure: (FileItem | FolderItem)[] = [
      {
        name: 'src',
        type: 'folder',
        children: [
          { name: 'index.js', type: 'file' },
          { name: 'utils.js', type: 'file' }
        ]
      },
      {
        name: 'public',
        type: 'folder',
        children: [
          { name: 'index.html', type: 'file' },
          { name: 'style.css', type: 'file' }
        ]
      },
      { name: 'README.md', type: 'file' },
      { name: 'package.json', type: 'file' }
    ];
  
    onMount(() => {
      // Check localStorage for collapsed state
      const storedState = localStorage.getItem('activityBarCollapsed');
      if (storedState !== null) {
        isCollapsed = storedState === 'true';
      }
    });
  
    function toggleCollapsed() {
      isCollapsed = !isCollapsed;
      localStorage.setItem('activityBarCollapsed', isCollapsed.toString());
    }
  
    function toggleFolder(event: MouseEvent) {
      if (!isCollapsed) {
        const target = event.currentTarget as HTMLElement;
        const nested = target.querySelector('.nested');
        if (nested) {
          nested.classList.toggle('open');
        }
      }
    }
  </script>
  
  <div class="activity-bar" class:collapsed={isCollapsed} bind:this={activityBar}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="handle-bar" on:click={toggleCollapsed} on:mousedown|preventDefault>
      <span class="handle-icon">☰</span>
    </div>
    <div class="file-tree">
      {#each fileStructure as item}
        {#if item.type === 'folder'}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="folder" on:click={toggleFolder}>
            <span class="icon">📁</span> {item.name}
            {#if item.children && item.children.length > 0}
              <div class="nested">
                {#each item.children as child}
                  <div class="file">
                    <span class="icon">📄</span> {child.name}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <div class="file">
            <span class="icon">📄</span> {item.name}
          </div>
        {/if}
      {/each}
    </div>
  </div>
  
  <style>
    :global(:root) {
      --primary-color: #1e1e1e;
      --secondary-color: #252526;
      --text-color: #cccccc;
      --icon-color: #cccccc;
      --hover-color: #2a2d2e;
      --border-color: #3c3c3c;
      --transition-speed: 0.2s;
    }
  
    .activity-bar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 250px;
      background-color: var(--secondary-color);
      border-right: 1px solid var(--border-color);
      transition: width var(--transition-speed) ease;
      z-index: 1000;
      color: var(--text-color);
    }
  
    .handle-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 10px;
      cursor: pointer;
      background-color: var(--secondary-color);
      border-bottom: 1px solid var(--border-color);
    }
  
    .handle-bar:hover {
      background-color: var(--hover-color);
    }
  
    .handle-icon {
      font-size: 1.2rem;
      color: var(--icon-color);
    }
  
    .file-tree {
      padding: 10px 0;
      overflow-y: auto;
      height: calc(100vh - 71px);
      margin-top: 30px;
    }
  
    .folder, .file {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      cursor: pointer;
      user-select: none;
    }
  
    .folder:hover, .file:hover {
      background-color: var(--hover-color);
    }
  
    .icon {
      margin-right: 8px;
      color: var(--icon-color);
    }
  
    .nested {
      padding-left: 20px;
      border-left: 1px solid var(--border-color);
      margin-left: 10px;
    }
  
    /* Collapsed state */
    .activity-bar.collapsed {
      width: 50px;
    }
  
    .activity-bar.collapsed .handle-bar {
      justify-content: center;
    }
  
    .activity-bar.collapsed .file-tree {
      display: none;
    }
  
    /* Transitions */
    .activity-bar,
    .handle-bar,
    .file-tree {
      transition: all var(--transition-speed) ease;
    }
  </style>
  
  