const cachedir = require('cachedir');
const path = require('path');
const app = require('electron').remote.app;

module.exports.getPath = name => {
    if (name === 'cache')
        return path.join(path.dirname(cachedir('dummy')), app.getName());
    else
        return app.getPath(name);
};
