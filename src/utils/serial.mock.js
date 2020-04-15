const { SERIAL_DATA } = require('../constants');
const EventEmitter = require('events');

const serial = new EventEmitter();
let interval = setInterval(sendData, 1000);

function sendData() {
  serial.emit('data', randomData());
}

function randomData() {
  return Array(SERIAL_DATA.length).fill(0);
}

serial.sendCommand = function sendCommand(cmd) {
  console.info('Sending command to serial:', Buffer.from([38, cmd, 38 + cmd]));
};

serial.close = () => clearInterval(interval);

module.exports = serial;
