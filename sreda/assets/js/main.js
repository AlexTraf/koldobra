/* ===== Среда Возможностей — interactions ===== */
(() => {
  "use strict";

  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  const burger = document.getElementById("burger");
  const links = document.getElementById("navLinks");
  burger.addEventListener("click", () => { links.classList.toggle("open"); burger.classList.toggle("burger-open"); });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { links.classList.remove("open"); burger.classList.remove("burger-open"); }));

  const glow = document.getElementById("cursorGlow");
  window.addEventListener("mousemove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });

  const io = new IntersectionObserver((es) => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  const cio = new IntersectionObserver((es) => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
    let cur = 0; const step = Math.max(1, Math.round(target / 45));
    const tick = () => { cur = Math.min(target, cur + step); el.textContent = cur.toLocaleString("ru-RU") + suffix; if (cur < target) requestAnimationFrame(tick); };
    tick(); cio.unobserve(el);
  }), { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(c => cio.observe(c));

  /* donate */
  const amounts = document.getElementById("amounts");
  const payBtn = document.getElementById("payBtn");
  const monthly = document.getElementById("monthly");
  let sum = 1000;
  const renderPay = () => { payBtn.textContent = (monthly.checked ? "Поддерживать " : "Перевести ") + sum.toLocaleString("ru-RU") + " ₽" + (monthly.checked ? " / мес" : ""); };
  amounts.addEventListener("click", e => {
    const b = e.target.closest(".amount"); if (!b) return;
    amounts.querySelectorAll(".amount").forEach(x => x.classList.remove("amount--on"));
    b.classList.add("amount--on");
    if (/\d/.test(b.textContent)) sum = parseInt(b.textContent.replace(/\D/g, ""), 10);
    else { const v = prompt("Введите сумму, ₽:", "2 500"); if (v) sum = parseInt(v.replace(/\D/g, ""), 10) || sum; }
    renderPay();
  });
  monthly.addEventListener("change", renderPay);
  payBtn.addEventListener("click", e => { e.preventDefault(); payBtn.textContent = "✓ В проде здесь откроется оплата"; setTimeout(renderPay, 1800); });
  renderPay();

  /* lead form */
  const formBtn = document.getElementById("formBtn");
  if (formBtn) formBtn.addEventListener("click", e => { e.preventDefault(); const t = formBtn.textContent; formBtn.textContent = "✓ Заявка отправлена (демо)"; setTimeout(() => formBtn.textContent = t, 2200); });

  /* калькулятор «процент вклада добра» */
  const calcBtn = document.getElementById("calcBtn");
  const out = document.getElementById("calcOut");
  const boardYou = document.getElementById("boardYou");
  const THEMES = [
    { k: ["дет", "ребен", "ребён", "школ", "площад", "сирот"], w: 1.35, tag: "дети" },
    { k: ["здоров", "лечен", "реабилит", "клиник", "болезн", "дцп", "инвалид"], w: 1.5, tag: "здоровье" },
    { k: ["эколог", "природ", "дерев", "животн", "приют"], w: 1.2, tag: "экология" },
    { k: ["образов", "учеб", "стипенд", "грант", "наук", "лаборатор"], w: 1.25, tag: "образование" },
    { k: ["культур", "искусств", "фестив", "музе", "театр", "наслед"], w: 1.1, tag: "культура" },
    { k: ["постро", "ремонт", "восстанов", "своими", "ресурс", "провёл", "провел"], w: 1.3, tag: "дело" },
  ];
  function calc() {
    const text = (document.getElementById("deedText").value || "").toLowerCase();
    const money = Math.max(0, parseInt((document.getElementById("deedSum").value || "0"), 10) || 0);
    if (text.trim().length < 4 && money === 0) {
      out.innerHTML = `<div class="calc__placeholder"><div class="calc__big">0.0000<span>%</span></div><p>Опишите дело или укажите сумму — и нажмите «Рассчитать»</p></div>`;
      return;
    }
    let themeW = 1, found = [];
    THEMES.forEach(t => { if (t.k.some(k => text.includes(k))) { themeW = Math.max(themeW, t.w); found.push(t.tag); } });
    const nonMoney = /(свои|ресурс|постро|помог|организова|руками|время|сам|провёл|провел)/.test(text);
    const effort = Math.min(40, text.trim().split(/\s+/).length) * 120;
    const base = (money + (nonMoney ? effort * 1.6 : effort)) * themeW;
    const pct = Math.min(99.9, (base / 1_200_000_000_000) * 100);
    const people = Math.max(1, Math.round(base / 2500));
    const score = Math.min(99.9, 30 + Math.log10(base + 10) * 11 + themeW * 6).toFixed(1);
    let rank = "Участник добра";
    if (score > 55) rank = "Социально ответственный";
    if (score > 72) rank = "Лидер импакта";
    if (score > 86) rank = "Архитектор добра";
    const themeTxt = found.length ? `Темы: ${found.join(", ")}. ` : "";
    out.innerHTML = `<div class="calc__result">
        <div class="calc__rank">${rank}</div>
        <div class="calc__big">${pct.toFixed(4)}<span>%</span></div>
        <p class="calc__txt">${themeTxt}Ваш вклад уже коснулся <b>~${people.toLocaleString("ru-RU")}</b> ${people === 1 ? "человека" : "человек"}. Так из отдельных дел собирается среда возможностей.</p>
        <div class="calc__metrics">
          <div><b>${score}</b><span>рейтинг отв.</span></div>
          <div><b>~${people.toLocaleString("ru-RU")}</b><span>охват, чел.</span></div>
          <div><b>${themeW.toFixed(2)}×</b><span>коэф. темы</span></div>
        </div></div>`;
    if (boardYou) boardYou.textContent = score;
  }
  calcBtn.addEventListener("click", calc);

  /* collider canvas */
  const cv = document.getElementById("collider");
  if (cv && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    const ctx = cv.getContext("2d");
    let w, h, cx, cy, parts = [], raf;
    const COLORS = ["#8fc0ff", "#5fe0e8", "#b9d4ff"];
    function resize() {
      w = cv.width = cv.offsetWidth * devicePixelRatio; h = cv.height = cv.offsetHeight * devicePixelRatio;
      cx = w / 2; cy = h / 2;
      parts = Array.from({ length: Math.min(90, Math.floor(w / 26)) }, () => spawn());
    }
    function spawn() {
      const a = Math.random() * Math.PI * 2, r = Math.max(w, h) * (0.4 + Math.random() * 0.4);
      return { a, r, sp: 0.0008 + Math.random() * 0.0016, rad: 0.6 + Math.random() * 1.8, c: COLORS[(Math.random() * COLORS.length) | 0], o: 0.2 + Math.random() * 0.6 };
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150 * devicePixelRatio);
      g.addColorStop(0, "rgba(143,176,255,0.10)"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      parts.forEach(p => {
        p.a += p.sp; p.r *= 0.9985;
        const x = cx + Math.cos(p.a) * p.r, y = cy + Math.sin(p.a) * p.r * 0.62;
        ctx.globalAlpha = p.o * Math.min(1, p.r / 120);
        ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(x, y, p.rad * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = p.o * 0.12; ctx.strokeStyle = p.c; ctx.lineWidth = devicePixelRatio * 0.6;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx + Math.cos(p.a) * p.r * 0.8, cy + Math.sin(p.a) * p.r * 0.62 * 0.8); ctx.stroke();
        if (p.r < 18) Object.assign(p, spawn());
      });
      ctx.globalAlpha = 1; raf = requestAnimationFrame(draw);
    }
    resize(); draw();
    window.addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); draw(); });
  }
})();
