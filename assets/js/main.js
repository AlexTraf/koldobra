/* ===== Коллайдер добра — interactions ===== */
(() => {
  "use strict";

  /* ---- nav scroll state ---- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- burger ---- */
  const burger = document.getElementById("burger");
  const links = document.getElementById("navLinks");
  burger.addEventListener("click", () => {
    links.classList.toggle("open");
    burger.classList.toggle("burger-open");
  });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open"); burger.classList.remove("burger-open");
  }));

  /* ---- cursor glow ---- */
  const glow = document.getElementById("cursorGlow");
  window.addEventListener("mousemove", e => {
    glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px";
  });

  /* ---- reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---- animated counters ---- */
  const counters = document.querySelectorAll("[data-count]");
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
      let cur = 0; const step = Math.max(1, Math.round(target / 40));
      const tick = () => { cur = Math.min(target, cur + step); el.textContent = cur + suffix;
        if (cur < target) requestAnimationFrame(tick); };
      tick(); cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => cio.observe(c));

  /* ---- donate amounts ---- */
  const amounts = document.getElementById("amounts");
  const payBtn = document.getElementById("payBtn");
  const monthly = document.getElementById("monthly");
  let sum = 1000;
  const renderPay = () => {
    payBtn.textContent = (monthly.checked ? "Поддерживать " : "Перевести ")
      + sum.toLocaleString("ru-RU") + " ₽" + (monthly.checked ? " / мес" : "");
  };
  amounts.addEventListener("click", e => {
    const b = e.target.closest(".amount"); if (!b) return;
    amounts.querySelectorAll(".amount").forEach(x => x.classList.remove("amount--on"));
    b.classList.add("amount--on");
    const m = b.textContent.match(/\d/);
    if (m) sum = parseInt(b.textContent.replace(/\D/g, ""), 10);
    else { const v = prompt("Введите сумму, ₽:", "2 500"); if (v) sum = parseInt(v.replace(/\D/g, ""), 10) || sum; }
    renderPay();
  });
  monthly.addEventListener("change", renderPay);
  payBtn.addEventListener("click", e => {
    e.preventDefault();
    payBtn.textContent = "✓ В проде здесь откроется оплата";
    setTimeout(renderPay, 1800);
  });
  renderPay();

  /* ---- калькулятор «процент вклада добра» (демо-модель) ---- */
  const calcBtn = document.getElementById("calcBtn");
  const out = document.getElementById("calcOut");
  const boardYou = document.getElementById("boardYou");

  const THEMES = [
    { k: ["дет", "ребен", "ребён", "школ", "площад", "сирот"], w: 1.35, tag: "дети" },
    { k: ["здоров", "лечен", "реабилит", "клиник", "болезн", "дцп", "инвалид"], w: 1.5, tag: "здоровье" },
    { k: ["эколог", "природ", "дерев", "животн", "приют"], w: 1.2, tag: "экология" },
    { k: ["образов", "учеб", "стипенд", "грант", "наук"], w: 1.25, tag: "образование" },
    { k: ["культур", "искусств", "фестив", "музе", "театр"], w: 1.1, tag: "культура" },
    { k: ["постро", "ремонт", "восстанов", "своими", "ресурс"], w: 1.3, tag: "дело" },
  ];

  function calc() {
    const text = (document.getElementById("deedText").value || "").toLowerCase();
    const money = Math.max(0, parseInt((document.getElementById("deedSum").value || "0"), 10) || 0);
    if (text.trim().length < 4 && money === 0) {
      out.innerHTML = `<div class="calc__placeholder"><div class="calc__big">0.0000<span>%</span></div>
        <p>Опишите дело или укажите сумму — и нажмите «Рассчитать»</p></div>`;
      return;
    }
    // вес тем
    let themeW = 1, found = [];
    THEMES.forEach(t => { if (t.k.some(k => text.includes(k))) { themeW = Math.max(themeW, t.w); found.push(t.tag); } });
    const nonMoney = /(своими|ресурс|постро|помог|органзиова|организова|руками|время|сам)/.test(text);
    // импакт-модель (привязка к РФ, демо): деньги + усилие
    const effort = Math.min(40, text.trim().split(/\s+/).length) * 120; // условный «рублёвый эквивалент» усилия
    const base = (money + (nonMoney ? effort * 1.6 : effort)) * themeW;
    // % вклада относительно условного годового «фонда добра РФ» ~ 1.2 трлн ₽
    const pct = Math.min(99.9, (base / 1_200_000_000_000) * 100);
    const people = Math.max(1, Math.round(base / 2500)); // ~2500 ₽ на человека
    const score = Math.min(99.9, 30 + Math.log10(base + 10) * 11 + themeW * 6).toFixed(1);

    let rank = "Участник добра";
    if (score > 55) rank = "Социально ответственный";
    if (score > 72) rank = "Лидер импакта";
    if (score > 86) rank = "Архитектор добра";

    const themeTxt = found.length ? `Темы: ${found.join(", ")}. ` : "";
    out.innerHTML = `
      <div class="calc__result">
        <div class="calc__rank">${rank}</div>
        <div class="calc__big">${pct.toFixed(4)}<span>%</span></div>
        <p class="calc__txt">${themeTxt}Ваш вклад уже коснулся <b>~${people.toLocaleString("ru-RU")}</b>
           ${people === 1 ? "человека" : "человек"}. Так из отдельных дел собирается коллайдер добра.</p>
        <div class="calc__metrics">
          <div><b>${score}</b><span>рейтинг отв.</span></div>
          <div><b>~${people.toLocaleString("ru-RU")}</b><span>охват, чел.</span></div>
          <div><b>${(themeW).toFixed(2)}×</b><span>коэф. темы</span></div>
        </div>
      </div>`;
    if (boardYou) boardYou.textContent = score;
  }
  calcBtn.addEventListener("click", calc);

  /* ---- collider canvas (hero) ---- */
  const cv = document.getElementById("collider");
  if (cv && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    const ctx = cv.getContext("2d");
    let w, h, cx, cy, parts = [], raf;
    const COLORS = ["#f0c46a", "#6fe3e8", "#9a8cff"];
    function resize() {
      w = cv.width = cv.offsetWidth * devicePixelRatio;
      h = cv.height = cv.offsetHeight * devicePixelRatio;
      cx = w / 2; cy = h / 2;
      const n = Math.min(90, Math.floor(w / 26));
      parts = Array.from({ length: n }, () => spawn());
    }
    function spawn() {
      const a = Math.random() * Math.PI * 2, r = Math.max(w, h) * (0.4 + Math.random() * 0.4);
      return { a, r, sp: 0.0008 + Math.random() * 0.0016, rad: 0.6 + Math.random() * 1.8,
        c: COLORS[(Math.random() * COLORS.length) | 0], o: 0.2 + Math.random() * 0.6 };
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      // ядро-свечение
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 140 * devicePixelRatio);
      g.addColorStop(0, "rgba(240,196,106,0.10)"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      parts.forEach(p => {
        p.a += p.sp; p.r *= 0.9985;
        const x = cx + Math.cos(p.a) * p.r, y = cy + Math.sin(p.a) * p.r * 0.62;
        ctx.globalAlpha = p.o * Math.min(1, p.r / 120);
        ctx.fillStyle = p.c; ctx.beginPath();
        ctx.arc(x, y, p.rad * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
        // короткий трейл-линия к центру
        ctx.globalAlpha = p.o * 0.12;
        ctx.strokeStyle = p.c; ctx.lineWidth = devicePixelRatio * 0.6;
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.lineTo(cx + Math.cos(p.a) * p.r * 0.8, cy + Math.sin(p.a) * p.r * 0.62 * 0.8); ctx.stroke();
        if (p.r < 18) Object.assign(p, spawn());
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    resize(); draw();
    window.addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); draw(); });
  }
})();
