/* MAISON ÉLAN — portfolio lightbox (click, keyboard, touch swipe) */
(function () {
  "use strict";
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (!items.length) return;

  var icons = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M15 4l-8 8 8 8"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 4l8 8-8 8"/></svg>'
  };
  var lb = document.createElement("div");
  lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Project image viewer");
  lb.innerHTML =
    '<div class="lightbox__stage">' +
      '<span class="lightbox__count" aria-live="polite"></span>' +
      '<button type="button" class="lightbox__btn lightbox__close" aria-label="Close viewer">' + icons.close + '</button>' +
      '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Previous project">' + icons.prev + '</button>' +
      '<img class="lightbox__img" alt="">' +
      '<p class="lightbox__fail" hidden>This photograph could not be loaded.</p>' +
      '<button type="button" class="lightbox__btn lightbox__next" aria-label="Next project">' + icons.next + '</button>' +
    '</div>' +
    '<div class="lightbox__cap"><h2></h2><p></p></div>';
  document.body.appendChild(lb);

  var img = lb.querySelector(".lightbox__img"), fail = lb.querySelector(".lightbox__fail");
  var title = lb.querySelector("h2"), sub = lb.querySelector(".lightbox__cap p"), count = lb.querySelector(".lightbox__count");
  var closeBtn = lb.querySelector(".lightbox__close"), prevBtn = lb.querySelector(".lightbox__prev"), nextBtn = lb.querySelector(".lightbox__next");
  var idx = 0, opener = null;

  function show(i) {
    idx = (i + items.length) % items.length;
    var it = items[idx], thumb = it.querySelector("img");
    img.classList.add("is-swap"); fail.hidden = true;
    var url = it.getAttribute("data-full");
    img.onload = function () { img.classList.remove("is-swap"); img.style.display = ""; };
    img.onerror = function () { img.style.display = "none"; fail.hidden = false; };
    img.src = url; img.alt = thumb ? thumb.alt : "";
    title.textContent = it.getAttribute("data-title") || "";
    sub.textContent = it.getAttribute("data-caption") || "";
    count.textContent = (idx + 1) + " / " + items.length;
    var one = items.length < 2; prevBtn.hidden = nextBtn.hidden = one;
  }
  function open(i, from) {
    opener = from; show(i); lb.classList.add("is-open"); document.body.style.overflow = "hidden"; closeBtn.focus();
  }
  function close() {
    lb.classList.remove("is-open"); document.body.style.overflow = ""; img.removeAttribute("src");
    if (opener) opener.focus();
  }
  items.forEach(function (it, i) { it.addEventListener("click", function (e) { e.preventDefault(); open(i, it); }); });
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () { show(idx - 1); });
  nextBtn.addEventListener("click", function () { show(idx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lightbox__stage")) close(); });

  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "Tab") {                       // focus trap
      var f = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
      var a = document.activeElement, k = f.indexOf(a);
      if (e.shiftKey && k <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && k === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  var sx = 0, sy = 0;                                  // touch swipe
  lb.addEventListener("touchstart", function (e) { sx = e.changedTouches[0].clientX; sy = e.changedTouches[0].clientY; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  if (location.hash) {                                  // deep link from home page: portfolio.html#the-aurelia-apartment
    var t = document.getElementById(location.hash.slice(1));
    if (t) setTimeout(function () { t.scrollIntoView({ block: "center" }); }, 50);
  }
})();
