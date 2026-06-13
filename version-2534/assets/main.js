(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle("is-active", pos === index);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle("is-active", pos === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        start();
    }

    function setupImageState() {
        Array.prototype.forEach.call(document.querySelectorAll("img"), function (image) {
            image.addEventListener("error", function () {
                var parent = image.parentElement;
                image.style.display = "none";
                if (parent) {
                    parent.classList.add("is-missing");
                }
            }, { once: true });
        });
    }

    function setupCategoryFilter() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var keywordInput = panel.querySelector("[data-filter-keyword]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".category-list .movie-card"));
        var empty = document.querySelector("[data-empty-result]");

        function applyFilter() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre")
                ].join(" ").toLowerCase();
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || card.getAttribute("data-year") === year;
                var matched = matchedKeyword && matchedYear;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (keywordInput) {
            keywordInput.addEventListener("input", applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilter);
        }
    }

    function createCard(movie) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.setAttribute("data-title", movie.title || "");
        article.setAttribute("data-year", movie.year || "");
        article.setAttribute("data-region", movie.region || "");
        article.setAttribute("data-type", movie.type || "");
        article.setAttribute("data-genre", movie.genre || "");
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        article.innerHTML = "" +
            "<a class="poster-link" href="./" + movie.file + "" aria-label="" + escapeHtml(movie.title) + "">" +
                "<img src="" + movie.cover + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
                "<span class="card-year">" + escapeHtml(movie.year) + "</span>" +
                "<span class="card-score">" + escapeHtml(movie.rating) + "</span>" +
            "</a>" +
            "<div class="card-body">" +
                "<h3><a href="./" + movie.file + "">" + escapeHtml(movie.title) + "</a></h3>" +
                "<p class="card-meta">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</p>" +
                "<p class="card-desc">" + escapeHtml(movie.description || "") + "</p>" +
                "<div class="tag-row">" + tags + "</div>" +
            "</div>";
        return article;
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                """: "&quot;"
            }[char];
        });
    }

    function setupSearch() {
        var results = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-input]");
        var title = document.querySelector("[data-search-title]");
        var empty = document.querySelector("[data-search-empty]");
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }
        if (!query.trim()) {
            return;
        }
        var terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        var matched = window.SEARCH_INDEX.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.genre, movie.year, (movie.tags || []).join(" ")].join(" ").toLowerCase();
            return terms.every(function (term) {
                return text.indexOf(term) !== -1;
            });
        }).slice(0, 120);
        results.innerHTML = "";
        matched.forEach(function (movie) {
            results.appendChild(createCard(movie));
        });
        setupImageState();
        if (title) {
            title.textContent = "“" + query + "” 的搜索结果";
        }
        if (empty) {
            empty.classList.toggle("is-visible", matched.length === 0);
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupImageState();
        setupCategoryFilter();
        setupSearch();
    });
})();
