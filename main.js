'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
app.commandLine.appendSwitch('disable-accelerated-2d-canvas');

const settings = require('electron-settings');

function sw() {



    app.commandLine.appendSwitch('--js-flags="--max_old_space_size=4096"');

    app.commandLine.appendSwitch('disable-threaded-scrolling');

    // app.commandLine.appendSwitch('enable-apps-show-on-first-paint');

    // app.commandLine.appendSwitch('enable-embedded-extension-options');

    // app.commandLine.appendSwitch('enable-experimental-canvas-features');

    app.commandLine.appendSwitch('enable-gpu-rasterization');

    app.commandLine.appendSwitch('javascript-harmony');

    app.commandLine.appendSwitch('disable-pinch');

    app.commandLine.appendSwitch('enable-settings-window');

    app.commandLine.appendSwitch('enable-touch-editing');

    // app.commandLine.appendSwitch('enable-webgl-draft-extensions');

    // app.commandLine.appendSwitch('enable-experimental-extension-apis');

    app.commandLine.appendSwitch('ignore-gpu-blacklist');

    // app.commandLine.appendSwitch('disable-overlay-scrollbar');

    // app.commandLine.appendSwitch('show-fps-counter');

    // app.commandLine.appendSwitch('ash-touch-hud');



    app.commandLine.appendSwitch('touch-events');

    app.commandLine.appendSwitch('touch-events-enabled');

    app.commandLine.appendSwitch('touch-events', 'enabled');



    /// app.commandLine.appendSwitch('ignore-gpu-blacklist');

    /// app.commandLine.appendSwitch('enable-gpu');

    // app.commandLine.appendSwitch('disable-gpu-sandbox');

    // app.commandLine.appendSwitch('enable-gpu-rasterization');

    /// app.commandLine.appendSwitch('enable-pinch');



    // app.commandLine.appendSwitch('blacklist-accelerated-compositing');



    /// app.commandLine.appendSwitch('disable-web-security');

    /// app.commandLine.appendSwitch('enable-webgl');



    // app.commandLine.appendSwitch('enable-webgl-draft-extensions');

    /// app.commandLine.appendSwitch('enable-webgl-image-chromium');



    // app.commandLine.appendSwitch('enable-touch-editing');

    // app.commandLine.appendSwitch('enable-touch-drag-drop');

    /// app.commandLine.appendSwitch('enable-touchview');



    /// app.commandLine.appendSwitch('compensate-for-unstable-pinch-zoom');



    /// app.commandLine.appendSwitch('enable-viewport');

    // app.commandLine.appendSwitch('enable-unsafe-es3-apis');

    // app.commandLine.appendSwitch('enable-experimental-canvas-features');

    // app.commandLine.appendSwitch('enable-experimental-extension-apis');

    // app.commandLine.appendSwitch('javascript-harmony');

    // app.commandLine.appendSwitch('enable-subscribe-uniform-extension');



    /// app.commandLine.appendSwitch('show-fps-counter');

    /// app.commandLine.appendSwitch('ash-touch-hud');

    // app.commandLine.appendSwitch('ash-enable-touch-view-testing');



    /// app.commandLine.appendSwitch('auto');

}



//https://github.com/atom/electron/issues/1277

//https://bugs.launchpad.net/ubuntu/+source/chromium-browser/+bug/1463598

//https://code.google.com/p/chromium/issues/detail?id=121183





app.commandLine.appendSwitch('disable-pinch');



// sw();

app.commandLine.appendSwitch('flag-switches-begin');

sw();

app.commandLine.appendSwitch('flag-switches-end');



// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1920 / 2,
        height: 1080 / 2,
        kiosk: settings.getSync("kiosk"),
        fullscreen: settings.getSync("fullscreen"),
        fullscreenable: true
    });

    // fix aspect ratio (macOS only)
    const aspectRatio = 16.0 / 9.0;
    if (!mainWindow.isFullScreen())
        mainWindow.setAspectRatio(aspectRatio);
    mainWindow.on('enter-full-screen', e => mainWindow.setAspectRatio(0.0))
    mainWindow.on('leave-full-screen', e => mainWindow.setAspectRatio(aspectRatio))

    // disable menu bar
    mainWindow.setMenu(null);

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
