(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }

    var groups = new Map();
    items.forEach(function (el) {
      var key = el.parentElement;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var siblings = groups.get(el.parentElement) || [];
          var index = siblings.indexOf(el);
          el.style.setProperty("--delay", Math.min(index, 5) * 70 + "ms");
          el.classList.add("is-in");
          observer.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initLightbox() {
    var box = document.getElementById("lightbox");
    if (!box) return;

    var view = box.querySelector(".lightbox__img");
    var scope = document.querySelectorAll(".gallery__item, .sew__item, .books__item");
    var shots = [];
    var last = null;
    var current = -1;

    scope.forEach(function (item) {
      var img = item.querySelector("img");
      if (!img) return;
      var index = shots.length;
      shots.push(img);
      item.classList.add("zoomable");
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", "View photo: " + img.alt);
      item.addEventListener("click", function () {
        open(index, item);
      });
      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(index, item);
        }
      });
    });

    if (!shots.length) return;

    function show(index) {
      current = (index + shots.length) % shots.length;
      var img = shots[current];
      var source = img.parentElement.querySelector("source");
      if (source) {
        view.srcset = source.srcset;
        view.sizes = "92vw";
      }
      view.src = img.currentSrc || img.src;
      view.alt = img.alt;
    }

    function open(index, origin) {
      last = origin;
      show(index);
      box.hidden = false;
      document.body.classList.add("is-locked");
      requestAnimationFrame(function () {
        box.classList.add("is-open");
      });
      box.querySelector(".lightbox__btn--close").focus();
    }

    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      window.setTimeout(
        function () {
          box.hidden = true;
          view.removeAttribute("src");
          view.removeAttribute("srcset");
          if (last) last.focus();
        },
        reduced ? 0 : 260
      );
    }

    box.addEventListener("click", function (event) {
      var action = event.target.getAttribute("data-lb");
      if (action === "next") show(current + 1);
      else if (action === "prev") show(current - 1);
      else if (action === "close" || event.target === box) close();
    });

    document.addEventListener("keydown", function (event) {
      if (box.hidden) return;
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") show(current + 1);
      else if (event.key === "ArrowLeft") show(current - 1);
      else if (event.key === "Tab") {
        var focusable = box.querySelectorAll("button");
        var first = focusable[0];
        var lastBtn = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          lastBtn.focus();
        } else if (!event.shiftKey && document.activeElement === lastBtn) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  function initSmoothLinks() {
    document.querySelectorAll('a[href^="#"]:not(.skip)').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = link.getAttribute("href").slice(1);
        var target = id ? document.getElementById(id) : null;
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", "#" + id);
      });
    });
  }

  initReveal();
  initLightbox();
  initSmoothLinks();
})();
