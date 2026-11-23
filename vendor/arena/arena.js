/* Wiki Arena : auto-battler (étape 1 : solo contre des bots, set 1). Réservé aux admins tant que le mode n'est pas ouvert. */
(function () {
  "use strict";
  const W = typeof window !== "undefined" ? window : globalThis;
  const IDS = W.ARENA_IDS || {};
  const ORI = { catch: ["Catch", "🤼"], pol: ["Politique", "🏛️"], hor: ["Horreur", "👻"], manga: ["Manga", "🍥"], jv: ["Jeux vidéo", "🎮"], meme: ["Memes", "😹"], da: ["Dessins animés", "📺"], hero: ["Super-héros", "🦸"], vid: ["Vidéastes", "🎬"], chat: ["Chat", "🐱"], series: ["Séries", "🎞️"], disney: ["Disney", "🏰"], mytho: ["Mythologie", "⚡"], wc: ["Joueurs Wiki Cards", "🃏"], chant: ["Chanteurs", "🎤"], hist: ["Histoire", "📜"], actx: ["Actrices X", "🔞"] };
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
    series: { t: [3, 5, 7, 9], v: [[120], [280], [480], [750]], d: v => `Au début du combat, toute ton équipe reçoit un bouclier de ${v[0]}.` },
    disney: { t: [3, 5, 7, 9], v: [[1.5], [3], [5], [8]], d: v => `Les unités Disney récupèrent ${v[0]} % de leurs PV max chaque seconde.` },
    mytho: { t: [3, 5, 7, 9], v: [[12], [25], [40], [60]], d: v => `Les unités de Mythologie infligent ${v[0]} % de dégâts en plus.` },
    wc: { t: [3, 5, 7, 9], v: [[3], [5], [8], [12]], d: v => `Fragments : à chaque ennemi éliminé par ton équipe, les Joueurs infligent ${v[0]} % de dégâts en plus jusqu'à la fin du combat.` },
    chant: { t: [3, 5, 7, 9], v: [[15], [30], [45], [70]], d: v => `Les Chanteurs commencent le combat avec ${v[0]} mana.` },
    hist: { t: [3, 5, 7, 9], v: [[10], [20], [35], [55]], d: v => `Savoir : toute ton équipe gagne ${v[0]} % de puissance des sorts.` },
    actx: { t: [3, 5, 7, 9], v: [[8], [15], [24], [35]], d: v => `Charme : les ennemis attaquent ${v[0]} % moins vite.` },
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
  let CURSET = 1; const SETS = { 1: [], 2: [], 3: [], 4: [] };
  const U = (n, c, cl, o, s) => { UN[n] = { n, c, cl, o, s }; SETS[CURSET].push(n); };
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
  U("Napoléon Ier", 5, "str", ["pol"], { k: "summon", cnt: [2, 3, 5], hp: 650, ad: 65, m: 70, sn: "Grognard", art: "Garde impériale", n: "Grande Armée", t: "Invoque des soldats de la Garde." });
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
  // set 1 : compléments pour atteindre 65 unités
  U("Marine Le Pen", 5, "sou", ["pol"], { k: "heal", who: "all", p: .6, sh: .6, m: 80, n: "Rassemblement", t: "Soigne et protège toute l'équipe." });
  U("Philippe Poutou", 2, "tir", ["pol"], { k: "strike", p: 1, weaken: .3, d: 4, n: "Punchline", t: "Une réplique qui blesse sa cible et réduit ses dégâts de 30 % pendant 4 s." });
  U("SCP-049 · Le Docteur de la Peste", 4, "str", ["hor"], { k: "summon", cnt: [1, 1, 2], hp: 750, ad: 65, m: 70, sn: "SCP-049-2", art: "Zombie", n: "Le remède", t: "« Soigne » une victime : un mort-vivant se bat pour lui." });
  U("Pépé le putois", 1, "tir", ["da"], { k: "aoeT", p: .5, r: 1, slow: .3, d: 4, n: "Parfum", t: "Son odeur blesse sa cible et ses voisins, et ralentit leurs attaques de 30 %." });
  U("Grand Schtroumpf", 5, "str", ["da"], { k: "summon", cnt: [3, 3, 4], hp: 400, ad: 48, m: 70, sn: "Schtroumpf", art: "Les Schtroumpfs", egg: ["Schtroumpfette", .02], n: "Schtroumpfez-les !", t: "Appelle les Schtroumpfs du village à la rescousse." });
  U("Ironmouse", 4, "sou", ["vid"], { k: "buff", who: "all", s: "as", v: .3, d: 5, m: 50, n: "Subathon", t: "Toute l'équipe gagne 30 % de vitesse d'attaque pendant 5 s." });
  U("El Risitas", 5, "sou", ["meme"], { k: "stunall", p: .3, stun: [1.2, 1.6, 2.5], m: 80, n: "Fou rire", t: "Son rire est contagieux : tous les ennemis sont pliés en deux, incapables d'agir." });
  // --- Set 2 ---
  CURSET = 2;
  U("Darby Allin", 4, "ass", ["catch"], { k: "strike", p: 1.5, tp: "low", untarg: 1, n: "Coffin Drop", t: "Se jette sur l'ennemi le plus faible, puis devient inciblable 1 s." });
  U("Bulma", 5, "tir", ["manga"], { k: "line", p: 1.4, n: "Canon Capsule Corp", t: "Un tir d'énergie qui traverse toute une ligne." });
  U("Kōtarō Bokuto", 5, "tir", ["manga"], { k: "far", p: 2, stun: 1, n: "Smash en ligne droite", t: "Un smash surpuissant sur l'ennemi le plus éloigné : dégâts et étourdissement." });
  U("Trollface", 5, "tir", ["meme"], { k: "multi", cnt: 4, rndT: 1, p: .6, weaken: .3, d: 4, n: "Problem ?", t: "Trolle 4 ennemis au hasard : dégâts, et ils frappent 30 % moins fort." });
  U("Harley Quinn", 5, "ass", ["hero"], { k: "strike", p: 1.7, tp: "low", stun: 1.2, n: "Coup de maillet", t: "Bondit sur l'ennemi le plus faible et l'assomme." });
  U("Punisher", 1, "tir", ["hero"], { k: "strike", p: .5, phys: 1, n: "Tir précis", t: "Un tir critique garanti." });
  U("The Miz", 1, "str", ["catch"], { k: "buff", who: "near", s: "amp", v: .15, d: 5, m: 50, n: "Miz TV", t: "Les alliés proches infligent 15 % de dégâts en plus pendant 5 s." });
  U("Logan Paul", 2, "bag", ["catch", "vid"], { k: "strike", p: 1.2, stun: 1, n: "One Lucky Punch", t: "Un crochet qui étourdit sa cible." });
  U("Jade Cargill", 3, "bag", ["catch"], { k: "strike", p: 1.6, n: "Jaded", t: "Écrase sa cible au sol : gros dégâts." });
  U("Hiroshi Tanahashi", 3, "ass", ["catch"], { k: "strike", p: 1.5, tp: "low", n: "High Fly Flow", t: "S'envole sur l'ennemi le plus faible." });
  U("Bray Wyatt", 5, "mag", ["catch"], { k: "aoeT", p: 1.5, r: 2, stun: 1.5, weaken: .3, d: 5, n: "Les lucioles", t: "Plonge une large zone dans le noir : dégâts, étourdissement, et les ennemis frappent 30 % moins fort." });
  U("Hulk Hogan", 5, "col", ["catch"], { k: "aoeS", p: 1.1, r: 1, stun: 1.2, pas: "ramp", n: "Hulkamania", t: "Étourdit tout autour de lui. Passif : plus il perd de PV, plus il frappe fort." });
  U("Abraham Lincoln", 1, "sou", ["pol"], { k: "shield", who: "all", p: .4, d: 5, m: 70, n: "Proclamation", t: "Donne un petit bouclier à toute l'équipe." });
  U("Kim Jong-un", 2, "tir", ["pol"], { k: "aoeT", p: .75, r: 1, n: "Missile", t: "Un missile explose sur sa cible et ses voisins." });
  U("Benyamin Netanyahou", 3, "col", ["pol"], { k: "shield", who: "all", p: .6, d: 5, m: 80, n: "Dôme de fer", t: "Protège toute l'équipe avec un bouclier." });
  U("Xi Jinping", 3, "str", ["pol"], { k: "buff", who: "all", s: "armor", v: 30, d: 6, m: 60, n: "Grande Muraille", t: "Toute l'équipe gagne 30 d'armure et de résistance pendant 6 s." });
  U("Donald Trump", 4, "str", ["pol"], { k: "summon", cnt: [1, 1, 2], hp: 1500, ad: 30, m: 60, sn: "Mur", art: "Mur frontalier États-Unis–Mexique", n: "Le Mur", t: "Fait construire un mur très résistant devant lui." });
  U("Vladimir Poutine", 4, "bag", ["pol"], { k: "strike", p: 1.5, stun: 1.2, n: "Prise de judo", t: "Projette sa cible : dégâts et étourdissement." });
  U("Adolf Hitler", 4, "str", ["pol"], { k: "buff", who: "all", s: "as", v: .35, d: 5, m: 50, n: "Discours", t: "Toute l'équipe gagne 35 % de vitesse d'attaque pendant 5 s." });
  U("Chucky", 1, "ass", ["hor"], { k: "strike", p: .5, dot: .9, d: 4, n: "Coup de couteau", t: "Poignarde sa cible, qui saigne pendant 4 s." });
  U("Emela-ntouka", 1, "col", ["hor"], { k: "strike", p: .9, stun: 1, n: "Coup de corne", t: "Charge sa cible et l'étourdit." });
  U("Michael Myers", 3, "bag", ["hor"], { k: "strike", p: 1.3, untarg: 1.5, n: "La Forme", t: "Frappe, puis disparaît : inciblable 1,5 s." });
  U("Herobrine", 4, "mag", ["hor"], { k: "far", p: 1.6, stun: 1.5, n: "Foudre", t: "Foudroie l'ennemi le plus éloigné." });
  U("Jason Voorhees", 4, "col", ["hor"], { k: "aoeS", p: .8, r: 1, pas: "revive", n: "Machette", t: "Tranche autour de lui. Passif : se relève une fois après sa mort." });
  U("Freddy Krueger", 4, "mag", ["hor"], { k: "multi", cnt: 3, p: .9, stun: 1.2, n: "Cauchemar", t: "Endort et blesse 3 ennemis." });
  U("Godzilla", 5, "col", ["hor"], { k: "line", p: 1.5, dot: 1.5, d: 4, n: "Souffle atomique", t: "Un rayon traverse toute une ligne et brûle pendant 4 s." });
  U("Pochita", 1, "bag", ["manga"], { k: "transform", hp: 150, ad: .2, n: "Tronçonneuse", t: "Sort ses tronçonneuses : gagne des PV et des dégâts." });
  U("Dabi", 2, "mag", ["manga"], { k: "aoeT", p: .7, r: 1, dot: 1.6, d: 4, n: "Flammes bleues", t: "Embrase une zone, qui brûle pendant 4 s." });
  U("Kyōjurō Rengoku", 3, "bag", ["manga"], { k: "aoeS", p: 1.2, r: 1, dot: .6, d: 3, n: "Neuvième mouvement", t: "Une lame de feu frappe tous les ennemis adjacents." });
  U("Vegeta", 4, "tir", ["manga"], { k: "line", p: 1.2, n: "Final Flash", t: "Un rayon qui traverse toute une ligne." });
  U("All Might", 5, "col", ["manga"], { k: "aoeT", p: 1.4, r: 1, stun: 1.5, n: "United States of Smash", t: "Un coup de poing qui étourdit sa cible et ses voisins." });
  U("Zamasu", 5, "mag", ["manga"], { k: "multi", cnt: 3, p: 1, drain: 1, n: "Lames de ki", t: "Transperce 3 ennemis et se soigne d'autant." });
  U("Le Guide", 1, "sou", ["jv"], { k: "heal", who: "low", p: 1.2, n: "Bon conseil", t: "Soigne l'allié le plus blessé." });
  U("Kéké Laglisse", 1, "sou", ["jv"], { k: "buff", who: "all", s: "as", v: .2, d: 4, m: 50, n: "Concert", t: "Toute l'équipe gagne 20 % de vitesse d'attaque pendant 4 s." });
  U("Jon le Flibustier", 2, "ass", ["jv"], { k: "strike", p: 1.3, pas: "goldkill", n: "Abordage", t: "Un coup de sabre. Passif : 1 or par élimination (2 max par combat)." });
  U("Blonde Blazer", 2, "bag", ["jv"], { k: "strike", p: 1.1, stun: 1, n: "Uppercut", t: "Frappe sa cible et l'étourdit." });
  U("Diluc", 3, "bag", ["jv"], { k: "aoeS", p: .8, r: 1, dot: .5, d: 3, n: "Aube", t: "Un phénix de feu brûle les ennemis adjacents." });
  U("Karlach", 4, "col", ["jv"], { k: "aoeS", p: .9, r: 1, pas: "enrage", n: "Rage infernale", t: "Frappe autour d'elle. Passif : dès qu'elle est blessée, elle s'enrage." });
  U("Adam Smasher", 5, "col", ["jv"], { k: "multi", cnt: 3, p: .5, phys: 1, pas: "ramp", n: "Salve de missiles", t: "Tire sur 3 ennemis. Passif : plus il perd de PV, plus il frappe fort." });
  U("Leeroy Jenkins", 1, "ass", ["meme"], { k: "strike", p: 1.5, n: "LEEROOOY !", t: "Fonce dans le tas : gros dégâts sur sa cible." });
  U("Dramatic Chipmunk", 1, "mag", ["meme"], { k: "strike", p: 1.1, stun: 1.2, n: "Regard dramatique", t: "Se retourne brusquement : sa cible est pétrifiée." });
  U("Keyboard Cat", 2, "mag", ["meme", "chat"], { k: "aoeT", p: 1.2, r: 1, slow: .3, d: 4, n: "Play him off", t: "Dégâts de zone et ralentit les attaques de 30 %." });
  U("Dancing Hot Dog", 2, "sou", ["meme"], { k: "heal", who: "near", p: .7, n: "Danse", t: "Soigne les alliés proches." });
  U("Nyan Cat", 3, "tir", ["meme", "chat"], { k: "line", p: 1.1, n: "Arc-en-ciel", t: "Traverse le plateau en laissant un arc-en-ciel qui blesse toute une ligne." });
  U("Bernadette", 4, "str", ["meme"], { k: "far", p: 1.4, stun: 2, m: 60, n: "Trouvé !", t: "Repère l'ennemi le plus éloigné : dégâts et étourdissement." });
  U("T'choupi", 1, "sou", ["da"], { k: "heal", who: "low", p: 1.1, n: "Câlin", t: "Soigne l'allié le plus blessé." });
  U("Ralph Wiggum", 1, "col", ["da"], { k: "heal", who: "self", p: .5, selfArmor: 8, n: "Je suis une licorne", t: "Se soigne et gagne de l'armure." });
  U("Sylvestre", 2, "ass", ["da", "chat"], { k: "strike", p: 1.4, tp: "low", n: "Coup de griffe", t: "Bondit sur l'ennemi le plus faible." });
  U("Elmer Fudd", 2, "tir", ["da"], { k: "strike", p: .7, phys: 1, n: "Chasse au lapin", t: "Un coup de fusil critique garanti." });
  U("Casper le gentil fantôme", 2, "sou", ["da"], { k: "heal", who: "low", p: .8, sh: .7, n: "Gentil fantôme", t: "Soigne et protège l'allié le plus blessé." });
  U("Scooby-Doo", 3, "sou", ["da"], { k: "mana", r: 2, v: 30, m: 60, n: "Scooby Snacks", t: "Donne 30 mana aux alliés proches." });
  U("Jimmy Neutron", 4, "str", ["da"], { k: "summon", cnt: [1, 1, 2], hp: 800, ad: 75, m: 70, sn: "Goddard", art: "Goddard", n: "Goddard", t: "Appelle son chien robot Goddard." });
  U("Deadpool", 2, "bag", ["hero"], { k: "heal", who: "self", p: 1.6, n: "Facteur guérisseur", t: "Se soigne fortement." });
  U("Bane", 3, "col", ["hero"], { k: "transform", hp: 450, ad: .3, n: "Venin", t: "S'injecte du Venin : gagne beaucoup de PV et de dégâts." });
  U("Professeur Xavier", 3, "sou", ["hero"], { k: "multi", cnt: 2, p: .6, stun: 1.5, n: "Cerebro", t: "Paralyse l'esprit de 2 ennemis." });
  U("Wonder Woman", 4, "bag", ["hero"], { k: "strike", p: 1.3, stun: 1.5, selfArmor: 20, n: "Lasso de vérité", t: "Ligote sa cible et gagne de l'armure." });
  U("Jean Grey", 5, "mag", ["hero"], { k: "aoeT", p: 1.5, r: 2, pas: "revive", n: "Phénix", t: "Une explosion de flammes sur une large zone. Passif : renaît une fois de ses cendres." });
  U("Galactus", 5, "mag", ["hero"], { k: "half", cnt: 3, pc: [.6, .7, .9], m: 60, n: "Dévoreur de mondes", t: "Dévore une grande partie des PV des 3 ennemis les plus résistants." });
  U("MissJirachi", 1, "sou", ["vid"], { k: "heal", who: "near", p: .6, n: "Bonne humeur", t: "Soigne les alliés proches." });
  U("Rivenzi", 1, "str", ["vid"], { k: "buff", who: "near", s: "ad", v: .25, d: 5, m: 50, n: "Cours d'histoire", t: "Les alliés proches gagnent 25 % de dégâts d'attaque pendant 5 s." });
  U("Amixem", 2, "tir", ["vid"], { k: "multi", cnt: 2, p: .5, phys: 1, n: "Cascade", t: "Touche deux cibles à la fois." });
  U("GMK", 2, "ass", ["vid"], { k: "line", p: .9, n: "Launch control", t: "Accélère à fond et traverse la ligne ennemie." });
  U("Xavier Dang", 3, "mag", ["vid"], { k: "aoeT", p: 1.3, r: 1, stun: 1, n: "Speedrun", t: "Dégâts et étourdissement sur sa cible et ses voisins." });
  U("AmineMaTue", 3, "bag", ["vid"], { k: "buff", who: "self", s: "as", v: .6, d: 5, n: "Rage", t: "S'énerve : +60 % de vitesse d'attaque pendant 5 s." });
  U("Markiplier", 4, "mag", ["vid"], { k: "aoeT", p: 1.2, r: 2, stun: 1, n: "Jumpscare", t: "Fait sursauter une large zone : dégâts et étourdissement." });
  // --- Set 3 : 5 univers de 13 unités ---
  CURSET = 3;
  U("SCP-173", 1, "ass", ["hor"], { k: "strike", p: 1.2, stun: .8, n: "Clin d'œil", t: "Dès qu'on cligne des yeux, il frappe et étourdit sa cible." });
  U("Laughing Jack", 1, "col", ["hor"], { k: "heal", who: "self", p: .6, selfArmor: 8, n: "Bonbons", t: "Se soigne et gagne de l'armure." });
  U("Baba Yaga", 2, "sou", ["hor"], { k: "heal", who: "low", p: 1, sh: .5, n: "Potion", t: "Soigne et protège l'allié le plus blessé." });
  U("Leatherface", 2, "bag", ["hor"], { k: "aoeS", p: .4, r: 1, phys: 1, n: "Tronçonneuse", t: "Tranche tous les ennemis adjacents." });
  U("Hannibal Lecter", 3, "ass", ["hor"], { k: "strike", p: 1.5, tp: "low", n: "Dîner", t: "Surgit sur l'ennemi le plus faible." });
  U("Jill Valentine", 3, "tir", ["hor"], { k: "aoeT", p: .75, r: 1, n: "Lance-grenades", t: "Une grenade explose sur sa cible et ses voisins." });
  U("Liche", 4, "mag", ["hor"], { k: "summon", cnt: [2, 2, 3], hp: 520, ad: 55, m: 70, sn: "Squelette", art: "Squelette", n: "Armée des morts", t: "Relève des squelettes pour se battre à sa place." });
  U("Pinhead", 4, "str", ["hor"], { k: "multi", cnt: 3, p: 1, stun: 1.5, m: 70, n: "Chaînes", t: "Des chaînes immobilisent et blessent 3 ennemis." });
  U("Ben Drowned", 4, "bag", ["hor"], { k: "strike", p: 1.4, untarg: 1.5, n: "Glitch", t: "Frappe, puis disparaît dans un glitch : inciblable 1,5 s." });
  U("Kayako Saeki", 4, "ass", ["hor"], { k: "strike", p: 1.6, tp: "low", stun: 1, n: "Râle", t: "Rampe jusqu'à l'ennemi le plus faible : dégâts et étourdissement." });
  U("Grippe-Sou", 5, "mag", ["hor"], { k: "stunall", p: 1, stun: [1.5, 2, 3], n: "Lumières mortes", t: "Paralyse et blesse tous les ennemis." });
  U("Lady Dimitrescu", 5, "col", ["hor"], { k: "aoeS", p: 1.2, r: 1, ls: .4, pas: "ramp", n: "Griffes", t: "Lacère autour d'elle et se soigne. Passif : plus elle perd de PV, plus elle frappe fort." });
  U("Vecna", 5, "mag", ["hor"], { k: "far", p: 2.8, stun: 2, n: "Malédiction de Vecna", t: "Soulève l'ennemi le plus éloigné : énormes dégâts et étourdissement." });
  U("Fantômes de Pac-Man", 1, "ass", ["jv"], { k: "multi", cnt: 2, rndT: 1, p: .6, n: "Blinky, Pinky, Inky, Clyde", t: "Touchent 2 ennemis au hasard." });
  U("Goomba", 1, "bag", ["jv"], { k: "strike", p: 1, n: "Coup de tête", t: "Fonce sur sa cible." });
  U("Molly", 1, "sou", ["jv"], { k: "heal", who: "low", p: .5, sh: .8, n: "Ravitaillement", t: "Soigne un peu et protège l'allié le plus blessé." });
  U("Tom Nook", 1, "str", ["jv"], { k: "strike", p: .9, pas: "goldkill", n: "Prêt immobilier", t: "Frappe sa cible. Passif : 1 or par élimination (2 max par combat)." });
  U("Ada Wong", 2, "ass", ["jv"], { k: "strike", p: 1.3, untarg: 1, n: "Grappin", t: "Frappe puis s'éclipse au grappin : inciblable 1 s." });
  U("Lúcio", 2, "sou", ["jv"], { k: "buff", who: "all", s: "as", v: .2, d: 4, m: 50, n: "Amplification", t: "Toute l'équipe gagne 20 % de vitesse d'attaque pendant 4 s." });
  U("Spyro", 2, "mag", ["jv"], { k: "line", p: 1.3, n: "Souffle de feu", t: "Des flammes traversent toute une ligne." });
  U("Bastion", 3, "tir", ["jv"], { k: "buff", who: "self", s: "as", v: .8, d: 5, n: "Mode tourelle", t: "Se déploie : +80 % de vitesse d'attaque pendant 5 s." });
  U("Shadow", 3, "ass", ["jv"], { k: "strike", p: 1.4, tp: "low", stun: 1, n: "Chaos Control", t: "Se téléporte sur l'ennemi le plus faible et l'étourdit." });
  U("Arthur Morgan", 4, "tir", ["jv"], { k: "multi", cnt: 3, p: .2, phys: 1, n: "Sang-froid", t: "Le temps ralentit : 3 tirs critiques sur 3 cibles." });
  U("Caesar King", 4, "col", ["jv"], { k: "taunt", r: 2, d: 3, v: 25, m: 75, n: "Bouclier", t: "Provoque les ennemis proches et donne de l'armure à toute l'équipe." });
  U("Dracaufeu", 5, "mag", ["jv"], { k: "aoeT", p: 1.2, r: 2, dot: 1.5, d: 4, n: "Déflagration", t: "Embrase une large zone, qui brûle pendant 4 s." });
  U("Reinhardt", 5, "col", ["jv"], { k: "aoeS", p: 1.1, r: 2, stun: 1.8, n: "Choc sismique", t: "Frappe le sol : étourdit tous les ennemis dans une large zone." });
  U("Jim Halpert", 1, "sou", ["series"], { k: "heal", who: "near", p: .6, n: "Regard caméra", t: "Soigne les alliés proches." });
  U("Bébé Sinclair", 1, "bag", ["series"], { k: "strike", p: 1, stun: .8, n: "Pas la maman !", t: "Un coup de poêle qui étourdit." });
  U("Daryl Dixon", 1, "tir", ["series"], { k: "strike", p: .5, phys: 1, n: "Arbalète", t: "Un carreau critique garanti." });
  U("Kermit la grenouille", 2, "sou", ["series"], { k: "buff", who: "all", s: "as", v: .2, d: 4, m: 50, n: "Muppet Show", t: "Toute l'équipe gagne 20 % de vitesse d'attaque pendant 4 s." });
  U("Omar Little", 2, "ass", ["series"], { k: "strike", p: 1.2, pas: "goldkill", n: "Omar arrive !", t: "Un coup de fusil. Passif : 1 or par élimination (2 max par combat)." });
  U("Tokyo", 2, "tir", ["series"], { k: "multi", cnt: 2, p: .1, phys: 1, n: "Braquage", t: "Tire sur deux cibles à la fois." });
  U("Jon Snow", 3, "bag", ["series"], { k: "aoeS", p: .7, r: 1, pas: "revive", n: "Grand-Griffe", t: "Tranche autour de lui. Passif : revient une fois d'entre les morts." });
  U("Mercredi Addams", 3, "mag", ["series"], { k: "strike", p: 1.8, vuln: .25, d: 6, n: "La Chose", t: "Blesse sa cible, qui subit ensuite 25 % de dégâts en plus." });
  U("Gus Fring", 3, "str", ["series"], { k: "strike", p: .8, dot: 1.4, d: 4, m: 60, n: "Poison", t: "Empoisonne sa cible pendant 4 s." });
  U("Thomas Shelby", 4, "str", ["series"], { k: "buff", who: "all", s: "amp", v: .25, d: 6, m: 50, n: "Par ordre des Peaky Blinders", t: "Toute l'équipe inflige 25 % de dégâts en plus pendant 6 s." });
  U("Gregor Clegane", 4, "col", ["series"], { k: "strike", p: 1.5, stun: 1.5, n: "La Montagne", t: "Écrase sa cible : gros dégâts et étourdissement." });
  U("Grogu", 5, "sou", ["series"], { k: "heal", who: "all", p: .8, sh: .5, m: 80, n: "La Force", t: "Soigne et protège toute l'équipe." });
  U("TARDIS", 5, "str", ["series"], { k: "tardis", m: 60, n: "Le Docteur", t: "Ne bouge pas et n'attaque pas : envoie un Docteur se battre. ★ le Premier ou le Neuvième, ★★ le Dixième ou le Onzième, ★★★ le Douzième. Si son Docteur est encore en vie, il le régénère." });
  U("Jiminy Cricket", 1, "sou", ["disney"], { k: "mana", r: 2, v: 25, m: 50, n: "Conscience", t: "Donne 25 mana aux alliés proches." });
  U("Le Petit Grille-pain courageux", 1, "col", ["disney"], { k: "aoeS", p: .6, r: 1, n: "Toasts brûlants", t: "Projette des toasts sur les ennemis adjacents." });
  U("Judy Hopps", 1, "tir", ["disney"], { k: "strike", p: .6, stun: .5, n: "Fléchette", t: "Une fléchette tranquillisante étourdit sa cible." });
  U("Winnie l'ourson", 2, "col", ["disney"], { k: "heal", who: "self", p: 1.2, selfArmor: 12, n: "Pot de miel", t: "Mange du miel : se soigne et gagne de l'armure." });
  U("Jasmine", 2, "str", ["disney"], { k: "summon", cnt: [1, 1, 1], hp: 520, ad: 60, m: 70, sn: "Rajah", art: "Rajah", n: "Rajah", t: "Appelle son tigre Rajah." });
  U("Stitch", 3, "ass", ["disney"], { k: "aoeS", p: 1, r: 1, n: "Expérience 626", t: "Se déchaîne sur tous les ennemis adjacents." });
  U("Sulli", 3, "col", ["disney"], { k: "aoeS", p: 1.1, r: 1, stun: 1.2, n: "Rugissement", t: "Terrifie et étourdit les ennemis adjacents." });
  U("Baymax", 3, "sou", ["disney"], { k: "heal", who: "low", p: 1.4, sh: .6, n: "Assistant de santé", t: "Soigne fortement et protège l'allié le plus blessé." });
  U("Mickey Mouse", 4, "str", ["disney"], { k: "summon", cnt: [2, 2, 3], hp: 450, ad: 45, m: 70, sn: "Balai enchanté", art: "Balai", n: "L'Apprenti sorcier", t: "Anime des balais qui se battent pour lui." });
  U("Merlin", 4, "mag", ["disney"], { k: "aoeT", p: 1.4, r: 2, slow: .3, d: 4, n: "Higitus Figitus", t: "Un sort de zone qui blesse et ralentit les attaques de 30 %." });
  U("Mufasa", 4, "bag", ["disney"], { k: "aoeS", p: 1, r: 2, stun: 1, n: "Rugissement du roi", t: "Étourdit et blesse dans une large zone." });
  U("Empereur Zurg", 5, "tir", ["disney"], { k: "line", p: 1.25, n: "Canon ionique", t: "Un rayon qui traverse toute une ligne." });
  U("La Bête", 5, "col", ["disney"], { k: "strike", p: 1.4, stun: 1, pas: "enrage", n: "Fureur", t: "Un coup de griffe qui étourdit. Passif : dès qu'elle est blessée, elle s'enrage." });
  U("Ulysse", 1, "str", ["mytho"], { k: "buff", who: "near", s: "ad", v: .25, d: 5, m: 50, n: "Ruse", t: "Les alliés proches gagnent 25 % de dégâts d'attaque pendant 5 s." });
  U("Cerbère", 1, "bag", ["mytho"], { k: "multi", cnt: 3, p: .4, n: "Trois gueules", t: "Mord 3 ennemis à la fois." });
  U("Circé", 2, "mag", ["mytho"], { k: "strike", p: 1.2, stun: 1.5, n: "Métamorphose", t: "Change sa cible en cochon : étourdie 1,5 s." });
  U("Héphaïstos", 2, "sou", ["mytho"], { k: "buff", who: "all", s: "armor", v: 25, d: 6, m: 60, n: "Forge divine", t: "Toute l'équipe gagne 25 d'armure et de résistance pendant 6 s." });
  U("Erlik", 2, "tir", ["mytho"], { k: "strike", p: .5, dot: .5, d: 3, n: "Flèche des enfers", t: "Une flèche maudite qui brûle pendant 3 s." });
  U("Artémis", 3, "tir", ["mytho"], { k: "far", p: 1.1, n: "Flèche d'argent", t: "Un tir chargé sur l'ennemi le plus éloigné." });
  U("Méduse", 3, "mag", ["mytho"], { k: "line", p: 1.2, stun: 1.2, n: "Regard pétrifiant", t: "Pétrifie tous les ennemis sur une ligne." });
  U("Atlas", 3, "col", ["mytho"], { k: "taunt", r: 2, d: 3, v: 25, m: 75, n: "Porter le ciel", t: "Provoque les ennemis proches et donne de l'armure à toute l'équipe." });
  U("Mars", 4, "bag", ["mytho"], { k: "aoeS", p: .9, r: 1, ls: .25, n: "Fureur guerrière", t: "Frappe tout autour de lui et se soigne." });
  U("Neptune", 4, "mag", ["mytho"], { k: "aoeT", p: 1.3, r: 2, stun: 1, n: "Raz-de-marée", t: "Une vague frappe et étourdit une large zone." });
  U("Achille", 4, "col", ["mytho"], { k: "dodge", d: 2.5, v: .5, n: "Invulnérable", t: "Esquive toutes les attaques pendant 2,5 s, puis frappe plus fort." });
  U("Susanoo", 5, "ass", ["mytho"], { k: "strike", p: 1.5, tp: "low", reset: 1, n: "Kusanagi", t: "Fond sur l'ennemi le plus faible. S'il l'élimine, il relance son sort aussitôt." });
  U("Cronos", 5, "str", ["mytho"], { k: "stunall", p: 1, stun: [1.5, 2, 3.5], m: 70, n: "Arrêt du temps", t: "Fige et blesse tous les ennemis." });
  // --- Set 4 : 5 univers de 13 unités ---
  CURSET = 4;
  U("Benjy", 1, "ass", ["wc"], { k: "strike", p: 1.2, stun: .8, n: "Coup en douce", t: "Frappe sa cible par surprise et l'étourdit." });
  U("hcn910", 1, "col", ["wc"], { k: "heal", who: "self", p: .6, selfArmor: 8, n: "De type Acier", t: "Se blinde : récupère des PV et gagne de l'armure." });
  U("Mac JB", 1, "bag", ["wc"], { k: "multi", cnt: 2, p: .55, n: "Une-deux", t: "Enchaîne deux ennemis proches." });
  U("barb", 2, "mag", ["wc"], { k: "line", p: 1.3, n: "Barbelés", t: "Une ligne de barbelés traverse le plateau." });
  U("et01le", 2, "sou", ["wc"], { k: "buff", who: "all", s: "as", v: .2, d: 4, m: 50, n: "Étoile filante", t: "Toute l'équipe gagne 20 % de vitesse d'attaque pendant 4 s." });
  U("kalibunny", 2, "sou", ["wc"], { k: "heal", who: "near", p: .9, n: "Câlin de lapin", t: "Soigne les alliés proches." });
  U("aymeric6103", 3, "tir", ["wc"], { k: "buff", who: "self", s: "as", v: .8, d: 5, n: "Oui Bon !", t: "S'énerve : +80 % de vitesse d'attaque pendant 5 s." });
  U("fr0mnowhere", 3, "tir", ["wc"], { k: "far", p: 1.1, n: "Sortie de nulle part", t: "Un tir surgi de nulle part sur l'ennemi le plus éloigné." });
  U("Mistiroro", 3, "sou", ["wc"], { k: "heal", who: "low", p: 1.4, sh: .6, n: "Brume", t: "Soigne fortement et protège l'allié le plus blessé." });
  U("alyssaltaïrr", 4, "mag", ["wc"], { k: "aoeS", p: 1.3, r: 2, stun: 1.5, n: "Slayyyyy", t: "Rayonne : blesse et étourdit tous les ennemis dans une large zone." });
  U("Vivian", 4, "bag", ["wc"], { k: "aoeS", p: .9, r: 1, ls: .25, n: "Coup de boule", t: "Frappe tout autour de lui et se soigne." });
  U("Cyril", 5, "col", ["wc"], { k: "aoeS", p: 1, r: 2, stun: 1.2, mb: 40, n: "Feur !", t: "« Quoi ? — Feur ! » Les ennemis autour sont sonnés, blessés et perdent 40 mana." });
  U("Claude", 5, "str", ["wc"], { k: "buff", who: "all", s: "amp", v: .3, d: 6, m: 60, n: "Mise à jour", t: "Déploie un correctif : toute l'équipe inflige 30 % de dégâts en plus pendant 6 s." });
  U("Lorenzo", 1, "tir", ["chant"], { k: "strike", p: .5, phys: 1, n: "Coup de bob", t: "Un tir critique garanti." });
  U("Naïka", 1, "sou", ["chant"], { k: "mana", r: 2, v: 25, m: 50, n: "Sauce", t: "Donne 25 mana aux alliés proches." });
  U("Rick Ross", 1, "col", ["chant"], { k: "aoeS", p: .6, r: 1, n: "The Boss", t: "Un grognement qui blesse les ennemis adjacents." });
  U("Angèle", 2, "sou", ["chant"], { k: "heal", who: "low", p: 1, sh: .5, n: "Balance ton quoi", t: "Soigne et protège l'allié le plus blessé." });
  U("XXXTentacion", 2, "ass", ["chant"], { k: "strike", p: 1.3, untarg: 1, n: "Look at Me!", t: "Frappe puis s'éclipse : inciblable 1 s." });
  U("Kendrick Lamar", 2, "str", ["chant"], { k: "strike", p: .9, weaken: .3, d: 5, m: 60, n: "HUMBLE.", t: "Rend sa cible humble : elle inflige 30 % de dégâts en moins pendant 5 s." });
  U("Dua Lipa", 3, "tir", ["chant"], { k: "multi", cnt: 3, p: .15, phys: 1, n: "Levitating", t: "Trois tirs critiques sur 3 cibles." });
  U("Bad Bunny", 3, "bag", ["chant"], { k: "strike", p: 1.4, stun: 1.2, n: "Conejo Malo", t: "Un gros coup qui étourdit sa cible." });
  U("Céline Dion", 3, "mag", ["chant"], { k: "aoeT", p: .9, r: 1, stun: 1, n: "Note tenue", t: "Une note si puissante qu'elle blesse et étourdit sa cible et ses voisins." });
  U("Shakira", 4, "bag", ["chant"], { k: "aoeS", p: 1, r: 2, stun: 1, n: "Hips Don't Lie", t: "Un déhanché qui blesse et étourdit dans une large zone." });
  U("Ariana Grande", 4, "mag", ["chant"], { k: "line", p: 1.5, stun: 1, n: "Note sifflée", t: "Une note suraiguë traverse toute une ligne : dégâts et étourdissement." });
  U("Michael Jackson", 5, "ass", ["chant"], { k: "strike", p: 1.7, tp: "low", untarg: 1.5, n: "Moonwalk", t: "Glisse jusqu'à l'ennemi le plus faible, le frappe, puis s'éloigne en moonwalk : inciblable 1,5 s." });
  U("Paul McCartney", 5, "str", ["chant"], { k: "heal", who: "all", p: .8, sh: .5, m: 80, n: "Hey Jude", t: "Tout le monde chante : soigne et protège toute l'équipe." });
  U("Krobus", 1, "mag", ["jv"], { k: "strike", p: 1.3, n: "Œuf du néant", t: "Lance un œuf du néant sur sa cible." });
  U("Thibou", 1, "str", ["jv"], { k: "buff", who: "near", s: "ad", v: .25, d: 5, m: 50, n: "Leçon du musée", t: "Les alliés proches gagnent 25 % de dégâts d'attaque pendant 5 s." });
  U("Chikipi", 1, "bag", ["jv"], { k: "strike", p: 1, n: "Coup de bec", t: "Fonce sur sa cible." });
  U("Frisk", 2, "sou", ["jv"], { k: "heal", who: "low", p: .9, pas: "revive", n: "Détermination", t: "Soigne l'allié le plus blessé. Passif : revient une fois d'entre les morts." });
  U("Luigi", 2, "tir", ["jv"], { k: "far", p: .7, pull: 1, n: "Ectoblast", t: "Aspire l'ennemi le plus éloigné jusqu'à lui." });
  U("Chomp", 2, "col", ["jv"], { k: "strike", p: 1.2, stun: 1, n: "Morsure", t: "Tire sur sa chaîne et mord : dégâts et étourdissement." });
  U("Lae'zel", 3, "bag", ["jv"], { k: "buff", who: "self", s: "as", v: .7, d: 5, n: "Fougue", t: "Tchk ! +70 % de vitesse d'attaque pendant 5 s." });
  U("Bonnie", 3, "mag", ["jv"], { k: "aoeT", p: .9, r: 1, stun: 1, n: "Jumpscare", t: "Surgit du noir : blesse et étourdit sa cible et ses voisins." });
  U("Cloth", 3, "col", ["jv"], { k: "aoeS", p: 1.1, r: 1, stun: 1.2, n: "Massue", t: "Un coup de massue qui étourdit les ennemis adjacents." });
  U("Genji", 4, "ass", ["jv"], { k: "strike", p: 1.5, tp: "low", reset: 1, n: "Lame du dragon", t: "Fond sur l'ennemi le plus faible. S'il l'élimine, il relance son sort aussitôt." });
  U("Steve", 4, "str", ["jv"], { k: "boom", p: 1.5, r: 2, sh: .8, n: "TNT", t: "Se protège 3 s derrière ses blocs, puis sa TNT explose dans une large zone." });
  U("Geralt de Riv", 5, "ass", ["jv"], { k: "aoeS", p: 1.2, r: 1, ls: .4, n: "Tourbillon", t: "Tournoie avec ses deux épées et se soigne des dégâts infligés." });
  U("L'Empereur", 5, "col", ["jv"], { k: "aoeT", p: .9, r: 2, stun: 2, n: "Décharge psionique", t: "Une onde mentale blesse et étourdit une large zone." });
  U("Marco Polo", 1, "sou", ["hist"], { k: "heal", who: "near", p: .6, n: "Route de la soie", t: "Soigne les alliés proches." });
  U("Leif Erikson", 1, "bag", ["hist"], { k: "strike", p: 1, stun: .8, n: "Vinland", t: "Un coup de hache qui étourdit." });
  U("Jeffrey Dahmer", 1, "ass", ["hist"], { k: "strike", p: 1.2, tp: "low", n: "Prédateur", t: "Surgit sur l'ennemi le plus faible." });
  U("Alfred Nobel", 2, "tir", ["hist"], { k: "aoeT", p: .75, r: 1, n: "Dynamite", t: "Un bâton de dynamite explose sur sa cible et ses voisins." });
  U("Erik le Rouge", 2, "col", ["hist"], { k: "aoeS", p: .8, r: 1, n: "Hache viking", t: "Tranche tous les ennemis adjacents." });
  U("Alan Turing", 2, "sou", ["hist"], { k: "strike", p: .8, vuln: .2, d: 6, m: 60, n: "Enigma", t: "Déchiffre sa cible : elle subit 20 % de dégâts en plus pendant 6 s." });
  U("Karl Marx", 3, "str", ["hist"], { k: "buff", who: "all", s: "amp", v: .2, d: 6, m: 50, n: "Lutte des classes", t: "Toute l'équipe inflige 20 % de dégâts en plus pendant 6 s." });
  U("Christophe Colomb", 3, "bag", ["hist"], { k: "strike", p: 1.4, stun: 1, n: "Terre en vue !", t: "Débarque sur sa cible : dégâts et étourdissement." });
  U("Barbe Noire", 3, "ass", ["hist"], { k: "strike", p: 1.4, tp: "low", pas: "goldkill", n: "Abordage", t: "Aborde l'ennemi le plus faible. Passif : 1 or par élimination (2 max par combat)." });
  U("Marie Curie", 4, "mag", ["hist"], { k: "aoeT", p: .6, r: 2, dot: 1.6, d: 5, n: "Radioactivité", t: "Irradie une large zone, qui continue de subir des dégâts pendant 5 s." });
  U("Nikola Tesla", 4, "tir", ["hist"], { k: "multi", cnt: 4, p: .9, stun: .5, n: "Bobine Tesla", t: "Des arcs électriques frappent et sonnent 4 ennemis." });
  U("Albert Einstein", 5, "str", ["hist"], { k: "aoeT", p: 1.6, r: 2, m: 70, n: "E = mc²", t: "Une explosion d'énergie dévaste une large zone." });
  U("Tokugawa Ieyasu", 5, "col", ["hist"], { k: "taunt", r: 3, d: 3.5, v: 30, m: 75, n: "Shogun", t: "Provoque tous les ennemis alentour et donne de l'armure à toute l'équipe." });
  U("Rebeca Linares", 1, "ass", ["actx"], { k: "strike", p: 1.2, stun: .6, n: "Olé", t: "Frappe sa cible et l'étourdit." });
  U("Carmella Bing", 1, "sou", ["actx"], { k: "heal", who: "low", p: .5, sh: .8, n: "Réconfort", t: "Soigne un peu et protège l'allié le plus blessé." });
  U("Céline Tran", 1, "tir", ["actx"], { k: "strike", p: .5, phys: 1, n: "Arts martiaux", t: "Un coup critique garanti." });
  U("Eimi Fukada", 2, "mag", ["actx"], { k: "strike", p: 1.2, stun: 1.5, n: "Kawaii", t: "Sa cible reste bouche bée : étourdie 1,5 s." });
  U("Autumn Falls", 2, "tir", ["actx"], { k: "multi", cnt: 2, p: .1, phys: 1, n: "Feuilles d'automne", t: "Tire sur deux cibles à la fois." });
  U("Liza Del Sierra", 2, "str", ["actx"], { k: "buff", who: "near", s: "ad", v: .3, d: 5, m: 50, n: "Coaching", t: "Les alliés proches gagnent 30 % de dégâts d'attaque pendant 5 s." });
  U("Madison Ivy", 3, "str", ["actx"], { k: "multi", cnt: 2, p: .7, stun: 1.2, m: 70, n: "Clin d'œil", t: "Un clin d'œil étourdit et blesse 2 ennemis." });
  U("Ava Addams", 3, "col", ["actx"], { k: "taunt", r: 2, d: 3, v: 25, m: 75, n: "Diva", t: "Attire l'attention des ennemis proches et donne de l'armure à toute l'équipe." });
  U("Hitomi Tanaka", 3, "bag", ["actx"], { k: "aoeS", p: .8, r: 1, ls: .25, n: "Entrée en scène", t: "Frappe tout autour d'elle et se soigne." });
  U("Lana Rhoades", 4, "mag", ["actx"], { k: "far", p: 2.2, stun: 1.5, n: "Coup de foudre", t: "L'ennemi le plus éloigné est foudroyé : gros dégâts et étourdissement." });
  U("Mia Khalifa", 4, "ass", ["actx"], { k: "strike", p: 1.6, tp: "low", stun: 1, n: "Buzz", t: "Surgit sur l'ennemi le plus faible : dégâts et étourdissement." });
  U("Angela White", 5, "col", ["actx"], { k: "aoeS", p: 1.1, r: 2, stun: 1.8, n: "Présence", t: "Impose sa présence : étourdit tous les ennemis dans une large zone." });
  U("Riley Reid", 5, "str", ["actx"], { k: "buff", who: "all", s: "as", v: .35, d: 6, m: 60, n: "Tête d'affiche", t: "Toute l'équipe gagne 35 % de vitesse d'attaque pendant 6 s." });
  // les Docteurs envoyés par le TARDIS : [PV, dégâts, vitesse, portée, sort]
  const DOCS = {
    "Premier Docteur": [700, 40, .65, 3, { k: "heal", who: "low", p: 1, n: "Sagesse" }],
    "Neuvième Docteur": [850, 60, .75, 1, { k: "aoeS", p: .9, r: 1, n: "Fantastique !" }],
    "Dixième Docteur": [1200, 75, .8, 3, { k: "far", p: 1.4, stun: 2, n: "Allons-y !" }],
    "Onzième Docteur": [1200, 70, .8, 3, { k: "buff", who: "all", s: "as", v: .3, d: 5, n: "Geronimo !" }],
    "Douzième Docteur": [2000, 110, .85, 3, { k: "stunall", p: .9, stun: [1.5, 1.5, 1.5], n: "Guitare sonique" }],
  };
  const DOCT = [["Premier Docteur", "Neuvième Docteur"], ["Dixième Docteur", "Onzième Docteur"], ["Douzième Docteur"]];
  const SETN = { 1: "Set 1", 2: "Set 2", 3: "Set 3", 4: "Set 4", mix: "Sets 1 et 2 mélangés" };
  let SET = SETS[1];
  // monstres neutres : [nom, PV, dégâts, vitesse]
  const MON = { Dodo: [170, 14, .6], Capybara: [230, 18, .6], Loup: [300, 26, .8], Oie: [520, 48, .9], Sanglier: [900, 70, .7], "Ours brun": [1500, 95, .65] };
  const PVE = [[["Dodo", 2]], [["Capybara", 3]], [["Loup", 3]]];
  // boss : t = palier (1 facile, 2 moyen, 3 final). Un facile, deux moyens et un final sont tirés au sort à chaque partie.
  const BOSS = {
    "Obélix": { t: 1, hp: 4800, ad: 120, as: .7, ar: 40, adds: [["Sanglier", 2]], s: { k: "aoeS", p: 1.1, r: 1, stun: 1, pas: "ramp", n: "Baffe" }, d: "Ses baffes étourdissent tout ce qui l'entoure, et plus il est blessé, plus il frappe fort. Deux sangliers l'accompagnent." },
    "Bigfoot": { t: 1, hp: 5600, ad: 110, as: .65, ar: 45, adds: [["Ours brun", 1]], s: { k: "aoeT", p: 1, r: 1, stun: 1.5, n: "Piétinement" }, d: "Piétine une zone et étourdit. Un ours brun le suit." },
    "Bête du Gévaudan": { t: 1, hp: 4200, ad: 125, as: .9, ar: 30, ex: { ls: .2 }, adds: [["Loup", 3]], s: { k: "strike", p: 1.4, tp: "low", n: "Embuscade" }, d: "Bondit sur ton unité la plus faible et se soigne en mordant. Trois loups chassent avec elle." },
    "Wendigo": { t: 1, hp: 5600, ad: 120, as: .75, ar: 35, s: { k: "stunall", p: .5, stun: [1, 1, 1], pas: "enrage", n: "Hurlement" }, d: "Son hurlement étourdit toute ton équipe. Dès qu'il est blessé, il s'enrage." },
    "Monstre du loch Ness": { t: 2, hp: 8800, ad: 135, as: .7, ar: 55, ex: { regen: .008 }, s: { k: "aoeT", p: 1.2, r: 2, stun: 1, untarg: 1.5, n: "Raz-de-marée" }, d: "Un raz-de-marée frappe une large zone, puis il plonge et devient inciblable. Il se régénère en continu." },
    "Hollandais volant": { t: 2, hp: 12500, ad: 150, as: .7, ar: 45, rg: 4, s: { k: "summon", cnt: [3, 3, 3], hp: 800, ad: 60, sn: "Matelot maudit", art: "Davy Jones", n: "Équipage maudit" }, d: "Tire de loin et appelle sans cesse des matelots maudits. Tue-le vite." },
    "Kurama": { t: 2, hp: 11500, ad: 150, as: .75, ar: 50, s: { k: "line", p: 1.8, pas: "ramp", n: "Bijūdama" }, d: "Son orbe traverse toute une ligne : ne mets pas tes unités en file. Plus il est blessé, plus il frappe fort." },
    "Ketheric Thorm": { t: 2, hp: 7200, ad: 130, as: .7, ar: 60, s: { k: "multi", cnt: 3, p: 1.1, drain: 1, pas: "revive", n: "Drain nécrotique" }, d: "Draine la vie de trois unités à la fois et se relève une fois après sa mort." },
    "Flowey": { t: 2, hp: 9500, ad: 130, as: .9, ar: 40, rg: 4, ex: { dodge: .2 }, s: { k: "multi", cnt: 5, rndT: 1, p: .8, n: "Pétales" }, d: "Mitraille cinq unités au hasard et esquive une attaque sur cinq." },
    "Ender Dragon": { t: 3, hp: 17000, ad: 180, as: .75, ar: 60, rg: 2, ex: { regen: .01 }, s: { k: "line", p: 1.4, dot: 2, d: 4, n: "Souffle du dragon" }, d: "Son souffle traverse une ligne et brûle pendant 4 s. Ses cristaux le soignent en continu : il faut beaucoup de dégâts." },
    "Fatalis": { t: 3, hp: 15000, ad: 170, as: .7, ar: 70, s: { k: "stunall", p: 1.1, stun: [.8, .8, .8], n: "Brasier" }, d: "Embrase tout le plateau : toute ton équipe est blessée et étourdie. Les soins et les boucliers d'équipe sont précieux." },
    "Seigneur de la Lune": { t: 3, hp: 21000, ad: 185, as: .75, ar: 55, rg: 4, s: { k: "summon", cnt: [2, 2, 2], hp: 2300, ad: 110, sn: "Œil véritable", art: "Œil véritable de Cthulhu", n: "Yeux véritables" }, d: "Frappe de loin et invoque des yeux véritables très résistants." },
    "SCP-682": { t: 3, hp: 16000, ad: 180, as: .8, ar: 65, ex: { regen: .015 }, s: { k: "strike", p: 1.8, pas: "revive", n: "Adaptation" }, d: "Indestructible : il se régénère très vite et se relève une fois. Les brûlures et l'anti-soin aident énormément." },
  };
  // objets : 8 composants, 36 fusions
  const COMP = {
    hache: { n: "Hache", ic: "🪓", st: { ad: .15 }, d: "+15 % de dégâts d'attaque" },
    briquet: { n: "Briquet", ic: "🔥", st: { as: .12 }, d: "+12 % de vitesse d'attaque" },
    usb: { n: "Clé USB", ic: "💾", st: { sp: .2 }, d: "+20 % de puissance des sorts" },
    airpods: { n: "AirPods", ic: "🎧", st: { mana: 15 }, d: "commence avec 15 mana" },
    savon: { n: "Savon", ic: "🧼", st: { ar: 25 }, d: "+25 d'armure" },
    scotch: { n: "Scotch", ic: "🩹", st: { mr: 25 }, d: "+25 de résistance magique" },
    pain: { n: "Pain au chocolat", ic: "🥐", st: { hp: 180 }, d: "+180 PV" },
    de: { n: "Dé", ic: "🎲", st: { crit: .15 }, d: "+15 % de chance de critique" },
  };
  const CK = Object.keys(COMP), ITEM = {}, FUS = {};
  CK.forEach(k => ITEM[k] = Object.assign({ id: k }, COMP[k]));
  const F = (a, b, id, n, ic, t, tip) => { ITEM[id] = { id, n, ic, mk: [a, b], t, tip, st: {} }; [a, b].forEach(c => Object.keys(COMP[c].st).forEach(k => ITEM[id].st[k] = (ITEM[id].st[k] || 0) + COMP[c].st[k])); FUS[[a, b].sort().join("+")] = id; };
  F("hache", "hache", "opinel", "Opinel", "🔪", "Ses attaques ignorent 30 % de l'armure.", "Assassins et Bagarreurs, contre les Colosses.");
  F("hache", "briquet", "spinner", "Hand spinner", "🌀", "Chaque attaque donne +4 % de vitesse d'attaque (15 fois max).", "Tireurs : plus le combat dure, plus ils mitraillent.");
  F("hache", "usb", "tournevis", "Tournevis", "🪛", "Se soigne de 15 % de tous les dégâts qu'il inflige.", "Bagarreurs et Mages qui tapent en zone.");
  F("hache", "airpods", "pelle", "Pelle", "⛏️", "Chaque attaque rend 6 mana de plus.", "Unités qui attaquent vite et dont le sort est décisif.");
  F("hache", "savon", "poele", "Poêle", "🍳", "25 % des dégâts d'attaque touchent aussi les ennemis voisins de la cible.", "Unités de mêlée en première ligne.");
  F("hache", "scotch", "fourchette", "Fourchette", "🍴", "Ses coups réduisent de moitié les soins reçus par la cible pendant 4 s.", "Indispensable contre les équipes qui se soignent et les boss qui se régénèrent.");
  F("hache", "pain", "marteau", "Marteau", "🔨", "Chaque attaque inflige en plus 2 % de ses propres PV max.", "Colosses : ils deviennent enfin dangereux.");
  F("hache", "de", "ciseaux", "Ciseaux", "✂️", "+35 % de dégâts critiques.", "Assassins, surtout avec la synergie Assassin.");
  F("briquet", "briquet", "ventilo", "Ventilateur", "🌬️", "+1 case de portée.", "Tireurs et Mages : ils restent hors de danger.");
  F("briquet", "usb", "allumette", "Allumette", "🧨", "Ses attaques et ses sorts brûlent la cible : 2 % de ses PV max par seconde pendant 4 s.", "Sorts de zone, et contre les boss.");
  F("briquet", "airpods", "chargeur", "Chargeur", "🔌", "Chaque sort lancé donne +20 % de vitesse d'attaque (5 fois max).", "Unités dont le sort coûte peu de mana.");
  F("briquet", "savon", "extincteur", "Extincteur", "🧯", "Les ennemis adjacents attaquent 25 % moins vite.", "Colosses au milieu de la mêlée.");
  F("briquet", "scotch", "elastique", "Élastique", "🪀", "+20 % d'esquive.", "N'importe quelle unité de première ligne.");
  F("briquet", "pain", "gourde", "Gourde", "🧃", "Régénère 2 % de ses PV max chaque seconde.", "Colosses avec beaucoup de PV.");
  F("briquet", "de", "lancepierre", "Lance-pierre", "🪃", "25 % de chance d'attaquer deux fois d'un coup.", "Tireurs et Assassins.");
  F("usb", "usb", "calculatrice", "Calculatrice", "🧮", "+35 % de puissance des sorts en plus (75 % au total).", "Ton meilleur Mage.");
  F("usb", "airpods", "telecommande", "Télécommande", "📺", "Après chaque sort, récupère aussitôt 20 mana.", "Mages et Soutiens : ils enchaînent leurs sorts.");
  F("usb", "savon", "parapluie", "Parapluie", "☂️", "Commence le combat avec un bouclier égal à 25 % de ses PV max.", "Unités fragiles visées par les Assassins.");
  F("usb", "scotch", "tippex", "Tipp-Ex", "🧴", "Efface les étourdissements : il ne peut pas être étourdi.", "Ton porteur principal, contre Gojo, Kane, Fatalis ou le Wendigo.");
  F("usb", "pain", "banane", "Banane", "🍌", "Toutes les 4 s, soigne l'allié le plus blessé.", "Soutiens, ou un Colosse qui reste longtemps en vie.");
  F("usb", "de", "loupe", "Loupe", "🔍", "Ses sorts peuvent faire des coups critiques.", "Mages et Assassins à gros sort.");
  F("airpods", "airpods", "enceinte", "Enceinte Bluetooth", "🔊", "Au début du combat, les alliés adjacents gagnent 15 mana.", "Place le porteur au milieu de tes lanceurs de sorts.");
  F("airpods", "savon", "bouillotte", "Bouillotte", "♨️", "Gagne 5 mana de plus à chaque coup reçu.", "Colosses à sort de contrôle (Kane, Mario, de Gaulle).");
  F("airpods", "scotch", "bouchons", "Bouchons d'oreille", "🦻", "Subit 30 % de dégâts magiques en moins.", "Contre les équipes de Mages.");
  F("airpods", "pain", "thermos", "Thermos", "🍵", "Se soigne de 10 % de ses PV max à chaque sort lancé.", "Colosses et Bagarreurs qui lancent souvent.");
  F("airpods", "de", "cartes", "Jeu de cartes", "🃏", "Chaque sort lancé donne +10 % de dégâts jusqu'à la fin du combat.", "Unités qui lancent beaucoup de sorts.");
  F("savon", "savon", "couvercle", "Couvercle de poubelle", "🗑️", "Bloque 15 dégâts sur chaque attaque reçue.", "Contre les unités qui frappent vite et pas fort.");
  F("savon", "scotch", "wd40", "WD-40", "🛢️", "Tout glisse sur lui : −15 % de dégâts subis.", "Ton Colosse principal.");
  F("savon", "pain", "soutif", "Soutien-gorge", "👙", "Soutient ses voisins : les alliés adjacents gagnent 20 d'armure et de résistance magique.", "Un Colosse entouré d'alliés.");
  F("savon", "de", "cactus", "Cactus", "🌵", "Renvoie 25 % des dégâts des attaques qu'il reçoit.", "Colosses, contre les Assassins et les Tireurs.");
  F("scotch", "scotch", "bulle", "Papier bulle", "🫧", "Commence le combat avec un bouclier de 300.", "Unités fragiles.");
  F("scotch", "pain", "doudou", "Doudou", "🧸", "Une fois par combat, revient à la vie avec 30 % de ses PV.", "Ton unité la plus importante.");
  F("scotch", "de", "ventouse", "Ventouse", "🪠", "Chaque attaque retire 5 d'armure et de résistance magique à la cible (8 fois max).", "Unités qui attaquent vite, contre les boss.");
  F("pain", "pain", "raclette", "Raclette", "🧀", "+300 PV en plus (660 au total).", "N'importe quel Colosse.");
  F("pain", "de", "ticket", "Ticket à gratter", "🎫", "Gagne 1 or par élimination (2 max par combat).", "Tôt dans la partie, sur l'unité qui achève les ennemis.");
  F("de", "de", "des", "Paire de dés", "🎲", "+15 % de chance de critique en plus (45 % au total).", "Assassins et Tireurs.");
  const isComp = id => !!COMP[id];
  // pose un objet sur une unité : deux composants fusionnent ; 3 objets max
  function equip(x, id) {
    x.it = x.it || [];
    if (isComp(id)) { const j = x.it.findIndex(isComp); if (j >= 0) { const f = FUS[[x.it[j], id].sort().join("+")]; x.it[j] = f; return f; } }
    if (x.it.length >= 3) return null; x.it.push(id); return id;
  }
  function giveItems(p, nc, nf) { const got = []; for (let i = 0; i < nc; i++) got.push(CK[Math.floor(G.rng() * CK.length)]); const FK = Object.keys(ITEM).filter(k => !isComp(k)); for (let i = 0; i < nf; i++) got.push(FK[Math.floor(G.rng() * FK.length)]); p.items.push(...got); return got; }
  // butin du joueur : un objet au choix parmi trois, le reste au hasard (les bots prennent tout au hasard)
  function loot(p, nc, nf) {
    if (p !== G.me || p.bot) return giveItems(p, nc, nf);
    const pick3 = L => { L = L.slice(); for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(G.rng() * (i + 1)), t = L[i]; L[i] = L[j]; L[j] = t; } return L.slice(0, 3); };
    if (nf > 0) { p.choices.push({ t: "loot", opts: pick3(Object.keys(ITEM).filter(k => !isComp(k))) }); return giveItems(p, nc, nf - 1); }
    if (nc > 0) { p.choices.push({ t: "loot", opts: pick3(CK) }); return giveItems(p, nc - 1, 0); }
    return [];
  }
  // applique un choix en attente (i = option choisie)
  function choose(p, i) { const c = p.choices.shift(); if (!c) return null; const id = c.opts[Math.max(0, Math.min(c.opts.length - 1, i || 0))]; if (c.t === "aug") takeAug(p, id); else p.items.push(id); return { t: c.t, id }; }
  function takeItems(p, x) { if (x.it && x.it.length) { p.items.push(...x.it); x.it = []; } }
  const ODDS = [[100, 0, 0, 0, 0], [100, 0, 0, 0, 0], [75, 25, 0, 0, 0], [55, 30, 15, 0, 0], [45, 33, 20, 2, 0], [30, 40, 25, 5, 0], [19, 30, 40, 10, 1], [17, 24, 32, 24, 3], [15, 18, 25, 30, 12]];
  const XPN = [2, 2, 6, 10, 20, 36, 56, 80], POOLN = [22, 20, 17, 10, 9], STAGEDMG = [0, 0, 2, 3, 5, 7, 10, 15, 20, 30];
  const BOTN = ["Kévin", "Josiane", "Gégé", "Mamie Lucette", "Dylan", "Brigitte", "Roger", "Cindy"];

  // événements : une règle spéciale pour toute la partie
  const EVENTS = {
    paie: ["💰", "Jour de paie", "Tout le monde gagne 2 or de plus à chaque manche."],
    soldes: ["🏷️", "Soldes", "Relancer la boutique ne coûte que 1 or."],
    lune: ["🌕", "Pleine lune", "Toutes les unités attaquent 25 % plus vite."],
    marche: ["🕶️", "Marché noir", "Acheter de l'XP ne coûte que 3 or."],
    subite: ["⚡", "Mort subite", "La mort subite commence après 12 s de combat au lieu de 30."],
    geants: ["🗿", "Géants", "Toutes les unités ont 50 % de PV en plus : les combats durent."],
    chats: ["🐈", "Nuit des chats", "Chaque équipe compte un Chat de plus pour la synergie Chat."],
    penurie: ["📉", "Pénurie", "Il y a deux fois moins d'exemplaires de chaque carte dans la réserve."],
    brouillard: ["🌫️", "Brouillard", "On ne voit plus l'équipe des autres joueurs et on ne peut pas regarder leurs combats."],
    toutourien: ["🎰", "Tout ou rien", "Une victoire rapporte 3 or de plus, mais une défaite fait perdre deux fois plus de PV."],
  };
  let EVT = null;   // événement de la partie en cours
  // améliorations : à trois moments de la partie, chacun en choisit une parmi trois
  const AUG = {
    muscu: ["💪", "Musculation", "Toute ton équipe inflige 12 % de dégâts en plus."],
    blindage: ["🛡️", "Blindage", "Toute ton équipe gagne 20 d'armure et de résistance magique."],
    cardio: ["🏃", "Cardio", "Toute ton équipe attaque 12 % plus vite."],
    infirmerie: ["🏥", "Infirmerie", "Toute ton équipe récupère 1 % de ses PV max chaque seconde."],
    vampire: ["🧛", "Vampirisme", "Toute ton équipe se soigne de 8 % des dégâts qu'elle inflige."],
    mana: ["🔋", "Batteries pleines", "Toute ton équipe commence chaque combat avec 20 mana."],
    tueur: ["🏹", "Chasseur de monstres", "+30 % de dégâts contre les monstres et les boss."],
    chats2: ["🐈", "Neuf vies", "Tes Chats comptent double pour la synergie Chat."],
    place: ["➕", "Place en plus", "Tu peux poser une unité de plus sur le plateau."],
    rente: ["🏦", "Rente", "Tu gagnes 1 or de plus à chaque manche."],
    tirelire: ["🐖", "Tirelire", "Tu reçois 10 or tout de suite."],
    composants: ["🧰", "Boîte à outils", "Tu reçois 2 composants tout de suite."],
    niveau: ["📚", "Révisions", "Tu reçois 8 XP tout de suite."],
  };
  const AUGR = [3, 11, 18];   // manches où l'on choisit une amélioration (2-1, 3-2, 4-2)
  const cap = p => p.lvl + ((p.aug || []).includes("place") ? 1 : 0);
  function takeAug(p, id) { p.aug = p.aug || []; if (!AUG[id] || p.aug.includes(id)) return; p.aug.push(id); if (id === "tirelire") p.gold += 10; else if (id === "composants") giveItems(p, 2, 0); else if (id === "niveau") addXp(p, 8); }
  const augOpts = (p, R) => { const L = Object.keys(AUG).filter(k => !(p.aug || []).includes(k)); for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = L[i]; L[i] = L[j]; L[j] = t; } return L.slice(0, 3); };

  /* ---------- outils ---------- */
  const rng32 = a => { const f = () => { let x = f.a | 0; x = x + 0x6D2B79F5 | 0; f.a = x; let t = Math.imul(x ^ x >>> 15, 1 | x); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; f.a = a | 0; return f; };
  const NB = [[[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]], [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]]];
  const ROWS = 8, COLS = 7;
  const hd = (r1, c1, r2, c2) => { const x1 = c1 - (r1 - (r1 & 1)) / 2, x2 = c2 - (r2 - (r2 & 1)) / 2, dx = x1 - x2, dz = r1 - r2; return Math.max(Math.abs(dx), Math.abs(dz), Math.abs(dx + dz)); };
  const dist = (a, b) => hd(a.R, a.C, b.R, b.C);
  function traitsOf(list, aug) { const seen = new Set(), n = {}; list.forEach(x => { if (seen.has(x.n) || !UN[x.n]) return; seen.add(x.n); const d = UN[x.n]; [...d.o, d.cl].forEach(k => n[k] = (n[k] || 0) + 1); }); if (aug && aug.includes("chats2") && n.chat) n.chat *= 2; if (EVT === "chats" && list.length) n.chat = (n.chat || 0) + 1; return n; }
  const TR3 = { hor: { t: [3, 5, 7, 9], v: [[12], [25], [40], [60]] }, jv: { t: [3, 5, 7, 9], v: [[8], [16], [26], [40]] } };
  let CURT = 0;   // 3 pendant une partie du set 3 (13 unités par univers : paliers 3 / 5 / 7 / 9)
  const TRof = k => CURT && TR3[k] ? Object.assign({}, TR[k], TR3[k]) : TR[k];
  const tier = (k, n) => { let i = -1; TRof(k).t.forEach((t, j) => { if (n >= t) i = j; }); return i; };

  /* ---------- simulation de combat ---------- */
  const DT = .1;
  function mkUnit(S, side, x) {
    const u = { uid: S.units.length, side, n: x.n, star: x.star || 1, alive: true, buffs: [], dots: [], shield: 0, stunT: 0, untargT: 0, dodgeT: 0, atkCd: .4 + S.rng() * .4, moveCd: 0, mana: 0, kills: 0,
      ref: x.ref || null, dealt: 0, taken: 0, healed: 0, critC: .25, critD: 1.4, dodge: 0, ls: 0, amp: 1, red: 0, sp: 1, manaAtk: 0, regen: 0, vuln: 0, vulnT: 0 };
    if (x.raw) Object.assign(u, { cost: x.raw.cost || 1, cl: "bag", o: [], maxhp: x.raw.hp, ad: x.raw.ad, as: x.raw.as, range: x.raw.rg || 1, armor: x.raw.ar || 15, mr: x.raw.ar || 15, maxMana: x.raw.spell ? x.raw.m || 100 : 0, spell: x.raw.spell || null, mon: 1, boss: x.raw.boss || 0, art: x.raw.art }, x.raw.ex || {});
    else { const d = UN[x.n], b = CB[d.cl], st = STAR[u.star - 1];
      Object.assign(u, { cost: d.c, cl: d.cl, o: d.o, maxhp: HPB[d.c - 1] * b.hp * st, ad: ADB[d.c - 1] * b.ad * st, as: b.as, range: b.rg, armor: b.ar, mr: b.ar, maxMana: d.s.m || b.m, spell: d.s }); }
    if (EVT === "lune") u.as *= 1.25; if (EVT === "geants") u.maxhp *= 1.5;
    if (u.spell && u.spell.k === "tardis") { u.still = true; u.manaS = 12; u.mana = 45; u.ad = 0; }
    u.items = (x.it || []).slice(); u.it = {};
    u.items.forEach(id => { const I = ITEM[id], st = I.st; u.it[id] = 1; if (st.ad) u.ad *= 1 + st.ad; if (st.as) u.as *= 1 + st.as; if (st.sp) u.sp += st.sp; if (st.mana) u.mana += st.mana; if (st.ar) u.armor += st.ar; if (st.mr) u.mr += st.mr; if (st.hp) u.maxhp += st.hp; if (st.crit) u.critC += st.crit; });
    const I = u.it; if (I.opinel) u.pen = .3; if (I.tournevis) u.ls += .15; if (I.pelle) u.manaAtk += 6; if (I.ciseaux) u.critD += .35; if (I.ventilo) u.range += 1; if (I.elastique) u.dodge += .2; if (I.gourde) u.regen += .02;
    if (I.calculatrice) u.sp += .35; if (I.wd40) u.red += .15; if (I.raclette) u.maxhp += 300; if (I.des) u.critC += .15; if (I.doudou) u.doudou = true; if (I.banane) u.banT = 4;
    u.R = side ? 3 - x.r : 4 + x.r; u.C = side ? 6 - x.c : x.c;
    return u;
  }
  function simInit(A, B, seed) {
    const S = { units: [], t: 0, rng: rng32(seed), ev: [], delayed: [], grid: {}, gold: [0, 0], goldWin: [0, 0], over: false, win: -1, sdT: EVT === "subite" ? 12 : 30 };
    [A, B].forEach((T, side) => T.units.forEach(x => { const u = mkUnit(S, side, x); while (S.grid[u.R + "," + u.C]) { u.C = (u.C + 1) % COLS; } S.grid[u.R + "," + u.C] = u; S.units.push(u); }));
    [A, B].forEach((T, side) => { const cnt = traitsOf(T.units, T.aug), mine = S.units.filter(u => u.side === side), foes = S.units.filter(u => u.side !== side);
      Object.keys(cnt).forEach(k => { const ti = tier(k, cnt[k]); if (ti < 0) return; const v = TRof(k).v[ti], mem = mine.filter(u => u.o && (u.o.includes(k) || u.cl === k) && !u.mon);
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
        else if (k === "series") mine.forEach(u => u.shield += v[0]);
        else if (k === "disney") mem.forEach(u => u.regen += v[0] / 100);
        else if (k === "mytho") mem.forEach(u => u.amp += v[0] / 100);
        else if (k === "wc") { S.wc = S.wc || [0, 0]; S.wc[side] = v[0] / 100; }
        else if (k === "chant") mem.forEach(u => u.mana += v[0]);
        else if (k === "hist") mine.forEach(u => u.sp += v[0] / 100);
        else if (k === "actx") foes.forEach(u => u.as *= 1 - v[0] / 100);
      }); });
    [A, B].forEach((T, side) => { const AG = T.aug || []; if (!AG.length) return; S.units.forEach(u => { if (u.side !== side) return;
      if (AG.includes("muscu")) u.amp += .12; if (AG.includes("blindage")) { u.armor += 20; u.mr += 20; } if (AG.includes("cardio")) u.as *= 1.12; if (AG.includes("infirmerie")) u.regen += .01;
      if (AG.includes("vampire")) u.ls += .08; if (AG.includes("mana")) u.mana += 20; if (AG.includes("tueur")) u.vsMon = 1; }); });
    S.units.forEach(u => { const I = u.it; if (I.parapluie) u.shield += u.maxhp * .25; if (I.bulle) u.shield += 300; if (u.maxMana) u.mana = Math.min(u.maxMana - 1, u.mana);
      if (I.enceinte || I.soutif) S.units.forEach(a => { if (a !== u && a.side === u.side && dist(a, u) <= 1) { if (I.enceinte && a.maxMana) a.mana = Math.min(a.maxMana - 1, a.mana + 15); if (I.soutif) { a.armor += 20; a.mr += 20; } } }); });
    S.units.forEach(u => { u.hp = u.maxhp; if (u.spell && u.spell.pas === "revive") u.revive = true; if (u.spell && u.spell.pas === "goldwin") S.goldWin[u.side] += 2; });
    S.exti = [0, 1].map(sd => S.units.some(u => u.side === sd && u.it.extincteur));
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
  function heal(S, u, v, quiet, by) { if (!u.alive || v <= 0) return; if (S.t > S.sdT) v *= .4; if (u.ahT > S.t) v *= .5; const h = Math.min(v, u.maxhp - u.hp); u.hp += h; const hb = by || u; (hb.owner || hb).healed += h; if (!quiet && h > 1) S.ev.push({ k: "heal", u: u.uid, v: Math.round(h) }); }
  function dmg(S, src, t, amt, type, o) {
    o = o || {}; if (!t.alive || amt <= 0) return 0;
    if (src) amt *= src.amp + bsum(S, src, "amp"); if (S.t > S.sdT) amt *= 1 + (S.t - S.sdT) * .12; if (src && src.vsMon && t.mon) amt *= 1.3; if (src && bsum(S, src, "weak")) amt *= Math.max(.2, 1 - bsum(S, src, "weak"));
    let res = Math.max(0, type === "p" ? t.armor + bsum(S, t, "armor") : type === "m" ? t.mr + bsum(S, t, "armor") : 0); if (type === "p" && src && src.pen) res *= 1 - src.pen;
    amt *= 100 / (100 + res); if (type === "m" && t.it.bouchons) amt *= .7; if (o.atk && t.it.couvercle) amt = Math.max(amt * .3, amt - 15); amt *= 1 - Math.min(.6, t.red); if (t.vulnT > S.t) amt *= 1 + t.vuln;
    let left = amt; if (t.shield > 0) { const a = Math.min(t.shield, left); t.shield -= a; left -= a; }
    t.hp -= left; t.taken += amt; if (src) (src.owner || src).dealt += amt; if (!o.dot) { S.ev.push({ k: "dmg", u: t.uid, v: Math.round(amt), c: o.crit ? 1 : 0, m: type === "m" ? 1 : 0 }); if (t.maxMana) t.mana = Math.min(t.maxMana, t.mana + Math.min(12, amt * .04) + (t.it.bouillotte ? 5 : 0));
      if (src && src.it.allumette) { t.burnT = S.t + 4; t.burnBy = src; } if (src && src.it.fourchette && o.atk) t.ahT = S.t + 4; if (o.atk && t.it.cactus && src && src.alive) dmg(S, t, src, amt * .25, "m", { dot: 1 }); }
    if (src && src.alive && src.ls) heal(S, src, amt * src.ls, true);
    if (t.spell && t.spell.pas === "enrage" && !t.enraged) { t.enraged = true; t.buffs.push({ s: "as", v: .45, until: 999 }, { s: "ad", v: .2, until: 999 }); S.ev.push({ k: "cast", u: t.uid, n: "Rage" }); }
    if (t.hp <= 0) {
      if (t.revive) { t.revive = false; t.hp = t.maxhp * .25; t.stunT = S.t + .8; t.dots = []; t.burnT = 0; S.ev.push({ k: "cast", u: t.uid, n: "Se relève !" }); }
      else if (t.doudou) { t.doudou = false; t.hp = t.maxhp * .3; t.dots = []; t.burnT = 0; S.ev.push({ k: "cast", u: t.uid, n: "🧸 Doudou !" }); }
      else { t.alive = false; t.hp = 0; delete S.grid[t.R + "," + t.C]; S.ev.push({ k: "die", u: t.uid });
        if (S.wc && S.wc[1 - t.side] && !t.sum) S.units.forEach(a => { if (a.alive && a.side !== t.side && a.o && a.o.includes("wc")) a.amp += S.wc[1 - t.side]; });
        if (src) { src.kills++; if (src.owner) src.owner.kills++; if (src.it.ticket && (src.tk || 0) < 2) { src.tk = (src.tk || 0) + 1; S.gold[src.side]++; S.ev.push({ k: "gold", u: src.uid }); } if (src.spell && src.spell.pas === "goldkill" && (src.gk || 0) < 2) { src.gk = (src.gk || 0) + 1; S.gold[src.side]++; S.ev.push({ k: "gold", u: src.uid }); } if (o.reset && src.alive) src.mana = src.maxMana; } }
    }
    return amt;
  }
  const SD = (u, p) => SPD[u.cost - 1] * SSTAR[u.star - 1] * u.sp * p;
  const within = (S, list, R, C, r) => list.filter(e => hd(e.R, e.C, R, C) <= r);
  function applyHit(S, u, e, sp, base) {
    const o = { reset: sp.reset };
    let p = base; if (sp.rnd) p *= .4 + S.rng() * 1.7; if (u.it.loupe && S.rng() < u.critC) { p *= u.critD; o.crit = 1; }
    if (sp.phys) dmg(S, u, e, p + u.ad * (1 + bsum(S, u, "ad")) * 1.2, "p", Object.assign(o, { crit: 1 })); else dmg(S, u, e, p, "m", o);
    if (!e.alive) return;
    if (sp.stun && !e.it.tippex) e.stunT = Math.max(e.stunT, S.t + (Array.isArray(sp.stun) ? sp.stun[u.star - 1] : sp.stun) * (e.boss ? .4 : 1));
    if (sp.mb && e.maxMana && !e.boss) e.mana = Math.max(0, e.mana - sp.mb);
    if (sp.vuln) { e.vuln = sp.vuln; e.vulnT = S.t + sp.d; }
    if (sp.weaken) e.buffs.push({ s: "weak", v: sp.weaken, until: S.t + sp.d });
    if (sp.slow) e.buffs.push({ s: "as", v: -sp.slow, until: S.t + sp.d });
    if (sp.dot) e.dots.push({ src: u, dps: SD(u, sp.dot) / sp.d, until: S.t + sp.d });
  }
  function cast(S, u) {
    const sp = u.spell, foes = foesOf(S, u).filter(e => targetable(S, e)), allies = alliesOf(S, u);
    S.ev.push({ k: "cast", u: u.uid, n: sp.n }); u.atkCd = Math.max(u.atkCd, .35);
    if (!foes.length && !["heal", "shield", "buff", "mana", "summon", "transform", "dodge", "tardis"].includes(sp.k)) return;
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
      case "line": { const pts = []; let x0 = u.C + (u.R & 1) * .5, x1 = t.C + (t.R & 1) * .5, dx = x1 - x0, dy = t.R - u.R, L = Math.sqrt(dx * dx + dy * dy) || 1; dx /= L; dy /= L;
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
          const raw = sp.clone ? { hp: u.maxhp * sp.clone, ad: u.ad * sp.clone, as: u.as, rg: 1, ar: 20, art: u.n } : { hp: sp.hp * SSTAR[u.star - 1], ad: sp.ad * SSTAR[u.star - 1], as: .7, rg: 1, ar: 25, art: sp.art || u.n }; const egg = sp.egg && S.rng() < sp.egg[1]; if (egg) raw.art = sp.egg[0];
          const s = mkUnit(S, u.side, { n: egg ? sp.egg[0] : sp.sn, raw, r: 0, c: 0 }); s.R = f[0]; s.C = f[1]; s.hp = s.maxhp; s.sum = 1; s.owner = u; s.amp = u.amp; S.grid[f[0] + "," + f[1]] = s; S.units.push(s); S.ev.push({ k: "spawn", u: s.uid }); } break; }
      case "transform": if (!u.tf) { u.tf = 1; const h = sp.hp * SSTAR[u.star - 1]; u.maxhp += h; u.hp += h; u.buffs.push({ s: "ad", v: sp.ad, until: 999 }); u.big = 1; } else heal(S, u, u.maxhp * .12); break;
      case "stunall": foes.forEach(e => applyHit(S, u, e, sp, SD(u, sp.p))); S.ev.push({ k: "flash", side: u.side }); break;
      case "half": foes.slice().sort((a, b) => b.hp - a.hp).slice(0, sp.cnt).forEach(e => { dmg(S, u, e, e.hp * (e.boss ? .12 : sp.pc[u.star - 1]), "t"); S.ev.push({ k: "shot", a: u.uid, b: e.uid }); }); S.ev.push({ k: "flash", side: u.side }); break;
      case "dodge": u.dodgeT = S.t + sp.d; u.buffs.push({ s: "ad", v: sp.v * u.star, until: S.t + sp.d + 4 }); break;
      case "tardis": { if (u.doc && u.doc.alive) { heal(S, u.doc, u.doc.maxhp * .4, false, u); u.doc.shield += u.doc.maxhp * .15; S.ev.push({ k: "cast", u: u.doc.uid, n: "Régénération" }); break; }
        const L = DOCT[u.star - 1], nm = L[Math.floor(S.rng() * L.length)], D = DOCS[nm], f = freeNear(S, u.R + (u.side ? 1 : -1), u.C, u); if (!f) break;
        const d = mkUnit(S, u.side, { n: nm, raw: { hp: D[0] * u.sp, ad: D[1] * u.sp, as: D[2], rg: D[3], ar: 35, art: nm, spell: D[4], m: 70, cost: 5 }, r: 0, c: 0 });
        d.R = f[0]; d.C = f[1]; d.hp = d.maxhp; d.sum = 1; d.owner = u; d.amp = u.amp; d.mon = 0; S.grid[f[0] + "," + f[1]] = d; S.units.push(d); u.doc = d; S.ev.push({ k: "spawn", u: d.uid }); break; }
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
      if (u.burnT > S.t) { dmg(S, u.burnBy, u, Math.min(u.maxhp * .02, 90) * DT, "t", { dot: 1 }); if (!u.alive) continue; }
      if (u.banT && S.t >= u.banT) { u.banT = S.t + 4; const a = alliesOf(S, u).sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0]; if (a) heal(S, a, 120 * u.sp * SSTAR[u.star - 1], false, u); }
      u.atkCd -= DT; u.moveCd -= DT;
      if (u.manaS && u.maxMana) u.mana = Math.min(u.maxMana, u.mana + u.manaS * DT);
      if (u.stunT > S.t || u.waitT > S.t) continue;
      if (u.spell && u.maxMana && u.mana >= u.maxMana) { u.mana = u.it.telecommande ? 20 : 0; cast(S, u);
        if (u.it.chargeur && (u.chg || 0) < 5) { u.chg = (u.chg || 0) + 1; u.as *= 1.2; } if (u.it.thermos) heal(S, u, u.maxhp * .1); if (u.it.cartes) u.amp += .1; continue; }
      let t = u.tgt; const foes = foesOf(S, u).filter(e => targetable(S, e));
      if (u.taunt && u.taunt.until > S.t && u.taunt.by.alive) t = u.taunt.by;
      else if (!t || !targetable(S, t)) { t = null; let bd = 99; for (const e of foes) { const d = dist(u, e) + S.rng() * .1; if (d < bd) { bd = d; t = e; } } }
      u.tgt = t; if (!t || u.still) continue;
      const d = dist(u, t);
      if (d <= u.range) { if (u.atkCd <= 0) attack(S, u, t); }
      else if (u.moveCd <= 0) { let best = null, bd = d; for (const [dr, dc] of NB[u.R & 1]) { const r = u.R + dr, c = u.C + dc; if (!inB(r, c) || S.grid[r + "," + c]) continue; const nd = hd(r, c, t.R, t.C) + S.rng() * .2; if (nd < bd) { bd = nd; best = [r, c]; } }
        if (best) { place(S, u, best[0], best[1]); u.moveCd = .32; }
        else if (S.rng() < .25) { for (const e of foes) if (dist(u, e) <= u.range) { u.tgt = e; break; } } }
    }
    const a = S.units.some(u => u.alive && u.side === 0), b = S.units.some(u => u.alive && u.side === 1);
    if (S.t >= S.sdT && !S.sudden) { S.sudden = true; S.ev.push({ k: "sudden" }); }
    if (!a || !b || S.t >= 90) { S.over = true; const hp = s => S.units.filter(u => u.alive && u.side === s).reduce((x, u) => x + u.hp / u.maxhp, 0);
      S.win = a && !b ? 0 : b && !a ? 1 : hp(0) > hp(1) ? 0 : hp(1) > hp(0) ? 1 : -1; S.left = [0, 1].map(s => S.units.filter(u => u.alive && u.side === s && !u.sum).length); }
  }
  function attack(S, u, t) {
    let asv = u.as * (1 + bsum(S, u, "as")); if (S.exti[1 - u.side]) for (const e of S.units) if (e.alive && e.side !== u.side && e.it.extincteur && dist(e, u) <= 1) { asv *= .75; break; }
    u.atkCd = 1 / Math.min(3.5, Math.max(.2, asv));
    S.ev.push({ k: u.range > 1 ? "shot" : "atk", a: u.uid, b: t.uid });
    if (t.dodgeT > S.t || S.rng() < t.dodge) { S.ev.push({ k: "miss", u: t.uid }); return; }
    let a = u.ad * (1 + bsum(S, u, "ad")); if (u.spell && u.spell.pas === "ramp") a *= 1 + (1 - u.hp / u.maxhp); if (u.it.marteau) a += u.maxhp * .02;
    const crit = S.rng() < u.critC; if (crit) a *= u.critD;
    if (u.it.ventouse && (t.sk || 0) < 8) { t.sk = (t.sk || 0) + 1; t.armor -= 5; t.mr -= 5; }
    dmg(S, u, t, a, "p", { crit, atk: 1 });
    if (u.it.lancepierre && t.alive && S.rng() < .25) dmg(S, u, t, a, "p", { crit, atk: 1 });
    if (u.it.poele) for (const e of S.units) if (e.alive && e !== t && e.side === t.side && dist(e, t) <= 1) dmg(S, u, e, a * .25, "p");
    if (u.it.spinner && (u.spn || 0) < 15) { u.spn = (u.spn || 0) + 1; u.as *= 1.04; }
    if (u.maxMana) u.mana = Math.min(u.maxMana, u.mana + 10 + u.manaAtk);
  }
  function simRun(A, B, seed) { const S = simInit(A, B, seed); let n = 0; while (!S.over && n++ < 1000) { step(S); S.ev.length = 0; } return S; }

  /* ---------- partie ---------- */
  let G = null;
  const newPlayer = (id, name, bot) => ({ id, name, bot, hp: 100, gold: 0, lvl: 1, xp: 0, board: [], bench: Array(9).fill(null), items: [], aug: [], choices: [], streak: 0, alive: true, shop: [], lock: false, place: 0 });
  // o : { event, humans: [{ uid, name }], me: index, bots: bool } pour le multijoueur
  function newGame(diff, seed, o) {
    o = o || {}; seed = seed || (Date.now() & 0x7fffffff); const rng = rng32(seed), names = BOTN.slice().sort(() => rng() - .5), AV = ["👑", "🦊", "🐸", "🐼", "🐙", "🦉", "🐷", "🐯", "🦄"];
    EVT = o.event && EVENTS[o.event] ? o.event : null; SET = o.set === "mix" ? SETS[1].concat(SETS[2]) : SETS[o.set] || SETS[1]; CURT = o.set === 3 || o.set === 4 ? o.set : 0;
    G = { set: o.set || 1, duo: !!o.duo, teams: [0, 1, 2, 3].map(() => ({ hp: 100 })), diff, seed, rng, event: EVT, stat: { fights: 0, wins: 0 }, ri: 0, phase: "plan", players: [], pool: {}, out: 0, log: [], hist: {}, mp: !!o.humans };
    const H = o.humans || [{ name: "Toi" }]; H.forEach((h, i) => { const p = newPlayer(i, h.name, false); p.uid = h.uid || null; p.av = AV[i]; G.players.push(p); });
    if (!o.humans || o.bots !== false || o.duo) for (let i = H.length; i < 8; i++) { const p = newPlayer(i, names[i - 1], true); p.av = AV[i] || "🤖"; G.players.push(p); }
    G.players.forEach(p => { p.team = G.duo ? Math.floor(p.id / 2) : p.id; }); if (diff === "variable") G.players.forEach(p => { if (p.bot) p.diff = ["facile", "normal", "difficile"][Math.floor(rng() * 3)]; }); G.n = G.players.length; SET.forEach(n => G.pool[n] = Math.ceil(POOLN[UN[n].c - 1] / (EVT === "penurie" ? 2 : 1)));
    G.me = G.players[o.me || 0]; G.me.av = "👑";
    { const pick = t => Object.keys(BOSS).filter(k => BOSS[k].t === t).sort(() => rng() - .5); const m = pick(2); G.boss = { 2: pick(1)[0], 3: m[0], 4: m[1], 5: pick(3)[0] }; }
    // chacun commence avec une unité à 1 or offerte
    const ones = SET.filter(n => UN[n].c === 1); G.rng = rng32(seed ^ ((o.me || 0) + 1) * 7919); G.players.forEach(p => { const n = ones[Math.floor(G.rng() * ones.length)]; G.pool[n]--; p.bench[0] = { n, star: 1 }; });
    roundStart(); return G;
  }
  // manches : 3 manches de monstres, puis des blocs de 6 combats + 1 manche de monstres
  // la dernière manche de chaque acte (à partir du 2e) est un boss
  const roundInfo = i => { if (i < 3) return { st: 1, k: i + 1, pve: i, boss: null }; const st = 2 + Math.floor((i - 3) / 7), k = (i - 3) % 7 + 1; return { st, k, pve: k === 7 ? st : -1, boss: k === 7 ? G.boss[Math.min(5, st)] : null }; };
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
          rm.forEach(x => { (x.it || []).forEach(id => { if (!equip(keep, id)) p.items.push(id); }); x.it = []; const bi = p.board.indexOf(x); if (bi >= 0) p.board.splice(bi, 1); else p.bench[p.bench.indexOf(x)] = null; }); rm.forEach(x => { if (x.st) { const k = keep.st = keep.st || { d: 0, k: 0, h: 0, t: 0, f: 0 }; k.d += x.st.d; k.k += x.st.k; k.h += x.st.h; k.t += x.st.t; k.f = Math.max(k.f, x.st.f); } }); keep.star++; made.push(keep); again = true; break; } } }
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
  function sell(p, x) { takeItems(p, x); const bi = p.board.indexOf(x); if (bi >= 0) p.board.splice(bi, 1); else { const i = p.bench.indexOf(x); if (i < 0) return; p.bench[i] = null; } p.gold += sellVal(x); G.pool[x.n] += Math.pow(3, x.star - 1); }
  const xpCost = () => EVT === "marche" ? 3 : 4, rollCost = () => EVT === "soldes" ? 1 : 2;
  function buyXp(p) { if (p.gold < xpCost() || p.lvl >= 9) return false; p.gold -= xpCost(); addXp(p, 4); return true; }
  function addXp(p, v) { if (p.lvl >= 9) return; p.xp += v; while (p.lvl < 9 && p.xp >= XPN[p.lvl - 1]) { p.xp -= XPN[p.lvl - 1]; p.lvl++; } }
  function reroll(p) { if (p.gold < rollCost()) return false; p.gold -= rollCost(); rollShop(p); return true; }
  const income = (p, ri) => { const base = ri < 4 ? Math.min(5, 2 + ri) : 5, st = Math.abs(p.streak); return base + (EVT === "paie" ? 2 : 0) + ((p.aug || []).includes("rente") ? 1 : 0) + Math.min(5, Math.floor(p.gold / 10)) + (st >= 5 ? 3 : st >= 4 ? 2 : st >= 2 ? 1 : 0); };
  function roundStart() {
    const ri = G.ri, inf = roundInfo(ri); G.info = inf; G.phase = "plan";
    G.players.filter(p => p.alive).forEach(p => {
      const mul = p.bot ? ({ facile: .75, normal: 1, difficile: 1.2 })[p.diff || G.diff] || 1 : 1;
      p.gold += Math.round(income(p, ri) * mul); if (ri > 0) addXp(p, 2);
      if (!p.lock) rollShop(p); p.lock = false;
      if (AUGR.includes(ri) && (p.aug || []).length <= AUGR.indexOf(ri)) { if (p === G.me && !p.bot) p.choices.push({ t: "aug", opts: augOpts(p, G.rng) }); else if (p.bot && (!G.mp || MP.host)) takeAug(p, augOpts(p, G.rng)[0]); }
      if (p.bot && (!G.mp || MP.host)) botTurn(p);
    });
    // duo en solo : le bot coéquipier offre l'unité qui te manque pour une fusion
    if (G.duo && !G.mp && G.me.alive) { const m = G.players.find(q => q.team === G.me.team && q !== G.me); if (m && m.bot && m.alive) { const me = G.me, i = m.bench.findIndex(x => x && x.star === 1 && owned(me).filter(y => y.n === x.n && y.star === 1).length === 2), slot = me.bench.indexOf(null);
        if (i >= 0 && slot >= 0) { const x = m.bench[i]; m.bench[i] = null; me.bench[slot] = x; merge(me); G.msg = `🎁 ${m.name} t'offre ${x.n} : fusion ★★ !`; } } }
  }
  /* ---------- bots ---------- */
  function botTurn(p) {
    const df = p.diff || G.diff, hard = df === "difficile", easy = df === "facile";
    const reserve = () => easy ? 0 : p.hp < 40 ? 0 : Math.min(hard ? 50 : 30, Math.floor(p.gold / 10) * 10);
    const score = n => { const d = UN[n], own = owned(p), same = own.filter(x => x.n === n).length, tr = traitsOf(own); let s = same * 4 + d.c * (easy ? .2 : .6); [...d.o, d.cl].forEach(k => { if (tr[k]) s += easy ? .5 : hard && tr[k] >= 2 ? 2.6 : 1.5; }); return s; };
    for (let pass = 0; pass < (hard ? 4 : easy ? 1 : 2); pass++) {
      p.shop.map((n, i) => [n, i]).filter(x => x[0]).sort((a, b) => score(b[0]) - score(a[0])).forEach(([n, i]) => {
        const c = UN[n].c, sc = score(n), need = owned(p).length < p.lvl + 2;
        if (p.gold - c < (sc >= 4 ? 0 : reserve())) return; if (!need && sc < 3.5) return;
        if (p.bench.indexOf(null) < 0) { const w = p.bench.filter(Boolean).sort((a, b) => score(a.n) * a.star - score(b.n) * b.star)[0]; if (w && score(w.n) < sc && w.star === 1) sell(p, w); else return; }
        buy(p, i); });
      if (p.lvl < 9 && p.gold - xpCost() >= reserve() && owned(p).length >= p.lvl) { buyXp(p); }
      if (pass < 3 && p.gold - rollCost() >= reserve() + (hard ? 0 : 10) && !easy) reroll(p); else break;
    }
    // placement : les meilleures unités sur le plateau, mêlée devant, distance derrière
    const all = owned(p).sort((a, b) => UN[b.n].c * b.star * b.star + score(b.n) * .3 - (UN[a.n].c * a.star * a.star + score(a.n) * .3));
    const seen = new Set(), on = [], off = []; all.forEach(x => { if (on.length < cap(p) && !seen.has(x.n)) { seen.add(x.n); on.push(x); } else off.push(x); });
    while (off.length > 9) { const w = off.pop(); takeItems(p, w); G.pool[w.n] += Math.pow(3, w.star - 1); p.gold += sellVal(w); }
    p.board = on; p.bench = off.concat(Array(9).fill(null)).slice(0, 9);
    // objets : sur les meilleures unités du plateau, en fusionnant les composants
    off.forEach(x => takeItems(p, x));
    p.items = p.items.filter(id => { const can = x => (x.it || []).length < 3 || isComp(id) && (x.it || []).some(isComp); let best = null, bs = -1;
      on.forEach((x, i) => { if (!can(x)) return; let sc = (on.length - i) * .1; if (!easy) { const rc = recoItems(x.n), c0 = (x.it || []).find(isComp); if (isComp(id)) sc += c0 ? (rc.includes(FUS[[c0, id].sort().join("+")]) ? 6 : 1) : rc.some(r => ITEM[r].mk.includes(id)) ? 2 : 0; else if (rc.includes(id)) sc += 6; } if (sc > bs) { bs = sc; best = x; } });
      return !(best && equip(best, id)); });
    const front = on.filter(x => CB[UN[x.n].cl].rg === 1), back = on.filter(x => CB[UN[x.n].cl].rg > 1), cols = [3, 2, 4, 1, 5, 0, 6];
    front.forEach((x, i) => { x.r = i < 7 ? 0 : 1; x.c = cols[i % 7]; }); back.forEach((x, i) => { x.r = i < 7 ? 3 : 2; x.c = cols[i % 7]; });
  }
  const teamOf = p => ({ aug: G.mp && p === G.me && MP.snapAug ? MP.snapAug : (p.aug || []).slice(), units: G.mp && p === G.me && MP.snap ? MP.snap : p.board.map(x => ({ n: x.n, star: x.star, r: x.r, c: x.c, ref: x, it: x.it || [] })) });
  function pveTeam(inf) {
    const L = []; let i = 0; const add = (n, k, sc, row) => { for (let j = 0; j < k; j++) { const m = MON[n]; L.push({ n, raw: { hp: m[0] * sc, ad: m[1] * sc, as: m[2], art: n }, r: row != null ? row : i > 4 ? 1 : 0, c: [3, 1, 5, 2, 4, 0, 6][i % 7] }); i++; } };
    if (!inf.boss) { PVE[inf.pve].forEach(([n, k]) => add(n, k, 1)); return { units: L }; }
    const B = BOSS[inf.boss], sc = 1 + Math.max(0, inf.st - [2, 3, 5][B.t - 1]) * .45, far = (B.rg || 1) > 1;
    L.push({ n: inf.boss, raw: { hp: B.hp * sc, ad: B.ad * sc, as: B.as, rg: B.rg || 1, ar: B.ar, art: inf.boss, spell: B.s, m: 100, cost: [2, 4, 5][B.t - 1], boss: B.t, ex: B.ex }, r: far ? 2 : 1, c: 3 });
    i = 1; (B.adds || []).forEach(([n, k]) => add(n, k, 1 + (inf.st - 2) * .25, 0));
    return { units: L };
  }
  // prépare les affrontements de la manche ; renvoie le combat du joueur
  function prepareFights() {
    const inf = G.info, alive = G.players.filter(p => p.alive), R = rng32((G.seed ^ Math.imul(G.ri + 1, 2654435761)) | 0), seed = () => Math.floor(R() * 1e9); G.fights = [];
    if (inf.pve >= 0) alive.forEach(p => G.fights.push({ a: p, b: null, B: pveTeam(inf), seed: seed() }));
    else if (G.duo) { const T = [...new Set(alive.map(p => p.team))]; for (let i = T.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = T[i]; T[i] = T[j]; T[j] = t; }
      const mem = t => alive.filter(p => p.team === t), vs = (X, Y, ghost) => { const fl = R() < .5; X.forEach((a, i) => { const b = Y.length ? Y[(i + (fl ? 1 : 0)) % Y.length] : null; if (!b) return; G.fights.push(ghost ? { a, b: null, ghost: b, B: teamOf(b), seed: seed() } : { a, b, B: teamOf(b), seed: seed() }); }); };
      while (T.length >= 2) { const X = mem(T.pop()), Y = mem(T.pop()); if (X.length < Y.length) { vs(Y, X); } else if (X.length > Y.length) { vs(X.slice(0, Y.length), Y); vs(X.slice(Y.length), Y, true); } else vs(X, Y); }
      if (T.length) { const o = [...new Set(alive.filter(p => p.team !== T[0]).map(p => p.team))]; vs(mem(T[0]), mem(o[Math.floor(R() * o.length)]), true); } }
    else { const L = alive.slice(); for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = L[i]; L[i] = L[j]; L[j] = t; } while (L.length >= 2) { const a = L.pop(), b = L.pop(); G.fights.push({ a, b, B: teamOf(b), seed: seed() }); }
      if (L.length) { const a = L[0], o = alive.filter(p => p !== a), g = o[Math.floor(R() * o.length)]; G.fights.push({ a, b: null, ghost: g, B: teamOf(g), seed: seed() }); } }
    G.fights.forEach(f => { if (f.b && f.a.id > f.b.id) { const t = f.a; f.a = f.b; f.b = t; } if (f.b) f.B = teamOf(f.b); f.A = teamOf(f.a); });
    return G.fights.find(f => f.a === G.me || f.b === G.me);
  }
  function resolveFight(f, S) {
    const my = f.a === G.me ? 0 : f.b === G.me ? 1 : -1;
    if (my >= 0) { S.units.forEach(u => { if (u.side === my && u.ref) { const st = u.ref.st = u.ref.st || { d: 0, k: 0, h: 0, t: 0, f: 0 }; st.d += u.dealt; st.k += u.kills; st.h += u.healed; st.t += u.taken; st.f++; } }); G.stat.fights++; if (S.win === my) G.stat.wins++; }
    const inf = G.info;
    const lose = (p, n) => { let d = STAGEDMG[Math.min(inf.st, STAGEDMG.length - 1)] + n * (inf.pve >= 0 ? 1 : 2); if (EVT === "toutourien") d *= 2; if (G.duo) { d = Math.max(1, Math.round(d * .6)); const T = G.teams[p.team]; T.hp -= d; G.players.forEach(q => { if (q.team === p.team) q.hp = T.hp; }); } else p.hp -= d; p.streak = p.streak < 0 ? p.streak - 1 : -1; return d; };
    const win = (p, side) => { p.streak = inf.pve >= 0 ? p.streak : p.streak > 0 ? p.streak + 1 : 1; p.gold += (inf.pve >= 0 ? 0 : 1 + (EVT === "toutourien" ? 3 : 0)) + S.goldWin[side]; };
    f.a.gold += S.gold[0]; if (f.b) f.b.gold += S.gold[1];
    let ra, rb = null;
    if (inf.pve >= 0) { const t = inf.boss ? BOSS[inf.boss].t : 0, w = S.win === 0;
      if (w) { win(f.a, 0); f.a.gold += t ? 2 + t * 2 : 2; ra = { w: 1 }; } else ra = { w: 0, d: lose(f.a, inf.boss ? 2 + t * 2 : S.left[1]) };
      ra.it = t ? (w ? loot(f.a, t === 3 ? 1 : 2, t) : loot(f.a, 1, 0)) : loot(f.a, 1, 0); ra.pick = f.a === G.me && !f.a.bot; }
    else if (S.win === 0) { win(f.a, 0); ra = { w: 1 }; if (f.b) rb = { w: 0, d: lose(f.b, S.left[0]) }; }
    else if (S.win === 1) { ra = { w: 0, d: lose(f.a, S.left[1]) }; if (f.b) { win(f.b, 1); rb = { w: 1 }; } }
    else { ra = { w: 0, d: lose(f.a, 1) }; if (f.b) rb = { w: 0, d: lose(f.b, 1) }; }
    f.res = my === 1 ? rb : ra;
  }
  function roundEnd() {
    if (G.me.alive && G.me.hp <= 0) G.lastBoard = G.me.board.slice().sort((a, b) => ((b.st || {}).d || 0) - ((a.st || {}).d || 0));
    const dead = G.players.filter(p => p.alive && p.hp <= 0).sort((a, b) => a.hp - b.hp);
    dead.forEach(p => { p.alive = false; p.place = G.n - G.out; G.out++; owned(p).forEach(x => G.pool[x.n] += Math.pow(3, x.star - 1)); p.board = []; p.bench = Array(9).fill(null); });
    const alive = G.players.filter(p => p.alive);
    if (G.spec) { if (new Set(alive.map(p => p.team)).size <= 1) { G.winner = alive.map(p => p.name).join(" et "); G.phase = "over"; return; } G.ri++; roundStart(); return; }
    if (!G.me.alive) { G.phase = "over"; return; }
    if (alive.every(p => p.team === G.me.team)) { G.me.place = 1; G.phase = "over"; return; }
    if (G.mp && !G.duo && !alive.some(p => !p.bot && p !== G.me) && !G.players.some(p => p.bot)) { G.me.place = 1; G.phase = "over"; return; }
    G.ri++; roundStart();
  }
  // joue le reste de la manche sans affichage (les combats des bots)
  function roundTick() {
    const ended = []; for (const f of G.fights) { if (f.S.over) continue; step(f.S); if (f.S.over) ended.push(f); }
    for (const f of G.fights) if (f.rein && !f.S.over && f.S.t >= f.rein.t) { reinforce(f, f.rein); f.rein = null; }
    if (G.duo) for (const f of ended) { const w = f.S.win, pw = w === 0 ? f.a : w === 1 ? f.b : null; if (!pw) continue;
      const mate = G.players.find(q => q.team === pw.team && q !== pw && q.alive), pf = mate && G.fights.find(x => x !== f && (x.a === mate || x.b === mate));
      if (pf && !pf.S.over) pf.rein = { t: pf.S.t + 1.5, side: pf.a === mate ? 0 : 1, from: pw, units: f.S.units.filter(u => u.alive && u.side === w && !u.sum && !u.mon).map(u => ({ n: u.n, star: u.star, it: u.items, k: u.hp / u.maxhp })) }; }
    return ended;
  }
  // duo : les survivants du vainqueur rejoignent le combat de son coéquipier
  function reinforce(f, r) {
    const S = f.S; r.units.forEach((x, i) => { const fr = freeNear(S, r.side ? 0 : 7, [3, 2, 4, 1, 5, 0, 6][i % 7]); if (!fr) return; const u = mkUnit(S, r.side, { n: x.n, star: x.star, it: x.it, r: 0, c: 0 });
      u.R = fr[0]; u.C = fr[1]; u.hp = u.maxhp * Math.max(.1, x.k); u.rein = 1; u.sum = 1; u.waitT = S.t + .3; S.grid[fr[0] + "," + fr[1]] = u; S.units.push(u); S.ev.push({ k: "spawn", u: u.uid }); });
    S.ev.push({ k: "rein", side: r.side, n: r.from.name });
  }
  // joue toute la manche sans affichage
  function playRound() { let n = 0; while (G.fights.some(f => !f.S.over) && n++ < 1200) { roundTick().forEach(f => resolveFight(f, f.S)); G.fights.forEach(f => f.S.ev.length = 0); } }
  function resolveOthers() { G.fights.forEach(f => { f.S = simInit(f.A, f.B, f.seed); }); playRound(); }

  /* ---------- musique (fichiers audio du jeu : pas de pub, démarrage immédiat) ---------- */
  const TRK = { main: "principale", pvp: ["combat1", "combat2", "combat3", "combat4"], boss1: "boss-facile", boss2: "boss-moyen", boss3: "boss-final", win: "victoire" };
  const MU = { vol: 40, cur: null, main: null, alt: null, next: null };
  try { const v = +localStorage.getItem("wc-arena-vol"); if (localStorage.getItem("wc-arena-vol") != null && v >= 0 && v <= 100) MU.vol = v; } catch (_) {}
  const muBase = (() => { try { const sc = document.currentScript; return sc ? sc.src.replace(/arena\.js.*$/, "music/") : "vendor/arena/music/"; } catch (_) { return "vendor/arena/music/"; } })();
  const muPick = key => { const t = TRK[key]; return Array.isArray(t) ? t[Math.floor(Math.random() * t.length)] : t; };
  function muAudio(name) { const a = new Audio(muBase + name + ".m4a"); a.loop = true; a.preload = "auto"; a.volume = MU.vol / 100; return a; }
  const muPlay = a => { if (!a) return; a.volume = MU.vol / 100; const p = a.play(); if (p && p.catch) p.catch(() => {}); };
  // key : "main" (préparation et monstres), "pvp", "boss1", "boss2", "boss3", "win", ou null pour tout couper
  function music(key) {
    if (typeof Audio === "undefined" || !root) return; if (key === MU.cur) return; MU.cur = key;
    if (MU.alt) { MU.alt.pause(); MU.alt = null; }
    if (!key) { if (MU.main) MU.main.pause(); return; }
    if (key === "main") { if (!MU.main) MU.main = muAudio(TRK.main); return muPlay(MU.main); }
    if (MU.main) MU.main.pause();
    if (MU.next && MU.next.key === key) { MU.alt = MU.next.a; MU.next = null; } else MU.alt = muAudio(muPick(key));
    try { MU.alt.currentTime = 0; } catch (_) {} muPlay(MU.alt);
  }
  // charge à l'avance la musique du prochain combat pour qu'elle parte tout de suite
  function muPrep(key) { if (typeof Audio === "undefined" || !key || !TRK[key] || key === "main") return; if (MU.next && MU.next.key === key) return; MU.next = { key, a: muAudio(muPick(key)) }; }
  function muVol(v) { MU.vol = v; try { localStorage.setItem("wc-arena-vol", v); } catch (_) {} [MU.main, MU.alt].forEach(a => { if (a) a.volume = v / 100; }); }
  function muStop() { MU.cur = null; [MU.main, MU.alt].forEach(a => { if (a) a.pause(); }); MU.main = MU.alt = MU.next = null; }

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

  /* ---------- multijoueur : le salon synchronise les plateaux, chaque appareil rejoue les mêmes combats ---------- */
  const MP = { deadGid: null, gifts: [], snap: null, room: null, st: null, poll: null, host: false, gid: null, sent: -1, tick: 0 };
  const rpc = async (fn, args) => { const r = await API.rpc(fn, args); if (r.error) throw new Error(r.error.message || "Erreur"); return r.data; };
  const packBoard = p => p.board.map(x => ({ n: x.n, s: x.star, r: x.r, c: x.c, it: x.it || [] }));
  const unpack = b => (b || []).filter(x => UN[x.n]).map(x => ({ n: x.n, star: x.s || 1, r: x.r, c: x.c, it: (x.it || []).filter(id => ITEM[id]) }));
  function mpStop() { clearInterval(MP.poll); MP.poll = null; }
  async function mpLeave() { mpStop(); const id = MP.room; MP.room = null; MP.st = null; MP.gid = null; if (id) try { await rpc("room_leave", { p_room: id }); } catch (_) {} }
  async function mpLobby() {
    mpStop(); let L = []; try { L = (await rpc("room_list") || []).filter(r => r.game === "arena"); } catch (e) { note(e.message); }
    const mine = L.find(r => r.mine); if (mine) { MP.room = mine.id; return mpRoom(); }
    const fr = (API.friends ? API.friends() : []).sort((a, b) => (b.on - a.on) || a.name.localeCompare(b.name));
    root.innerHTML = `<div class="ar-menu"><h1>⚔️ Multijoueur</h1>
      ${L.length ? `<div class="ar-box"><h3>Salons ouverts</h3>${L.map(r => `<div class="ar-lrow"><b>${esc(API.name(r.host))}</b><span>${r.invited ? "t'invite · " : ""}${r.players.length} joueur${r.players.length > 1 ? "s" : ""}${r.status === "jeu" ? " · partie en cours" : ""}</span><button class="ar-b go" data-join="${r.id}" ${r.status === "jeu" ? "disabled" : ""}>Rejoindre</button></div>`).join("")}</div>` : ""}
      <div class="ar-box"><h3>Créer un salon</h3><p>Invite jusqu'à 7 amis. Les places libres sont tenues par des bots.</p>
        <div class="ar-fr">${fr.map(f => `<label><input type="checkbox" value="${f.id}"> ${esc(f.name)}${f.on ? " <i>●</i>" : ""}</label>`).join("") || `<span class="ar-hint">Aucun ami à inviter.</span>`}</div>
        <button class="ar-b go" data-act="mpcreate">Créer le salon</button></div>
      <div class="ar-row"><button class="ar-b" data-act="mprefresh">Actualiser</button><button class="ar-b" data-act="back">Retour</button></div></div>`;
    root.onclick = async e => { const j = e.target.closest("[data-join]"), a = e.target.closest("[data-act]");
      try { if (j) { await rpc("room_join", { p_room: +j.dataset.join }); MP.room = +j.dataset.join; return mpRoom(); }
        if (!a) return; if (a.dataset.act === "back") return menu(); if (a.dataset.act === "mprefresh") return mpLobby();
        if (a.dataset.act === "mpcreate") { const inv = [...root.querySelectorAll(".ar-fr input:checked")].map(i => i.value).slice(0, 7); MP.room = await rpc("room_create", { p_game: "arena", p_invite: inv, p_settings: {} }); return mpRoom(); }
      } catch (err) { note(err.message); } };
  }
  const evOpts = sel => `<option value="">Aucun</option><option value="hasard" ${sel === "hasard" ? "selected" : ""}>🎲 Au hasard (toujours un événement)</option><option value="surprise" ${sel === "surprise" ? "selected" : ""}>❓ Surprise (un événement ou aucun)</option>` + Object.keys(EVENTS).map(k => `<option value="${k}" ${sel === k ? "selected" : ""}>${EVENTS[k][0]} ${EVENTS[k][1]}</option>`).join("");
  const pickSet = v => v === "alea" ? 1 + Math.floor(Math.random() * 4) : ({ 1: 1, 2: 2, 3: 3, 4: 4 })[v] || "mix";
  const pickEvent = v => v === "surprise" && Math.random() < .25 ? null : v === "hasard" || v === "surprise" ? Object.keys(EVENTS)[Math.floor(Math.random() * Object.keys(EVENTS).length)] : EVENTS[v] ? v : null;
  function mpRoom() { MP.sig = null; MP.gid = null; root.innerHTML = `<div class="ar-menu"><h1>⚔️ Salon</h1><div id="ar-room"><p>Connexion…</p></div></div>`;
    root.onclick = async e => { const a = e.target.closest("[data-act]"); if (!a) return;
      try { if (a.dataset.act === "mpquit") { await mpLeave(); return menu(); }
        if (a.dataset.act === "mpstart") { const v = k => (root.querySelector("#ar-" + k) || {}).value; await rpc("ar_start", { p_room: MP.room, p_cfg: { seed: Math.floor(Math.random() * 2e9), diff: v("mpdiff") || "normal", event: pickEvent(v("mpev")), bots: v("mpbots") !== "non", duo: v("mpmode") === "duo", set: pickSet(v("mpset")) } }); mpTick(); }
      } catch (err) { note(err.message); } };
    mpStop(); MP.poll = setInterval(mpTick, 1500); mpTick(); }
  async function mpTick() {
    if (!root || !MP.room) return mpStop(); let d; try { d = await rpc("room_state", { p_room: MP.room, p_after: 0 }); } catch (e) { mpStop(); MP.room = null; note(e.message); if (!G) menu(); return; }
    if (!root || !MP.room) return; MP.st = d; MP.host = d.host === API.uid; const s = d.state || {};
    if (!G && d.status === "jeu" && MP.deadGid && MP.deadGid === s.gid) { if (s.r !== MP.sent) { MP.sent = s.r; rpc("ar_submit", { p_room: MP.room, p_r: s.r, p_data: { dead: 1 } }).catch(() => {}); } const b = root.querySelector("#ar-room"); if (b && !b.dataset.w) { b.dataset.w = 1; b.innerHTML = `<p>La partie continue sans toi. Tu pourras rejouer quand elle sera terminée.</p><div class="ar-row"><button class="ar-b" data-act="mpquit">Quitter le salon</button></div>`; } return; }
    if (d.status === "jeu" && s.gid && s.gid !== MP.gid) { if ((s.order || []).includes(API.uid) && s.r === 0 && !s.prev) return mpBegin(s); if (!G) { const sv = loadSave(); if (sv && sv.mp && sv.gid === s.gid && (sv.G.ri === s.r || sv.G.ri === s.r - 1 && s.prev && s.prev.r === sv.G.ri)) { MP.gid = s.gid; MP.gifts = []; music("main"); restore(sv); const un = b => (b || []).filter(x => UN[x.n]).map(x => ({ n: x.n, star: x.s || 1, r: x.r, c: x.c, it: x.it || [] }));
          if (sv.G.ri === s.r) { const mine = (s.by || {})[API.uid]; if (mine) { G.phase = "wait"; MP.sent = G.ri; MP.snap = un(mine.b || G.lastSub); MP.snapAug = mine.aug || G.lastAug || []; drawAll(); } else startTimer(); }
          else { const mine = (s.prev.by || {})[API.uid]; MP.snap = un(mine && mine.b ? mine.b : G.lastSub); MP.snapAug = (mine && mine.aug) || G.lastAug || []; MP.sent = G.ri; G.phase = "wait"; mpGo(s.prev.by || {}); }
          note("Partie reprise."); return; }
        const b = root.querySelector("#ar-room"); if (b) b.innerHTML = `<p>Une partie est en cours dans ce salon. Attends qu'elle se termine.</p><div class="ar-row"><button class="ar-b" data-act="mpquit">Quitter le salon</button></div>`; } return; }
    if (G && G.mp && MP.gid && s.gid === MP.gid && G.phase === "over" && !G.spec) { if (d.status === "jeu" && s.r !== MP.sent) { MP.sent = s.r; rpc("ar_submit", { p_room: MP.room, p_r: s.r, p_data: { dead: 1 } }).catch(() => {}); } return; }
    if (G && G.mp && MP.gid && s.gid === MP.gid) return mpSync(s);
    if (d.status !== "jeu") { if (G && G.mp && G.phase !== "over") { note("La partie a été arrêtée."); stopLoop(); clearInterval(UI.timer); G = null; mpRoom(); return; } if (G) return;
      const sig = JSON.stringify([d.players, d.host]); if (sig === MP.sig) return; MP.sig = sig; const b = root.querySelector("#ar-room"); if (!b) return;
      b.innerHTML = `<div class="ar-box"><h3>Joueurs (${d.players.length}/8)</h3>${d.players.map(p => `<div class="ar-lrow"><b>${esc(API.name(p.u))}${p.u === d.host ? " 👑" : ""}</b><span>${p.on ? "connecté" : "absent"}</span></div>`).join("")}</div>
        ${MP.host ? `<div class="ar-box"><h3>Réglages</h3><label class="ar-opt">Cartes <select id="ar-mpset"><option value="1">Set 1 (65 unités)</option><option value="2">Set 2 (65 unités)</option><option value="3">Set 3 (65 unités)</option><option value="4">Set 4 (65 unités)</option><option value="mix">Sets 1 et 2 mélangés</option><option value="alea">🎲 Set au hasard (1 à 4)</option></select></label><label class="ar-opt">Mode <select id="ar-mpmode"><option value="solo">Chacun pour soi</option><option value="duo">Duo (équipes de 2 dans l'ordre de la liste)</option></select></label><p class="ar-hint">En duo : le 1er et le 2e joueur font équipe, le 3e et le 4e, etc. Un joueur seul reçoit un bot comme coéquipier, et les places libres sont toujours tenues par des bots.</p><label class="ar-opt">Bots sur les places libres <select id="ar-mpbots"><option value="oui">Oui</option><option value="non">Non</option></select></label><label class="ar-opt">Difficulté des bots <select id="ar-mpdiff"><option value="facile">Facile</option><option value="normal" selected>Normal</option><option value="difficile">Difficile</option><option value="variable">🎲 Variable (une difficulté par bot)</option></select></label><label class="ar-opt">Événement <select id="ar-mpev">${evOpts("hasard")}</select></label></div>
        <div class="ar-row"><button class="ar-b big go" data-act="mpstart">Lancer la partie</button><button class="ar-b" data-act="mpquit">Fermer le salon</button></div>` : `<p>En attente de l'hôte…</p><div class="ar-row"><button class="ar-b" data-act="mpquit">Quitter le salon</button></div>`}`; }
  }
  function mpBegin(s) {
    MP.gid = s.gid; MP.sent = -1; const c = s.cfg || {}, order = s.order || [], me = order.indexOf(API.uid);
    music("main"); newGame(c.diff || "normal", (c.seed | 0) || 1, { event: c.event, humans: order.map(u => ({ uid: u, name: u === API.uid ? "Toi" : API.name(u) })), me, bots: c.bots !== false, duo: !!c.duo, set: c.set }); MP.gifts = [];
    UI.speed = 1; build(); if (G.event) evBanner(); note("Cartes : " + SETN[G.set] + (G.duo ? " · mode duo" : "") + (G.event ? "" : " · pas d'événement"));
  }
  // « Prêt » : j'envoie mon plateau (l'hôte envoie aussi ceux des bots et les PV de tout le monde)
  async function mpReady() {
    if (!G || G.phase !== "plan") return; clearInterval(UI.timer); dragEnd(); fillBoard(G.me); G.phase = "wait"; UI.sel = null; UI.info = null; UI.selItem = null; drawAll(); $("#ar-timer").textContent = "en attente des autres…";
    G.lastSub = packBoard(G.me); G.lastAug = (G.me.aug || []).slice(); MP.snapAug = (G.me.aug || []).slice(); MP.snap = G.me.board.map(x => ({ n: x.n, star: x.star, r: x.r, c: x.c, ref: x, it: (x.it || []).slice() }));
    const d = G.me.alive ? { b: packBoard(G.me), lvl: G.me.lvl, aug: G.me.aug || [] } : { dead: 1 };
    if (MP.gifts.length) { d.gift = MP.gifts; MP.gifts = []; }
    if (MP.host) { d.bots = {}; G.players.forEach(p => { if (p.bot && p.alive) d.bots[p.id] = { b: packBoard(p), lvl: p.lvl, aug: p.aug || [] }; }); d.hp = G.players.map(p => p.hp); }
    MP.sent = G.ri; try { await rpc("ar_submit", { p_room: MP.room, p_r: G.ri, p_data: d }); } catch (e) { note(e.message); MP.sent = -1; G.phase = "plan"; drawAll(); }
  }
  function mpSync(s) {
    if (!G || G.phase === "over") return;
    if (G.spec && G.phase === "wait" && s.r > G.ri + 1) { if (s.prev) specApply(s.prev.by || {}, true); G.ri = s.r; G.info = roundInfo(G.ri); MP.sent = -1; return specWait(); }
    if (G.phase === "wait") { const n = Object.keys(s.by || {}).length, tot = (MP.st.players || []).length; if (s.r === G.ri) { $("#ar-timer").textContent = G.spec ? `👁 préparation… ${Math.max(0, n - 1)} prêt${n - 1 > 1 ? "s" : ""}` : `en attente… ${n}/${tot} prêts`; if (++MP.tick % 6 === 0) rpc("ar_force", { p_room: MP.room, p_r: G.ri }).catch(() => {}); }
      if (s.prev && s.prev.r === G.ri) { MP.tick = 0; mpGo(s.prev.by || {}); } }
  }
  function mpGo(by) {
    let hostD = null; G.players.forEach(p => { if (p.bot || !p.uid) return; const d = by[p.uid]; if (d && MP.st && p.uid === MP.st.host) hostD = d; if (p === G.me || !d || d.afk || d.dead) return; p.board = unpack(d.b); p.lvl = d.lvl || p.lvl; p.aug = (d.aug || []).filter(k => AUG[k]); });
    if (hostD && !MP.host) { G.players.forEach(p => { if (p.bot && hostD.bots && hostD.bots[p.id]) { p.board = unpack(hostD.bots[p.id].b); p.lvl = hostD.bots[p.id].lvl || p.lvl; p.aug = (hostD.bots[p.id].aug || []).filter(k => AUG[k]); } }); if (Array.isArray(hostD.hp)) hostD.hp.forEach((h, i) => { const p = G.players[i]; if (p && p.alive && typeof h === "number" && h > 0) p.hp = h; }); }
    if (G.duo && !G.spec && G.me.alive) { const m = mateOf(G.me), d = m && m.uid && by[m.uid]; if (d && d.gift) receive(d.gift); }
    if (G.spec && MP.host) specApply(by, false);
    G.phase = "plan"; startFight();
  }
  // spectateur : après son élimination, on continue de suivre la partie
  function specStart() {
    const s = MP.st && MP.st.state; if (!G || !G.mp || !s || s.gid !== MP.gid || MP.st.status !== "jeu") return note("La partie est terminée.");
    root.querySelectorAll(".ar-modal").forEach(m => m.remove()); G.spec = true; root.classList.add("spec"); music("main");
    // on se recale sur la manche en cours du salon : équipes du dernier envoi, PV donnés par l'hôte
    if (s.r > G.ri + 1) { if (s.prev) specApply(s.prev.by || {}, !MP.host); G.ri = s.r; G.info = roundInfo(G.ri); } else { G.ri++; roundStart(); }
    G.fights = null; UI.sim = UI.view = null; G.phase = "wait"; specWait();
  }
  function specApply(by, sync) {
    let hostD = null; G.players.forEach(p => { if (p.bot || !p.uid) return; const d = by[p.uid]; if (d && MP.st && p.uid === MP.st.host) hostD = d; if (!d || d.afk || d.dead) return; p.board = unpack(d.b); p.lvl = d.lvl || p.lvl; p.aug = (d.aug || []).filter(k => AUG[k]); });
    if (hostD) { G.players.forEach(p => { if (p.bot && hostD.bots && hostD.bots[p.id]) { p.board = unpack(hostD.bots[p.id].b); p.lvl = hostD.bots[p.id].lvl || p.lvl; p.aug = (hostD.bots[p.id].aug || []).filter(k => AUG[k]); } });
      if (sync && Array.isArray(hostD.hp)) hostD.hp.forEach((h, i) => { const p = G.players[i]; if (!p || p === G.me || typeof h !== "number") return; p.hp = h; if (h <= 0 && p.alive) { p.alive = false; p.board = []; } }); }
  }
  function specWait() {
    if (!root || !G) return; G.phase = "wait"; G.fights = null; UI.sim = UI.view = null; UI.sel = UI.info = UI.selItem = null; $("#ar-live").innerHTML = ""; const v = $("#ar-view"); if (v) v.remove(); drawAll(); $("#ar-timer").textContent = "👁 les joueurs se préparent…"; $("#ar-tbar").style.width = "0%";
    if (MP.sent !== G.ri) { MP.sent = G.ri; const d = { dead: 1 }; if (MP.host) { d.bots = {}; G.players.forEach(p => { if (p.bot && p.alive) d.bots[p.id] = { b: packBoard(p), lvl: p.lvl, aug: p.aug || [] }; }); d.hp = G.players.map(p => p.hp); }
      rpc("ar_submit", { p_room: MP.room, p_r: G.ri, p_data: d }).catch(() => {}); }
  }
  function evBanner() { const e = EVENTS[G.event], m = document.createElement("div"); m.className = "ar-modal"; m.innerHTML = `<div class="ar-sheet ar-over"><div style="font-size:60px">${e[0]}</div><h2>Événement : ${e[1]}</h2><p>${e[2]}</p><button class="ar-b go" data-x>C'est parti</button></div>`; root.appendChild(m); m.onclick = ev => { if (ev.target === m || ev.target.closest("[data-x]")) m.remove(); }; setTimeout(() => m.remove(), 6000); }

  /* ---------- interface ---------- */
  let API = null, root = null, UI = { sel: null, speed: 1, timer: null, tleft: 0, sim: null, loop: null, info: null };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const $ = s => root.querySelector(s);
  const artOf = n => { const id = IDS[n] || IDS[(UN[n] || {}).n]; const a = (API && id && API.art(id)) || {}; const o = API && API.own && id ? API.own(id) : null; return { url: a.url || "", px: a.px == null ? 50 : a.px, py: a.py == null ? 25 : a.py, nm: a.nm || n, own: o ? (o.s ? "S" : o.r === "M" || o.r === "L" ? o.r : "") : "" }; };
  const bg = n => { const a = artOf(n); return a.url ? `background-image:url('${String(a.url).replace(/'/g, "%27")}');background-position:${a.px}% ${a.py}%` : ""; };
  const stars = s => "★".repeat(s);
  const SMALL = () => typeof innerWidth !== "undefined" && innerWidth <= 900;
  const RECO = { col: [0], bag: [0, 1], ass: [3], tir: [3], mag: [3], sou: [2, 3], str: [2] };
  const PLACE = { col: "en première ligne : il encaisse pour les autres.", bag: "devant, en 1re ou 2e ligne.", ass: "à l'arrière : il saute tout seul sur la ligne arrière ennemie au début du combat.", tir: "tout au fond, derrière tes unités de mêlée.", mag: "au fond, bien à l'abri.", sou: "au milieu ou au fond, près de ses alliés.", str: "au milieu, entouré de ses alliés." };
  const POSI = { col: ["▲", "Devant", "f"], bag: ["▲", "Devant", "f"], ass: ["⤴", "Fond · bondit", "b"], tir: ["▼", "Fond", "b"], mag: ["▼", "Fond", "b"], sou: ["◆", "Milieu", "m"], str: ["◆", "Milieu", "m"] };
  // objets conseillés par classe (les trois premiers qui ont du sens pour l'unité)
  const RECI = { col: ["wd40", "raclette", "cactus", "gourde"], bag: ["tournevis", "marteau", "poele", "doudou"], ass: ["opinel", "ciseaux", "lancepierre", "des"], tir: ["spinner", "ventilo", "lancepierre", "ventouse"], mag: ["calculatrice", "telecommande", "loupe", "allumette"], sou: ["telecommande", "banane", "enceinte", "thermos"], str: ["telecommande", "enceinte", "parapluie", "chargeur"] };
  const recoItems = n => { const d = UN[n], sp = d.s, L = RECI[d.cl].slice(); if (sp.pas === "goldkill") L.unshift("ticket"); if (sp.k === "summon" || sp.k === "transform") L.unshift("telecommande"); if (sp.stun && d.cl !== "mag") L.unshift("bouillotte"); if (d.c >= 4) L.splice(2, 0, "doudou"); return [...new Set(L)].slice(0, 3); };
  const TIPS = ["Garde 10, 20, 30… or : chaque dizaine rapporte +1 or par manche (5 max).", "Trois cartes identiques fusionnent en ★★. N'achète pas tout : vise des paires.", "Glisse une unité vers la boutique pour la vendre.", "Les Colosses devant, les Tireurs et les Mages au fond.", "Une série de défaites rapporte aussi de l'or : perdre tôt n'est pas grave.", "Le cadenas 🔒 garde ta boutique pour la manche suivante.", "Monte de niveau pour poser plus d'unités et voir des cartes plus rares.", "Touche une synergie à gauche pour voir ses paliers et ses unités.", "Deux unités identiques sur le plateau ne comptent qu'une fois pour les synergies."];
  const tokenHTML = (n, star, cost, extra, its) => `<div class="ar-tok c${cost} s${star} ${extra || ""} ${(extra === "pp" || extra === "mine") && artOf(n).own ? "own" + artOf(n).own : ""}"><div class="ar-hex" style="${bg(n)}"></div><span class="ar-st">${stars(star)}</span>${(extra === "pp" || extra === "ps") && UN[n] ? `<span class="ar-pp ${POSI[UN[n].cl][2]}">${POSI[UN[n].cl][0]}</span>` : ""}${its && its.length ? `<span class="ar-its">${its.map(id => `<i class="${isComp(id) ? "comp" : ""}">${ITEM[id].ic}</i>`).join("")}</span>` : ""}</div>`;
  const hexPos = (R, C) => `left:${((C + (R & 1) * .5) / 7.5 * 100).toFixed(3)}%;top:${(R * .75 / 6.25 * 100).toFixed(3)}%`;
  function open(api) {
    API = api; if (root) root.remove();
    root = document.createElement("div"); root.id = "arena"; document.body.appendChild(root); document.body.classList.add("ar-open");
    menu();
  }
  function close() { if (root) root.classList.remove("spec"); if (MP.room && G && G.mp) mpLeave(); else mpStop(); dragEnd(); muStop(); clearTimeout(UI.cine); stopLoop(); clearInterval(UI.timer); if (root) root.remove(); root = null; document.body.classList.remove("ar-open"); G = null; }
  function menu() {
    root.innerHTML = `<div class="ar-menu"><h1>⚔️ Wiki Arena</h1>
      <p>Recrute des cartes dans la boutique, place-les sur ton plateau et regarde-les se battre. Trois cartes identiques fusionnent en ★★, puis en ★★★. Réunis des cartes du même univers ou de la même classe pour activer des synergies. Dernier joueur en vie : victoire !</p>
      ${(() => { const sv = loadSave(); if (!sv || sv.mp) return ""; const r = sv.G.ri, st = r < 3 ? 1 : 2 + Math.floor((r - 3) / 7), k = r < 3 ? r + 1 : (r - 3) % 7 + 1; return `<div class="ar-box ar-resume"><h3>Partie en cours</h3><p>${sv.G.duo ? "Duo" : "Solo"} · manche ${st}-${k} · ❤️ ${Math.max(0, sv.G.players[sv.G.mei].hp)}</p><button class="ar-b big go" data-act="resume">▶ Reprendre</button></div>`; })()}
      <div class="ar-box"><h3>Solo contre 7 bots</h3>
        <div class="ar-diff"><span>Difficulté :</span>${[["facile", "Facile"], ["normal", "Normal"], ["difficile", "Difficile"], ["variable", "🎲 Variable"]].map(([k, l]) => `<button class="ar-b ${k === "normal" ? "on" : ""}" data-diff="${k}">${l}</button>`).join("")}</div><p class="ar-hint">Variable : chaque bot a sa propre difficulté, tirée au hasard.</p>
        <label class="ar-opt">Cartes <select id="ar-set"><option value="1">Set 1 (65 unités)</option><option value="2">Set 2 (65 unités)</option><option value="3">Set 3 (65 unités)</option><option value="4">Set 4 (65 unités)</option><option value="mix">Sets 1 et 2 mélangés</option><option value="alea">🎲 Set au hasard (1 à 4)</option></select></label>
        <label class="ar-opt">Mode <select id="ar-mode"><option value="solo">Chacun pour soi</option><option value="duo">Duo : toi et un bot contre 3 équipes</option></select></label>
        <label class="ar-opt">Événement <select id="ar-ev">${evOpts("")}</select></label>
        <button class="ar-b big go" data-act="start">Jouer en solo</button></div>
      <div class="ar-box"><h3>Multijoueur</h3><p>Jusqu'à 8 joueurs ; les places libres peuvent être tenues par des bots.</p><button class="ar-b big" data-act="multi">Jouer avec des amis</button></div>
      <div class="ar-row"><button class="ar-b" data-act="board">🏆 Classement</button>${API.admin ? `<button class="ar-b" data-act="stats">📊 Équilibrage</button>` : ""}<button class="ar-b" data-act="help">Règles</button><button class="ar-b" data-act="quit">Quitter</button></div></div>`;
    root.onclick = e => { const d = e.target.closest("[data-diff]"); if (d) { root.querySelectorAll("[data-diff]").forEach(b => b.classList.toggle("on", b === d)); return; }
      const a = e.target.closest("[data-act]"); if (!a) return; if (a.dataset.act === "quit") return close(); if (a.dataset.act === "help") return help(); if (a.dataset.act === "multi") return mpLobby(); if (a.dataset.act === "board") return boardScreen(); if (a.dataset.act === "stats") return statsScreen(); if (a.dataset.act === "resume") { const sv = loadSave(); if (sv && !sv.mp) { music("main"); restore(sv); startTimer(); } return; }
      if (a.dataset.act === "start") { music("main"); newGame((root.querySelector("[data-diff].on") || {}).dataset.diff || "normal", 0, { event: pickEvent(root.querySelector("#ar-ev").value), duo: root.querySelector("#ar-mode").value === "duo", set: pickSet(root.querySelector("#ar-set").value) }); build(); note("Cartes : " + SETN[G.set] + (G.event ? "" : " · pas d'événement")); { let seen = 1; try { seen = localStorage.getItem("wc-arena-tuto"); } catch (_) {} if (!seen && !G.event) tuto(); } if (G.event) evBanner(); } };
  }
  function help() {
    const m = document.createElement("div"); m.className = "ar-modal"; m.innerHTML = `<div class="ar-sheet"><h2>Règles</h2>
      <p><b>Boutique :</b> 5 cartes par manche. Acheter coûte le prix de la carte (1 à 5 or). Relancer coûte 2 or. Le cadenas garde ta boutique pour la manche suivante.</p>
      <p><b>Or :</b> tu gagnes 5 or par manche, +1 par tranche de 10 or gardés (intérêts, 5 max), +1 par victoire, et un bonus pour les séries de victoires ou de défaites.</p>
      <p><b>Niveau :</b> ton niveau fixe le nombre d'unités sur le plateau et la rareté des cartes en boutique. 4 or = 4 XP.</p>
      <p><b>Étoiles :</b> 3 cartes identiques fusionnent en ★★ (bien plus fortes), 3 ★★ en ★★★.</p>
      <p><b>Combat :</b> automatique. Les unités attaquent, gagnent du mana et lancent leur sort quand la barre bleue est pleine. Colosses, Bagarreurs et Assassins se battent au corps à corps ; Tireurs, Mages, Soutiens et Stratèges à distance.</p>
      <p><b>Jouer :</b> touche une unité pour la sélectionner et voir sa fiche, puis touche une case de ton plateau ou du banc pour la déplacer. « Vendre » la rend contre de l'or.</p>
      <p><b>Objets :</b> les monstres et les boss donnent des composants. Deux composants sur la même unité fusionnent. Le bouton « 📖 Objets » montre toutes les fusions ; l'aimant 🧲 récupère les objets d'une unité.</p>
      <p><b>Boss :</b> la dernière manche de chaque acte (💀) est un boss : un facile, deux moyens puis un boss final, différents à chaque partie. Sa fiche s'affiche pendant la préparation.</p>
      <p><b>Améliorations :</b> aux manches 2-1, 3-2 et 4-2, tu choisis un bonus parmi trois, valable jusqu'à la fin de la partie.</p>
      <p><b>Butin :</b> après les monstres et les boss, tu choisis un objet parmi trois.</p>
      <p><b>Fragments :</b> une partie d'au moins 10 manches rapporte des fragments. La victoire vaut 250 contre des bots faciles, 500 normaux, 750 difficiles, et 1000 s'il y a d'autres joueurs en face ; les autres places en touchent une part (68 %, 48 %, 36 %… ; en duo 60 %, 32 %, 16 %).</p>
      <p><b>Duo :</b> deux joueurs partagent les mêmes PV. Chacun mène son combat ; si tu gagnes le tien, tes survivants partent en renfort chez ton coéquipier. Tu peux aussi lui donner une unité par manche (bouton 🎁 sur sa fiche).</p>
      <p><b>Mort subite :</b> après 30 s de combat, les dégâts augmentent et les soins diminuent jusqu'à ce qu'un camp tombe.</p>
      <h3>Synergies</h3>${Object.keys(TR).filter(k => CLS[k] || k === "chat" && !CURT || SET.some(n => UN[n].o.includes(k))).map(k => `<p>${TICO(k)} <b>${TNAME(k)}</b> (${TRof(k).t.join(" / ")}) : ${TRof(k).t.map((t, i) => TRof(k).d(TRof(k).v[i])).slice(-1)[0].replace(/\d+(\.\d+)?/g, m => m)}</p>`).join("")}
      <button class="ar-b" data-act="tuto">🎓 Revoir le tutoriel</button>
      <p class="ar-hint">🎵 Musiques libres de droits : Infraction – No Copyright Music, MOKKA et Cold Cinema.</p>
      <button class="ar-b" data-x>Fermer</button></div>`;
    root.appendChild(m); m.onclick = e => { if (e.target === m || e.target.closest("[data-x]")) m.remove(); };
  }
  function build() { build0(); startTimer(); }
  function build0() {
    root.innerHTML = `<div class="ar-top"><span class="ar-me" id="ar-me"></span><div class="ar-stage"><div class="ar-stin"><span class="ar-round" id="ar-round"></span><span class="ar-timer" id="ar-timer"></span></div><i class="ar-tbar"><u id="ar-tbar"></u></i></div>
        <span class="ar-tools"><button class="ar-b mini" data-act="vol">🔊</button><button class="ar-b mini" data-act="speed" id="ar-speed">×1</button><button class="ar-b mini" data-act="help">?</button><button class="ar-b mini" data-act="quit">✕</button></span></div>
      <div class="ar-mid"><div class="ar-left"><h4 class="ar-h">Synergies</h4><div class="ar-traits" id="ar-traits"></div><div class="ar-info" id="ar-info"></div></div>
        <div class="ar-center"><div class="ar-boardw"><div class="ar-board" id="ar-board"><div class="ar-plate"><i></i><i></i><i></i><i></i></div><div class="ar-cells" id="ar-cells"></div><div class="ar-live" id="ar-live"></div><div class="ar-banner" id="ar-banner" hidden></div></div></div>
          <div class="ar-items" id="ar-items"></div><div class="ar-bench" id="ar-bench"></div></div>
        <div class="ar-right"><h4 class="ar-h">Joueurs</h4><div class="ar-players" id="ar-players"></div><h4 class="ar-h ar-hd">Dégâts du dernier combat</h4><div class="ar-dmg" id="ar-dmg"><span class="ar-hint">Le détail de tes unités s'affiche ici pendant les combats.</span></div></div></div>
      <div class="ar-vol" id="ar-vol" hidden><label>🎵 Musique <input type="range" min="0" max="100" step="1" value="${MU.vol}" data-vol="mu"><span>${MU.vol}</span></label><label>🔊 Bruitages <input type="range" min="0" max="100" step="1" value="${SF.vol}" data-vol="sf"><span>${SF.vol}</span></label></div>
      <div class="ar-shopbar" id="ar-shopbar"><div class="ar-eco" id="ar-eco"></div><div class="ar-shop" id="ar-shop"></div><div class="ar-side" id="ar-side"></div><div class="ar-sellz" id="ar-sellz">🪙 Lâche ici pour vendre</div></div>`;
    root.onclick = onClick; root.onpointerdown = dragDown;
    $("#ar-vol").oninput = e => { const t = e.target; if (t.dataset.vol === "mu") muVol(+t.value); else { sfVol(+t.value); sfx("buy"); } t.nextElementSibling.textContent = t.value; };
    drawAll();
  }
  function drawAll() { drawTop(); drawTraits(); drawBoard(); drawBench(); drawItems(); drawShop(); drawPlayers(); drawInfo(); }
  function drawTop() { const i = G.info, base = i.st === 1 ? 0 : 3 + (i.st - 2) * 7, n = i.st === 1 ? 3 : 7; let h = `<b class="ar-stg">${i.st}-${i.k}</b>`;
    for (let k = 0; k < n; k++) { const ri = base + k, inf = roundInfo(ri), d = G.hist[ri]; h += `<i class="ar-ri ${d === 1 ? "w" : d === 0 ? "l" : ""} ${ri === G.ri ? "cur" : ""}">${inf.boss ? "💀" : inf.pve >= 0 ? "🐾" : "⚔️"}</i>`; }
    $("#ar-round").innerHTML = h; $("#ar-me").innerHTML = `<span class="ar-av">${G.me.av}</span><span>❤️ <b>${Math.max(0, G.me.hp)}</b></span>${G.event ? `<button class="ar-evc" data-act="event">${EVENTS[G.event][0]} ${EVENTS[G.event][1]}</button>` : ""}${(G.me.aug || []).length ? `<button class="ar-evc aug" data-act="augs">${G.me.aug.map(k => AUG[k][0]).join("")}</button>` : ""}`; }
  function drawTraits() {
    const cnt = traitsOf(G.me.board, G.me.aug), keys = Object.keys(cnt).sort((a, b) => (tier(b, cnt[b]) - tier(a, cnt[a])) || cnt[b] - cnt[a]);
    $("#ar-traits").innerHTML = keys.map(k => { const ti = tier(k, cnt[k]), T = TRof(k);
      return `<button class="ar-tr ${ti >= 0 ? "on t" + Math.min(2, ti + (T.t.length < 3 ? 1 : 0)) : ""}" data-trait="${k}"><span class="ar-tri">${TICO(k)}</span><b>${cnt[k]}</b><span class="ar-trx"><strong>${TNAME(k)}</strong><em>${T.t.map((t, i) => `<i class="${i <= ti ? "ok" : ""}">${t}</i>`).join(" › ")}</em><small>${ti >= 0 ? T.d(T.v[ti]) : `Encore ${T.t[0] - cnt[k]} pour l'activer.`}</small></span></button>`; }).join("") || `<span class="ar-hint">Place des unités du même univers ou de la même classe pour activer des synergies.</span>`;
  }
  function drawBoard() {
    let h = ""; for (let R = 0; R < ROWS; R++) for (let C = 0; C < COLS; C++) { const mine = R >= 4, x = mine && (G.phase === "plan" || G.phase === "wait") ? G.me.board.find(u => 4 + u.r === R && u.c === C) : null;
      const rc = mine && UI.sel && G.phase === "plan" && RECO[UN[UI.sel.n].cl].includes(R - 4) && (!x || x === UI.sel);
      h += `<div class="ar-cell ${mine ? "mine" : "foe"} ${x && UI.sel === x ? "sel" : ""} ${rc ? "reco" : ""} ${x && UI.selItem != null ? "tgt" : ""}" style="${hexPos(R, C)}" ${mine ? `data-cell="${R - 4},${C}"` : ""}>${x ? tokenHTML(x.n, x.star, UN[x.n].c, "pp", x.it) : ""}</div>`; }
    if (G.phase === "plan") h += `<span class="ar-rowl f" style="top:${(4 * .75 / 6.25 * 100 + 9).toFixed(2)}%">▲ Devant</span><span class="ar-rowl m" style="top:${(5.5 * .75 / 6.25 * 100 + 9).toFixed(2)}%">◆ Milieu</span><span class="ar-rowl b" style="top:${(7 * .75 / 6.25 * 100 + 9).toFixed(2)}%">▼ Fond</span>`;
    $("#ar-cells").innerHTML = h; if (G.phase === "plan") $("#ar-live").innerHTML = "";
    const b = $("#ar-board"); b.classList.toggle("fight", G.phase === "fight");
  }
  function drawBench() { $("#ar-bench").innerHTML = G.me.bench.map((x, i) => `<div class="ar-slot ${x && UI.sel === x ? "sel" : ""}" data-bench="${i}">${x ? tokenHTML(x.n, x.star, UN[x.n].c, "pp", x.it) : ""}</div>`).join("") + `<span class="ar-cap">${G.me.board.length}/${cap(G.me)}</span>`; }
  function drawItems() { const p = G.me; $("#ar-items").innerHTML = `<button class="ar-it mag ${UI.selItem === "magnet" ? "sel" : ""}" data-item="magnet" title="Aimant">🧲</button>` + p.items.map((id, i) => `<button class="ar-it ${isComp(id) ? "comp" : "full"} ${UI.selItem === i ? "sel" : ""}" data-item="${i}">${ITEM[id].ic}</button>`).join("") + (p.items.length ? (p.items.filter(isComp).length >= 2 ? `<span class="ar-hint">Glisse un composant sur un autre pour les fusionner.</span>` : "") : `<span class="ar-hint">Tes objets arrivent ici : bats les monstres et les boss.</span>`) + `<button class="ar-b ar-guide" data-act="guide">📖 Objets</button>`; }
  const mateOf = p => G.duo ? G.players.find(q => q.team === p.team && q !== p) : null;
  // duo : donne une unité (avec ses objets) à son coéquipier, une fois par manche
  function gift(x) {
    const p = G.me, m = mateOf(p); if (!m || !m.alive || G.phase !== "plan") return; if (G.gifted === G.ri) { sfx("err"); return note("Un seul don par manche."); }
    if (!G.mp && m.bench.indexOf(null) < 0) { sfx("err"); return note("Le banc de " + m.name + " est plein."); }
    const bi = p.board.indexOf(x); if (bi >= 0) p.board.splice(bi, 1); else { const i = p.bench.indexOf(x); if (i < 0) return; p.bench[i] = null; } delete x.r; delete x.c; G.gifted = G.ri; UI.sel = null; UI.info = null;
    if (G.mp) { MP.gifts.push({ n: x.n, s: x.star, it: x.it || [] }); } else { m.bench[m.bench.indexOf(null)] = x; merge(m); }
    sfx("gold"); note(`🎁 ${artOf(x.n).nm} envoyé à ${m.name}.`); drawAll();
  }
  function receive(L) { const p = G.me; (L || []).forEach(g => { if (!UN[g.n]) return; const x = { n: g.n, star: g.s || 1, it: (g.it || []).filter(id => ITEM[id]) }; const i = p.bench.indexOf(null); if (i >= 0) { p.bench[i] = x; merge(p); note(`🎁 Tu reçois ${artOf(x.n).nm} !`); sfx("gold"); } else { p.gold += sellVal(x); p.items.push(...x.it); note(`🎁 Banc plein : ${artOf(x.n).nm} a été vendu.`); } }); }
  // fusionne deux composants directement dans l'inventaire, sans passer par une unité
  function craft(i, j) {
    const p = G.me, a = p.items[i], b = p.items[j]; UI.selItem = null; UI.info = null;
    if (i === j || !a || !b || !isComp(a) || !isComp(b)) return false; const f = FUS[[a, b].sort().join("+")];
    p.items = p.items.filter((_, k) => k !== i && k !== j); p.items.push(f); sfx("star"); note(`✨ ${ITEM[f].ic} ${ITEM[f].n} : ${ITEM[f].t}`); UI.info = { item: f }; drawAll(); return true;
  }
  // utilise l'objet sélectionné (ou l'aimant) sur l'unité x
  function useItem(sel, x) {
    const p = G.me; UI.selItem = null; UI.info = null;
    if (G.phase !== "plan" && p.board.includes(x)) { sfx("err"); note("Pas pendant le combat : cette unité est sur le plateau."); return drawAll(); }
    if (sel === "magnet") { if (!(x.it || []).length) { sfx("err"); note("Cette unité ne porte aucun objet."); } else { takeItems(p, x); sfx("sell"); note("🧲 Objets récupérés."); } return drawAll(); }
    const id = p.items[sel]; if (!id) return drawAll(); const r = equip(x, id);
    if (!r) { sfx("err"); note("3 objets maximum par unité."); } else { p.items.splice(sel, 1); if (r !== id) { sfx("star"); note(`✨ ${ITEM[r].ic} ${ITEM[r].n} : ${ITEM[r].t}`); } else sfx("place"); }
    drawAll();
  }
  const stTxt = st => Object.keys(st).map(k => ({ ad: v => `+${Math.round(v * 100)} % dégâts d'attaque`, as: v => `+${Math.round(v * 100)} % vitesse d'attaque`, sp: v => `+${Math.round(v * 100)} % puissance des sorts`, mana: v => `+${v} mana au départ`, ar: v => `+${v} armure`, mr: v => `+${v} résistance magique`, hp: v => `+${v} PV`, crit: v => `+${Math.round(v * 100)} % critique` })[k](st[k])).join(" · ");
  function itemHTML(id) { const I = ITEM[id];
    if (id === "magnet") return `<div class="ar-ibig">🧲</div><div class="ar-itx"><h3>Aimant</h3><p>Réutilisable à volonté : glisse-le (ou touche-le puis touche une unité) pour récupérer tous ses objets.</p><p class="ar-ipl">💡 Les objets fusionnés ne se séparent pas. Vendre une unité rend aussi ses objets.</p></div>`;
    if (isComp(id)) return `<div class="ar-ibig">${I.ic}</div><div class="ar-itx"><h3>${I.n} <small>composant</small></h3><p class="ar-ist">${stTxt(I.st)}</p><p>Deux composants fusionnent, sur une unité ou directement dans ta réserve (glisse l'un sur l'autre) :</p><div class="ar-rec">${CK.map(k => { const f = ITEM[FUS[[id, k].sort().join("+")]]; return `<p><span>${I.ic}+${COMP[k].ic}</span> <b>${f.ic} ${f.n}</b> : ${f.t}</p>`; }).join("")}</div></div>`;
    return `<div class="ar-ibig">${I.ic}</div><div class="ar-itx"><h3>${I.n} <small>${COMP[I.mk[0]].ic} + ${COMP[I.mk[1]].ic}</small></h3><p class="ar-ist">${stTxt(I.st)}</p><p><b>Effet :</b> ${I.t}</p><p class="ar-ipl">💡 <b>Conseil :</b> ${I.tip}</p></div>`; }
  function guide() {
    const m = document.createElement("div"); m.className = "ar-modal";
    m.innerHTML = `<div class="ar-sheet ar-gsheet"><h2>📖 Les objets</h2><p>Les monstres et les boss donnent des <b>composants</b>. Pose-en deux sur la même unité, ou glisse un composant sur un autre dans ta réserve : ils fusionnent en un objet complet, plus fort. Une unité porte 3 objets au maximum. L'<b>aimant 🧲</b> récupère les objets d'une unité, autant de fois que tu veux.</p>
      <h3>Composants</h3><div class="ar-gcomp">${CK.map(k => `<span>${COMP[k].ic} <b>${COMP[k].n}</b><small>${COMP[k].d}</small></span>`).join("")}</div>
      <h3>Tableau des fusions</h3><div class="ar-gtab"><i></i>${CK.map(k => `<i title="${COMP[k].n}">${COMP[k].ic}</i>`).join("")}${CK.map(a => `<i title="${COMP[a].n}">${COMP[a].ic}</i>` + CK.map(b => { const f = ITEM[FUS[[a, b].sort().join("+")]]; return `<button data-gi="${f.id}" title="${esc(f.n)}">${f.ic}</button>`; }).join("")).join("")}</div>
      <div class="ar-gone" id="ar-gone"><span class="ar-hint">Touche une case du tableau pour voir l'objet.</span></div>
      <h3>Les 36 objets</h3>${Object.values(ITEM).filter(I => I.mk).map(I => `<p class="ar-gl"><span>${COMP[I.mk[0]].ic}+${COMP[I.mk[1]].ic}</span> <b>${I.ic} ${I.n}</b> : ${I.t} <em>${I.tip}</em></p>`).join("")}
      <button class="ar-b" data-x>Fermer</button></div>`;
    root.appendChild(m); m.onclick = e => { const g = e.target.closest("[data-gi]"); if (g) { m.querySelector("#ar-gone").innerHTML = `<div class="ar-info open">${itemHTML(g.dataset.gi)}</div>`; return; } if (e.target === m || e.target.closest("[data-x]")) m.remove(); };
  }
  function scout(p) {
    if (EVT === "brouillard") { sfx("err"); return note("🌫️ Brouillard : impossible d'observer les autres équipes."); }
    const cnt = traitsOf(p.board, p.aug), act = Object.keys(cnt).filter(k => tier(k, cnt[k]) >= 0), m = document.createElement("div"); m.className = "ar-modal";
    let cells = ""; for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) { const x = p.board.find(u => u.r === r && u.c === c); cells += `<div class="ar-cell mine" style="${hexPos(r, c)}">${x ? tokenHTML(x.n, x.star, UN[x.n].c, "ps", x.it) : ""}</div>`; }
    m.innerHTML = `<div class="ar-sheet ar-scout"><h2>${p.av} ${esc(p.name)} <small>❤️ ${Math.max(0, p.hp)} · niveau ${p.lvl}${p.diff ? " · bot " + p.diff : ""}</small></h2><div class="ar-sboard">${cells}</div>
      <p class="ar-ctr">${act.map(k => `${TICO(k)} ${TNAME(k)} ${cnt[k]}`).join(" · ") || "Aucune synergie active."}</p>${(p.aug || []).length ? `<p class="ar-gl">Améliorations : ${p.aug.map(k => AUG[k][0] + " " + AUG[k][1]).join(" · ")}</p>` : ""}
      ${p.board.slice().sort((a, b) => UN[b.n].c * b.star - UN[a.n].c * a.star).map(x => `<p class="ar-gl"><b>${esc(artOf(x.n).nm)}</b> ${stars(x.star)} · ${TNAME(UN[x.n].cl)}${(x.it || []).length ? " · " + x.it.map(id => ITEM[id].ic + " " + ITEM[id].n).join(", ") : ""}</p>`).join("")}
      <button class="ar-b" data-x>Fermer</button></div>`;
    root.appendChild(m); m.onclick = e => { if (e.target === m || e.target.closest("[data-x]")) m.remove(); };
  }
  function bossHTML(n, small) { const B = BOSS[n]; return `<div class="ar-ipic c5" style="${bg(n)}"></div><div class="ar-itx"><h3>💀 ${esc(artOf(n).nm)} <small>boss ${["facile", "moyen", "final"][B.t - 1]}</small></h3><p><b>${esc(B.s.n)} :</b> ${B.d}</p><p class="ar-ipl">🎁 <b>Butin :</b> ${B.t === 3 ? "3 objets complets + 1 composant" : B.t + " objet" + (B.t > 1 ? "s complets" : " complet") + " + 2 composants"} et ${2 + B.t * 2} or si tu gagnes ; 1 composant sinon.</p></div>${small ? "" : `<div class="ar-ibtn"><button class="ar-b mini" data-act="closeinfo">✕</button></div>`}`; }
  function drawShop() {
    const p = G.me, off = G.phase === "over", it = Math.min(5, Math.floor(p.gold / 10));
    $("#ar-eco").innerHTML = `<div class="ar-lv"><b>Niveau ${p.lvl}</b><small>${p.lvl < 9 ? `${p.xp}/${XPN[p.lvl - 1]} XP` : "max"}</small><em><u style="width:${p.lvl < 9 ? p.xp / XPN[p.lvl - 1] * 100 : 100}%"></u></em></div>
      <button class="ar-big xp" data-act="xp" ${off || p.gold < xpCost() || p.lvl >= 9 ? "disabled" : ""}><span class="ar-bi">⬆️</span><span>Acheter XP</span><b>${xpCost()} 🪙</b></button>
      <button class="ar-big roll" data-act="roll" ${off || p.gold < rollCost() ? "disabled" : ""}><span class="ar-bi">🔄</span><span>Relancer</span><b>${rollCost()} 🪙</b></button>`;
    $("#ar-side").innerHTML = `<div class="ar-gold">🪙 <b>${p.gold}</b><small>${it ? `+${it} d'intérêts` : "10 or = +1 / manche"}</small></div>
      <button class="ar-big lock ${p.lock ? "on" : ""}" data-act="lock" ${off ? "disabled" : ""}><span class="ar-bi">${p.lock ? "🔒" : "🔓"}</span><span>${p.lock ? "Boutique gardée" : "Garder la boutique"}</span></button>
      <button class="ar-big go" data-act="ready" ${G.phase !== "plan" ? "disabled" : ""}><span class="ar-bi">⚔️</span><span>${G.mp ? (G.phase === "wait" ? "En attente…" : "Prêt") : "Combat"}</span></button>`;
    $("#ar-shop").innerHTML = p.shop.map((n, i) => { if (!n) return `<div class="ar-card empty"></div>`; const d = UN[n], a = artOf(n), have = owned(p).filter(x => x.n === n && x.star === 1).length;
      return `<button class="ar-card c${d.c} ${have >= 2 ? "up" : have ? "pair" : ""}" data-buy="${i}" ${off || p.gold < d.c ? "disabled" : ""} style="${bg(n)}"><span class="ar-cost">${d.c} 🪙</span><span class="ar-tags">${[...d.o, d.cl].map(k => `<i>${TICO(k)}<u> ${TNAME(k)}</u></i>`).join("")}</span><span class="ar-nm">${esc(a.nm)}</span><span class="ar-pos ${POSI[d.cl][2]}">${POSI[d.cl][0]} ${POSI[d.cl][1].split(" ·")[0]}</span><span class="ar-i" data-info="${esc(n)}">i</span>${have >= 2 ? `<span class="ar-up">★★ !</span>` : ""}</button>`; }).join("");
  }
  function drawPlayers() { $("#ar-players").innerHTML = G.players.slice().sort((a, b) => b.alive - a.alive || b.hp - a.hp || a.team - b.team || a.id - b.id).map(p => { const L = p.board.slice().sort((a, b) => UN[b.n].c * b.star - UN[a.n].c * a.star).slice(0, 9);
    const f = G.phase === "fight" && G.fights && G.fights.find(x => x.a === p || x.b === p), vs = f ? (f.a === p ? (f.b ? f.b.name : f.ghost ? "fantôme" : G.info.boss ? "boss" : "monstres") : f.a.name) : "";
    return `<div class="ar-pl ${p.alive ? "" : "dead"} ${p === G.me ? "me" : ""} ${f ? "can" : ""} ${f && !f.done ? "infight" : ""} ${f && f === UI.view ? "view" : ""} ${!f && p.alive && p !== G.me ? "can" : ""}" ${f ? `data-pl="${p.id}"` : p.alive && p !== G.me ? `data-scout="${p.id}"` : ""}><div class="ar-plh"><span class="ar-av">${p.av}</span><b>${G.duo ? `<span class="ar-tm t${p.team}">${p.team + 1}</span>` : ""}${esc(p.name)}${G.duo && p !== G.me && p.team === G.me.team ? " 🤝" : ""}</b><span>${p.alive ? "❤️ " + Math.max(0, p.hp) : "💀 " + p.place + "e"}</span></div>${p.alive ? `<div class="ar-pls"><small>${p.diff ? ({ facile: "🟢", normal: "🟡", difficile: "🔴" })[p.diff] + " " : ""}Niv. ${p.lvl}${Math.abs(p.streak) >= 2 ? (p.streak > 0 ? " · 🔥 " + p.streak : " · 🧊 " + -p.streak) : ""}${f ? ` · <span class="ar-plv ${f.done ? "done" : ""}">${f.done ? "✔️ fini" : "⚔️ en combat"} · ${esc(vs)}${f === UI.view ? " 👁" : ""}</span>` : ""}</small><span class="ar-plm">${(EVT === "brouillard" && p !== G.me ? [] : L).map(x => `<i class="c${UN[x.n].c} s${x.star}" style="${bg(x.n)}"></i>`).join("")}</span></div>` : ""}<i class="ar-plb" style="width:${Math.max(0, p.hp)}%"></i></div>`; }).join(""); }
  function drawDmg() { const S = UI.sim, box = root && $("#ar-dmg"); if (!S || !box) return; const L = S.units.filter(u => u.side === (UI.flip ? 1 : 0) && !u.sum && !u.mon).sort((a, b) => b.dealt - a.dealt), mx = Math.max(1, ...L.map(u => u.dealt));
    box.innerHTML = L.map(u => `<div class="ar-dr"><i class="ar-dp c${u.cost}" style="${bg(u.n)}"></i><div><span>${esc(artOf(u.n).nm)}</span><b>${Math.round(u.dealt)}</b><em><u style="width:${u.dealt / mx * 100}%"></u></em></div></div>`).join(""); }
  function statLine(n, star) { const d = UN[n], b = CB[d.cl], st = STAR[star - 1]; return `PV <b>${Math.round(HPB[d.c - 1] * b.hp * st)}</b> · Dégâts <b>${Math.round(ADB[d.c - 1] * b.ad * st)}</b> · Vitesse <b>${b.as}</b> · Portée <b>${b.rg === 1 ? "mêlée" : b.rg + " cases"}</b> · Armure <b>${b.ar}</b> · Mana <b>${d.s.m || b.m}</b>`; }
  function drawInfo() {
    const box = $("#ar-info"), x = UI.info; box.classList.toggle("open", !!x); box.classList.remove("mini");
    if (x && x.item != null) { box.innerHTML = itemHTML(x.item) + `<div class="ar-ibtn"><button class="ar-b mini" data-act="closeinfo">✕</button></div>`; return; }
    if (x && x.boss) { box.innerHTML = bossHTML(x.boss); return; }
    if (!x && G.info.boss && G.phase === "plan" && SMALL()) { box.classList.add("open", "mini"); box.innerHTML = `<span class="ar-pos in f">💀 Boss</span><b class="ar-mn">${esc(artOf(G.info.boss).nm)}</b><button class="ar-b" data-act="bossinfo">Voir sa fiche</button>`; return; }
    if (!x && G.info.boss && G.phase === "plan") { box.classList.add("open"); box.innerHTML = `<div class="ar-bossw">⚠️ Combat de boss</div>` + bossHTML(G.info.boss, true); return; }
    if (!x) { box.innerHTML = `<div class="ar-tip"><b>💡 Conseil</b><p>${TIPS[G.ri % TIPS.length]}</p><p class="ar-hint">Touche une unité ou le « i » d'une carte pour voir sa fiche. Glisse tes unités pour les placer.</p></div>`; return; }
    const d = UN[x.n], a = artOf(x.n);
    if (x.own && !x.full && SMALL()) { box.classList.add("mini"); box.innerHTML = `<span class="ar-pos in ${POSI[d.cl][2]}">${POSI[d.cl][0]} ${POSI[d.cl][1]}</span><b class="ar-mn">${esc(a.nm)} <small>${stars(x.star || 1)}</small></b><span class="ar-mt">${[...d.o, d.cl].map(TICO).join("")}</span><button class="ar-b" data-act="fullinfo">Fiche</button>${G.phase === "plan" || !G.me.board.includes(x.own) ? `<button class="ar-b" data-act="sell">+${sellVal(x.own)}🪙</button>` : ""}<button class="ar-b mini" data-act="closeinfo">✕</button>`; return; }
    box.innerHTML = `<div class="ar-ipic c${d.c}" style="${bg(x.n)}"></div><div class="ar-itx"><h3>${esc(a.nm)} <small>${stars(x.star || 1)} · ${d.c}🪙</small></h3>
      <p class="ar-itr">${d.o.map(k => `${TICO(k)} ${TNAME(k)}`).join(" · ")} · ${TICO(d.cl)} ${TNAME(d.cl)}</p><p class="ar-ist">${statLine(x.n, x.star || 1)}</p>
      <p><b>${esc(d.s.n)} :</b> ${esc(d.s.t)}</p><p class="ar-ipl"><span class="ar-pos in ${POSI[d.cl][2]}">${POSI[d.cl][0]} ${POSI[d.cl][1]}</span> <b>Placement :</b> ${PLACE[d.cl]}</p>
      <div class="ar-reci"><b>Objets conseillés :</b>${recoItems(x.n).map(id => `<button class="ar-rc" data-reci="${id}"><i>${ITEM[id].ic}</i><span>${ITEM[id].n}<small>${COMP[ITEM[id].mk[0]].ic} + ${COMP[ITEM[id].mk[1]].ic}</small></span></button>`).join("")}</div>${(x.its || x.own && x.own.it || []).length ? `<p class="ar-iith">Objets portés :</p>` : ""}${(x.its || x.own && x.own.it || []).map(id => `<p class="ar-iit"><i>${ITEM[id].ic}</i> <b>${ITEM[id].n}</b> : ${isComp(id) ? ITEM[id].d : ITEM[id].t}</p>`).join("")}</div><div class="ar-ibtn">${x.own && G.duo && G.phase === "plan" && mateOf(G.me).alive ? `<button class="ar-b" data-act="gift">🎁 Donner à ${esc(mateOf(G.me).name)}</button>` : ""}${x.own && (G.phase === "plan" || !G.me.board.includes(x.own)) ? `<button class="ar-b" data-act="sell">Vendre <small>+${sellVal(x.own)}🪙</small></button>` : ""}<button class="ar-b mini" data-act="closeinfo">✕</button></div>`;
  }
  // dépose l'unité s sur une case du plateau, un emplacement du banc ou la zone de vente
  function dropOn(s, tg) {
    const p = G.me, onB = p.board.includes(s);
    if (tg.sell) { sell(p, s); sfx("sell"); }
    else if (tg.cell) { const [r, c] = tg.cell, there = p.board.find(u => u.r === r && u.c === c); if (there === s) { UI.sel = null; UI.info = null; return drawAll(); }
      if (onB) { if (there) { there.r = s.r; there.c = s.c; } s.r = r; s.c = c; }
      else { const bi = p.bench.indexOf(s); if (there) { p.board.splice(p.board.indexOf(there), 1); p.bench[bi] = there; delete there.r; delete there.c; s.r = r; s.c = c; p.board.push(s); }
        else { if (p.board.length >= cap(p)) { sfx("err"); note(`Niveau ${p.lvl} : ${cap(p)} unité${cap(p) > 1 ? "s" : ""} max sur le plateau.`); UI.sel = null; UI.info = null; return drawAll(); } p.bench[bi] = null; s.r = r; s.c = c; p.board.push(s); } }
      sfx("place"); }
    else if (tg.bench != null) { const i = tg.bench, there = p.bench[i]; if (there === s) { UI.sel = null; UI.info = null; return drawAll(); }
      if (onB) { p.board.splice(p.board.indexOf(s), 1); if (there) { there.r = s.r; there.c = s.c; p.board.push(there); } delete s.r; delete s.c; p.bench[i] = s; }
      else { const bi = p.bench.indexOf(s); p.bench[bi] = there || null; p.bench[i] = s; }
      sfx("place"); }
    UI.sel = null; UI.info = null; drawAll();
  }
  /* ---------- choix en attente : butin ou amélioration ---------- */
  function showChoice() {
    if (!root || !G || G.phase === "over") return; const old = root.querySelector(".ar-choice"); if (old) old.remove(); const c = G.me.choices[0]; if (!c) return;
    const m = document.createElement("div"); m.className = "ar-modal ar-choice";
    m.innerHTML = `<div class="ar-sheet ar-chsheet"><h2>${c.t === "aug" ? "⭐ Choisis une amélioration" : "🎁 Choisis ton butin"}</h2><p class="ar-hint">${c.t === "aug" ? "Elle reste active jusqu'à la fin de la partie." : "Un objet au choix parmi trois."}${G.me.choices.length > 1 ? ` (encore ${G.me.choices.length - 1} choix ensuite)` : ""}</p>
      <div class="ar-chrow">${c.opts.map((id, i) => { const A = c.t === "aug" ? AUG[id] : null, I = A ? null : ITEM[id]; return `<button class="ar-chopt ${c.t}" data-pick="${i}"><i>${A ? A[0] : I.ic}</i><b>${A ? A[1] : I.n}</b><span>${A ? A[2] : isComp(id) ? I.d : I.t}</span>${I && !isComp(id) ? `<small>${stTxt(I.st)}</small><em>💡 ${I.tip}</em>` : I ? `<small>composant · se fusionne avec un autre</small>` : ""}</button>`; }).join("")}</div></div>`;
    root.appendChild(m); m.onclick = e => { const b = e.target.closest("[data-pick]"); if (!b) return; const r = choose(G.me, +b.dataset.pick); sfx(r && r.t === "aug" ? "lvl" : "buy"); m.remove(); drawAll(); saveGame(); showChoice(); };
  }
  function autoChoose() { let n = 0; while (G.me.choices.length) { choose(G.me, 0); n++; } const m = root && root.querySelector(".ar-choice"); if (m) m.remove(); if (n) note("Choix automatique : tu n'avais pas choisi à temps."); }
  /* ---------- sauvegarde : reprendre après une coupure ---------- */
  const SAVEK = "wc-arena-save";
  function saveGame() { if (!G || G.phase === "over" || typeof localStorage === "undefined") return; try { const o = Object.assign({}, G, { rng: undefined, me: undefined, fights: undefined, rs: G.rng.a, mei: G.me.id, phase: "plan" }); localStorage.setItem(SAVEK, JSON.stringify({ t: Date.now(), mp: !!G.mp, gid: G.mp ? MP.gid : null, uid: API && API.uid, G: o })); } catch (_) {} }
  function loadSave() { try { const o = JSON.parse(localStorage.getItem(SAVEK) || "null"); return o && o.G && Date.now() - o.t < 864e5 && (!API || !o.uid || o.uid === API.uid) ? o : null; } catch (_) { return null; } }
  function clearSave() { try { localStorage.removeItem(SAVEK); } catch (_) {} }
  function restore(sv) { G = sv.G; G.rng = rng32(G.rs); G.me = G.players[G.mei]; G.fights = null; G.phase = "plan"; EVT = G.event && EVENTS[G.event] ? G.event : null; SET = G.set === "mix" ? SETS[1].concat(SETS[2]) : SETS[G.set] || SETS[1]; CURT = G.set === 3 || G.set === 4 ? G.set : 0; G.players.forEach(p => { p.choices = p.choices || []; p.aug = p.aug || []; }); UI.sel = UI.info = UI.selItem = null; UI.sim = UI.view = null; build0(); }
  /* ---------- fin de partie : enregistrement, fragments ---------- */
  async function logGame() {
    if (!G || G.logged || !API || !API.rpc) return; G.logged = true; clearSave(); const L = (G.me.place === 1 ? G.me.board : G.lastBoard || []).slice(0, 12).map(x => ({ n: x.n, s: x.star, it: x.it || [] }));
    try { const r = await rpc("ar_log", { p: { mode: G.duo ? "duo" : "solo", set: String(G.set), mp: !!G.mp, diff: G.diff, humans: G.players.filter(q => !q.bot && q !== G.me && q.team !== G.me.team).length, event: G.event, place: G.duo ? Math.ceil(G.me.place / 2) : G.me.place, n: G.duo ? 4 : G.n, rounds: G.ri, board: L } });
      const el = root && root.querySelector("#ar-rew"); if (r && r.frag > 0 && API.addFrag) API.addFrag(r.frag);
      G.rewTxt = r && r.frag > 0 ? `+${r.frag} fragments ✦` : G.ri < 10 ? "Pas de fragments : il faut jouer au moins 10 manches." : "Pas de fragments : une seule partie récompensée toutes les 5 minutes."; const el2 = root && root.querySelector("#ar-rew"); if (el2) el2.textContent = G.rewTxt; if (false) el.textContent = r && r.frag > 0 ? `+${r.frag} fragments ✦` : G.ri < 10 ? "Pas de fragments : il faut jouer au moins 10 manches." : r && r.left === 0 ? "Plafond de fragments du jour atteint." : "Pas de fragments pour cette place."; } catch (_) {}
  }
  /* ---------- classement et statistiques ---------- */
  async function boardScreen() {
    root.innerHTML = `<div class="ar-menu"><h1>🏆 Classement</h1><div id="ar-lb"><p>Chargement…</p></div><div class="ar-row"><button class="ar-b" data-act="back">Retour</button></div></div>`; root.onclick = e => { if (e.target.closest("[data-act=back]")) menu(); };
    let d; try { d = await rpc("ar_board"); } catch (e) { return note(e.message); } const b = root.querySelector("#ar-lb"); if (!b) return;
    b.innerHTML = `<div class="ar-box"><h3>Joueurs</h3>${d.top.length ? `<div class="ar-tbl"><b>Joueur</b><b>🏆</b><b>Podiums</b><b>Parties</b>${d.top.map(x => `<span>${esc(API.name(x.u))}</span><span>${x.wins}</span><span>${x.top}</span><span>${x.games}</span>`).join("")}</div><p class="ar-hint">Seules les parties d'au moins 10 manches comptent. Podium : 4 premiers (2 premières équipes en duo).</p>` : `<p>Aucune partie enregistrée pour l'instant.</p>`}</div>
      <div class="ar-box"><h3>Mes dernières parties</h3>${d.fav ? `<p>Ton unité fétiche : <b>${esc(d.fav)}</b></p>` : ""}${d.mine.map(g => `<div class="ar-lrow"><b>${g.place === 1 ? "🏆 1re" : g.place + "e"}${g.mode === "duo" ? " (duo)" : ""}</b><span>${new Date(g.at).toLocaleDateString("fr-BE")} · ${g.mp ? "multijoueur" : "solo"} · set ${esc(g.set)} · ${g.rounds} manches${g.frag ? ` · +${g.frag} ✦` : ""}</span><span class="ar-plm">${(g.board || []).slice(0, 8).map(x => UN[x.n] ? `<i class="c${UN[x.n].c}" style="${bg(x.n)}"></i>` : "").join("")}</span></div>`).join("") || `<p>Tu n'as pas encore terminé de partie.</p>`}</div>`;
  }
  async function statsScreen() {
    root.innerHTML = `<div class="ar-menu"><h1>📊 Équilibrage</h1><div id="ar-lb"><p>Chargement…</p></div><div class="ar-row"><button class="ar-b" data-act="back">Retour</button></div></div>`; root.onclick = e => { if (e.target.closest("[data-act=back]")) menu(); };
    let d; try { d = await rpc("ar_stats"); } catch (e) { return note(e.message); } const b = root.querySelector("#ar-lb"); if (!b) return;
    const tbl = (L, nm) => L.length ? `<div class="ar-tbl t4"><b>Nom</b><b>Parties</b><b>Place moy.</b><b>🏆</b>${L.map(x => `<span>${esc(nm(x.n))}</span><span>${x.games}</span><span>${x.place}</span><span>${x.wins == null ? "" : x.wins}</span>`).join("")}</div>` : `<p>Pas encore de données.</p>`;
    b.innerHTML = `<p>${d.games} partie${d.games > 1 ? "s" : ""} d'au moins 10 manches. Les unités et objets comptés sont ceux du plateau final. Une place moyenne basse signifie « souvent bien classé ».</p><div class="ar-box"><h3>Unités</h3>${tbl(d.units, n => n)}</div><div class="ar-box"><h3>Objets</h3>${tbl(d.items, n => ITEM[n] ? ITEM[n].ic + " " + ITEM[n].n : n)}</div>`;
  }
  /* ---------- tutoriel guidé ---------- */
  const TUTO = [
    ["#ar-shop", "La boutique", "Cinq cartes par manche. Touche une carte pour l'acheter. Le bandeau du haut indique où la placer (Devant, Milieu, Fond), et le « i » ouvre sa fiche."],
    ["#ar-eco", "Niveau et relance", "« Acheter XP » fait monter ton niveau : plus d'unités sur le plateau et des cartes plus rares. « Relancer » change la boutique."],
    ["#ar-side", "Or et combat", "Garde 10, 20, 30… or pour toucher des intérêts à chaque manche. Le bouton vert lance le combat sans attendre la fin du chrono."],
    ["#ar-bench", "Le banc", "Tes unités achetées arrivent ici. Glisse-les sur le plateau. Trois cartes identiques fusionnent en ★★, puis en ★★★."],
    ["#ar-board", "Le plateau", "Ton camp est en bas. Quand tu portes une unité, les cases conseillées s'allument. Les Colosses devant, les Tireurs et les Mages au fond."],
    ["#ar-traits", "Les synergies", "Réunis des unités du même univers ou de la même classe pour activer des bonus. Touche une synergie pour voir ses paliers."],
    ["#ar-items", "Les objets", "Les monstres et les boss donnent des composants. Glisse-en un sur une unité, ou un composant sur un autre pour les fusionner. L'aimant 🧲 les récupère."],
    ["#ar-players", "Les autres joueurs", "Touche un joueur pour observer son équipe. Pendant les combats, touche-le pour regarder son combat. Le dernier en vie gagne !"],
  ];
  function tuto() {
    if (!root || !G) return; clearInterval(UI.timer); let i = 0; const ov = document.createElement("div"); ov.className = "ar-tuto"; ov.innerHTML = `<div class="ar-tring"></div><div class="ar-tbub"></div>`; root.appendChild(ov);
    const show = () => { const st = TUTO[i], el = root.querySelector(st[0]); if (!el) return next(); const r = el.getBoundingClientRect(), ring = ov.firstChild, bub = ov.lastChild;
      ring.style.cssText = `left:${r.left - 5}px;top:${r.top - 5}px;width:${r.width + 10}px;height:${r.height + 10}px`;
      bub.innerHTML = `<b>${i + 1}/${TUTO.length} · ${st[1]}</b><p>${st[2]}</p><div><button class="ar-b" data-tskip>Passer</button><button class="ar-b go" data-tnext>${i === TUTO.length - 1 ? "C'est parti" : "Suivant"}</button></div>`;
      const below = r.top < innerHeight / 2; bub.style.cssText = `left:${Math.max(8, Math.min(innerWidth - 328, r.left + r.width / 2 - 160))}px;${below ? `top:${Math.min(innerHeight - 190, r.bottom + 14)}px` : `bottom:${Math.min(innerHeight - 190, innerHeight - r.top + 14)}px`}`; };
    const end = () => { ov.remove(); try { localStorage.setItem("wc-arena-tuto", "1"); } catch (_) {} if (G && G.phase === "plan") { startTimer(); } };
    const next = () => { i++; if (i >= TUTO.length) return end(); show(); };
    ov.onclick = e => { e.stopPropagation(); if (e.target.closest("[data-tskip]")) return end(); if (e.target.closest("[data-tnext]")) return next(); }; show();
  }
  /* ---------- glisser-déposer ---------- */
  const unitAt = el => { if (!el || !G || !el.closest) return null; const c = el.closest("[data-cell]"), b = el.closest("[data-bench]"); if (c) { const [r, k] = c.dataset.cell.split(",").map(Number); return G.me.board.find(u => u.r === r && u.c === k) || null; } if (b) return G.me.bench[+b.dataset.bench] || null; return null; };
  const DG = { x: null };
  function dragDown(e) {
    if (!G || G.phase === "over" || e.button > 0) return; const ib = e.target.closest("[data-item]");
    if (ib) { DG.item = ib.dataset.item === "magnet" ? "magnet" : +ib.dataset.item; DG.x = null; }
    else { if (!e.target.closest(".ar-tok")) return; const x = unitAt(e.target); if (!x || G.phase !== "plan" && G.me.board.includes(x)) return; DG.x = x; DG.item = null; }
    DG.sx = e.clientX; DG.sy = e.clientY; DG.on = false; DG.id = e.pointerId;
    document.addEventListener("pointermove", dragMove); document.addEventListener("pointerup", dragUp); document.addEventListener("pointercancel", dragEnd);
  }
  function dragMove(e) {
    if (DG.x == null && DG.item == null || e.pointerId !== DG.id) return;
    if (!DG.on) { if (Math.hypot(e.clientX - DG.sx, e.clientY - DG.sy) < 7) return; DG.on = true; sfx("pick"); const g = DG.g = document.createElement("div");
      if (DG.x) { UI.selItem = null; UI.sel = DG.x; UI.info = SMALL() ? null : { n: DG.x.n, star: DG.x.star, own: DG.x }; drawAll(); root.classList.add("dragging"); $("#ar-sellz").textContent = `🪙 Lâche ici pour vendre (+${sellVal(DG.x)} or)`;
        const src = root.querySelector(".ar-cell.sel .ar-tok, .ar-slot.sel .ar-tok"), w = src ? src.getBoundingClientRect().width : 64; g.className = "ar-ghost"; g.style.width = w + "px"; g.innerHTML = tokenHTML(DG.x.n, DG.x.star, UN[DG.x.n].c, "", DG.x.it); }
      else { UI.sel = null; UI.selItem = DG.item; UI.info = SMALL() ? null : { item: DG.item === "magnet" ? "magnet" : G.me.items[DG.item] }; drawAll(); root.classList.add("dragitem"); g.className = "ar-ghost item"; g.textContent = DG.item === "magnet" ? "🧲" : ITEM[G.me.items[DG.item]].ic; }
      document.body.appendChild(g); }
    e.preventDefault(); DG.g.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-60%) scale(1.15)`;
    const el = document.elementFromPoint(e.clientX, e.clientY), t = el && (el.closest("[data-cell]") || el.closest("[data-bench]") || DG.x && el.closest("#ar-shopbar") || DG.item != null && el.closest("[data-item]"));
    if (t !== DG.over) { if (DG.over) DG.over.classList.remove("over"); DG.over = t || null; if (t) t.classList.add("over"); }
  }
  function dragUp(e) {
    if (DG.x == null && DG.item == null || e.pointerId !== DG.id) return; const x = DG.x, it = DG.item, was = DG.on; dragEnd(); if (!was) return;
    UI.noClick = Date.now(); const el = document.elementFromPoint(e.clientX, e.clientY), c = G.phase === "plan" && el && el.closest("[data-cell]"), b = el && el.closest("[data-bench]");
    if (it != null) { const ob = el && el.closest("[data-item]"); if (ob && typeof it === "number" && ob.dataset.item !== "magnet" && +ob.dataset.item !== it) { if (!craft(it, +ob.dataset.item)) { sfx("err"); note("Seuls deux composants peuvent fusionner."); drawAll(); } return; }
      const u = unitAt(c || b); if (u) return useItem(it, u); UI.selItem = null; UI.info = null; return drawAll(); }
    if (c) dropOn(x, { cell: c.dataset.cell.split(",").map(Number) }); else if (b) dropOn(x, { bench: +b.dataset.bench }); else if (el && el.closest("#ar-shopbar")) dropOn(x, { sell: 1 }); else { UI.sel = null; UI.info = null; drawAll(); }
  }
  function dragEnd() { document.removeEventListener("pointermove", dragMove); document.removeEventListener("pointerup", dragUp); document.removeEventListener("pointercancel", dragEnd); if (DG.g) DG.g.remove(); if (DG.over) DG.over.classList.remove("over"); DG.g = DG.over = DG.x = DG.item = null; DG.on = false; if (root) root.classList.remove("dragging", "dragitem"); }
  function note(t) { if (!root) return; const o = root.querySelector(".ar-toast"); if (o) o.remove(); const d = document.createElement("div"); d.className = "ar-toast"; d.textContent = t; root.appendChild(d); setTimeout(() => d.remove(), 3200); }
  function onClick(e) {
    const t = e.target; if (UI.noClick && Date.now() - UI.noClick < 200) return;
    const inf = t.closest("[data-info]"); if (inf) { e.stopPropagation(); UI.info = { n: inf.dataset.info, star: 1 }; return drawInfo(); }
    const act = t.closest("[data-act]"); if (act && !act.disabled) return doAct(act.dataset.act);
    const tr = t.closest("[data-trait]"); if (tr) return traitPop(tr.dataset.trait);
    const rc = t.closest("[data-reci]"); if (rc) { const I = ITEM[rc.dataset.reci], m = document.createElement("div"); m.className = "ar-modal"; m.innerHTML = `<div class="ar-sheet"><div class="ar-info open" style="position:static;margin:0;border:0">${itemHTML(I.id)}</div><p class="ar-hint">Pour le fabriquer : pose ${COMP[I.mk[0]].ic} ${COMP[I.mk[0]].n} et ${COMP[I.mk[1]].ic} ${COMP[I.mk[1]].n} sur la même unité.</p><button class="ar-b" data-x>Fermer</button></div>`; root.appendChild(m); m.onclick = ev => { if (ev.target === m || ev.target.closest("[data-x]")) m.remove(); }; return; }
    const itb = t.closest("[data-item]"); if (itb && G && G.phase !== "over") { const k = itb.dataset.item === "magnet" ? "magnet" : +itb.dataset.item; if (typeof k === "number" && typeof UI.selItem === "number" && UI.selItem !== k && isComp(G.me.items[k]) && isComp(G.me.items[UI.selItem])) return craft(UI.selItem, k); UI.sel = null; UI.selItem = UI.selItem === k ? null : k; UI.info = UI.selItem == null ? null : { item: k === "magnet" ? "magnet" : G.me.items[k] }; if (UI.selItem != null) sfx("pick"); return drawAll(); }
    const sc = t.closest("[data-scout]"); if (sc && G && !G.fights) return scout(G.players[+sc.dataset.scout]);
    const pl = t.closest("[data-pl]"); if (pl && G && G.fights) { const q = G.players[+pl.dataset.pl], f = G.fights.find(x => x.a === q || x.b === q); if (f && f !== UI.view) { if (EVT === "brouillard" && f !== UI.fight) { sfx("err"); note("🌫️ Brouillard : impossible de regarder les autres combats."); return; } sfx("pick"); watch(f); } return; }
    if (!G || G.phase === "over") return;
    const b = t.closest("[data-buy]"); if (b && !b.disabled) { const r = buy(G.me, +b.dataset.buy); sfx(typeof r === "string" ? "err" : r ? "star" : "buy"); if (typeof r === "string") { if (r !== "vide") note(r); } else if (r) note(`✨ ${artOf(r[0].n).nm} passe ${stars(r[0].star)} !`); UI.sel = null; return drawAll(); }
    const fighting = G.phase !== "plan";
    if (fighting) { const tk = t.closest("[data-uid]"); if (tk && UI.sim) { const u = UI.sim.units[+tk.dataset.uid]; if (u && UN[u.n]) { UI.sel = null; UI.info = { n: u.n, star: u.star, its: u.items }; drawInfo(); } else if (u && u.boss) { UI.info = { boss: u.n }; drawInfo(); } return; } }
    const cell = fighting ? null : t.closest("[data-cell]"), slot = t.closest("[data-bench]"), p = G.me;
    if (cell || slot) { const there = cell ? p.board.find(u => u.r + "," + u.c === cell.dataset.cell) : p.bench[+slot.dataset.bench];
      if (UI.selItem != null) { if (there) return useItem(UI.selItem, there); UI.selItem = null; UI.info = null; return drawAll(); }
      if (UI.sel && UI.sel !== there) return dropOn(UI.sel, cell ? { cell: cell.dataset.cell.split(",").map(Number) } : { bench: +slot.dataset.bench });
      if (there) { UI.sel = UI.sel === there ? null : there; UI.info = UI.sel ? { n: there.n, star: there.star, own: there } : null; if (UI.sel) sfx("pick"); }
      return drawAll(); }
  }
  function doAct(a) {
    const p = G && G.me;
    if (a === "quit") { if (!G || G.phase === "over" || confirm(G.mp ? "Quitter la partie ? Les autres continueront sans toi." : "Quitter la partie en cours ?")) close(); return; }
    if (a === "help") return help();
    if (a === "vol") { const v = $("#ar-vol"); if (v) v.hidden = !v.hidden; return; }
    if (a === "skip") return cineEnd();
    if (a === "myfight") { if (G && G.fights && UI.fight) watch(UI.fight); return; }
    if (a === "again") { root.classList.remove("spec"); clearInterval(UI.timer); clearTimeout(UI.cine); stopLoop(); music(null); if (G && G.mp) { const others = G.players.some(q => q.alive && !q.bot && q !== G.me) && !G.winner && G.me.place !== 1, gid = MP.gid; G = null; if (!others) rpc("ar_end", { p_room: MP.room }).catch(() => {}); mpRoom(); MP.deadGid = others ? gid : null; return; } return menu(); }
    if (a === "closeinfo") { UI.info = null; UI.sel = null; UI.selItem = null; return drawAll(); }
    if (a === "guide") return guide();
    if (a === "bossinfo") { if (G && G.info.boss) { UI.sel = null; UI.info = { boss: G.info.boss }; drawInfo(); } return; }
    if (a === "spec") return specStart();
    if (a === "fullinfo") { if (UI.info) { UI.info.full = true; drawInfo(); } return; }
    if (a === "event") return evBanner();
    if (a === "augs") { const m = document.createElement("div"); m.className = "ar-modal"; m.innerHTML = `<div class="ar-sheet"><h2>Tes améliorations</h2>${G.me.aug.map(k => `<p>${AUG[k][0]} <b>${AUG[k][1]}</b> : ${AUG[k][2]}</p>`).join("")}<button class="ar-b" data-x>Fermer</button></div>`; root.appendChild(m); m.onclick = e => { if (e.target === m || e.target.closest("[data-x]")) m.remove(); }; return; }
    if (a === "tuto") { root.querySelectorAll(".ar-modal").forEach(m => m.remove()); if (G && G.phase === "plan") tuto(); else note("Le tutoriel se lance pendant la préparation d'une partie."); return; }
    if (a === "resume") { const sv = loadSave(); if (sv && !sv.mp) { music("main"); restore(sv); startTimer(); } return; }
    if (a === "gift") { if (UI.info && UI.info.own) gift(UI.info.own); return; }
    if (a === "speed") { UI.speed = UI.speed === 1 ? 2 : UI.speed === 2 ? 4 : 1; $("#ar-speed").textContent = "×" + UI.speed; if (UI.loop) { stopLoop(); runLoop(); } return; }
    if (a === "ready") { if (G.phase === "plan") fight(); return; }
    if (a === "sell" && G.phase !== "plan" && UI.info && UI.info.own && p.board.includes(UI.info.own)) return;
    if (a === "xp") { const l = p.lvl; buyXp(p); sfx(p.lvl > l ? "lvl" : "xp"); } else if (a === "roll") { reroll(p); sfx("roll"); } else if (a === "lock") { p.lock = !p.lock; sfx("lock"); }
    else if (a === "sell" && UI.info && UI.info.own) { sfx("sell"); sell(p, UI.info.own); UI.info = null; UI.sel = null; }
    drawAll();
  }
  function traitPop(k) {
    const cnt = traitsOf(G.me.board, G.me.aug)[k] || 0, ti = tier(k, cnt), m = document.createElement("div"); m.className = "ar-modal";
    m.innerHTML = `<div class="ar-sheet"><h2>${TICO(k)} ${TNAME(k)} <small>${cnt} sur le plateau</small></h2>${TRof(k).t.map((t, i) => `<p class="${i === ti ? "ar-on" : ""}"><b>${t}</b> : ${TRof(k).d(TRof(k).v[i])}</p>`).join("")}
      <p class="ar-hint">Unités : ${SET.filter(n => UN[n].o.includes(k) || UN[n].cl === k).map(n => `${esc(n)} (${UN[n].c})`).join(", ")}</p><button class="ar-b" data-x>Fermer</button></div>`;
    root.appendChild(m); m.onclick = e => { if (e.target === m || e.target.closest("[data-x]")) m.remove(); };
  }
  function startTimer() { if (G.spec) return specWait(); saveGame(); if (G.msg) { note(G.msg); G.msg = null; } showChoice(); muPrep(G.info.boss ? "boss" + BOSS[G.info.boss].t : G.info.pve >= 0 ? null : "pvp"); clearInterval(UI.timer); UI.tleft = UI.ttot = G.ri < 3 ? 25 : 40; const tick = () => { if (!root || !G || G.phase !== "plan") return clearInterval(UI.timer); $("#ar-timer").textContent = "⏳ " + UI.tleft; $("#ar-tbar").style.width = UI.tleft / UI.ttot * 100 + "%"; if (UI.tleft <= 5 && UI.tleft > 0) sfx("tick"); if (UI.tleft-- <= 0) { clearInterval(UI.timer); fight(); } }; tick(); UI.timer = setInterval(tick, 1000); }
  /* ---------- combat affiché ---------- */
  // plateau incomplet : on complète avec le banc
  function fillBoard(p) {
    while (p.board.length < cap(p) && p.bench.some(Boolean)) { const i = p.bench.findIndex(x => x && !p.board.some(b => b.n === x.n)); const j = i >= 0 ? i : p.bench.findIndex(Boolean); const x = p.bench[j]; p.bench[j] = null; let r = 0, c = 3, k = 0; while (p.board.some(b => b.r === r && b.c === c)) { k++; c = [3, 2, 4, 1, 5, 0, 6][k % 7]; r = Math.floor(k / 7); } x.r = r; x.c = c; p.board.push(x); }
  }
  function fight() { if (!G || G.phase !== "plan") return; if (root.querySelector(".ar-tuto")) return; autoChoose(); if (G.mp) return mpReady(); startFight(); }
  function startFight() {
    clearInterval(UI.timer); if (G.phase !== "plan") return; dragEnd(); sfx("go"); if (G.me.alive) fillBoard(G.me);
    G.phase = "fight"; UI.sel = null; UI.info = null; UI.selItem = null;
    const f = prepareFights() || G.fights[0]; UI.fight = f; G.fights.forEach(x => { x.S = simInit(x.A, x.B, x.seed); x.done = false; });
    drawAll(); $("#ar-tbar").style.width = "0%"; watch(f);
    music(G.info.boss ? "boss" + BOSS[G.info.boss].t : f.b || f.ghost ? "pvp" : "main"); runLoop();
    if (G.info.boss) { const b = $("#ar-banner"); b.hidden = false; b.className = "ar-banner bossb"; b.innerHTML = `💀 ${esc(artOf(G.info.boss).nm)}<small>${esc(BOSS[G.info.boss].s.n)}</small>`; setTimeout(() => { if (root && b.classList.contains("bossb")) b.hidden = true; }, 1800); }
  }
  const foeName = f => f.b ? f.b.name : f.ghost ? "le fantôme de " + f.ghost.name : G.info.boss ? artOf(G.info.boss).nm : "les monstres";
  // affiche le combat f (le sien ou celui d'un autre joueur)
  function watch(f) {
    UI.view = f; UI.sim = f.S; UI.flip = f.b === G.me; UI.tok = {}; $("#ar-live").innerHTML = ""; $("#ar-cells").querySelectorAll(".ar-tok").forEach(x => x.remove());
    f.S.units.forEach(u => { if (u.alive) addTok(u); });
    $("#ar-timer").textContent = f === UI.fight && !G.spec ? "contre " + (f.b === G.me ? f.a.name : foeName(f)) : `👁 ${f.a.name} contre ${foeName(f)}`;
    let v = $("#ar-view"); if (f !== UI.fight || G.spec) { if (!v) { v = document.createElement("div"); v.id = "ar-view"; v.className = "ar-view"; $("#ar-board").appendChild(v); }
      v.innerHTML = `<span>👁 ${esc(f.a.name)} · ${esc(foeName(f))}</span>${G.spec ? "" : `<button class="ar-b" data-act="myfight">↩ mon combat</button>`}`; } else if (v) v.remove();
    drawPlayers(); drawDmg();
  }
  // si je suis le camp du haut dans la simulation, on retourne l'affichage pour que mon équipe reste en bas
  const VP = (R, C) => UI.flip ? hexPos(7 - R, 6 - C) : hexPos(R, C), VS = sd => UI.flip ? 1 - sd : sd;
  function addTok(u) { const el = document.createElement("div"); el.className = `ar-u side${VS(u.side)} c${u.cost} ${u.mon ? "mon" : ""} ${u.boss ? "boss" : ""}`; el.dataset.uid = u.uid; el.style.cssText = VP(u.R, u.C);
    el.innerHTML = `<div class="ar-bars"><i class="hp"></i><i class="mp"></i></div>${tokenHTML(u.mon ? u.art : u.n, u.star, u.cost, UI.view && !u.mon && (u.side === 0 ? UI.view.a : UI.view.b) === G.me ? "mine" : "", u.items)}`; $("#ar-live").appendChild(el); UI.tok[u.uid] = el; }
  function runLoop() { UI.loop = setInterval(tickFight, 100 / UI.speed); }
  function stopLoop() { clearInterval(UI.loop); UI.loop = null; }
  function fx(cls, R, C, txt, ms) { const el = document.createElement("div"); el.className = "ar-fx " + cls; el.style.cssText = VP(R, C); if (txt != null) el.textContent = txt; $("#ar-live").appendChild(el); setTimeout(() => el.remove(), ms || 700); return el; }
  function tickFight() {
    if (!root || !G || !G.fights) return stopLoop();
    const ended = roundTick(); G.fights.forEach(f => { if (f === UI.view) showEvents(f.S); f.S.ev.length = 0; });
    for (const f of ended) { const S = f.S; { f.done = true; const g0 = G.me.gold; resolveFight(f, S);
        if (f === UI.fight && !G.spec) { G.hist[G.ri] = f.res.w ? 1 : 0; sfx(f.res.w ? "win" : "lose"); const b = $("#ar-banner"); b.hidden = false; b.className = "ar-banner " + (f.res.w ? "win" : "lose");
          b.innerHTML = (f.res.w ? `Victoire !<small>+${G.me.gold - g0} 🪙</small>` : `Défaite<small>−${f.res.d} PV</small>`) + (f.res.it && f.res.it.length || f.res.pick ? `<small class="ar-loot">Butin : ${(f.res.it || []).map(id => ITEM[id].ic).join(" ")}${f.res.pick ? " + 1 au choix 🎁" : ""}</small>` : "") + "";
          setTimeout(() => { if (root) $("#ar-banner").hidden = true; }, 1500); drawTop(); drawShop(); drawItems();
          if (G.duo) { const mate = G.players.find(q => q.team === G.me.team && q !== G.me), pf = mate && G.fights.find(x => x !== f && !x.done && (x.a === mate || x.b === mate)); if (pf) { setTimeout(() => { if (root && G && G.fights && !pf.done && UI.view === f) watch(pf); }, 1300); } } }
        drawPlayers(); } }
    const S = UI.sim; if (S) { if (Math.round(S.t * 10) % 5 === 0) drawDmg();
      for (const u of S.units) { const el = UI.tok[u.uid]; if (!el || !u.alive) continue; { const R = UI.flip ? 7 - u.R : u.R, C = UI.flip ? 6 - u.C : u.C; el.style.left = ((C + (R & 1) * .5) / 7.5 * 100) + "%"; el.style.top = (R * .75 / 6.25 * 100) + "%"; }
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
      else if (e.k === "rein") { fx("sudden", UI.flip ? 4 : 3.5, 3, "🤝 Renforts de " + e.n + " !", 1800); sfx("lvl"); }
      else if (e.k === "sudden") { fx("sudden", UI.flip ? 4 : 3.5, 3, "⚡ Mort subite !", 1800); sfx("go"); }
      else if (e.k === "zone") { const z = fx("zone side" + VS(e.side), e.R, e.C, null, 500); z.style.setProperty("--zr", e.r); }
      else if (e.k === "flash") { const v = document.createElement("div"); v.className = "ar-flashv"; $("#ar-board").appendChild(v); setTimeout(() => v.remove(), 420); }
      else if (e.k === "atk" || e.k === "shot") { const a = S.units[e.a], b = S.units[e.b], ea = UI.tok[e.a]; if (!a || !b) continue;
        if (e.k === "atk" && ea) { { const k = UI.flip ? -30 : 30; ea.style.setProperty("--lx", ((b.C + (b.R & 1) * .5) - (a.C + (a.R & 1) * .5)) * k + "%"); ea.style.setProperty("--ly", (b.R - a.R) * k + "%"); } ea.classList.remove("lunge"); void ea.offsetWidth; ea.classList.add("lunge"); }
        else if (e.k === "shot") { const s = fx("shot side" + VS(a.side), a.R, a.C, null, 260); requestAnimationFrame(() => { s.style.cssText = VP(b.R, b.C); }); } }
      else if (e.k === "beam") { const a = S.units[e.a]; if (a) { const z = fx("beam side" + VS(a.side), a.R, a.C, null, 450); z.style.setProperty("--ang", Math.atan2(e.dy * .75 * 1.1547, e.dx) + (UI.flip ? Math.PI : 0) + "rad"); } }
    }
  }
  function endRound() {
    if (!root || !G) return; const v = $("#ar-view"); if (v) v.remove(); $("#ar-banner").hidden = true; UI.sim = UI.view = null; G.fights = null; dragEnd(); UI.sel = null; UI.info = null;
    roundEnd(); if (G.phase === "over") return over(); if (G.spec) return specWait(); music("main"); drawAll(); startTimer();
  }
  const fmt = n => Math.round(n).toLocaleString("fr-FR");
  function over() {
    if (G.spec) { music(null); const m = document.createElement("div"); m.className = "ar-modal"; m.innerHTML = `<div class="ar-sheet ar-over"><h2>🏁 Partie terminée</h2><p>${G.winner ? "Victoire de <b>" + esc(G.winner) + "</b> !" : "Plus personne en vie."}</p><div class="ar-row"><button class="ar-b go" data-act="again">Retour au salon</button><button class="ar-b" data-act="quit">Quitter</button></div></div>`; root.appendChild(m); return; }
    logGame(); let pl = G.me.place; if (pl === 1) return cine(); if (G.duo) pl = Math.ceil(pl / 2);
    music(null); sfx("lose"); const m = document.createElement("div"); m.className = "ar-modal"; const L = G.lastBoard || [];
    m.innerHTML = `<div class="ar-sheet ar-over"><h2>${pl <= 4 || G.duo ? (pl === 2 ? "🥈 " : pl === 3 ? "🥉 " : "") + pl + "e place" : pl + "e place"}</h2><p>${G.duo ? `Ton équipe termine ${pl}e sur 4` : `Tu termines ${pl}e sur ${G.n}`}, à la manche ${G.info.st}-${G.info.k}. ${G.stat.wins} combat${G.stat.wins > 1 ? "s" : ""} gagné${G.stat.wins > 1 ? "s" : ""} sur ${G.stat.fights}.</p>
      ${L.length ? `<div class="ar-ctab">${L.map(x => { const st = x.st || { d: 0, k: 0, h: 0, t: 0 }; return `<div class="ar-crow c${UN[x.n].c}"><div class="ar-cmini" style="${bg(x.n)}"></div><div class="ar-cn"><b>${esc(artOf(x.n).nm)}</b><small>${stars(x.star)}</small></div><span>⚔️ ${fmt(st.d)}</span><span>💀 ${st.k}</span><span>💚 ${fmt(st.h)}</span><span>🛡️ ${fmt(st.t)}</span></div>`; }).join("")}</div>` : ""}
      <p class="ar-rew" id="ar-rew"></p>
      <div class="ar-row">${G.mp && G.players.filter(q => q.alive).length > 1 ? `<button class="ar-b go" data-act="spec">👁 Observer la suite</button>` : ""}<button class="ar-b ${G.mp ? "" : "go"}" data-act="again">${G.mp ? "Retour au salon" : "Rejouer"}</button><button class="ar-b" data-act="quit">Quitter</button></div></div>`;
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
    const cnt = traitsOf(G.me.board, G.me.aug), act = Object.keys(cnt).filter(k => tier(k, cnt[k]) >= 0);
    c.querySelector(".ar-cskip").remove();
    c.querySelector("#ar-cstage").innerHTML = `<div class="ar-cend"><h1>🏆 Victoire !</h1>
      <p class="ar-ctot">❤️ ${Math.max(0, G.me.hp)} PV restants · niveau ${G.me.lvl} · ${G.stat.wins}/${G.stat.fights} combats gagnés<br>⚔️ ${fmt(tot.d)} dégâts · 💀 ${tot.k} éliminations · 💚 ${fmt(tot.h)} soins</p>
      ${act.length ? `<p class="ar-ctr">${act.map(k => `${TICO(k)} ${TNAME(k)} ${cnt[k]}`).join(" · ")}</p>` : ""}
      <div class="ar-ctab">${L.map(({ x, st }, i) => `<div class="ar-crow c${UN[x.n].c} ${i ? "" : "mvp"}"><div class="ar-cmini" style="${bg(x.n)}"></div><div class="ar-cn"><b>${esc(artOf(x.n).nm)}</b><small>${stars(x.star)}${i ? "" : " · MVP"}</small></div><span>⚔️ ${fmt(st.d)}</span><span>💀 ${st.k}</span><span>💚 ${fmt(st.h)}</span><span>🛡️ ${fmt(st.t)}</span></div>`).join("")}</div>
      <p class="ar-rew" id="ar-rew">${G.rewTxt || ""}</p>
      <div class="ar-row"><button class="ar-b go" data-act="again">Rejouer</button><button class="ar-b" data-act="quit">Quitter</button></div></div>`;
  }
  W.WikiArena = { open, close, _t: { AUG, choose, cap, SETS, playRound, roundTick, EVENTS, MP, mpGo, packBoard, UN, get SET() { return SET; }, TR, newGame, simRun, simInit, step, teamOf, buy, sell, merge, botTurn, prepareFights, resolveFight, resolveOthers, roundEnd, watch, roundInfo, pveTeam, TRK, BOSS, ITEM, FUS, COMP, equip, giveItems, cine, get G() { return G; } } };
})();
