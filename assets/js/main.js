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

  /* пожертвования — реальная ссылка СБП (кнопка + QR) в разметке */

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

  /* ---- кейсы: coverflow-карусель + модалка ---- */
  const CASES = [
    { id: "unionart", tag: "Арт-фестиваль", title: "Union Art Fest 2025",
      sub: "18–19 октября 2025 · Москва, Столичная галерея художников",
      cover: "assets/img/unionart-1.jpg",
      desc: "Арт-фестиваль и культурно-деловая платформа поддержки молодых художников: помочь заявить о себе, выстроить личный бренд и начать монетизировать творчество. За два дня — выставка, аукцион, маркет и fashion show, мастер-классы, лекции и арт-завтрак, DJ-сеты и перформансы. 30% от стоимости проданных работ направлены в благотворительный фонд.",
      metrics: [["2 120", "посетителей"], ["150", "работ художников"], ["7", "продано на аукционе"], ["30%", "с продаж — в фонд"]],
      gallery: ["assets/img/unionart-1.jpg", "assets/img/unionart-2.jpg", "assets/img/unionart-4.jpg", "assets/img/unionart-3.jpg"],
      media: "О фестивале писали: АСИ · Мосволонтёр · Re-port · Samokatus · LiveJournal" },
    { id: "velo", tag: "Спорт и семья", title: "Велозабег «Спасибо, что мы живы»",
      sub: "Измайловский парк, Москва", cover: "", icon: "🚲",
      desc: "Массовый семейный велозабег, объединивший участников вокруг идеи благодарности и здорового образа жизни. Спортивное событие фонда с партнёрами и волонтёрами.",
      metrics: [["2 000+", "участников"]], gallery: [], media: "Фото и полные показатели события — по материалам фонда (добавим)." },
    { id: "help", tag: "Социальная поддержка", title: "Гуманитарная помощь",
      sub: "Республика Дагестан", cover: "", icon: "🤝",
      desc: "Адресная гуманитарная помощь нуждающимся при поддержке партнёров фонда.",
      metrics: [], gallery: [], media: "Материалы события — уточняются." }
  ];
  const stage = document.getElementById("cfStage");
  if (stage) {
    const dotsBox = document.getElementById("cfDots");
    const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
    let active = 0;
    const cards = CASES.map((c, i) => {
      const el = document.createElement("article");
      el.className = "cf-card" + (c.cover ? "" : " cf-card--noimg");
      el.innerHTML = (c.cover
        ? `<div class="cf-cover" style="background-image:url('${c.cover}')"></div>`
        : `<div class="cf-cover"><span>${c.icon || "✦"}</span></div>`)
        + `<div class="cf-meta"><span class="cf-tag">${esc(c.tag)}</span><h3>${esc(c.title)}</h3><p>${esc(c.sub)}</p><span class="cf-more">Подробнее →</span></div>`;
      el.addEventListener("click", () => { if (i === active) openCase(i); else setActive(i); });
      stage.appendChild(el);
      return el;
    });
    const dots = CASES.map((c, i) => {
      const d = document.createElement("button");
      d.className = "cf-dot"; d.setAttribute("aria-label", c.title);
      d.addEventListener("click", () => setActive(i));
      dotsBox.appendChild(d); return d;
    });
    function layout() {
      cards.forEach((el, i) => {
        const off = i - active, a = Math.abs(off);
        el.style.transform = `translateX(${off * 56}%) translateZ(${-a * 130}px) rotateY(${off * -22}deg) scale(${1 - a * 0.12})`;
        el.style.zIndex = String(100 - a);
        el.style.opacity = a > 2 ? "0" : (a === 0 ? "1" : "0.6");
        el.style.pointerEvents = a > 2 ? "none" : "auto";
        el.classList.toggle("is-active", i === active);
      });
      dots.forEach((d, i) => d.classList.toggle("is-on", i === active));
    }
    function setActive(i) { active = (i + CASES.length) % CASES.length; layout(); }
    document.getElementById("cfPrev").addEventListener("click", () => setActive(active - 1));
    document.getElementById("cfNext").addEventListener("click", () => setActive(active + 1));
    layout();

    const modal = document.getElementById("caseModal");
    const mbody = document.getElementById("modalBody");
    let mIndex = 0;
    function openCase(i) {
      mIndex = i; const c = CASES[i];
      const metrics = c.metrics.length ? `<div class="m-metrics">${c.metrics.map(m => `<div><b>${esc(m[0])}</b><span>${esc(m[1])}</span></div>`).join("")}</div>` : "";
      const gallery = c.gallery.length ? `<div class="m-gallery">${c.gallery.map(g => `<img src="${g}" alt="${esc(c.title)}" loading="lazy">`).join("")}</div>` : "";
      const media = c.media ? `<p class="m-media">${esc(c.media)}</p>` : "";
      mbody.innerHTML = `<span class="m-tag">${esc(c.tag)}</span><h3 class="m-title">${esc(c.title)}</h3><p class="m-sub">${esc(c.sub)}</p>${metrics}<p class="m-desc">${esc(c.desc)}</p>${gallery}${media}`;
      mbody.parentElement.scrollTop = 0;
      modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
    }
    function closeModal() { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
    modal.querySelectorAll("[data-close]").forEach(x => x.addEventListener("click", closeModal));
    document.getElementById("mPrev").addEventListener("click", () => openCase((mIndex - 1 + CASES.length) % CASES.length));
    document.getElementById("mNext").addEventListener("click", () => openCase((mIndex + 1) % CASES.length));
    document.addEventListener("keydown", e => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowLeft") document.getElementById("mPrev").click();
      else if (e.key === "ArrowRight") document.getElementById("mNext").click();
    });
  }

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
