remote = require('electron').remote;
var _ = require('lodash');
var Promise = require("bluebird");
window.path = require('path');
var packageJson = require(path.join(remote.app.getAppPath(),'package.json'));
window.settings = require('electron-settings');
var miscConfig = settings.getAll();
var snapshots; // to be initialized after preprocessing the SNAPSHOT list

// TODO: complete migration to jQuery v3 depends on bootbox support
window.$ = window.jQuery = require("jquery-migrate");
window.jQuery.migrateTrace = false;

window.bootbox = require('bootbox');
window.Swiper = require("swiper");
window.qrImage = require("qr-image");

window.fs = require('fs');
window.fsExtra = require('fs-extra');

const userDataDir = remote.app.getPath("userData");
const cacheDir = path.join(path.dirname(require('cachedir')('dummy')),remote.app.getName());
fsExtra.mkdirpSync(cacheDir);
console.log(cacheDir);
const pdfCacheDirname = path.join(cacheDir, "pdf");
const pngCacheDirname = path.join(cacheDir, "png");
{
    // migrate old caches of PDF and PNG files to new location
    const oldPdfCacheDirname = path.join(userDataDir, "pdfCache");
    if(!fs.existsSync(pdfCacheDirname) && fs.existsSync(oldPdfCacheDirname))
        fs.renameSync(oldPdfCacheDirname,pdfCacheDirname);
    const oldPngCacheDirname = path.join(userDataDir, "pngCache");
    if(!fs.existsSync(pngCacheDirname) && fs.existsSync(oldPngCacheDirname))
        fs.renameSync(oldPngCacheDirname,pngCacheDirname);
}
fsExtra.mkdirpSync(pdfCacheDirname);
fsExtra.mkdirpSync(pngCacheDirname);

function fromBaseDir(modulePath) {
    return path.join(remote.app.getAppPath(), modulePath);
}

const Snapshot = require(fromBaseDir('src/js/renderer/Snapshot.js'));
const SnapshotPrinter = require(fromBaseDir('src/js/renderer/SnapshotPrinter.js'));
const SnapshotMailer = require(fromBaseDir('src/js/renderer/SnapshotMailer.js'));
const SnapshotListUpdater = require(fromBaseDir('src/js/renderer/SnapshotListUpdater.js'));
const notify = require(fromBaseDir('src/js/renderer/notify.js'));
const preprocessSnapshotList = require(fromBaseDir('src/js/renderer/preprocessSnapshotList.js'));

const snapshotMailer = new SnapshotMailer(miscConfig.mail);
snapshotMailer.testConnection()
    .then(info => notify.success('Mail server is ready to take messages', ""))
    .catch(error => notify.error('Connection to mail server failed', 'Please check the error message', error));

require(fromBaseDir('libs/jqbtk.js'));

var swiper;
var nestedSwipers = [];

if (miscConfig.hideCursor) {
    var lastCSS = document.styleSheets[document.styleSheets.length - 1];
    lastCSS.insertRule("* { cursor: none; }", lastCSS.cssRules.length);
}

window.onresize = e => {
    var sx = $(window).width() / 1920;
    var sy = $(window).height() / 1080;
    var s = Math.min(sx, sy);
    var fullHdCentered = document.getElementById("full-hd-centered");
    fullHdCentered.style.transform = `scale(${s})`;
    fullHdCentered.style.left = `${($(window).width()-1920*s)/2.0}px`;
    fullHdCentered.style.top = `${($(window).height()-1080*s)/2.0}px`;
}
window.onresize();

document.body.ondblclick = e => {
    if (mode == "slider") {
        var win = remote.getCurrentWindow();
        var sx = win.getContentSize()[0] / 1920;
        var sy = win.getContentSize()[0] / 1080;
        var s = Math.min(sx, sy);
        win.setContentSize(Math.floor(1920 * s), Math.floor(1080 * s), true);
    }
}
document.body.ondblclick();

