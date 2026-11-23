/* MAISON ÉLAN — site-wide behaviour */
(function () {
  "use strict";
  var CFG = window.MAISON_CONFIG || {};
  var digits = String(CFG.phoneNumber || "").replace(/\D/g, "");
  var phoneOk = digits.length === 10;
  var cc = String(CFG.countryCode || "91").replace(/\D/g, "");
  var full = cc + digits;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Toast ---------- */
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast"; toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg; toastEl.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 5200);
  }
  window.MaisonToast = toast;

  /* ---------- Apply configuration ---------- */
  var waUrl = "https://wa.me/" + full + "?text=" + encodeURIComponent(CFG.whatsappMessage || "");
  var notSet = "Our phone number hasn't been added yet. Please use the enquiry form or email for now.";

  $$("[data-action='call']").forEach(function (a) {
    if (phoneOk) { a.href = "tel:+" + full; a.removeAttribute("target"); }
    else a.addEventListener("click", function (e) { e.preventDefault(); toast(notSet); });
  });
  $$("[data-action='whatsapp']").forEach(function (a) {
    if (phoneOk) { a.href = waUrl; a.target = "_blank"; a.rel = "noopener noreferrer"; }
    else a.addEventListener("click", function (e) { e.preventDefault(); toast(notSet); });
  });
  $$("[data-cfg='phone']").forEach(function (el) {
    if (phoneOk) {
      el.textContent = "+" + cc + " " + digits.slice(0, 5) + " " + digits.slice(5);
    } else { el.textContent = "Number coming soon"; }
  });
  $$("[data-cfg='email']").forEach(function (el) {
    el.href = "mailto:" + CFG.email;
    if (el.hasAttribute("data-show")) el.textContent = CFG.email;
  });
  $$("[data-cfg='location']").forEach(function (el) { el.textContent = CFG.locationText; });
  $$("[data-cfg='hours']").forEach(function (el) { el.textContent = CFG.hours; });
  $$("[data-social]").forEach(function (a) {
    var url = CFG.social && CFG.social[a.getAttribute("data-social")];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; }
    else {
      a.classList.add("is-unset"); a.removeAttribute("href"); a.setAttribute("role", "link"); a.setAttribute("aria-disabled", "true");
      a.addEventListener("click", function (e) { e.preventDefault(); toast("This social profile link hasn't been set up yet."); });
    }
  });
  var q = encodeURIComponent(CFG.mapsQuery || CFG.locationText || "");
  $$("[data-cfg='directions']").forEach(function (a) { a.href = "https://www.google.com/maps/dir/?api=1&destination=" + q; a.target = "_blank"; a.rel = "noopener noreferrer"; });
  var map = $("[data-cfg='map']");
  if (map) map.src = "https://maps.google.com/maps?q=" + q + "&z=13&output=embed";
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Mobile navigation ---------- */
  var toggle = $(".nav-toggle"), nav = $("#site-nav");
  function setNav(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setNav(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); toggle.focus(); } });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (m) { if (m.matches) setNav(false); });
    // hide closed mobile menu from keyboard/AT
    var mq = window.matchMedia("(max-width: 899px)");
    var sync = function () { if (mq.matches && !nav.classList.contains("is-open")) nav.setAttribute("inert", ""); else nav.removeAttribute("inert"); };
    new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ["class"] });
    mq.addEventListener("change", sync); sync();
  }

  /* ---------- Image loading states (never substitutes another image) ---------- */
  $$(".img-wrap").forEach(function (wrap) {
    var img = $("img", wrap); if (!img) return;
    function ok() { wrap.classList.add("is-loaded"); }
    function fail() {
      wrap.classList.add("is-error");
      if (!$(".img-fail", wrap)) {
        var s = document.createElement("span"); s.className = "img-fail";
        s.textContent = "This photograph could not be loaded. Please check your connection and refresh."; wrap.appendChild(s);
      }
    }
    if (img.complete) { img.naturalWidth ? ok() : fail(); }
    else { img.addEventListener("load", ok, { once: true }); img.addEventListener("error", fail, { once: true }); }
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Consultation form ---------- */
  var form = $("#enquiry-form");
  if (form) {
    var status = $("#form-status"), submitting = false, btn = $("button[type='submit']", form);
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your full name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."; },
      phone: function (v) { var d = v.replace(/[\s\-()+]/g, ""); return /^\d{10,13}$/.test(d) ? "" : "Please enter a valid phone number (10 digits)."; },
      service: function (v) { return v ? "" : "Please choose a service."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Please tell us a little about your project (at least 10 characters)."; }
    };
    function check(field) {
      var el = form.elements[field], wrap = el.closest(".field"), err = $(".field__error", wrap);
      var msg = rules[field] ? rules[field](el.value) : "";
      err.textContent = msg; wrap.classList.toggle("has-error", !!msg);
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }
    Object.keys(rules).forEach(function (f) {
      var el = form.elements[f];
      el.addEventListener("blur", function () { check(f); });
      el.addEventListener("input", function () { if (el.closest(".field").classList.contains("has-error")) check(f); });
    });
    function show(kind, msg) {
      status.hidden = false; status.className = "form-status form-status--" + kind; status.textContent = msg; status.focus();
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitting) return;
      status.hidden = true;
      var firstBad = null;
      Object.keys(rules).forEach(function (f) { if (!check(f) && !firstBad) firstBad = form.elements[f]; });
      if (firstBad) { firstBad.focus(); return; }
      if (form.elements["company_website"].value) return; // honeypot
      if (!CFG.formEndpoint) {
        show("err", "Online enquiries aren't connected yet, so your message has NOT been sent. Please call, WhatsApp or email us directly using the details on this page.");
        return;
      }
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) { if (el.name && el.name !== "company_website") data[el.name] = el.value.trim(); });
      Object.keys(CFG.formExtraFields || {}).forEach(function (k) { data[k] = CFG.formExtraFields[k]; });
      data._subject = "New consultation enquiry — " + data.service;
      submitting = true; btn.disabled = true; var label = btn.textContent; btn.textContent = "Sending…";
      fetch(CFG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === false) throw new Error("bad"); }); })
        .then(function () { form.reset(); show("ok", "Thank you — your enquiry has been received. Our studio will be in touch within working hours."); })
        .catch(function () { show("err", "Sorry, your enquiry could not be sent. Please try again, or call, WhatsApp or email us directly."); })
        .then(function () { submitting = false; btn.disabled = false; btn.textContent = label; });
    });
  }
})();
