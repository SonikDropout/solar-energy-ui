<script>
  export let options;
  export let name;
  export let onChange;
  export let style;
  export let value;
</script>

<div class="radio-group" {style}>
  {#each options as element}
    <label>
      <input
        class="hidden"
        type="radio"
        checked={element.value === value}
        {name}
        on:change={onChange}
        value={element.value}
        disabled={element.disabled} />
      <span>
        {@html element.label}
      </span>
    </label>
  {/each}
</div>

<style>
  .radio-group {
    display: flex;
  }

  span {
    display: block;
    padding: 1rem 2rem;
    color: var(--bg-color);
    font-weight: 500;
    background-color: var(--corporate-blue);
    opacity: 0.6;
  }
  label:first-child span {
    border-radius: 4px 0 0 4px;
  }
  label:last-child span {
    border-radius: 0 4px 4px 0;
  }
  input:checked + span {
    transform: scale(1.1);
    opacity: 1;
    border-radius: 4px;
  }
</style>
