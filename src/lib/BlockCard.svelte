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

  // Link valid: previous hash matches the actual hash of the previous block
  let isLinkValid = $derived(
    prevBlock ? block.previousHash === prevBlock.hash : true,
  );
  // Integrity valid: stored hash matches recalculated hash (detects data tampering)
  let isIntegrityValid = $derived(block.hash === block.calculateHash());
  // Overall validity
  let isValid = $derived(isLinkValid && isIntegrityValid);
  // Was this block properly mined to meet difficulty?
  let isDifficultyValid = $derived(
    block.hash.substring(0, difficulty) === Array(difficulty + 1).join("0"),
  );

  // Border logic:
  // - Red if block is invalid (tampered or broken link)
  // - Green if valid AND meets difficulty
  // - No colored border otherwise (unmined genesis on fresh load)
  let borderClass = $derived(
    !isValid
      ? "border-error-700"
      : isDifficultyValid
        ? "border-success-700"
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
    // Recalculate hash with the new data so hash display updates,
    // but next block's previousHash still points to the OLD hash → chain breaks
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
      {#if !isValid}
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
          <span
            class="break-all"
          >
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
      class="btn variant-filled-primary w-full"
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
