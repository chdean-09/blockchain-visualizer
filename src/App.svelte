<script lang="ts">
  import { Blockchain } from "./lib/blockchain.svelte";
  import BlockCard from "./lib/BlockCard.svelte";
  import { Unlink, Link2 } from "@lucide/svelte";

  let blockchain = new Blockchain();
  let chain = $derived(blockchain.chain);
  let difficulty = $state(2);
  let isAutoMining = $state(false);
  let autoMineProgress = $state("");
  let isMobile = $state(false);
  let layout: "vertical" | "horizontal" = $state("horizontal");

  $effect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    isMobile = mq.matches;
    if (mq.matches) layout = 'vertical';

    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
      if (e.matches) layout = 'vertical';
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  let isChainValid = $derived(blockchain.isChainValid(difficulty));

  function handleAddBlock() {
    const data = `Transaction #${chain.length}: Alice -> Bob $${Math.floor(Math.random() * 100)}`;
    blockchain.addBlock(data);
  }

  $effect(() => {
    blockchain.difficulty = difficulty;
  });

  function handleUpdate(changedIndex: number) {
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
      const prevHash = i > 0 ? chain[i - 1].hash : "0";
      block.previousHash = prevHash;
      block.nonce = 0;
      block.mineTime = null;
      block.hash = block.calculateHash();
      autoMineProgress = `Mining block ${i + 1} of ${chain.length}...`;

      block.isMining = true;
      const start = performance.now();
      await block.mineBlock(difficulty);
      block.mineTime = Math.round(performance.now() - start);
      block.isMining = false;
    }
    autoMineProgress = "";
    isAutoMining = false;
  }
</script>

<div class="min-h-screen bg-surface-900">
  <header class="bg-surface-800/90 border-b border-surface-700 shadow-xl">
    <div class="container mx-auto px-4 py-4 md:py-5">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h1
              class="text-2xl md:text-4xl font-extrabold bg-linear-to-br from-primary-400 to-secondary-400 bg-clip-text text-transparent"
            >
              Blockchain Visualizer
            </h1>
            <p class="text-xs md:text-sm text-surface-400 mt-1">
              {chain.length} block{chain.length !== 1 ? "s" : ""} &middot; Difficulty
              {difficulty}
            </p>
          </div>

          <div
            class="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold {isChainValid
              ? 'bg-success-500/15 text-success-400'
              : 'bg-error-500/15 text-error-400'}"
          >
            <span class="text-lg">
              {#if isChainValid}
                <Link2 />
              {:else}
                <Unlink />
              {/if}
            </span>
            {isChainValid ? "Chain is Valid" : "Chain is Broken"}
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 md:gap-3">
          <label class="flex items-center gap-2">
            <span class="text-xs md:text-sm text-surface-300 font-medium"
              >Difficulty</span
            >
            <select class="select w-16 text-sm" bind:value={difficulty}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </label>
          <div class="flex-1"></div>
          <button
            class="hidden md:flex btn btn-sm md:btn-md preset-tonal-surface"
            onclick={() =>
              (layout = layout === "vertical" ? "horizontal" : "vertical")}
            title="Toggle layout"
          >
            {#if layout === "vertical"}
              <svg
                class="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                /></svg
              >
              <span class="hidden sm:inline text-sm">Horizontal Layout</span>
            {:else}
              <svg
                class="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                /></svg
              >
              <span class="hidden sm:inline text-sm">Vertical Layout</span>
            {/if}
          </button>
          <!-- Desktop inline buttons (horizontal mode only) -->
          {#if layout === "horizontal"}
            <button
              class="hidden md:flex btn btn-sm md:btn-base preset-outlined-primary-500"
              onclick={handleAddBlock}
            >
              + Add Block
            </button>
            <button
              type="button"
              class="hidden md:flex btn btn-sm md:btn-base preset-filled-primary-500"
              onclick={handleAutoMineAll}
              disabled={isAutoMining || chain.length < 2}
            >
              Mine All
            </button>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main class="container mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
    <div
      class="md:hidden flex items-center gap-3 p-4 rounded-xl {isChainValid
        ? 'bg-success-500/10 border border-success-500/30'
        : 'bg-error-500/10 border border-error-500/30'}"
    >
      <span class="text-2xl">
        {#if isChainValid}
          <Link2 />
        {:else}
          <Unlink />
        {/if}
      </span>
      <div>
        <p
          class="font-bold text-sm {isChainValid
            ? 'text-success-400'
            : 'text-error-400'}"
        >
          {isChainValid ? "Chain is Valid" : "Chain is Broken"}
        </p>
      </div>
    </div>

    {#if isAutoMining}
      <div
        class="text-center text-primary-400 font-mono animate-pulse text-base md:text-lg p-4 bg-primary-500/10 rounded-xl border border-primary-500/20"
      >
        ⛏️ {autoMineProgress}
      </div>
    {/if}

    {#if layout === "vertical"}
      <div class="flex flex-col items-center gap-0 w-full">
        {#each chain as block, i (block.index)}
          <BlockCard
            {block}
            prevBlock={i > 0 ? chain[i - 1] : null}
            {difficulty}
            onUpdate={() => handleUpdate(i)}
            chainCount={chain.length}
            {layout}
          />
        {/each}
      </div>
    {:else}
      <div class="horizontal-scroll-container overflow-x-auto pb-4">
        <div class="flex items-start gap-0 w-max px-4">
          {#each chain as block, i (block.index)}
            <BlockCard
              {block}
              prevBlock={i > 0 ? chain[i - 1] : null}
              {difficulty}
              onUpdate={() => handleUpdate(i)}
              chainCount={chain.length}
              {layout}
            />
          {/each}
        </div>
      </div>
    {/if}
  </main>

  {#if layout === "vertical"}
    <div class="fixed bottom-6 right-4 z-20 flex flex-col gap-3 items-end">
      <button
        type="button"
        class="btn btn-base md:btn-lg preset-filled-primary-500 shadow-lg rounded-full px-4"
        onclick={handleAutoMineAll}
        disabled={isAutoMining || chain.length < 2}
      >
        Mine All
      </button>
      <button
        class="btn btn-base md:btn-lg  preset-outlined-primary-500 shadow-lg rounded-full px-4 bg-surface-800"
        onclick={handleAddBlock}
      >
        + Add Block
      </button>
    </div>
  {/if}
</div>
