<script lang="ts">
  import { onMount } from 'svelte';
  import { Blockchain, Block } from './lib/blockchain'; // Your TS logic
  import BlockCard from './lib/BlockCard.svelte';
  
  // 1. Initialize Blockchain
  let blockchain = new Blockchain();
  // Svelte requires reassignment to trigger reactivity for deep objects
  let chain = blockchain.chain; 
  let difficulty = 2;
  
  // Reactive check for global validity
  // We check this every time 'chain' updates
  $: isChainValid = blockchain.isChainValid();

  function handleAddBlock() {
    // Add dummy data for quick testing
    const data = `Transaction #${chain.length}: Alice -> Bob $${Math.floor(Math.random() * 100)}`;
    blockchain.addBlock(data);
    refresh();
  }

  function handleUpdate() {
    // This is called by children when they are edited/mined
    refresh();
  }

  function handleDifficultyChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    difficulty = parseInt(target.value);
    blockchain.difficulty = difficulty;
  }

  // Helper to force Svelte update
  function refresh() {
    chain = blockchain.chain;
  }
</script>

<div class="container mx-auto p-4 min-h-screen flex flex-col gap-8 pb-20">
  
  <header class="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-800 p-6 rounded-xl shadow-2xl">
    <div>
      <h1 class="h1 font-bold bg-gradient-to-br from-primary-500 to-secondary-500 box-decoration-clone bg-clip-text text-transparent">
        Blockchain Visualizer
      </h1>
      <p class="text-surface-400">Week 2 Assignment</p>
    </div>

    <div class="flex items-center gap-4">
      <label class="label">
        <span>Difficulty</span>
        <select class="select w-20" bind:value={difficulty} on:change={handleDifficultyChange}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </label>

      <button class="btn variant-filled-secondary font-bold" on:click={handleAddBlock}>
        + Add Block
      </button>
    </div>
  </header>

  <div class="alert variant-filled-{isChainValid ? 'success' : 'error'} shadow-lg transition-colors duration-300">
    <div class="flex items-center gap-4">
      <div class="text-4xl">
        {isChainValid ? '✅' : '🚨'}
      </div>
      <div>
        <h3 class="h3 font-bold">
          {isChainValid ? 'Blockchain is Valid' : 'Blockchain is Broken!'}
        </h3>
        <p>
          {isChainValid 
            ? 'All hashes match and links are secure.' 
            : 'Tampering detected! Hashes do not match data.'}
        </p>
      </div>
    </div>
  </div>

  <div class="flex flex-col items-center gap-0 w-full">
    {#each chain as block, i (block.index)}
      <BlockCard 
        {block} 
        prevBlock={i > 0 ? chain[i-1] : null}
        {difficulty}
        onUpdate={handleUpdate}
      />
    {/each}
  </div>

</div>