document.onkeydown = e => {
    if (mode == "slider") {
        const actions = {
            "i": about,
            "ArrowLeft": () => swiper.slidePrev(), // left arrow
            "ArrowRight": () => swiper.slideNext(), // right arrow
            "ArrowDown": () => nestedSwipers[swiper.realIndex].slideNext(), // down arrow
            "ArrowUp": () => nestedSwipers[swiper.realIndex].slidePrev() // up arrow
        };
        actions[miscConfig.snapshots.autoUpdate.hotkey] = switchToUpdateMode;
        if (typeof actions[e.key] !== 'undefined')
            actions[e.key]();
    }
};

function about() {
    notify.info(
        `About ${packageJson.productName}`,
        `License: ${packageJson.license}<br/>Version: ${packageJson.version}`,
        process.versions
    );
}

function initTopLevelSlides() {
    for (var i = 0; i < snapshots.length; ++i) {
        const slide = document.createElement("DIV");
        slide.classList.add("swiper-slide");
        slide.classList.add("swiper-slide-h");
        $("#slider").children(".swiper-wrapper").first().append(slide);
        const $slide_wrapper = $('<div/>', {
            class: 'slide-wrapper'
        });
        $(slide).append($slide_wrapper);

        const verticalSwiper = $('<div class="swiper-container swiper-container-v" style="transform: translateZ(0);"><div class="swiper-wrapper"></div></div>');

        $slide_wrapper.append(verticalSwiper);
        const buttonBar = $slide_wrapper.append(`<div id="button-bar-${i}" class="button-bar"></div>`).children().last();

        if (!miscConfig.mail.enable)
            buttonBar.append(`<i class="fa fa-envelope-o disabled" aria-hidden="true"></i>`);
        else
            buttonBar.append(`<a href="javascript:switchToMailMode(snapshots[${i}]);"><i class="fa fa-envelope-o" aria-hidden="true"></i></a>`);

        if (snapshots[i].metadata.isFrontPage || !miscConfig.print.enable)
            buttonBar.append(`<i class="fa fa-print disabled" aria-hidden="true"></i>`);
        else
            buttonBar.append(`<a href="javascript:switchToPrintMode(snapshots[${i}]);"><i class="fa fa-print" aria-hidden="true"></i></a>`);

        // add QR code
        var svgObject = $(qrImage.imageSync(snapshots[i].metadata.url_short, {
            type: 'svg',
            size: 2
        }));
        svgObject.addClass("qrcode");
        $(`#button-bar-${i}`).append(svgObject);
        if (snapshots[i].metadata.isFrontPage)
            $(`#button-bar-${i}`).addClass('overview');
    }
}

async function initNestedSlides(nestedSwiper, snapshot) {
    nestedSwiper.update(true);
    const numPages = (await snapshot.initDocumentPromise).numPages;
    const promises = new Array(numPages);
    for (var pageNum = 0; pageNum < numPages; ++pageNum) {
        const loader = document.createElement("div");
        loader.classList.add("loader");
        const image = document.createElement("img");
        promises[pageNum] = snapshot
            .getPageRenderingPath(pageNum, nestedSwiper.width, nestedSwiper.height)
            .then(path => image.src = path)
            .then(() => loader.remove());
        const div = document.createElement("div");
        div.appendChild(image);
        div.appendChild(loader);
        div.classList.add("swiper-slide");
        div.classList.add("swiper-slide-v");

        nestedSwiper.appendSlide(div);
    }
    nestedSwiper.update(true);
    await Promise.all(promises);
}

var initComplete = false;

