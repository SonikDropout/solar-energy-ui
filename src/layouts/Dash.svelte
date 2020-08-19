<script>
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import SaveButton from '../organisms/SaveButton';
  import Toggle from '../atoms/Toggle';
  import RadioGroup from '../molecules/RadioGroup';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount } from 'svelte';
  import { serialData } from '../stores';
  import { CONNECTION_TYPES, COMMANDS } from '../constants';
  import Version from '../atoms/Version';

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart([], { x: 'I, A', y: 'U, В' })
    );
    chart.options.onClick = chart.resetZoom;
  });

  let rows = [],
    saveDisabled = true,
    isDrawing,
    unsubscribeData,
    chart,
    timeStart = 0;

  function toggleDrawing() {
    if (isDrawing) {
      unsubscribeData();
    } else {
      clearChart();
      startLogging();
      subscribeData();
    }
    isDrawing = !isDrawing;
  }

  function startLogging() {
    const headers = ['t, c', 'U,B', 'I, A'];
    saveDisabled = false;
    ipcRenderer.send('startLog', headers);
  }

  function clearChart() {
    timeStart = 0;
    rows = [];
    chart.data.datasets[0].data = [];
  }

  function subscribeData() {
    ipcRenderer.send('serialCommand', COMMANDS.getIVC);
    unsubscribeData = serialData.subscribe(addPoint);
  }

  function addPoint(iv) {
    const row = [timeStart++, iv.voltage, iv.current];
    row.push(row);
    addToChart(row);
    sendToLogger(row);
  }

  function addToChart(row) {
    chart.data.datasets[0].data.push({ x: row[2], y: row[1] });
    chart.data.datasets[0].data.sort((p1, p2) => p1.x - p2.x);
    chart.update();
  }

  function sendToLogger(row) {
    ipcRenderer.send('logRow', row);
  }
</script>

<div class="layout">
  <Version />
  <header>
    Изучение технических характеристик солнечных панелей различного типа
  </header>
  <main>
    <div class="short-label">U, В</div>
    <div class="value">{$serialData.voltage.toFixed(3)}</div>
    <div class="short-label">I, A</div>
    <div class="value">{$serialData.current.toFixed(3)}</div>
    <div class="short-label">P, Вт</div>
    <div class="value">{($serialData.current * $serialData.voltage).toFixed(3)}</div>
    <div class="short-label">
      I
      <sub>нагр.</sub>
      , А
    </div>
    <div class="value">{$serialData.loadCurrent.toFixed(3)}</div>
    <div class="chart">
      <canvas id="chart" height="160" />
    </div>
  </main>
  <footer>
    <Button on:click={toggleDrawing}>{isDrawing ? 'Стоп' : 'Старт'}</Button>
    <SaveButton disabled={saveDisabled} />
  </footer>
</div>

<style>
  .layout {
    background: url('../../app/background.svg') no-repeat;
  }
  main {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(8, 1fr);
    grid-column-gap: 24px;
    grid-row-gap: 8px;
    align-items: center;
    padding: 0 24px;
    font-size: 2rem;
  }
  .chart {
    grid-area: 1 / 3 / 11 / 13;
  }
  footer {
    justify-content: space-between;
    padding: 0 24px;
  }
  .short-label {
    grid-column: 1 / 2;
    white-space: nowrap;
  }
  .value {
    grid-column: 2 / 3;
    font-family: 'Oswald';
  }
</style>
