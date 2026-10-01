// Copy marketing site, small progressive-enhancement behaviors.
// No analytics, no network calls, no external libraries.
(function () {
  "use strict";

  // Copy-to-clipboard for the Homebrew command chips.
  document.querySelectorAll("[data-copy]").forEach(function (button) {
    var defaultLabel = button.textContent;
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy");
      var done = function () {
        button.textContent = "Copied";
        button.classList.add("is-copied");
        window.setTimeout(function () {
          button.textContent = defaultLabel;
          button.classList.remove("is-copied");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      } else {
        fallbackCopy(text);
        done();
      }
    });
  });

  // The demo video: plays silently on its own, pauses while it is off screen, and the
  // sound button unmutes it. Under Reduce Motion nothing autoplays; a play button shows.
  var demo = document.querySelector("[data-demo]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (demo) {
    var video = demo.querySelector("video");
    var play = demo.querySelector("[data-demo-play]");
    var sound = demo.querySelector("[data-demo-sound]");
    var soundLabel = demo.querySelector("[data-demo-sound-label]");
    var showPlay = function () { play.hidden = false; };
    var hidePlay = function () { play.hidden = true; };
    var tryPlay = function () {
      var p = video.play();
      if (p && p.catch) { p.catch(showPlay); }
    };
    if (reduce) {
      showPlay();
    } else {
      tryPlay();
    }
    play.addEventListener("click", function () { hidePlay(); tryPlay(); });
    video.addEventListener("play", hidePlay);
    sound.addEventListener("click", function () {
      video.muted = !video.muted;
      sound.setAttribute("aria-pressed", video.muted ? "false" : "true");
      soundLabel.textContent = video.muted ? "Sound off" : "Sound on";
      if (!video.muted) { video.currentTime = 0; tryPlay(); }
    });
    if ("IntersectionObserver" in window && !reduce) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { if (video.paused && play.hidden) { tryPlay(); } }
          else if (!video.paused) { video.pause(); }
        });
      }, { threshold: 0.25 }).observe(video);
    }
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "absolute";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } catch (err) { /* no-op */ }
    document.body.removeChild(area);
  }
})();
