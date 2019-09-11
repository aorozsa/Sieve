'use strict';

const { app, BrowserWindow, Menu } = require('electron');
const debug = require('electron-debug');
debug();
require('electron-reload')(__dirname);
require('excel4node');
const path = require('path');
let win;

function createWindow() {
  // Set icon based on platform
  if (process.platform === "win32") {
    var icon = 'build/icon.ico';
  } else {
    var icon = 'build/icon.png';
  }

  // Create the browser window.
  win = new BrowserWindow({
    webPreferences: {
            nodeIntegration: true
        },
    show: false,
    icon: path.join(__dirname, icon),
    minWidth: 1280,
    minHeight: 800
  });
  win.loadFile('index.html');
  win.maximize();
  win.once('ready-to-show', () => {
    win.show();
  })
  win.on('closed', () => {
    win = null;
  })
  //win.webContents.openDevTools()
}

// Set the application menu to null
Menu.setApplicationMenu(null);

// Create window on electron intialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOS specific close process
  if (win === null) {
    createWindow();
  }
});
