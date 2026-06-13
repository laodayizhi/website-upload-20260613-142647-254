(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var switchSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }
            slides[index].classList.remove('is-active');
            if (dots[index]) {
                dots[index].classList.remove('is-active');
            }
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add('is-active');
            if (dots[index]) {
                dots[index].classList.add('is-active');
            }
        };
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                switchSlide(dotIndex);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                switchSlide(index + 1);
            }, 5200);
        }
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('.movie-filter-form'));
    filterForms.forEach(function (form) {
        var scopeId = form.getAttribute('data-filter-scope');
        var scope = scopeId ? document.getElementById(scopeId) : null;
        if (!scope) {
            return;
        }
        var input = form.querySelector('input[name="keyword"]');
        var category = form.querySelector('select[name="category"]');
        var year = form.querySelector('select[name="year"]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
        var empty = scope.querySelector('[data-empty-state]');
        var normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };
        var apply = function () {
            var query = normalize(input && input.value);
            var selectedCategory = normalize(category && category.value);
            var selectedYear = parseInt(year && year.value, 10);
            var visibleCount = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var cardCategory = normalize(card.getAttribute('data-category'));
                var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesCategory = !selectedCategory || cardCategory === selectedCategory;
                var matchesYear = !selectedYear || cardYear >= selectedYear;
                var visible = matchesQuery && matchesCategory && matchesYear;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        };
        form.addEventListener('input', apply);
        form.addEventListener('change', apply);
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var url = player.getAttribute('data-video-url');
        var started = false;
        var start = function () {
            if (!video || !url) {
                return;
            }
            if (!started) {
                started = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            hls.destroy();
                            video.src = url;
                            video.play().catch(function () {});
                        }
                    });
                    video._hlsInstance = hls;
                } else {
                    video.src = url;
                    video.play().catch(function () {});
                }
                video.setAttribute('controls', 'controls');
                player.classList.add('is-playing');
            } else {
                video.play().catch(function () {});
                player.classList.add('is-playing');
            }
        };
        if (button) {
            button.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    start();
                }
            });
            video.addEventListener('pause', function () {
                if (video.currentTime > 0 && !video.ended) {
                    player.classList.remove('is-playing');
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        }
    });
})();
