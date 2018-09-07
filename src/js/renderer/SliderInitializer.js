const $ = jQuery = require("jquery-migrate"); // TODO: complete migration to jQuery v3 depends on bootbox support
$.migrateTrace = false;
const Swiper = require("swiper");
const qrImage = require("qr-image");

module.exports.createTopLevelSlider = async function (snapshots, options) {
    // create the DOM elem to contain the top level slider and add the nested slides to it
    const $horizontalSwiperElem = $('<div class="swiper-container swiper-container-h"><div class="node-inserted"></div><div class="swiper-wrapper"></div></div>');
    const $swiperWrapper = $horizontalSwiperElem.find('.swiper-wrapper');
    const $domInsertionWatcher = $horizontalSwiperElem.find('.node-inserted');

    // add empty slides to the swiper (will be filled via the callback below)
    snapshots.forEach(() => $swiperWrapper.append('<div class="swiper-slide swiper-slide-h"></div>'));

    const slideContents = await Promise.all(snapshots.map(snapshot => createTopLevelSlideContent(snapshot, options)));

    // init the swiper object
    const swiperConfig = {
        direction: 'horizontal',
        slidesPerView: 3,
        freeMode: true,
        effect: 'coverflow',
        spaceBetween: 78,
        initialSlide: 0,
        loop: true,
        loopedSlides: snapshots.length,
        freeModeSticky: true,
        freeModeMomentumRatio: 0.25,
        freeModeMinimumVelocity: 0.1,
        mousewheel: {forceToAxis: true, invert: true},
        centeredSlides: true
    };

    const swiper = new Swiper($horizontalSwiperElem.get(0), swiperConfig);

    // set callback methods for reassigning slides in loop mode
    let lastActiveIndex = -1;
    let triggerAgain = false;
    const reassignSlides = function () {
        if (lastActiveIndex !== swiper.activeIndex) {
            const rearrangement = {};
            for (let i = swiper.activeIndex - 5; i <= swiper.activeIndex + 5; i++) {
                const slide = swiper.slides[i];
                if (typeof slide === 'undefined')
                    continue; // index out of range -> skip this one

                const tlSlideIndex = slide.getAttribute("data-swiper-slide-index");
                slide.appendChild(slideContents[tlSlideIndex].slide);
                rearrangement[tlSlideIndex] = i;
            }
            console.log("reassigned slides:", rearrangement);
            lastActiveIndex = swiper.activeIndex;
        }
        if (triggerAgain)
            window.requestAnimationFrame(reassignSlides);
    };
    swiper.params.reassignSlides = reassignSlides;
    swiper.on('slideChange', () => window.requestAnimationFrame(reassignSlides));
    swiper.on('slideChangeTransitionStart', () => {
        triggerAgain = true;
        window.requestAnimationFrame(reassignSlides);
    });
    swiper.on('slideChangeTransitionEnd', () => triggerAgain = false);
    swiper.on('transitionStart', () => {
        triggerAgain = true;
        window.requestAnimationFrame(reassignSlides);
    });
    swiper.on('transitionEnd', () => triggerAgain = false);
    swiper.on('sliderMove', () => window.requestAnimationFrame(reassignSlides));

    const finalizeInitialization = () => {
        // add all slide contents to the DOM in order to update the nested swipers
        // (without being in the DOM, initialization of nested swipers is incomplete)
        $horizontalSwiperElem
            .find('.swiper-slide')
            .each((index, element) => $(element).append(slideContents[element.getAttribute("data-swiper-slide-index")].slide));
        slideContents.forEach(slideContent => slideContent.nested.swiper.update());

        // move some slide content to other slides if necessary
        reassignSlides();

        // finish initialization of the top level swiper
        const currentIndex = swiper.realIndex;
        swiper.update();
        swiper.slideToLoop(currentIndex, 0);
    };

    // watch for insertion of the swiper and update the swipers
    // it uses a trick that relies on the fact that the animationstart event is triggered upon insertion into the DOM
    $domInsertionWatcher.get(0).addEventListener('animationstart', finalizeInitialization, false);

    return {
        swiper: swiper,
        slideContents: slideContents
    };
};

