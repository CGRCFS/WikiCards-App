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
  const CB = { col: { hp: 1.35, ad: .8, as: .6, rg: 1, ar: 45, m: 90 }, bag: { hp: 1.1, ad: 1, as: .7, rg: 1, ar: 35, m: 70 }, ass: { hp: .8, ad: 1.02, as: .8, rg: 1, ar: 25, m: 60 },
    tir: { hp: .8, ad: 1.1, as: .8, rg: 4, ar: 20, m: 70 }, mag: { hp: .8, ad: .7, as: .65, rg: 4, ar: 20, m: 65 }, sou: { hp: .85, ad: .6, as: .65, rg: 3, ar: 20, m: 80 }, str: { hp: .9, ad: .7, as: .65, rg: 3, ar: 25, m: 90 } };
  const HPB = [550, 700, 850, 1050, 1300], ADB = [45, 52, 62, 75, 95], SPD = [200, 260, 330, 430, 620], STAR = [1, 1.8, 3.24], SSTAR = [1, 1.5, 2.4];
  const COSTC = ["#8a94a6", "#2fbf71", "#3b82f6", "#b44cf0", "#f5b301"];
  const UN = {};   // unités du set
  const U = (n, c, cl, o, s) => { UN[n] = { n, c, cl, o, s }; };
  // --- Set 1 ---
  U("Rey Mysterio", 1, "ass", ["catch"], { k: "strike", p: .8, stun: .5, n: "619", t: "Frappe sa cible et l'étourdit." });
  U("Leedz Lewis", 1, "bag", ["catch"], { k: "aoeT", p: .8, r: 1, n: "Saut de la troisième corde", t: "Dégâts sur sa cible et les ennemis voisins." });
  U("Randy Orton", 2, "ass", ["catch"], { k: "strike", p: 1.5, tp: "low", n: "RKO", t: "Surgit sur l'ennemi le plus faible et lui inflige de gros dégâts." });
  U("Rhea Ripley", 3, "bag", ["catch"], { k: "strike", p: 1.3, stun: 1, n: "Riptide", t: "Projette sa cible : dégâts et étourdissement." });
  U("Kane", 3, "col", ["catch"], { k: "aoeT", p: .9, r: 1, stun: 1.2, n: "Chokeslam", t: "Soulève sa cible : dégâts et étourdissement autour d'elle." });
  U("John Cena", 4, "bag", ["catch"], { k: "strike", p: 1.4, untarg: 2, n: "Attitude Adjustment", t: "Gros dégâts, puis devient inciblable 2 s (« You can't see me »)." });
  U("The Undertaker", 5, "col", ["catch"], { k: "strike", p: 1.1, stun: 1.2, pas: "revive", n: "Tombstone", t: "Dégâts et étourdissement. Passif : se relève une fois après sa mort." });
  U("Raphaël Glucksmann", 1, "sou", ["pol"], { k: "heal", who: "low", p: 1.2, n: "Soutien", t: "Soigne l'allié le plus blessé." });
  U("Jordan Bardella", 2, "str", ["pol"], { k: "buff", who: "near", s: "as", v: .4, d: 5, m: 50, n: "Meeting", t: "Les alliés proches gagnent 40 % de vitesse d'attaque pendant 5 s." });
  U("Jean-Luc Mélenchon", 2, "mag", ["pol"], { k: "line", p: 1.4, n: "Discours", t: "Dégâts à tous les ennemis sur une ligne." });
  U("Emmanuel Macron", 3, "str", ["pol"], { k: "shield", who: "all", p: 1, m: 60, d: 5, n: "En même temps", t: "Donne un bouclier à toute l'équipe." });
  U("Charles de Gaulle", 4, "col", ["pol"], { k: "taunt", r: 2, d: 4, v: 60, m: 60, n: "L'Appel", t: "Provoque les ennemis proches et donne de l'armure à toute l'équipe." });
  U("Napoléon Ier", 5, "str", ["pol"], { k: "summon", cnt: [2, 3, 5], hp: 650, ad: 65, m: 70, sn: "Grognard", n: "Grande Armée", t: "Invoque des soldats de la Garde." });
  U("Ghostface", 1, "ass", ["hor"], { k: "strike", p: 1.3, phys: 1, n: "Coup de couteau", t: "Un coup critique garanti." });
  U("Freddy Fazbear", 2, "bag", ["hor", "jv"], { k: "aoeS", p: .5, r: 1, stun: 1.2, n: "Jumpscare", t: "Effraie et étourdit les ennemis adjacents." });
  U("Slender Man", 3, "mag", ["hor"], { k: "far", p: 2, stun: 2.5, n: "Apparition", t: "Immobilise l'ennemi le plus éloigné et le blesse." });
  U("SCP-096 · Le Timide", 4, "ass", ["hor"], { k: "strike", p: 1.2, pas: "enrage", n: "Rage", t: "Passif : dès qu'il est blessé, il s'enrage (+45 % de vitesse, +20 % de dégâts)." });
  U("Siren Head", 4, "tir", ["hor"], { k: "aoeT", p: .8, r: 2, stun: 1.5, n: "Sirène", t: "Étourdit les ennemis dans une large zone autour de sa cible." });
  U("Dracula", 5, "mag", ["hor"], { k: "multi", cnt: 3, p: 1, drain: 1, n: "Soif de sang", t: "Draine la vie de 3 ennemis et se soigne d'autant." });
  U("Tsuyu Asui", 1, "tir", ["manga"], { k: "far", p: .8, stun: 1, pull: 1, n: "Langue", t: "Attire l'ennemi le plus éloigné jusqu'à elle." });
  U("Misa Amane", 1, "mag", ["manga"], { k: "strike", p: 1.2, vuln: .25, d: 6, n: "Yeux de Shinigami", t: "Marque sa cible : elle subit 25 % de dégâts en plus." });
  U("Naruto Uzumaki", 2, "ass", ["manga"], { k: "summon", cnt: [1, 1, 2], clone: .4, m: 90, sn: "Clone", n: "Multiclonage", t: "Crée des clones de lui-même." });
  U("Monkey D. Luffy", 3, "bag", ["manga"], { k: "strike", p: 1.6, n: "Gomu Gomu no Gatling", t: "Une rafale de coups sur sa cible." });
  U("Eren Jäger", 4, "col", ["manga"], { k: "transform", hp: 900, ad: .3, n: "Titan assaillant", t: "Se transforme en Titan : gagne beaucoup de PV et de dégâts." });
  U("Son Goku", 4, "bag", ["manga"], { k: "line", p: 1.3, n: "Kamehameha", t: "Un rayon qui traverse toute une ligne." });
  U("Satoru Gojo", 5, "mag", ["manga"], { k: "stunall", p: .9, stun: [2, 2.5, 4], n: "Extension du territoire", t: "Étourdit et blesse tous les ennemis." });
  U("Sonic", 1, "ass", ["jv"], { k: "line", p: .8, n: "Spin Dash", t: "Traverse la ligne ennemie en infligeant des dégâts." });
  U("Mario", 2, "bag", ["jv"], { k: "aoeT", p: .8, r: 1, stun: 1, n: "Saut", t: "Écrase sa cible : dégâts et étourdissement autour." });
  U("D.Va", 2, "col", ["jv"], { k: "boom", p: .75, r: 2, sh: .6, n: "Autodestruction", t: "Se protège 3 s, puis son méca explose dans une large zone." });
  U("Lara Croft", 3, "tir", ["jv"], { k: "multi", cnt: 2, p: .5, phys: 1, n: "Double tir", t: "Tire sur deux cibles à la fois." });
  U("GLaDOS", 4, "mag", ["jv"], { k: "aoeT", p: .6, r: 2, dot: 2, d: 4, n: "Neurotoxine", t: "Empoisonne une large zone pendant 4 s." });
  U("Kratos", 5, "bag", ["jv"], { k: "aoeS", p: .8, r: 2, ls: .25, n: "Rage de Sparte", t: "Frappe tout autour de lui et se soigne." });
  U("Moo Deng", 1, "col", ["meme"], { k: "strike", p: .8, selfArmor: 30, n: "Morsure", t: "Mord sa cible et gagne de l'armure pour le reste du combat." });
  U("Bongo Cat", 1, "sou", ["meme", "chat"], { k: "buff", who: "all", s: "as", v: .3, d: 5, m: 50, n: "Rythme", t: "Toute l'équipe gagne 30 % de vitesse d'attaque pendant 5 s." });
  U("Grumpy Cat", 2, "mag", ["meme", "chat"], { k: "strike", p: .9, weaken: .4, d: 5, n: "« Non. »", t: "Blesse sa cible et réduit ses dégâts de 40 % pendant 5 s." });
  U("Pepe the Frog", 2, "mag", ["meme"], { k: "strike", p: 1.4, rnd: 1, n: "Feels", t: "Dégâts aléatoires : parfois faibles, parfois doublés." });
  U("Tung Tung Tung Sahur", 3, "bag", ["meme"], { k: "buff", who: "self", s: "as", v: .5, d: 6, n: "Tung tung tung", t: "Frappe de plus en plus vite (cumulable)." });
  U("Crazy Frog", 3, "tir", ["meme"], { k: "multi", cnt: 3, rndT: 1, p: .35, n: "Ring ding ding", t: "Fonce en moto et touche 3 ennemis au hasard." });
  U("Rick-ornichon", 4, "ass", ["meme"], { k: "strike", p: 1.4, reset: 1, n: "Massacre", t: "Gros dégâts. S'il élimine sa cible, il relance son sort aussitôt." });
  U("Trotro", 1, "sou", ["da"], { k: "heal", who: "near", p: .6, n: "Trotro rigolo", t: "Soigne les alliés proches." });
  U("Garfield le chat", 2, "col", ["da", "chat"], { k: "heal", who: "self", p: 1.6, selfArmor: 15, n: "Lasagnes", t: "Mange des lasagnes : se soigne et gagne de l'armure." });
  U("Perry l'ornithorynque", 3, "ass", ["da"], { k: "dodge", d: 2, v: .5, n: "Agent P", t: "Esquive toutes les attaques pendant 2 s, puis frappe plus fort." });
  U("M. Krabs", 3, "str", ["da"], { k: "strike", p: 1.6, m: 50, pas: "goldkill", n: "Pince", t: "Pince sa cible. Passif : 1 or par élimination (2 max par combat)." });
  U("Shredder", 4, "bag", ["da"], { k: "aoeS", p: 1.1, r: 1, phys: 1, n: "Tourbillon de lames", t: "Tranche tous les ennemis adjacents." });
  U("Alastor", 5, "mag", ["da"], { k: "aoeT", p: 1.3, r: 3, stun: .8, n: "Tentacules d'ombre", t: "Frappe une immense zone." });
  U("Zorro", 1, "ass", ["hero"], { k: "strike", p: .5, dot: .9, d: 4, n: "Signe du Z", t: "Marque sa cible, qui saigne pendant 4 s." });
  U("Spider-Man", 2, "tir", ["hero"], { k: "strike", p: .9, stun: 1.4, n: "Toile", t: "Immobilise sa cible pendant 1,4 s." });
  U("Batman", 3, "ass", ["hero"], { k: "strike", p: 1.5, tp: "low", untarg: 1, n: "Fumigène", t: "Disparaît, puis frappe l'ennemi le plus faible." });
  U("Joker", 3, "mag", ["hero"], { k: "aoeT", p: 1, r: 2, slow: .4, d: 5, n: "Gaz hilarant", t: "Blesse une zone et ralentit les attaques de 40 %." });
  U("Iron Man", 4, "tir", ["hero"], { k: "line", p: 1.3, n: "Unirayon", t: "Un rayon qui traverse toute une ligne." });
  U("Hulk", 4, "col", ["hero"], { k: "aoeS", p: 1.3, r: 1, pas: "ramp", n: "Hulk écrase", t: "Frappe le sol. Passif : plus il perd de PV, plus il frappe fort." });
  U("Thanos", 5, "col", ["hero"], { k: "half", cnt: 2, m: 70, pc: [.5, .6, .8], n: "Claquement de doigts", t: "Retire la moitié des PV des 2 ennemis les plus résistants." });
  U("Domingo", 1, "sou", ["vid"], { k: "mana", r: 2, v: 30, m: 50, n: "Popcorn", t: "Donne 30 mana aux alliés proches." });
  U("Joueur du Grenier", 1, "bag", ["vid"], { k: "buff", who: "self", s: "as", v: .6, d: 4, n: "Rage", t: "S'énerve : +60 % de vitesse d'attaque pendant 4 s." });
  U("Maghla", 2, "mag", ["vid"], { k: "aoeT", p: 1.2, r: 1, n: "Hurlement", t: "Dégâts sur sa cible et les ennemis voisins." });
  U("Antoine Daniel", 3, "tir", ["vid"], { k: "far", p: 1.5, n: "What the Cut", t: "Un tir chargé sur l'ennemi le plus éloigné." });
  U("Squeezie", 4, "str", ["vid"], { k: "buff", who: "all", s: "amp", v: .3, d: 6, m: 50, n: "Live", t: "Toute l'équipe inflige 30 % de dégâts en plus pendant 6 s." });
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
      ref: x.ref || null, dealt: 0, taken: 0, healed: 0, critC: .25, critD: 1.4, dodge: 0, ls: 0, amp: 1, red: 0, sp: 1, manaAtk: 0, regen: 0, vuln: 0, vulnT: 0 };
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
    S.units.forEach(u => { if (u.cl === "ass" && !u.mon) u.waitT = .55; });   // les assassins bondissent juste après le début du combat
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
  function heal(S, u, v, quiet, by) { if (!u.alive || v <= 0) return; if (S.t > 30) v *= .4; const h = Math.min(v, u.maxhp - u.hp); u.hp += h; const hb = by || u; (hb.owner || hb).healed += h; if (!quiet && h > 1) S.ev.push({ k: "heal", u: u.uid, v: Math.round(h) }); }
  function dmg(S, src, t, amt, type, o) {
    o = o || {}; if (!t.alive || amt <= 0) return 0;
    if (src) amt *= src.amp + bsum(S, src, "amp"); if (S.t > 30) amt *= 1 + (S.t - 30) * .12; if (src && bsum(S, src, "weak")) amt *= Math.max(.2, 1 - bsum(S, src, "weak"));
    const res = type === "p" ? t.armor + bsum(S, t, "armor") : type === "m" ? t.mr + bsum(S, t, "armor") : 0;
    amt *= 100 / (100 + Math.max(0, res)); amt *= 1 - Math.min(.6, t.red); if (t.vulnT > S.t) amt *= 1 + t.vuln;
    let left = amt; if (t.shield > 0) { const a = Math.min(t.shield, left); t.shield -= a; left -= a; }
    t.hp -= left; t.taken += amt; if (src) (src.owner || src).dealt += amt; if (!o.dot) { S.ev.push({ k: "dmg", u: t.uid, v: Math.round(amt), c: o.crit ? 1 : 0, m: type === "m" ? 1 : 0 }); if (t.maxMana) t.mana = Math.min(t.maxMana, t.mana + Math.min(12, amt * .04)); }
    if (src && src.alive && src.ls) heal(S, src, amt * src.ls, true);
    if (t.spell && t.spell.pas === "enrage" && !t.enraged) { t.enraged = true; t.buffs.push({ s: "as", v: .45, until: 999 }, { s: "ad", v: .2, until: 999 }); S.ev.push({ k: "cast", u: t.uid, n: "Rage" }); }
    if (t.hp <= 0) {
      if (t.revive) { t.revive = false; t.hp = t.maxhp * .25; t.stunT = S.t + .8; t.dots = []; S.ev.push({ k: "cast", u: t.uid, n: "Se relève !" }); }
      else { t.alive = false; t.hp = 0; delete S.grid[t.R + "," + t.C]; S.ev.push({ k: "die", u: t.uid });
        if (src) { src.kills++; if (src.owner) src.owner.kills++; if (src.spell && src.spell.pas === "goldkill" && (src.gk || 0) < 2) { src.gk = (src.gk || 0) + 1; S.gold[src.side]++; S.ev.push({ k: "gold", u: src.uid }); } if (o.reset && src.alive) src.mana = src.maxMana; } }
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
        L.forEach(a => { heal(S, a, SD(u, sp.p), false, u); if (sp.sh) { a.shield += SD(u, sp.sh); } }); if (sp.selfArmor) { u.armor += sp.selfArmor * u.star; u.mr += sp.selfArmor * u.star; } break; }
      case "shield": allies.forEach(a => a.shield += SD(u, sp.p)); break;
      case "buff": { const L = sp.who === "self" ? [u] : sp.who === "near" ? within(S, allies, u.R, u.C, 2) : allies; L.forEach(a => a.buffs.push({ s: sp.s, v: sp.v * (1 + (u.star - 1) * .4), until: S.t + sp.d })); break; }
      case "mana": within(S, allies, u.R, u.C, sp.r).forEach(a => { if (a !== u && a.maxMana) a.mana = Math.min(a.maxMana, a.mana + sp.v * u.star); }); break;
      case "taunt": within(S, foes, u.R, u.C, sp.r).forEach(e => { e.taunt = { by: u, until: S.t + sp.d }; }); allies.forEach(a => a.buffs.push({ s: "armor", v: sp.v * u.star, until: S.t + 5 })); u.shield += SD(u, .8); break;
      case "summon": { const n = sp.cnt[u.star - 1]; for (let i = 0; i < n; i++) { const f = freeNear(S, u.R + (u.side ? 1 : -1), u.C + i - 1, u); if (!f) break;
          const raw = sp.clone ? { hp: u.maxhp * sp.clone, ad: u.ad * sp.clone, as: u.as, rg: 1, ar: 20, art: u.n } : { hp: sp.hp * SSTAR[u.star - 1], ad: sp.ad * SSTAR[u.star - 1], as: .7, rg: 1, ar: 25, art: u.n };
          const s = mkUnit(S, u.side, { n: sp.sn, raw, r: 0, c: 0 }); s.R = f[0]; s.C = f[1]; s.hp = s.maxhp; s.sum = 1; s.owner = u; s.amp = u.amp; S.grid[f[0] + "," + f[1]] = s; S.units.push(s); S.ev.push({ k: "spawn", u: s.uid }); } break; }
      case "transform": if (!u.tf) { u.tf = 1; const h = sp.hp * SSTAR[u.star - 1]; u.maxhp += h; u.hp += h; u.buffs.push({ s: "ad", v: sp.ad, until: 999 }); u.big = 1; } else heal(S, u, u.maxhp * .25); break;
      case "stunall": foes.forEach(e => applyHit(S, u, e, sp, SD(u, sp.p))); S.ev.push({ k: "flash", side: u.side }); break;
      case "half": foes.slice().sort((a, b) => b.hp - a.hp).slice(0, sp.cnt).forEach(e => { dmg(S, u, e, e.hp * sp.pc[u.star - 1], "t"); S.ev.push({ k: "shot", a: u.uid, b: e.uid }); }); S.ev.push({ k: "flash", side: u.side }); break;
      case "dodge": u.dodgeT = S.t + sp.d; u.buffs.push({ s: "ad", v: sp.v * u.star, until: S.t + sp.d + 4 }); break;
      case "boom": u.shield += SD(u, sp.sh); S.delayed.push({ t: S.t + 3, fn: () => { if (!u.alive) return; within(S, foesOf(S, u), u.R, u.C, sp.r).forEach(e => dmg(S, u, e, SD(u, sp.p), "m")); S.ev.push({ k: "zone", R: u.R, C: u.C, r: sp.r, side: u.side }); } }); break;
    }
  }
  function leap(S) { S.leapt = true; S.units.filter(u => u.alive && u.cl === "ass" && !u.mon && !u.sum).forEach(u => { const foes = S.units.filter(e => e.alive && e.side !== u.side); if (!foes.length) return;
      const back = foes.slice().sort((a, b) => (u.side ? b.R - a.R : a.R - b.R) || Math.abs(a.C - u.C) - Math.abs(b.C - u.C))[0], f = freeNear(S, back.R + (u.side ? 1 : -1), back.C, back); if (f) { place(S, u, f[0], f[1]); u.tgt = back; u.waitT = S.t + .5; S.ev.push({ k: "leap", u: u.uid }); } }); }
  function step(S) {
    S.t += DT; if (!S.leapt && S.t >= .35) leap(S);
    if (S.delayed.length) { const due = S.delayed.filter(d => d.t <= S.t); S.delayed = S.delayed.filter(d => d.t > S.t); due.forEach(d => d.fn()); }
    for (let i = 0; i < S.units.length; i++) { const u = S.units[i]; if (!u.alive) continue;
      if (u.dots.length) { for (const d of u.dots) if (d.until > S.t && u.alive) dmg(S, d.src, u, d.dps * DT, "m", { dot: 1 }); u.dots = u.dots.filter(d => d.until > S.t); if (!u.alive) continue; }
      if (u.regen) heal(S, u, u.maxhp * u.regen * DT, true);
      u.atkCd -= DT; u.moveCd -= DT;
      if (u.stunT > S.t || u.waitT > S.t) continue;
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
    if (S.t >= 30 && !S.sudden) { S.sudden = true; S.ev.push({ k: "sudden" }); }
    if (!a || !b || S.t >= 90) { S.over = true; const hp = s => S.units.filter(u => u.alive && u.side === s).reduce((x, u) => x + u.hp / u.maxhp, 0);
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
  function simRun(A, B, seed) { const S = simInit(A, B, seed); let n = 0; while (!S.over && n++ < 1000) { step(S); S.ev.length = 0; } return S; }

  /* ---------- partie ---------- */
  let G = null;
  const newPlayer = (id, name, bot) => ({ id, name, bot, hp: 100, gold: 0, lvl: 1, xp: 0, board: [], bench: Array(9).fill(null), streak: 0, alive: true, shop: [], lock: false, place: 0 });
  function newGame(diff, seed) {
    const rng = rng32(seed || (Date.now() & 0x7fffffff)), names = BOTN.slice().sort(() => rng() - .5);
    G = { diff, rng, stat: { fights: 0, wins: 0 }, ri: 0, phase: "plan", players: [newPlayer(0, "Toi", false)], pool: {}, out: 0, log: [] };
    for (let i = 1; i < 8; i++) { G.players.push(newPlayer(i, names[i - 1], true)); G.players[i].av = ["🦊", "🐸", "🐼", "🐙", "🦉", "🐷", "🐯", "🦄"][i]; }
    SET.forEach(n => G.pool[n] = POOLN[UN[n].c - 1]);
    G.me = G.players[0]; G.me.av = "👑"; G.hist = {}; roundStart(); return G;
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
          rm.forEach(x => { const bi = p.board.indexOf(x); if (bi >= 0) p.board.splice(bi, 1); else p.bench[p.bench.indexOf(x)] = null; }); rm.forEach(x => { if (x.st) { const k = keep.st = keep.st || { d: 0, k: 0, h: 0, t: 0, f: 0 }; k.d += x.st.d; k.k += x.st.k; k.h += x.st.h; k.t += x.st.t; k.f = Math.max(k.f, x.st.f); } }); keep.star++; made.push(keep); again = true; break; } } }
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
  const teamOf = p => ({ units: p.board.map(x => ({ n: x.n, star: x.star, r: x.r, c: x.c, ref: x })) });
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
    if (f.a === G.me) { S.units.forEach(u => { if (u.side === 0 && u.ref) { const st = u.ref.st = u.ref.st || { d: 0, k: 0, h: 0, t: 0, f: 0 }; st.d += u.dealt; st.k += u.kills; st.h += u.healed; st.t += u.taken; st.f++; } }); G.stat.fights++; if (S.win === 0) G.stat.wins++; }
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

  /* ---------- musique (lecteurs YouTube cachés) ---------- */
  const TRK = { main: "LmWsog9oHI8", pvp: ["Fx6NAT_jgTg", "GM5LWGlNd4M", "OwMAKI8HQc4", "zVEI77M8qyU"], boss1: "oZZY7Ll4ZzE", boss2: "kzN6u-n5BT4", boss3: "hA83EHtcAGM", win: "L9Hy3WFlcLQ" };
  const MU = { vol: 40, cur: null, box: null, main: null, alt: null };
  try { const v = +localStorage.getItem("wc-arena-vol"); if (localStorage.getItem("wc-arena-vol") != null && v >= 0 && v <= 100) MU.vol = v; } catch (_) {}
  const yt = id => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&disablekb=1&playsinline=1&rel=0&iv_load_policy=3&enablejsapi=1`;
  const muCmd = (f, func, args) => { try { f && f.contentWindow && f.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: args || "" }), "*"); } catch (_) {} };
  function muFrame(id) { const f = document.createElement("iframe"); f.allow = "autoplay; encrypted-media"; f.title = "Musique"; f.src = yt(id);
    f.addEventListener("load", () => [200, 800, 1600, 3000, 5000].forEach(t => setTimeout(() => { try { f.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*"); } catch (_) {} muCmd(f, "setVolume", [MU.vol]); if (f === MU.main && MU.alt) muCmd(f, "pauseVideo"); }, t)));
    MU.box.appendChild(f); return f; }
  // key : "main" (préparation et monstres), "pvp", "boss1", "boss2", "boss3", "win", ou null pour tout couper
  function music(key) {
    if (typeof document === "undefined" || !root) return; if (key === MU.cur) return; MU.cur = key;
    if (!MU.box || !MU.box.isConnected) { MU.box = document.createElement("div"); MU.box.className = "ar-music"; document.body.appendChild(MU.box); MU.main = MU.alt = null; }
    if (MU.alt) { MU.alt.remove(); MU.alt = null; }
    if (!key || MU.vol <= 0 && !MU.main && key === "main") { if (!key && MU.main) { MU.main.remove(); MU.main = null; } if (!key) return; }
    if (key === "main") { if (MU.main) { muCmd(MU.main, "playVideo"); muCmd(MU.main, "setVolume", [MU.vol]); } else MU.main = muFrame(TRK.main); return; }
    if (MU.main) muCmd(MU.main, "pauseVideo");
    const t = TRK[key]; MU.alt = muFrame(Array.isArray(t) ? t[Math.floor(Math.random() * t.length)] : t);
  }
  function muVol(v) { MU.vol = v; try { localStorage.setItem("wc-arena-vol", v); } catch (_) {} [MU.main, MU.alt].forEach(f => muCmd(f, "setVolume", [v])); }
  function muStop() { MU.cur = null; if (MU.box) MU.box.remove(); MU.box = MU.main = MU.alt = null; }

  /* ---------- bruitages (synthétisés, aucun fichier) ---------- */
  const SF = { ctx: null, vol: 50, last: {} };
  try { const v = localStorage.getItem("wc-arena-sfx"); if (v != null && +v >= 0 && +v <= 100) SF.vol = +v; } catch (_) {}
  function sfCtx() { if (typeof AudioContext === "undefined" && typeof webkitAudioContext === "undefined") return null; if (!SF.ctx) { try { SF.ctx = new (W.AudioContext || W.webkitAudioContext)(); } catch (_) { return null; } } if (SF.ctx.state === "suspended") SF.ctx.resume().catch(() => {}); return SF.ctx; }
  function tone(f, d, type, v, to, at) { const c = sfCtx(); if (!c) return; const t = c.currentTime + (at || 0), o = c.createOscillator(), g = c.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    const vol = (v || .2) * SF.vol / 100; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .02); }
  function noise(d, v, fq, at) { const c = sfCtx(); if (!c) return; const t = c.currentTime + (at || 0), n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); src.buffer = b; f.type = "bandpass"; f.frequency.value = fq || 1200; g.gain.value = (v || .2) * SF.vol / 100; src.connect(f).connect(g).connect(c.destination); src.start(t); }
  function sfx(k) {
    if (SF.vol <= 0 || typeof document === "undefined") return; const now = Date.now(), gap = { hit: 70, shot: 70, crit: 90, die: 90, cast: 120, heal: 150 }[k] || 0; if (gap && now - (SF.last[k] || 0) < gap) return; SF.last[k] = now;
    switch (k) {
      case "buy": tone(880, .09, "triangle", .22); tone(1320, .14, "triangle", .2, 0, .07); break;
      case "sell": tone(700, .08, "triangle", .2); tone(470, .14, "triangle", .18, 0, .07); break;
      case "roll": noise(.16, .16, 2600); tone(520, .07, "square", .06, 780); break;
      case "xp": tone(523, .09, "sine", .2); tone(659, .09, "sine", .2, 0, .08); tone(784, .16, "sine", .2, 0, .16); break;
      case "lvl": [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, "triangle", .2, 0, i * .09)); break;
      case "star": [659, 880, 1109, 1319, 1760].forEach((f, i) => tone(f, .22, "triangle", .22, 0, i * .07)); noise(.4, .08, 6000, .1); break;
      case "pick": tone(420, .05, "sine", .14, 560); break;
      case "place": tone(170, .1, "sine", .3, 90); noise(.05, .1, 500); break;
      case "err": tone(180, .14, "sawtooth", .13, 130); break;
      case "lock": tone(1200, .04, "square", .08); tone(900, .05, "square", .08, 0, .05); break;
      case "go": tone(196, .3, "sawtooth", .12, 392); tone(294, .3, "sawtooth", .1, 588); noise(.3, .1, 900); break;
      case "tick": tone(1000, .04, "square", .07); break;
      case "hit": noise(.06, .11, 900 + Math.random() * 500); tone(150, .05, "sine", .1, 80); break;
      case "shot": tone(900 + Math.random() * 200, .08, "triangle", .07, 300); break;
      case "crit": noise(.09, .18, 2400); tone(240, .09, "square", .1, 90); break;
      case "cast": tone(330, .28, "sine", .13, 990); noise(.22, .06, 4000); break;
      case "heal": tone(784, .14, "sine", .09, 1175); break;
      case "die": tone(300, .25, "sawtooth", .1, 60); break;
      case "gold": tone(1568, .07, "triangle", .16); tone(2093, .12, "triangle", .14, 0, .06); break;
      case "win": [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .22, "triangle", .2, 0, i * .11)); break;
      case "lose": [392, 349, 311, 233].forEach((f, i) => tone(f, .3, "sawtooth", .1, 0, i * .16)); break;
    }
  }
  function sfVol(v) { SF.vol = v; try { localStorage.setItem("wc-arena-sfx", v); } catch (_) {} }

  /* ---------- interface ---------- */
  let API = null, root = null, UI = { sel: null, speed: 1, timer: null, tleft: 0, sim: null, loop: null, info: null };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const $ = s => root.querySelector(s);
  const artOf = n => { const id = IDS[n] || IDS[(UN[n] || {}).n]; const a = (API && id && API.art(id)) || {}; return { url: a.url || "", px: a.px == null ? 50 : a.px, py: a.py == null ? 25 : a.py, nm: a.nm || n }; };
  const bg = n => { const a = artOf(n); return a.url ? `background-image:url('${String(a.url).replace(/'/g, "%27")}');background-position:${a.px}% ${a.py}%` : ""; };
  const stars = s => "★".repeat(s);
  const RECO = { col: [0], bag: [0, 1], ass: [3], tir: [3], mag: [3], sou: [2, 3], str: [2] };
  const PLACE = { col: "en première ligne : il encaisse pour les autres.", bag: "devant, en 1re ou 2e ligne.", ass: "à l'arrière : il saute tout seul sur la ligne arrière ennemie au début du combat.", tir: "tout au fond, derrière tes unités de mêlée.", mag: "au fond, bien à l'abri.", sou: "au milieu ou au fond, près de ses alliés.", str: "au milieu, entouré de ses alliés." };
  const TIPS = ["Garde 10, 20, 30… or : chaque dizaine rapporte +1 or par manche (5 max).", "Trois cartes identiques fusionnent en ★★. N'achète pas tout : vise des paires.", "Glisse une unité vers la boutique pour la vendre.", "Les Colosses devant, les Tireurs et les Mages au fond.", "Une série de défaites rapporte aussi de l'or : perdre tôt n'est pas grave.", "Le cadenas 🔒 garde ta boutique pour la manche suivante.", "Monte de niveau pour poser plus d'unités et voir des cartes plus rares.", "Touche une synergie à gauche pour voir ses paliers et ses unités.", "Deux unités identiques sur le plateau ne comptent qu'une fois pour les synergies."];
  const tokenHTML = (n, star, cost, extra) => `<div class="ar-tok c${cost} s${star} ${extra || ""}"><div class="ar-hex" style="${bg(n)}"></div><span class="ar-st">${stars(star)}</span></div>`;
  const hexPos = (R, C) => `left:${((C + (R & 1) * .5) / 7.5 * 100).toFixed(3)}%;top:${(R * .75 / 6.25 * 100).toFixed(3)}%`;
  function open(api) {
    API = api; if (root) root.remove();
    root = document.createElement("div"); root.id = "arena"; document.body.appendChild(root); document.body.classList.add("ar-open");
    menu();
  }
  function close() { muStop(); clearTimeout(UI.cine); stopLoop(); clearInterval(UI.timer); if (root) root.remove(); root = null; document.body.classList.remove("ar-open"); G = null; }
  function menu() {
    root.innerHTML = `<div class="ar-menu"><h1>⚔️ Wiki Arena</h1><p class="ar-adm">🔒 En construction : visible seulement par les admins</p>
      <p>Recrute des cartes dans la boutique, place-les sur ton plateau et regarde-les se battre. Trois cartes identiques fusionnent en ★★, puis en ★★★. Réunis des cartes du même univers ou de la même classe pour activer des synergies. Dernier joueur en vie : victoire !</p>
      <p><b>Étape 1 :</b> solo contre 7 bots, set 1 (58 unités). Les objets, les boss, le multijoueur et le duo arrivent ensuite.</p>
      <div class="ar-diff"><span>Difficulté des bots :</span>${[["facile", "Facile"], ["normal", "Normal"], ["difficile", "Difficile"]].map(([k, l]) => `<button class="ar-b ${k === "normal" ? "on" : ""}" data-diff="${k}">${l}</button>`).join("")}</div>
      <div class="ar-row"><button class="ar-b big go" data-act="start">Lancer la partie</button><button class="ar-b" data-act="help">Règles</button><button class="ar-b" data-act="quit">Quitter</button></div></div>`;
    root.onclick = e => { const d = e.target.closest("[data-diff]"); if (d) { root.querySelectorAll("[data-diff]").forEach(b => b.classList.toggle("on", b === d)); return; }
      const a = e.target.closest("[data-act]"); if (!a) return; if (a.dataset.act === "quit") return close(); if (a.dataset.act === "help") return help();
      if (a.dataset.act === "start") { music("main"); newGame((root.querySelector("[data-diff].on") || {}).dataset.diff || "normal"); build(); } };
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
    root.innerHTML = `<div class="ar-top"><span class="ar-me" id="ar-me"></span><div class="ar-stage"><div class="ar-stin"><span class="ar-round" id="ar-round"></span><span class="ar-timer" id="ar-timer"></span></div><i class="ar-tbar"><u id="ar-tbar"></u></i></div>
        <span class="ar-tools"><button class="ar-b mini" data-act="vol">🔊</button><button class="ar-b mini" data-act="speed" id="ar-speed">×1</button><button class="ar-b mini" data-act="help">?</button><button class="ar-b mini" data-act="quit">✕</button></span></div>
      <div class="ar-mid"><div class="ar-left"><h4 class="ar-h">Synergies</h4><div class="ar-traits" id="ar-traits"></div><div class="ar-info" id="ar-info"></div></div>
        <div class="ar-center"><div class="ar-boardw"><div class="ar-board" id="ar-board"><div class="ar-plate"><i></i><i></i><i></i><i></i></div><div class="ar-cells" id="ar-cells"></div><div class="ar-live" id="ar-live"></div><div class="ar-banner" id="ar-banner" hidden></div></div></div>
          <div class="ar-bench" id="ar-bench"></div></div>
        <div class="ar-right"><h4 class="ar-h">Joueurs</h4><div class="ar-players" id="ar-players"></div><h4 class="ar-h ar-hd">Dégâts du dernier combat</h4><div class="ar-dmg" id="ar-dmg"><span class="ar-hint">Le détail de tes unités s'affiche ici pendant les combats.</span></div></div></div>
      <div class="ar-vol" id="ar-vol" hidden><label>🎵 Musique <input type="range" min="0" max="100" step="1" value="${MU.vol}" data-vol="mu"><span>${MU.vol}</span></label><label>🔊 Bruitages <input type="range" min="0" max="100" step="1" value="${SF.vol}" data-vol="sf"><span>${SF.vol}</span></label></div>
      <div class="ar-shopbar" id="ar-shopbar"><div class="ar-eco" id="ar-eco"></div><div class="ar-shop" id="ar-shop"></div><div class="ar-side" id="ar-side"></div><div class="ar-sellz" id="ar-sellz">🪙 Lâche ici pour vendre</div></div>`;
    root.onclick = onClick; root.onpointerdown = dragDown;
    $("#ar-vol").oninput = e => { const t = e.target; if (t.dataset.vol === "mu") muVol(+t.value); else { sfVol(+t.value); sfx("buy"); } t.nextElementSibling.textContent = t.value; };
    drawAll(); startTimer();
  }
  function drawAll() { drawTop(); drawTraits(); drawBoard(); drawBench(); drawShop(); drawPlayers(); drawInfo(); }
  function drawTop() { const i = G.info, base = i.st === 1 ? 0 : 3 + (i.st - 2) * 7, n = i.st === 1 ? 3 : 7; let h = `<b class="ar-stg">${i.st}-${i.k}</b>`;
    for (let k = 0; k < n; k++) { const ri = base + k, inf = roundInfo(ri), d = G.hist[ri]; h += `<i class="ar-ri ${d === 1 ? "w" : d === 0 ? "l" : ""} ${ri === G.ri ? "cur" : ""}">${inf.pve >= 0 ? "🐾" : "⚔️"}</i>`; }
    $("#ar-round").innerHTML = h; $("#ar-me").innerHTML = `<span class="ar-av">${G.me.av}</span><span>❤️ <b>${Math.max(0, G.me.hp)}</b></span>`; }
  function drawTraits() {
    const cnt = traitsOf(G.me.board), keys = Object.keys(cnt).sort((a, b) => (tier(b, cnt[b]) - tier(a, cnt[a])) || cnt[b] - cnt[a]);
    $("#ar-traits").innerHTML = keys.map(k => { const ti = tier(k, cnt[k]), T = TR[k];
      return `<button class="ar-tr ${ti >= 0 ? "on t" + Math.min(2, ti + (T.t.length < 3 ? 1 : 0)) : ""}" data-trait="${k}"><span class="ar-tri">${TICO(k)}</span><b>${cnt[k]}</b><span class="ar-trx"><strong>${TNAME(k)}</strong><em>${T.t.map((t, i) => `<i class="${i <= ti ? "ok" : ""}">${t}</i>`).join(" › ")}</em><small>${ti >= 0 ? T.d(T.v[ti]) : `Encore ${T.t[0] - cnt[k]} pour l'activer.`}</small></span></button>`; }).join("") || `<span class="ar-hint">Place des unités du même univers ou de la même classe pour activer des synergies.</span>`;
  }
  function drawBoard() {
    let h = ""; for (let R = 0; R < ROWS; R++) for (let C = 0; C < COLS; C++) { const mine = R >= 4, x = mine && G.phase === "plan" ? G.me.board.find(u => 4 + u.r === R && u.c === C) : null;
      const rc = mine && UI.sel && G.phase === "plan" && RECO[UN[UI.sel.n].cl].includes(R - 4) && (!x || x === UI.sel);
      h += `<div class="ar-cell ${mine ? "mine" : "foe"} ${x && UI.sel === x ? "sel" : ""} ${rc ? "reco" : ""}" style="${hexPos(R, C)}" ${mine ? `data-cell="${R - 4},${C}"` : ""}>${x ? tokenHTML(x.n, x.star, UN[x.n].c) : ""}</div>`; }
    $("#ar-cells").innerHTML = h; if (G.phase === "plan") $("#ar-live").innerHTML = "";
    const b = $("#ar-board"); b.classList.toggle("fight", G.phase === "fight");
  }
  function drawBench() { $("#ar-bench").innerHTML = G.me.bench.map((x, i) => `<div class="ar-slot ${x && UI.sel === x ? "sel" : ""}" data-bench="${i}">${x ? tokenHTML(x.n, x.star, UN[x.n].c) : ""}</div>`).join("") + `<span class="ar-cap">${G.me.board.length}/${G.me.lvl}</span>`; }
  function drawShop() {
    const p = G.me, off = G.phase === "over", it = Math.min(5, Math.floor(p.gold / 10));
    $("#ar-eco").innerHTML = `<div class="ar-lv"><b>Niveau ${p.lvl}</b><small>${p.lvl < 9 ? `${p.xp}/${XPN[p.lvl - 1]} XP` : "max"}</small><em><u style="width:${p.lvl < 9 ? p.xp / XPN[p.lvl - 1] * 100 : 100}%"></u></em></div>
      <button class="ar-big xp" data-act="xp" ${off || p.gold < 4 || p.lvl >= 9 ? "disabled" : ""}><span class="ar-bi">⬆️</span><span>Acheter XP</span><b>4 🪙</b></button>
      <button class="ar-big roll" data-act="roll" ${off || p.gold < 2 ? "disabled" : ""}><span class="ar-bi">🔄</span><span>Relancer</span><b>2 🪙</b></button>`;
    $("#ar-side").innerHTML = `<div class="ar-gold">🪙 <b>${p.gold}</b><small>${it ? `+${it} d'intérêts` : "10 or = +1 / manche"}</small></div>
      <button class="ar-big lock ${p.lock ? "on" : ""}" data-act="lock" ${off ? "disabled" : ""}><span class="ar-bi">${p.lock ? "🔒" : "🔓"}</span><span>${p.lock ? "Boutique gardée" : "Garder la boutique"}</span></button>
      <button class="ar-big go" data-act="ready" ${G.phase !== "plan" ? "disabled" : ""}><span class="ar-bi">⚔️</span><span>Combat</span></button>`;
    $("#ar-shop").innerHTML = p.shop.map((n, i) => { if (!n) return `<div class="ar-card empty"></div>`; const d = UN[n], a = artOf(n), have = owned(p).filter(x => x.n === n && x.star === 1).length;
      return `<button class="ar-card c${d.c} ${have >= 2 ? "up" : have ? "pair" : ""}" data-buy="${i}" ${off || p.gold < d.c ? "disabled" : ""} style="${bg(n)}"><span class="ar-cost">${d.c} 🪙</span><span class="ar-tags">${[...d.o, d.cl].map(k => `<i>${TICO(k)} ${TNAME(k)}</i>`).join("")}</span><span class="ar-nm">${esc(a.nm)}</span><span class="ar-i" data-info="${esc(n)}">i</span>${have >= 2 ? `<span class="ar-up">★★ !</span>` : ""}</button>`; }).join("");
  }
  function drawPlayers() { $("#ar-players").innerHTML = G.players.slice().sort((a, b) => b.alive - a.alive || b.hp - a.hp).map(p => { const L = p.board.slice().sort((a, b) => UN[b.n].c * b.star - UN[a.n].c * a.star).slice(0, 9);
    const f = G.phase === "fight" && G.fights && G.fights.find(x => x.a === p || x.b === p), vs = f ? (f.a === p ? (f.b ? f.b.name : f.ghost ? "fantôme" : "monstres") : f.a.name) : "";
    return `<div class="ar-pl ${p.alive ? "" : "dead"} ${p === G.me ? "me" : ""} ${f ? "can" : ""} ${f && f === UI.view ? "view" : ""}" ${f ? `data-pl="${p.id}"` : ""}><div class="ar-plh"><span class="ar-av">${p.av}</span><b>${esc(p.name)}</b><span>${p.alive ? "❤️ " + Math.max(0, p.hp) : "💀 " + p.place + "e"}</span></div>${p.alive ? `<div class="ar-pls"><small>Niv. ${p.lvl}${Math.abs(p.streak) >= 2 ? (p.streak > 0 ? " · 🔥 " + p.streak : " · 🧊 " + -p.streak) : ""}${f ? ` · <span class="ar-plv">${f.done ? "✔️" : "⚔️"} ${esc(vs)}${f === UI.view ? " 👁" : ""}</span>` : ""}</small><span class="ar-plm">${L.map(x => `<i class="c${UN[x.n].c} s${x.star}" style="${bg(x.n)}"></i>`).join("")}</span></div>` : ""}<i class="ar-plb" style="width:${Math.max(0, p.hp)}%"></i></div>`; }).join(""); }
  function drawDmg() { const S = UI.sim, box = root && $("#ar-dmg"); if (!S || !box) return; const L = S.units.filter(u => u.side === 0 && !u.sum && !u.mon).sort((a, b) => b.dealt - a.dealt), mx = Math.max(1, ...L.map(u => u.dealt));
    box.innerHTML = L.map(u => `<div class="ar-dr"><i class="ar-dp c${u.cost}" style="${bg(u.n)}"></i><div><span>${esc(artOf(u.n).nm)}</span><b>${Math.round(u.dealt)}</b><em><u style="width:${u.dealt / mx * 100}%"></u></em></div></div>`).join(""); }
  function statLine(n, star) { const d = UN[n], b = CB[d.cl], st = STAR[star - 1]; return `PV <b>${Math.round(HPB[d.c - 1] * b.hp * st)}</b> · Dégâts <b>${Math.round(ADB[d.c - 1] * b.ad * st)}</b> · Vitesse <b>${b.as}</b> · Portée <b>${b.rg === 1 ? "mêlée" : b.rg + " cases"}</b> · Armure <b>${b.ar}</b> · Mana <b>${d.s.m || b.m}</b>`; }
  function drawInfo() {
    const box = $("#ar-info"), x = UI.info; box.classList.toggle("open", !!x);
    if (!x) { box.innerHTML = `<div class="ar-tip"><b>💡 Conseil</b><p>${TIPS[G.ri % TIPS.length]}</p><p class="ar-hint">Touche une unité ou le « i » d'une carte pour voir sa fiche. Glisse tes unités pour les placer.</p></div>`; return; }
    const d = UN[x.n], a = artOf(x.n);
    box.innerHTML = `<div class="ar-ipic c${d.c}" style="${bg(x.n)}"></div><div class="ar-itx"><h3>${esc(a.nm)} <small>${stars(x.star || 1)} · ${d.c}🪙</small></h3>
      <p class="ar-itr">${d.o.map(k => `${TICO(k)} ${TNAME(k)}`).join(" · ")} · ${TICO(d.cl)} ${TNAME(d.cl)}</p><p class="ar-ist">${statLine(x.n, x.star || 1)}</p>
      <p><b>${esc(d.s.n)} :</b> ${esc(d.s.t)}</p><p class="ar-ipl">📍 <b>Placement :</b> ${PLACE[d.cl]}</p></div><div class="ar-ibtn">${x.own && (G.phase === "plan" || !G.me.board.includes(x.own)) ? `<button class="ar-b" data-act="sell">Vendre <small>+${sellVal(x.own)}🪙</small></button>` : ""}<button class="ar-b mini" data-act="closeinfo">✕</button></div>`;
  }
  // dépose l'unité s sur une case du plateau, un emplacement du banc ou la zone de vente
  function dropOn(s, tg) {
    const p = G.me, onB = p.board.includes(s);
    if (tg.sell) { sell(p, s); sfx("sell"); }
    else if (tg.cell) { const [r, c] = tg.cell, there = p.board.find(u => u.r === r && u.c === c); if (there === s) { UI.sel = null; UI.info = null; return drawAll(); }
      if (onB) { if (there) { there.r = s.r; there.c = s.c; } s.r = r; s.c = c; }
      else { const bi = p.bench.indexOf(s); if (there) { p.board.splice(p.board.indexOf(there), 1); p.bench[bi] = there; delete there.r; delete there.c; s.r = r; s.c = c; p.board.push(s); }
        else { if (p.board.length >= p.lvl) { sfx("err"); note(`Niveau ${p.lvl} : ${p.lvl} unité${p.lvl > 1 ? "s" : ""} max sur le plateau.`); UI.sel = null; UI.info = null; return drawAll(); } p.bench[bi] = null; s.r = r; s.c = c; p.board.push(s); } }
      sfx("place"); }
    else if (tg.bench != null) { const i = tg.bench, there = p.bench[i]; if (there === s) { UI.sel = null; UI.info = null; return drawAll(); }
      if (onB) { p.board.splice(p.board.indexOf(s), 1); if (there) { there.r = s.r; there.c = s.c; p.board.push(there); } delete s.r; delete s.c; p.bench[i] = s; }
      else { const bi = p.bench.indexOf(s); p.bench[bi] = there || null; p.bench[i] = s; }
      sfx("place"); }
    UI.sel = null; UI.info = null; drawAll();
  }
  /* ---------- glisser-déposer ---------- */
  const unitAt = el => { if (!el || !G) return null; const c = el.closest("[data-cell]"), b = el.closest("[data-bench]"); if (c) { const [r, k] = c.dataset.cell.split(",").map(Number); return G.me.board.find(u => u.r === r && u.c === k) || null; } if (b) return G.me.bench[+b.dataset.bench] || null; return null; };
  const DG = { x: null };
  function dragDown(e) {
    if (!G || G.phase === "over" || e.button > 0 || !e.target.closest(".ar-tok")) return; const x = unitAt(e.target); if (!x || G.phase !== "plan" && G.me.board.includes(x)) return;
    DG.x = x; DG.sx = e.clientX; DG.sy = e.clientY; DG.on = false; DG.id = e.pointerId;
    document.addEventListener("pointermove", dragMove); document.addEventListener("pointerup", dragUp); document.addEventListener("pointercancel", dragEnd);
  }
  function dragMove(e) {
    if (!DG.x || e.pointerId !== DG.id) return;
    if (!DG.on) { if (Math.hypot(e.clientX - DG.sx, e.clientY - DG.sy) < 9) return; DG.on = true; UI.sel = DG.x; UI.info = { n: DG.x.n, star: DG.x.star, own: DG.x }; drawAll(); root.classList.add("dragging"); sfx("pick");
      $("#ar-sellz").textContent = `🪙 Lâche ici pour vendre (+${sellVal(DG.x)} or)`;
      const g = DG.g = document.createElement("div"); g.className = "ar-ghost"; g.innerHTML = tokenHTML(DG.x.n, DG.x.star, UN[DG.x.n].c); root.appendChild(g); }
    DG.g.style.left = e.clientX + "px"; DG.g.style.top = e.clientY + "px";
    const el = document.elementFromPoint(e.clientX, e.clientY), t = el && (el.closest("[data-cell]") || el.closest("[data-bench]") || el.closest("#ar-shopbar"));
    if (t !== DG.over) { if (DG.over) DG.over.classList.remove("over"); DG.over = t || null; if (t) t.classList.add("over"); }
  }
  function dragUp(e) {
    if (!DG.x || e.pointerId !== DG.id) return; const x = DG.x, was = DG.on; dragEnd(); if (!was) return;
    UI.noClick = Date.now(); const el = document.elementFromPoint(e.clientX, e.clientY), c = G.phase === "plan" && el && el.closest("[data-cell]"), b = el && el.closest("[data-bench]");
    if (c) dropOn(x, { cell: c.dataset.cell.split(",").map(Number) }); else if (b) dropOn(x, { bench: +b.dataset.bench }); else if (el && el.closest("#ar-shopbar")) dropOn(x, { sell: 1 }); else { UI.sel = null; UI.info = null; drawAll(); }
  }
  function dragEnd() { document.removeEventListener("pointermove", dragMove); document.removeEventListener("pointerup", dragUp); document.removeEventListener("pointercancel", dragEnd); if (DG.g) DG.g.remove(); if (DG.over) DG.over.classList.remove("over"); DG.g = DG.over = DG.x = null; DG.on = false; if (root) root.classList.remove("dragging"); }
  function note(t) { if (API && API.toast) API.toast(t); }
  function onClick(e) {
    const t = e.target; if (UI.noClick && Date.now() - UI.noClick < 200) return;
    const inf = t.closest("[data-info]"); if (inf) { e.stopPropagation(); UI.info = { n: inf.dataset.info, star: 1 }; return drawInfo(); }
    const act = t.closest("[data-act]"); if (act && !act.disabled) return doAct(act.dataset.act);
    const tr = t.closest("[data-trait]"); if (tr) return traitPop(tr.dataset.trait);
    const pl = t.closest("[data-pl]"); if (pl && G && G.fights) { const q = G.players[+pl.dataset.pl], f = G.fights.find(x => x.a === q || x.b === q); if (f && f !== UI.view) { sfx("pick"); watch(f); } return; }
    if (!G || G.phase === "over") return;
    const b = t.closest("[data-buy]"); if (b && !b.disabled) { const r = buy(G.me, +b.dataset.buy); sfx(typeof r === "string" ? "err" : r ? "star" : "buy"); if (typeof r === "string") { if (r !== "vide") note(r); } else if (r) note(`✨ ${artOf(r[0].n).nm} passe ${stars(r[0].star)} !`); UI.sel = null; return drawAll(); }
    const fighting = G.phase !== "plan";
    if (fighting) { const tk = t.closest("[data-uid]"); if (tk && UI.sim) { const u = UI.sim.units[+tk.dataset.uid]; if (u && UN[u.n]) { UI.sel = null; UI.info = { n: u.n, star: u.star }; drawInfo(); } return; } }
    const cell = fighting ? null : t.closest("[data-cell]"), slot = t.closest("[data-bench]"), p = G.me;
    if (cell || slot) { const there = cell ? p.board.find(u => u.r + "," + u.c === cell.dataset.cell) : p.bench[+slot.dataset.bench];
      if (UI.sel && UI.sel !== there) return dropOn(UI.sel, cell ? { cell: cell.dataset.cell.split(",").map(Number) } : { bench: +slot.dataset.bench });
      if (there) { UI.sel = UI.sel === there ? null : there; UI.info = UI.sel ? { n: there.n, star: there.star, own: there } : null; if (UI.sel) sfx("pick"); }
      return drawAll(); }
  }
  function doAct(a) {
    const p = G && G.me;
    if (a === "quit") { if (!G || G.phase === "over" || confirm("Quitter la partie en cours ?")) close(); return; }
    if (a === "help") return help();
    if (a === "vol") { const v = $("#ar-vol"); if (v) v.hidden = !v.hidden; return; }
    if (a === "skip") return cineEnd();
    if (a === "myfight") { if (G && G.fights && UI.fight) watch(UI.fight); return; }
    if (a === "again") { clearInterval(UI.timer); clearTimeout(UI.cine); stopLoop(); music(null); return menu(); }
    if (a === "closeinfo") { UI.info = null; UI.sel = null; return drawAll(); }
    if (a === "speed") { UI.speed = UI.speed === 1 ? 2 : UI.speed === 2 ? 4 : 1; $("#ar-speed").textContent = "×" + UI.speed; if (UI.loop) { stopLoop(); runLoop(); } return; }
    if (a === "ready") { if (G.phase === "plan") fight(); return; }
    if (a === "sell" && G.phase !== "plan" && UI.info && UI.info.own && p.board.includes(UI.info.own)) return;
    if (a === "xp") { const l = p.lvl; buyXp(p); sfx(p.lvl > l ? "lvl" : "xp"); } else if (a === "roll") { reroll(p); sfx("roll"); } else if (a === "lock") { p.lock = !p.lock; sfx("lock"); }
    else if (a === "sell" && UI.info && UI.info.own) { sfx("sell"); sell(p, UI.info.own); UI.info = null; UI.sel = null; }
    drawAll();
  }
  function traitPop(k) {
    const cnt = traitsOf(G.me.board)[k] || 0, ti = tier(k, cnt), m = document.createElement("div"); m.className = "ar-modal";
    m.innerHTML = `<div class="ar-sheet"><h2>${TICO(k)} ${TNAME(k)} <small>${cnt} sur le plateau</small></h2>${TR[k].t.map((t, i) => `<p class="${i === ti ? "ar-on" : ""}"><b>${t}</b> : ${TR[k].d(TR[k].v[i])}</p>`).join("")}
      <p class="ar-hint">Unités : ${SET.filter(n => UN[n].o.includes(k) || UN[n].cl === k).map(n => `${esc(n)} (${UN[n].c})`).join(", ")}</p><button class="ar-b" data-x>Fermer</button></div>`;
    root.appendChild(m); m.onclick = e => { if (e.target === m || e.target.closest("[data-x]")) m.remove(); };
  }
  function startTimer() { clearInterval(UI.timer); UI.tleft = UI.ttot = G.ri < 3 ? 25 : 40; const tick = () => { if (!root || !G || G.phase !== "plan") return clearInterval(UI.timer); $("#ar-timer").textContent = "⏳ " + UI.tleft; $("#ar-tbar").style.width = UI.tleft / UI.ttot * 100 + "%"; if (UI.tleft <= 5 && UI.tleft > 0) sfx("tick"); if (UI.tleft-- <= 0) { clearInterval(UI.timer); fight(); } }; tick(); UI.timer = setInterval(tick, 1000); }
  /* ---------- combat affiché ---------- */
  function fight() {
    clearInterval(UI.timer); if (G.phase !== "plan") return; dragEnd(); sfx("go"); const p = G.me;
    // plateau incomplet : on complète avec le banc
    while (p.board.length < p.lvl && p.bench.some(Boolean)) { const i = p.bench.findIndex(x => x && !p.board.some(b => b.n === x.n)); const j = i >= 0 ? i : p.bench.findIndex(Boolean); const x = p.bench[j]; p.bench[j] = null; let r = 0, c = 3, k = 0; while (p.board.some(b => b.r === r && b.c === c)) { k++; c = [3, 2, 4, 1, 5, 0, 6][k % 7]; r = Math.floor(k / 7); } x.r = r; x.c = c; p.board.push(x); }
    G.phase = "fight"; UI.sel = null; UI.info = null;
    const f = prepareFights(); UI.fight = f; G.fights.forEach(x => { x.S = simInit(x.A, x.B, x.seed); x.done = false; });
    drawAll(); $("#ar-tbar").style.width = "0%"; watch(f);
    music(f.b || f.ghost ? "pvp" : "main"); runLoop();
  }
  const foeName = f => f.b ? f.b.name : f.ghost ? "le fantôme de " + f.ghost.name : "les monstres";
  // affiche le combat f (le sien ou celui d'un autre joueur)
  function watch(f) {
    UI.view = f; UI.sim = f.S; UI.tok = {}; $("#ar-live").innerHTML = ""; $("#ar-cells").querySelectorAll(".ar-tok").forEach(x => x.remove());
    f.S.units.forEach(u => { if (u.alive) addTok(u); });
    $("#ar-timer").textContent = f === UI.fight ? "contre " + foeName(f) : `👁 ${f.a.name} contre ${foeName(f)}`;
    let v = $("#ar-view"); if (f !== UI.fight) { if (!v) { v = document.createElement("div"); v.id = "ar-view"; v.className = "ar-view"; $("#ar-board").appendChild(v); }
      v.innerHTML = `<span>👁 ${esc(f.a.name)} (en bas) contre ${esc(foeName(f))} (en haut)</span><button class="ar-b" data-act="myfight">Revenir à mon combat</button>`; } else if (v) v.remove();
    drawPlayers(); drawDmg();
  }
  function addTok(u) { const el = document.createElement("div"); el.className = `ar-u side${u.side} c${u.cost} ${u.mon ? "mon" : ""}`; el.dataset.uid = u.uid; el.style.cssText = hexPos(u.R, u.C);
    el.innerHTML = `<div class="ar-bars"><i class="hp"></i><i class="mp"></i></div>${tokenHTML(u.mon ? u.art : u.n, u.star, u.cost)}`; $("#ar-live").appendChild(el); UI.tok[u.uid] = el; }
  function runLoop() { UI.loop = setInterval(tickFight, 100 / UI.speed); }
  function stopLoop() { clearInterval(UI.loop); UI.loop = null; }
  function fx(cls, R, C, txt, ms) { const el = document.createElement("div"); el.className = "ar-fx " + cls; el.style.cssText = hexPos(R, C); if (txt != null) el.textContent = txt; $("#ar-live").appendChild(el); setTimeout(() => el.remove(), ms || 700); return el; }
  function tickFight() {
    if (!root || !G || !G.fights) return stopLoop();
    for (const f of G.fights) { if (f.done) continue; const S = f.S; step(S); if (f === UI.view) showEvents(S); S.ev.length = 0;
      if (S.over) { f.done = true; const g0 = G.me.gold; resolveFight(f, S);
        if (f === UI.fight) { G.hist[G.ri] = f.res.w ? 1 : 0; sfx(f.res.w ? "win" : "lose"); const b = $("#ar-banner"); b.hidden = false; b.className = "ar-banner " + (f.res.w ? "win" : "lose");
          b.innerHTML = (f.res.w ? `Victoire !<small>+${G.me.gold - g0} 🪙</small>` : `Défaite<small>−${f.res.d} PV</small>`) + (G.fights.some(x => !x.done) ? `<em>Les autres combats continuent : touche un joueur pour regarder.</em>` : "");
          setTimeout(() => { if (root) $("#ar-banner").hidden = true; }, 2200); drawTop(); drawShop(); }
        drawPlayers(); } }
    const S = UI.sim; if (S) { if (Math.round(S.t * 10) % 5 === 0) drawDmg();
      for (const u of S.units) { const el = UI.tok[u.uid]; if (!el || !u.alive) continue; el.style.left = ((u.C + (u.R & 1) * .5) / 7.5 * 100) + "%"; el.style.top = (u.R * .75 / 6.25 * 100) + "%";
        el.querySelector(".hp").style.width = Math.max(0, u.hp / u.maxhp * 100) + "%"; el.querySelector(".mp").style.width = (u.maxMana ? u.mana / u.maxMana * 100 : 0) + "%";
        el.classList.toggle("stun", u.stunT > S.t); el.classList.toggle("shd", u.shield > 0); el.classList.toggle("ghosted", u.untargT > S.t); el.classList.toggle("big", !!u.big); } }
    if (G.fights.every(f => f.done)) { stopLoop(); drawDmg(); setTimeout(endRound, 1500 / Math.min(2, UI.speed)); }
  }
  function showEvents(S) {
    for (const e of S.ev) { const u = e.u != null ? S.units[e.u] : null, el = u && UI.tok[u.uid];
      if (e.k === "spawn") addTok(u);
      if (e.k === "dmg") sfx(e.c ? "crit" : "hit"); else if (e.k === "cast") sfx("cast"); else if (e.k === "die") sfx("die"); else if (e.k === "heal") sfx("heal"); else if (e.k === "gold") sfx("gold"); else if (e.k === "shot") sfx("shot");
      if (e.k === "dmg" && u) { fx("dm" + (e.c ? " crit" : "") + (e.m ? " mag" : ""), u.R, u.C, e.v, 650); if (el) { el.classList.add("hit"); setTimeout(() => el.classList.remove("hit"), 150); } }
      else if (e.k === "heal" && u) fx("hl", u.R, u.C, "+" + e.v, 650);
      else if (e.k === "miss" && u) fx("ms", u.R, u.C, "esquive", 600);
      else if (e.k === "gold" && u) fx("gd", u.R, u.C, "+1🪙", 900);
      else if (e.k === "cast" && u) { fx("cast", u.R, u.C, e.n, 1100); if (el) { el.classList.add("casting"); setTimeout(() => el.classList.remove("casting"), 500); } }
      else if (e.k === "die" && el) { el.classList.add("dead"); }
      else if (e.k === "leap" && el) { el.classList.add("leap"); sfx("cast"); setTimeout(() => el.classList.remove("leap"), 480 / Math.min(2, UI.speed)); }
      else if (e.k === "sudden") { fx("sudden", 3.5, 3, "⚡ Mort subite !", 1800); sfx("go"); }
      else if (e.k === "zone") { const z = fx("zone side" + e.side, e.R, e.C, null, 500); z.style.setProperty("--zr", e.r); }
      else if (e.k === "flash") { const b = $("#ar-board"); b.classList.add("flash"); setTimeout(() => b.classList.remove("flash"), 350); }
      else if (e.k === "atk" || e.k === "shot") { const a = S.units[e.a], b = S.units[e.b], ea = UI.tok[e.a]; if (!a || !b) continue;
        if (e.k === "atk" && ea) { ea.style.setProperty("--lx", ((b.C + (b.R & 1) * .5) - (a.C + (a.R & 1) * .5)) * 30 + "%"); ea.style.setProperty("--ly", (b.R - a.R) * 30 + "%"); ea.classList.remove("lunge"); void ea.offsetWidth; ea.classList.add("lunge"); }
        else if (e.k === "shot") { const s = fx("shot side" + a.side, a.R, a.C, null, 260); requestAnimationFrame(() => { s.style.cssText = hexPos(b.R, b.C); }); } }
      else if (e.k === "beam") { const a = S.units[e.a]; if (a) { const z = fx("beam side" + a.side, a.R, a.C, null, 450); z.style.setProperty("--ang", Math.atan2(e.dy * .75 * 1.1547, e.dx) + "rad"); } }
    }
  }
  function endRound() {
    if (!root || !G) return; const v = $("#ar-view"); if (v) v.remove(); $("#ar-banner").hidden = true; UI.sim = UI.view = null; G.fights = null; dragEnd(); UI.sel = null; UI.info = null;
    roundEnd(); if (G.phase === "over") return over(); music("main"); drawAll(); startTimer();
  }
  const fmt = n => Math.round(n).toLocaleString("fr-FR");
  function over() {
    const pl = G.me.place; if (pl === 1) return cine();
    music(null); const m = document.createElement("div"); m.className = "ar-modal";
    m.innerHTML = `<div class="ar-sheet ar-over"><h2>${pl <= 4 ? "Top " + pl : pl + "e place"}</h2><p>Tu termines ${pl}e sur 8, à la manche ${G.info.st}-${G.info.k}.</p>
      <div class="ar-row"><button class="ar-b go" data-act="again">Rejouer</button><button class="ar-b" data-act="quit">Quitter</button></div></div>`;
    root.appendChild(m);
  }
  /* ---------- cinématique de victoire ---------- */
  function cineUnits() { return G.me.board.map(x => ({ x, st: x.st || { d: 0, k: 0, h: 0, t: 0, f: 0 } })).sort((a, b) => a.st.d - b.st.d); }
  function cine() {
    music("win"); const L = cineUnits(), c = document.createElement("div"); c.className = "ar-cine"; c.id = "ar-cine";
    c.innerHTML = `<div class="ar-crays"></div><div class="ar-cstage" id="ar-cstage"></div><button class="ar-b ar-cskip" data-act="skip">Passer ⏭</button>`; root.appendChild(c);
    const stage = c.querySelector("#ar-cstage"), steps = [];
    steps.push([3200, () => `<div class="ar-ctitle"><span>🏆</span><h1>VICTOIRE</h1><p>Dernier joueur en vie · manche ${G.info.st}-${G.info.k}</p></div>`]);
    steps.push([2600, () => `<div class="ar-ctitle sm"><h2>Tes champions</h2><p>${G.stat.wins} combat${G.stat.wins > 1 ? "s" : ""} gagné${G.stat.wins > 1 ? "s" : ""} sur ${G.stat.fights}</p></div>`]);
    L.forEach(({ x, st }, i) => { const d = UN[x.n], a = artOf(x.n), mvp = i === L.length - 1;
      steps.push([mvp ? 4600 : 3000, () => `<div class="ar-chero c${d.c} ${mvp ? "mvp" : ""}">${mvp ? `<div class="ar-cmvp">⭐ MVP ⭐</div>` : ""}<div class="ar-cpic" style="${bg(x.n)}"></div>
        <div class="ar-cinf"><h2>${esc(a.nm)}</h2><p class="ar-cst">${stars(x.star)}</p><p class="ar-ctr">${d.o.map(k => `${TICO(k)} ${TNAME(k)}`).join(" · ")} · ${TICO(d.cl)} ${TNAME(d.cl)}</p>
        <div class="ar-cstats"><div><b data-n="${Math.round(st.d)}">0</b><small>⚔️ dégâts infligés</small></div><div><b data-n="${st.k}">0</b><small>💀 éliminations</small></div><div><b data-n="${Math.round(st.h)}">0</b><small>💚 soins</small></div><div><b data-n="${Math.round(st.t)}">0</b><small>🛡️ dégâts encaissés</small></div></div>
        <p class="ar-cf">${st.f} combat${st.f > 1 ? "s" : ""} à tes côtés</p></div></div>`]); });
    let i = 0; const next = () => { if (!root || !c.isConnected) return; if (i >= steps.length) return cineEnd(); const [ms, h] = steps[i++]; stage.innerHTML = h();
      stage.querySelectorAll("[data-n]").forEach(b => { const n = +b.dataset.n, t0 = performance.now(), run = t => { const k = Math.min(1, (t - t0) / 1100); b.textContent = fmt(n * (1 - Math.pow(1 - k, 3))); if (k < 1 && b.isConnected) requestAnimationFrame(run); }; requestAnimationFrame(run); });
      UI.cine = setTimeout(next, ms); };
    next();
  }
  function cineEnd() {
    clearTimeout(UI.cine); const c = root && root.querySelector("#ar-cine"); if (!c) return; const L = cineUnits().reverse(), tot = L.reduce((a, u) => ({ d: a.d + u.st.d, k: a.k + u.st.k, h: a.h + u.st.h }), { d: 0, k: 0, h: 0 });
    const cnt = traitsOf(G.me.board), act = Object.keys(cnt).filter(k => tier(k, cnt[k]) >= 0);
    c.querySelector(".ar-cskip").remove();
    c.querySelector("#ar-cstage").innerHTML = `<div class="ar-cend"><h1>🏆 Victoire !</h1>
      <p class="ar-ctot">❤️ ${Math.max(0, G.me.hp)} PV restants · niveau ${G.me.lvl} · ${G.stat.wins}/${G.stat.fights} combats gagnés<br>⚔️ ${fmt(tot.d)} dégâts · 💀 ${tot.k} éliminations · 💚 ${fmt(tot.h)} soins</p>
      ${act.length ? `<p class="ar-ctr">${act.map(k => `${TICO(k)} ${TNAME(k)} ${cnt[k]}`).join(" · ")}</p>` : ""}
      <div class="ar-ctab">${L.map(({ x, st }, i) => `<div class="ar-crow c${UN[x.n].c} ${i ? "" : "mvp"}"><div class="ar-cmini" style="${bg(x.n)}"></div><div class="ar-cn"><b>${esc(artOf(x.n).nm)}</b><small>${stars(x.star)}${i ? "" : " · MVP"}</small></div><span>⚔️ ${fmt(st.d)}</span><span>💀 ${st.k}</span><span>💚 ${fmt(st.h)}</span><span>🛡️ ${fmt(st.t)}</span></div>`).join("")}</div>
      <div class="ar-row"><button class="ar-b go" data-act="again">Rejouer</button><button class="ar-b" data-act="quit">Quitter</button></div></div>`;
  }
  W.WikiArena = { open, close, _t: { UN, SET, TR, newGame, simRun, simInit, step, teamOf, buy, sell, merge, botTurn, prepareFights, resolveFight, resolveOthers, roundEnd, watch, roundInfo, pveTeam, TRK, cine, get G() { return G; } } };
})();
