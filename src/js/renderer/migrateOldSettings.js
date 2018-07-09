const path = require('path');
const fs = require('fs-extra');

const utils = require('./utils.js');

module.exports = function migrateOldSettings() {
    // migrate old caches of PDF and PNG files from userData to actual cache location
    const userDataDir = utils.getPath("userData");
    const cacheDir = utils.getPath("cache");
    const pdfCacheDirname = path.join(cacheDir, "pdf");
    const oldPdfCacheDirname = path.join(userDataDir, "pdfCache");
    const oldPngCacheDirname = path.join(userDataDir, "pngCache");

    // move cached PDFs
    if (!fs.existsSync(pdfCacheDirname) && fs.existsSync(oldPdfCacheDirname)) {
        fs.mkdirpSync(cacheDir);
        fs.renameSync(oldPdfCacheDirname, pdfCacheDirname);
    }

    // delete cached PNGs (can be reconstructed offline)
    fs.removeSync(oldPngCacheDirname);
};
