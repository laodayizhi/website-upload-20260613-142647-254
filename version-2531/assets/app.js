(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var yearFilters = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));

  function applyFilter() {
    var query = '';
    var minYear = 0;

    filterInputs.forEach(function (input) {
      if (input.value.trim()) {
        query = input.value.trim().toLowerCase();
      }
    });

    yearFilters.forEach(function (select) {
      if (select.value) {
        minYear = Number(select.value);
      }
    });

    Array.prototype.slice.call(document.querySelectorAll('.filter-card')).forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var tags = (card.getAttribute('data-tags') || '').toLowerCase();
      var year = Number(card.getAttribute('data-year') || 0);
      var matchedText = !query || title.indexOf(query) > -1 || tags.indexOf(query) > -1 || String(year).indexOf(query) > -1;
      var matchedYear = !minYear || year >= minYear;
      card.classList.toggle('is-hidden', !(matchedText && matchedYear));
    });
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });

  yearFilters.forEach(function (select) {
    select.addEventListener('change', applyFilter);
  });
})();

function initDetailPlayer(source) {
  var shell = document.querySelector('.player-shell');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var cover = shell.querySelector('.player-cover');
  var hlsInstance = null;
  var started = false;

  function bindSource() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    bindSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (!started) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
