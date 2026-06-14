/* =========================================================
   Causal Insight Agency — interactions
   Reveal engine is scroll-based (works everywhere) with
   guaranteed fallbacks so content is never left hidden.
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- collect animated nodes ---------- */
  const revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  const counters = Array.prototype.slice.call(document.querySelectorAll(".num[data-count]"));
  const gapLayout = document.querySelector(".gap__layout");

  /* ---------- nav: scrolled state + progress bar ---------- */
  const nav = document.getElementById("nav");
  const progressBar = document.getElementById("progressBar");

  /* ---------- counter animation ---------- */
  function animateCount(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    const target = parseFloat(el.getAttribute("data-count"));
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";

    if (prefersReduced) { el.textContent = prefix + target + suffix; return; }

    const dur = 1400;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ---------- the reveal engine ---------- */
  let matrixDone = false;
  function inViewport(el, ratioFromBottom) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * ratioFromBottom && r.bottom > 0;
  }

  function checkReveals() {
    for (let i = revealEls.length - 1; i >= 0; i--) {
      const el = revealEls[i];
      if (inViewport(el, 0.92)) {
        el.classList.add("is-visible");
        revealEls.splice(i, 1);
      }
    }
    for (let i = counters.length - 1; i >= 0; i--) {
      const el = counters[i];
      if (inViewport(el, 0.85)) {
        animateCount(el);
        counters.splice(i, 1);
      }
    }
    if (!matrixDone && gapLayout && inViewport(gapLayout, 0.75)) {
      gapLayout.classList.add("in-view");
      matrixDone = true;
    }
  }

  /* ---------- scroll handler (rAF-throttled) ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const y = window.scrollY || window.pageYOffset || 0;
      if (nav) nav.classList.toggle("is-scrolled", y > 24);
      if (progressBar) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (h > 0 ? (y / h) * 100 : 0).toFixed(2) + "%";
      }
      checkReveals();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // reduced motion: just show everything
  if (prefersReduced) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    counters.forEach(function (el) { animateCount(el); });
    if (gapLayout) gapLayout.classList.add("in-view");
  } else {
    // initial pass (covers everything already in view at load)
    checkReveals();
    // a few delayed passes catch late layout/font shifts without needing a scroll
    setTimeout(checkReveals, 60);
    setTimeout(checkReveals, 300);
    window.addEventListener("load", checkReveals);
    // ultimate safety net: if anything is still hidden/un-counted after 3s, force final state
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
      if (gapLayout) gapLayout.classList.add("in-view");
      document.querySelectorAll(".num[data-count]").forEach(function (el) {
        el.textContent = (el.getAttribute("data-prefix") || "") + el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
      });
    }, 3000);
  }
  onScroll();

  /* ---------- mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav__mobile a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- smooth-scroll with fixed-nav offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      const id = a.getAttribute("href");
      if (id === "#" || id === "#top") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---------- hero canvas: drifting correlation cloud + fitted line ---------- */
  const canvas = document.getElementById("heroCanvas");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let points = [];
    let raf = null;
    let running = false;
    const mouse = { x: -9999, y: -9999 };
    const GREEN = "21,160,90";   /* green points */
    const GREEN_DEEP = "14,123,67";   /* deeper green accents */

    function resize() {
      w = canvas.clientWidth || canvas.offsetWidth;
      h = canvas.clientHeight || canvas.offsetHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      const count = Math.max(26, Math.min(64, Math.floor(w / 26)));
      points = [];
      for (let i = 0; i < count; i++) {
        const t = Math.random();
        points.push({
          x: t * w,
          y: h - (t * h * 0.66) - h * 0.12 + (Math.random() - 0.5) * h * 0.34,
          r: Math.random() * 1.8 + 1.0,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          accent: Math.random() < 0.12
        });
      }
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // links between near points
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 13000) {
            ctx.strokeStyle = "rgba(" + GREEN + "," + (1 - d2 / 13000) * 0.16 + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // least-squares fit line
      const n = points.length;
      let sx = 0, sy = 0, sxy = 0, sxx = 0;
      for (const p of points) { sx += p.x; sy += p.y; sxy += p.x * p.y; sxx += p.x * p.x; }
      const denom = n * sxx - sx * sx;
      if (denom !== 0) {
        const slope = (n * sxy - sx * sy) / denom;
        const intercept = (sy - slope * sx) / n;
        ctx.strokeStyle = "rgba(" + GREEN_DEEP + ",0.5)";
        ctx.lineWidth = 2; ctx.setLineDash([7, 7]);
        ctx.beginPath(); ctx.moveTo(0, intercept); ctx.lineTo(w, slope * w + intercept); ctx.stroke();
        ctx.setLineDash([]);
      }

      // points
      for (const p of points) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const ddx = p.x - mouse.x, ddy = p.y - mouse.y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120 * 1.4;
          p.x += (ddx / dist) * force; p.y += (ddy / dist) * force;
        }
        const color = p.accent ? GREEN_DEEP : GREEN;
        ctx.fillStyle = "rgba(" + color + ",0.9)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(" + color + ",0.10)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    function start() { if (!running) { running = true; raf = requestAnimationFrame(draw); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    const heroEl = document.querySelector(".hero");
    if (heroEl) {
      heroEl.addEventListener("mousemove", function (ev) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ev.clientX - rect.left; mouse.y = ev.clientY - rect.top;
      });
      heroEl.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });
    }

    // pause the loop when the hero scrolls out of view (cheap, scroll-based)
    window.addEventListener("scroll", function () {
      if (!heroEl) return;
      const past = heroEl.getBoundingClientRect().bottom < 0;
      if (past) stop(); else start();
    }, { passive: true });

    let rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 180); });

    resize();
    start();
  }
})();
