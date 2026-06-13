(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
    };

    var startTimer = function () {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';
  var scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach(function (scope) {
    var searchInput = scope.querySelector('[data-search-input]');
    var yearFilter = scope.querySelector('[data-year-filter]');
    var typeFilter = scope.querySelector('[data-type-filter]');
    var regionFilter = scope.querySelector('[data-region-filter]');
    var controls = scope.querySelectorAll('[data-filter-control]');
    var cards = scope.querySelectorAll('[data-movie-card]');

    if (searchInput && queryFromUrl && !searchInput.value) {
      searchInput.value = queryFromUrl;
    }

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var updateCards = function () {
      var query = normalize(searchInput ? searchInput.value : '');
      var year = normalize(yearFilter ? yearFilter.value : '');
      var type = normalize(typeFilter ? typeFilter.value : '');
      var region = normalize(regionFilter ? regionFilter.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedYear = !year || cardYear === year;
        var matchedType = !type || cardType === type;
        var matchedRegion = !region || cardRegion === region;

        card.hidden = !(matchedQuery && matchedYear && matchedType && matchedRegion);
      });
    };

    controls.forEach(function (control) {
      control.addEventListener('input', updateCards);
      control.addEventListener('change', updateCards);
    });

    updateCards();
  });
})();
