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
  /* пожертвования — реальная ссылка СБП (кнопка + QR) в разметке */

  /* lead form */
  const formBtn = document.getElementById("formBtn");
  if (formBtn) formBtn.addEventListener("click", e => { e.preventDefault(); const t = formBtn.textContent; formBtn.textContent = "✓ Заявка отправлена (демо)"; setTimeout(() => formBtn.textContent = t, 2200); });

  /* калькулятор «Индекс вклада добра» (v2 — аналог IPS) */
  const calcBtn = document.getElementById("calcBtn");
  if (calcBtn) {
    const $ = id => document.getElementById(id);
    document.querySelectorAll("#qRes .chip, #qSpheres .chip").forEach(c =>
      c.addEventListener("click", () => c.classList.toggle("is-on")));
    document.querySelectorAll("#qReg .seg__b").forEach(b =>
      b.addEventListener("click", () => {
        document.querySelectorAll("#qReg .seg__b").forEach(x => x.classList.remove("is-on"));
        b.classList.add("is-on");
      }));
    const gaugeFg = $("gaugeFg"), gVal = $("gVal"), gTier = $("gTier"), resBox = $("calcResult");
    const C = 578, fmt = n => n.toLocaleString("ru-RU");
    let lastShare = "";
    function calc() {
      const money = Math.max(0, parseInt($("qMoney").value || "0", 10) || 0);
      const time = Math.max(0, parseInt($("qTime").value || "0", 10) || 0);
      const resSel = [...document.querySelectorAll("#qRes .chip.is-on")].map(c => c.dataset.v);
      const spheres = [...document.querySelectorAll("#qSpheres .chip.is-on")].map(c => c.dataset.v);
      const reg = parseInt(document.querySelector("#qReg .seg__b.is-on")?.dataset.v || "3", 10);
      let s = 0;
      s += Math.min(400, Math.log10(money + 1) * 82);
      s += Math.min(250, time * 10);
      s += resSel.length * 55;
      s += Math.min(150, spheres.length * 28);
      const regMul = [0, .55, .72, .86, 1][reg] || .86;
      const score = Math.round(Math.min(1000, s * regMul));
      const impactBase = money + time * 1500 + resSel.length * 40000 + spheres.length * 15000;
      const people = Math.max(1, Math.round(impactBase * regMul / 2500));
      const years = [0, 1, 2, 4, 7][reg] || 4;
      const projects = Math.max(1, Math.round((money / 50000 + time / 20 + spheres.length / 2) * regMul));
      const tiers = [[0, "Участник"], [200, "Созидатель"], [420, "Наставник"], [650, "Меценат"], [850, "Архитектор наследия"]];
      let tier = "Участник"; tiers.forEach(t => { if (score >= t[0]) tier = t[1]; });
      const topPct = Math.max(1, Math.min(99, 100 - Math.round(score / 1000 * 96)));
      gaugeFg.style.strokeDashoffset = String(C * (1 - score / 1000));
      gTier.textContent = tier;
      let cur = 0; const step = Math.max(1, Math.round(score / 40));
      (function tick() { cur = Math.min(score, cur + step); gVal.textContent = fmt(cur); if (cur < score) requestAnimationFrame(tick); })();
      const sphHtml = spheres.length ? `<div class="c2-spheres">${spheres.map((sp, i) => {
        const w = Math.max(45, Math.min(96, 62 + Math.round(score / 1000 * 34) - i * 4));
        return `<div class="sph"><span>${sp}</span><i style="width:${w}%"></i></div>`;
      }).join("")}</div>` : "";
      const regWord = ["", "разово", "время от времени", "регулярно", "системно"][reg];
      const narr = `Вы вкладываетесь <b>${regWord}</b>${spheres.length ? ` в ${spheres.length} ${spheres.length === 1 ? "сферу" : "сферы"}` : ""}. Ваш вклад уже коснулся <b>~${fmt(people)}</b> ${people === 1 ? "человека" : "человек"} — это наследие, которое продолжает расти.`;
      lastShare = `Мой Индекс вклада добра — ${score}/1000, уровень «${tier}». А какой у тебя? https://mitfond.ru`;
      resBox.innerHTML = `
        <div class="c2-tier">Уровень: <b>${tier}</b></div>
        <div class="c2-metrics">
          <div><b>~${fmt(people)}</b><span>людей затронуто</span></div>
          <div><b>~${years}</b><span>лет импакта</span></div>
          <div><b>~${fmt(projects)}</b><span>проектов в эквиваленте</span></div>
        </div>
        ${sphHtml}
        <p class="c2-narr">${narr}</p>
        <div class="c2-top">Вы опережаете ~<b>${topPct}%</b> людей по вкладу</div>
        <div class="c2-actions"><button class="btn btn--outline" id="shareBtn" type="button">Поделиться</button></div>
        <div class="c2-cert"><input type="text" id="certName" placeholder="Ваше имя для сертификата" maxlength="40" /><button class="btn btn--accent" id="certBtn" type="button">Получить сертификат 🏅</button></div>`;
      const sb = $("shareBtn");
      sb.addEventListener("click", () => {
        const done = () => { sb.textContent = "✓ Скопировано"; setTimeout(() => { sb.textContent = "Поделиться"; }, 1800); };
        if (navigator.clipboard) navigator.clipboard.writeText(lastShare).then(done, done); else done();
      });
      const cbtn = $("certBtn");
      if (cbtn) cbtn.addEventListener("click", () => openCert(($("certName").value || "").trim() || "Друг фонда", score, tier));
    }
    calcBtn.addEventListener("click", calc);

    /* сертификат «Индекса вклада добра» */
    const certModal = document.getElementById("certModal");
    const certCanvas = document.getElementById("certCanvas");
    const certDownload = document.getElementById("certDownload");
    let certShareText = "";
    function openCert(name, score, tier) {
      certShareText = `Мой Индекс вклада добра — ${score}/1000, уровень «${tier}». mitfond.ru`;
      certModal.classList.add("is-open"); document.body.style.overflow = "hidden";
      const ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
      ready.then(() => drawCert(certCanvas, name, score, tier, () => { certDownload.href = certCanvas.toDataURL("image/png"); }));
    }
    function drawCert(cv, name, score, tier, cb) {
      const css = getComputedStyle(document.documentElement);
      const acc = (css.getPropertyValue("--accent").trim() || "#8fc0ff");
      const acc2 = (css.getPropertyValue("--accent2").trim() || "#5fe0e8");
      const bgc = (css.getPropertyValue("--bg2").trim() || "#0b1326");
      const W = 1200, H = 848; cv.width = W; cv.height = H;
      const x = cv.getContext("2d");
      x.fillStyle = bgc; x.fillRect(0, 0, W, H);
      const rg = x.createRadialGradient(W / 2, 300, 0, W / 2, 300, 640);
      rg.addColorStop(0, acc + "26"); rg.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = rg; x.fillRect(0, 0, W, H);
      x.strokeStyle = acc + "8c"; x.lineWidth = 2; x.strokeRect(40, 40, W - 80, H - 80);
      x.strokeStyle = acc + "30"; x.lineWidth = 1; x.strokeRect(52, 52, W - 104, H - 104);
      x.textAlign = "center";
      x.fillStyle = "#e6ebf5"; x.font = "700 24px Manrope, Arial, sans-serif"; x.fillText("ФОНД «СРЕДА ВОЗМОЖНОСТЕЙ»", W / 2, 236);
      x.fillStyle = "#ffffff"; x.font = "800 62px Manrope, Arial, sans-serif"; x.fillText("СЕРТИФИКАТ", W / 2, 306);
      x.fillStyle = acc; x.font = "italic 28px 'Playfair Display', Georgia, serif"; x.fillText("Индекс вклада добра", W / 2, 349);
      x.fillStyle = "#aab4c6"; x.font = "400 23px Manrope, Arial, sans-serif"; x.fillText("Настоящим подтверждается, что", W / 2, 428);
      x.fillStyle = "#ffffff"; x.font = "700 44px Manrope, Arial, sans-serif"; x.fillText(name, W / 2, 487);
      x.fillStyle = "#aab4c6"; x.font = "400 23px Manrope, Arial, sans-serif"; x.fillText("создаёт наследие добра", W / 2, 528);
      const gr = x.createLinearGradient(W / 2 - 220, 0, W / 2 + 220, 0); gr.addColorStop(0, acc); gr.addColorStop(1, acc2);
      x.fillStyle = gr; x.font = "italic 92px 'Playfair Display', Georgia, serif"; x.fillText(score + " / 1000", W / 2, 648);
      x.fillStyle = "#e6ebf5"; x.font = "700 30px Manrope, Arial, sans-serif"; x.fillText("Уровень: " + tier, W / 2, 702);
      x.fillStyle = "#8892a4"; x.font = "400 20px Manrope, Arial, sans-serif";
      let d = ""; try { d = new Date().toLocaleDateString("ru-RU"); } catch (e) {}
      x.fillText(d + "   ·   mitfond.ru", W / 2, 772);
      const logo = new Image();
      logo.onload = () => { const sz = 120; x.drawImage(logo, W / 2 - sz / 2, 80, sz, sz); if (cb) cb(); };
      logo.onerror = () => { if (cb) cb(); };
      logo.src = "assets/img/logo-white.png";
    }
    if (certModal) {
      certModal.querySelectorAll("[data-certclose]").forEach(el => el.addEventListener("click", () => { certModal.classList.remove("is-open"); document.body.style.overflow = ""; }));
      const cShare = document.getElementById("certShare");
      if (cShare) cShare.addEventListener("click", () => {
        const fin = () => { cShare.textContent = "✓ Скопировано"; setTimeout(() => { cShare.textContent = "Поделиться"; }, 1800); };
        if (navigator.clipboard) navigator.clipboard.writeText(certShareText).then(fin, fin); else fin();
      });
      document.addEventListener("keydown", e => { if (e.key === "Escape" && certModal.classList.contains("is-open")) { certModal.classList.remove("is-open"); document.body.style.overflow = ""; } });
    }
  }

  /* ---- кейсы: coverflow-карусель + модалка ---- */
  const CASES = [
    { id: "unionart", tag: "Арт-фестиваль", title: "Union Art Fest 2025",
      sub: "18–19 октября 2025 · Москва, Столичная галерея художников",
      cover: "assets/img/unionart-1.jpg",
      desc: "Арт-фестиваль и культурно-деловая платформа поддержки молодых художников: помочь заявить о себе, выстроить личный бренд и начать монетизировать творчество. За два дня — выставка, аукцион, маркет и fashion show, мастер-классы, лекции и арт-завтрак, DJ-сеты и перформансы. 30% от стоимости проданных работ направлены в благотворительный фонд.",
      metrics: [["2 120", "посетителей"], ["150", "работ художников"], ["7", "продано на аукционе"], ["30%", "с продаж — в фонд"]],
      gallery: ["assets/img/unionart-1.jpg", "assets/img/unionart-2.jpg", "assets/img/unionart-4.jpg", "assets/img/unionart-3.jpg"],
      media: "О фестивале писали: АСИ · Мосволонтёр · Re-port · Samokatus · LiveJournal" },
    { id: "balancefest", tag: "Фестиваль развития", title: "Balance Fest 2024",
      sub: "13 июля 2024 · Москва, Таганский парк",
      cover: "assets/img/balancefest.jpg",
      desc: "Открытый городской фестиваль гармоничного развития личности. Бесплатная площадка объединила экспертов, семьи с детьми и жителей Москвы вокруг здоровья, осознанности и полезного досуга. Девять направлений развития — от заботы о здоровье и профилактики выгорания до психологии, творчества и семейных практик.",
      metrics: [["1 600", "участников"], ["9", "направлений развития"], ["15", "экспертов"], ["7", "часов программы"]],
      gallery: ["assets/img/balancefest-2.jpg", "assets/img/balancefest-3.jpg", "assets/img/balancefest-4.jpg", "assets/img/balancefest-5.jpg"],
      media: "Свободный вход · семейный формат · отдельная программа для детей" },
    { id: "mirkino", tag: "Кинофестиваль", title: "Молодёжный кинофестиваль «Мир кино»",
      sub: "29 марта 2025 · Москва, кинотеатр «Космос»",
      cover: "assets/img/mirkino.jpg",
      desc: "Молодёжный кинофестиваль «Загляни в яркий мир кино с изнанки» — бесплатная площадка для начинающих режиссёров, сценаристов и актёров. Показы короткометражек и авторского кино с обсуждением, лекции и мастер-классы (режиссура, монтаж, ИИ в кино), встречи с профессионалами индустрии, красная дорожка и семейные активности.",
      metrics: [["14–30", "возраст участников"], ["6+", "зон мастер-классов"], ["REN.TV", "репортаж о фестивале"]],
      gallery: ["assets/img/mirkino-2.jpg", "assets/img/mirkino-3.jpg", "assets/img/mirkino-4.jpg", "assets/img/mirkino-5.jpg"],
      media: "Спикеры: Саид Игматулин (ИИ в кино) · Алексей Гуев (показ фильма «Жизнь с доставкой»)" },
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

    /* модалка */
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

  /* галерея фото в блоке сбора */
  const fundSlides = document.getElementById("fundSlides");
  if (fundSlides) {
    const imgs = [...fundSlides.querySelectorAll("img")];
    const dotsC = document.getElementById("fundDots");
    let fi = 0, timer;
    function go(i) { fi = (i + imgs.length) % imgs.length; imgs.forEach((im, j) => im.classList.toggle("is-on", j === fi)); dots.forEach((d, j) => d.classList.toggle("is-on", j === fi)); }
    const dots = imgs.map((_, i) => {
      const d = document.createElement("button"); d.className = "fund-dot"; if (i === 0) d.classList.add("is-on");
      d.setAttribute("aria-label", "Фото " + (i + 1)); d.addEventListener("click", () => go(i));
      dotsC.appendChild(d); return d;
    });
    function start() { timer = setInterval(() => go(fi + 1), 4500); }
    function stop() { clearInterval(timer); }
    const fPrev = document.getElementById("fundPrev"), fNext = document.getElementById("fundNext");
    if (fPrev) fPrev.addEventListener("click", () => go(fi - 1));
    if (fNext) fNext.addEventListener("click", () => go(fi + 1));
    start();
    const wrap = fundSlides.closest(".fund-photo");
    wrap.addEventListener("mouseenter", stop); wrap.addEventListener("mouseleave", start);
  }

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
