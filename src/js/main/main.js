'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
const Menu = electron.Menu;

const path = require('path');

// Append Chromium command line switches
[
    'flag-switches-begin',
    '--js-flags="--max_old_space_size=4096"',
    'disable-threaded-scrolling',
    'javascript-harmony',
    'disable-pinch',
    'flag-switches-begin'
].forEach(app.commandLine.appendSwitch);

function getLinuxIcon() {
    if(process.mainModule.filename.indexOf('app.asar') === -1)
        return path.resolve(app.getAppPath(), 'build', 'icon48x48.png');
    else
        return path.resolve(app.getAppPath(), '..', 'icon48x48.png');
}

// Add default values to current settings file
function addDefaultSettings(settings) {
    const _ = require('lodash');
    const defaults = require("../../../defaults.json");
    settings.setAll(_.merge(defaults, settings.getAll()), {prettify: true});
}

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow(settings) {
    // Create the browser window.

    const options = {
        width: 1920 / 2,
        height: 1080 / 2,
        webPreferences: { nodeIntegration: true },
        backgroundColor: '#000000',
        kiosk: settings.get("kiosk"),
        fullscreen: settings.get("fullscreen"),
        fullscreenable: true
    };

    if(process.platform === 'linux')
        options.icon = getLinuxIcon();

    mainWindow = new BrowserWindow(options);

    // fix aspect ratio (macOS only)
    const aspectRatio = 16.0 / 9.0;
    if (!mainWindow.isFullScreen())
        mainWindow.setAspectRatio(aspectRatio);
    mainWindow.on('enter-full-screen', e => mainWindow.setAspectRatio(0.0))
    mainWindow.on('leave-full-screen', e => mainWindow.setAspectRatio(aspectRatio))

    if (settings.get("kiosk") || process.platform !== 'darwin') {
        // disable menu bar
        mainWindow.setMenu(null);
    } else {
        // at least add any "About" menu item
        const template = [{
            label: app.getName(),
            submenu: [{
                    role: 'about',
                },
                /*
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                */
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        }];
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + app.getAppPath() + '/src/html/index.html');

    // Open the DevTools.
    if (settings.get("devTools"))
        mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
    const settings = require("electron-settings");
    addDefaultSettings(settings);
    createWindow(settings);
})

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow(require("electron-settings"));
    }
});
