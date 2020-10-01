<script>
  import { ipcRenderer } from 'electron';
  let highLevel;
  ipcRenderer.on('calibrationFinish', (e, v) => (highLevel = v));
</script>

<div class="modal">
  <div class="modal-body">
    <h3>{__('sensor calibration')}</h3>
    {#if highLevel !== void 0}
      <strong>{highLevel}</strong>
    {/if}
  </div>
</div>

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 9004;
  }
  .modal-body {
    margin: auto;
    width: 50vw;
    height: 50vh;
    background-color: var(--bg-color);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  h3 {
    max-width: 80%;
  }
</style>
