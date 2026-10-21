/*
 * Procedural line-art portraits.
 * Each character is drawn with one of the designs of their own people
 * (PRESETS below: Israelites, Egyptians, Philistines, Assyrians and
 * Babylonians, Persians, Romans, Greeks, the Herods, Canaanites, Arameans,
 * Edom/Moab/Ammon, desert peoples, Cushites), with small per-person
 * differences seeded by its id. The design is picked once for the whole list
 * (assign()) so that relatives and people born close together get different
 * designs. A character's own `look` hints for age, beard and hair win over the
 * design's, and so does a priest's turban; a crowned king wears his people's
 * royal headwear. If a character has a `portrait` image path in the data file,
 * that image is used instead.
 */
(function () {
  "use strict";

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const f = (n) => Math.round(n * 10) / 10;

  /*
   * Portrait designs.
   *   age   young | adult | old         head  bare | crown | priest | turban | cap | softcap | helmet | band
   *   beard none | short | full | long
   *   bs    beard shape: plain | pointed | curly | goatee
   *   hair  short | curly | long | wavy | bald | braids | sidebraid | tied | crownbraid   (shows with bare, crown, band)
   *   face  oval | round | long | square      brow  soft | heavy | arched
   *   mouth calm | smile | stern              eye   open | narrow | downcast
   *   extras: earrings, nosering, necklace, crescent (pendant), frontlet (pendant on a headband)
   *
   * Dress follows what the Bible and Iron Age reliefs show, not later fashions:
   * beards (Lev 19:27), a Nazirite's long hair (Num 6:5), the priest's turban
   * (Ex 28:4, 39), helmets without crests (1 Sam 17:5), earrings, nose rings,
   * headbands and crescent ornaments (Gen 24:47; Judg 8:21, 24; Isa 3:18-21),
   * braided hair (1 Pet 3:3), the short wrapped turban with a hanging end worn
   * by Judean men on the Lachish reliefs, and the soft cap of Jehu's envoys on
   * the Black Obelisk. There are no draped head cloths, veils or hair buns;
   * women are drawn with their hair showing.
   *
   * Other peoples follow Insight on the Scriptures ("Dress", "Headdress",
   * "Hair", "Beard"), the reliefs it cites, and the illustrations in "Lessons
   * You Can Learn From the Bible" (wol.jw.org): Egyptians shaved (Gen 41:14)
   * and wore wigs and broad collars (Gen 41:42); Philistines the feathered
   * headdress of the Medinet Habu reliefs; Assyrians and Persians long curled
   * hair and tiered beards; Romans cropped hair and no beard; Arameans long
   * hair under a headband. More head shapes for them:
   *   head  nemes | feathers | tallcap | fez | fluted | battle | conehelm |
   *         roundcap | cone | romanhelm | wreath | net
   *   hair  shaved | wig | longwig | curled | bob | cropped | coils | ringlets | waved
   *   bs    tiered | false        eye  painted     extras  collar, rosette
   *   cult  the peoples a design is used for; royal: their kings' headwear
   *         ("only": never given to anyone else); shaven: no beard even when old
   */
  const PRESETS = {
    m: [
      // Israelites, and the neighbouring peoples who dressed much like them
      { name: "Patriarch", cult: ["israelite", "desert", "aramean"], age: "old", head: "bare", hair: "long", beard: "long", face: "long", brow: "heavy", mouth: "stern" },
      { name: "Young shepherd", cult: ["israelite", "transjordan", "desert"], age: "young", head: "bare", hair: "curly", beard: "short", face: "round", mouth: "smile" },
      { name: "Envoy in a soft cap", cult: ["israelite", "aramean", "canaanite"], age: "adult", head: "softcap", beard: "full", bs: "pointed", eye: "narrow" },
      { name: "Elder in a cap", cult: ["israelite", "transjordan"], age: "old", head: "cap", beard: "long", bs: "pointed", face: "long" },
      { name: "Soldier", cult: ["israelite", "transjordan", "aramean", "canaanite"], age: "adult", head: "helmet", beard: "short", face: "square", brow: "heavy", mouth: "stern" },
      { name: "Scribe", cult: ["israelite", "aramean"], age: "adult", head: "turban", beard: "full", bs: "pointed", face: "long", eye: "narrow" },
      { name: "Fisherman", cult: ["israelite"], age: "adult", head: "band", hair: "curly", beard: "full", bs: "curly", face: "square" },
      { name: "Bald elder", cult: ["israelite", "transjordan", "canaanite"], age: "old", head: "bare", hair: "bald", beard: "full", face: "round", brow: "heavy" },
      { name: "Beardless youth", cult: ["israelite", "canaanite"], age: "young", head: "bare", hair: "short", beard: "none", mouth: "smile" },
      { name: "Grey-haired elder", cult: ["israelite", "transjordan", "desert"], age: "old", head: "bare", hair: "curly", beard: "long", eye: "downcast" },
      { name: "Levite", cult: ["israelite"], age: "adult", head: "cap", beard: "short", face: "round", mouth: "smile" },
      { name: "Nazirite", cult: ["israelite"], age: "adult", head: "bare", hair: "long", beard: "full", face: "long", brow: "heavy" },
      { name: "Herdsman", cult: ["israelite", "desert", "aramean", "transjordan"], age: "adult", head: "band", hair: "long", beard: "short", bs: "curly", face: "round", mouth: "smile" },
      { name: "Old man in a turban", cult: ["israelite", "transjordan"], age: "old", head: "turban", beard: "full", bs: "curly", face: "square", brow: "heavy" },
      { name: "Merchant", cult: ["israelite", "canaanite", "desert"], age: "adult", head: "band", hair: "short", beard: "short", bs: "goatee", eye: "narrow", extras: ["earrings", "necklace"] },
      { name: "Young man with long hair", cult: ["israelite", "desert", "aramean"], age: "young", head: "bare", hair: "long", beard: "none", face: "long", eye: "downcast" },
      // Egyptians: shaved heads or short wigs, clean-shaven, broad collars (Gen 41:14, 42)
      { name: "Egyptian with a shaved head", cult: ["egyptian"], age: "adult", head: "bare", hair: "shaved", beard: "none", shaven: true, face: "long", extras: ["collar"] },
      { name: "Egyptian in a short wig", cult: ["egyptian"], age: "adult", head: "bare", hair: "wig", beard: "none", shaven: true, face: "round", extras: ["collar"] },
      { name: "Egyptian official with a fillet", cult: ["egyptian"], age: "adult", head: "band", hair: "wig", beard: "none", shaven: true, face: "long", eye: "narrow", extras: ["collar", "earrings"] },
      { name: "Egyptian elder in a wig", cult: ["egyptian"], age: "old", head: "bare", hair: "wig", beard: "none", shaven: true, face: "square", mouth: "stern", extras: ["collar"] },
      { name: "Pharaoh's striped headdress", cult: ["egyptian"], royal: "only", age: "adult", head: "nemes", beard: "short", bs: "false", shaven: true, face: "square", mouth: "stern", extras: ["collar"] },
      // Philistines: feathered headdresses, as on the Medinet Habu reliefs
      { name: "Philistine in a feathered headdress", cult: ["philistine"], royal: true, age: "adult", head: "feathers", beard: "none", shaven: true, face: "square", brow: "heavy", mouth: "stern" },
      { name: "Philistine with a short beard", cult: ["philistine"], age: "adult", head: "feathers", beard: "short", face: "round" },
      { name: "Philistine youth", cult: ["philistine"], age: "young", head: "bare", hair: "curly", beard: "none", mouth: "smile" },
      // Assyrians, Babylonians, Chaldeans: long curled hair and tiered beards
      { name: "Assyrian with a curled beard", cult: ["mesopotamian"], age: "adult", head: "band", hair: "curled", beard: "long", bs: "tiered", brow: "heavy", extras: ["earrings", "rosette"] },
      { name: "Babylonian in a tall cap", cult: ["mesopotamian"], age: "adult", head: "tallcap", hair: "curled", beard: "long", bs: "tiered", eye: "narrow" },
      { name: "Assyrian soldier", cult: ["mesopotamian"], age: "adult", head: "conehelm", hair: "curled", beard: "full", bs: "tiered", face: "square", mouth: "stern" },
      { name: "Chaldean elder", cult: ["mesopotamian"], age: "old", head: "bare", hair: "curled", beard: "long", bs: "tiered", eye: "downcast" },
      { name: "King's tall cap", cult: ["mesopotamian"], royal: "only", age: "adult", head: "fez", hair: "curled", beard: "long", bs: "tiered", brow: "heavy", extras: ["earrings"] },
      // Persians and Medes
      { name: "Persian in a fluted cap", cult: ["persian"], age: "adult", head: "fluted", hair: "curled", beard: "full", bs: "tiered", face: "long" },
      { name: "Persian with a headband", cult: ["persian"], age: "adult", head: "band", hair: "curled", beard: "full", bs: "tiered", eye: "narrow", extras: ["earrings"] },
      { name: "Mede in a rounded cap", cult: ["persian"], age: "adult", head: "roundcap", beard: "full", bs: "curly", face: "round" },
      { name: "Persian king's crown", cult: ["persian"], royal: "only", age: "adult", head: "battle", hair: "curled", beard: "long", bs: "tiered", brow: "heavy" },
      // Romans: cropped hair, clean-shaven
      { name: "Roman with cropped hair", cult: ["roman", "herodian"], age: "adult", head: "bare", hair: "cropped", beard: "none", shaven: true, face: "square" },
      { name: "Roman officer's helmet", cult: ["roman"], age: "adult", head: "romanhelm", beard: "none", shaven: true, face: "square", mouth: "stern" },
      { name: "Older Roman", cult: ["roman", "herodian"], age: "old", head: "bare", hair: "cropped", beard: "none", shaven: true, face: "long", brow: "heavy" },
      { name: "Laurel wreath", cult: ["roman"], royal: "only", age: "adult", head: "wreath", hair: "cropped", beard: "none", shaven: true, face: "long", mouth: "stern" },
      // Greeks and the Herods
      { name: "Greek with curly hair", cult: ["greek", "herodian"], age: "adult", head: "bare", hair: "curly", beard: "full", bs: "curly", face: "square" },
      { name: "Greek youth with a fillet", cult: ["greek", "herodian"], age: "young", head: "band", hair: "curly", beard: "none", mouth: "smile" },
      { name: "Herodian with a diadem", cult: ["herodian"], royal: true, age: "adult", head: "band", hair: "cropped", beard: "short", face: "long", eye: "narrow" },
      // Canaanites, Phoenicians, Hittites
      { name: "Canaanite with a headband", cult: ["canaanite", "aramean", "desert"], age: "adult", head: "band", hair: "bob", beard: "full", bs: "pointed" },
      { name: "Phoenician in a pointed cap", cult: ["canaanite"], age: "adult", head: "cone", hair: "bob", beard: "full", bs: "pointed", face: "long", eye: "narrow" },
      { name: "Hittite with long hair", cult: ["canaanite"], age: "adult", head: "bare", hair: "long", beard: "none", shaven: true, face: "long", brow: "heavy" },
      // Arameans, Edom, Moab, Ammon, and the desert peoples
      { name: "Aramean with long hair and a headband", cult: ["aramean", "transjordan"], age: "adult", head: "band", hair: "long", beard: "full", bs: "curly", brow: "heavy" },
      { name: "Moabite in a rounded cap", cult: ["transjordan", "desert"], age: "adult", head: "roundcap", beard: "full", bs: "pointed", face: "long" },
      { name: "Nomad in a felt cap", cult: ["desert"], age: "adult", head: "roundcap", beard: "full", bs: "curly", brow: "heavy", mouth: "stern" },
      { name: "Midianite chief with a crescent", cult: ["desert"], age: "adult", head: "band", hair: "long", beard: "full", face: "square", extras: ["crescent", "earrings"] },
      // Cushites
      { name: "Cushite with close curls", cult: ["cushite"], age: "adult", head: "bare", hair: "coils", beard: "none", face: "round", extras: ["earrings"] },
      { name: "Cushite with a short beard", cult: ["cushite"], age: "adult", head: "band", hair: "coils", beard: "short", bs: "curly", face: "square" },
      { name: "Cushite elder", cult: ["cushite"], age: "old", head: "bare", hair: "coils", beard: "full", bs: "curly", eye: "downcast" },
      // Greek kings after Alexander: the plain ribbon diadem tied at the back, as on their coins
      { name: "Hellenistic king's diadem", cult: ["greek"], royal: "only", age: "adult", head: "band", hair: "curly", beard: "none", face: "square", brow: "heavy", mouth: "stern" },
      // After the Bible: one design for each person, named by `look.design`, drawn
      // after the coins, statues, paintings and photographs that the Watchtower
      // publications on wol.jw.org reproduce in their articles on these people
      { name: "Emperor's pearl diadem", cult: ["lateroman"], age: "adult", head: "pearls", hair: "cropped", beard: "none", shaven: true, face: "square", eye: "open", mouth: "stern", dress: "cloak" },
      { name: "Emperor's jewelled diadem", cult: ["lateroman"], age: "adult", head: "pearls", hair: "cropped", beard: "none", shaven: true, face: "long", eye: "narrow", dress: "cloak" },
      { name: "Bishop with a pallium", cult: ["church"], age: "old", head: "bare", hair: "short", beard: "full", bs: "pointed", face: "long", brow: "heavy", dress: "pallium" },
      { name: "Bishop of Rome", cult: ["church"], age: "old", head: "bare", hair: "cropped", beard: "short", face: "round", mouth: "stern", dress: "pallium" },
      { name: "Monk and translator", cult: ["church"], age: "old", head: "bare", hair: "bald", beard: "long", face: "long", eye: "downcast" },
      { name: "Pope's mitre", cult: ["medieval"], age: "old", head: "mitre", beard: "none", shaven: true, face: "round", mouth: "stern", dress: "pallium" },
      { name: "Merchant in a felt cap", cult: ["medieval"], age: "adult", head: "roundcap", beard: "full", bs: "curly", face: "square" },
      { name: "Scholar in a skullcap", cult: ["medieval"], age: "old", head: "skullcap", hair: "short", beard: "long", face: "long", eye: "downcast", dress: "gown" },
      { name: "Preacher with a pointed beard", cult: ["medieval"], age: "adult", head: "bare", hair: "short", beard: "full", bs: "pointed", face: "long", brow: "heavy", dress: "gown" },
      { name: "Printer in a fur hat", cult: ["medieval"], age: "old", head: "furhat", beard: "long", bs: "pointed", face: "long", eye: "narrow", dress: "gown" },
      { name: "Sultan's great turban", cult: ["ottoman"], age: "adult", head: "kavuk", beard: "full", bs: "pointed", face: "long", eye: "narrow", dress: "gown" },
      { name: "Doctor's cap", cult: ["reformation"], age: "adult", head: "doctorcap", beard: "none", shaven: true, face: "square", brow: "heavy", mouth: "stern", dress: "gown" },
      { name: "Tudor flat cap", cult: ["reformation"], age: "adult", head: "flatcap", beard: "short", face: "square", eye: "narrow", mouth: "stern", dress: "gown", extras: ["necklace"] },
      { name: "Translator in a skullcap", cult: ["reformation"], age: "adult", head: "skullcap", hair: "short", beard: "full", face: "long", eye: "downcast", dress: "gown" },
      { name: "Reformer with a long beard", cult: ["reformation"], age: "adult", head: "skullcap", hair: "short", beard: "long", bs: "pointed", face: "long", eye: "narrow", dress: "gown" },
      { name: "Frock coat and white beard", cult: ["modern"], age: "old", head: "bare", hair: "short", beard: "long", face: "oval", eye: "open", mouth: "calm", dress: "coat" },
      { name: "High collar and glasses", cult: ["modern"], age: "adult", head: "bare", hair: "short", beard: "none", shaven: true, face: "square", mouth: "stern", dress: "coat", extras: ["glasses"] }
    ],
    f: [
      { name: "Wavy hair", cult: ["israelite", "transjordan"], age: "adult", head: "bare", hair: "wavy" },
      { name: "Braids", cult: ["israelite", "desert"], age: "young", head: "bare", hair: "braids", face: "round", mouth: "smile" },
      { name: "Hair tied back", cult: ["israelite", "aramean"], age: "adult", head: "bare", hair: "tied", face: "long", extras: ["earrings"] },
      { name: "Long hair", cult: ["israelite", "transjordan", "philistine"], age: "young", head: "bare", hair: "long", extras: ["necklace"] },
      { name: "Crescent pendant", cult: ["israelite", "desert", "canaanite"], age: "adult", head: "bare", hair: "wavy", brow: "arched", extras: ["crescent"] },
      { name: "Single braid", cult: ["israelite", "transjordan"], age: "adult", head: "bare", hair: "sidebraid", face: "round", mouth: "smile" },
      { name: "Elder, hair tied back", cult: ["israelite", "aramean"], age: "old", head: "bare", hair: "tied", face: "long", mouth: "stern" },
      { name: "Curls", cult: ["israelite", "persian", "mesopotamian"], age: "adult", head: "bare", hair: "curly", extras: ["earrings"] },
      { name: "Headband and frontlet", cult: ["israelite"], age: "adult", head: "band", hair: "wavy", eye: "downcast", extras: ["frontlet"] },
      { name: "Headband", cult: ["israelite", "transjordan", "philistine"], age: "adult", head: "band", hair: "long", brow: "arched" },
      { name: "Elder with a braided crown", cult: ["israelite"], age: "old", head: "bare", hair: "crownbraid", face: "round" },
      { name: "Girl with a single braid", cult: ["israelite", "aramean"], age: "young", head: "bare", hair: "sidebraid", face: "long", mouth: "smile", extras: ["earrings"] },
      { name: "Headband and curls", cult: ["israelite", "canaanite"], age: "adult", head: "band", hair: "curly", face: "square", eye: "narrow", extras: ["necklace"] },
      { name: "Braided crown", cult: ["israelite"], age: "adult", head: "bare", hair: "crownbraid", brow: "arched", mouth: "smile" },
      { name: "Elder with braids", cult: ["israelite", "desert"], age: "old", head: "bare", hair: "braids", face: "round", eye: "downcast" },
      { name: "Earrings and nose ring", cult: ["israelite", "desert", "transjordan"], age: "young", head: "bare", hair: "wavy", face: "round", mouth: "smile", extras: ["earrings", "nosering"] },
      { name: "Egyptian braided wig", cult: ["egyptian"], age: "adult", head: "bare", hair: "longwig", eye: "painted", extras: ["collar", "earrings"] },
      { name: "Egyptian beaded hair net", cult: ["egyptian"], age: "adult", head: "net", hair: "long", eye: "painted", brow: "arched", extras: ["earrings"] },
      { name: "Egyptian wig with a circlet", cult: ["egyptian"], royal: true, age: "adult", head: "band", hair: "longwig", eye: "painted", face: "long", extras: ["collar", "rosette"] },
      { name: "Ringlets and a diadem", cult: ["mesopotamian", "persian", "canaanite"], age: "adult", head: "band", hair: "ringlets", extras: ["earrings", "rosette"] },
      { name: "Ringlets and a necklace", cult: ["persian", "mesopotamian", "aramean"], age: "young", head: "bare", hair: "ringlets", face: "round", mouth: "smile", extras: ["necklace"] },
      { name: "Painted eyes", cult: ["canaanite"], age: "adult", head: "bare", hair: "ringlets", eye: "painted", brow: "arched", extras: ["earrings", "necklace"] },
      { name: "Waved hair, parted", cult: ["roman", "herodian", "greek"], age: "adult", head: "bare", hair: "waved", face: "long", extras: ["earrings"] },
      { name: "Waved hair with a fillet", cult: ["herodian", "greek", "roman"], royal: true, age: "adult", head: "band", hair: "waved", brow: "arched", extras: ["earrings", "necklace"] },
      { name: "Close curls and large earrings", cult: ["cushite"], age: "adult", head: "bare", hair: "coils", face: "round", extras: ["earrings", "necklace"] },
      { name: "Headband and braids", cult: ["desert"], age: "adult", head: "band", hair: "braids", face: "long", extras: ["nosering"] }
    ]
  };
  const group = (c) => (c.gender === "f" ? "f" : "m");

  /* ───────────── which people a person belongs to ─────────────
   * From the nation or tribe Insight gives (the `group` field), else from
   * words in the role and summary. A `look.culture` hint wins over both. */
  const NATIONS = [
    ["egyptian", /^Egyptian$/],
    ["philistine", /^Philistine$/],
    ["mesopotamian", /^(Assyrian|Babylonian|Chaldean|Elamite|Mesopotamian)$/],
    ["persian", /^(Persian|Persian court|Mede)$/],
    ["roman", /^Roman$/],
    ["greek", /^(Greek|Ephesian)$/],
    ["herodian", /^(Herodian|Idumean)$/],
    ["canaanite", /^(Canaanite|Amorite|Hittite|Hivite|Horite|Tyrian|Sidonian|Phoenician|Gibeonite|Anakim|Rephaim|Hamathite|Geshurite|Maacathite|Horonite|Archite)$/],
    ["aramean", /^(Syrian|Aramaean|Aramean|Damascene)$/],
    ["transjordan", /^(Edomite|Moabite|Ammonite|Agagite)$/],
    ["desert", /^(Midianite|Ishmaelite|Amalekite|Arabian|Hagrite|Dedanite|Keturah's descendants|Keturah's sons|Buzite|Shuhite|Kenite)$/],
    ["cushite", /^Ethiopian$/]
  ];
  const WORDS = [
    ["egyptian", /Egypt|Pharaoh/], ["philistine", /Philistin|Gath\b|Gaza|Ashdod/], ["persian", /Persia|\bMedes?\b/],
    ["mesopotamian", /Babylon|Assyri|Chaldea|Elam/], ["roman", /Roman|Caesar|centurion/], ["greek", /Greek|Athen|Corinth/],
    ["aramean", /Syria|\bAram/], ["transjordan", /Edom|Moab|Ammon/], ["canaanite", /Canaan|Hittite|Amorite|Tyre|Sidon|Jebusite/],
    ["desert", /Midian|Ishmael|Amalek|Arab/], ["cushite", /Ethiop|Cush/]
  ];
  function culture(c) {
    if (c.look && c.look.culture) return c.look.culture;
    const g = c.group || "";
    for (const [k, re] of NATIONS) if (re.test(g)) return k;
    // Ham's line (Gen 10:6-20) spread to Cush, Egypt and Canaan: go by the summary
    if (g && g !== "Hamite") return "israelite";
    const t = (c.role || "") + " " + (c.summary || "");
    for (const [k, re] of WORDS) if (re.test(t)) return k;
    return "israelite";
  }
  // the designs a people group draws from (kings-only designs left out)
  function pool(g, k) {
    const ids = [];
    PRESETS[g].forEach((p, i) => { if (p.royal !== "only" && p.cult.indexOf(k) >= 0) ids.push(i); });
    return ids.length ? ids : pool(g, "israelite");
  }
  // what a crowned king or queen of that people wears; others keep the plain crown
  function royal(g, k) {
    const i = PRESETS[g].findIndex((p) => p.royal && p.cult[0] === k);
    return i < 0 ? null : PRESETS[g][i];
  }

  /* ───────────── which design each person gets ─────────────
   * Per sex and people group, people are taken in birth order; each gets the
   * design of their own people used longest ago, skipping any design a
   * parent, child, sibling or spouse already has. So people born around the
   * same time look different, and so do close relatives. Done once for the
   * whole list. */
  let assigned = null;
  function assign(list) {
    assigned = new Map();
    const byId = new Map(list.map((c) => [c.id, c]));
    const links = new Map();
    const link = (a, b) => {
      if (!byId.has(b) || a === b) return;
      if (!links.has(a)) links.set(a, new Set());
      if (!links.has(b)) links.set(b, new Set());
      links.get(a).add(b); links.get(b).add(a);
    };
    for (const c of list) {
      const r = c.rel || {};
      for (const k of ["father", "mother", "spouses", "children", "siblings"]) for (const id of r[k] || []) link(c.id, id);
    }
    // Key figures go first, on their own, so the best-known people never repeat a
    // design or a headwear from one to the next. Everyone else then fills in
    // around them, also steering clear of the key figures born just after them.
    for (const g of ["m", "f"]) {
      const sex = list.filter((c) => group(c) === g)
        .sort((a, b) => (a.born - b.born) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
      const byCult = new Map();
      for (const c of sex) { const k = culture(c); if (!byCult.has(k)) byCult.set(k, []); byCult.get(k).push(c); }
      for (const [k, people] of byCult) {
        const ids = pool(g, k);
        pick(people.filter((c) => c.key), ids, PRESETS[g], links, true);
        pick(people, ids, PRESETS[g], links, false);
      }
    }
  }
  function pick(people, ids, designs, links, spreadHeads) {
    const last = new Map(ids.map((p) => [p, -1e7])), heads = [];
    people.forEach((c, i) => {
      if (assigned.has(c.id)) { last.set(assigned.get(c.id), i); return; }
      const taken = new Set(), ahead = new Set();
      for (const id of links.get(c.id) || []) if (assigned.has(id)) taken.add(assigned.get(id));
      for (let j = i + 1; j < Math.min(people.length, i + 12); j++) if (assigned.has(people[j].id)) ahead.add(assigned.get(people[j].id));
      let best = ids[0], bestScore = Infinity;
      for (const p of ids) {
        let score = (taken.has(p) ? 1e9 : 0) + (ahead.has(p) ? 1e5 : 0) + last.get(p) + ((hash(c.id + p) % 1000) / 1e4);
        if (spreadHeads && heads.indexOf(designs[p].head) >= 0) score += 1e6;
        if (score < bestScore) { bestScore = score; best = p; }
      }
      assigned.set(c.id, best);
      last.set(best, i);
      if (spreadHeads) { heads.push(designs[best].head); if (heads.length > 2) heads.shift(); }
    });
  }
  function presetOf(c) {
    if (c._preset != null) return PRESETS[group(c)][c._preset];
    // a well-known person after Bible times is drawn with their own design
    if (c.look && c.look.design) { const p = PRESETS[group(c)].find((d) => d.name === c.look.design); if (p) return p; }
    if (!assigned) assign(window.TIMELINE_PEOPLE || window.TIMELINE_CHARACTERS || []);
    if (!assigned.has(c.id)) { const ids = pool(group(c), culture(c)); return PRESETS[group(c)][ids[hash(c.id) % ids.length]]; }
    return PRESETS[group(c)][assigned.get(c.id)];
  }

  const RULER = /^(?:(?:first|second|fourth|last|persian|philistine|egyptian|babylonian|roman)\s+){0,2}(?:king|queen|pharaoh|emperor)\b(?!')/i;
  function defaultLook(c) {
    const fem = c.gender === "f";
    const look = Object.assign({ hair: fem ? "long" : "short", bs: "plain", face: "oval", brow: "soft", mouth: "calm", eye: "open", extras: [] }, presetOf(c));
    const hint = c.look || {};
    if (hint.age) look.age = hint.age;
    else if (c.died - c.born > 300) look.age = "old";
    // Hand-set headwear only wins when it says something: a king's crown or a
    // priest's turban. A crown is drawn the way that king's own people drew
    // one (a pharaoh's striped headdress, a Persian king's crenellated crown).
    // Otherwise the design's headwear gives the variety, except that only
    // unnamed extras are drawn in a soldier's helmet; a named person given the
    // soldier design is drawn bareheaded.
    // Foreign rulers whose people had their own royal headwear get it from their
    // role too ("King of Assyria", "Pharaoh of Egypt", "Roman emperor").
    let crowned = null;
    if (c._preset == null && !hint.design && (hint.head === "crown" || RULER.test(c.role || ""))) crowned = royal(group(c), culture(c));
    if (crowned) {
      for (const k of ["head", "hair", "bs", "shaven"]) look[k] = crowned[k];
      look.extras = (crowned.extras || []).slice();
      if (crowned.shaven || crowned.bs === "false") look.beard = crowned.beard;
    } else if (hint.head === "crown" || hint.head === "priest") look.head = hint.head;
    else if (hint.head && /helm/.test(look.head)) { look.head = "bare"; look.hair = look.shaven ? "cropped" : look.hair === "curled" ? "curled" : "short"; }
    if (look.head === "crown" && (look.hair === "wig" || look.hair === "longwig" || look.hair === "shaved")) look.hair = "short";
    if (hint.beard && !(crowned && (crowned.shaven || crowned.bs === "false"))) look.beard = hint.beard;
    // hair the Bible mentions (a Nazirite's, Absalom's) must show, so no hat over it
    if (hint.hair) { look.hair = hint.hair; if (!/^(crown|band|battle|wreath)$/.test(look.head)) look.head = "bare"; }
    if (!look.beard) look.beard = fem ? "none" : (look.age === "old" ? "long" : "full");
    // An old man always has a beard, even when his design's is clean-shaven,
    // except among peoples who shaved (Egyptians, Romans).
    if (!hint.beard && look.age === "old" && look.beard === "none" && !look.shaven) look.beard = "full";
    if (look.beard === "none" && (look.bs === "tiered" || look.bs === "false")) look.bs = "plain";
    if (fem) look.beard = "none";
    if (look.hair === "bald" && look.age !== "old") look.hair = "short";
    return look;
  }

  function build(c, uid) {
    const R = rng(hash(c.id));
    const r = (a, b) => a + (b - a) * R();
    const L = defaultLook(c);
    const fem = c.gender === "f";
    const old = L.age === "old", young = L.age === "young";
    const has = (x) => L.extras.indexOf(x) >= 0;
    const head = L.head, hair = L.hair;

    const cx = 100, cy = 104;
    let rx = (fem ? 30 : 33) + r(-2, 3);
    let ry = (fem ? 40 : 42) + r(-2, 3);
    let jaw = fem ? 0.42 : r(0.5, 0.62);
    if (L.face === "round") { rx += 3; ry -= 3; jaw += 0.1; }
    else if (L.face === "long") { rx -= 2.5; ry += 3; jaw -= 0.06; }
    else if (L.face === "square") { jaw = fem ? 0.56 : 0.74; }
    const top = cy - ry, chin = cy + ry;
    const tilt = r(-3, 3);
    const out = [];
    const S = (d, w, op) => {
      const dx = r(-0.9, 0.9), dy = r(-0.9, 0.9);
      out.push(`<path d="${d}" stroke-width="${w}"${op ? ` opacity="${op}"` : ""}/>`);
      out.push(`<path d="${d}" stroke-width="${f(w * 0.6)}" opacity="0.35" transform="translate(${f(dx)} ${f(dy)})"/>`);
    };
    const P = (d, w, op, extra) => out.push(`<path d="${d}" stroke-width="${w}"${op ? ` opacity="${op}"` : ""}${extra || ""}/>`);
    const fillP = (d, w) => out.push(`<path d="${d}" stroke-width="${w}" fill="var(--portrait-fill, #050505)"/>`);
    // ragged hair ends from (x0, y) to (x1, y): points hanging down, gaps rising by `lift`
    const ends = (x0, x1, y, lift, n) => {
      let d = "";
      for (let k = 1; k <= n * 2; k++) {
        const x = x0 + ((x1 - x0) * k) / (n * 2), yy = k % 2 ? y - lift + r(-1, 1) : y + r(-2, 2);
        d += ` Q${f(x - (x1 - x0) / (n * 4))},${f(k % 2 ? y : y - lift * 0.4)} ${f(x)},${f(yy)}`;
      }
      return d;
    };
    // a three-quarter loop, for curly hair and beards
    const curl = (x, y, rr, w, op) => {
      const k = R() < 0.5 ? 1 : -1;
      P(`M${f(x - k * rr)},${f(y)} a${f(rr)},${f(rr)} 0 1,${k > 0 ? 1 : 0} ${f(k * rr)},${f(rr)}`, w, op);
    };
    const ring = (x, y, rr, w, op, fill) => out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" stroke-width="${w}"${op ? ` opacity="${op}"` : ""}${fill ? ` fill="var(--portrait-fill, #050505)"` : ""}/>`);

    const face =
      `M${cx},${f(top)} C${f(cx + rx * 1.05)},${f(top)} ${f(cx + rx * 1.02)},${f(cy - 8)} ${f(cx + rx * 0.97)},${f(cy + 8)} ` +
      `C${f(cx + rx * 0.9)},${f(cy + ry * 0.62)} ${f(cx + rx * jaw)},${f(chin)} ${cx},${f(chin)} ` +
      `C${f(cx - rx * jaw)},${f(chin)} ${f(cx - rx * 0.9)},${f(cy + ry * 0.62)} ${f(cx - rx * 0.97)},${f(cy + 8)} ` +
      `C${f(cx - rx * 1.02)},${f(cy - 8)} ${f(cx - rx * 1.05)},${f(top)} ${cx},${f(top)} Z`;
    const hairline = cy - ry * 0.5;
    const showsHair = /^(bare|crown|band|battle|wreath|net|pearls)$/.test(head);
    // hats that sit on top of the head, leaving long or curled hair showing behind
    const hatHair = showsHair || /^(tallcap|fez|fluted|cone|roundcap|feathers|conehelm)$/.test(head);
    const wig = hair === "wig" || hair === "longwig";
    const ww = rx + (hair === "longwig" ? 13 : 10), wb = hair === "longwig" ? chin + 40 : chin - 4;

    // halo rings (background)
    out.push(`<circle cx="100" cy="112" r="92" stroke-width="0.6" opacity="0.25"/>`);
    out.push(`<circle cx="100" cy="112" r="84" stroke-width="0.4" opacity="0.14" stroke-dasharray="2 5"/>`);

    // shoulders / robe
    const sh = fem ? 62 : 72;
    const robe = `M${cx - sh - 18},240 C${cx - sh - 10},${chin + 40} ${cx - 40},${chin + 22} ${cx - 16},${chin + 14} L${cx + 16},${chin + 14} C${cx + 40},${chin + 22} ${cx + sh + 10},${chin + 40} ${cx + sh + 18},240`;
    fillP(robe, 1.3);
    const dress = L.dress || "robe";
    if (dress !== "coat") S(`M${cx - 18},${chin + 15} L${cx},${chin + 40} L${cx + 18},${chin + 15}`, 1);
    for (let i = 0; i < 4; i++) {
      const x = cx + (i < 2 ? -1 : 1) * r(26, sh - 2);
      P(`M${f(x)},${f(chin + r(36, 50))} q${f(r(-6, 6))},${f(r(18, 28))} ${f(r(-4, 4))},${f(r(34, 46))}`, 0.7, 0.55);
    }
    // neck
    S(`M${cx - 13},${chin - 10} C${cx - 13},${chin + 4} ${cx - 15},${chin + 10} ${cx - 17},${chin + 16}`, 1.1);
    S(`M${cx + 13},${chin - 10} C${cx + 13},${chin + 4} ${cx + 15},${chin + 10} ${cx + 17},${chin + 16}`, 1.1);
    // a quadratic curve's point at t, for laying beads and trims along a line
    const qp = (x0, y0, x1, y1, x2, y2, t) => [(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2];
    if (dress === "gown") {
      // scholar's or nobleman's gown with a broad fur collar falling down the front
      for (const sg of [-1, 1]) {
        fillP(`M${cx + sg * 16},${chin + 13} C${cx + sg * 40},${chin + 18} ${cx + sg * 62},${chin + 30} ${cx + sg * (sh + 8)},${chin + 52} L${cx + sg * (sh - 4)},${chin + 64} C${cx + sg * 54},${chin + 46} ${cx + sg * 38},${chin + 38} ${cx + sg * 30},${chin + 42} L${cx + sg * 30},240 L${cx + sg * 12},240 L${cx + sg * 12},${chin + 30} Z`, 1.2);
        for (let k = 0; k < 16; k++) curl(cx + sg * r(18, 28), chin + 30 + k * ((240 - chin - 34) / 16), r(1.8, 2.6), 0.6, 0.6);
        for (let k = 0; k < 10; k++) { const t = k / 10; curl(cx + sg * (22 + t * (sh - 14)), chin + 24 + t * 30 + r(-2, 2), r(1.8, 2.6), 0.6, 0.6); }
      }
    } else if (dress === "coat") {
      // nineteenth-century coat: turned-down shirt collar, necktie, lapels
      const y0 = chin + 12;
      fillP(`M${cx - 15},${y0} L${cx},${y0 + 62} L${cx + 15},${y0} Z`, 1);
      fillP(`M${cx - 3.5},${y0 + 10} L${cx + 3.5},${y0 + 10} L${cx + 6.5},${y0 + 48} L${cx},${y0 + 57} L${cx - 6.5},${y0 + 48} Z`, 1);
      for (let k = 0; k < 6; k++) P(`M${cx - 5},${f(y0 + 16 + k * 6)} l10,-5`, 0.5, 0.55);
      fillP(`M${cx - 4.5},${y0 + 3} L${cx + 4.5},${y0 + 3} L${cx + 3.5},${y0 + 10} L${cx - 3.5},${y0 + 10} Z`, 1);
      for (const sg of [-1, 1]) {
        fillP(`M${cx + sg * 15},${y0 - 3} L${cx + sg * 4},${y0 + 3} L${cx + sg * 11},${y0 + 15} Z`, 1);
        S(`M${cx + sg * 17},${y0 + 1} L${cx + sg * 34},${y0 + 16} L${cx + sg * 27},${y0 + 25} L${cx + sg * 37},${y0 + 32} L${cx + sg * 3},${y0 + 74}`, 1.1);
      }
      for (const yy of [y0 + 80, y0 + 96]) ring(cx, yy, 2.2, 0.9, 0, true);
    } else if (dress === "pallium") {
      // a bishop's woollen band over the shoulders with a strip down the front, marked with crosses
      const y1 = chin + 30;
      fillP(`M${cx - 50},${y1} Q${cx},${y1 + 50} ${cx + 50},${y1} L${cx + 48},${y1 - 9} Q${cx},${y1 + 38} ${cx - 48},${y1 - 9} Z`, 1.1);
      fillP(`M${cx - 6},${y1 + 22} L${cx + 6},${y1 + 22} L${cx + 6},240 L${cx - 6},240 Z`, 1.1);
      for (const [x, y] of [[cx, y1 + 30], [cx, y1 + 62], [cx - 30, y1 + 12], [cx + 30, y1 + 12]]) P(`M${x - 3.5},${y} h7 M${x},${y - 3.5} v7`, 1, 0.9);
    } else if (dress === "cloak") {
      // general's cloak pinned with a round brooch on the right shoulder (late Roman emperors)
      const bx = cx + 42, by = chin + 30;
      S(`M${bx},${by} C${cx + 10},${chin + 56} ${cx - 34},${chin + 70} ${cx - 54},240`, 1.2);
      for (let k = 0; k < 4; k++) P(`M${bx - 2},${by + 4} q${-14 - k * 6},${30 + k * 8} ${-20 - k * 10},${70 + k * 6}`, 0.6, 0.5);
      for (let k = 0; k < 3; k++) P(`M${bx + 2},${by + 5} q${4 + k * 4},${26 + k * 6} ${6 + k * 6},${60 + k * 8}`, 0.6, 0.5);
      ring(bx, by, 6, 1.2, 0, true); ring(bx, by, 2.6, 0.8, 0.8);
      for (let k = 0; k < 8; k++) { const a = (Math.PI * k) / 4; out.push(`<circle cx="${f(bx + Math.cos(a) * 8.4)}" cy="${f(by + Math.sin(a) * 8.4)}" r="1" fill="currentColor" stroke="none" opacity="0.8"/>`); }
    }

    // ── back layers: long hair / cloth / veil drape behind the face ──
    if (showsHair && fem && (hair === "long" || hair === "curly" || hair === "ringlets")) {
      const hl = `M${cx - rx - 4},${cy - 10} C${cx - rx - 14},${cy + 40} ${cx - rx - 14},${chin + 24} ${cx - rx - 18},${chin + 54}${ends(cx - rx - 18, cx + rx + 18, chin + 54, 12, 5)} C${cx + rx + 14},${chin + 24} ${cx + rx + 14},${cy + 40} ${cx + rx + 4},${cy - 10} Z`;
      fillP(hl, 1.1);
      if (hair === "curly") {
        for (let i = 0; i < 34; i++) {
          const s = i % 2 ? 1 : -1, y = cy - 8 + r(0, chin + 48 - cy);
          curl(cx + s * (rx + r(2, 9) + (y - cy) * 0.14), y, r(2.6, 4), 0.7, 0.7);
        }
      } else {
        for (let i = 0; i < 9; i++) {
          const s = i % 2 ? 1 : -1, x = cx + s * (rx + r(-2, 14));
          P(`M${f(x)},${f(cy + r(-4, 20))} q${f(s * r(2, 8))},${f(r(30, 50))} ${f(s * r(4, 12))},${f(r(60, 90))}`, 0.6, 0.6);
        }
      }
    }
    if (showsHair && !fem && hair === "long") {
      const hl = `M${cx - rx - 3},${cy - 12} C${cx - rx - 10},${cy + 20} ${cx - rx - 10},${chin - 6} ${cx - rx - 12},${chin + 18}${ends(cx - rx - 12, cx + rx + 12, chin + 18, 10, 4)} C${cx + rx + 10},${chin - 6} ${cx + rx + 10},${cy + 20} ${cx + rx + 3},${cy - 12} Z`;
      fillP(hl, 1.1);
      for (let i = 0; i < 8; i++) {
        const s = i % 2 ? 1 : -1, x = cx + s * (rx + r(0, 10));
        P(`M${f(x)},${f(cy + r(-6, 10))} q${f(s * r(1, 5))},${f(r(20, 30))} ${f(s * r(3, 8))},${f(r(40, 56))}`, 0.6, 0.6);
      }
    }
    if (!fem && hatHair && hair === "curled") {
      // Assyrian and Persian style: hair to the shoulders, ending in rows of curls
      const yb = chin + 12;
      fillP(`M${cx - rx - 3},${cy - 14} C${cx - rx - 12},${cy + 14} ${cx - rx - 14},${chin - 12} ${cx - rx - 16},${yb} Q${cx},${yb + 14} ${cx + rx + 16},${yb} C${cx + rx + 14},${chin - 12} ${cx + rx + 12},${cy + 14} ${cx + rx + 3},${cy - 14} Z`, 1.1);
      for (const sg of [-1, 1]) {
        for (let k = 0; k < 4; k++) P(`M${f(cx + sg * (rx + 2 + k * 2.5))},${f(cy - 8)} c${f(sg * 4)},10 ${f(sg * -2)},18 ${f(sg * 2)},${f(chin - cy - 14)}`, 0.6, 0.6);
        for (let row = 0; row < 3; row++) for (let k = 0; k < 3; k++) curl(cx + sg * (rx + 1 + k * 5 + row), chin - 14 + row * 9 + k * 2, 2.9, 0.8, 0.85);
      }
    }
    if (!fem && hatHair && hair === "bob") {
      // hair cut straight at the jaw, standing out at the sides (Canaanites on Egyptian reliefs)
      const yb = chin - 10;
      fillP(`M${cx - rx - 3},${cy - 16} C${cx - rx - 14},${cy - 4} ${cx - rx - 17},${yb - 18} ${cx - rx - 15},${yb} L${cx + rx + 15},${yb} C${cx + rx + 17},${yb - 18} ${cx + rx + 14},${cy - 4} ${cx + rx + 3},${cy - 16} Z`, 1.1);
      for (const sg of [-1, 1]) for (let k = 0; k < 4; k++) P(`M${f(cx + sg * (rx + 1 + k * 3.5))},${f(cy - 10)} q${f(sg * 3)},${f((yb - cy) / 2)} ${f(sg * 1)},${f(yb - cy + 8)}`, 0.6, 0.6);
    }
    if (showsHair && wig) {
      // Egyptian wig, behind the face
      fillP(`M${f(cx - ww)},${f(wb)} L${f(cx - ww)},${f(cy - 16)} C${f(cx - ww)},${f(top - 16)} ${f(cx + ww)},${f(top - 16)} ${f(cx + ww)},${f(cy - 16)} L${f(cx + ww)},${f(wb)} Z`, 1.2);
    }
    if (head === "nemes") {
      // the royal striped headcloth, spreading behind the shoulders
      const nb = `M${f(cx - rx - 8)},${f(cy - 16)} C${f(cx - rx - 8)},${f(top - 14)} ${f(cx + rx + 8)},${f(top - 14)} ${f(cx + rx + 8)},${f(cy - 16)} L${f(cx + rx + 26)},${f(chin + 6)} L${f(cx - rx - 26)},${f(chin + 6)} Z`;
      fillP(nb, 1.2);
      out.push(`<clipPath id="nb-${uid}"><path d="${nb}"/></clipPath><g clip-path="url(#nb-${uid})">`);
      for (let y = cy - 10; y < chin + 4; y += 6) P(`M${f(cx - rx - 26)},${f(y)} H${f(cx + rx + 26)}`, 2, 0.55);
      out.push(`</g>`);
    }
    if (showsHair && fem && hair === "waved") {
      // hair gathered low at the nape, showing either side of the neck
      fillP(`M${cx - rx - 3},${cy - 6} C${cx - rx - 10},${cy + 14} ${cx - rx - 8},${chin - 6} ${cx - rx + 4},${chin + 2} L${cx + rx - 4},${chin + 2} C${cx + rx + 8},${chin - 6} ${cx + rx + 10},${cy + 14} ${cx + rx + 3},${cy - 6} Z`, 1.1);
      for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) P(`M${f(cx + sg * (rx + 1 + k * 2))},${f(cy + k * 3)} c${f(sg * 4)},8 ${f(sg * -2)},14 ${f(sg * -1 - k)},${f(chin - cy - 2 - k * 3)}`, 0.6, 0.6);
    }
    if (showsHair && fem && hair === "wavy") {
      // shoulder-length hair with a waved edge
      const n = 5, step = (chin + 26 - cy) / n;
      const X = (k) => rx + 12 + k * 1.6, Y = (k) => cy - 6 + k * step, Q = (k) => rx + 16 + (k % 2 ? 6 : -2);
      let d = `M${f(cx - rx - 3)},${f(cy - 10)}`;
      for (let k = 1; k <= n; k++) d += ` Q${f(cx - Q(k))},${f(Y(k) - 8)} ${f(cx - X(k))},${f(Y(k))}`;
      d += ends(cx - X(n), cx + X(n), Y(n), 9, 5);
      for (let k = n; k >= 1; k--) d += ` Q${f(cx + Q(k))},${f(Y(k) - 8)} ${f(cx + X(k - 1))},${f(Y(k - 1))}`;
      fillP(`${d} L${f(cx + rx + 3)},${f(cy - 10)} Z`, 1.1);
      for (let i = 0; i < 10; i++) {
        const sg = i % 2 ? 1 : -1, x = cx + sg * (rx + r(2, 12));
        P(`M${f(x)},${f(cy + r(-4, 14))} c${f(sg * 5)},10 ${f(sg * -3)},18 ${f(sg * 3)},${f(r(30, 44))}`, 0.6, 0.6);
      }
    }
    if (showsHair && fem && hair === "tied") {
      // hair gathered at the nape, the tail falling behind one shoulder
      const sg = hash(c.id + "tie") % 2 ? 1 : -1, x0 = cx + sg * (rx - 4);
      fillP(`M${f(x0)},${f(cy - 6)} C${f(x0 + sg * 26)},${f(cy + 4)} ${f(x0 + sg * 24)},${f(chin + 6)} ${f(x0 + sg * 30)},${f(chin + 30)} Q${f(x0 + sg * 32)},${f(chin + 44)} ${f(x0 + sg * 24)},${f(chin + 52)} Q${f(x0 + sg * 22)},${f(chin + 40)} ${f(x0 + sg * 16)},${f(chin + 30)} C${f(x0 + sg * 8)},${f(chin + 10)} ${f(x0 + sg * 6)},${f(cy + 16)} ${f(x0 - sg * 2)},${f(cy + 8)} Z`, 1.1);
      for (let i = 0; i < 4; i++) P(`M${f(x0 + sg * (9 + i * 3))},${f(cy + 12)} c${f(sg * 8)},14 ${f(sg * 2)},28 ${f(sg * (14 + i * 2))},${f(chin + 34 - cy - i * 4)}`, 0.6, 0.6);
      P(`M${f(x0 + sg * 9)},${f(cy + 8)} l${f(sg * 10)},-4 M${f(x0 + sg * 10)},${f(cy + 12)} l${f(sg * 10)},-4`, 1.1, 0.85);
    }
    // crescent pendant on a cord (Isa 3:18; Judg 8:21)
    if (has("crescent")) {
      const py = chin + 30;
      P(`M${cx - 18},${f(chin + 12)} Q${cx},${f(py + 2)} ${cx + 18},${f(chin + 12)}`, 0.7, 0.75);
      fillP(`M${cx - 7},${f(py)} A7,7 0 0,0 ${cx + 7},${f(py)} A5.4,5.4 0 0,1 ${cx - 7},${f(py)} Z`, 1);
    }
    // necklace (behind the face and beard, over the robe and drape)
    if (has("necklace")) {
      const ny = chin + 18;
      P(`M${cx - 22},${f(ny - 6)} Q${cx},${f(ny + 16)} ${cx + 22},${f(ny - 6)}`, 0.8, 0.8);
      for (let i = 1; i < 8; i++) {
        const t = i / 8, x = cx - 22 + 44 * t, y = (1 - t) * (1 - t) * (ny - 6) + 2 * (1 - t) * t * (ny + 16) + t * t * (ny - 6);
        ring(x, y + 1.6, i === 4 ? 3.2 : 1.7, 0.8, 0, true);
      }
    }

    // Egyptian broad collar of beads
    if (has("collar")) {
      const y0 = chin + 10;
      fillP(`M${cx - 50},${f(y0 + 2)} Q${cx},${f(y0 + 70)} ${cx + 50},${f(y0 + 2)} L${cx + 22},${f(y0)} Q${cx},${f(y0 + 24)} ${cx - 22},${f(y0)} Z`, 1.1);
      for (const k of [1, 2, 3]) P(`M${cx - 22 - k * 7},${f(y0 + k * 0.5)} Q${cx},${f(y0 + 24 + k * 11)} ${cx + 22 + k * 7},${f(y0 + k * 0.5)}`, 0.8, 0.75);
      for (let i = 1; i < 14; i++) {
        const t = i / 14, x = (1 - t) * (1 - t) * (cx - 50) + 2 * (1 - t) * t * cx + t * t * (cx + 50), y = (1 - t) * (1 - t) * (y0 + 2) + 2 * (1 - t) * t * (y0 + 70) + t * t * (y0 + 2);
        ring(x, y + 1.5, 1.6, 0.7, 0.8, true);
      }
    }

    // face
    fillP(face, 1.5);
    out.push(`<path d="${face}" stroke-width="0.7" opacity="0.4" transform="translate(${f(r(-1, 1))} ${f(r(-1, 1))})"/>`);

    // shading hatch (light from upper-left)
    const clip = `pc-${uid}`;
    out.push(`<clipPath id="${clip}"><path d="${face}"/></clipPath><g clip-path="url(#${clip})" opacity="0.38">`);
    for (let i = 0; i < 16; i++) {
      const x = cx + rx * 0.35 + i * 3.2;
      out.push(`<path d="M${f(x)},${f(cy - 30 + i * 2)} l${f(-14)},${f(64 - i * 1.5)}" stroke-width="0.55"/>`);
    }
    out.push(`</g>`);

    // ears (only when not covered)
    const earsShow = fem
      ? showsHair && (hair === "tied" || hair === "braids" || hair === "sidebraid" || hair === "crownbraid" || hair === "short" || hair === "coils")
      : head !== "nemes" && head !== "romanhelm" && hair !== "bob" && !wig;
    if (earsShow) {
      if (fem) {
        S(`M${f(cx - rx * 0.97)},${cy + 2} c-6,-1 -7,13 -1,15`, 1);
        S(`M${f(cx + rx * 0.97)},${cy + 2} c6,-1 7,13 1,15`, 1);
      } else {
        S(`M${f(cx - rx * 0.97)},${cy - 2} c-8,-2 -9,16 -1,20`, 1.1);
        S(`M${f(cx + rx * 0.97)},${cy - 2} c8,-2 9,16 1,20`, 1.1);
      }
    }

    // eyes
    const ey = cy + r(-1, 3), es = r(12.5, 15);
    const lid = L.eye === "narrow" ? 3 : L.eye === "downcast" ? 3.6 : 5;
    for (const s of [-1, 1]) {
      const ex = cx + s * es;
      const uy = L.eye === "downcast" ? ey + 1 : ey;
      S(`M${f(ex - 8)},${f(uy)} C${f(ex - 4)},${f(uy - lid)} ${f(ex + 4)},${f(uy - lid)} ${f(ex + 8)},${f(uy)}`, L.eye === "painted" ? 2.2 : fem ? 1.5 : 1.3);
      // eyes lined with black paint, drawn out at the corner (2 Ki 9:30)
      if (L.eye === "painted") P(`M${f(ex + s * 8)},${f(uy)} l${f(s * 5.5)},-2.6`, 1.4, 0.9);
      P(`M${f(ex - 7)},${f(ey + 0.5)} C${f(ex - 3)},${f(ey + (L.eye === "narrow" ? 2 : 3))} ${f(ex + 3)},${f(ey + (L.eye === "narrow" ? 2 : 3))} ${f(ex + 7)},${f(ey + 0.5)}`, 0.7, 0.6);
      const iy = L.eye === "downcast" ? ey + 0.9 : L.eye === "narrow" ? ey : ey - 0.5;
      out.push(`<circle cx="${f(ex + r(-0.5, 0.5))}" cy="${f(iy)}" r="${L.eye === "open" || L.eye === "painted" ? 2.3 : 1.9}" fill="currentColor" stroke="none"/>`);
      if (L.eye === "downcast") P(`M${f(ex - 6)},${f(uy - lid + 1.6)} Q${f(ex)},${f(uy - lid - 0.6)} ${f(ex + 6)},${f(uy - lid + 1.6)}`, 0.6, 0.6);
      if (fem) for (let k = 0; k < 3; k++) P(`M${f(ex + s * (3 + k * 2))},${f(uy - lid + 1.4 + k * 0.6)} l${f(s * 1.5)},-2`, 0.6, 0.7);
      if (old) {
        P(`M${f(ex - 6)},${f(ey + 5)} q6,3 12,0`, 0.6, 0.5);
        P(`M${f(ex + s * 10)},${f(ey - 1)} l${f(s * 4)},-2 M${f(ex + s * 10)},${f(ey + 1)} l${f(s * 4)},1`, 0.5, 0.5);
      }
      // brows
      if (L.brow === "heavy") {
        const by = ey - r(6.5, 8.5);
        S(`M${f(ex - s * 9)},${f(by + 1.5)} Q${f(ex)},${f(by - 1.5)} ${f(ex + s * 10)},${f(by + 0.5)}`, fem ? 1.6 : 2.8);
      } else if (L.brow === "arched") {
        const by = ey - r(10, 12);
        S(`M${f(ex - s * 9)},${f(by + 3)} Q${f(ex - s * 1)},${f(by - 4)} ${f(ex + s * 10)},${f(by + 2)}`, fem ? 1.2 : 1.8);
      } else {
        const by = ey - r(8, 11), bw = fem ? 1.1 : 2;
        S(`M${f(ex - s * 9)},${f(by + 1 + (s > 0 ? r(-1, 1) : 0))} Q${f(ex)},${f(by - 3 - r(0, 2))} ${f(ex + s * 10)},${f(by + r(0, 2))}`, bw);
      }
    }

    // round spectacles
    if (has("glasses")) {
      for (const s of [-1, 1]) {
        ring(cx + s * es, ey, 9.5, 1.1, 0.95);
        P(`M${f(cx + s * (es + 9.5))},${f(ey - 1)} L${f(cx + s * rx * 0.97)},${f(ey - 3)}`, 0.9, 0.85);
      }
      P(`M${f(cx - es + 9.5)},${f(ey - 1)} Q${cx},${f(ey - 6)} ${f(cx + es - 9.5)},${f(ey - 1)}`, 1, 0.9);
    }

    // nose
    const nl = r(18, 24) + (L.face === "long" ? 2 : 0);
    S(`M${cx - 2},${f(ey + 2)} C${cx - 3},${f(ey + nl - 6)} ${cx - 9},${f(ey + nl - 1)} ${cx - 4},${f(ey + nl + 1)} Q${cx},${f(ey + nl + 3)} ${cx + 5},${f(ey + nl)}`, 1.1);

    // beard (drawn before mouth)
    const my = ey + nl + 10;
    const moustache = () => {
      S(`M${cx},${f(my - 7)} C${cx - 8},${f(my - 9)} ${cx - 14},${f(my - 4)} ${cx - 18},${f(my + 3)}`, 1.2);
      S(`M${cx},${f(my - 7)} C${cx + 8},${f(my - 9)} ${cx + 14},${f(my - 4)} ${cx + 18},${f(my + 3)}`, 1.2);
    };
    if (L.beard !== "none" && L.bs === "false") {
      // a pharaoh's narrow plaited beard, worn on ceremony, no moustache
      fillP(`M${cx - 5},${f(chin - 3)} L${cx - 6},${f(chin + 22)} Q${cx},${f(chin + 25)} ${cx + 6},${f(chin + 22)} L${cx + 5},${f(chin - 3)} Z`, 1.1);
      for (let y = chin + 1; y < chin + 22; y += 3.5) P(`M${cx - 5},${f(y)} q5,2 10,0`, 0.6, 0.7);
    } else if (L.beard !== "none" && L.bs === "tiered") {
      // long squared beard in rows of curls, as on Assyrian and Persian reliefs
      const bx = rx * 0.98, bw2 = rx * 0.84;
      const bottom = chin + (L.beard === "long" ? 46 : L.beard === "full" ? 26 : 12);
      fillP(`M${f(cx - bx)},${f(cy + 6)} C${f(cx - bx)},${f(cy + 30)} ${f(cx - bw2 - 1)},${f(bottom - 16)} ${f(cx - bw2)},${f(bottom - 2)} Q${cx},${f(bottom + 3)} ${f(cx + bw2)},${f(bottom - 2)} C${f(cx + bw2 + 1)},${f(bottom - 16)} ${f(cx + bx)},${f(cy + 30)} ${f(cx + bx)},${f(cy + 6)} C${f(cx + rx * 0.7)},${f(cy + 22)} ${f(cx + 16)},${f(my - 6)} ${cx},${f(my - 7)} C${f(cx - 16)},${f(my - 6)} ${f(cx - rx * 0.7)},${f(cy + 22)} ${f(cx - bx)},${f(cy + 6)} Z`, 1.2);
      for (let y = cy + 14; y < my + 6; y += 7.5) for (const sg of [-1, 1]) curl(cx + sg * (bx - 5), y, 2.6, 0.7, 0.75);
      let row = 0;
      for (let y = my + 10; y < bottom - 3; y += 8, row++) {
        const half = bw2 - 4;
        if (row % 2 === 0) for (let x = -half + (row % 4 ? 3 : 0); x <= half; x += 6) curl(cx + x, y + r(-0.6, 0.6), 2.3, 0.7, old ? 0.55 : 0.8);
        else for (let x = -half + 2; x <= half; x += 4.2) P(`M${f(cx + x)},${f(y - 4)} q1.8,2.6 0,5.2 q-1.8,2.6 0,5.2`, 0.6, 0.6);
      }
      moustache();
    } else if (L.beard !== "none" && L.bs === "goatee") {
      const gb = chin + (L.beard === "long" ? 26 : L.beard === "full" ? 18 : 12);
      fillP(`M${cx - 9},${f(my + 4)} C${cx - 11},${f(chin + 2)} ${cx - 5},${f(gb - 4)} ${cx},${f(gb)} C${cx + 5},${f(gb - 4)} ${cx + 11},${f(chin + 2)} ${cx + 9},${f(my + 4)} Q${cx},${f(my + 8)} ${cx - 9},${f(my + 4)} Z`, 1.1);
      for (let i = 0; i < 6; i++) { const x = cx + r(-6, 6); P(`M${f(x)},${f(my + 8)} q${f(r(-2, 2))},${f((gb - my) / 2)} ${f((cx - x) * 0.4)},${f(gb - my - 10)}`, 0.6, 0.7); }
      moustache();
    } else if (L.beard !== "none") {
      const len = { short: 6, full: 26, long: 66 }[L.beard] || 20;
      const bx = rx * 0.98;
      const pointed = L.bs === "pointed", curly = L.bs === "curly";
      const bottom = chin + len + (pointed ? 12 : 0);
      let beard;
      if (curly) {
        // squared-off beard of tight curls
        const bw2 = rx * (L.beard === "short" ? 0.7 : 0.82);
        beard = `M${f(cx - bx)},${f(cy + 6)} C${f(cx - bx)},${f(cy + 30)} ${f(cx - bw2 - 2)},${f(bottom - 14)} ${f(cx - bw2)},${f(bottom - 2)} Q${cx},${f(bottom + 6)} ${f(cx + bw2)},${f(bottom - 2)} C${f(cx + bw2 + 2)},${f(bottom - 14)} ${f(cx + bx)},${f(cy + 30)} ${f(cx + bx)},${f(cy + 6)} C${f(cx + rx * 0.7)},${f(cy + 22)} ${f(cx + 16)},${f(my - 6)} ${cx},${f(my - 7)} C${f(cx - 16)},${f(my - 6)} ${f(cx - rx * 0.7)},${f(cy + 22)} ${f(cx - bx)},${f(cy + 6)} Z`;
      } else {
        const sideX = pointed ? rx * 0.42 : rx * 0.62;
        beard = `M${f(cx - bx)},${f(cy + 6)} C${f(cx - bx)},${f(cy + 34)} ${f(cx - sideX)},${f(bottom - 6)} ${cx},${f(bottom + (L.beard === "long" ? 8 : 0))} C${f(cx + sideX)},${f(bottom - 6)} ${f(cx + bx)},${f(cy + 34)} ${f(cx + bx)},${f(cy + 6)} C${f(cx + rx * 0.7)},${f(cy + 22)} ${f(cx + 16)},${f(my - 6)} ${cx},${f(my - 7)} C${f(cx - 16)},${f(my - 6)} ${f(cx - rx * 0.7)},${f(cy + 22)} ${f(cx - bx)},${f(cy + 6)} Z`;
      }
      fillP(beard, 1.2);
      if (curly) {
        for (let y = cy + 14; y < bottom - 2; y += 7.5) {
          const half = y < my + 6 ? 0 : (bx - 4) * Math.min(1, 1 - Math.max(0, y - chin) / (bottom - chin + 18) * 0.25);
          for (const s of [-1, 1]) {
            if (y < my + 6) { curl(cx + s * (bx - 5), y, 2.6, 0.7, 0.75); continue; }
            for (let x = 4; x < half; x += 6.5) curl(cx + s * (x + ((y / 7.5) % 2) * 3), y + r(-1, 1), r(2.2, 3), 0.7, old ? 0.55 : 0.8);
          }
        }
      } else {
        const n = L.beard === "short" ? 10 : 22;
        for (let i = 0; i < n; i++) {
          const t = R(), x = cx + (t - 0.5) * bx * 1.7;
          const y0 = my - 2 + r(0, 10) + Math.abs(t - 0.5) * 20;
          const len2 = r(8, Math.max(10, (bottom - y0) * 0.85));
          P(`M${f(x)},${f(y0)} q${f(r(-4, 4))},${f(len2 / 2)} ${f((cx - x) * (pointed ? 0.4 : 0.18) + r(-3, 3))},${f(len2)}`, 0.6, old ? 0.5 : 0.75);
        }
      }
      moustache();
    }

    // mouth
    const mw = fem ? 8 : 9;
    if (L.mouth === "smile") {
      S(`M${cx - mw - 1},${f(my - 1.5)} Q${cx},${f(my + 5)} ${cx + mw + 1},${f(my - 1.5)}`, fem ? 1.3 : 1.1);
      P(`M${cx - mw + 3},${f(my + 5)} Q${cx},${f(my + 8)} ${cx + mw - 3},${f(my + 5)}`, 0.7, 0.55);
      if (L.beard === "none") P(`M${cx - mw - 3},${f(my - 3)} q-1,2 0,4 M${cx + mw + 3},${f(my - 3)} q1,2 0,4`, 0.6, 0.5);
    } else if (L.mouth === "stern") {
      S(`M${cx - mw},${f(my + 1.5)} Q${cx},${f(my - 1)} ${cx + mw},${f(my + 1.5)}`, fem ? 1.3 : 1.2);
      P(`M${cx - mw + 3},${f(my + 4.5)} Q${cx},${f(my + 6)} ${cx + mw - 3},${f(my + 4.5)}`, 0.7, 0.45);
    } else {
      S(`M${cx - mw},${f(my)} Q${cx},${f(my + r(1, 3.5))} ${cx + mw},${f(my)}`, fem ? 1.3 : 1.1);
      P(`M${cx - mw + 3},${f(my + 4)} Q${cx},${f(my + (fem ? 7 : 6))} ${cx + mw - 3},${f(my + 4)}`, 0.7, 0.55);
    }
    if (!young && L.beard === "none" || old) {
      P(`M${cx - 12},${f(ey + nl - 2)} q-4,8 -2,14 M${cx + 12},${f(ey + nl - 2)} q4,8 2,14`, 0.6, old ? 0.55 : 0.3);
    }
    if (old) {
      P(`M${cx - 14},${f(top + 16)} q14,-4 28,0 M${cx - 10},${f(top + 22)} q10,-3 20,0`, 0.6, 0.45);
    }

    // ── headwear / hair (front layer) ──
    if (showsHair) {
      if (hair === "coils") {
        // close-cropped tight curls (Cushites)
        const base = cy - 2, peak = top - 7;
        fillP(`M${f(cx - rx - 1)},${f(base)} C${f(cx - rx - 5)},${f(top - 10)} ${f(cx + rx + 5)},${f(top - 10)} ${f(cx + rx + 1)},${f(base)} C${f(cx + rx - 3)},${f(hairline + 2)} ${f(cx + rx * 0.4)},${f(hairline - 4)} ${cx},${f(hairline - 3)} C${f(cx - rx * 0.4)},${f(hairline - 4)} ${f(cx - rx + 3)},${f(hairline + 2)} ${f(cx - rx - 1)},${f(base)} Z`, 1.3);
        let row = 0;
        for (let y = peak + 3; y < base - 2; y += 4.4, row++) {
          for (let x = cx - rx; x <= cx + rx; x += 5) {
            const xx = x + (row % 2 ? 2.5 : 0), u = (xx - cx) / (rx - 1), v = (y - base) / (base - peak);
            if (u * u + v * v > 0.92 || y > hairline - 5 + u * u * (base - hairline)) continue;
            curl(xx, y, r(1.6, 2.1), 0.6, 0.75);
          }
        }
      } else if (wig) {
        // Egyptian wig: straight fringe, strands framing the face; the women's
        // long wig is plaited and falls to the chest
        const fy = hairline - 1;
        fillP(`M${f(cx - ww)},${f(wb)} L${f(cx - ww)},${f(cy - 16)} C${f(cx - ww)},${f(top - 16)} ${f(cx + ww)},${f(top - 16)} ${f(cx + ww)},${f(cy - 16)} L${f(cx + ww)},${f(wb)} L${f(cx + rx - 4)},${f(wb)} L${f(cx + rx - 4)},${f(fy)} Q${cx},${f(fy - 3)} ${f(cx - rx + 4)},${f(fy)} L${f(cx - rx + 4)},${f(wb)} Z`, 1.3);
        for (let i = -6; i <= 6; i++) P(`M${f(cx + i * 1.5)},${f(top - 3)} Q${f(cx + i * rx / 9)},${f(top + 4)} ${f(cx + i * (rx - 5) / 6)},${f(fy - 2)}`, 0.6, 0.6);
        for (const sg of [-1, 1]) {
          for (let x = rx - 1; x < ww - 1; x += 3.6) P(`M${f(cx + sg * x)},${f(fy + 2)} V${f(wb - 1)}`, 0.6, 0.6);
          if (hair === "longwig") for (let y = fy + 6; y < wb - 2; y += 6) P(`M${f(cx + sg * (rx - 3))},${f(y)} H${f(cx + sg * (ww - 1))}`, 0.5, 0.45);
        }
        P(`M${f(cx - rx + 4)},${f(fy - 3)} Q${cx},${f(fy - 6)} ${f(cx + rx - 4)},${f(fy - 3)}`, 0.7, 0.6);
      } else if (fem) {
        const pulled = hair === "tied" || hair === "braids" || hair === "sidebraid" || hair === "crownbraid" || hair === "ringlets";
        const femDome = `M${f(cx - rx - 3)},${f(cy + 6)} C${f(cx - rx - 6)},${f(top - 10)} ${f(cx + rx + 6)},${f(top - 10)} ${f(cx + rx + 3)},${f(cy + 6)} C${f(cx + rx - 4)},${f(hairline - 4)} ${cx + 10},${f(hairline - 8)} ${cx},${f(hairline - 2)} C${cx - 10},${f(hairline - 8)} ${f(cx - rx + 4)},${f(hairline - 4)} ${f(cx - rx - 3)},${f(cy + 6)} Z`;
        S(femDome, 1.3);
        if (hair === "waved") {
          // centre parting, hair waved back over the ears to the nape (Greek and Roman women)
          P(`M${cx},${f(hairline - 2)} Q${cx + 1},${f(top - 2)} ${cx + 2},${f(top - 7)}`, 0.8, 0.7);
          for (const sg of [-1, 1]) {
            for (let k = 0; k < 4; k++) {
              const y0 = hairline - 3 - k * 6;
              P(`M${f(cx + sg * 2)},${f(y0)} q${f(sg * 6)},-4 ${f(sg * 11)},0 t${f(sg * 10)},1 t${f(sg * (rx - 17 - k * 2))},${f(4 + k * 2)}`, 0.7, 0.7);
            }
            curl(cx + sg * (rx + 1), cy + 4, 3.2, 0.8, 0.85);
          }
        } else if (pulled) {
          // centre parting, hair combed back
          P(`M${cx},${f(hairline - 2)} Q${cx + 1},${f(top - 2)} ${cx + 2},${f(top - 7)}`, 0.8, 0.7);
          for (const s of [-1, 1]) for (let i = 0; i < 4; i++) P(`M${f(cx + s * 3)},${f(hairline - 1 - i * 2)} q${f(s * (8 + i * 4))},${f(-4 - i * 2)} ${f(s * (rx - 2 - i * 3))},${f(4 + i * 4)}`, 0.6, 0.55);
        } else if (hair === "curly") {
          for (let i = 0; i < 13; i++) {
            const a = Math.PI * (0.06 + 0.88 * i / 12);
            curl(cx - Math.cos(a) * (rx + 1), cy + 2 - Math.sin(a) * (cy - top + 6), r(3, 4.2), 0.8, 0.8);
          }
          for (let i = 0; i < 6; i++) curl(cx - rx * 0.6 + i * rx * 0.24, hairline - 4 + r(-2, 2), r(2.6, 3.4), 0.7, 0.65);
        } else {
          for (let i = 0; i < 8; i++) P(`M${f(cx + r(-20, 20))},${f(top - 4)} q${f(r(-12, 12))},${f(r(10, 18))} ${f(r(-20, 20))},${f(r(14, 24))}`, 0.6, 0.6);
        }
        if (hair === "braids") {
          for (const s of [-1, 1]) {
            const bx0 = cx + s * (rx * 0.9 + 3);
            for (let k = 0; k < 8; k++) {
              const y = cy + 12 + k * 8.5, x = bx0 + s * k * 1.4;
              fillP(`M${f(x - 5)},${f(y - 4)} Q${f(x)},${f(y + 7)} ${f(x + 5)},${f(y - 4)} Q${f(x)},${f(y + 1)} ${f(x - 5)},${f(y - 4)} Z`, 0.9);
            }
            const ty = cy + 12 + 8 * 8.5, tx = bx0 + s * 11;
            P(`M${f(tx - 3)},${f(ty - 3)} h6`, 1.2, 0.85);
            for (let k = -1; k <= 1; k++) P(`M${f(tx + k * 1.5)},${f(ty - 2)} l${f(k * 1.5)},9`, 0.6, 0.7);
          }
        }
        if (hair === "sidebraid") {
          const sg = hash(c.id + "braid") % 2 ? 1 : -1;
          for (let k = 0; k < 9; k++) {
            const y = cy + 10 + k * 8.5, x = cx + sg * (rx * 0.8 + 2 - k * 1.1);
            fillP(`M${f(x - 5.5)},${f(y - 4)} Q${f(x)},${f(y + 7.5)} ${f(x + 5.5)},${f(y - 4)} Q${f(x)},${f(y + 1)} ${f(x - 5.5)},${f(y - 4)} Z`, 0.9);
          }
          const ty = cy + 10 + 9 * 8.5, tx = cx + sg * (rx * 0.8 + 2 - 9 * 1.1);
          P(`M${f(tx - 3)},${f(ty - 3)} h6`, 1.2, 0.85);
          for (let k = -1; k <= 1; k++) P(`M${f(tx + k * 1.5)},${f(ty - 2)} l${f(k * 1.5)},9`, 0.6, 0.7);
        }
        if (hair === "crownbraid") {
          for (let k = 0; k <= 10; k++) {
            const t = k / 10, x = cx - rx * 0.95 + t * rx * 1.9;
            const y = hairline - 7 - Math.sin(Math.PI * t) * (hairline - top - 2);
            fillP(`M${f(x - 4.5)},${f(y + 3)} Q${f(x)},${f(y - 5)} ${f(x + 4.5)},${f(y + 3)} Q${f(x)},${f(y - 0.5)} ${f(x - 4.5)},${f(y + 3)} Z`, 0.9);
          }
        }
        if (hair === "ringlets") {
          // corkscrew ringlets framing the face
          for (const sg of [-1, 1]) for (let k = 0; k < 10; k++) curl(cx + sg * (rx + 3 + k * 0.7), hairline + 2 + k * 7, 3.1, 0.8, 0.85);
        }
        if (head === "net") {
          // a net of beads over the hair (Egyptian women)
          const nc = `nc-${uid}`, b1 = cx + top, b2 = cx - top;
          out.push(`<clipPath id="${nc}"><path d="${femDome}"/></clipPath><g clip-path="url(#${nc})">`);
          for (let k = -10; k <= 10; k++) {
            out.push(`<path d="M${f(b1 + k * 12 - 60)},60 l-80,80 M${f(b2 + k * 12 - 20)},40 l80,80" stroke-width="0.6" opacity="0.6"/>`);
          }
          for (let i = -8; i <= 8; i++) for (let j = -2; j <= 10; j++) if ((i + j) % 2 === 0) ring(cx + i * 6, top - 10 + j * 6, 1.3, 0.6, 0.85, true);
          out.push(`</g>`);
        }
      } else if (hair === "shaved") {
        // shaved head: only a faint line where the hair would grow
        out.push(`<path d="M${f(cx - rx + 2)},${f(cy - 4)} C${f(cx - rx)},${f(hairline - 6)} ${f(cx + rx)},${f(hairline - 6)} ${f(cx + rx - 2)},${f(cy - 4)}" stroke-width="0.7" opacity="0.4" stroke-dasharray="1 3"/>`);
        P(`M${f(cx - rx * 0.5)},${f(top + 8)} q${f(rx * 0.3)},-5 ${f(rx * 0.6)},-4`, 0.6, 0.4);
      } else if (hair === "cropped") {
        // short Roman crop, combed forward to a straight fringe
        fillP(`M${f(cx - rx - 1)},${f(cy - 4)} C${f(cx - rx - 4)},${f(top - 8)} ${f(cx + rx + 4)},${f(top - 8)} ${f(cx + rx + 1)},${f(cy - 4)} L${f(cx + rx - 3)},${f(hairline + 1)} C${f(cx + rx * 0.5)},${f(hairline - 4)} ${f(cx - rx * 0.5)},${f(hairline - 4)} ${f(cx - rx + 3)},${f(hairline + 1)} Z`, 1.3);
        for (let i = -6; i <= 6; i++) {
          const x = cx + i * rx / 7.5;
          P(`M${f(x + i * 0.8)},${f(hairline - 13 + Math.abs(i) * 0.6)} q1.5,5 -1,${f(9 - Math.abs(i) * 0.3)}`, 0.7, 0.7);
        }
        for (let i = 0; i < 8; i++) P(`M${f(cx + r(-6, 6))},${f(top - 4)} q${f(r(-8, 8))},4 ${f(r(-14, 14))},${f(r(8, 12))}`, 0.6, 0.5);
      } else if (hair === "bald") {
        // balding crown with side hair
        for (const s of [-1, 1]) S(`M${f(cx + s * rx * 0.98)},${f(cy + 4)} C${f(cx + s * (rx + 6))},${f(cy - 14)} ${f(cx + s * (rx + 2))},${f(hairline)} ${f(cx + s * rx * 0.6)},${f(top + 6)}`, 1.4);
        P(`M${cx - 10},${f(top + 8)} q10,-3 20,0`, 0.6, 0.4);
      } else {
        const hairTop = `M${f(cx - rx - 2)},${f(cy + 2)} C${f(cx - rx - 8)},${f(top - 12)} ${f(cx + rx + 8)},${f(top - 12)} ${f(cx + rx + 2)},${f(cy + 2)} C${f(cx + rx - 2)},${f(hairline + 4)} ${f(cx + rx * 0.4)},${f(hairline - r(2, 8))} ${cx},${f(hairline - 4)} C${f(cx - rx * 0.4)},${f(hairline - r(2, 8))} ${f(cx - rx + 2)},${f(hairline + 4)} ${f(cx - rx - 2)},${f(cy + 2)} Z`;
        fillP(hairTop, 1.3);
        if (hair === "curly") {
          for (let i = 0; i < 13; i++) {
            const a = Math.PI * i / 12;
            curl(cx - Math.cos(a) * (rx + 1), cy - 2 - Math.sin(a) * (cy - top + 6), r(3, 4.2), 0.8, 0.85);
          }
          for (let i = 0; i < 14; i++) curl(cx + r(-rx * 0.75, rx * 0.75), r(top - 2, hairline - 4), r(2.4, 3.4), 0.7, 0.6);
        } else if (hair === "long" || hair === "curled") {
          P(`M${cx + 2},${f(hairline - 4)} Q${cx + 1},${f(top - 2)} ${cx},${f(top - 8)}`, 0.8, 0.7);
          for (const s of [-1, 1]) for (let i = 0; i < 4; i++) P(`M${f(cx + s * 4)},${f(hairline - 3 - i * 2)} q${f(s * (8 + i * 4))},${f(-3 - i)} ${f(s * (rx - i * 3))},${f(8 + i * 3)}`, 0.6, 0.55);
        } else {
          for (let i = 0; i < 12; i++) {
            const x = cx + r(-rx, rx);
            P(`M${f(x)},${f(top - 6 + Math.abs(x - cx) * 0.2)} q${f(r(-6, 6))},${f(r(6, 12))} ${f(r(-8, 8))},${f(r(14, 22))}`, 0.6, 0.6);
          }
        }
      }
      if (head === "band") {
        const y = hairline - (fem ? 6 : 4);
        S(`M${f(cx - rx - 4)},${f(y + 4)} Q${cx},${f(y - 8)} ${f(cx + rx + 4)},${f(y + 4)}`, 1.6);
        P(`M${f(cx - rx - 4)},${f(y + 7.5)} Q${cx},${f(y - 4.5)} ${f(cx + rx + 4)},${f(y + 7.5)}`, 0.9, 0.8);
        // knot and ties at one side
        const s = R() < 0.5 ? -1 : 1, kx = cx + s * (rx + 4);
        P(`M${f(kx)},${f(y + 5)} q${f(s * 6)},10 ${f(s * 3)},22 M${f(kx)},${f(y + 5)} q${f(s * 10)},6 ${f(s * 11)},18`, 0.9, 0.8);
        if (has("rosette")) {
          // a rosette at the front of the band (Assyrian and Egyptian diadems)
          for (let k = 0; k < 6; k++) { const a = (Math.PI * k) / 3; ring(cx + Math.cos(a) * 3.6, y - 2 + Math.sin(a) * 3.6, 1.7, 0.7, 0.9, true); }
          ring(cx, y - 2, 2, 0.9, 0, true);
        }
        if (has("frontlet")) {
          P(`M${cx},${f(y - 2)} v4`, 0.7, 0.8);
          fillP(`M${cx},${f(y + 2)} l3.4,4.4 l-3.4,4.4 l-3.4,-4.4 Z`, 0.9);
        }
      }
      if (head === "crown") {
        const cyb = top + 2, w = rx * 0.9;
        let d = `M${f(cx - w)},${f(cyb)} `;
        const pts = 5;
        for (let i = 0; i <= pts * 2; i++) {
          const x = cx - w + (2 * w * i) / (pts * 2);
          const y = i % 2 ? cyb - 18 : cyb - 6;
          d += `L${f(x)},${f(y)} `;
        }
        d += `L${f(cx + w)},${f(cyb)} Q${cx},${f(cyb + 6)} ${f(cx - w)},${f(cyb)} Z`;
        fillP(d, 1.3);
        for (let i = 1; i < pts * 2; i += 2) {
          const x = cx - w + (2 * w * i) / (pts * 2);
          out.push(`<circle cx="${f(x)}" cy="${f(cyb - 20)}" r="1.8" stroke-width="1"/>`);
        }
        P(`M${f(cx - w + 2)},${f(cyb - 3)} Q${cx},${f(cyb + 2)} ${f(cx + w - 2)},${f(cyb - 3)}`, 0.7, 0.6);
      }
      if (head === "battle") {
        // crenellated crown of the Persian kings (Behistun relief)
        const cyb = top + 4, w = rx * 0.92, n = 7;
        let d = `M${f(cx - w)},${f(cyb)} L${f(cx - w)},${f(cyb - 16)} `;
        for (let i = 0; i < n; i++) {
          const x0 = cx - w + (2 * w * i) / n, x1 = cx - w + (2 * w * (i + 0.5)) / n, x2 = cx - w + (2 * w * (i + 1)) / n;
          d += `L${f(x1)},${f(cyb - 16)} L${f(x1)},${f(cyb - 9)} L${f(x2)},${f(cyb - 9)} L${f(x2)},${f(cyb - 16)} `;
          void x0;
        }
        d += `L${f(cx + w)},${f(cyb)} Q${cx},${f(cyb + 6)} ${f(cx - w)},${f(cyb)} Z`;
        fillP(d, 1.3);
        P(`M${f(cx - w + 2)},${f(cyb - 4)} Q${cx},${f(cyb + 1)} ${f(cx + w - 2)},${f(cyb - 4)}`, 0.7, 0.6);
        for (let i = 0; i < 5; i++) ring(cx - w * 0.6 + i * w * 0.3, cyb - 5, 1.3, 0.7, 0.8, true);
      }
      if (head === "wreath") {
        // laurel wreath of the Caesars, as on their coins
        const y = hairline - 7;
        for (const sg of [-1, 1]) for (let k = 0; k < 7; k++) {
          const t = 0.04 + k * 0.064, x = cx + sg * (rx + 3) * (1 - 2 * t), py = y + 4 - 12 * (1 - Math.pow(1 - 2 * t, 2)) * 0.5;
          for (const off of [-1, 1]) fillP(`M${f(x)},${f(py)} q${f(-sg * 4)},${f(off * 6 - 2)} ${f(-sg * 12)},${f(off * 5)} q${f(sg * 5)},${f(-off * 1)} ${f(sg * 12)},${f(-off * 5)} Z`, 0.9);
        }
      }
      if (head === "pearls") {
        // a band of pearls with a jewel at the brow, its ties hanging behind (Constantine's coins)
        const y = hairline - 6, x0 = cx - rx - 3, x2 = cx + rx + 3;
        P(`M${f(x0)},${f(y + 7)} Q${cx},${f(y - 11)} ${f(x2)},${f(y + 7)}`, 0.8, 0.7);
        for (let k = 0; k <= 16; k++) { const [x, yy] = qp(x0, y + 4, cx, y - 14, x2, y + 4, k / 16); ring(x, yy, 2, 0.8, 0.9, true); }
        fillP(`M${cx},${f(y - 13)} l5,6 l-5,6 l-5,-6 Z`, 1);
        ring(cx, y - 7, 1.6, 0.7, 0.9);
        const s = hash(c.id + "tie") % 2 ? 1 : -1, kx = cx + s * (rx + 3);
        P(`M${f(kx)},${f(y + 6)} q${f(s * 6)},10 ${f(s * 3)},24 M${f(kx)},${f(y + 6)} q${f(s * 10)},6 ${f(s * 12)},20`, 0.9, 0.8);
      }
    } else if (head === "skullcap" || head === "doctorcap") {
      // the black skullcap of late medieval scholars (Wycliffe, Calvin, Tyndale) and
      // the softer, wider cap of a doctor of theology (Luther); hair shows below
      const hairTop = `M${f(cx - rx - 2)},${f(cy + 2)} C${f(cx - rx - 8)},${f(top - 12)} ${f(cx + rx + 8)},${f(top - 12)} ${f(cx + rx + 2)},${f(cy + 2)} C${f(cx + rx - 2)},${f(hairline + 4)} ${f(cx + rx * 0.4)},${f(hairline - 4)} ${cx},${f(hairline - 4)} C${f(cx - rx * 0.4)},${f(hairline - 4)} ${f(cx - rx + 2)},${f(hairline + 4)} ${f(cx - rx - 2)},${f(cy + 2)} Z`;
      fillP(hairTop, 1.3);
      for (let i = 0; i < 8; i++) { const x = cx + r(-rx, rx); P(`M${f(x)},${f(hairline - 14)} q${f(r(-4, 4))},5 ${f(r(-6, 6))},${f(r(8, 12))}`, 0.6, 0.6); }
      const cap = head === "skullcap"
        ? `M${f(cx - rx - 1)},${f(hairline - 10)} C${f(cx - rx - 3)},${f(top - 14)} ${f(cx + rx + 3)},${f(top - 14)} ${f(cx + rx + 1)},${f(hairline - 10)} Q${cx},${f(hairline - 20)} ${f(cx - rx - 1)},${f(hairline - 10)} Z`
        : `M${f(cx - rx - 7)},${f(cy - 6)} C${f(cx - rx - 14)},${f(top - 18)} ${f(cx + rx + 14)},${f(top - 22)} ${f(cx + rx + 7)},${f(cy - 8)} C${f(cx + rx)},${f(hairline - 6)} ${f(cx + rx * 0.5)},${f(hairline - 12)} ${cx},${f(hairline - 11)} C${f(cx - rx * 0.5)},${f(hairline - 12)} ${f(cx - rx)},${f(hairline - 6)} ${f(cx - rx - 7)},${f(cy - 6)} Z`;
      fillP(cap, 1.4);
      // dense hatching makes the cap read as black
      const cc = `cc-${uid}`;
      out.push(`<clipPath id="${cc}"><path d="${cap}"/></clipPath><g clip-path="url(#${cc})">`);
      for (let k = -12; k <= 12; k++) P(`M${f(cx + k * 3.2 - 30)},${f(top - 30)} l40,${f(cy - top + 10)}`, 0.7, 0.75);
      out.push(`</g>`);
      if (head === "doctorcap") for (let i = -2; i <= 2; i++) P(`M${f(cx + i * rx * 0.36)},${f(hairline - 13)} Q${f(cx + i * rx * 0.3)},${f(top - 6)} ${f(cx + i * 3)},${f(top - 16)}`, 0.6, 0.45);
    } else if (head === "flatcap") {
      // Tudor flat cap: a soft crown, a wide stiff brim worn at an angle, a feather and a badge
      for (const sg of [-1, 1]) S(`M${f(cx + sg * (rx + 1))},${f(cy - 2)} C${f(cx + sg * (rx + 3))},${f(hairline + 4)} ${f(cx + sg * (rx - 2))},${f(hairline - 2)} ${f(cx + sg * (rx - 6))},${f(hairline - 6)}`, 1.2);
      const hb = hairline - 4, s = hash(c.id + "cap") % 2 ? 1 : -1;
      fillP(`M${f(cx - rx + 2)},${f(hb - 2)} C${f(cx - rx)},${f(top - 18)} ${f(cx + rx)},${f(top - 20)} ${f(cx + rx - 2)},${f(hb - 4)} Z`, 1.3);
      for (let i = -3; i <= 3; i++) P(`M${f(cx + i * rx * 0.24)},${f(hb - 6)} Q${f(cx + i * rx * 0.2)},${f(top - 8)} ${f(cx + i * 2)},${f(top - 14)}`, 0.6, 0.5);
      fillP(`M${f(cx - rx - 18)},${f(hb + 2 - s * 4)} Q${cx},${f(hb - 16)} ${f(cx + rx + 18)},${f(hb + 2 + s * 4)} Q${cx},${f(hb + 12)} ${f(cx - rx - 18)},${f(hb + 2 - s * 4)} Z`, 1.3);
      P(`M${f(cx - rx - 12)},${f(hb + 3 - s * 3)} Q${cx},${f(hb + 6)} ${f(cx + rx + 12)},${f(hb + 3 + s * 3)}`, 0.7, 0.6);
      const fx = cx + s * (rx - 6), fy = hb - 6;
      fillP(`M${f(fx)},${f(fy)} C${f(fx + s * 8)},${f(fy - 26)} ${f(fx + s * 30)},${f(fy - 28)} ${f(fx + s * 40)},${f(fy - 10)} C${f(fx + s * 28)},${f(fy - 18)} ${f(fx + s * 14)},${f(fy - 14)} ${f(fx)},${f(fy)} Z`, 1);
      for (let k = 1; k < 9; k++) { const t = k / 9, [x, y] = qp(fx, fy, fx + s * 14, fy - 30, fx + s * 40, fy - 10, t); P(`M${f(x)},${f(y)} l${f(s * 2)},-6`, 0.6, 0.7); }
      ring(cx - s * 8, hb - 3, 3.2, 1, 0, true); ring(cx - s * 8, hb - 3, 1.2, 0.6, 0.9);
    } else if (head === "furhat") {
      // tall hat with a turned-up fur brim (the printer Gutenberg as usually pictured)
      for (const sg of [-1, 1]) S(`M${f(cx + sg * (rx + 1))},${f(cy - 2)} C${f(cx + sg * (rx + 3))},${f(hairline + 4)} ${f(cx + sg * (rx - 2))},${f(hairline - 2)} ${f(cx + sg * (rx - 6))},${f(hairline - 6)}`, 1.2);
      const fb = hairline - 2;
      fillP(`M${f(cx - rx + 2)},${f(fb - 12)} C${f(cx - rx - 4)},${f(top - 34)} ${f(cx + rx + 6)},${f(top - 38)} ${f(cx + rx - 2)},${f(fb - 12)} Z`, 1.3);
      for (let i = -2; i <= 2; i++) P(`M${f(cx + i * rx * 0.34)},${f(fb - 14)} Q${f(cx + i * rx * 0.3 + 4)},${f(top - 18)} ${f(cx + i * 3 + 6)},${f(top - 30)}`, 0.6, 0.5);
      const brim = `M${f(cx - rx - 6)},${f(fb + 2)} C${f(cx - rx - 8)},${f(fb - 10)} ${f(cx - rx - 6)},${f(fb - 16)} ${f(cx - rx + 2)},${f(fb - 18)} Q${cx},${f(fb - 26)} ${f(cx + rx - 2)},${f(fb - 18)} C${f(cx + rx + 6)},${f(fb - 16)} ${f(cx + rx + 8)},${f(fb - 10)} ${f(cx + rx + 6)},${f(fb + 2)} Q${cx},${f(fb - 8)} ${f(cx - rx - 6)},${f(fb + 2)} Z`;
      fillP(brim, 1.4);
      for (let k = 0; k < 22; k++) { const t = k / 21, [x, y] = qp(cx - rx - 3, fb - 6, cx, fb - 22, cx + rx + 3, fb - 6, t); curl(x, y + r(-2, 2), r(1.8, 2.6), 0.6, 0.65); }
    } else if (head === "mitre") {
      // a bishop's mitre: a pointed cap with a band round the base and up the middle, ribbons behind
      for (const sg of [-1, 1]) {
        fillP(`M${f(cx + sg * (rx + 1))},${f(cy + 4)} L${f(cx + sg * (rx + 7))},${f(cy + 4)} L${f(cx + sg * (rx + 10))},${f(chin + 22)} L${f(cx + sg * (rx + 3))},${f(chin + 22)} Z`, 1);
        P(`M${f(cx + sg * (rx + 3))},${f(chin + 16)} L${f(cx + sg * (rx + 10))},${f(chin + 16)}`, 0.7, 0.7);
        S(`M${f(cx + sg * (rx + 1))},${f(cy - 2)} C${f(cx + sg * (rx + 2))},${f(hairline + 4)} ${f(cx + sg * (rx - 2))},${f(hairline + 2)} ${f(cx + sg * (rx - 5))},${f(hairline)}`, 1.1);
      }
      const mb = hairline;
      fillP(`M${f(cx - rx - 1)},${f(mb)} L${f(cx - rx + 3)},${f(top - 6)} Q${f(cx - 12)},${f(top - 24)} ${cx},${f(top - 42)} Q${f(cx + 12)},${f(top - 24)} ${f(cx + rx - 3)},${f(top - 6)} L${f(cx + rx + 1)},${f(mb)} Q${cx},${f(mb - 8)} ${f(cx - rx - 1)},${f(mb)} Z`, 1.4);
      P(`M${f(cx - rx)},${f(mb - 9)} Q${cx},${f(mb - 17)} ${f(cx + rx)},${f(mb - 9)}`, 0.9, 0.8);
      P(`M${cx - 4},${f(mb - 12)} L${cx - 4},${f(top - 32)} M${cx + 4},${f(mb - 12)} L${cx + 4},${f(top - 32)}`, 0.9, 0.8);
      P(`M${cx - 3.5},${f(top - 14)} h7 M${cx},${f(top - 18)} v8`, 0.9, 0.9);
    } else if (head === "kavuk") {
      // the Ottoman sultan's great round turban wound about a tall cap whose top shows (Bellini's portrait of Mehmed II)
      const kb = hairline + 2;
      fillP(`M${cx - 7},${f(top - 30)} Q${cx},${f(top - 50)} ${cx + 7},${f(top - 30)} Z`, 1.1);
      const dome = `M${f(cx - rx - 8)},${f(kb)} C${f(cx - rx - 22)},${f(top - 4)} ${f(cx - rx + 2)},${f(top - 38)} ${cx},${f(top - 36)} C${f(cx + rx - 2)},${f(top - 38)} ${f(cx + rx + 22)},${f(top - 4)} ${f(cx + rx + 8)},${f(kb)} Q${cx},${f(kb - 10)} ${f(cx - rx - 8)},${f(kb)} Z`;
      fillP(dome, 1.4);
      const kc = `kc-${uid}`;
      out.push(`<clipPath id="${kc}"><path d="${dome}"/></clipPath><g clip-path="url(#${kc})">`);
      for (let k = -5; k <= 5; k++) P(`M${f(cx - rx - 14 + k * 9)},${f(kb + 2)} Q${f(cx + k * 6)},${f(top - 4)} ${f(cx + rx + 6 + k * 9)},${f(top - 40)}`, 0.7, 0.6);
      out.push(`</g>`);
      S(`M${f(cx - rx - 8)},${f(kb)} Q${cx},${f(kb - 10)} ${f(cx + rx + 8)},${f(kb)}`, 1.6);
    } else if (head === "softcap") {
      // soft cap whose crown falls forward to a point, as on Jehu's envoys (Black Obelisk)
      for (const sg of [-1, 1]) S(`M${f(cx + sg * (rx + 1))},${f(cy - 2)} C${f(cx + sg * (rx + 3))},${f(hairline + 4)} ${f(cx + sg * (rx - 2))},${f(hairline - 2)} ${f(cx + sg * (rx - 6))},${f(hairline - 6)}`, 1.2);
      const cap = `M${f(cx - rx - 2)},${f(hairline - 1)} C${f(cx - rx - 4)},${f(top - 8)} ${f(cx - 8)},${f(top - 24)} ${f(cx + 10)},${f(top - 22)} C${f(cx + 24)},${f(top - 21)} ${f(cx + 30)},${f(top - 8)} ${f(cx + 26)},${f(top + 2)} C${f(cx + 22)},${f(top - 6)} ${f(cx + 16)},${f(top - 8)} ${f(cx + rx + 2)},${f(hairline - 1)} Q${cx},${f(hairline - 9)} ${f(cx - rx - 2)},${f(hairline - 1)} Z`;
      fillP(cap, 1.4);
      S(`M${f(cx - rx - 2)},${f(hairline - 1)} Q${cx},${f(hairline - 9)} ${f(cx + rx + 2)},${f(hairline - 1)}`, 1.8);
      for (let i = 0; i < 3; i++) P(`M${f(cx - rx * 0.6 + i * 10)},${f(hairline - 6)} Q${f(cx - 4 + i * 6)},${f(top - 10)} ${f(cx + 12 + i * 4)},${f(top - 18 + i * 4)}`, 0.6, 0.5);
    } else if (head === "cap") {
      // side hair below the cap
      for (const s of [-1, 1]) S(`M${f(cx + s * (rx + 1))},${f(cy - 2)} C${f(cx + s * (rx + 3))},${f(hairline + 4)} ${f(cx + s * (rx - 2))},${f(hairline - 2)} ${f(cx + s * (rx - 6))},${f(hairline - 6)}`, 1.2);
      const cap = `M${f(cx - rx - 1)},${f(hairline - 2)} C${f(cx - rx - 2)},${f(top - 14)} ${f(cx + rx + 2)},${f(top - 14)} ${f(cx + rx + 1)},${f(hairline - 2)} Q${cx},${f(hairline - 10)} ${f(cx - rx - 1)},${f(hairline - 2)} Z`;
      fillP(cap, 1.4);
      P(`M${f(cx - rx)},${f(hairline - 6)} Q${cx},${f(hairline - 14)} ${f(cx + rx)},${f(hairline - 6)}`, 0.8, 0.7);
      for (let i = -2; i <= 2; i++) P(`M${f(cx + i * rx * 0.3)},${f(hairline - 9 - (2 - Math.abs(i)) * 1.5)} Q${f(cx + i * rx * 0.2)},${f(top - 4)} ${cx},${f(top - 8)}`, 0.6, 0.5);
    } else if (head === "helmet" || head === "conehelm") {
      // a plain metal helmet rising to a blunt point, no crest (1 Sam 17:5);
      // the Assyrian one rises to a tall point, as on the Lachish reliefs
      const pk = head === "conehelm" ? 46 : 28;
      const dome = `M${f(cx - rx - 4)},${f(hairline + 4)} C${f(cx - rx - 6)},${f(top - 6)} ${f(cx - 10)},${f(top - pk + 6)} ${cx},${f(top - pk)} C${f(cx + 10)},${f(top - pk + 6)} ${f(cx + rx + 6)},${f(top - 6)} ${f(cx + rx + 4)},${f(hairline + 4)} Q${cx},${f(hairline - 5)} ${f(cx - rx - 4)},${f(hairline + 4)} Z`;
      fillP(dome, 1.5);
      S(`M${f(cx - rx - 5)},${f(hairline + 4)} Q${cx},${f(hairline - 6)} ${f(cx + rx + 5)},${f(hairline + 4)}`, 2.2);
      P(`M${f(cx - rx - 3)},${f(hairline - 1)} Q${cx},${f(hairline - 11)} ${f(cx + rx + 3)},${f(hairline - 1)}`, 0.8, 0.7);
      P(`M${cx},${f(top - pk + 2)} L${cx},${f(hairline - 6)}`, 0.8, 0.6);
      // side hair below the rim
      for (const s2 of [-1, 1]) S(`M${f(cx + s2 * (rx + 1))},${f(cy + 2)} C${f(cx + s2 * (rx + 3))},${f(hairline + 8)} ${f(cx + s2 * (rx + 1))},${f(hairline + 6)} ${f(cx + s2 * (rx - 2))},${f(hairline + 3)}`, 1.1);
    } else if (head === "feathers") {
      // Philistine headdress: a band with a row of upright feathers (Medinet Habu)
      const fb = hairline - 4;
      for (const sg of [-1, 1]) S(`M${f(cx + sg * (rx + 1))},${f(cy - 2)} C${f(cx + sg * (rx + 3))},${f(hairline + 4)} ${f(cx + sg * (rx - 2))},${f(hairline - 2)} ${f(cx + sg * (rx - 6))},${f(hairline - 6)}`, 1.2);
      fillP(`M${f(cx - rx - 2)},${f(fb + 2)} C${f(cx - rx - 3)},${f(top - 6)} ${f(cx + rx + 3)},${f(top - 6)} ${f(cx + rx + 2)},${f(fb + 2)} Z`, 1.3);
      for (let i = 0; i <= 12; i++) {
        const t = i / 12, x = cx - rx + t * 2 * rx, by = fb - Math.sin(Math.PI * t) * 7, a = (t - 0.5) * 0.8, len = 30 + Math.sin(Math.PI * t) * 10;
        const tx = x + Math.sin(a) * len, ty = by - Math.cos(a) * len, mx = (x + tx) / 2, my2 = (by + ty) / 2;
        fillP(`M${f(x - 3)},${f(by)} Q${f(mx - 4)},${f(my2)} ${f(tx)},${f(ty)} Q${f(mx + 4)},${f(my2)} ${f(x + 3)},${f(by)} Z`, 0.9);
        P(`M${f(x)},${f(by)} L${f(x + (tx - x) * 0.85)},${f(by + (ty - by) * 0.85)}`, 0.5, 0.6);
      }
      fillP(`M${f(cx - rx - 3)},${f(fb + 5)} Q${cx},${f(fb - 5)} ${f(cx + rx + 3)},${f(fb + 5)} L${f(cx + rx + 3)},${f(fb - 2)} Q${cx},${f(fb - 12)} ${f(cx - rx - 3)},${f(fb - 2)} Z`, 1.2);
      let zz = "";
      for (let i = 0; i <= 14; i++) {
        const t = i / 14, x = (1 - t) * (1 - t) * (cx - rx - 3) + 2 * (1 - t) * t * cx + t * t * (cx + rx + 3), y = (1 - t) * (1 - t) * (fb + 1.5) + 2 * (1 - t) * t * (fb - 8.5) + t * t * (fb + 1.5);
        zz += `${i ? "L" : "M"}${f(x)},${f(y + (i % 2 ? -2.2 : 2.2))} `;
      }
      P(zz, 0.7, 0.8);
    } else if (head === "tallcap" || head === "fez" || head === "fluted") {
      // Babylonian tall cap; the Assyrian king's cap with its point;
      // the Persian fluted cap that widens to the top (Persepolis)
      const yb = hairline - 1, yt = head === "fez" ? top - 18 : head === "fluted" ? top - 20 : top - 28;
      const wb2 = head === "fez" ? rx + 3 : rx + 1, wt = head === "fez" ? rx * 0.72 : head === "fluted" ? rx + 4 : rx - 2;
      for (const sg of [-1, 1]) S(`M${f(cx + sg * (rx + 1))},${f(cy - 2)} C${f(cx + sg * (rx + 3))},${f(hairline + 4)} ${f(cx + sg * (rx - 2))},${f(hairline - 2)} ${f(cx + sg * (rx - 6))},${f(hairline - 6)}`, 1.2);
      if (head === "fez") fillP(`M${cx - 5},${f(yt + 1)} L${cx},${f(yt - 13)} L${cx + 5},${f(yt + 1)} Z`, 1.1);
      fillP(`M${f(cx - wb2)},${f(yb)} L${f(cx - wt)},${f(yt)} Q${cx},${f(yt - 6)} ${f(cx + wt)},${f(yt)} L${f(cx + wb2)},${f(yb)} Q${cx},${f(yb - 8)} ${f(cx - wb2)},${f(yb)} Z`, 1.4);
      P(`M${f(cx - wt)},${f(yt)} Q${cx},${f(yt + 6)} ${f(cx + wt)},${f(yt)}`, 0.8, 0.7);
      if (head === "fluted") {
        for (let i = -4; i <= 4; i++) P(`M${f(cx + i * wb2 / 5)},${f(yb - 5)} L${f(cx + i * wt / 5)},${f(yt + 2)}`, 0.7, 0.6);
      } else {
        const b1 = yb - 6, b2 = yb - (head === "fez" ? 12 : 15);
        P(`M${f(cx - wb2 + 1)},${f(b1)} Q${cx},${f(b1 - 8)} ${f(cx + wb2 - 1)},${f(b1)}`, 0.8, 0.75);
        P(`M${f(cx - wb2 + 2)},${f(b2)} Q${cx},${f(b2 - 8)} ${f(cx + wb2 - 2)},${f(b2)}`, 0.8, 0.75);
        for (let i = -2; i <= 2; i++) ring(cx + i * rx * 0.36, (b1 + b2) / 2 - 4 + Math.abs(i) * 1.4, 2, 0.7, 0.85);
      }
    } else if (head === "roundcap") {
      // rounded felt cap with a rolled brim (Medes; Midianites in the "Lessons" book)
      for (const sg of [-1, 1]) S(`M${f(cx + sg * (rx + 1))},${f(cy - 2)} C${f(cx + sg * (rx + 3))},${f(hairline + 4)} ${f(cx + sg * (rx - 2))},${f(hairline - 2)} ${f(cx + sg * (rx - 6))},${f(hairline - 6)}`, 1.2);
      fillP(`M${f(cx - rx - 3)},${f(hairline)} C${f(cx - rx - 7)},${f(top - 22)} ${f(cx + rx + 7)},${f(top - 22)} ${f(cx + rx + 3)},${f(hairline)} Q${cx},${f(hairline - 9)} ${f(cx - rx - 3)},${f(hairline)} Z`, 1.4);
      for (let i = -3; i <= 3; i++) P(`M${f(cx + i * rx * 0.28)},${f(hairline - 9 + Math.abs(i))} Q${f(cx + i * rx * 0.24)},${f(top - 8)} ${f(cx + i * 2)},${f(top - 15)}`, 0.6, 0.5);
      fillP(`M${f(cx - rx - 4)},${f(hairline + 1)} Q${cx},${f(hairline - 9)} ${f(cx + rx + 4)},${f(hairline + 1)} L${f(cx + rx + 4)},${f(hairline - 5)} Q${cx},${f(hairline - 15)} ${f(cx - rx - 4)},${f(hairline - 5)} Z`, 1.2);
    } else if (head === "cone") {
      // tall pointed cap, its tip bent forward (Phoenician and Hittite reliefs)
      for (const sg of [-1, 1]) S(`M${f(cx + sg * (rx + 1))},${f(cy - 2)} C${f(cx + sg * (rx + 3))},${f(hairline + 4)} ${f(cx + sg * (rx - 2))},${f(hairline - 2)} ${f(cx + sg * (rx - 6))},${f(hairline - 6)}`, 1.2);
      fillP(`M${f(cx - rx - 2)},${f(hairline)} C${f(cx - rx + 2)},${f(top - 12)} ${f(cx - 2)},${f(top - 34)} ${f(cx + 14)},${f(top - 42)} C${f(cx + 10)},${f(top - 28)} ${f(cx + rx + 2)},${f(top - 8)} ${f(cx + rx + 2)},${f(hairline)} Q${cx},${f(hairline - 9)} ${f(cx - rx - 2)},${f(hairline)} Z`, 1.4);
      S(`M${f(cx - rx - 2)},${f(hairline)} Q${cx},${f(hairline - 9)} ${f(cx + rx + 2)},${f(hairline)}`, 1.6);
      P(`M${f(cx - rx * 0.4)},${f(hairline - 7)} Q${f(cx - 2)},${f(top - 14)} ${f(cx + 10)},${f(top - 36)}`, 0.6, 0.5);
    } else if (head === "romanhelm") {
      // Roman officer's helmet with cheek guards and a short crest
      // the crest sits across the helmet, so it fans out above it
      fillP(`M${f(cx - rx * 0.8)},${f(top - 2)} Q${cx},${f(top - 16)} ${f(cx + rx * 0.8)},${f(top - 2)} Q${f(cx + rx * 0.9)},${f(top - 22)} ${cx},${f(top - 30)} Q${f(cx - rx * 0.9)},${f(top - 22)} ${f(cx - rx * 0.8)},${f(top - 2)} Z`, 1.1);
      for (let i = -7; i <= 7; i++) { const a = i * 0.17; P(`M${f(cx + Math.sin(a) * 12)},${f(top - 10 + Math.abs(i) * 0.4)} L${f(cx + Math.sin(a) * 30)},${f(top - 10 - Math.cos(a) * 18)}`, 0.6, 0.6); }
      fillP(`M${f(cx - rx - 4)},${f(hairline + 2)} C${f(cx - rx - 6)},${f(top - 14)} ${f(cx + rx + 6)},${f(top - 14)} ${f(cx + rx + 4)},${f(hairline + 2)} Q${cx},${f(hairline - 6)} ${f(cx - rx - 4)},${f(hairline + 2)} Z`, 1.5);
      S(`M${f(cx - rx - 5)},${f(hairline + 2)} Q${cx},${f(hairline - 7)} ${f(cx + rx + 5)},${f(hairline + 2)}`, 2.2);
      for (const sg of [-1, 1]) {
        fillP(`M${f(cx + sg * (rx + 4))},${f(hairline + 1)} L${f(cx + sg * (rx - 4))},${f(hairline + 3)} C${f(cx + sg * (rx - 6))},${f(cy + 12)} ${f(cx + sg * (rx - 9))},${f(cy + 24)} ${f(cx + sg * (rx - 5))},${f(cy + 32)} L${f(cx + sg * (rx + 3))},${f(cy + 28)} C${f(cx + sg * (rx + 5))},${f(cy + 12)} ${f(cx + sg * (rx + 6))},${f(cy)} ${f(cx + sg * (rx + 4))},${f(hairline + 1)} Z`, 1.2);
        ring(cx + sg * (rx - 1), cy + 8, 1.4, 0.7, 0.8, true);
      }
    } else if (head === "nemes") {
      // front of the striped headcloth: band across the brow, lappets on the chest
      const hb = hairline;
      fillP(`M${f(cx - rx - 8)},${f(cy - 10)} L${f(cx - rx - 8)},${f(cy - 16)} C${f(cx - rx - 8)},${f(top - 14)} ${f(cx + rx + 8)},${f(top - 14)} ${f(cx + rx + 8)},${f(cy - 16)} L${f(cx + rx + 8)},${f(cy - 10)} L${f(cx + rx - 2)},${f(cy - 8)} L${f(cx + rx - 3)},${f(hb)} Q${cx},${f(hb - 5)} ${f(cx - rx + 3)},${f(hb)} L${f(cx - rx + 2)},${f(cy - 8)} Z`, 1.3);
      for (let i = -5; i <= 5; i++) P(`M${f(cx + i * 3)},${f(top - 2)} Q${f(cx + i * rx / 7)},${f(top + 3)} ${f(cx + i * (rx - 3) / 5)},${f(hb - 5)}`, 2, 0.5);
      S(`M${f(cx - rx + 3)},${f(hb)} Q${cx},${f(hb - 5)} ${f(cx + rx - 3)},${f(hb)}`, 1.8);
      P(`M${f(cx - rx + 2)},${f(hb - 4)} Q${cx},${f(hb - 9)} ${f(cx + rx - 2)},${f(hb - 4)}`, 0.8, 0.8);
      for (const sg of [-1, 1]) {
        fillP(`M${f(cx + sg * (rx - 2))},${f(cy - 8)} L${f(cx + sg * (rx + 10))},${f(cy - 8)} L${f(cx + sg * (rx + 16))},${f(chin + 36)} L${f(cx + sg * (rx + 1))},${f(chin + 36)} Z`, 1.2);
        for (let y = cy - 3; y < chin + 34; y += 5) {
          const t = (y - cy + 8) / (chin + 44 - cy);
          P(`M${f(cx + sg * (rx - 1 + t * 2))},${f(y)} L${f(cx + sg * (rx + 10 + t * 6))},${f(y)}`, 1.6, 0.6);
        }
      }
      // the rearing cobra at the brow
      fillP(`M${cx - 2.5},${f(hb - 2)} C${cx - 4},${f(hb - 8)} ${cx + 3},${f(hb - 10)} ${cx},${f(hb - 15)} C${cx + 5},${f(hb - 14)} ${cx + 4},${f(hb - 8)} ${cx + 2.5},${f(hb - 2)} Z`, 0.9);
    } else if (head === "turban" || head === "priest") {
      const tall = head === "priest" ? 34 : 12, wide = head === "priest" ? 5 : 6;
      const tb = `M${f(cx - rx - 5)},${f(hairline + 2)} C${f(cx - rx - wide - 8)},${f(hairline - 14)} ${f(cx - rx - wide)},${f(top - tall)} ${cx},${f(top - tall - 2)} C${f(cx + rx + wide)},${f(top - tall)} ${f(cx + rx + wide + 8)},${f(hairline - 14)} ${f(cx + rx + 5)},${f(hairline + 2)} Q${cx},${f(hairline - 8)} ${f(cx - rx - 5)},${f(hairline + 2)} Z`;
      fillP(tb, 1.4);
      for (let i = 0; i < 4; i++) {
        const y = hairline - 4 - i * ((tall + 26) / 5);
        const ww = rx + (head === "priest" ? 2 : wide - 2) - i * 4;
        S(`M${f(cx - ww)},${f(y + 6 - i * 2)} Q${f(cx + r(-6, 6))},${f(y - 6 - r(0, 6))} ${f(cx + ww)},${f(y - 6 + i * 2)}`, 0.9, 0.8);
      }
      if (head === "turban") {
        const s2 = hash(c.id + "t") % 2 ? 1 : -1, tx = cx + s2 * (rx + 4);
        fillP(`M${f(tx - s2 * 4)},${f(hairline - 2)} C${f(tx + s2 * 6)},${f(cy + 6)} ${f(tx + s2 * 2)},${f(chin - 4)} ${f(tx + s2 * 10)},${f(chin + 14)} L${f(tx + s2 * 18)},${f(chin + 10)} C${f(tx + s2 * 12)},${f(chin - 8)} ${f(tx + s2 * 14)},${f(cy + 4)} ${f(tx + s2 * 4)},${f(hairline - 6)} Z`, 1.1);
        P(`M${f(tx + s2 * 4)},${f(cy)} q${f(s2 * 3)},20 ${f(s2 * 9)},${f(chin + 8 - cy)}`, 0.6, 0.55);
      }
      if (head === "priest") {
        out.push(`<rect x="${cx - 8}" y="${f(hairline - 14)}" width="16" height="8" rx="1" stroke-width="1.1"/>`);
        P(`M${cx - 5},${f(hairline - 10)} h10`, 0.6, 0.7);
      }
    }

    // nose ring on one nostril (Gen 24:47; Isa 3:21)
    if (has("nosering")) ring(cx + 5.5, ey + nl + 3.2, 2.6, 0.9, 0.9);
    // earrings hang below the ear, or just below the veil's edge
    if (has("earrings")) {
      for (const s of [-1, 1]) {
        const x = cx + s * (rx * 0.97 + (fem ? 2.5 : 4)), y = cy + (fem ? 17 : 19);
        P(`M${f(x)},${f(y - 2)} v3`, 0.7, 0.8);
        ring(x, y + 3.5, fem ? 2.8 : 2.4, 1, 0, true);
        if (fem) out.push(`<circle cx="${f(x)}" cy="${f(y + 9.5)}" r="1.1" fill="currentColor" stroke="none" opacity="0.8"/>`);
      }
    }

    return `<g transform="rotate(${f(tilt)} 100 120)">${out.join("")}</g>`;
  }

  let counter = 0;
  window.Portrait = {
    /** Returns an HTML string: <svg> drawing or <img> override. */
    html(c, cls) {
      if (c.portrait) return `<img class="${cls || ""}" src="${c.portrait}" alt="Portrait of ${c.name}">`;
      // Muhammad and the first leaders of Islam are not drawn: Muslims hold that he must not
      // be pictured, and "Mankind's Search for God" (ch. 12) shows only places, never him
      if (c.look && c.look.initial) {
        const ch = String(c.name || "?").trim().charAt(0).toUpperCase();
        return `<svg class="${cls || ""}" viewBox="0 0 200 240" fill="none" stroke="currentColor" role="img" aria-label="${c.name}"><circle cx="100" cy="120" r="62" stroke-width="1.4" opacity="0.7"/><circle cx="100" cy="120" r="54" stroke-width="0.7" opacity="0.4"/><text x="100" y="120" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-style="italic">${ch}</text></svg>`;
      }
      const uid = c.id + "-" + (counter++);
      return `<svg class="${cls || ""}" viewBox="0 0 200 240" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Drawing of ${c.name}">${build(c, uid)}</svg>`;
    },
    /** Re-run the design assignment, e.g. after the people list changes. */
    assign,
    /** Which people's dress a person is drawn in, e.g. "egyptian". */
    cultureOf: culture,
    /** Name of the design a person is drawn with. */
    designOf(c) { return presetOf(c).name; },
    /** One stand-in person per design, for a contact sheet. */
    designs() {
      const all = [];
      for (const g of ["m", "f"]) PRESETS[g].forEach((p, i) => all.push({ id: `design-${g}-${i}`, name: p.name, gender: g, born: 0, died: 60, _preset: i }));
      return all;
    }
  };
})();