function initSliders() {
    var lastActiveIndex = -1;
    var triggerAgain = false;
    var callback = function() {
        if (lastActiveIndex != swiper.activeIndex && initComplete) {
            const rearrangement = {};
            for (var i = swiper.activeIndex - 5; i <= swiper.activeIndex + 5; i++) {
                const slide = swiper.slides[i];
                if(typeof slide === 'undefined')
                    continue; // index out of range -> skip this one

                const tlSlideIndex = slide.getAttribute("data-swiper-slide-index");
                const nestedSwiper = nestedSwipers[tlSlideIndex].el;

                slide.querySelector(".slide-wrapper").appendChild(nestedSwiper);
                rearrangement[tlSlideIndex] = i;
            }
            console.log("reassigned slides:", rearrangement);

            lastActiveIndex = swiper.activeIndex;
        }
        if (triggerAgain)
            window.requestAnimationFrame(callback);
    }

    var swiperConfig = {
        direction: 'horizontal',
        slidesPerView: 3,
        freeMode: true,
        effect: 'coverflow',
        //mousewheelControl: true,
        //mousewheelForceToAxis: true,
        spaceBetween: 78,
        initialSlide: 0,
        loop: true,
        loopedSlides: snapshots.length,
        freeModeSticky: true,
        freeModeMomentumRatio: 0.25,
        centeredSlides: true,
        slideReassignCallback: callback,
        on: {
            slideChangeTransitionStart: function(swiper) {
                triggerAgain = true;
                window.requestAnimationFrame(callback);
            },
            slideChangeTransitionEnd: function(swiper) {
                triggerAgain = false;
            },
            transitionStart: function(swiper) {
                triggerAgain = true;
                window.requestAnimationFrame(callback);
            },
            transitionEnd: function(swiper) {
                triggerAgain = false;
            },
            sliderMove: function(swiper) {
                window.requestAnimationFrame(callback);
            },
        }

    };
    swiper = new Swiper('#slider', swiperConfig);
    for (var i = 0; i < swiper.slides.length; i++)
        $(swiper.slides[i]).attr("data-swiper-fake-slide-index", i);

    var nestedSwiperConfig = {
        direction: 'vertical',
        slidesPerView: 1,
        spaceBetween: 4,
        freeMode: true,
        freeModeSticky: true,
        mousewheelControl: true,
        mousewheelForceToAxis: true,
        controlBy: 'container'
    };
    $(swiper.slides).not('.swiper-slide-duplicate').find('.swiper-container').each(function() {
        nestedSwipers.push(new Swiper(this, nestedSwiperConfig));
    });
    $(swiper.slides).filter('.swiper-slide-duplicate').find('.swiper-container').remove();
}

function disableSnapshot(index) {
    // disable mail and print buttons
    $(`#button-bar-${index} a > i`).unwrap();
    $(`#button-bar-${index} i`).addClass("disabled");
}

function initIdleHandlers() {
    var idle_timer = null;
    var init_idle_timer = function(delay) {
        if (idle_timer != null)
            clearTimeout(idle_timer);
        idle_timer = setTimeout(idle_handler, delay);
    }
    var non_idle_handler = function(evt) {
        console.log("non_idle_handler");
        init_idle_timer(miscConfig.idleModeDelayMs);
    }
    var idle_handler = function() {
        console.log("idle_handler");
        idleAction();
        init_idle_timer(miscConfig.idleModeDelayBetweenActionsMs);
    }

    document.body.addEventListener('mouseup', non_idle_handler, true);
    document.body.addEventListener('mousemove', non_idle_handler, true);
    document.body.addEventListener('mousedown', non_idle_handler, true);
    document.body.addEventListener("touchstart", non_idle_handler, true);
    document.body.addEventListener("touchend", non_idle_handler, true);
    document.body.addEventListener("touchcancel", non_idle_handler, true);
    document.body.addEventListener("touchmove", non_idle_handler, true);
    document.body.addEventListener("onscroll", non_idle_handler, true);
    document.body.addEventListener("keydown", non_idle_handler, true);
    document.body.addEventListener("keyup", non_idle_handler, true);
    document.body.addEventListener("keypress", non_idle_handler, true);

    init_idle_timer(miscConfig.idleModeDelayMs);
}

