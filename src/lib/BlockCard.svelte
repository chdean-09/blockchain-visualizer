<script lang="ts">
  import type { Block } from "./blockchain.svelte";

  interface Props {
    block: Block;
    prevBlock: Block | null;
    difficulty: number;
    onUpdate: () => void;
    chainCount: number;
    layout: "vertical" | "horizontal";
  }

  let {
    block,
    prevBlock = null,
    difficulty,
    onUpdate,
    chainCount,
    layout,
  }: Props = $props();

  let displayNonce = $state(block.nonce);

  let isValid = $derived(
    block.hash.substring(0, difficulty) === Array(difficulty + 1).join("0"),
  );

  let borderClass = $derived(
    block.isMining ? "border-yellow-500" :isValid ? "border-success-700" : "border-error-700",
  );

  async function handleMine() {
    block.isMining = true;
    block.mineTime = null;
    block.nonce = 0;
    displayNonce = 0;
    block.hash = block.calculateHash();

    const start = performance.now();
    await block.mineBlock(difficulty, () => {
      displayNonce = block.nonce;
    });
    block.mineTime = Math.round(performance.now() - start);

    displayNonce = block.nonce;
    block.isMining = false;
    onUpdate();
  }

  function handleInput() {
    block.nonce = 0;
    displayNonce = 0;
    block.mineTime = null;
    block.hash = block.calculateHash();
    onUpdate();
  }

  $effect(() => {
    if (!block.isMining) {
      displayNonce = block.nonce;
    }
  });
</script>

<div
  class="flex {layout === 'horizontal'
    ? 'flex-row items-start'
    : 'flex-col items-center'}"
>
  <div
    class="card {layout === 'horizontal'
      ? 'w-72 md:w-80'
      : 'w-full max-w-sm md:max-w-md'} preset-filled-surface-100-900 p-3 md:p-5 text-left border-2 transition-all duration-300 shrink-0 {borderClass}"
  >
    <header class="flex justify-between items-center mb-3">
      <div class="flex items-center gap-2">
        {#if block.index === 0}
          <span
            class="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg preset-filled-tertiary-50-950 text-xs md:text-sm font-bold"
          >
            GB
          </span>
        {:else}
          <span
            class="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-surface-700 text-xs md:text-sm font-bold text-primary-400"
          >
            #{block.index + 1}
          </span>
        {/if}
        <div>
          <h3 class="text-sm md:text-base font-bold leading-tight">
            {#if block.index === 0}
              Genesis Block
            {:else}
              Block {block.index + 1}
            {/if}
          </h3>
          <span class="text-[10px] md:text-xs opacity-50 font-mono">
            {new Date(block.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
      {#if !isValid}
        <span class="badge text-xs preset-filled-error-500 px-2 py-1"
          >INVALID</span
        >
      {/if}
    </header>

    <div class="space-y-3">
      <label class="label">
        <span
          class="text-xs md:text-sm font-semibold text-surface-300 uppercase tracking-wide"
          >Data</span
        >
        <input
          class="input font-mono text-sm"
          type="text"
          bind:value={block.data}
          oninput={handleInput}
          placeholder="Transaction Data"
        />
      </label>

      <div class="p-3 bg-surface-800/80 rounded-lg space-y-3">
        {#if block.index !== 0}
          <div>
            <span
              class="text-[10px] md:text-xs text-surface-400 uppercase tracking-wider font-semibold"
            >
              Previous Hash
            </span>
            <p
              class="text-[9px] md:text-[11px] font-mono break-all mt-1 leading-relaxed text-surface-300"
            >
              {block.previousHash}
            </p>
          </div>
        {/if}

        <div>
          <span
            class="text-[10px] md:text-xs text-surface-400 uppercase tracking-wider font-semibold"
          >
            Hash
          </span>
          <p
            class="text-[9px] md:text-[11px] font-mono break-all mt-1 leading-relaxed {isValid
              ? 'text-success-400'
              : 'text-surface-300'}"
          >
            {block.hash}
          </p>
        </div>

        <div
          class="flex justify-between items-center border-t border-surface-600/50 pt-2"
        >
          <span
            class="text-[10px] md:text-xs text-surface-400 uppercase tracking-wider font-semibold"
            >Nonce</span
          >
          <div class="flex items-center gap-2">
            {#if block.mineTime !== null}
              <span class="text-[10px] md:text-xs text-primary-400 font-mono">
                {block.mineTime < 1000 ? `${block.mineTime}ms` : `${(block.mineTime / 1000).toFixed(1)}s`}
              </span>
            {/if}
            <span
              class="font-mono font-bold text-sm md:text-base {block.isMining
                ? 'text-primary-400 animate-pulse'
                : 'text-surface-200'}"
            >
              {displayNonce.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>

    <footer class="mt-3">
      <button
        class="btn btn-sm md:btn-md preset-tonal-secondary w-full"
        onclick={handleMine}
        disabled={block.isMining}
      >
        {#if block.isMining}
          <span class="font-mono text-sm">⛏️ Mining...</span>
        {:else}
          <span class="font-mono text-sm">⛏️ Mine Block</span>
        {/if}
      </button>
    </footer>
  </div>

  {#if block.index + 1 < chainCount}
    {#if layout === "horizontal"}
      <!-- Horizontal arrow -->
      <div class="flex items-center px-1 md:px-2 text-surface-500 self-center">
        <svg
          class="w-5 h-5 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </div>
    {:else}
      <!-- Vertical arrow -->
      <div class="flex justify-center my-1.5 md:my-2 text-surface-500">
        <svg
          class="w-5 h-5 md:w-6 md:h-6"
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
  {/if}
</div>
