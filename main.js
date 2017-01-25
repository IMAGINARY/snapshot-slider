'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
const Menu = electron.Menu;

const path = require('path');
const settings = require('electron-settings');
settings.defaults(require("./defaults.json"));
settings.applyDefaultsSync({
    prettify: true
});

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
        return path.resolve(__dirname, 'build', 'icon48x48.png');
    else
        return path.resolve(__dirname, '..', 'icon48x48.png');
}

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.

    const options = {
        width: 1920 / 2,
        height: 1080 / 2,
        backgroundColor: '#000000',
        kiosk: settings.getSync("kiosk"),
        fullscreen: settings.getSync("fullscreen"),
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

    if (settings.getSync("kiosk") || process.platform !== 'darwin') {
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
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Open the DevTools.
    if (settings.getSync("devTools"))
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
app.on('ready', createWindow);

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
        createWindow();
    }
});
