<script lang="ts">
  import { Block, Blockchain } from "./lib/blockchain.svelte";
  import BlockCard from "./lib/BlockCard.svelte";

  let blockchain = new Blockchain();
  let chain = $derived(blockchain.chain);
  let difficulty = $state(2);
  let isAutoMining = $state(false);
  let autoMineProgress = $state('');

  let isChainValid = $derived(blockchain.isChainValid());

  function handleAddBlock() {
    const data = `Transaction #${chain.length}: Alice -> Bob $${Math.floor(Math.random() * 100)}`;
    blockchain.addBlock(data);
  }

  $effect(() => {
    blockchain.difficulty = difficulty;
  });

  function handleUpdate(changedIndex: number) {
    // Cascade changes: update each subsequent block's previousHash
    // to match the new hash of the block before it, then recalculate its hash.
    // This makes downstream blocks invalid (hash no longer meets difficulty).
    for (let i = changedIndex + 1; i < chain.length; i++) {
      chain[i].previousHash = chain[i - 1].hash;
      chain[i].nonce = 0;
      chain[i].hash = chain[i].calculateHash();
    }
  }

  async function handleAutoMineAll() {
    isAutoMining = true;
    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];
      const prevHash = i > 0 ? chain[i - 1].hash : '0';
      block.previousHash = prevHash;
      block.nonce = 0;
      block.hash = block.calculateHash();
      autoMineProgress = `Mining block ${i + 1} of ${chain.length}...`;

      await block.mineBlock(difficulty);
    }
    autoMineProgress = '';
    isAutoMining = false;
  }

</script>

<div class="container mx-auto p-4 min-h-screen flex flex-col gap-8 pb-20">
  <header
    class="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-800 p-6 rounded-xl shadow-2xl"
  >
    <div>
      <h1
        class="h1 font-bold bg-gradient-to-br from-primary-500 to-secondary-500 box-decoration-clone bg-clip-text text-transparent"
      >
        Blockchain Visualizer
      </h1>
      <p class="text-surface-400">Week 2 Assignment</p>
    </div>
    <div class="flex items-center gap-4">
      <label class="label">
        <span>Difficulty</span>
        <select
          class="select w-20"
          bind:value={difficulty}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </label>
      <button
        class="btn variant-filled-secondary font-bold"
        onclick={handleAddBlock}
      >
        + Add Block
      </button>
      <button
        class="btn variant-filled-tertiary font-bold"
        onclick={handleAutoMineAll}
        disabled={isAutoMining}
      >
        ⛏️ Auto-Mine All
      </button>
    </div>
  </header>

  <div
    class="alert {isChainValid ? 'variant-filled-success' : 'variant-filled-error'} shadow-lg transition-colors duration-300"
  >
    <div class="flex items-center gap-4">
      <div class="text-4xl">
        {isChainValid ? "✅" : "🚨"}
      </div>
      <div>
        <h3 class="h3 font-bold">
          {isChainValid ? "Blockchain is Valid" : "Blockchain is Broken!"}
        </h3>
        <p>
          {isChainValid
            ? "All hashes match and links are secure."
            : "Tampering detected! Hashes do not match data."}
        </p>
      </div>
    </div>
  </div>

  {#if isAutoMining}
    <div class="text-center text-primary-400 font-mono animate-pulse text-lg">
      ⛏️ {autoMineProgress}
    </div>
  {/if}

  <div class="flex flex-col items-center gap-0 w-full">
    {#each chain as block, i (block.index)}
      <BlockCard
        {block}
        prevBlock={i > 0 ? chain[i - 1] : null}
        {difficulty}
        onUpdate={() => handleUpdate(i)}
        chainCount={chain.length}
      />
    {/each}
  </div>
</div>