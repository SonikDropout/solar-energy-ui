const IS_RPI = process.platform === 'linux' && process.arch == 'arm';
const PORT = {
  name: IS_RPI ? '/dev/ttyS0' : 'COM5',
  baudRate: 230400,
};

const SEPARATORS = Buffer.alloc(4);
SEPARATORS.writeUInt16BE(18735);
SEPARATORS.writeUInt16BE(869, 2);

const SERIAL_DATA = ['voltage', 'current', 'loadCurrent', 'loadMode'];

const DATA_BYTE_LENGTH = SERIAL_DATA.length * 2 + SEPARATORS.length;

const COMMANDS = {
  turnOnExternalLoad: 4,
  turnOffExternalLoad: 8,
};

module.exports = {
  IS_RPI,
  PORT,
  SEPARATORS,
  COMMANDS,
  SERIAL_DATA,
  DATA_BYTE_LENGTH,
};
