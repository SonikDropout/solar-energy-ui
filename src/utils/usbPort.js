const usbDetect = require('usb-detection');
const EventEmitter = require('events');
const { debounce } = require('./others');
const { exec } = require('child_process');

const usbPort = new EventEmitter();
const winFindCmd = 'wmic logicaldisk where drivetype=2 get Name';
const linuxFindCmd = 'lsblk --json -o name,path,rm --tree';
let connectedDevice;

const debouncedFindDrive = debounce(findDrive, 2000);

usbDetect.startMonitoring();
usbDetect.on('add', debouncedFindDrive);
usbDetect.on('remove', handleRemove);

function findDrive() {
  if (process.platform === 'win32') winFindDrive();
  else linuxFindDrive();
}

function winFindDrive() {
  exec(winFindCmd, (err, output) => {
    if (err) {
      console.error(err);
      return;
    }
    connectedDevice = output.split('\r\n')[1].slice(0, 2);
    usbPort.emit('add', connectedDevice);
  });
}

function linuxFindDrive() {
  exec(linuxFindCmd, (err, output) => {
    if (err) {
      console.error(err);
      return;
    }
    linuxFindSuitableDevice(JSON.parse(output).blockdevices);
  });
}

function linuxFindSuitableDevice(drives) {
  const device = drives.find((dev) => dev.rm);
  if (!device) return;
  if (device.children) {
    connectedDevice = device.children[0].path;
    mountLinuxDevice(connectedDevice);
  } else {
    connectedDevice = device.path;
    mountLinuxDevice(connectedDevice);
  }
}

function mountLinuxDevice(device) {
  exec(`sudo mount ${device} /media/usb1 -o uid=1000`, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    usbPort.emit('add', '/media/usb1');
  });
}

function handleRemove() {
  exec(
    process.platform === 'linux' ? linuxFindCmd : winFindCmd,
    (err, output) => {
      if (err) {
        console.error(err);
        usbPort.emit('remove');
        return;
      }
      if (!output.includes(connectedDevice)) usbPort.emit('remove');
    }
  );
}

usbPort.init = findDrive;

usbPort.eject = function eject() {
  exec(`sudo umount ${connectedDevice}`, (err) => {
    if (err) console.error(err);
    connectedDevice = void 0;
    usbPort.emit('remove');
  });
};

module.exports = usbPort;
