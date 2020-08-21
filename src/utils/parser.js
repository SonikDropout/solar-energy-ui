const {
  SEPARATORS,
  SERIAL_DATA,
  DATA_BYTE_LENGTH,
} = require('../constants');

function validate(buffer) {
  if (buffer.indexOf(SEPARATORS) != 0)
    throw new Error('Invalid buffer recieved');
}

module.exports = function parse(buf) {
  validate(buf);
  const result = [];
  let i = SEPARATORS.length;
  for (let j = 0; j < SERIAL_DATA.length - 1; j++) {
    result.push(+(buf.readInt16BE(i) / 1000).toPrecision(4));
    i += 2;
  }
  result.push(buf[i]);
  return result;
};
