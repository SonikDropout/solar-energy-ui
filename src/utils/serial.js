const Serial = require('serialport');
const { PORT, SEPARATORS } = require('../constants');
const EventEmitter = require('events');
const parse = require('./parser');

const serial = new Serial(PORT.name, { baudRate: PORT.baudRate });
const emitter = new EventEmitter();

serial.on('data', handleData);

let buffer = Buffer.from([]);

function handleData(buf) {
  idx = buf.indexOf(SEPARATORS);
  if (idx != -1) {
    buffer = Buffer.concat([buffer, buf.slice(0, idx)]);
    if (buffer.toString().endsWith('ok'))
      buffer = buffer.slice(0, buffer.length - 2);
    try {
      emitter.emit('data', parse(buffer));
    } catch (e) {
      // console.error('There is a hole in your logic:', e);
    }
    buffer = buf.slice(idx);
  } else {
    buffer = Buffer.concat([buffer, buf]);
  }
}

function sendCommand([byte1, byte2]) {
  serial.write(Buffer.from([33, byte1, byte2, 33 + byte1 + byte2]));
}

emitter.sendCommand = sendCommand;

emitter.close = function close() {
  emitter.removeAllListeners();
  if (serial.isOpen) serial.close();
};

module.exports = emitter;
