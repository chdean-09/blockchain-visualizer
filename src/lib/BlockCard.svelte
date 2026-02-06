<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { Block } from './blockchain';

  export let block: Block;
  export let prevBlock: Block | null = null;
  export let onUpdate: () => void;

  let isMining = false;

  // Visual check: Does this block link correctly to the previous one?
  // If it's the genesis block (no prevBlock), it's always "linked" correctly.
  $: isLinkValid = prevBlock ? block.previousHash === prevBlock.hash : true;
  
  // Visual check: Is the hash valid for the current difficulty?
  // We check if the stored hash matches the calculated hash (integrity)
  $: isIntegrityValid = block.hash === block.calculateHash();

  // Combined validity for the border color
  $: isValid = isLinkValid && isIntegrityValid;

  async function handleMine() {
    isMining = true;
    // Small delay to allow the UI to show the spinner (Mining is synchronous)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // We need to ask the parent for the current difficulty, 
    // but since the method is on the block, we can just pass a hardcoded/prop difficulty 
    // or (better) let the block object handle it if we passed the difficulty down.
    // For simplicity, I'll pass 2 here or add a prop. 
    // Let's assume a default or pass it in. 
    // actually, let's fix this: The mineBlock method needs difficulty.
    // We will accept 'difficulty' as a prop.
    block.mineBlock(difficulty); 
    
    isMining = false;
    onUpdate(); // Tell parent to refresh
  }

  // Handle Tampering: User edits data
  function handleInput() {
    // 1. Update data (happens automatically via bind:value)
    // 2. Recalculate hash immediately (breaking the chain)
    block.hash = block.calculateHash();
    onUpdate();
  }

  export let difficulty: number = 2;
</script>

<div 
  class="card p-4 w-full max-w-md shadow-xl transition-all duration-500 border-4"
  class:variant-ring-success={isValid}
  class:variant-ring-error={!isValid}
>
  <header class="flex justify-between items-center mb-4">
    <div class="flex items-center gap-2">
      <h3 class="h3 font-bold">Block #{block.index}</h3>
      {#if !isValid}
        <span class="badge variant-filled-error animate-pulse">INVALID</span>
      {/if}
    </div>
    <div class="text-xs opacity-50 font-mono">
      {new Date(block.timestamp).toLocaleTimeString()}
    </div>
  </header>

  <div class="space-y-4">
    
    <label class="label">
      <span>Data</span>
      <input 
        class="input font-mono" 
        type="text" 
        bind:value={block.data} 
        on:input={handleInput} 
        placeholder="Transaction Data"
      />
    </label>

    <div class="p-3 bg-surface-800 rounded text-[10px] md:text-xs font-mono space-y-2">
      
      <div class="group">
        <span class="text-surface-400 block uppercase tracking-wider">Previous Hash</span>
        <span class="break-all {isLinkValid ? 'text-success-400' : 'text-error-400'}">
          {block.previousHash}
        </span>
      </div>

      <div class="group">
        <span class="text-surface-400 block uppercase tracking-wider">Hash</span>
        <span class="break-all {block.hash.substring(0, difficulty) === Array(difficulty+1).join('0') ? 'text-success-400' : 'text-warning-400'}">
          {block.hash}
        </span>
      </div>

      <div class="flex justify-between items-center border-t border-surface-600 pt-2 mt-2">
        <span class="text-surface-400 uppercase">Nonce</span>
        <span class="font-bold text-lg">{block.nonce}</span>
      </div>
    </div>
  </div>

  <footer class="mt-4 flex justify-end">
    <button 
      class="btn variant-filled-primary w-full" 
      on:click={handleMine}
      disabled={isMining}
    >
      {#if isMining}
        <span>⛏️ Mining...</span>
      {:else}
        <span>Mine Block</span>
      {/if}
    </button>
  </footer>
</div>

<div class="flex justify-center my-2 text-surface-400">
  <svg class="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
</div>