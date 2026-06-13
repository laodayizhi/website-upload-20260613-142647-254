(function () {
    "use strict";

    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
        var activeIndex = 0;
        var timer = null;

        function showHero(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle("is-active", thumbIndex === activeIndex);
            });
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showHero(activeIndex + 1);
            }, 6500);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener("click", function () {
                stopHero();
                showHero(index);
                startHero();
            });
        });

        hero.addEventListener("mouseenter", stopHero);
        hero.addEventListener("mouseleave", startHero);
        showHero(0);
        startHero();
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    filterInputs.forEach(function (input) {
        var selector = input.getAttribute("data-filter-input");
        var target = selector ? document.querySelector(selector) : null;
        var empty = document.querySelector(input.getAttribute("data-filter-empty") || "");
        if (!target) {
            return;
        }
        var cards = Array.prototype.slice.call(target.querySelectorAll("[data-filter-card]"));
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
                var matched = !query || text.indexOf(query) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        });
    });

    window.setupMoviePlayer = function (video, overlay, sourceUrl) {
        if (!video || !sourceUrl) {
            return;
        }

        var loaded = false;
        var hls = null;

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function begin() {
            loadVideo();
            if (overlay) {
                overlay.classList.add("is-hidden");
                overlay.setAttribute("aria-hidden", "true");
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", begin);
        }

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
                overlay.setAttribute("aria-hidden", "true");
            }
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
