<script>
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import { fly } from 'svelte/transition';
  export let disabled;

  let isSaving, isSaveFailed, saveMessage, usbConnected;

  ipcRenderer.send('usbStorageRequest');
  ipcRenderer.on('usbConnected', () => (usbConnected = true));
  ipcRenderer.on('usbDisconnected', () => (usbConnected = false));

  function handleSaved(e, err) {
    if (err) {
      saveMessage = 'Не удалось сохранить файл';
      isSaveFailed = true;
    } else {
      saveMessage = 'Файл успешно сохранен';
    }
    disabled = false;
    isSaving = false;
  }

  function handleClick() {
    disabled = true;
    isSaving = true;
    ipcRenderer.send('saveFile');
    ipcRenderer.once('fileSaved', handleSaved);
  }

  function closePopup() {
    saveMessage = void 0;
    isSaveFailed = false;
  }
  function ejectUSB() {
    ipcRenderer.send('ejectUSB');
  }
  ipcRenderer.on('usbDisconnected', closePopup);
</script>

<Button on:click={handleClick} disabled={disabled || !usbConnected}>
  {#if isSaving}
    <span class="spinner" />
  {/if}
  Сохранить данные на usb-устройство
</Button>
{#if saveMessage}
  <div class="popup" transition:fly={{ y: -200 }}>
    <span class="popup-close">&#x2573;</span>
    <p class:error={isSaveFailed}>{saveMessage}</p>
    <Button on:click={ejectUSB} size="sm">извлечь</Button>
  </div>
{/if}

<style>
  .spinner {
    display: inline-block;
    width: 1.6rem;
    height: 1.6rem;
    border: 2px solid var(--bg-color);
    border-radius: 50%;
    clip-path: polygon(0 0, 50% 0, 50% 50%, 100% 50%, 100% 100%, 0 100%);
    animation: spin 1s linear infinite;
  }
  .popup {
    position: fixed;
    top: 3px;
    left: calc(50% - 15rem);
    width: 30rem;
    padding: 0 2rem 1rem;
    border-radius: 4px;
    box-shadow: 0 0 6px -1px var(--text-color);
    background-color: var(--bg-color);
    line-height: 1.5;
    z-index: 9999;
  }
  .popup-close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    font-size: 1rem;
    color: var(--coporate-grey-darken);
    cursor: pointer;
  }
  p.error {
    color: var(--danger-color);
  }
</style>
