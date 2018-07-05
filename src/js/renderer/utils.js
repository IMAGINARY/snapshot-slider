const cachedir = require('cachedir');
const path = require('path');
const fs = require('fs-extra');
const app = require('electron').remote.app;


function getPath(name) {
    if (name === 'cache')
        return path.join(path.dirname(cachedir('dummy')), app.getName());
    else
        return app.getPath(name);
};

function cacheDirContents() {
    return fs.readdirSync(getPath('cache'));
};

async function clearCaches(subfolders) {
    const cacheDir = getPath('cache');
    return Promise.all(subfolders.map(subfolder => fs.remove(path.join(cacheDir, subfolder))));
};


module.exports.getPath = getPath;
module.exports.cacheDirContents = cacheDirContents;
module.exports.clearCaches = clearCaches;
