(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function norm(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    show(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var textInput = scope.querySelector("[data-filter-input]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
      var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
      var empty = scope.querySelector("[data-empty-state]");
      function apply() {
        var keyword = textInput ? norm(textInput.value) : "";
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute("data-filter-select")] = norm(select.value);
        });
        var visible = 0;
        items.forEach(function (item) {
          var text = norm(item.getAttribute("data-text"));
          var matched = !keyword || text.indexOf(keyword) !== -1;
          Object.keys(filters).forEach(function (key) {
            if (!filters[key]) {
              return;
            }
            matched = matched && norm(item.getAttribute("data-" + key)) === filters[key];
          });
          item.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      if (textInput) {
        textInput.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(url) {
  var video = document.getElementById("movie-video");
  var overlay = document.getElementById("movie-play-overlay");
  var shell = document.getElementById("movie-player-shell");
  var started = false;
  var hlsInstance = null;

  if (!video || !url) {
    return;
  }

  function runPlay() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function attach() {
    if (started) {
      runPlay();
      return;
    }
    started = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.setAttribute("controls", "controls");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      runPlay();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MEDIA_ATTACHED, function () {
        hlsInstance.loadSource(url);
      });
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        runPlay();
      });
      return;
    }
    video.src = url;
    runPlay();
  }

  if (overlay) {
    overlay.addEventListener("click", function (event) {
      event.preventDefault();
      attach();
    });
  }
  if (shell) {
    shell.addEventListener("click", function (event) {
      if (event.target === shell) {
        attach();
      }
    });
  }
  video.addEventListener("click", function () {
    if (!started) {
      attach();
    }
  });
}
