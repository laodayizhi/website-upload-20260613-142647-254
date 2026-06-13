(function () {
  var players = document.querySelectorAll('.player-wrap');

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var source = video ? video.querySelector('source') : null;
    var button = player.querySelector('.player-layer');
    var mediaUrl = source ? source.getAttribute('src') : '';
    var hls = null;
    var ready = false;

    var attachMedia = function () {
      if (!video || !mediaUrl || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }

      ready = true;
    };

    var playVideo = function () {
      attachMedia();
      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };

    if (button && video) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          playVideo();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
