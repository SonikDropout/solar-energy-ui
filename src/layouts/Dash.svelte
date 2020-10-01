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
  import UpdateModal from './organisms/UpdateModal';
  let updateAvailable = ipcRenderer.sendSync('checkUpdate');

  ipcRenderer.on('updateAvailable', () => (updateAvailable = true));

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart([], { x: 'I, A', y: 'U, В' })
    );
    chart.options.onClick = chart.resetZoom;
  });

  const chartOptions = [
    {
      label: 'I(U)',
      value: 'IVC',
      yLabel: 'U, B',
      yName: 'voltage',
    },
    {
      label: 'I(P)',
      value: 'IWC',
      yLabel: 'P, Bт',
      yName: 'power',
    },
  ];

  let rows = [],
    saveDisabled = true,
    isActive,
    chart,
    IVCBtn,
    chartOption = chartOptions[0],
    unsubscribeData,
    timeStart = 0;

  function changeAxes(e) {
    if (chartOption.value !== e.target.value) {
      chartOption = chartOptions.find(
        option => option.value === e.target.value
      );
      redrawChart();
    }
  }

  function redrawChart() {
    chart.options.scales.yAxes[0].scaleLabel.labelString = chartOption.yLabel;
    chart.data.datasets[0].data = rows
      .map(getPointFromRow)
      .sort((p1, p2) => p1.x - p2.x);
    chart.update();
  }

  function monitorData() {
    unsubscribeData = serialData.subscribe(data => {
      if (data.isGettingCharacteristic) {
        if (!isActive) startDrawing();
        addPoint(data);
      } else if (isActive) {
        isActive = false;
        unsubscribeData();
      }
    });
  }

  function startDrawing() {
    isActive = true;
    clearChart();
    startLogging();
  }

  function getIVC(e) {
    ipcRenderer.send('serialCommand', COMMANDS.getIVC);
    monitorData();
  }

  function startLogging() {
    const headers = ['t, s', 'U, V', 'I, A', 'P, W'];
    saveDisabled = false;
    ipcRenderer.send('startLog', headers);
  }

  function clearChart() {
    timeStart = 0;
    rows = [];
    chart.data.datasets[0].data = [];
  }

  function addPoint(iv) {
    const row = {
      seconds: timeStart++,
      voltage: iv.voltage,
      current: iv.current,
      power: iv.voltage * iv.current,
    };
    rows.push(row);
    addToChart(row);
    sendToLogger(row);
  }

  function addToChart(row) {
    chart.data.datasets[0].data.push(getPointFromRow(row));
    chart.data.datasets[0].data.sort((p1, p2) => p1.x - p2.x);
    chart.update();
  }

  function sendToLogger(row) {
    ipcRenderer.send('logRow', formatLogRow(row));
  }

  function getPointFromRow(row) {
    return { x: row.current, y: row[chartOption.yName] };
  }

  function formatLogRow(row) {
    return Object.values(row).map((v, i) => (i > 0 ? v.toFixed(3) : v));
  }
</script>

<div class="layout">

  {#if updateAvailable}
    <UpdateModal />
  {/if}
  <Version />
  
  <header>
    Изучение технических характеристик солнечных панелей различного типа
  </header>
  <main>

    <div class="short-label">Тип графика:</div>
    <RadioGroup
      name="chartAxes"
      options={chartOptions}
      onChange={changeAxes}
      value={chartOption.value} />
    <div class="short-label">U, В</div>
    <div class="value">{$serialData.voltage.toFixed(3)}</div>
    <div class="short-label">I, A</div>
    <div class="value">{$serialData.current.toFixed(3)}</div>
    <div class="short-label">P, Вт</div>
    <div class="value">
      {($serialData.current * $serialData.voltage).toFixed(3)}
    </div>
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
    <Button on:click={getIVC} disabled={isActive}>Снять характеристики</Button>
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
    font-size: 1.8rem;
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
