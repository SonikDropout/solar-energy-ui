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

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(points, { x: 'I, A', y: 'U, В' })
    );
    chart.options.onClick = chart.resetZoom;
  });

  const typeOptions = [
    { name: 'polycrystalline', label: 'монокристаллическая', value: 0 },
    { name: 'monocrystalline', label: 'поликристаллическая', value: 1 },
    { name: 'amorphous', label: 'аморфная', value: 2 },
  ];

  const distanceOptions = [
    { label: '300', value: 0 },
    { label: '450', value: 1 },
    { label: '600', value: 2 },
  ];

  let points = [],
    saveDisabled = true,
    isDrawing,
    unsubscribeData,
    selectedDistance = distanceOptions[0],
    selectedType = typeOptions[0],
    chart,
    timeStart = 0;

  function setDistance(e) {
    selectedDistance = distanceOptions[e.target.value];
  }
  function setType(i) {
    selectedType = typeOptions[i];
  }
  function switchLoadMode(e) {
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[e.target.checked ? 'turnOnExternalLoad' : 'turnOffExternalLoad']
    );
  }

  function toggleDrawing() {
    if (isDrawing) {
      unsubscribeData();
      stopDrawing();
    } else {
      startLogging();
      subscribeData();
    }
    isDrawing = !isDrawing;
  }

  function startLogging() {
    const fileName = `Solar-${selectedType.name}`;
    const headers = [];
    saveDisabled = false;
    ipcRenderer.send('startFileWrite', 'Solar', headers);
  }

  function stopDrawing() {
    isDrawing = false;
    timeStart = 0;
    points = [];
  }

  function subscribeData() {
    timeStart = Date.now();
    unsubscribeData = serialData.subscribe(addPoint);
  }

  function addPoint(iv) {
    points.push([timeStart++, iv.voltage, iv.current]);
    updateChart();
  }

  function updateChart() {
    chart.data.datasets[0].data = points
      .map(row => ({
        x: row[xAxis.value],
        y: row[yAxis.value],
      }))
      .sort((p1, p2) => p1.x - p2.x);
    chart.update();
  }

  function sendToLogger(row) {
    ipcRenderer.send('excelRow', row);
  }
</script>

<div class="layout">
  <header>
    Изучение технических характеристик солнечных панелей различного типа
  </header>
  <main>
    <div class="label">Тип солнечной панели</div>
    <Select
      options={typeOptions}
      defaultValue={selectedType.value}
      style="grid-column: 1 / 5"
      onChange={setType} />
    <div class="label">Расстояние до источника света, мм</div>
    <RadioGroup
    value={selectedDistance.value}
      style="grid-column: 1 / 5"
      options={distanceOptions}
      name="distance"
      onChange={setDistance} />
    <div class="short-label">U, В</div>
    <div class="value">{$serialData.voltage}</div>
    <div class="short-label">I, A</div>
    <div class="value">{$serialData.current}</div>
    <div class="short-label">P, Вт</div>
    <div class="value">{$serialData.current * $serialData.voltage}</div>
    <div class="short-label">
      I
      <sub>нагр.</sub>
      , А
    </div>
    <div class="value">{$serialData.loadCurrent}</div>
    <Toggle
      name="external"
      style="grid-area: 8 / 3 / 9 / 6"
      on:change={switchLoadMode}>
      Внеш нагр
    </Toggle>
    <div class="chart">
      <canvas id="chart" height="400" width="520" />
    </div>
  </main>
  <footer>
    <Button on:click={toggleDrawing}>{isDrawing ? 'Стоп' : 'Старт'}</Button>
    <SaveButton disabled={saveDisabled} />
  </footer>
</div>

<style>
  main {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(8, 1fr);
    grid-column-gap: 24px;
    grid-row-gap: 8px;
    align-items: center;
    padding: 0 24px;
  }
  .chart {
    grid-area: 1 / 6 / 11 / 13;
  }
  footer {
    justify-content: space-between;
    padding: 0 24px;
  }
  .label {
    grid-column: 1 / 5;
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
