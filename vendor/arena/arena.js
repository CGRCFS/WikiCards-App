/* Wiki Arena : auto-battler (étape 1 : solo contre des bots, set 1). Réservé aux admins tant que le mode n'est pas ouvert. */
(function () {
  "use strict";
  const W = typeof window !== "undefined" ? window : globalThis;
  const IDS = W.ARENA_IDS || {};
  const ORI = { catch: ["Catch", "🤼"], pol: ["Politique", "🏛️"], hor: ["Horreur", "👻"], manga: ["Manga", "🍥"], jv: ["Jeux vidéo", "🎮"], meme: ["Memes", "😹"], da: ["Dessins animés", "📺"], hero: ["Super-héros", "🦸"], vid: ["Vidéastes", "🎬"], chat: ["Chat", "🐱"] };
  const CLS = { col: ["Colosse", "🛡️"], bag: ["Bagarreur", "👊"], ass: ["Assassin", "🗡️"], tir: ["Tireur", "🏹"], mag: ["Mage", "✨"], sou: ["Soutien", "💚"], str: ["Stratège", "📣"] };
  const TNAME = k => (ORI[k] || CLS[k])[0], TICO = k => (ORI[k] || CLS[k])[1];
  // synergies : paliers (t), valeurs par palier (v), description (d)
  const TR = {
    catch: { t: [2, 4, 6], v: [[150, 10], [350, 20], [600, 35]], d: v => `Les catcheurs gagnent ${v[0]} PV et ${v[1]} % de dégâts d'attaque.` },
    pol: { t: [2, 4, 6], v: [[100], [250], [450]], d: v => `Au début du combat, toute ton équipe reçoit un bouclier de ${v[0]}.` },
    hor: { t: [2, 4, 6], v: [[15], [30], [50]], d: v => `Les ennemis perdent ${v[0]} % d'armure et de résistance magique.` },
    manga: { t: [2, 4, 6], v: [[3], [6], [10]], d: v => `Les unités Manga gagnent ${v[0]} mana de plus par attaque.` },
    jv: { t: [2, 4, 6], v: [[8], [16], [28]], d: v => `Toute ton équipe gagne ${v[0]} % de vitesse d'attaque.` },
    meme: { t: [2, 4, 6], v: [[15], [30], [50]], d: v => `Les Memes infligent ${v[0]} % de dégâts en plus.` },
    da: { t: [2, 4, 6], v: [[1.5], [3], [5]], d: v => `Les Dessins animés récupèrent ${v[0]} % de leurs PV max chaque seconde.` },
    hero: { t: [2, 4, 6], v: [[20], [45], [80]], d: v => `Les Super-héros gagnent ${v[0]} d'armure et de résistance magique.` },
    vid: { t: [2, 4, 6], v: [[1], [2], [4]], d: v => `Tu gagnes ${v[0]} or de plus après chaque combat gagné.` },
    chat: { t: [2, 3], v: [[20, 15], [40, 30]], d: v => `Les Chats ont ${v[0]} % d'esquive et ${v[1]} % de vitesse d'attaque.` },
    col: { t: [2, 4, 6], v: [[200], [450], [800]], d: v => `Les Colosses gagnent ${v[0]} PV.` },
    bag: { t: [2, 4, 6], v: [[10], [20], [35]], d: v => `Les Bagarreurs se soignent de ${v[0]} % des dégâts qu'ils infligent.` },
    ass: { t: [2, 4, 6], v: [[15, 20], [30, 40], [50, 60]], d: v => `Les Assassins sautent sur la ligne arrière et gagnent ${v[0]} % de chance de critique et ${v[1]} % de dégâts critiques.` },
    tir: { t: [2, 4, 6], v: [[15], [35], [60]], d: v => `Les Tireurs gagnent ${v[0]} % de vitesse d'attaque.` },
    mag: { t: [2, 4, 6], v: [[20], [45], [80]], d: v => `Les Mages gagnent ${v[0]} % de puissance des sorts.` },
    sou: { t: [2, 3, 4], v: [[8], [14], [20]], d: v => `Toute ton équipe subit ${v[0]} % de dégâts en moins.` },
    str: { t: [2, 3, 4], v: [[8], [15], [25]], d: v => `Toute ton équipe inflige ${v[0]} % de dégâts en plus.` },
  };
  const CB = { col: { hp: 1.35, ad: .8, as: .6, rg: 1, ar: 45, m: 90 }, bag: { hp: 1.1, ad: 1, as: .7, rg: 1, ar: 35, m: 70 }, ass: { hp: .85, ad: 1.15, as: .8, rg: 1, ar: 25, m: 60 },
    tir: { hp: .8, ad: 1.1, as: .8, rg: 4, ar: 20, m: 70 }, mag: { hp: .8, ad: .7, as: .65, rg: 4, ar: 20, m: 80 }, sou: { hp: .85, ad: .6, as: .65, rg: 3, ar: 20, m: 80 }, str: { hp: .9, ad: .7, as: .65, rg: 3, ar: 25, m: 90 } };
  const HPB = [550, 700, 850, 1050, 1300], ADB = [45, 52, 62, 75, 95], SPD = [200, 260, 330, 430, 620], STAR = [1, 1.8, 3.24], SSTAR = [1, 1.5, 2.4];
  const COSTC = ["#8a94a6", "#2fbf71", "#3b82f6", "#b44cf0", "#f5b301"];
  const UN = {};   // unités du set
  const U = (n, c, cl, o, s) => { UN[n] = { n, c, cl, o, s }; };
  // --- Set 1 ---
  U("Rey Mysterio", 1, "ass", ["catch"], { k: "strike", p: 1.1, stun: 1.2, n: "619", t: "Frappe sa cible et l'étourdit." });
  U("Leedz Lewis", 1, "bag", ["catch"], { k: "aoeT", p: .8, r: 1, n: "Saut de la troisième corde", t: "Dégâts sur sa cible et les ennemis voisins." });
  U("Randy Orton", 2, "ass", ["catch"], { k: "strike", p: 1.5, tp: "low", n: "RKO", t: "Surgit sur l'ennemi le plus faible et lui inflige de gros dégâts." });
  U("Rhea Ripley", 3, "bag", ["catch"], { k: "strike", p: 1.3, stun: 1, n: "Riptide", t: "Projette sa cible : dégâts et étourdissement." });
  U("Kane", 3, "col", ["catch"], { k: "aoeT", p: .9, r: 1, stun: 1.2, n: "Chokeslam", t: "Soulève sa cible : dégâts et étourdissement autour d'elle." });
  U("John Cena", 4, "bag", ["catch"], { k: "strike", p: 1.4, untarg: 2, n: "Attitude Adjustment", t: "Gros dégâts, puis devient inciblable 2 s (« You can't see me »)." });
  U("The Undertaker", 5, "col", ["catch"], { k: "strike", p: 1.5, stun: 1.5, pas: "revive", n: "Tombstone", t: "Dégâts et étourdissement. Passif : se relève une fois après sa mort." });
  U("Raphaël Glucksmann", 1, "sou", ["pol"], { k: "heal", who: "low", p: 1.2, n: "Soutien", t: "Soigne l'allié le plus blessé." });
  U("Jordan Bardella", 2, "str", ["pol"], { k: "buff", who: "near", s: "as", v: .3, d: 4, n: "Meeting", t: "Les alliés proches gagnent 30 % de vitesse d'attaque pendant 4 s." });
  U("Jean-Luc Mélenchon", 2, "mag", ["pol"], { k: "line", p: 1, n: "Discours", t: "Dégâts à tous les ennemis sur une ligne." });
  U("Emmanuel Macron", 3, "str", ["pol"], { k: "shield", who: "all", p: .7, d: 5, n: "En même temps", t: "Donne un bouclier à toute l'équipe." });
  U("Charles de Gaulle", 4, "col", ["pol"], { k: "taunt", r: 2, d: 3, v: 40, n: "L'Appel", t: "Provoque les ennemis proches et donne de l'armure à toute l'équipe." });
  U("Napoléon Ier", 5, "str", ["pol"], { k: "summon", cnt: [2, 3, 5], hp: 420, ad: 45, sn: "Grognard", n: "Grande Armée", t: "Invoque des soldats de la Garde." });
  U("Ghostface", 1, "ass", ["hor"], { k: "strike", p: 1.3, phys: 1, n: "Coup de couteau", t: "Un coup critique garanti." });
  U("Freddy Fazbear", 2, "bag", ["hor", "jv"], { k: "aoeS", p: .5, r: 1, stun: 1.2, n: "Jumpscare", t: "Effraie et étourdit les ennemis adjacents." });
  U("Slender Man", 3, "mag", ["hor"], { k: "far", p: 1, stun: 2.5, n: "Apparition", t: "Immobilise l'ennemi le plus éloigné et le blesse." });
  U("SCP-096 · Le Timide", 4, "ass", ["hor"], { k: "strike", p: 1.2, pas: "enrage", n: "Rage", t: "Passif : dès qu'il est blessé, il s'enrage (+80 % de vitesse, +40 % de dégâts)." });
  U("Siren Head", 4, "tir", ["hor"], { k: "aoeT", p: .8, r: 2, stun: 1.5, n: "Sirène", t: "Étourdit les ennemis dans une large zone autour de sa cible." });
  U("Dracula", 5, "mag", ["hor"], { k: "multi", cnt: 3, p: 1, drain: 1, n: "Soif de sang", t: "Draine la vie de 3 ennemis et se soigne d'autant." });
  U("Tsuyu Asui", 1, "tir", ["manga"], { k: "far", p: .8, stun: 1, pull: 1, n: "Langue", t: "Attire l'ennemi le plus éloigné jusqu'à elle." });
  U("Misa Amane", 1, "mag", ["manga"], { k: "strike", p: .9, vuln: .25, d: 6, n: "Yeux de Shinigami", t: "Marque sa cible : elle subit 25 % de dégâts en plus." });
  U("Naruto Uzumaki", 2, "ass", ["manga"], { k: "summon", cnt: [2, 2, 3], clone: .5, sn: "Clone", n: "Multiclonage", t: "Crée des clones de lui-même." });
  U("Monkey D. Luffy", 3, "bag", ["manga"], { k: "strike", p: 1.6, n: "Gomu Gomu no Gatling", t: "Une rafale de coups sur sa cible." });
  U("Eren Jäger", 4, "col", ["manga"], { k: "transform", hp: 900, ad: .3, n: "Titan assaillant", t: "Se transforme en Titan : gagne beaucoup de PV et de dégâts." });
  U("Son Goku", 4, "bag", ["manga"], { k: "line", p: 1.3, n: "Kamehameha", t: "Un rayon qui traverse toute une ligne." });
  U("Satoru Gojo", 5, "mag", ["manga"], { k: "stunall", p: .6, stun: [2, 2.5, 4], n: "Extension du territoire", t: "Étourdit et blesse tous les ennemis." });
  U("Sonic", 1, "ass", ["jv"], { k: "line", p: .8, n: "Spin Dash", t: "Traverse la ligne ennemie en infligeant des dégâts." });
  U("Mario", 2, "bag", ["jv"], { k: "aoeT", p: .8, r: 1, stun: 1, n: "Saut", t: "Écrase sa cible : dégâts et étourdissement autour." });
  U("D.Va", 2, "col", ["jv"], { k: "boom", p: 1.1, r: 2, sh: 1, n: "Autodestruction", t: "Se protège 3 s, puis son méca explose dans une large zone." });
  U("Lara Croft", 3, "tir", ["jv"], { k: "multi", cnt: 2, p: 1.1, phys: 1, n: "Double tir", t: "Tire sur deux cibles à la fois." });
  U("GLaDOS", 4, "mag", ["jv"], { k: "aoeT", p: .3, r: 2, dot: 1.2, d: 4, n: "Neurotoxine", t: "Empoisonne une large zone pendant 4 s." });
  U("Kratos", 5, "bag", ["jv"], { k: "aoeS", p: 1.1, r: 2, ls: .4, n: "Rage de Sparte", t: "Frappe tout autour de lui et se soigne." });
  U("Moo Deng", 1, "col", ["meme"], { k: "strike", p: .8, selfArmor: 30, n: "Morsure", t: "Mord sa cible et gagne de l'armure pour le reste du combat." });
  U("Bongo Cat", 1, "sou", ["meme", "chat"], { k: "buff", who: "all", s: "as", v: .2, d: 4, n: "Rythme", t: "Toute l'équipe gagne 20 % de vitesse d'attaque pendant 4 s." });
  U("Grumpy Cat", 2, "mag", ["meme", "chat"], { k: "strike", p: .9, weaken: .4, d: 5, n: "« Non. »", t: "Blesse sa cible et réduit ses dégâts de 40 % pendant 5 s." });
  U("Pepe the Frog", 2, "mag", ["meme"], { k: "strike", p: 1.1, rnd: 1, n: "Feels", t: "Dégâts aléatoires : parfois faibles, parfois doublés." });
  U("Tung Tung Tung Sahur", 3, "bag", ["meme"], { k: "buff", who: "self", s: "as", v: .5, d: 6, n: "Tung tung tung", t: "Frappe de plus en plus vite (cumulable)." });
  U("Crazy Frog", 3, "tir", ["meme"], { k: "multi", cnt: 3, rndT: 1, p: .7, n: "Ring ding ding", t: "Fonce en moto et touche 3 ennemis au hasard." });
  U("Rick-ornichon", 4, "ass", ["meme"], { k: "strike", p: 1.4, reset: 1, n: "Massacre", t: "Gros dégâts. S'il élimine sa cible, il relance son sort aussitôt." });
  U("Trotro", 1, "sou", ["da"], { k: "heal", who: "near", p: .6, n: "Trotro rigolo", t: "Soigne les alliés proches." });
  U("Garfield le chat", 2, "col", ["da", "chat"], { k: "heal", who: "self", p: 1.6, selfArmor: 15, n: "Lasagnes", t: "Mange des lasagnes : se soigne et gagne de l'armure." });
  U("Perry l'ornithorynque", 3, "ass", ["da"], { k: "dodge", d: 2, v: .5, n: "Agent P", t: "Esquive toutes les attaques pendant 2 s, puis frappe plus fort." });
  U("M. Krabs", 3, "str", ["da"], { k: "strike", p: 1, pas: "goldkill", n: "Pince", t: "Pince sa cible. Passif : 1 or par élimination (2 max par combat)." });
  U("Shredder", 4, "bag", ["da"], { k: "aoeS", p: 1.1, r: 1, phys: 1, n: "Tourbillon de lames", t: "Tranche tous les ennemis adjacents." });
  U("Alastor", 5, "mag", ["da"], { k: "aoeT", p: .9, r: 3, stun: .6, n: "Tentacules d'ombre", t: "Frappe une immense zone." });
  U("Zorro", 1, "ass", ["hero"], { k: "strike", p: .5, dot: .9, d: 4, n: "Signe du Z", t: "Marque sa cible, qui saigne pendant 4 s." });
  U("Spider-Man", 2, "tir", ["hero"], { k: "strike", p: .9, stun: 2, n: "Toile", t: "Immobilise sa cible pendant 2 s." });
  U("Batman", 3, "ass", ["hero"], { k: "strike", p: 1.5, tp: "low", untarg: 1, n: "Fumigène", t: "Disparaît, puis frappe l'ennemi le plus faible." });
  U("Joker", 3, "mag", ["hero"], { k: "aoeT", p: .6, r: 2, slow: .4, d: 5, n: "Gaz hilarant", t: "Blesse une zone et ralentit les attaques de 40 %." });
  U("Iron Man", 4, "tir", ["hero"], { k: "line", p: 1.3, n: "Unirayon", t: "Un rayon qui traverse toute une ligne." });
  U("Hulk", 4, "col", ["hero"], { k: "aoeS", p: .9, r: 1, pas: "ramp", n: "Hulk écrase", t: "Frappe le sol. Passif : plus il perd de PV, plus il frappe fort." });
  U("Thanos", 5, "col", ["hero"], { k: "half", cnt: 2, pc: [.5, .6, .8], n: "Claquement de doigts", t: "Retire la moitié des PV des 2 ennemis les plus résistants." });
  U("Domingo", 1, "sou", ["vid"], { k: "mana", r: 2, v: 25, n: "Popcorn", t: "Donne 25 mana aux alliés proches." });
  U("Joueur du Grenier", 1, "bag", ["vid"], { k: "buff", who: "self", s: "as", v: .6, d: 4, n: "Rage", t: "S'énerve : +60 % de vitesse d'attaque pendant 4 s." });
  U("Maghla", 2, "mag", ["vid"], { k: "aoeT", p: .8, r: 1, n: "Hurlement", t: "Dégâts sur sa cible et les ennemis voisins." });
  U("Antoine Daniel", 3, "tir", ["vid"], { k: "far", p: 1.5, n: "What the Cut", t: "Un tir chargé sur l'ennemi le plus éloigné." });
  U("Squeezie", 4, "str", ["vid"], { k: "buff", who: "all", s: "amp", v: .2, d: 5, n: "Live", t: "Toute l'équipe inflige 20 % de dégâts en plus pendant 5 s." });
  U("MrBeast", 5, "sou", ["vid"], { k: "heal", who: "all", p: .7, sh: .5, pas: "goldwin", n: "Giveaway", t: "Soigne et protège toute l'équipe. Passif : +2 or si tu gagnes le combat." });
  const SET = Object.keys(UN);
  // monstres neutres : [nom, PV, dégâts, vitesse]
  const MON = { Dodo: [260, 22, .6], Capybara: [340, 26, .6], Loup: [380, 36, .8], Oie: [520, 48, .9], Sanglier: [900, 70, .7], "Ours brun": [1500, 95, .65] };
  const PVE = [[["Dodo", 2]], [["Capybara", 3]], [["Loup", 3]], [["Oie", 4]], [["Sanglier", 3]], [["Ours brun", 2], ["Loup", 2]], [["Ours brun", 3], ["Sanglier", 2]]];
  const ODDS = [[100, 0, 0, 0, 0], [100, 0, 0, 0, 0], [75, 25, 0, 0, 0], [55, 30, 15, 0, 0], [45, 33, 20, 2, 0], [30, 40, 25, 5, 0], [19, 30, 40, 10, 1], [17, 24, 32, 24, 3], [15, 18, 25, 30, 12]];
  const XPN = [2, 2, 6, 10, 20, 36, 56, 80], POOLN = [22, 20, 17, 10, 9], STAGEDMG = [0, 0, 2, 4, 6, 9, 13, 18, 25, 35];
  const BOTN = ["Kévin", "Josiane", "Gégé", "Mamie Lucette", "Dylan", "Brigitte", "Roger", "Cindy"];

  /* ---------- outils ---------- */
  const rng32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const NB = [[[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]], [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]]];
  const ROWS = 8, COLS = 7;
  const hd = (r1, c1, r2, c2) => { const x1 = c1 - (r1 - (r1 & 1)) / 2, x2 = c2 - (r2 - (r2 & 1)) / 2, dx = x1 - x2, dz = r1 - r2; return Math.max(Math.abs(dx), Math.abs(dz), Math.abs(dx + dz)); };
  const dist = (a, b) => hd(a.R, a.C, b.R, b.C);
  function traitsOf(list) { const seen = new Set(), n = {}; list.forEach(x => { if (seen.has(x.n) || !UN[x.n]) return; seen.add(x.n); const d = UN[x.n]; [...d.o, d.cl].forEach(k => n[k] = (n[k] || 0) + 1); }); return n; }
  const tier = (k, n) => { let i = -1; TR[k].t.forEach((t, j) => { if (n >= t) i = j; }); return i; };

  /* ---------- simulation de combat ---------- */
  const DT = .1;
  function mkUnit(S, side, x) {
    const u = { uid: S.units.length, side, n: x.n, star: x.star || 1, alive: true, buffs: [], dots: [], shield: 0, stunT: 0, untargT: 0, dodgeT: 0, atkCd: .4 + S.rng() * .4, moveCd: 0, mana: 0, kills: 0,
      critC: .25, critD: 1.4, dodge: 0, ls: 0, amp: 1, red: 0, sp: 1, manaAtk: 0, regen: 0, vuln: 0, vulnT: 0 };
    if (x.raw) Object.assign(u, { cost: 1, cl: "bag", o: [], maxhp: x.raw.hp, ad: x.raw.ad, as: x.raw.as, range: x.raw.rg || 1, armor: x.raw.ar || 15, mr: x.raw.ar || 15, maxMana: 0, spell: null, mon: 1, art: x.raw.art });
    else { const d = UN[x.n], b = CB[d.cl], st = STAR[u.star - 1];
      Object.assign(u, { cost: d.c, cl: d.cl, o: d.o, maxhp: HPB[d.c - 1] * b.hp * st, ad: ADB[d.c - 1] * b.ad * st, as: b.as, range: b.rg, armor: b.ar, mr: b.ar, maxMana: d.s.m || b.m, spell: d.s }); }
    u.R = side ? 3 - x.r : 4 + x.r; u.C = side ? 6 - x.c : x.c;
    return u;
  }
  function simInit(A, B, seed) {
    const S = { units: [], t: 0, rng: rng32(seed), ev: [], delayed: [], grid: {}, gold: [0, 0], goldWin: [0, 0], over: false, win: -1 };
    [A, B].forEach((T, side) => T.units.forEach(x => { const u = mkUnit(S, side, x); while (S.grid[u.R + "," + u.C]) { u.C = (u.C + 1) % COLS; } S.grid[u.R + "," + u.C] = u; S.units.push(u); }));
    [A, B].forEach((T, side) => { const cnt = traitsOf(T.units), mine = S.units.filter(u => u.side === side), foes = S.units.filter(u => u.side !== side);
      Object.keys(cnt).forEach(k => { const ti = tier(k, cnt[k]); if (ti < 0) return; const v = TR[k].v[ti], mem = mine.filter(u => u.o && (u.o.includes(k) || u.cl === k) && !u.mon);
        if (k === "catch") mem.forEach(u => { u.maxhp += v[0]; u.ad *= 1 + v[1] / 100; });
        else if (k === "pol") mine.forEach(u => u.shield += v[0]);
        else if (k === "hor") foes.forEach(u => { u.armor *= 1 - v[0] / 100; u.mr *= 1 - v[0] / 100; });
        else if (k === "manga") mem.forEach(u => u.manaAtk += v[0]);
        else if (k === "jv") mine.forEach(u => u.as *= 1 + v[0] / 100);
        else if (k === "meme") mem.forEach(u => u.amp += v[0] / 100);
        else if (k === "da") mem.forEach(u => u.regen += v[0] / 100);
        else if (k === "hero") mem.forEach(u => { u.armor += v[0]; u.mr += v[0]; });
        else if (k === "vid") S.goldWin[side] += v[0];
        else if (k === "chat") mem.forEach(u => { u.dodge += v[0] / 100; u.as *= 1 + v[1] / 100; });
        else if (k === "col") mem.forEach(u => u.maxhp += v[0]);
        else if (k === "bag") mem.forEach(u => u.ls += v[0] / 100);
        else if (k === "ass") mem.forEach(u => { u.critC += v[0] / 100; u.critD += v[1] / 100; });
        else if (k === "tir") mem.forEach(u => u.as *= 1 + v[0] / 100);
        else if (k === "mag") mem.forEach(u => u.sp += v[0] / 100);
        else if (k === "sou") mine.forEach(u => u.red += v[0] / 100);
        else if (k === "str") mine.forEach(u => u.amp += v[0] / 100);
      }); });
    S.units.forEach(u => { u.hp = u.maxhp; if (u.spell && u.spell.pas === "revive") u.revive = true; if (u.spell && u.spell.pas === "goldwin") S.goldWin[u.side] += 2; });
    // les assassins sautent sur la ligne arrière
    S.units.filter(u => u.cl === "ass" && !u.mon).forEach(u => { const foes = S.units.filter(e => e.side !== u.side); if (!foes.length) return;
      const back = foes.slice().sort((a, b) => u.side ? b.R - a.R : a.R - b.R)[0], f = freeNear(S, back.R + (u.side ? 1 : -1), back.C, back); if (f) place(S, u, f[0], f[1]); });
    return S;
  }
  const inB = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
  function place(S, u, r, c) { if (S.grid[u.R + "," + u.C] === u) delete S.grid[u.R + "," + u.C]; u.R = r; u.C = c; S.grid[r + "," + c] = u; }
  function freeNear(S, r, c, around) {
    r = Math.max(0, Math.min(ROWS - 1, r)); c = Math.max(0, Math.min(COLS - 1, c));
    if (!S.grid[r + "," + c]) return [r, c];
    let best = null, bd = 99; for (let R = 0; R < ROWS; R++) for (let C = 0; C < COLS; C++) { if (S.grid[R + "," + C]) continue; const d = hd(R, C, around ? around.R : r, around ? around.C : c) + hd(R, C, r, c) * .01; if (d < bd) { bd = d; best = [R, C]; } }
    return best;
  }
  const bsum = (S, u, s) => { let v = 0; for (const b of u.buffs) if (b.s === s && b.until > S.t) v += b.v; return v; };
  const foesOf = (S, u) => S.units.filter(e => e.alive && e.side !== u.side), alliesOf = (S, u) => S.units.filter(e => e.alive && e.side === u.side);
  const targetable = (S, e) => e.alive && e.untargT <= S.t;
  function heal(S, u, v, quiet) { if (!u.alive || v <= 0) return; const h = Math.min(v, u.maxhp - u.hp); u.hp += h; if (!quiet && h > 1) S.ev.push({ k: "heal", u: u.uid, v: Math.round(h) }); }
  function dmg(S, src, t, amt, type, o) {
    o = o || {}; if (!t.alive || amt <= 0) return 0;
    if (src) amt *= src.amp + bsum(S, src, "amp"); if (src && bsum(S, src, "weak")) amt *= Math.max(.2, 1 - bsum(S, src, "weak"));
    const res = type === "p" ? t.armor + bsum(S, t, "armor") : type === "m" ? t.mr + bsum(S, t, "armor") : 0;
    amt *= 100 / (100 + Math.max(0, res)); amt *= 1 - Math.min(.6, t.red); if (t.vulnT > S.t) amt *= 1 + t.vuln;
    let left = amt; if (t.shield > 0) { const a = Math.min(t.shield, left); t.shield -= a; left -= a; }
    t.hp -= left; if (!o.dot) { S.ev.push({ k: "dmg", u: t.uid, v: Math.round(amt), c: o.crit ? 1 : 0, m: type === "m" ? 1 : 0 }); if (t.maxMana) t.mana = Math.min(t.maxMana, t.mana + Math.min(12, amt * .04)); }
    if (src && src.alive && src.ls) heal(S, src, amt * src.ls, true);
    if (t.spell && t.spell.pas === "enrage" && !t.enraged) { t.enraged = true; t.buffs.push({ s: "as", v: .8, until: 999 }, { s: "ad", v: .4, until: 999 }); S.ev.push({ k: "cast", u: t.uid, n: "Rage" }); }
    if (t.hp <= 0) {
      if (t.revive) { t.revive = false; t.hp = t.maxhp * .4; t.stunT = S.t + .8; t.dots = []; S.ev.push({ k: "cast", u: t.uid, n: "Se relève !" }); }
      else { t.alive = false; t.hp = 0; delete S.grid[t.R + "," + t.C]; S.ev.push({ k: "die", u: t.uid });
        if (src) { src.kills++; if (src.spell && src.spell.pas === "goldkill" && (src.gk || 0) < 2) { src.gk = (src.gk || 0) + 1; S.gold[src.side]++; S.ev.push({ k: "gold", u: src.uid }); } if (o.reset && src.alive) src.mana = src.maxMana; } }
    }
    return amt;
  }
  const SD = (u, p) => SPD[u.cost - 1] * SSTAR[u.star - 1] * u.sp * p;
  const within = (S, list, R, C, r) => list.filter(e => hd(e.R, e.C, R, C) <= r);
  function applyHit(S, u, e, sp, base) {
    const o = { reset: sp.reset };
    let p = base; if (sp.rnd) p *= .4 + S.rng() * 1.7;
    if (sp.phys) dmg(S, u, e, p + u.ad * (1 + bsum(S, u, "ad")) * 1.2, "p", Object.assign(o, { crit: 1 })); else dmg(S, u, e, p, "m", o);
    if (!e.alive) return;
    if (sp.stun) e.stunT = Math.max(e.stunT, S.t + (Array.isArray(sp.stun) ? sp.stun[u.star - 1] : sp.stun));
    if (sp.vuln) { e.vuln = sp.vuln; e.vulnT = S.t + sp.d; }
    if (sp.weaken) e.buffs.push({ s: "weak", v: sp.weaken, until: S.t + sp.d });
    if (sp.slow) e.buffs.push({ s: "as", v: -sp.slow, until: S.t + sp.d });
    if (sp.dot) e.dots.push({ src: u, dps: SD(u, sp.dot) / sp.d, until: S.t + sp.d });
  }
  function cast(S, u) {
    const sp = u.spell, foes = foesOf(S, u).filter(e => targetable(S, e)), allies = alliesOf(S, u);
    S.ev.push({ k: "cast", u: u.uid, n: sp.n }); u.atkCd = Math.max(u.atkCd, .35);
    if (!foes.length && !["heal", "shield", "buff", "mana", "summon", "transform", "dodge"].includes(sp.k)) return;
    let t = u.tgt && targetable(S, u.tgt) ? u.tgt : foes.slice().sort((a, b) => dist(u, a) - dist(u, b))[0];
    const far = () => foes.slice().sort((a, b) => dist(u, b) - dist(u, a))[0], low = () => foes.slice().sort((a, b) => a.hp - b.hp)[0];
    switch (sp.k) {
      case "strike": {
        if (sp.tp === "low") { t = low(); const f = freeNear(S, t.R, t.C, t); if (f) { place(S, u, f[0], f[1]); S.ev.push({ k: "tp", u: u.uid }); } u.tgt = t; }
        applyHit(S, u, t, sp, SD(u, sp.p));
        if (sp.untarg) u.untargT = S.t + sp.untarg;
        if (sp.selfArmor) u.armor += sp.selfArmor * u.star, u.mr += sp.selfArmor * u.star;
        break; }
      case "aoeT": within(S, foes, t.R, t.C, sp.r).forEach(e => applyHit(S, u, e, sp, SD(u, sp.p))); S.ev.push({ k: "zone", R: t.R, C: t.C, r: sp.r, side: u.side }); break;
      case "aoeS": { let tot = 0; within(S, foes, u.R, u.C, sp.r).forEach(e => { const h0 = e.hp + e.shield; applyHit(S, u, e, sp, SD(u, sp.p)); tot += h0 - (e.hp + e.shield); }); if (sp.ls) heal(S, u, tot * sp.ls); S.ev.push({ k: "zone", R: u.R, C: u.C, r: sp.r, side: u.side }); break; }
      case "line": { const pts = []; let x0 = u.C + (u.R & 1) * .5, x1 = t.C + (t.R & 1) * .5, dx = x1 - x0, dy = t.R - u.R, L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
        foes.forEach(e => { const ex = e.C + (e.R & 1) * .5 - x0, ey = e.R - u.R, along = ex * dx + ey * dy, off = Math.abs(ex * dy - ey * dx); if (along > -.2 && off < .75) pts.push(e); });
        pts.forEach(e => applyHit(S, u, e, sp, SD(u, sp.p))); S.ev.push({ k: "beam", a: u.uid, dx, dy }); break; }
      case "multi": { const L = (sp.rndT ? foes.slice().sort(() => S.rng() - .5) : foes.slice().sort((a, b) => dist(u, a) - dist(u, b))).slice(0, sp.cnt); let tot = 0;
        L.forEach(e => { const h0 = e.hp + e.shield; applyHit(S, u, e, sp, SD(u, sp.p)); tot += h0 - (e.hp + e.shield); S.ev.push({ k: "shot", a: u.uid, b: e.uid }); }); if (sp.drain) heal(S, u, tot); break; }
      case "far": { const e = far(); S.ev.push({ k: "shot", a: u.uid, b: e.uid }); if (sp.pull) { const f = freeNear(S, u.R + (u.side ? 1 : -1), u.C, u); if (f) { place(S, e, f[0], f[1]); S.ev.push({ k: "tp", u: e.uid }); } } applyHit(S, u, e, sp, SD(u, sp.p)); break; }
      case "heal": { const L = sp.who === "self" ? [u] : sp.who === "low" ? [allies.slice().sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0]] : sp.who === "near" ? within(S, allies, u.R, u.C, 2) : allies;
        L.forEach(a => { heal(S, a, SD(u, sp.p)); if (sp.sh) { a.shield += SD(u, sp.sh); } }); if (sp.selfArmor) { u.armor += sp.selfArmor * u.star; u.mr += sp.selfArmor * u.star; } break; }
      case "shield": allies.forEach(a => a.shield += SD(u, sp.p)); break;
      case "buff": { const L = sp.who === "self" ? [u] : sp.who === "near" ? within(S, allies, u.R, u.C, 2) : allies; L.forEach(a => a.buffs.push({ s: sp.s, v: sp.v * (1 + (u.star - 1) * .4), until: S.t + sp.d })); break; }
      case "mana": within(S, allies, u.R, u.C, sp.r).forEach(a => { if (a !== u && a.maxMana) a.mana = Math.min(a.maxMana, a.mana + sp.v * u.star); }); break;
      case "taunt": within(S, foes, u.R, u.C, sp.r).forEach(e => { e.taunt = { by: u, until: S.t + sp.d }; }); allies.forEach(a => a.buffs.push({ s: "armor", v: sp.v * u.star, until: S.t + 5 })); u.shield += SD(u, .8); break;
      case "summon": { const n = sp.cnt[u.star - 1]; for (let i = 0; i < n; i++) { const f = freeNear(S, u.R + (u.side ? 1 : -1), u.C + i - 1, u); if (!f) break;
          const raw = sp.clone ? { hp: u.maxhp * sp.clone, ad: u.ad * sp.clone, as: u.as, rg: 1, ar: 20, art: u.n } : { hp: sp.hp * SSTAR[u.star - 1], ad: sp.ad * SSTAR[u.star - 1], as: .7, rg: 1, ar: 25, art: u.n };
          const s = mkUnit(S, u.side, { n: sp.sn, raw, r: 0, c: 0 }); s.R = f[0]; s.C = f[1]; s.hp = s.maxhp; s.sum = 1; s.amp = u.amp; S.grid[f[0] + "," + f[1]] = s; S.units.push(s); S.ev.push({ k: "spawn", u: s.uid }); } break; }
      case "transform": if (!u.tf) { u.tf = 1; const h = sp.hp * SSTAR[u.star - 1]; u.maxhp += h; u.hp += h; u.buffs.push({ s: "ad", v: sp.ad, until: 999 }); u.big = 1; } else heal(S, u, u.maxhp * .25); break;
      case "stunall": foes.forEach(e => applyHit(S, u, e, sp, SD(u, sp.p))); S.ev.push({ k: "flash", side: u.side }); break;
      case "half": foes.slice().sort((a, b) => b.hp - a.hp).slice(0, sp.cnt).forEach(e => { dmg(S, u, e, e.hp * sp.pc[u.star - 1], "t"); S.ev.push({ k: "shot", a: u.uid, b: e.uid }); }); S.ev.push({ k: "flash", side: u.side }); break;
      case "dodge": u.dodgeT = S.t + sp.d; u.buffs.push({ s: "ad", v: sp.v * u.star, until: S.t + sp.d + 4 }); break;
      case "boom": u.shield += SD(u, sp.sh); S.delayed.push({ t: S.t + 3, fn: () => { if (!u.alive) return; within(S, foesOf(S, u), u.R, u.C, sp.r).forEach(e => dmg(S, u, e, SD(u, sp.p), "m")); S.ev.push({ k: "zone", R: u.R, C: u.C, r: sp.r, side: u.side }); } }); break;
    }
  }
  function step(S) {
    S.t += DT;
    if (S.delayed.length) { const due = S.delayed.filter(d => d.t <= S.t); S.delayed = S.delayed.filter(d => d.t > S.t); due.forEach(d => d.fn()); }
    for (let i = 0; i < S.units.length; i++) { const u = S.units[i]; if (!u.alive) continue;
      if (u.dots.length) { for (const d of u.dots) if (d.until > S.t && u.alive) dmg(S, d.src, u, d.dps * DT, "m", { dot: 1 }); u.dots = u.dots.filter(d => d.until > S.t); if (!u.alive) continue; }
      if (u.regen) heal(S, u, u.maxhp * u.regen * DT, true);
      u.atkCd -= DT; u.moveCd -= DT;
      if (u.stunT > S.t) continue;
      if (u.spell && u.maxMana && u.mana >= u.maxMana) { u.mana = 0; cast(S, u); continue; }
      let t = u.tgt; const foes = foesOf(S, u).filter(e => targetable(S, e));
      if (u.taunt && u.taunt.until > S.t && u.taunt.by.alive) t = u.taunt.by;
      else if (!t || !targetable(S, t)) { t = null; let bd = 99; for (const e of foes) { const d = dist(u, e) + S.rng() * .1; if (d < bd) { bd = d; t = e; } } }
      u.tgt = t; if (!t) continue;
      const d = dist(u, t);
      if (d <= u.range) { if (u.atkCd <= 0) attack(S, u, t); }
      else if (u.moveCd <= 0) { let best = null, bd = d; for (const [dr, dc] of NB[u.R & 1]) { const r = u.R + dr, c = u.C + dc; if (!inB(r, c) || S.grid[r + "," + c]) continue; const nd = hd(r, c, t.R, t.C) + S.rng() * .2; if (nd < bd) { bd = nd; best = [r, c]; } }
        if (best) { place(S, u, best[0], best[1]); u.moveCd = .32; }
        else if (S.rng() < .25) { for (const e of foes) if (dist(u, e) <= u.range) { u.tgt = e; break; } } }
    }
    const a = S.units.some(u => u.alive && u.side === 0), b = S.units.some(u => u.alive && u.side === 1);
    if (!a || !b || S.t >= 45) { S.over = true; const hp = s => S.units.filter(u => u.alive && u.side === s).reduce((x, u) => x + u.hp / u.maxhp, 0);
      S.win = a && !b ? 0 : b && !a ? 1 : hp(0) > hp(1) ? 0 : hp(1) > hp(0) ? 1 : -1; S.left = [0, 1].map(s => S.units.filter(u => u.alive && u.side === s && !u.sum).length); }
  }
  function attack(S, u, t) {
    u.atkCd = 1 / Math.min(3.5, Math.max(.2, u.as * (1 + bsum(S, u, "as"))));
    S.ev.push({ k: u.range > 1 ? "shot" : "atk", a: u.uid, b: t.uid });
    if (t.dodgeT > S.t || S.rng() < t.dodge) { S.ev.push({ k: "miss", u: t.uid }); return; }
    let a = u.ad * (1 + bsum(S, u, "ad")); if (u.spell && u.spell.pas === "ramp") a *= 1 + (1 - u.hp / u.maxhp);
    const crit = S.rng() < u.critC; if (crit) a *= u.critD;
    dmg(S, u, t, a, "p", { crit });
    if (u.maxMana) u.mana = Math.min(u.maxMana, u.mana + 10 + u.manaAtk);
  }
  function simRun(A, B, seed) { const S = simInit(A, B, seed); let n = 0; while (!S.over && n++ < 600) { step(S); S.ev.length = 0; } return S; }

  /* ---------- partie ---------- */
  let G = null;
  const newPlayer = (id, name, bot) => ({ id, name, bot, hp: 100, gold: 0, lvl: 1, xp: 0, board: [], bench: Array(9).fill(null), streak: 0, alive: true, shop: [], lock: false, place: 0 });
  function newGame(diff, seed) {
    const rng = rng32(seed || (Date.now() & 0x7fffffff)), names = BOTN.slice().sort(() => rng() - .5);
    G = { diff, rng, ri: 0, phase: "plan", players: [newPlayer(0, "Toi", false)], pool: {}, out: 0, log: [] };
    for (let i = 1; i < 8; i++) G.players.push(newPlayer(i, "Bot " + names[i - 1], true));
    SET.forEach(n => G.pool[n] = POOLN[UN[n].c - 1]);
    G.me = G.players[0]; roundStart(); return G;
  }
  // manches : 3 manches de monstres, puis des blocs de 6 combats + 1 manche de monstres
  const roundInfo = i => i < 3 ? { st: 1, k: i + 1, pve: i } : { st: 2 + Math.floor((i - 3) / 7), k: (i - 3) % 7 + 1, pve: (i - 3) % 7 === 6 ? Math.min(PVE.length - 1, 3 + Math.floor((i - 3) / 7)) : -1 };
  function rollShop(p) {
    const od = ODDS[p.lvl - 1]; p.shop = [];
    for (let s = 0; s < 5; s++) { let x = G.rng() * 100, c = 0; while (c < 4 && x >= od[c]) { x -= od[c]; c++; }
      let L = SET.filter(n => UN[n].c === c + 1 && G.pool[n] > 0); if (!L.length) L = SET.filter(n => G.pool[n] > 0);
      let tot = L.reduce((a, n) => a + G.pool[n], 0), y = G.rng() * tot, pick = L[0]; for (const n of L) { y -= G.pool[n]; if (y <= 0) { pick = n; break; } } p.shop.push(pick); }
  }
  const owned = p => p.board.concat(p.bench.filter(Boolean));
  function merge(p) {
    let again = true, made = [];
    while (again) { again = false; const cnt = {}; owned(p).forEach(x => { const k = x.n + "|" + x.star; (cnt[k] = cnt[k] || []).push(x); });
      for (const k in cnt) { const L = cnt[k]; if (L.length >= 3 && L[0].star < 3) { const keep = L.find(x => p.board.includes(x)) || L[0], rm = L.filter(x => x !== keep).slice(0, 2);
          rm.forEach(x => { const bi = p.board.indexOf(x); if (bi >= 0) p.board.splice(bi, 1); else p.bench[p.bench.indexOf(x)] = null; }); keep.star++; made.push(keep); again = true; break; } } }
    return made;
  }
  function buy(p, i) {
    const n = p.shop[i]; if (!n) return "vide"; const c = UN[n].c; if (p.gold < c) return "Pas assez d'or.";
    let slot = p.bench.indexOf(null);
    if (slot < 0) { const same = owned(p).filter(x => x.n === n && x.star === 1).length; if (same < 2) return "Ton banc est plein."; }
    p.gold -= c; G.pool[n]--; p.shop[i] = null; const x = { n, star: 1 };
    if (slot >= 0) p.bench[slot] = x; else { p.bench.push(x); }
    const made = merge(p); p.bench = p.bench.filter((x, k) => k < 9 || x); while (p.bench.length < 9) p.bench.push(null);
    if (p.bench.length > 9) { const extra = p.bench.splice(9).filter(Boolean); extra.forEach(e => { const s = p.bench.indexOf(null); if (s >= 0) p.bench[s] = e; }); }
    return made.length ? made : null;
  }
  const sellVal = x => { const c = UN[x.n].c; return x.star === 1 ? c : c * Math.pow(3, x.star - 1) - 1; };
  function sell(p, x) { const bi = p.board.indexOf(x); if (bi >= 0) p.board.splice(bi, 1); else { const i = p.bench.indexOf(x); if (i < 0) return; p.bench[i] = null; } p.gold += sellVal(x); G.pool[x.n] += Math.pow(3, x.star - 1); }
  function buyXp(p) { if (p.gold < 4 || p.lvl >= 9) return false; p.gold -= 4; addXp(p, 4); return true; }
  function addXp(p, v) { if (p.lvl >= 9) return; p.xp += v; while (p.lvl < 9 && p.xp >= XPN[p.lvl - 1]) { p.xp -= XPN[p.lvl - 1]; p.lvl++; } }
  function reroll(p) { if (p.gold < 2) return false; p.gold -= 2; rollShop(p); return true; }
  const income = (p, ri) => { const base = ri < 4 ? Math.min(5, 2 + ri) : 5, st = Math.abs(p.streak); return base + Math.min(5, Math.floor(p.gold / 10)) + (st >= 5 ? 3 : st >= 4 ? 2 : st >= 2 ? 1 : 0); };
  function roundStart() {
    const ri = G.ri, inf = roundInfo(ri); G.info = inf; G.phase = "plan";
    G.players.filter(p => p.alive).forEach(p => {
      const mul = p.bot ? ({ facile: .75, normal: 1, difficile: 1.2 })[G.diff] : 1;
      p.gold += Math.round(income(p, ri) * mul); if (ri > 0) addXp(p, 2);
      if (!p.lock) rollShop(p); p.lock = false;
      if (p.bot) botTurn(p);
    });
  }
  /* ---------- bots ---------- */
  function botTurn(p) {
    const hard = G.diff === "difficile", easy = G.diff === "facile";
    const reserve = () => easy ? 0 : p.hp < 40 ? 0 : Math.min(hard ? 50 : 30, Math.floor(p.gold / 10) * 10);
    const score = n => { const d = UN[n], own = owned(p), same = own.filter(x => x.n === n).length, tr = traitsOf(own); let s = same * 4 + d.c * (easy ? .2 : .6); [...d.o, d.cl].forEach(k => { if (tr[k]) s += easy ? .5 : 1.5; }); return s; };
    for (let pass = 0; pass < (hard ? 4 : easy ? 1 : 2); pass++) {
      p.shop.map((n, i) => [n, i]).filter(x => x[0]).sort((a, b) => score(b[0]) - score(a[0])).forEach(([n, i]) => {
        const c = UN[n].c, sc = score(n), need = owned(p).length < p.lvl + 2;
        if (p.gold - c < (sc >= 4 ? 0 : reserve())) return; if (!need && sc < 3.5) return;
        if (p.bench.indexOf(null) < 0) { const w = p.bench.filter(Boolean).sort((a, b) => score(a.n) * a.star - score(b.n) * b.star)[0]; if (w && score(w.n) < sc && w.star === 1) sell(p, w); else return; }
        buy(p, i); });
      if (p.lvl < 9 && p.gold - 4 >= reserve() && owned(p).length >= p.lvl) { buyXp(p); }
      if (pass < 3 && p.gold - 2 >= reserve() + (hard ? 0 : 10) && !easy) reroll(p); else break;
    }
    // placement : les meilleures unités sur le plateau, mêlée devant, distance derrière
    const all = owned(p).sort((a, b) => UN[b.n].c * b.star * b.star + score(b.n) * .3 - (UN[a.n].c * a.star * a.star + score(a.n) * .3));
    const seen = new Set(), on = [], off = []; all.forEach(x => { if (on.length < p.lvl && !seen.has(x.n)) { seen.add(x.n); on.push(x); } else off.push(x); });
    while (off.length > 9) { const w = off.pop(); G.pool[w.n] += Math.pow(3, w.star - 1); p.gold += sellVal(w); }
    p.board = on; p.bench = off.concat(Array(9).fill(null)).slice(0, 9);
    const front = on.filter(x => CB[UN[x.n].cl].rg === 1), back = on.filter(x => CB[UN[x.n].cl].rg > 1), cols = [3, 2, 4, 1, 5, 0, 6];
    front.forEach((x, i) => { x.r = i < 7 ? 0 : 1; x.c = cols[i % 7]; }); back.forEach((x, i) => { x.r = i < 7 ? 3 : 2; x.c = cols[i % 7]; });
  }
  const teamOf = p => ({ units: p.board.map(x => ({ n: x.n, star: x.star, r: x.r, c: x.c })) });
  function pveTeam(idx, ri) { const L = [], sc = 1 + Math.max(0, ri - 3) * .06; let i = 0; PVE[idx].forEach(([n, k]) => { for (let j = 0; j < k; j++) { const m = MON[n]; L.push({ n, raw: { hp: m[0] * sc, ad: m[1] * sc, as: m[2], art: n }, r: i > 4 ? 1 : 0, c: [3, 1, 5, 2, 4, 0, 6][i % 7] }); i++; } }); return { units: L }; }
  // prépare les affrontements de la manche ; renvoie le combat du joueur
  function prepareFights() {
    const inf = G.info, alive = G.players.filter(p => p.alive), seed = () => Math.floor(G.rng() * 1e9); G.fights = [];
    if (inf.pve >= 0) alive.forEach(p => G.fights.push({ a: p, b: null, B: pveTeam(inf.pve, G.ri), seed: seed() }));
    else { const L = alive.slice().sort(() => G.rng() - .5); while (L.length >= 2) { const a = L.pop(), b = L.pop(); G.fights.push({ a, b, B: teamOf(b), seed: seed() }); }
      if (L.length) { const a = L[0], o = alive.filter(p => p !== a), g = o[Math.floor(G.rng() * o.length)]; G.fights.push({ a, b: null, ghost: g, B: teamOf(g), seed: seed() }); } }
    G.fights.forEach(f => { if (f.b === G.me) { const t = f.a; f.a = f.b; f.b = t; f.B = teamOf(t); } f.A = teamOf(f.a); });
    return G.fights.find(f => f.a === G.me);
  }
  function resolveFight(f, S) {
    const inf = G.info, res = [];
    const lose = (p, n) => { const d = STAGEDMG[Math.min(inf.st, STAGEDMG.length - 1)] + n * (inf.pve >= 0 ? 1 : 2); p.hp -= d; p.streak = p.streak < 0 ? p.streak - 1 : -1; return d; };
    const win = (p, side) => { p.streak = inf.pve >= 0 ? p.streak : p.streak > 0 ? p.streak + 1 : 1; p.gold += (inf.pve >= 0 ? 0 : 1) + S.goldWin[side]; };
    f.a.gold += S.gold[0]; if (f.b) f.b.gold += S.gold[1];
    if (inf.pve >= 0) { if (S.win === 0) { win(f.a, 0); f.a.gold += 2 + Math.min(3, inf.pve); f.res = { w: 1, g: 2 + Math.min(3, inf.pve) }; } else f.res = { w: 0, d: lose(f.a, S.left[1]) }; return; }
    if (S.win === 0) { win(f.a, 0); f.res = { w: 1 }; if (f.b) lose(f.b, S.left[0]); }
    else if (S.win === 1) { f.res = { w: 0, d: lose(f.a, S.left[1]) }; if (f.b) win(f.b, 1); }
    else { f.res = { w: 0, d: lose(f.a, 1) }; if (f.b) lose(f.b, 1); }
  }
  function roundEnd() {
    const dead = G.players.filter(p => p.alive && p.hp <= 0).sort((a, b) => a.hp - b.hp);
    dead.forEach(p => { p.alive = false; p.place = 8 - G.out; G.out++; owned(p).forEach(x => G.pool[x.n] += Math.pow(3, x.star - 1)); p.board = []; p.bench = Array(9).fill(null); });
    const alive = G.players.filter(p => p.alive);
    if (!G.me.alive) { G.phase = "over"; return; }
    if (alive.length === 1) { G.me.place = 1; G.phase = "over"; return; }
    G.ri++; roundStart();
  }
  // joue le reste de la manche sans affichage (les combats des bots)
  function resolveOthers(mine) { G.fights.forEach(f => { if (f === mine) return; const S = simRun(f.A, f.B, f.seed); resolveFight(f, S); }); }

  /* ---------- interface ---------- */
  let API = null, root = null, UI = { sel: null, speed: 1, timer: null, tleft: 0, sim: null, loop: null, info: null };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const $ = s => root.querySelector(s);
  const artOf = n => { const id = IDS[n] || IDS[(UN[n] || {}).n]; const a = (API && id && API.art(id)) || {}; return { url: a.url || "", px: a.px == null ? 50 : a.px, py: a.py == null ? 25 : a.py, nm: a.nm || n }; };
  const bg = n => { const a = artOf(n); return a.url ? `background-image:url('${String(a.url).replace(/'/g, "%27")}');background-position:${a.px}% ${a.py}%` : ""; };
  const stars = s => "★".repeat(s);
  const tokenHTML = (n, star, cost, extra) => `<div class="ar-tok c${cost} s${star} ${extra || ""}"><div class="ar-hex" style="${bg(n)}"></div><span class="ar-st">${stars(star)}</span></div>`;
  const hexPos = (R, C) => `left:${((C + (R & 1) * .5) / 7.5 * 100).toFixed(3)}%;top:${(R * .75 / 6.25 * 100).toFixed(3)}%`;
  function open(api) {
    API = api; if (root) root.remove();
    root = document.createElement("div"); root.id = "arena"; document.body.appendChild(root); document.body.classList.add("ar-open");
    menu();
  }
  function close() { stopLoop(); clearInterval(UI.timer); if (root) root.remove(); root = null; document.body.classList.remove("ar-open"); G = null; }
  function menu() {
    root.innerHTML = `<div class="ar-menu"><h1>⚔️ Wiki Arena</h1><p class="ar-adm">🔒 En construction : visible seulement par les admins</p>
      <p>Recrute des cartes dans la boutique, place-les sur ton plateau et regarde-les se battre. Trois cartes identiques fusionnent en ★★, puis en ★★★. Réunis des cartes du même univers ou de la même classe pour activer des synergies. Dernier joueur en vie : victoire !</p>
      <p><b>Étape 1 :</b> solo contre 7 bots, set 1 (58 unités). Les objets, les boss, le multijoueur et le duo arrivent ensuite.</p>
      <div class="ar-diff"><span>Difficulté des bots :</span>${[["facile", "Facile"], ["normal", "Normal"], ["difficile", "Difficile"]].map(([k, l]) => `<button class="ar-b ${k === "normal" ? "on" : ""}" data-diff="${k}">${l}</button>`).join("")}</div>
      <div class="ar-row"><button class="ar-b big go" data-act="start">Lancer la partie</button><button class="ar-b" data-act="help">Règles</button><button class="ar-b" data-act="quit">Quitter</button></div></div>`;
    root.onclick = e => { const d = e.target.closest("[data-diff]"); if (d) { root.querySelectorAll("[data-diff]").forEach(b => b.classList.toggle("on", b === d)); return; }
      const a = e.target.closest("[data-act]"); if (!a) return; if (a.dataset.act === "quit") return close(); if (a.dataset.act === "help") return help();
      if (a.dataset.act === "start") { newGame((root.querySelector("[data-diff].on") || {}).dataset.diff || "normal"); build(); } };
  }
  function help() {
    const m = document.createElement("div"); m.className = "ar-modal"; m.innerHTML = `<div class="ar-sheet"><h2>Règles</h2>
      <p><b>Boutique :</b> 5 cartes par manche. Acheter coûte le prix de la carte (1 à 5 or). Relancer coûte 2 or. Le cadenas garde ta boutique pour la manche suivante.</p>
      <p><b>Or :</b> tu gagnes 5 or par manche, +1 par tranche de 10 or gardés (intérêts, 5 max), +1 par victoire, et un bonus pour les séries de victoires ou de défaites.</p>
      <p><b>Niveau :</b> ton niveau fixe le nombre d'unités sur le plateau et la rareté des cartes en boutique. 4 or = 4 XP.</p>
      <p><b>Étoiles :</b> 3 cartes identiques fusionnent en ★★ (bien plus fortes), 3 ★★ en ★★★.</p>
      <p><b>Combat :</b> automatique. Les unités attaquent, gagnent du mana et lancent leur sort quand la barre bleue est pleine. Colosses, Bagarreurs et Assassins se battent au corps à corps ; Tireurs, Mages, Soutiens et Stratèges à distance.</p>
      <p><b>Jouer :</b> touche une unité pour la sélectionner et voir sa fiche, puis touche une case de ton plateau ou du banc pour la déplacer. « Vendre » la rend contre de l'or.</p>
      <h3>Synergies</h3>${Object.keys(TR).map(k => `<p>${TICO(k)} <b>${TNAME(k)}</b> (${TR[k].t.join(" / ")}) : ${TR[k].t.map((t, i) => TR[k].d(TR[k].v[i])).slice(-1)[0].replace(/\d+(\.\d+)?/g, m => m)}</p>`).join("")}
      <button class="ar-b" data-x>Fermer</button></div>`;
    root.appendChild(m); m.onclick = e => { if (e.target === m || e.target.closest("[data-x]")) m.remove(); };
  }
  function build() {
    root.innerHTML = `<div class="ar-top"><span class="ar-round" id="ar-round"></span><span class="ar-timer" id="ar-timer"></span><span class="ar-me" id="ar-me"></span>
        <span class="ar-tools"><button class="ar-b mini" data-act="speed" id="ar-speed">×1</button><button class="ar-b mini" data-act="help">?</button><button class="ar-b mini" data-act="quit">✕</button></span></div>
      <div class="ar-mid"><div class="ar-traits" id="ar-traits"></div>
        <div class="ar-boardw"><div class="ar-board" id="ar-board"><div class="ar-cells" id="ar-cells"></div><div class="ar-live" id="ar-live"></div><div class="ar-banner" id="ar-banner" hidden></div></div></div>
        <div class="ar-players" id="ar-players"></div></div>
      <div class="ar-bench" id="ar-bench"></div>
      <div class="ar-info" id="ar-info" hidden></div>
      <div class="ar-shopbar"><div class="ar-eco" id="ar-eco"></div><div class="ar-shop" id="ar-shop"></div></div>`;
    root.onclick = onClick; drawAll(); startTimer();
  }
  function drawAll() { drawTop(); drawTraits(); drawBoard(); drawBench(); drawShop(); drawPlayers(); drawInfo(); }
  function drawTop() { const i = G.info; $("#ar-round").innerHTML = `Manche <b>${i.st}-${i.k}</b> ${i.pve >= 0 ? "· 🐾 Monstres" : ""}`; $("#ar-me").innerHTML = `❤️ <b>${Math.max(0, G.me.hp)}</b>`; }
  function drawTraits() {
    const cnt = traitsOf(G.me.board), keys = Object.keys(cnt).sort((a, b) => (tier(b, cnt[b]) - tier(a, cnt[a])) || cnt[b] - cnt[a]);
    $("#ar-traits").innerHTML = keys.map(k => { const ti = tier(k, cnt[k]), nx = TR[k].t[ti + 1] || TR[k].t[TR[k].t.length - 1]; return `<button class="ar-tr ${ti >= 0 ? "on t" + ti : ""}" data-trait="${k}"><span>${TICO(k)}</span><b>${cnt[k]}</b><small>${TNAME(k)} · ${nx}</small></button>`; }).join("") || `<span class="ar-hint">Place des unités pour activer des synergies.</span>`;
  }
  function drawBoard() {
    let h = ""; for (let R = 0; R < ROWS; R++) for (let C = 0; C < COLS; C++) { const mine = R >= 4, x = mine && G.phase === "plan" ? G.me.board.find(u => 4 + u.r === R && u.c === C) : null;
      h += `<div class="ar-cell ${mine ? "mine" : "foe"} ${x && UI.sel === x ? "sel" : ""}" style="${hexPos(R, C)}" ${mine ? `data-cell="${R - 4},${C}"` : ""}>${x ? tokenHTML(x.n, x.star, UN[x.n].c) : ""}</div>`; }
    $("#ar-cells").innerHTML = h; if (G.phase === "plan") $("#ar-live").innerHTML = "";
    const b = $("#ar-board"); b.classList.toggle("fight", G.phase === "fight");
  }
  function drawBench() { $("#ar-bench").innerHTML = G.me.bench.map((x, i) => `<div class="ar-slot ${x && UI.sel === x ? "sel" : ""}" data-bench="${i}">${x ? tokenHTML(x.n, x.star, UN[x.n].c) : ""}</div>`).join("") + `<span class="ar-cap">${G.me.board.length}/${G.me.lvl}</span>`; }
  function drawShop() {
    const p = G.me, off = G.phase !== "plan";
    $("#ar-eco").innerHTML = `<span class="ar-gold">🪙 <b>${p.gold}</b></span><span class="ar-lvl">Niv. <b>${p.lvl}</b>${p.lvl < 9 ? ` <small>${p.xp}/${XPN[p.lvl - 1]} XP</small>` : ""}</span>
      <button class="ar-b" data-act="xp" ${off || p.gold < 4 || p.lvl >= 9 ? "disabled" : ""}>+4 XP <small>4🪙</small></button><button class="ar-b" data-act="roll" ${off || p.gold < 2 ? "disabled" : ""}>🔄 <small>2🪙</small></button>
      <button class="ar-b ${p.lock ? "on" : ""}" data-act="lock" ${off ? "disabled" : ""}>${p.lock ? "🔒" : "🔓"}</button><button class="ar-b go" data-act="ready" ${off ? "disabled" : ""}>Combat ▶</button>`;
    $("#ar-shop").innerHTML = p.shop.map((n, i) => { if (!n) return `<div class="ar-card empty"></div>`; const d = UN[n], a = artOf(n);
      return `<button class="ar-card c${d.c}" data-buy="${i}" ${off || p.gold < d.c ? "disabled" : ""} style="${bg(n)}"><span class="ar-cost">${d.c}🪙</span><span class="ar-tags">${d.o.map(TICO).join("")}${TICO(d.cl)}</span><span class="ar-nm">${esc(a.nm)}</span><span class="ar-i" data-info="${esc(n)}">i</span></button>`; }).join("");
  }
  function drawPlayers() { $("#ar-players").innerHTML = G.players.slice().sort((a, b) => b.alive - a.alive || b.hp - a.hp).map(p => `<div class="ar-pl ${p.alive ? "" : "dead"} ${p === G.me ? "me" : ""}"><b>${esc(p.name)}</b><span>${p.alive ? "❤️ " + Math.max(0, p.hp) : "💀"}</span><i style="width:${Math.max(0, p.hp)}%"></i></div>`).join(""); }
  function statLine(n, star) { const d = UN[n], b = CB[d.cl], st = STAR[star - 1]; return `PV <b>${Math.round(HPB[d.c - 1] * b.hp * st)}</b> · Dégâts <b>${Math.round(ADB[d.c - 1] * b.ad * st)}</b> · Vitesse <b>${b.as}</b> · Portée <b>${b.rg === 1 ? "mêlée" : b.rg + " cases"}</b> · Armure <b>${b.ar}</b> · Mana <b>${d.s.m || b.m}</b>`; }
  function drawInfo() {
    const box = $("#ar-info"), x = UI.info; if (!x) { box.hidden = true; return; } const d = UN[x.n], a = artOf(x.n); box.hidden = false;
    box.innerHTML = `<div class="ar-ipic c${d.c}" style="${bg(x.n)}"></div><div class="ar-itx"><h3>${esc(a.nm)} <small>${stars(x.star || 1)} · ${d.c}🪙</small></h3>
      <p class="ar-itr">${d.o.map(k => `${TICO(k)} ${TNAME(k)}`).join(" · ")} · ${TICO(d.cl)} ${TNAME(d.cl)}</p><p class="ar-ist">${statLine(x.n, x.star || 1)}</p>
      <p><b>${esc(d.s.n)} :</b> ${esc(d.s.t)}</p></div><div class="ar-ibtn">${x.own && G.phase === "plan" ? `<button class="ar-b" data-act="sell">Vendre <small>+${sellVal(x.own)}🪙</small></button>` : ""}<button class="ar-b mini" data-act="closeinfo">✕</button></div>`;
  }
  function note(t) { if (API && API.toast) API.toast(t); }
  function onClick(e) {
    const t = e.target;
    const inf = t.closest("[data-info]"); if (inf) { e.stopPropagation(); UI.info = { n: inf.dataset.info, star: 1 }; return drawInfo(); }
    const act = t.closest("[data-act]"); if (act && !act.disabled) return doAct(act.dataset.act);
    const tr = t.closest("[data-trait]"); if (tr) return traitPop(tr.dataset.trait);
    if (!G || G.phase === "over") return;
    const b = t.closest("[data-buy]"); if (b && !b.disabled && G.phase === "plan") { const r = buy(G.me, +b.dataset.buy); if (typeof r === "string") { if (r !== "vide") note(r); } else if (r) note(`✨ ${artOf(r[0].n).nm} passe ${stars(r[0].star)} !`); UI.sel = null; return drawAll(); }
    if (G.phase !== "plan") { const tk = t.closest("[data-uid]"); if (tk && UI.sim) { const u = UI.sim.units[+tk.dataset.uid]; if (u && UN[u.n]) { UI.info = { n: u.n, star: u.star }; drawInfo(); } } return; }
    const cell = t.closest("[data-cell]"), slot = t.closest("[data-bench]"), p = G.me;
    if (cell) { const [r, c] = cell.dataset.cell.split(",").map(Number), there = p.board.find(u => u.r === r && u.c === c);
      if (UI.sel && UI.sel !== there) { const s = UI.sel, onB = p.board.includes(s);
        if (onB) { if (there) { there.r = s.r; there.c = s.c; } s.r = r; s.c = c; }
        else { const bi = p.bench.indexOf(s); if (there) { p.board.splice(p.board.indexOf(there), 1); p.bench[bi] = there; delete there.r; delete there.c; s.r = r; s.c = c; p.board.push(s); }
          else { if (p.board.length >= p.lvl) { note(`Niveau ${p.lvl} : ${p.lvl} unité${p.lvl > 1 ? "s" : ""} max sur le plateau.`); return; } p.bench[bi] = null; s.r = r; s.c = c; p.board.push(s); } }
        UI.sel = null; UI.info = null; }
      else if (there) { UI.sel = UI.sel === there ? null : there; UI.info = UI.sel ? { n: there.n, star: there.star, own: there } : null; }
      return drawAll(); }
    if (slot) { const i = +slot.dataset.bench, there = p.bench[i];
      if (UI.sel && UI.sel !== there) { const s = UI.sel, onB = p.board.includes(s);
        if (onB) { p.board.splice(p.board.indexOf(s), 1); if (there) { there.r = s.r; there.c = s.c; p.board.push(there); } delete s.r; delete s.c; p.bench[i] = s; }
        else { const bi = p.bench.indexOf(s); p.bench[bi] = there || null; p.bench[i] = s; }
        UI.sel = null; UI.info = null; }
      else if (there) { UI.sel = UI.sel === there ? null : there; UI.info = UI.sel ? { n: there.n, star: there.star, own: there } : null; }
      return drawAll(); }
  }
  function doAct(a) {
    const p = G && G.me;
    if (a === "quit") { if (!G || G.phase === "over" || confirm("Quitter la partie en cours ?")) close(); return; }
    if (a === "help") return help();
    if (a === "again") { clearInterval(UI.timer); stopLoop(); return menu(); }
    if (a === "closeinfo") { UI.info = null; UI.sel = null; return drawAll(); }
    if (a === "speed") { UI.speed = UI.speed === 1 ? 2 : UI.speed === 2 ? 4 : 1; $("#ar-speed").textContent = "×" + UI.speed; if (UI.loop) { stopLoop(); runLoop(); } return; }
    if (G.phase !== "plan") return;
    if (a === "xp") buyXp(p); else if (a === "roll") reroll(p); else if (a === "lock") p.lock = !p.lock;
    else if (a === "sell" && UI.info && UI.info.own) { sell(p, UI.info.own); UI.info = null; UI.sel = null; }
    else if (a === "ready") return fight();
    drawAll();
  }
  function traitPop(k) {
    const cnt = traitsOf(G.me.board)[k] || 0, ti = tier(k, cnt), m = document.createElement("div"); m.className = "ar-modal";
    m.innerHTML = `<div class="ar-sheet"><h2>${TICO(k)} ${TNAME(k)} <small>${cnt} sur le plateau</small></h2>${TR[k].t.map((t, i) => `<p class="${i === ti ? "ar-on" : ""}"><b>${t}</b> : ${TR[k].d(TR[k].v[i])}</p>`).join("")}
      <p class="ar-hint">Unités : ${SET.filter(n => UN[n].o.includes(k) || UN[n].cl === k).map(n => `${esc(n)} (${UN[n].c})`).join(", ")}</p><button class="ar-b" data-x>Fermer</button></div>`;
    root.appendChild(m); m.onclick = e => { if (e.target === m || e.target.closest("[data-x]")) m.remove(); };
  }
  function startTimer() { clearInterval(UI.timer); UI.tleft = G.ri < 3 ? 25 : 40; const tick = () => { if (!root || !G || G.phase !== "plan") return clearInterval(UI.timer); $("#ar-timer").textContent = "⏳ " + UI.tleft + " s"; if (UI.tleft-- <= 0) { clearInterval(UI.timer); fight(); } }; tick(); UI.timer = setInterval(tick, 1000); }
  /* ---------- combat affiché ---------- */
  function fight() {
    clearInterval(UI.timer); if (G.phase !== "plan") return; const p = G.me;
    // plateau incomplet : on complète avec le banc
    while (p.board.length < p.lvl && p.bench.some(Boolean)) { const i = p.bench.findIndex(x => x && !p.board.some(b => b.n === x.n)); const j = i >= 0 ? i : p.bench.findIndex(Boolean); const x = p.bench[j]; p.bench[j] = null; let r = 0, c = 3, k = 0; while (p.board.some(b => b.r === r && b.c === c)) { k++; c = [3, 2, 4, 1, 5, 0, 6][k % 7]; r = Math.floor(k / 7); } x.r = r; x.c = c; p.board.push(x); }
    G.phase = "fight"; UI.sel = null; UI.info = null;
    const f = prepareFights(); UI.fight = f; UI.sim = simInit(f.A, f.B, f.seed);
    drawAll(); $("#ar-timer").textContent = f.b ? "⚔️ contre " + f.b.name : f.ghost ? "⚔️ contre le fantôme de " + f.ghost.name : "⚔️ Monstres";
    const live = $("#ar-live"); live.innerHTML = ""; UI.tok = {}; UI.sim.units.forEach(u => addTok(u)); $("#ar-cells").querySelectorAll(".ar-tok").forEach(x => x.remove());
    runLoop();
  }
  function addTok(u) { const el = document.createElement("div"); el.className = `ar-u side${u.side} c${u.cost} ${u.mon ? "mon" : ""}`; el.dataset.uid = u.uid; el.style.cssText = hexPos(u.R, u.C);
    el.innerHTML = `<div class="ar-bars"><i class="hp"></i><i class="mp"></i></div>${tokenHTML(u.mon ? u.art : u.n, u.star, u.cost)}`; $("#ar-live").appendChild(el); UI.tok[u.uid] = el; }
  function runLoop() { UI.loop = setInterval(tickFight, 100 / UI.speed); }
  function stopLoop() { clearInterval(UI.loop); UI.loop = null; }
  function fx(cls, R, C, txt, ms) { const el = document.createElement("div"); el.className = "ar-fx " + cls; el.style.cssText = hexPos(R, C); if (txt != null) el.textContent = txt; $("#ar-live").appendChild(el); setTimeout(() => el.remove(), ms || 700); return el; }
  function tickFight() {
    const S = UI.sim; if (!S || !root) return stopLoop(); step(S);
    for (const e of S.ev) { const u = e.u != null ? S.units[e.u] : null, el = u && UI.tok[u.uid];
      if (e.k === "spawn") addTok(u);
      else if (e.k === "dmg" && u) { fx("dm" + (e.c ? " crit" : "") + (e.m ? " mag" : ""), u.R, u.C, e.v, 650); if (el) { el.classList.add("hit"); setTimeout(() => el.classList.remove("hit"), 150); } }
      else if (e.k === "heal" && u) fx("hl", u.R, u.C, "+" + e.v, 650);
      else if (e.k === "miss" && u) fx("ms", u.R, u.C, "esquive", 600);
      else if (e.k === "gold" && u) fx("gd", u.R, u.C, "+1🪙", 900);
      else if (e.k === "cast" && u) { fx("cast", u.R, u.C, e.n, 1100); if (el) { el.classList.add("casting"); setTimeout(() => el.classList.remove("casting"), 500); } }
      else if (e.k === "die" && el) { el.classList.add("dead"); }
      else if (e.k === "zone") { const z = fx("zone side" + e.side, e.R, e.C, null, 500); z.style.setProperty("--zr", e.r); }
      else if (e.k === "flash") { const b = $("#ar-board"); b.classList.add("flash"); setTimeout(() => b.classList.remove("flash"), 350); }
      else if (e.k === "atk" || e.k === "shot") { const a = S.units[e.a], b = S.units[e.b], ea = UI.tok[e.a]; if (!a || !b) continue;
        if (e.k === "atk" && ea) { ea.style.setProperty("--lx", ((b.C + (b.R & 1) * .5) - (a.C + (a.R & 1) * .5)) * 30 + "%"); ea.style.setProperty("--ly", (b.R - a.R) * 30 + "%"); ea.classList.remove("lunge"); void ea.offsetWidth; ea.classList.add("lunge"); }
        else if (e.k === "shot") { const s = fx("shot side" + a.side, a.R, a.C, null, 260); requestAnimationFrame(() => { s.style.cssText = hexPos(b.R, b.C); }); } }
      else if (e.k === "beam") { const a = S.units[e.a]; if (a) { const z = fx("beam side" + a.side, a.R, a.C, null, 450); z.style.setProperty("--ang", Math.atan2(e.dy * .75 * 1.1547, e.dx) + "rad"); } }
    }
    S.ev.length = 0;
    for (const u of S.units) { const el = UI.tok[u.uid]; if (!el || !u.alive) continue; el.style.left = ((u.C + (u.R & 1) * .5) / 7.5 * 100) + "%"; el.style.top = (u.R * .75 / 6.25 * 100) + "%";
      el.querySelector(".hp").style.width = Math.max(0, u.hp / u.maxhp * 100) + "%"; el.querySelector(".mp").style.width = (u.maxMana ? u.mana / u.maxMana * 100 : 0) + "%";
      el.classList.toggle("stun", u.stunT > S.t); el.classList.toggle("shd", u.shield > 0); el.classList.toggle("ghosted", u.untargT > S.t); el.classList.toggle("big", !!u.big); }
    if (S.over) { stopLoop(); endFight(); }
  }
  function endFight() {
    const f = UI.fight, S = UI.sim, g0 = G.me.gold; resolveFight(f, S); resolveOthers(f);
    const b = $("#ar-banner"); b.hidden = false; b.className = "ar-banner " + (f.res.w ? "win" : "lose");
    b.innerHTML = f.res.w ? `Victoire !<small>+${G.me.gold - g0} 🪙</small>` : `Défaite<small>−${f.res.d} PV</small>`;
    drawTop(); drawPlayers();
    setTimeout(() => { if (!root || !G) return; b.hidden = true; UI.sim = null; roundEnd(); if (G.phase === "over") return over(); drawAll(); startTimer(); }, 1800 / Math.min(2, UI.speed));
  }
  function over() {
    const pl = G.me.place, m = document.createElement("div"); m.className = "ar-modal";
    m.innerHTML = `<div class="ar-sheet ar-over"><h2>${pl === 1 ? "🏆 Victoire !" : pl <= 4 ? "Top " + pl : pl + "e place"}</h2><p>${pl === 1 ? "Tu es le dernier joueur en vie." : `Tu termines ${pl}e sur 8, à la manche ${G.info.st}-${G.info.k}.`}</p>
      <div class="ar-row"><button class="ar-b go" data-act="again">Rejouer</button><button class="ar-b" data-act="quit">Quitter</button></div></div>`;
    root.appendChild(m);
  }
  W.WikiArena = { open, close, _t: { UN, SET, TR, newGame, simRun, simInit, step, teamOf, buy, sell, merge, botTurn, prepareFights, resolveFight, resolveOthers, roundEnd, roundInfo, pveTeam, get G() { return G; } } };
})();
