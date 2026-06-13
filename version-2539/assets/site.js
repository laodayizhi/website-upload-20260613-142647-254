(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-site-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
        });
        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                menu.classList.remove("is-open");
                document.body.classList.remove("menu-open");
            });
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            if (!document.hidden) {
                show(current + 1);
            }
        }, 5200);
    }

    function setupFilters() {
        document.querySelectorAll("[data-card-scope]").forEach(function (scope) {
            var search = scope.querySelector("[data-card-search]");
            var region = scope.querySelector("[data-region-filter]");
            var type = scope.querySelector("[data-type-filter]");
            var year = scope.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            function apply() {
                var q = search ? search.value.trim().toLowerCase() : "";
                var r = region ? region.value : "";
                var t = type ? type.value : "";
                var y = year ? year.value : "";
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ").toLowerCase();
                    var matched = true;
                    if (q && text.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (r && card.getAttribute("data-region") !== r) {
                        matched = false;
                    }
                    if (t && card.getAttribute("data-type") !== t) {
                        matched = false;
                    }
                    if (y && card.getAttribute("data-year") !== y) {
                        matched = false;
                    }
                    card.hidden = !matched;
                });
            }
            [search, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            if (search) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    search.value = q;
                    apply();
                }
            }
        });
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback(window.Hls);
            return;
        }
        var active = document.querySelector("script[data-hls-active]");
        if (active) {
            active.addEventListener("load", function () {
                callback(window.Hls);
            });
            active.addEventListener("error", function () {
                callback(null);
            });
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js";
        script.setAttribute("data-hls-active", "true");
        script.onload = function () {
            callback(window.Hls);
        };
        script.onerror = function () {
            callback(null);
        };
        document.head.appendChild(script);
    }

    window.setupMoviePlayer = function (address) {
        ready(function () {
            var video = document.querySelector("[data-player-video]");
            var cover = document.querySelector("[data-player-cover]");
            if (!video || !cover || !address) {
                return;
            }
            var connected = false;
            var hlsInstance = null;
            function connect(done) {
                if (connected) {
                    done();
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = address;
                    connected = true;
                    done();
                    return;
                }
                loadHls(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(address);
                        hlsInstance.attachMedia(video);
                        connected = true;
                        done();
                    } else {
                        video.src = address;
                        connected = true;
                        done();
                    }
                });
            }
            function start() {
                cover.classList.add("is-hidden");
                connect(function () {
                    var playPromise = video.play();
                    if (playPromise && playPromise.catch) {
                        playPromise.catch(function () {});
                    }
                });
            }
            cover.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
