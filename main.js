const path = require('path');
const url = require('url');
const electron = require('electron');
const logger = require('./src/utils/logger');
const usbPort = require('./src/utils/usbPort');
const { IS_RPI: isPi, SERIAL_DATA } = require('./src/constants');
const { app, BrowserWindow, ipcMain } = electron;

let win,
  usbPath,
  initialData = Array(SERIAL_DATA.length).fill(0);

const mode = process.env.NODE_ENV;

function reloadOnChange(win) {
  if (mode !== 'development') return { close: () => {} };

  const watcher = require('chokidar').watch(
    path.join(__dirname, 'dist', '**'),
    {
      ignoreInitial: true,
    }
  );

  watcher.on('change', () => {
    win.reload();
  });

  return watcher;
}

function initPeripherals(win) {
  const serial = require(`./src/utils/serial${isPi ? '' : '.mock'}`);
  usbPort
    .on('add', (path) => {
      usbPath = path;
      win.webContents.send('usbConnected');
    })
    .on('remove', () => {
      usbPath = void 0;
      win.webContents.send('usbDisconnected');
    });
  serial
    .on('data', (d) => win.webContents.send('serialData', d))
    .once('data', (d) => (initialData = d));
  ipcMain.on('startFileWrite', (_, ...args) => logger.createFile(...args));
  ipcMain.on('excelRow', (_, ...args) => logger.writeRow(...args));
  ipcMain.on('serialCommand', (_, ...args) => serial.sendCommand(...args));
  ipcMain.on('saveFile', () => {
    logger.saveFile(usbPath, (...args) =>
      win.webContents.send('fileSaved', ...args)
    );
  });
  ipcMain.on('usbStorageRequest', usbPort.init);
  ipcMain.on('initialDataRequest', (e) => (e.returnValue = initialData));
  ipcMain.on('EjectUSB', usbPort.eject);
  return {
    removeAllListeners() {
      usbPort.removeAllListeners();
      serial.close();
    },
  };
}

function launch() {
  const screenArea = electron.screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: isPi ? screenArea.width : 1024,
    height: isPi ? screenArea.height : 600,
    fullscreen: isPi,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'app', 'index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  const watcher = reloadOnChange(win);
  const peripherals = initPeripherals(win);

  win.on('closed', function () {
    peripherals.removeAllListeners();
    win = null;
    watcher.close();
  });
}

app.on('ready', launch);