function idleAction() {
    bootbox.hideAll();
    nestedSwipers[(swiper.realIndex + 1) % snapshots.length].slideTo(0, 0);
    nestedSwipers[(swiper.realIndex + 2) % snapshots.length].slideTo(0, 0);
    swiper.slideNext(miscConfig.idleAnimationDurationMs,true);
}

var mode;

function switchToSlider() {
    mode = "slider";
    $('#slider').show();
}

function switchToUpdateMode() {
    mode = "update";

    bootbox.confirm({
        title: 'Confirm update',
        message: '<p class="dialog">Are you sure that you want to update the list of available SNAPSHOTS?<p>',
        callback: function(result) {
            if (result)
                updateSnapshotList();
            switchToSlider();
        }
    });
}

function switchToMailMode(snapshot) {
    mode = "mail";
    bootbox.confirm({
        title: 'Please enter your email address',
        message: '<p>Select one of the input fields to open the on screen keyboard. Click outside the on screen keyboard to hide it.</p><br /><p><div class="form-group"><label for="emailName">Name:</label><input type="text" class="keyboard form-control" id="emailName"></div><div class="form-group"><label for="emailAddress">Email:</label><input type="text" class="keyboard form-control" id="emailAddress"></div></p>',
        callback: result => {
            if (result) {
                const recipientName = $('#emailName').val().trim();
                const recipientAddress = $('#emailAddress').val().trim();
                snapshotMailer.send(snapshot.metadata, recipientAddress, recipientName === '' ? undefined : recipientName)
                    .then(info => notify.success('Email sent successfully', "", info))
                    .catch(error => notify.error('Email could not be sent', 'Please check the error message', error));
            }
            switchToSlider();
        }
    });
    $("#emailName").keyboard();
    $("#emailAddress").keyboard();
}

function switchToPrintMode(snapshot) {
    mode = "print";
    bootbox.confirm({
        title: 'Confirm printing',
        message: `<p class="dialog">Do you want to print: <em>"<b>${snapshot.metadata.authors.map(a => a.trim()).join(", ")}:</b> ${snapshot.metadata.title.trim()}"</em>?<p>`,
        callback: result => {
            if (result)
                print(snapshot);
            switchToSlider();
        }
    });
}

function print(snapshot) {
    return SnapshotPrinter.print(snapshot.cachedPdf)
        .then(() => notify.success('File has been sent to the printer'))
        .catch(error => notify.error('Print job failed', 'Please check the error message', error));
}


async function updateSnapshotList() {
    const errorNotificationTitle = "Update of SNAPSHOT list failed";
    const successNotificationTitle = "Update of SNAPSHOT list successful";

    try {
        const newSnapshotList = await SnapshotListUpdater.update(miscConfig.snapshots.autoUpdate.url);
        if (_.isEqual(newSnapshotList.snapshots, miscConfig.snapshots.articles)) {
            notify.success(successNotificationTitle, "No change detected.", newSnapshotList);
        } else {
            settings.set("snapshots.articles", newSnapshotList.snapshots, {
                prettify: true
            });
            notify.success(successNotificationTitle, "Reloading …", newSnapshotList)
                .then(() => location.reload());
        }
    } catch( error ) {
        switch( error.errorCode ) {
            case SnapshotListUpdater.UpdateError.ERROR_DOWNLOAD_FAILED:
                notify.error(errorNotificationTitle, "The list could not be downloaded.", error.cause);
                break;
            case SnapshotListUpdater.UpdateError.ERROR_VERSION_MISMATCH:
                notify.error(errorNotificationTitle, "Online data has wrong version tag.", error.cause);
                break;
            case SnapshotListUpdater.UpdateError.ERROR_VALIDATION_FAILED:
                notify.error(errorNotificationTitle, "The downloaded list is invalid.", error.cause);
                break;
        }
    }
}

