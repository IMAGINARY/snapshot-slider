// TODO: the CSS file is still included in the main HTML file

const $ = require("jquery-migrate");
require('bootstrap');
require('bootstrap-notify');
const format = require('string-template');

const progressTemplate = `
    <div>
        <div class="progress">
            <span class="progressbar-back-text"></span>
            <div id="progressCache" class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" style="width:0%;" data-template="{0} of {1} documents cached">
                <span class="progressbar-front-text"></span>
            </div>
        </div>
        <div class="progress">
            <span class="progressbar-back-text"></span>
            <div id="progressDocs" class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" style="width:0%" data-template="{0} of {1} documents initialized">
                <span class="progressbar-front-text"></span>
            </div>
        </div>
        <div class="progress">
            <span class="progressbar-back-text"></span>
            <div id="progressPages" class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" style="width:0%" data-template="{0} of {1} pages loaded">
                <span class="progressbar-front-text"></span>
            </div>
        </div>
        <div class="progress">
            <span class="progressbar-back-text"></span>
            <div id="progressRendered" class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" style="width:0%" data-template="{0} of {1} pages cached">
                <span class="progressbar-front-text"></span>
            </div>
        </div>
    </div>`;

async function _createInitNotification() {
    return new Promise(resolve => {
        const initNotification = [];
        initNotification[0] = $.notify({
            icon: "fa fa-circle-o-notch fa-spin fa-fw",
            title: "Initializing …",
            message: progressTemplate.trim()
        }, {
            placement: {
                from: "bottom",
                align: "right"
            },
            animate: {
                enter: 'animated fadeInRight',
                exit: 'animated fadeOutRight'
            },
            delay: 0,
            onShow: () => setTimeout(() => resolve(initNotification[0]), 0),
            allow_dismiss: false
        });
    }).then(["#progressCache", "#progressDocs", "#progressPages", "#progressRendered"].forEach(e => _updateInitProgressBarSync(e)));
}

let initNotificationPromise;
function updateInitProgressBar(progressBar, data) {
    if (typeof initNotificationPromise === 'undefined')
        initNotificationPromise = _createInitNotification();

    // always queue the requests so they don't get mixed up
    initNotificationPromise = initNotificationPromise.then(initNotification => {
        _updateInitProgressBarSync(progressBar, data);
        return initNotification;
    });
}

function _updateInitProgressBarSync(progressBar, data) {
    const $progressBar = $(progressBar);

    if (typeof data === "object" || typeof data === "function") {
        ["min", "max", "now"].forEach(e => {
            if (data.hasOwnProperty(e)) {
                if (data.offset === true)
                    _increaseAttr($progressBar, `aria-value${e}`, data[e]);
                else
                    $progressBar.attr(`aria-value${e}`, data[e]);
            }
        });
    }

    const min = $progressBar.attr("aria-valuemin");
    const max = $progressBar.attr("aria-valuemax");
    const now = $progressBar.attr("aria-valuenow");
    const percentage = 100 * (now - min) / (max - min);
    $progressBar.css("width", `${percentage}%`);

    const $frontText = $progressBar.find(".progressbar-front-text");
    $frontText.css("width", $progressBar.parent().css("width"));
    $frontText.text(format($progressBar.attr("data-template"), now, max));
    const $backText = $progressBar.parent().find(".progressbar-back-text");
    $backText.text(format($progressBar.attr("data-template"), now, max));
}

function _increaseAttr(selector, attr, amount) {
    $(selector).attr(attr, parseInt($(selector).attr(attr), 10) + amount);
}

function closeInitProgressBar() {
    if (typeof initNotificationPromise !== 'undefined')
        initNotificationPromise.then(initNotification => initNotification.close())
}

const _openNotifications = {};

function _notify(icon, title, message, details, type) {
    this.id = typeof this.id === "undefined" ? this.id = 0 : this.id + 1;
    const currId = this.id;

    console.log({
        id: this.id,
        type: type,
        title: title,
        message: message,
        details: details
    });

    let detailsHTML = "";
    if (!(typeof details === "undefined")) {
        if (details instanceof Error)
            details = details.stack;
        else if (details instanceof Object)
            details = JSON.stringify(details, null, 2);

        detailsHTML =
            `
                    <i class="fa fa-caret-down" aria-hidden="true" onClick="__notify.$('#collapsibleDetails${currId}').on('shown.bs.collapse',()=>__notify._openNotifications[${currId}].update({}));__notify.$('#collapsibleDetails${currId}').collapse('show');__notify.$(this).css('display','none');__notify.$(this).next().css('display','');"></i>
                    <i class="fa fa-caret-up" aria-hidden="true" style="display: none;" onClick="__notify.$('#collapsibleDetails${currId}').on('hidden.bs.collapse',()=>__notify._openNotifications[${currId}].update({}));__notify.$('#collapsibleDetails${currId}').collapse('hide');__notify.$(this).css('display','none');__notify.$(this).prev().css('display','');"></i>
                    <div id="collapsibleDetails${currId}" class="collapse">
                        <pre class="notifyDetails">${details}</pre>
                    </div>
                `.trim();
    }

    return new Promise(resolve => _openNotifications[currId] = $.notify({
        icon: icon,
        title: title,
        message: typeof message === 'undefined' ? "" : message + detailsHTML
    }, {
        type: type,
        placement: {
            from: "bottom",
            align: "right"
        },
        animate: {
            enter: 'animated fadeInRight',
            exit: 'animated fadeOutRight'
        },
        onClosed: () => {
            delete _openNotifications[currId];
            resolve();
        },
        delay: 4000,
        mouse_over: 'pause'
    }));
}

module.exports.updateInitProgressBar = updateInitProgressBar;
module.exports.closeInitProgressBar = closeInitProgressBar;
module.exports.success = (title, message, details) => _notify("fa fa-check-square", title, message, details, "success");
module.exports.info = (title, message, details) => _notify("fa fa-info-circle", title, message, details, "info");
module.exports.warning = (title, message, details) => _notify("fa fa-exclamation-triangle", title, message, details, "warning");
module.exports.error = (title, message, details) => _notify("fa fa-exclamation-circle", title, message, details, "danger");

window.__notify = {
    $: $,
    _openNotifications: _openNotifications
}; // TODO: remove global dependency on jQuery (needed for onClick in _notify)
