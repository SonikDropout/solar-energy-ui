const { SERIAL_DATA } = require('../constants');
const EventEmitter = require('events');

const serial = new EventEmitter();
let interval = setInterval(sendData, 1000);
let serialData = Array(SERIAL_DATA.length).fill(0);
let timeStart = Date.now();

function sendData() {
  randomizeData();
  serial.emit('data', serialData);
}

function randomizeData() {
  serialData[0] = Math.random() * 10;
  elapsed = ((Date.now() - timeStart) / 1000);
  if (elapsed > 5 && elapsed < 10) {
    serialData[2] = Math.random() * 10;
  } else if (elapsed > 10) {
    serialData[2] = 0;
    timeStart = Date.now();
  }
}

function randomData() {
  return Array(SERIAL_DATA.length).fill(0);
}

serial.sendCommand = function sendCommand([byte1, byte2]) {
  console.info(
    'Sending command to serial:',
    Buffer.from([33, byte1, byte2, 33 + byte1 + byte2])
  );
};

serial.close = () => clearInterval(interval);

module.exports = serial;
