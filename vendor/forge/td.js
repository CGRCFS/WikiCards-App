/* Wiki Cards — Défense de fusion : la carte, au centre, se défend seule avec des compétences achetées grâce aux pièces des ennemis vaincus. */
(function () {
  "use strict";
  // Compétences signature par famille de catégories : k = mécanique, puis réglages de base (niveau 1)
  const SK = {
    nature:    { n: "Meute", i: "🐺", c: "#7bd66b", k: "orbit", dmg: 22, cnt: 2, rad: 92, d: "Des bêtes tournent autour de la carte et mordent ce qui approche." },
    histoire:  { n: "Volée de flèches", i: "🏹", c: "#e2b765", k: "bullet", dmg: 13, cd: .85, cnt: 3, spd: 430, d: "Trois flèches sur les ennemis les plus proches." },
    science:   { n: "Arc électrique", i: "⚡", c: "#6fd3ff", k: "strike", dmg: 26, cd: 1.1, chain: 2, d: "Un éclair frappe un ennemi puis rebondit sur ses voisins." },
    musique:   { n: "Onde sonore", i: "🎵", c: "#ff8ad1", k: "pulse", dmg: 24, cd: 1.6, rad: 150, slow: .25, d: "Une onde part de la carte, blesse et ralentit tout ce qu'elle traverse." },
    ecrans:    { n: "Projecteur", i: "🎬", c: "#ffe27a", k: "beam", dmg: 150, len: 230, wid: .42, rot: 1.5, d: "Un faisceau tournant brûle les ennemis qu'il balaie." },
    jeux:      { n: "Missiles", i: "🚀", c: "#9d8cff", k: "bullet", dmg: 34, cd: 1.1, cnt: 1, spd: 320, splash: 50, homing: 1, d: "Un missile à tête chercheuse qui explose à l'impact." },
    sport:     { n: "Frappe", i: "⚽", c: "#f4f4f4", k: "bullet", dmg: 26, cd: .9, cnt: 1, spd: 560, pierce: 3, d: "Un tir tendu qui traverse plusieurs ennemis." },
    mythes:    { n: "Malédiction", i: "💀", c: "#b06cff", k: "aura", dmg: 24, rad: 120, slow: .2, d: "Une aura ronge et ralentit tout ce qui entre dans le cercle." },
    lieux:     { n: "Canon", i: "🏰", c: "#ffad5c", k: "bullet", dmg: 70, cd: 1.9, cnt: 1, spd: 280, splash: 70, d: "Un boulet lent et lourd, à large explosion." },
    quotidien: { n: "Bric-à-brac", i: "🧦", c: "#8fe0c4", k: "bullet", dmg: 10, cd: .28, cnt: 1, spd: 480, d: "Une pluie d'objets, faibles mais très rapides." },
    fiction:   { n: "Boule d'énergie", i: "🔮", c: "#ff7a5c", k: "bullet", dmg: 55, cd: 1.5, cnt: 1, spd: 260, pierce: 99, big: 1, d: "Une grosse sphère qui traverse toute la ligne." },
  };
  const PA = {
    nature: { n: "Régénération", i: "🌿", d: "+1,2 PV par seconde et par niveau", f: (S, l) => S.regen += 1.2 * l },
    histoire: { n: "Armure", i: "🛡️", d: "−9 % de dégâts subis par niveau", f: (S, l) => S.armor *= Math.pow(.91, l) },
    science: { n: "Précision", i: "🎯", d: "+9 % de chances de coup critique (×2,5) par niveau", f: (S, l) => S.crit += .09 * l },
    musique: { n: "Berceuse", i: "🎼", d: "Tous les ennemis sont 6 % plus lents par niveau", f: (S, l) => S.gslow *= Math.pow(.94, l) },
    ecrans: { n: "Grand angle", i: "📽️", d: "+10 % de portée et de zone par niveau", f: (S, l) => S.area *= 1 + .1 * l },
    jeux: { n: "Bonus", i: "🪙", d: "+12 % de pièces par niveau", f: (S, l) => S.coin *= 1 + .12 * l },
    sport: { n: "Cadence", i: "⏱️", d: "+9 % de vitesse d'attaque par niveau", f: (S, l) => S.haste *= 1 + .09 * l },
    mythes: { n: "Vol d'âme", i: "🩸", d: "+0,6 PV par ennemi vaincu et par niveau", f: (S, l) => S.steal += .6 * l },
    lieux: { n: "Fondations", i: "🧱", d: "+18 % de PV max par niveau", f: (S, l) => S.hpm *= 1 + .18 * l },
    quotidien: { n: "Pourboire", i: "💰", d: "+10 pièces par vague terminée et par niveau", f: (S, l) => S.tip += 10 * l },
    fiction: { n: "Destinée", i: "✨", d: "+10 % de dégâts par niveau", f: (S, l) => S.power *= 1 + .1 * l },
  };
  const TUR = { n: "Tourelle", i: "🔫", c: "#d0d6e4", k: "bullet", dmg: 11, cd: .7, cnt: 1, spd: 460, d: "Une tourelle simple qui tire sur l'ennemi le plus proche." };
  const EN = { // pv, vitesse, dégâts au contact (par seconde), valeur, taille, forme
    grunt: [22, 44, 7, 4, 9, "c"], runner: [13, 92, 5, 5, 7, "t"], tank: [95, 25, 14, 12, 14, "s"], swarm: [7, 66, 3, 2, 5, "c"], boss: [290, 17, 20, 90, 26, "h"] };
  const MAXL = 8, TAU = Math.PI * 2;
  let G = null;

  function start(o) {
    stop();
    const root = document.createElement("div"); root.id = "wtd";
    root.innerHTML = `<div class="td-top"><span class="td-pill"><small>Vague</small><b id="td-wave">1</b></span><span class="td-pill"><small>Score</small><b id="td-score">0</b></span><span class="td-pill gold"><small>Pièces</small><b id="td-coin">0</b></span>
        <span class="td-hp"><i id="td-hpb"></i><b id="td-hpt"></b></span><button type="button" id="td-speed" class="td-btn">×1</button><button type="button" id="td-quit" class="td-btn">Abandonner</button></div>
      <canvas id="td-cv"></canvas><div class="td-msg" id="td-msg"></div><div class="td-shop" id="td-shop"></div><div class="td-tip" id="td-tip"></div>`;
    document.body.appendChild(root); document.documentElement.classList.add("td-on");
    const cv = root.querySelector("#td-cv"), x = cv.getContext("2d"), p = Math.max(0, Math.min(1, (o.potential || 0) / 100));
    const same = o.famA === o.famB, slots = [];
    slots.push({ id: "A", sk: SK[o.famA] || SK.quotidien, lv: same ? 2 : 1, kind: "skill" });
    slots.push({ id: "B", sk: same ? TUR : (SK[o.famB] || SK.quotidien), lv: 0, kind: "skill" });
    slots.push({ id: "PA", pa: PA[o.famA] || PA.quotidien, lv: 0, kind: "pass" });
    if (!same) slots.push({ id: "PB", pa: PA[o.famB] || PA.quotidien, lv: 0, kind: "pass" });
    slots.push({ id: "H", kind: "heal", lv: 0 });
    G = { o, root, cv, x, p, slots, same, t: 0, last: 0, speed: 1, wave: 0, score: 0, coin: Math.round(30 + 45 * p), en: [], sh: [], fx: [], txt: [], spawn: [], pause: 2, over: false, won: false,
      power: (.6 + 1.1 * p) * (same ? 1.25 : 1) * (o.sameCat ? 1.08 : 1) * (o.aff ? 1.12 : 1), coinMul: .85 + .6 * p, hp: 0, hpMax: 0, combo: 0, beam: 0, orbA: 0, shake: 0, img: null, kills: 0 };
    stats(); G.hp = G.hpMax;
    if (o.img) { const im = new Image(); im.onload = () => { G.img = im; }; im.src = o.img; }
    G.resize = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); cv.width = r.width * d; cv.height = r.height * d; G.W = r.width; G.H = r.height; G.d = d; G.cx = r.width / 2; G.cy = r.height / 2; G.R = Math.hypot(r.width, r.height) / 2 + 30; G.k = Math.min(1, Math.min(r.width, r.height) / 520); };
    G.resize(); window.addEventListener("resize", G.resize);
    root.querySelector("#td-speed").onclick = e => { G.speed = G.speed === 1 ? 2 : G.speed === 2 ? 3 : 1; e.target.textContent = "×" + G.speed; };
    root.querySelector("#td-quit").onclick = e => { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = "Sûr ? (fin de partie)"; setTimeout(() => { if (e.target.isConnected) { delete e.target.dataset.sure; e.target.textContent = "Abandonner"; } }, 3000); return; } end(); };
    root.querySelector("#td-shop").onclick = e => { const b = e.target.closest("[data-buy]"); if (b) buy(b.dataset.buy); };
    msg(`<b>${esc(o.name)}</b><span>Potentiel ${o.potential} % · ${same ? "Pureté : même famille" : o.aff ? "Affinité : combo Fusion" : "Deux familles"}</span>`, 2.2);
    shop(); G.raf = requestAnimationFrame(loop);
  }
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function stats() { const S = G.S = { regen: 0, armor: 1, crit: .03, gslow: 1, area: 1, coin: 1, haste: 1, steal: 0, hpm: 1, tip: 0, power: 1 };
    G.slots.forEach(s => { if (s.kind === "pass" && s.lv) s.pa.f(S, s.lv); });
    const old = G.hpMax || 0; G.hpMax = Math.round((70 + 230 * G.p) * S.hpm); if (old && G.hpMax > old) G.hp += G.hpMax - old; }
  const cost = s => s.kind === "heal" ? 25 + 15 * s.lv : s.kind === "pass" ? 30 + 28 * s.lv : (s.lv === 0 ? 45 : 22 + 24 * s.lv);
  function buy(id) { const s = G.slots.find(q => q.id === id); if (!s || G.over) return; const c = cost(s); if (G.coin < c || (s.kind !== "heal" && s.lv >= MAXL)) return;
    if (s.kind === "heal" && G.hp >= G.hpMax) return; G.coin -= c; s.lv++; if (s.kind === "heal") { G.hp = Math.min(G.hpMax, G.hp + G.hpMax * .35); ring(G.cx, G.cy, 60, "#7bd66b"); } stats(); shop(); }
  function shop() { const el = G.root.querySelector("#td-shop");
    el.innerHTML = G.slots.map(s => { const c = cost(s), max = s.kind !== "heal" && s.lv >= MAXL, ok = G.coin >= c && !max && !(s.kind === "heal" && G.hp >= G.hpMax);
      const n = s.kind === "heal" ? "Réparer" : s.kind === "pass" ? s.pa.n : s.sk.n, i = s.kind === "heal" ? "🔧" : s.kind === "pass" ? s.pa.i : s.sk.i, d = s.kind === "heal" ? "Rend 35 % des PV" : s.kind === "pass" ? s.pa.d : s.sk.d;
      return `<button type="button" class="td-item${ok ? "" : " off"}${s.kind === "skill" && s.lv ? " on" : ""}" data-buy="${s.id}" title="${esc(d)}"><i>${i}</i><span><b>${esc(n)}</b><small>${s.kind === "heal" ? "+35 % PV" : s.lv ? "Niv. " + s.lv + (max ? " max" : "") : s.kind === "skill" ? "À débloquer" : "Passif"}</small></span><em>${max ? "—" : c + " 🪙"}</em></button>`; }).join("");
    hud(); }
  function hud() { const r = G.root; r.querySelector("#td-wave").textContent = G.wave || 1; r.querySelector("#td-score").textContent = Math.round(G.score).toLocaleString("fr-FR"); r.querySelector("#td-coin").textContent = Math.floor(G.coin);
    r.querySelector("#td-hpb").style.width = Math.max(0, G.hp / G.hpMax * 100) + "%"; r.querySelector("#td-hpt").textContent = Math.max(0, Math.ceil(G.hp)) + " / " + G.hpMax; }
  function msg(h, t) { const m = G.root.querySelector("#td-msg"); m.innerHTML = h; m.classList.add("show"); clearTimeout(G.mt); G.mt = setTimeout(() => m.classList.remove("show"), (t || 1.6) * 1000); }
  function nextWave() { G.wave++; const w = G.wave, hpK = Math.pow(1.21, w - 1), L = [], add = (t, n, gap, at) => { for (let i = 0; i < n; i++) L.push({ t, at: at + i * gap }); };
    add("grunt", 5 + Math.floor(w * 1.6), Math.max(.25, .8 - w * .02), 0);
    if (w >= 2) add("runner", Math.floor(w * 1.1), .5, 2);
    if (w >= 3) add("swarm", w * 3, .14, 4);
    if (w >= 4) add("tank", Math.floor(w / 2), 1.4, 3);
    if (w % 5 === 0) add("boss", Math.floor(w / 5), 4, 5);
    G.spawn = L.sort((a, b) => a.at - b.at); G.wt = 0; G.hpK = hpK; G.dmK = 1 + (w - 1) * .14;
    msg(`<b>Vague ${w}</b>${w % 5 === 0 ? "<span>Un colosse approche</span>" : ""}`, 1.4); hud(); }
  function spawnOne(t) { const e = EN[t], a = Math.random() * TAU; G.en.push({ t, x: G.cx + Math.cos(a) * G.R, y: G.cy + Math.sin(a) * G.R, hp: e[0] * G.hpK, max: e[0] * G.hpK, sp: e[1] * (.9 + Math.random() * .2), dm: e[2] * G.dmK, val: e[3], r: e[4] * (.75 + .25 * G.k) + 0, sh: e[5], slow: 0, hit: 0 }); }
  const ring = (x, y, r, c) => G.fx.push({ k: "ring", x, y, r: 4, R: r, c, a: 1 });
  function hurt(e, d, c) { if (e.hp <= 0) return; if (Math.random() < G.S.crit) { d *= 2.5; G.txt.push({ x: e.x, y: e.y - e.r, s: "!", a: 1, c: "#ffe27a" }); } e.hp -= d; e.hit = .12;
    if (e.hp <= 0) { G.kills++; G.score += e.val * 10; G.coin += e.val * G.coinMul * G.S.coin; if (G.S.steal) G.hp = Math.min(G.hpMax, G.hp + G.S.steal); G.fx.push({ k: "pop", x: e.x, y: e.y, r: e.r, c: c || "#fff", a: 1 }); G.dirty = true; } }
  const near = (x, y, n, skip) => G.en.filter(e => e.hp > 0 && (!skip || !skip.has(e))).map(e => [(e.x - x) ** 2 + (e.y - y) ** 2, e]).sort((a, b) => a[0] - b[0]).slice(0, n).map(q => q[1]);
  function cast(s, dt) { const k = s.sk, l = s.lv, P = G.power * G.S.power * (1 + .22 * (l - 1)), A = G.S.area, echo = G.same && s.id === "A";
    if (k.k === "orbit") { const n = k.cnt + Math.floor(l / 2) + (echo ? 1 : 0), R = k.rad * A * (.8 + .2 * G.k) * (.7 + .3 * Math.sin(G.t * 1.7)); s.ang = (s.ang || 0) + dt * 2.6 * G.S.haste; s.orbs = [];
      for (let i = 0; i < n; i++) { const a = s.ang + i * TAU / n, ox = G.cx + Math.cos(a) * R, oy = G.cy + Math.sin(a) * R; s.orbs.push([ox, oy]); G.en.forEach(e => { if (e.hp > 0 && (e.x - ox) ** 2 + (e.y - oy) ** 2 < (e.r + 12) ** 2) hurt(e, k.dmg * P * dt * 3.2, k.c); }); } return; }
    if (k.k === "aura") { const R = k.rad * A * (1 + .06 * l) * (.8 + .2 * G.k); s.R = R; G.en.forEach(e => { if (e.hp > 0 && (e.x - G.cx) ** 2 + (e.y - G.cy) ** 2 < R * R) { hurt(e, k.dmg * P * dt * (echo ? 1.5 : 1), k.c); e.slow = Math.max(e.slow, k.slow + .03 * l); } }); return; }
    if (k.k === "beam") { s.ang = (s.ang || 0) + dt * k.rot * G.S.haste; const L = k.len * A * (.8 + .2 * G.k), beams = echo ? 2 : 1; s.L = L; s.beams = beams;
      for (let b = 0; b < beams; b++) { const a0 = s.ang + b * Math.PI; G.en.forEach(e => { if (e.hp <= 0) return; const dx = e.x - G.cx, dy = e.y - G.cy, d = Math.hypot(dx, dy); if (d > L + e.r) return; let da = Math.atan2(dy, dx) - a0; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < k.wid + e.r / Math.max(30, d)) hurt(e, k.dmg * P * dt, k.c); }); } return; }
    s.cd = (s.cd || 0) - dt * G.S.haste; if (s.cd > 0) return; if (!G.en.some(e => e.hp > 0)) return; s.cd = k.cd * Math.pow(.95, l - 1);
    if (k.k === "pulse") { G.fx.push({ k: "wave", x: G.cx, y: G.cy, r: 20, R: k.rad * A * (1 + .08 * l) * (.8 + .2 * G.k), c: k.c, a: 1, dmg: k.dmg * P * (echo ? 1.5 : 1), slow: k.slow, hitSet: new Set() }); return; }
    if (k.k === "strike") { const seen = new Set(); let cur = near(G.cx, G.cy, 4)[Math.floor(Math.random() * Math.min(4, G.en.length))] || near(G.cx, G.cy, 1)[0], px = G.cx, py = G.cy, d = k.dmg * P;
      for (let i = 0; cur && i <= k.chain + Math.floor(l / 2) + (echo ? 2 : 0); i++) { G.fx.push({ k: "bolt", x1: px, y1: py, x2: cur.x, y2: cur.y, c: k.c, a: 1 }); hurt(cur, d, k.c); seen.add(cur); px = cur.x; py = cur.y; d *= .82; cur = near(px, py, 1, seen)[0]; if (cur && (cur.x - px) ** 2 + (cur.y - py) ** 2 > 170 * 170) cur = null; } return; }
    const n = (k.cnt || 1) + (k.cnt > 1 ? Math.floor(l / 3) : 0) + (echo ? 1 : 0), T = near(G.cx, G.cy, n);
    for (let i = 0; i < n; i++) { const e = T[i % T.length]; if (!e) break; const a = Math.atan2(e.y - G.cy, e.x - G.cx) + (i >= T.length ? (Math.random() - .5) * .5 : 0);
      G.sh.push({ x: G.cx, y: G.cy, vx: Math.cos(a) * k.spd, vy: Math.sin(a) * k.spd, dmg: k.dmg * P, c: k.c, splash: (k.splash || 0) * A, pierce: (k.pierce || 0) + (k.pierce ? Math.floor(l / 3) : 0), tg: k.homing ? e : null, spd: k.spd, r: k.big ? 11 : k.splash ? 5 : 3, life: 3, hitSet: new Set() }); } }
  function loop(ts) { if (!G) return; const raw = Math.min(.05, (ts - (G.last || ts)) / 1000); G.last = ts; for (let i = 0; i < G.speed; i++) if (!G.over) step(raw); draw(); G.raf = requestAnimationFrame(loop); }
  function step(dt) { G.t += dt;
    if (!G.spawn.length && !G.en.length) { if (G.wave && !G.cleared) { G.cleared = true; G.score += G.wave * 100; G.coin += 12 + G.wave * 3 + G.S.tip; G.dirty = true; if (G.o.onWave) G.o.onWave(Math.round(G.score), G.wave);
          if (G.wave >= (G.o.win || 10) && !G.won) { G.won = true; msg(`<b>🏆 Objectif atteint !</b><span>Animation gagnée. Continue pour le record…</span>`, 3); } }
      G.pause -= dt; if (G.pause <= 0) { G.pause = 2.6; G.cleared = false; nextWave(); } }
    else { G.wt += dt; while (G.spawn.length && G.spawn[0].at <= G.wt) spawnOne(G.spawn.shift().t); }
    G.slots.forEach(s => { if (s.kind === "skill" && s.lv) cast(s, dt); });
    if (G.o.aff && !G.same) { G.combo += dt; if (G.combo > 11 && G.en.length) { G.combo = 0; const lv = G.slots[0].lv + G.slots[1].lv; G.fx.push({ k: "wave", x: G.cx, y: G.cy, r: 20, R: 260 * G.S.area, c: "#ffd27a", a: 1, dmg: 24 * G.power * G.S.power * (1 + .12 * lv), slow: .5, hitSet: new Set(), thick: 1 }); } }
    G.sh.forEach(b => { if (b.tg && b.tg.hp > 0) { const a = Math.atan2(b.tg.y - b.y, b.tg.x - b.x); b.vx += (Math.cos(a) * b.spd - b.vx) * Math.min(1, dt * 6); b.vy += (Math.sin(a) * b.spd - b.vy) * Math.min(1, dt * 6); }
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      for (const e of G.en) { if (e.hp <= 0 || b.hitSet.has(e)) continue; if ((e.x - b.x) ** 2 + (e.y - b.y) ** 2 < (e.r + b.r) ** 2) { b.hitSet.add(e);
          if (b.splash) { ring(b.x, b.y, b.splash, b.c); G.en.forEach(q => { if (q.hp > 0 && (q.x - b.x) ** 2 + (q.y - b.y) ** 2 < (b.splash + q.r) ** 2) hurt(q, b.dmg, b.c); }); b.life = 0; break; }
          hurt(e, b.dmg, b.c); if (b.pierce-- <= 0) { b.life = 0; break; } } } });
    G.sh = G.sh.filter(b => b.life > 0 && b.x > -40 && b.y > -40 && b.x < G.W + 40 && b.y < G.H + 40);
    const cw = 34 * (.8 + .2 * G.k), ch = cw * 1.4; let dmg = 0;
    G.en.forEach(e => { if (e.hp <= 0) return; const dx = G.cx - e.x, dy = G.cy - e.y, d = Math.hypot(dx, dy), stop = Math.max(cw, ch) * .78 + e.r; e.hit = Math.max(0, e.hit - dt);
      if (d > stop) { const v = e.sp * G.S.gslow * (1 - Math.min(.5, e.slow)) * (.8 + .2 * G.k); e.x += dx / d * v * dt; e.y += dy / d * v * dt; } else dmg += e.dm * dt; e.slow = Math.max(0, e.slow - dt * .5); });
    if (dmg) { G.hp -= dmg * G.S.armor; G.shake = .12; }
    if (G.S.regen) G.hp = Math.min(G.hpMax, G.hp + G.S.regen * dt);
    G.fx.forEach(f => { if (f.k === "wave") { f.r += dt * 330; G.en.forEach(e => { if (e.hp > 0 && !f.hitSet.has(e) && Math.hypot(e.x - f.x, e.y - f.y) < f.r) { f.hitSet.add(e); hurt(e, f.dmg, f.c); e.slow = Math.max(e.slow, f.slow); } }); if (f.r >= f.R) f.a = 0; else f.a = 1 - f.r / f.R * .7; }
      else if (f.k === "ring") { f.r += dt * 260; f.a = 1 - f.r / f.R; } else f.a -= dt * (f.k === "bolt" ? 5 : 3.2); });
    G.fx = G.fx.filter(f => f.a > 0); G.txt.forEach(t => { t.y -= dt * 30; t.a -= dt * 2; }); G.txt = G.txt.filter(t => t.a > 0);
    G.en = G.en.filter(e => e.hp > 0); G.shake = Math.max(0, G.shake - dt);
    if (G.dirty || (G.ht = (G.ht || 0) + dt) > .25) { G.ht = 0; if (G.dirty) shop(); else hud(); G.dirty = false; }
    if (G.hp <= 0) end(); }
  function draw() { const x = G.x, W = G.W, H = G.H; x.setTransform(G.d, 0, 0, G.d, 0, 0); x.clearRect(0, 0, W, H);
    const sx = G.shake ? (Math.random() - .5) * 5 : 0, sy = G.shake ? (Math.random() - .5) * 5 : 0; x.save(); x.translate(sx, sy);
    x.strokeStyle = "rgba(255,255,255,.045)"; x.lineWidth = 1; for (let r = 70; r < G.R; r += 70) { x.beginPath(); x.arc(G.cx, G.cy, r, 0, TAU); x.stroke(); }
    G.slots.forEach(s => { if (s.kind !== "skill" || !s.lv) return; const k = s.sk;
      if (k.k === "aura" && s.R) { const g = x.createRadialGradient(G.cx, G.cy, s.R * .3, G.cx, G.cy, s.R); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, k.c + "33"); x.fillStyle = g; x.beginPath(); x.arc(G.cx, G.cy, s.R, 0, TAU); x.fill(); x.strokeStyle = k.c + "88"; x.setLineDash([4, 6]); x.stroke(); x.setLineDash([]); }
      if (k.k === "beam" && s.L) for (let b = 0; b < s.beams; b++) { const a = s.ang + b * Math.PI; x.save(); x.translate(G.cx, G.cy); x.rotate(a); const g = x.createLinearGradient(0, 0, s.L, 0); g.addColorStop(0, k.c + "cc"); g.addColorStop(1, k.c + "00"); x.fillStyle = g; x.beginPath(); x.moveTo(0, 0); x.lineTo(s.L, -s.L * Math.tan(k.wid)); x.lineTo(s.L, s.L * Math.tan(k.wid)); x.closePath(); x.fill(); x.restore(); }
      if (k.k === "orbit" && s.orbs) s.orbs.forEach(([ox, oy]) => { x.fillStyle = k.c; x.shadowColor = k.c; x.shadowBlur = 12; x.beginPath(); x.arc(ox, oy, 7, 0, TAU); x.fill(); x.shadowBlur = 0; }); });
    G.en.forEach(e => { x.fillStyle = e.hit ? "#fff" : e.t === "boss" ? "#ff5d5d" : e.t === "tank" ? "#c98bff" : e.t === "runner" ? "#ffb347" : e.t === "swarm" ? "#7fd4ff" : "#e6e9f2"; x.globalAlpha = .92; x.beginPath();
      if (e.sh === "c") x.arc(e.x, e.y, e.r, 0, TAU); else { const n = e.sh === "t" ? 3 : e.sh === "s" ? 4 : 6, a0 = Math.atan2(G.cy - e.y, G.cx - e.x); for (let i = 0; i < n; i++) { const a = a0 + i * TAU / n; x[i ? "lineTo" : "moveTo"](e.x + Math.cos(a) * e.r * 1.15, e.y + Math.sin(a) * e.r * 1.15); } x.closePath(); }
      x.fill(); x.globalAlpha = 1; if (e.hp < e.max && e.r > 8) { x.fillStyle = "rgba(0,0,0,.5)"; x.fillRect(e.x - e.r, e.y - e.r - 6, e.r * 2, 3); x.fillStyle = "#7bd66b"; x.fillRect(e.x - e.r, e.y - e.r - 6, e.r * 2 * Math.max(0, e.hp / e.max), 3); } });
    G.sh.forEach(b => { x.fillStyle = b.c; x.shadowColor = b.c; x.shadowBlur = 8; x.beginPath(); x.arc(b.x, b.y, b.r, 0, TAU); x.fill(); x.shadowBlur = 0; });
    G.fx.forEach(f => { x.globalAlpha = Math.max(0, f.a);
      if (f.k === "wave" || f.k === "ring") { x.strokeStyle = f.c; x.lineWidth = f.thick ? 5 : 2.5; x.beginPath(); x.arc(f.x, f.y, f.r, 0, TAU); x.stroke(); }
      else if (f.k === "bolt") { x.strokeStyle = f.c; x.lineWidth = 2; x.shadowColor = f.c; x.shadowBlur = 10; x.beginPath(); x.moveTo(f.x1, f.y1); const mx = (f.x1 + f.x2) / 2 + (Math.random() - .5) * 14, my = (f.y1 + f.y2) / 2 + (Math.random() - .5) * 14; x.lineTo(mx, my); x.lineTo(f.x2, f.y2); x.stroke(); x.shadowBlur = 0; }
      else { x.strokeStyle = f.c; x.lineWidth = 1.5; x.beginPath(); x.arc(f.x, f.y, f.r + (1 - f.a) * 10, 0, TAU); x.stroke(); } x.globalAlpha = 1; });
    // la carte fusion, au centre : plus son potentiel est haut, plus elle rayonne
    const cw = 34 * (.8 + .2 * G.k) * 2, ch = cw * 1.4, gl = 10 + 34 * G.p + Math.sin(G.t * 3) * 4 * G.p; x.save(); x.translate(G.cx, G.cy);
    x.shadowColor = `hsl(${30 + G.p * 20},100%,${55 + G.p * 15}%)`; x.shadowBlur = gl; x.fillStyle = "#1b1f2a"; rr(x, -cw / 2, -ch / 2, cw, ch, 7); x.fill(); x.shadowBlur = 0;
    if (G.img) { x.save(); rr(x, -cw / 2, -ch / 2, cw, ch, 7); x.clip(); const k = Math.max(cw / G.img.width, ch / G.img.height); x.drawImage(G.img, -G.img.width * k / 2, -G.img.height * k * .5, G.img.width * k, G.img.height * k); x.restore(); }
    x.lineWidth = 2.5; x.strokeStyle = G.hp / G.hpMax < .3 ? "#ff5d5d" : `hsl(${35 + G.p * 15},95%,${60 + G.p * 20}%)`; rr(x, -cw / 2, -ch / 2, cw, ch, 7); x.stroke(); x.restore();
    G.txt.forEach(t => { x.globalAlpha = Math.max(0, t.a); x.fillStyle = t.c; x.font = "700 13px system-ui"; x.fillText(t.s, t.x, t.y); x.globalAlpha = 1; });
    x.restore(); }
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function end() { if (!G || G.over) return; G.over = true; const sc = Math.round(G.score), wv = G.cleared ? G.wave : Math.max(0, G.wave - 1), o = G.o;
    const box = document.createElement("div"); box.className = "td-end"; box.innerHTML = `<div class="td-card"><h3>${G.won ? "🏆 Défense réussie" : "La carte est tombée"}</h3><p class="td-big">${sc.toLocaleString("fr-FR")}<small> points</small></p><p>${wv} vague${wv > 1 ? "s" : ""} repoussée${wv > 1 ? "s" : ""} · ${G.kills} ennemis vaincus</p><p id="td-rew">Enregistrement…</p><button type="button" class="td-btn big" id="td-close">Fermer</button></div>`;
    G.root.appendChild(box); box.querySelector("#td-close").onclick = () => { stop(); if (o.onClose) o.onClose(); };
    Promise.resolve(o.onEnd ? o.onEnd(sc, wv) : null).then(r => { const el = box.querySelector("#td-rew"); if (el) el.innerHTML = r || ""; }).catch(() => {}); }
  function stop() { if (!G) return; cancelAnimationFrame(G.raf); window.removeEventListener("resize", G.resize); G.root.remove(); document.documentElement.classList.remove("td-on"); G = null; }
  window.WikiTD = { start, stop, SK, PA, _g: () => G, _step: step, _buy: buy, _cost: cost };
})();
