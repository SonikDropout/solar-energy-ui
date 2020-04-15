const { writable } = require('svelte/store');
const { mergeKeysValues } = require('./utils/others');
const { SERIAL_DATA } = require('./constants');
const { ipcRenderer } = require('electron');

const initialData = ipcRenderer.sendSync('initialDataRequest');

const serialData = writable(transformSerialData(initialData));
const connectionType = writable(0);

ipcRenderer.on('serialData', (e, data) => {
  serialData.set(transformSerialData(data));
});

function transformSerialData(arr) {
  return mergeKeysValues(SERIAL_DATA, arr);
  hashMap.power = hashMap.current * hashMap.voltage;
  return hashMap;
}

module.exports = {
  serialData,
  connectionType,
};
