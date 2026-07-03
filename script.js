/* =========================================================
   Causal Insight — Discount Optimizer site interactions
   Reveal engine: IntersectionObserver with scroll fallback and
   a safety net so content is never left hidden.
   ========================================================= */
(function () {
  "use strict";

  // signals the inline head fallback that the engine loaded
  window.__ciEngine = true;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- intro curtain: html.intro decided pre-paint in <head>; just clean up ---------- */
  const curtain = document.getElementById("curtain");
  if (curtain) {
    setTimeout(function () { if (curtain.parentNode) curtain.remove(); }, 2200);
  }

  /* ---------- nav refs ---------- */
  const nav = document.getElementById("nav");
  const progressBar = document.getElementById("progressBar");

  /* ---------- counter animation (supports decimals) ---------- */
  function finalText(el) {
    const target = parseFloat(el.getAttribute("data-count"));
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    return prefix + target.toFixed(decimals) + suffix;
  }
  function animateCount(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    const target = parseFloat(el.getAttribute("data-count"));
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";

    if (prefersReduced) { el.textContent = finalText(el); return; }

    const dur = 1500;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = finalText(el);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- reveal engine ---------- */
  function revealEl(el) {
    el.classList.add("is-visible");
    // after the entrance settles, drop the stagger delay so hover feels immediate
    setTimeout(function () { el.classList.add("is-rested"); }, 1600);
    const donut = el.querySelector ? el.querySelector(".donut") : null;
    if (donut) donut.classList.add("in-view");
  }

  const revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  const counters = Array.prototype.slice.call(document.querySelectorAll(".num[data-count]"));

  if (prefersReduced) {
    revealEls.forEach(revealEl);
    counters.forEach(animateCount);
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealEl(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });

    const ioNum = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        ioNum.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.2 });
    counters.forEach(function (el) { ioNum.observe(el); });
  } else {
    // very old browsers: show everything
    revealEls.forEach(revealEl);
    counters.forEach(animateCount);
  }

  // safety net: nothing at or above the viewport stays hidden past 3.5s.
  // Below-fold content is left to the observer so scroll reveals still play.
  function aboveFold(el) {
    return el.getBoundingClientRect().top < (window.innerHeight || 800) * 1.05;
  }
  setTimeout(function () {
    document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach(function (el) {
      if (aboveFold(el)) revealEl(el);
    });
    document.querySelectorAll(".num[data-count]").forEach(function (el) {
      if (!el.dataset.counted && aboveFold(el)) { el.dataset.counted = "1"; el.textContent = finalText(el); }
    });
  }, 3500);

  /* ---------- scroll: nav state, progress, scrollspy (nav links + side dots) ---------- */
  const spyAnchors = Array.prototype.slice.call(
    document.querySelectorAll(".nav__links a[href^='#'], .dots a[href^='#']")
  );
  const spySections = [];
  (function () {
    const seen = {};
    spyAnchors.forEach(function (a) {
      const id = a.getAttribute("href");
      if (seen[id]) return;
      seen[id] = true;
      const el = document.querySelector(id);
      if (el) spySections.push(el);
    });
    spySections.sort(function (a, b) { return a.offsetTop - b.offsetTop; });
  })();

  /* ---------- scroll parallax (writes --py consumed by CSS) ---------- */
  const pxEls = prefersReduced
    ? []
    : Array.prototype.slice.call(document.querySelectorAll("[data-parallax], [data-parallax-var]"));
  function updateParallax() {
    if (!pxEls.length) return;
    const vh = window.innerHeight || 800;
    for (let i = 0; i < pxEls.length; i++) {
      const el = pxEls[i];
      const sp = parseFloat(el.getAttribute("data-parallax") || el.getAttribute("data-parallax-var")) || 0;
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      el.style.setProperty("--py", ((r.top + r.height / 2 - vh / 2) * sp).toFixed(1));
    }
  }

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
      // scrollspy
      let current = null;
      for (let i = 0; i < spySections.length; i++) {
        if (spySections[i].getBoundingClientRect().top <= 140) current = "#" + spySections[i].id;
      }
      spyAnchors.forEach(function (a) {
        const active = a.getAttribute("href") === current;
        a.classList.toggle("is-active", active);
        if (active) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
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

  /* ---------- magnetic buttons (custom props so :active press-scale composes) ---------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (ev) {
        const r = btn.getBoundingClientRect();
        const dx = ev.clientX - (r.left + r.width / 2);
        const dy = ev.clientY - (r.top + r.height / 2);
        btn.style.setProperty("--tx", (dx * 0.16).toFixed(1) + "px");
        btn.style.setProperty("--ty", (dy * 0.28).toFixed(1) + "px");
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.removeProperty("--tx");
        btn.style.removeProperty("--ty");
      });
    });
  }

  /* ---------- spotlight cards (cursor-following highlight) ---------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll(".spot").forEach(function (card) {
      card.addEventListener("pointermove", function (ev) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (ev.clientX - r.left) + "px");
        card.style.setProperty("--my", (ev.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- 3D tilt ---------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll(".tilt").forEach(function (el) {
      const MAX = 5; // degrees
      el.addEventListener("pointerenter", function () {
        el.dataset.prevAnim = el.style.animation;
        el.style.animation = "none"; // don't fight float/entrance animations
        el.style.transition = "transform .12s ease-out";
      });
      el.addEventListener("pointermove", function (ev) {
        const r = el.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5;
        const py = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          "perspective(1000px) rotateX(" + (-py * MAX).toFixed(2) + "deg) rotateY(" + (px * MAX).toFixed(2) + "deg)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transition = "transform .5s cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = "";
        el.style.animation = el.dataset.prevAnim || "";
      });
    });
  }

  /* ---------- animated Monday workbook ---------- */
  const wbRowsEl = document.getElementById("wbRows");
  if (wbRowsEl && !prefersReduced) {
    const rows = Array.prototype.slice.call(wbRowsEl.querySelectorAll(".wb-row"));
    const weekEl = document.getElementById("wbWeek");
    let week = 27;
    let idx = 0;
    let visible = false;
    let timer = null;

    function tickRow() {
      const row = rows[idx];
      const action = row.getAttribute("data-action");
      row.classList.add("is-updating");

      // nudge the recommended price for raise/invest rows
      const priceB = row.querySelector(".wb-row__price b");
      if (priceB && (action === "raise" || action === "invest")) {
        const m = priceB.textContent.match(/₹(\d+)/);
        if (m) {
          let val = parseInt(m[1], 10);
          const base = parseInt(row.dataset.base || String(val), 10);
          row.dataset.base = String(base);
          const delta = 1 + Math.floor(Math.random() * 3);
          val = action === "raise" ? val + delta : val - delta;
          // keep the drift within a believable band of the base price
          val = Math.max(base - 12, Math.min(base + 12, val));
          priceB.textContent = "₹" + val;
        }
      }

      setTimeout(function () { row.classList.remove("is-updating"); }, 1300);

      idx = (idx + 1) % rows.length;
      if (idx === 0 && weekEl) {
        week = week >= 52 ? 1 : week + 1;
        weekEl.textContent = "WEEK " + week;
      }
    }

    function startCycle() {
      if (timer || !visible) return;
      timer = setInterval(tickRow, 3000);
    }
    function stopCycle() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    if ("IntersectionObserver" in window) {
      const ioWb = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting;
          if (visible) startCycle(); else stopCycle();
        });
      }, { threshold: 0.2 });
      ioWb.observe(wbRowsEl);
    } else {
      visible = true;
      startCycle();
    }
  }

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
    const GREEN = "21,160,90";
    const GREEN_DEEP = "14,123,67";
    const spotEl = document.getElementById("heroSpot");
    let spotX = null, spotY = null;

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

      // cursor-following spotlight glow (lerped for a soft trail)
      if (spotEl && mouse.x > -999) {
        spotX = spotX === null ? mouse.x : spotX + (mouse.x - spotX) * 0.08;
        spotY = spotY === null ? mouse.y : spotY + (mouse.y - spotY) * 0.08;
        spotEl.style.setProperty("--hx", spotX.toFixed(1) + "px");
        spotEl.style.setProperty("--hy", spotY.toFixed(1) + "px");
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

    // pause the loop when the hero scrolls out of view
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