// GO!
new Promise((resolve, reject) => $(document).ready(resolve))
    .then(miscConfig.snapshots.autoUpdate.enable ? () => {
        notify.info("Starting update of SNAPSHOT list");
        return updateSnapshotList().reflect();
    } : Promise.resolve())
    .then(() => {
        var startTime = performance.now()
        const articles = preprocessSnapshotList(miscConfig.snapshots);
        snapshots = articles.map(article => new Snapshot(article,{
            cacheDir: cacheDir,
            defaultWidth: 717,
            defaultHeight: 1014
        }));
        notify.updateInitProgressBar("#progressCache", {
            max: snapshots.length
        });
        notify.updateInitProgressBar("#progressDocs", {
            max: snapshots.length
        });
        initTopLevelSlides();
        initSliders();
        var cachePDFPromises = [];
        var initDocumentPromises = [];
        var initNestedSlidesPromises = [];
        var initCompletePromises = [];
        let totalNumPages = 0;
        snapshots.forEach( (snapshot, which) => {
            let article = snapshot.metadata;

            let cachePromise = snapshot.cacheDocumentPromise.catch(e => {
                notify.error("Initialization error", `Could not cache "${article.authors.join(", ")}: ${article.title}" (doi: ${article.doi})`, e);
                throw e;
            });
            let initDocumentPromise = snapshot.initDocumentPromise.catch(e => {
                notify.error("Initialization error", `Failed to load "${article.authors.join(", ")}: ${article.title}" (doi: ${article.doi})`, e);
                throw e;
            });
            let cachePagePromises = snapshot.cachePagePromises.catch(e => {
                notify.error("Initialization error",
                    `Failed to render pages of "${article.authors.join(", ")}: ${article.title}" (doi: ${article.doi})`, e);
                throw e;
            });

            cachePromise.finally(() => notify.updateInitProgressBar("#progressCache", {
                now: 1,
                offset: true
            }));
            cachePagePromises.finally(() =>
                notify.updateInitProgressBar("#progressDocs", {
                    now: 1,
                    offset: true
                })
            );

            initDocumentPromise = initDocumentPromise.then( document => {
                totalNumPages += document.numPages;
                notify.updateInitProgressBar("#progressPages", {
                    max: totalNumPages
                });
                notify.updateInitProgressBar("#progressRendered", {
                    max: totalNumPages
                });
                return document;
            });

            let initCompletePromise = cachePagePromises
                .catch(e => {
                    disableSnapshot(which);
                    console.log("Problem processing snapshot", snapshot.metadata, e);
                })
                .then(actualCachePagePromises => Promise.all(actualCachePagePromises));

            initDocumentPromise = initDocumentPromise.then(
                document => { initNestedSlides(nestedSwipers[which],snapshot); return document; }
            );

            snapshot.initPagePromises.then( promises => promises.forEach( promise => promise.finally(
                () => notify.updateInitProgressBar("#progressPages", {
                    now: 1,
                    offset: true
                }))));

            snapshot.cachePagePromises.then( promises => promises.forEach( promise => promise.finally(
                () => notify.updateInitProgressBar("#progressRendered", {
                    now: 1,
                    offset: true
                }))));

            cachePDFPromises.push(cachePromise);
            initDocumentPromises.push(initDocumentPromise);
            initNestedSlidesPromises.push(cachePagePromises);
            initCompletePromises.push(initCompletePromise);
        });

        Promise.all(initNestedSlidesPromises).catch(() => notify.warning("Initialization incomplete", "Some SNAPSHOTS will be unavailable."));
        Promise.all(initCompletePromises)
            .then(notify.closeInitProgressBar)
            .then(() => {
                initComplete = true;
                window.requestAnimationFrame(swiper.params.slideReassignCallback);
                //$('#progress').hide();
                initIdleHandlers();
                switchToSlider();
                console.log(`loading took ${(performance.now()-startTime)/1000.0}s`)
            });
    });