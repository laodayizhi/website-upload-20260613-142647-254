(function () {
    function init(config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var source = config.source;
        var hls = null;

        if (!video || !button || !source) {
            return;
        }

        function bindSource() {
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function start() {
            button.classList.add("is-hidden");
            if (!video.src && !hls) {
                bindSource();
            }
            var playing = video.play();
            if (playing && typeof playing.catch === "function") {
                playing.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        bindSource();
        button.addEventListener("click", start);
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });
    }

    window.StaticPlayer = {
        init: init
    };
})();
