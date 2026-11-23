/* MAISON ÉLAN — scroll-controlled living-room animation (canvas)
   300 frames from the supplied ZIP: assets/animation/frame_0001.jpg … frame_0300.jpg */
(function () {
  "use strict";
  var hero = document.querySelector("[data-hero]");
  if (!hero) return;

  var TOTAL = 300, DIR = "assets/animation/frame_";
  var stage = hero.querySelector(".hero__stage");
  var wrap = hero.querySelector(".hero__canvas-wrap");
  var canvas = hero.querySelector("canvas");
  var ctx = canvas.getContext("2d", { alpha: false });
  var loader = hero.querySelector(".hero__loader");
  var bar = hero.querySelector(".hero__progress i");
  var intro = hero.querySelector(".hero__layer--intro");
  var outro = hero.querySelector(".hero__layer--outro");
  var cue = hero.querySelector(".hero__scroll-cue");

  function src(n) { return DIR + ("000" + n).slice(-4) + ".jpg"; }

  /* ----- Decide mode ----- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn = navigator.connection || {};
  var lowPower = conn.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  var staticMode = reduce || lowPower;
  var small = window.matchMedia("(max-width: 899px), (pointer: coarse)").matches;
  var STEP = small ? 2 : 1;               // phones/tablets load every 2nd frame (150) to save memory & data

  var order = [];                         // frame numbers used, in strict numerical order
  for (var n = 1; n <= TOTAL; n += STEP) order.push(n);
  if (order[order.length - 1] !== TOTAL) order.push(TOTAL);
  var N = order.length;
  var frames = new Array(N);              // Image objects (or undefined until loaded)
  var failed = false;

  /* ----- Canvas drawing ----- */
  var cw = 0, ch = 0, lastDrawn = -1, lastIdx = -1, curIdx = 0;
  function resize() {
    var r = wrap.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = Math.max(1, Math.round(r.width * dpr)); ch = Math.max(1, Math.round(r.height * dpr));
    canvas.width = cw; canvas.height = ch; lastDrawn = -1;
    draw(Math.round(cur));
  }
  function nearest(i) {                    // never leave a blank frame: use closest loaded one
    if (frames[i]) return frames[i];
    for (var d = 1; d < N; d++) {
      if (i - d >= 0 && frames[i - d]) return frames[i - d];
      if (i + d < N && frames[i + d]) return frames[i + d];
    }
    return null;
  }
  function draw(i) {
    var img = nearest(i); if (!img) return;
    curIdx = i;
    if (img === lastDrawn && !(cw / ch < 1.7 && lastIdx !== i)) return; lastDrawn = img; lastIdx = i;
    var iw = img.naturalWidth, ih = img.naturalHeight, ca = cw / ch, ia = iw / ih;
    var sw = iw, sh = ih, sx = 0, sy = 0, dx = 0, dy = 0, dw = cw, dh = ch;
    if (ca > 2.1) {                        // ultra-wide: contain, avoid excessive cropping
      dh = ch; dw = ch * ia; dx = (cw - dw) / 2;
      ctx.fillStyle = "#292724"; ctx.fillRect(0, 0, cw, ch);
    } else if (ca > ia) { sh = iw / ca; sy = (ih - sh) * 0.55; }     // cover (crop top/bottom)
    else if (ca < ia) { sw = ih * ca; sx = (iw - sw) * (0.3 + 0.4 * (curIdx / Math.max(1, N - 1))); }  // cover (crop sides), gentle pan follows the scroll
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  /* ----- Loading ----- */
  function load(i) {
    return new Promise(function (res) {
      var im = new Image(); im.decoding = "async";
      im.onload = function () { frames[i] = im; res(true); };
      im.onerror = function () { res(false); };
      im.src = src(order[i]);
    });
  }
  function showError() { failed = true; hero.classList.add("is-error"); loader.classList.add("is-hidden"); }

  var cur = 0, target = 0, raf = 0;

  function begin() {
    // 1) essential opening frames first
    var ESSENTIAL = Math.min(10, N), first = [];
    for (var i = 0; i < ESSENTIAL; i++) first.push(load(i));
    first[0].then(function (ok) {
      if (!ok) { showError(); return; }
      resize(); loader.classList.add("is-hidden");
    });
    if (staticMode) return;
    Promise.all(first).then(function () {
      // 2) progressively load the rest, 6 at a time, in order
      var next = ESSENTIAL, active = 0, MAX = 6;
      (function pump() {
        while (active < MAX && next < N) {
          active++; load(next++).then(function () { active--; pump(); });
        }
      })();
    });
  }

  /* ----- Scroll → progress ----- */
  function progress() {
    var r = hero.getBoundingClientRect(), range = hero.offsetHeight - stage.offsetHeight;
    return range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
  }
  function layers(p) {
    var off = p > 0.07;
    intro.classList.toggle("is-off", off);
    outro.classList.toggle("is-off", p < 0.93);
    stage.classList.toggle("is-scrolled", p > 0.02);
    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
  }
  function tick() {
    raf = 0;
    var diff = target - cur;
    if (Math.abs(diff) > 0.05) { cur += diff * 0.2; raf = requestAnimationFrame(tick); } else cur = target;
    draw(Math.round(cur));
  }
  function onScroll() {
    var p = progress(); layers(p); target = p * (N - 1);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  if (staticMode) {
    hero.classList.add("is-static");
    outro.classList.add("is-off");
  } else {
    window.addEventListener("scroll", onScroll, { passive: true });
    layers(0);
  }
  function headerState() {
    var hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 70;
    document.documentElement.classList.toggle("on-hero", hero.getBoundingClientRect().bottom > hh + 1);
  }
  window.addEventListener("scroll", headerState, { passive: true }); headerState();
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (!staticMode) onScroll(); }, 120); });
  window.addEventListener("orientationchange", function () { setTimeout(resize, 250); });
  begin();
  if (!staticMode) onScroll();
})();
