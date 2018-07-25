const cachedir = require('cachedir');
const path = require('path');
const fs = require('fs-extra');
const app = require('electron').remote.app;


function getPath(name) {
    switch (name) {
        case 'cache':
            return path.join(path.dirname(cachedir('dummy')), app.getName());
        case 'pdfCache':
            return path.join(getPath('cache'),'pdf');
        case 'pngCache':
            return path.join(getPath('cache'),'png');
        case 'Settings':
            return path.join(getPath('userData'),'Settings');
        default:
            return app.getPath(name);
    }
}

function cacheDirContents() {
    return fs.readdirSync(getPath('cache'));
}

async function clearCaches(subfolders) {
    const cacheDir = getPath('cache');
    return Promise.all(subfolders.map(subfolder => fs.remove(path.join(cacheDir, subfolder))));
}


module.exports.getPath = getPath;
module.exports.cacheDirContents = cacheDirContents;
module.exports.clearCaches = clearCaches;
