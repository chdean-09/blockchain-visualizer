<script lang="ts">
  import type { Block } from "./blockchain.svelte";

  interface Props {
    block: Block;
    prevBlock: Block | null;
    difficulty: number;
    onUpdate: () => void;
    chainCount: number;
  }

  let {
    block,
    prevBlock = null,
    difficulty,
    onUpdate,
    chainCount,
  }: Props = $props();

  let isMining = $state(false);
  let displayNonce = $state(block.nonce);

  let isLinkValid = $derived(
    prevBlock ? block.previousHash === prevBlock.hash : true,
  );

  let isIntegrityValid = $derived(block.hash === block.calculateHash());

  let isValid = $derived(isLinkValid && isIntegrityValid);

  let isDifficultyValid = $derived(
    block.hash.substring(0, difficulty) === Array(difficulty + 1).join("0"),
  );

  // Border logic:
  // - Red if block is invalid (tampered or broken link)
  // - Green if valid AND meets difficulty
  // - No colored border otherwise if genesis block
  let borderClass = $derived(
    block.index !== 0
      ? isDifficultyValid
        ? "border-success-700"
        : "border-error-700"
      : "",
  );

  async function handleMine() {
    isMining = true;
    block.nonce = 0;
    displayNonce = 0;
    block.hash = block.calculateHash();

    await block.mineBlock(difficulty, () => {
      displayNonce = block.nonce;
    });

    displayNonce = block.nonce;
    isMining = false;
    onUpdate();
  }

  function handleInput() {
    block.nonce = 0;
    displayNonce = 0;
    block.hash = block.calculateHash();
    onUpdate();
  }

  $effect(() => {
    if (!isMining) {
      displayNonce = block.nonce;
    }
  });
</script>

<div
  class="card w-full max-w-md preset-filled-surface-100-900 p-4 text-center border-2 {borderClass}"
>
  <header class="flex justify-between items-center mb-4">
    <div class="flex items-center gap-2">
      <h3 class="h3 font-bold">Block {block.index + 1}</h3>
      {#if !isDifficultyValid && block.index !== 0}
        <span class="badge text-error-400">INVALID</span>
      {/if}
    </div>
    <div class="text-xs opacity-50 font-mono">
      {new Date(block.timestamp).toLocaleTimeString()}
    </div>
  </header>

  <div class="space-y-4">
    <label class="label">
      <span class="font-mono text-lg">Data</span>
      <input
        class="input font-mono"
        type="text"
        bind:value={block.data}
        oninput={handleInput}
        placeholder="Transaction Data"
      />
    </label>

    <div
      class="p-3 bg-surface-800 rounded text-[10px] md:text-xs font-mono space-y-2"
    >
      {#if block.index !== 0}
        <div class="group">
          <span class="text-surface-200 block uppercase tracking-wider mb-2">
            Previous Hash
          </span>
          <span class="break-all">
            {block.previousHash}
          </span>
        </div>
      {/if}

      <div class="group">
        <span class="text-surface-200 block uppercase tracking-wider mb-2">
          Hash
        </span>
        <span class="break-all {isDifficultyValid ? 'text-success-400' : ''}">
          {block.hash}
        </span>
      </div>

      <div
        class="flex justify-between items-center border-t border-surface-600 pt-2 mt-2"
      >
        <span class="text-surface-200 uppercase">Nonce</span>
        <span
          class="font-bold text-lg {isMining
            ? 'text-primary-400 animate-pulse'
            : ''}"
        >
          {displayNonce.toLocaleString()}
        </span>
      </div>
    </div>
  </div>

  <footer class="mt-4 flex justify-end">
    <button
      class="btn preset-tonal-secondary w-full"
      onclick={handleMine}
      disabled={isMining}
    >
      {#if isMining}
        <span class="font-mono">⛏️ Mining...</span>
      {:else}
        <span class="font-mono">Mine Block</span>
      {/if}
    </button>
  </footer>
</div>

{#if block.index + 1 < chainCount}
  <div class="flex justify-center my-2 text-surface-400">
    <svg
      class="w-8 h-8 animate-bounce"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  </div>
{/if}
