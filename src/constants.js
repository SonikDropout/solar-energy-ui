const IS_RPI = process.platform === 'linux' && process.arch == 'arm';
const PORT = {
  name: IS_RPI ? '/dev/serail0' : 'COM5',
  baudRate: 230400,
};

const SEPARATORS = Buffer.alloc(4);
SEPARATORS.writeUInt16BE(1573);
SEPARATORS.writeUInt16BE(2605, 2);

const SERIAL_DATA = ['voltage', 'current', 'loadCurrent'];

const DATA_BYTE_LENGTH = SERIAL_DATA.length * 2 + SEPARATORS.length;

const COMMANDS = {
  getIVC: [4, 0],
};

module.exports = {
  IS_RPI,
  PORT,
  SEPARATORS,
  COMMANDS,
  SERIAL_DATA,
  DATA_BYTE_LENGTH,
};
