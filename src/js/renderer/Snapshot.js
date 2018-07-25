'use strict';

const path = require('path');
const hashFilesWithCallBack = require('hash-files');
const fs = require('fs-extra');
const request = require('request');
const PDFJS = require('pdfjs-dist');

module.exports = class Snapshot {
    constructor(metadata, options) {
        this.metadata = {
            title: metadata.title,
            url: metadata.url,
            url_short: metadata.url_short,
            pdf: metadata.pdf,
            sha256: metadata.sha256,
            authors: metadata.authors,
            doi: metadata.doi,
            isFrontPage: metadata.isFrontPage,
        }

        this._defaultWidth = options.defaultWidth;
        this._defaultHeight = options.defaultHeight;

        this._pdfCacheDir = options.pdfCacheDir;
        this._pngCacheDir = options.pngCacheDir;


        this._pngCachePrefix = path.join(this._pngCacheDir, this.metadata.sha256);

        this.cachedPdf = path.join(this._pdfCacheDir, this.metadata.sha256 + '.pdf');

        this._cachePagePromiseCache = {};

        this.initPromise = new Promise(resolve => setTimeout(resolve, 0))
            .then(() => fs.mkdirp(this._pdfCacheDir))
            .then(() => fs.mkdirp(this._pngCacheDir));
        this.cacheDocumentPromise = this.initPromise.then(() => cacheDocument(this.metadata.pdf, this.cachedPdf, this.metadata.sha256));
        this.initDocumentPromise = this.cacheDocumentPromise.then(path => PDFJS.getDocument(path).promise);
        this.initPagePromises = this.initDocumentPromise.then(
            document => Array.from(new Array(document.numPages), (value, index) => document.getPage(index + 1))
        );
        this.cachePagePromises = this.initPagePromises.then(pagePromises => pagePromises.map(
            (pagePromise, pageNum) => pagePromise.then(
                page => this.getPageRenderingPath(pageNum, this._defaultWidth, this._defaultHeight)
            )
        ));

        PDFJS.GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.js';
    }

    async getPageRenderingPath(pdfPageNum, width = this._defaultWidth, height = this._defaultHeight) {
        let key = `${pdfPageNum}.${width}x${height}`;
        let filename = `${this._pngCachePrefix}.${key}.png`;
        if (!this._cachePagePromiseCache.hasOwnProperty(key)) {
            this._cachePagePromiseCache[key] = this._getPageRendering(pdfPageNum, width, height, filename).then(image => image.src);
        }
        return this._cachePagePromiseCache[key];
    }

    async _getPageRendering(pdfPageNum, width, height, filename) {
        try {
            return await loadImage(filename);
        } catch (e) {
            const pagePromises = await this.initPagePromises;
            const pdfPage = await pagePromises[pdfPageNum];
            filename = await cachePageRendering(pdfPage, width, height, filename);
            return await loadImage(filename);
        }
    }
};

function sha256sum(path) {
    const options = {
        files: [path],
        algorithm: 'sha256'
    };
    return new Promise((resolve, reject) => hashFilesWithCallBack(options, (err, hash) => err ? reject(err) : resolve(hash)));
}

function cacheDocument(url, dest, expectedSha256) {
    return sha256sum(dest).then(sha256 => {
        if (sha256 === expectedSha256) {
            return Promise.resolve(dest);
        } else {
            console.log("sha256 does not match for", url, "trying to download the file (again)");
            return downloadDocument(url, dest).then(() => {
                return sha256sum(dest).then(newSha256 => newSha256 === expectedSha256 ? Promise.resolve(dest) : Promise.reject(new Error(`unable to cache ${url} at ${dest}`)));
            });
        }
    });
}

function downloadDocument(url, destination) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${url} to ${destination}`);
        const file = fs.createWriteStream(destination);
        const sendReq = request.get(url);

        // verify response code
        sendReq.on('response', response => {
            if (response.statusCode !== 200)
                reject(response.statusCode);
        });

        // check for request errors
        sendReq.on('error', err => {
            fs.unlink(destination);
            reject(err);
        }); // Delete the file async. (But we don't check the result)

        sendReq.pipe(file);

        file.on('finish', () => {
            file.close();
            resolve(destination);
        });
        file.on('error', err => {
            fs.unlink(destination);
            reject(err);
        }); // Delete the file async. (But we don't check the result)
    });
}

function loadImage(filename) {
    return new Promise((resolve, reject) => {
            if (!fs.existsSync(filename)) {
                reject(new Error(`file ${filename} does not exists`));
                return;
            }

            const image = new Image();
            image.addEventListener('error', e => reject(e));
            image.addEventListener('load', () => resolve(image));
            image.src = filename;
        }
    );
}

async function cachePageRendering(pdfPage, width, height, filename) {
    const viewport = pdfPage.getViewport(1);
    const scale = width / viewport.width;
    const scaledViewport = pdfPage.getViewport(scale);
    scaledViewport.width = Math.floor(scaledViewport.width);
    scaledViewport.height = Math.floor(scaledViewport.height);

    const canvas = document.createElement("CANVAS");
    // canvas.style.transform = 'translateZ(0)'; // TODO: check if really necessary
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {alpha: false});
    const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
    };

    await pdfPage.render(renderContext);
    const pngDataBase64 = canvas.toDataURL().substr("data:image/png;base64,".length);
    const pngBuffer = Buffer.from(pngDataBase64, "base64");
    return fs.writeFile(filename, pngBuffer).then(() => filename);
}