async function createTopLevelSlideContent(snapshot, options) {
    const {swiper, pageRenderedPromises} = await createNestedSlider(snapshot);

    const $slideContent = $('<div class="slider-wrapper"></div>');
    $slideContent.append(swiper.el);
    $slideContent.append(createButtonBar(snapshot, options));

    return {slide: $slideContent.get(0), nested: {swiper, pageRenderedPromises}};
}

function createButtonBar(snapshot, options) {
    // create mail button
    let $mailButton;
    if (!options.onMail) {
        $mailButton = $(`<i class="fa fa-envelope-o disabled" aria-hidden="true"></i>`);
    } else {
        $mailButton = $(`<a href="javascript:"><i class="fa fa-envelope-o" aria-hidden="true"></i></a>`);
        $mailButton.on('click', () => options.onMail(snapshot));
    }

    // create print button
    let $printButton;
    if (snapshot.metadata.isFrontPage || !options.onPrint) {
        $printButton = $(`<i class="fa fa-print disabled" aria-hidden="true"></i>`);
    } else {
        $printButton = $(`<a href="javascript:"><i class="fa fa-print" aria-hidden="true"></i></a>`);
        $printButton.on('click', () => options.onPrint(snapshot));
    }

    // create QR code
    const $qrSvg = $(qrImage.imageSync(snapshot.metadata.url_short, {
        type: 'svg',
        size: 2
    }));
    $qrSvg.addClass("qrcode");

    // put it together
    const $buttonBar = $(`<div class="button-bar"></div>`);
    $buttonBar.append($mailButton);
    $buttonBar.append($printButton);
    $buttonBar.append($qrSvg);

    if (snapshot.metadata.isFrontPage)
        $buttonBar.addClass('overview');

    // disable button bar for snapshot if loading failed
    Promise.all(snapshot.cachePagePromises).catch(() => disableButtonBar($buttonBar));

    return $buttonBar;
}

function disableButtonBar($buttonBar) {
    // disable mail and print buttons
    $buttonBar.find('a > i').unwrap();
    $buttonBar.find('i').addClass("disabled");
}

async function createNestedSlider(snapshot) {
    const $verticalSwiperElem = $('<div class="swiper-container swiper-container-v" style="transform: translateZ(0);"><div class="swiper-wrapper"></div></div>');
    const $verticalSwiperWrapper = $verticalSwiperElem.find('.swiper-wrapper');

    const nestedSwiperConfig = {
        direction: 'vertical',
        slidesPerView: 1,
        spaceBetween: 4,
        freeMode: true,
        freeModeSticky: true,
        freeModeMinimumVelocity: 0.1,
        mousewheel: {forceToAxis: true, invert: true},
        controlBy: 'container'
    };

    const numPages = (await snapshot.initDocumentPromise).numPages;
    const promises = [];
    for (let pageNum = 0; pageNum < numPages; ++pageNum) {
        const {slide, promise} = createNestedSlide(snapshot, pageNum);
        $verticalSwiperWrapper.append(slide);
        promises.push(promise);
    }

    const nestedSwiper = new Swiper($verticalSwiperElem.get(0), nestedSwiperConfig);

    return {swiper: nestedSwiper, pageRenderedPromises: promises};
}

function createNestedSlide(snapshot, pageNum) {
    // build the DOM subtree, but with empty images for SNAPSHOT pages
    const loader = document.createElement("div");
    loader.classList.add("loader");
    const image = document.createElement("img");
    image.width = 717;
    image.height = 1014;
    image.style.position = 'absolute';
    const div = document.createElement("div");
    div.appendChild(image);
    div.appendChild(loader);
    div.classList.add("swiper-slide");
    div.classList.add("swiper-slide-v");

    // load page asynchronously into image
    const promise = snapshot
        .getPageRenderingPath(pageNum) // default resolution will be used, i.e. resolution won't adjust automatically
        .then(path => image.src = path)
        .then(() => loader.remove());

    return {slide: div, promise: promise};
}

async function loadImage(image, path) {
    return new Promise((resolve, reject) => {
        image.addEventListener('error', e => reject(e));
        image.addEventListener('load', () => resolve(image));
        image.src = path;
    })
}
