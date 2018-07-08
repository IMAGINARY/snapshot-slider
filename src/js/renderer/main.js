// keep this global reference around to ease debugging
var debugHook = (function () {
    const fromBaseDir = modulePath => require('path').join(require('electron').remote.app.getAppPath(), modulePath);

    // included with side effects to overwrite some globals
    require(fromBaseDir('src/js/renderer/polyfills.js'));

    // external imports
    const remote = require('electron').remote;
    const _ = require('lodash');
    const settings = require('electron-settings');
    const $ = jQuery = require("jquery-migrate"); // TODO: complete migration to jQuery v3 depends on bootbox support
    $.migrateTrace = false;
    require(fromBaseDir('libs/jqbtk.js')); // extends jQuery, no further global side effects
    const bootbox = require('bootbox');
    const keyboardJS = require('keyboardjs');

    // project imports
    const Snapshot = require(fromBaseDir('src/js/renderer/Snapshot.js'));
    const SnapshotPrinter = require(fromBaseDir('src/js/renderer/SnapshotPrinter.js'));
    const SnapshotMailer = require(fromBaseDir('src/js/renderer/SnapshotMailer.js'));
    const SnapshotListUpdater = require(fromBaseDir('src/js/renderer/SnapshotListUpdater.js'));
    const SliderInitializer = require(fromBaseDir('src/js/renderer/SliderInitializer.js'));
    const notify = require(fromBaseDir('src/js/renderer/notify.js'));
    const preprocessSnapshotList = require(fromBaseDir('src/js/renderer/preprocessSnapshotList.js'));
    const packageJson = require(fromBaseDir('package.json'));
    const migrateOldSettings = require(fromBaseDir('src/js/renderer/migrateOldSettings.js'));
    const utils = require(fromBaseDir('src/js/renderer/utils.js'));

    // initialization
    migrateOldSettings();
    const miscConfig = settings.getAll();
    let snapshots; // to be initialized after preprocessing the SNAPSHOT list

    const snapshotMailer = new SnapshotMailer(miscConfig.mail);
    if (miscConfig.mail.enable)
        snapshotMailer.testConnection()
            .then(() => notify.success('Mail server is ready to take messages', ""))
            .catch(error => notify.error('Connection to mail server failed', 'Please check the error message', error));

    if (miscConfig.hideCursor) {
        const lastCSS = document.styleSheets[document.styleSheets.length - 1];
        lastCSS.insertRule("* { cursor: none; }", lastCSS.cssRules.length);
    }

    window.onresize = () => {
        const sx = $(window).width() / 1920;
        const sy = $(window).height() / 1080;
        const s = Math.min(sx, sy);
        const fullHdCentered = document.getElementById("full-hd-centered");
        fullHdCentered.style.transform = `scale(${s})`;
        fullHdCentered.style.left = `${($(window).width() - 1920 * s) / 2.0}px`;
        fullHdCentered.style.top = `${($(window).height() - 1080 * s) / 2.0}px`;
    };
    window.onresize();

    document.body.ondblclick = () => {
        if (keyboardJS.getContext() === "slider") {
            const win = remote.getCurrentWindow();
            const sx = win.getContentSize()[0] / 1920;
            const sy = win.getContentSize()[0] / 1080;
            const s = Math.min(sx, sy);
            win.setContentSize(Math.floor(1920 * s), Math.floor(1080 * s), true);
        }
    };
    document.body.ondblclick();
    
    function initGlobalKeyHandlers() {
        // bind to the window and document in the current window
        keyboardJS.watch();

        // global keyboard shortcuts
        keyboardJS.bind("mod + i", about);
        keyboardJS.bind("mod + r", () => window.location.reload());
    }

    function initSliderKeyHandlers(swiper, slideContents) {
        // context specific keyboard shortcuts
        keyboardJS.withContext('slider', () => {
            keyboardJS.bind("left", () => swiper.slidePrev()); // left arrow
            keyboardJS.bind("right", () => swiper.slideNext()); // right arrow
            keyboardJS.bind("down", () => slideContents[swiper.realIndex].nested.swiper.slideNext()); // down arrow
            keyboardJS.bind("up", () => slideContents[swiper.realIndex].nested.swiper.slidePrev()); // up arrow

            keyboardJS.bind("mod + c", switchToClearCacheMode);
            keyboardJS.bind(miscConfig.snapshots.autoUpdate.hotkey, switchToUpdateMode);
        });
    }

    function about() {
        notify.info(
            `About ${packageJson.productName}`,
            `License: ${packageJson.license}<br/>Version: ${packageJson.version}`,
            process.versions
        );
    }

    function initIdleHandlers(idleAction) {
        let idle_timer = null;
        const init_idle_timer = delay => {
            if (idle_timer != null)
                clearTimeout(idle_timer);
            idle_timer = setTimeout(idle_handler, delay);
        };
        const non_idle_handler = () => {
            console.log("non_idle_handler");
            init_idle_timer(miscConfig.idleModeDelayMs);
        };
        const idle_handler = () => {
            console.log("idle_handler");
            idleAction();
            init_idle_timer(miscConfig.idleModeDelayBetweenActionsMs);
        };

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

    function createIdleAction(swiper, slideContents) {
        return () => {
            bootbox.hideAll();
            slideContents[(swiper.realIndex + 1) % snapshots.length].nested.swiper.slideTo(0, 0);
            slideContents[(swiper.realIndex + 2) % snapshots.length].nested.swiper.slideTo(0, 0);
            swiper.slideNext(miscConfig.idleAnimationDurationMs, true);
        }
    }

    function switchToSlider() {
        keyboardJS.setContext('slider');
    }

    function switchToClearCacheMode() {
        keyboardJS.setContext('clearCache');
        bootbox.prompt({
            title: "Please select the cache folders to be deleted",
            value: "",
            inputType: 'checkbox',
            inputOptions: utils.cacheDirContents().map(entry => {
                return {text: entry, value: entry}
            }),
            callback: result => {
                if (result) {
                    utils.clearCaches(result)
                        .then(() => notify.success("Cache successfully wiped", "Reloading …"))
                        .then(() => location.reload())
                        .catch(error => notify.error("Could not wipe cache", "", error));
                }
                switchToSlider();
            },
        });
    }

    function switchToUpdateMode() {
        keyboardJS.setContext('update');
        bootbox.confirm({
            title: 'Confirm update',
            message: '<p class="dialog">Are you sure that you want to update the list of available SNAPSHOTS?<p>',
            callback: result => {
                if (result)
                    updateSnapshotList();
                switchToSlider();
            }
        });
    }

    function switchToMailMode(snapshot) {
        keyboardJS.setContext('mail');
        $dialog = bootbox.confirm({
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
        $dialog.find("#emailName").keyboard();
        $dialog.find("#emailAddress").keyboard();
    }

    function switchToPrintMode(snapshot) {
        keyboardJS.setContext('print');
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
        } catch (error) {
            switch (error.errorCode) {
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
    new Promise(resolve => $(document).ready(resolve))
        .then(initGlobalKeyHandlers)
        .then(miscConfig.snapshots.autoUpdate.enable ? () => {
            notify.info("Starting update of SNAPSHOT list");
            return updateSnapshotList().reflect();
        } : Promise.resolve())
        .then(async () => {
            const startTime = performance.now();
            const articles = preprocessSnapshotList(miscConfig.snapshots);
            snapshots = articles.map(article => new Snapshot(article, {
                cacheDir: utils.getPath('cache'),
                defaultWidth: 717,
                defaultHeight: 1014
            }));
            notify.updateInitProgressBar("#progressCache", {
                max: snapshots.length
            });
            notify.updateInitProgressBar("#progressDocs", {
                max: snapshots.length
            });

            const cachePDFPromises = [];
            const initDocumentPromises = [];
            const initNestedSlidesPromises = [];
            const initCompletePromises = [];
            let totalNumPages = 0;
            snapshots.forEach(snapshot => {
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

                initDocumentPromise = initDocumentPromise.then(document => {
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
                        console.log("Problem processing snapshot", snapshot.metadata, e);
                    })
                    .then(actualCachePagePromises => Promise.all(actualCachePagePromises));

                snapshot.initPagePromises.then(promises => promises.forEach(promise => promise.finally(
                    () => notify.updateInitProgressBar("#progressPages", {
                        now: 1,
                        offset: true
                    }))));

                snapshot.cachePagePromises.then(promises => promises.forEach(promise => promise.finally(
                    () => notify.updateInitProgressBar("#progressRendered", {
                        now: 1,
                        offset: true
                    }))));

                cachePDFPromises.push(cachePromise);
                initDocumentPromises.push(initDocumentPromise);
                initNestedSlidesPromises.push(cachePagePromises);
                initCompletePromises.push(initCompletePromise);
            });

            // create the slider and add it to the DOM (final initialization is done upon insertion into the DOM)
            const {swiper, slideContents} = await SliderInitializer.createTopLevelSlider(snapshots, {
                onMail: miscConfig.mail.enable ? snapshot => switchToMailMode(snapshot) : undefined,
                onPrint: miscConfig.print.enable ? snapshot => switchToPrintMode(snapshot) : undefined,
            });
            document.querySelector('#full-hd-centered').appendChild(swiper.el);

            Promise.all(initNestedSlidesPromises).catch(() => notify.warning("Initialization incomplete", "Some SNAPSHOTS will be unavailable."));
            Promise.all(initCompletePromises)
                .then(notify.closeInitProgressBar)
                .then(() => {
                    initIdleHandlers(createIdleAction(swiper, slideContents));
                    initSliderKeyHandlers(swiper, slideContents);
                    switchToSlider();

                    console.log(`loading took ${(performance.now() - startTime) / 1000.0}s`)
                });
        });

})();
