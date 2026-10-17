/*
 * Procedural line-art portraits.
 * Each character gets one of 16 male or 16 female portrait designs (PRESETS
 * below), drawn with small per-person differences seeded by its id. The
 * design is picked once for the whole list (assign()) so that relatives and
 * people born close together get different designs. A character's own
 * `look` hints for age and beard win over the design's, and so does a crown or
 * a priest's turban. If a character has
 * a `portrait` image path in the data file, that image is used instead.
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
   * Portrait designs. Index 0 of each list is the original drawing.
   *   age   young | adult | old         head  cloth | crown | priest | veil | bare | turban
   *   beard none | short | full | long        | cap | helmet | hood | band | shawl
   *   bs    beard shape: plain | pointed | curly | goatee
   *   hair  short | curly | long | bald | braids | bun | crownbraid   (shows with bare, crown, band)
   *   face  oval | round | long | square      brow  soft | heavy | arched
   *   mouth calm | smile | stern              eye   open | narrow | downcast
   *   extras: earrings, nosering, necklace, crescent (pendant), stripes (cloth), vband (band over veil)
   *
   * Dress follows what the Bible and Iron Age reliefs show, not later fashions:
   * beards (Lev 19:27), a Nazirite's long hair (Num 6:5), the priest's turban
   * (Ex 28:4, 39), veils and shawls over women's heads (Gen 24:65; the Judean
   * women on the Lachish reliefs), helmets without crests (1 Sam 17:5),
   * earrings, nose rings, headbands and crescent ornaments (Gen 24:47;
   * Judg 8:21, 24; Isa 3:18-21), braided hair (1 Pet 3:3), and the short
   * wrapped turban with a hanging end worn by Judean men on the Lachish reliefs.
   */
  const PRESETS = {
    m: [
      { name: "Headcloth", age: "adult", head: "cloth", beard: "full" },
      { name: "Young shepherd", age: "young", head: "bare", hair: "curly", beard: "short", face: "round", mouth: "smile" },
      { name: "Patriarch", age: "old", head: "cloth", beard: "long", face: "long", brow: "heavy", mouth: "stern", extras: ["stripes"] },
      { name: "Elder in a cap", age: "old", head: "cap", beard: "long", bs: "pointed", face: "long" },
      { name: "Soldier", age: "adult", head: "helmet", beard: "short", face: "square", brow: "heavy", mouth: "stern" },
      { name: "Scribe", age: "adult", head: "turban", beard: "full", bs: "pointed", face: "long", eye: "narrow" },
      { name: "Fisherman", age: "adult", head: "band", hair: "curly", beard: "full", bs: "curly", face: "square" },
      { name: "Bald elder", age: "old", head: "bare", hair: "bald", beard: "full", face: "round", brow: "heavy" },
      { name: "Beardless youth", age: "young", head: "bare", hair: "short", beard: "none", mouth: "smile" },
      { name: "Traveller", age: "adult", head: "hood", beard: "full", eye: "narrow" },
      { name: "Levite", age: "adult", head: "cap", beard: "short", face: "round", mouth: "smile" },
      { name: "Nazirite", age: "adult", head: "bare", hair: "long", beard: "full", face: "long", brow: "heavy" },
      { name: "Herdsman", age: "adult", head: "cloth", beard: "short", bs: "curly", face: "round", mouth: "smile", extras: ["stripes"] },
      { name: "Old man in a turban", age: "old", head: "turban", beard: "full", bs: "curly", face: "square", brow: "heavy" },
      { name: "Merchant", age: "adult", head: "band", hair: "short", beard: "short", bs: "goatee", eye: "narrow", extras: ["earrings", "necklace"] },
      { name: "Young man in a headcloth", age: "young", head: "cloth", beard: "none", face: "long", eye: "downcast" }
    ],
    f: [
      { name: "Veil", age: "adult", head: "veil" },
      { name: "Braids", age: "young", head: "bare", hair: "braids", face: "round", mouth: "smile" },
      { name: "Hair up", age: "adult", head: "bare", hair: "bun", face: "long", extras: ["earrings"] },
      { name: "Long hair", age: "young", head: "bare", hair: "long", extras: ["necklace"] },
      { name: "Veil and crescent pendant", age: "adult", head: "veil", brow: "arched", extras: ["crescent"] },
      { name: "Shawl", age: "adult", head: "shawl", face: "round", mouth: "smile" },
      { name: "Veiled elder", age: "old", head: "veil", face: "long", mouth: "stern" },
      { name: "Curls", age: "adult", head: "bare", hair: "curly", extras: ["earrings"] },
      { name: "Mantle", age: "adult", head: "hood", eye: "downcast" },
      { name: "Headband", age: "adult", head: "band", hair: "long", brow: "arched" },
      { name: "Elder in a shawl", age: "old", head: "shawl", face: "round" },
      { name: "Girl in a shawl", age: "young", head: "shawl", face: "long", mouth: "smile", extras: ["earrings"] },
      { name: "Veil and headband", age: "adult", head: "veil", face: "square", eye: "narrow", extras: ["vband", "necklace"] },
      { name: "Braided crown", age: "adult", head: "bare", hair: "crownbraid", brow: "arched", mouth: "smile" },
      { name: "Elder with hair up", age: "old", head: "bare", hair: "bun", face: "round", eye: "downcast" },
      { name: "Veil, earrings and nose ring", age: "young", head: "veil", face: "round", mouth: "smile", extras: ["earrings", "nosering"] }
    ]
  };
  const group = (c) => (c.gender === "f" ? "f" : "m");

  /* ───────────── which design each person gets ─────────────
   * Per sex, people are taken in birth order; each gets the design used
   * longest ago, skipping any design a parent, child, sibling or spouse
   * already has. So the 16 people born around the same time all look
   * different, and so do close relatives. Done once for the whole list. */
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
      pick(sex.filter((c) => c.key), PRESETS[g], links, true);
      pick(sex, PRESETS[g], links, false);
    }
  }
  function pick(people, designs, links, spreadHeads) {
    const n = designs.length, last = new Array(n).fill(-1e7), heads = [];
    people.forEach((c, i) => {
      if (assigned.has(c.id)) { last[assigned.get(c.id)] = i; return; }
      const taken = new Set(), ahead = new Set();
      for (const id of links.get(c.id) || []) if (assigned.has(id)) taken.add(assigned.get(id));
      for (let j = i + 1; j < Math.min(people.length, i + 12); j++) if (assigned.has(people[j].id)) ahead.add(assigned.get(people[j].id));
      let best = 0, bestScore = Infinity;
      for (let p = 0; p < n; p++) {
        let score = (taken.has(p) ? 1e9 : 0) + (ahead.has(p) ? 1e5 : 0) + last[p] + ((hash(c.id + p) % 1000) / 1e4);
        if (spreadHeads && heads.indexOf(designs[p].head) >= 0) score += 1e6;
        if (score < bestScore) { bestScore = score; best = p; }
      }
      assigned.set(c.id, best);
      last[best] = i;
      if (spreadHeads) { heads.push(designs[best].head); if (heads.length > 2) heads.shift(); }
    });
  }
  function presetOf(c) {
    if (c._preset != null) return PRESETS[group(c)][c._preset];
    if (!assigned) assign(window.TIMELINE_PEOPLE || window.TIMELINE_CHARACTERS || []);
    if (!assigned.has(c.id)) return PRESETS[group(c)][hash(c.id) % PRESETS[group(c)].length];
    return PRESETS[group(c)][assigned.get(c.id)];
  }

  function defaultLook(c) {
    const fem = c.gender === "f";
    const look = Object.assign({ hair: fem ? "long" : "short", bs: "plain", face: "oval", brow: "soft", mouth: "calm", eye: "open", extras: [] }, presetOf(c));
    const hint = c.look || {};
    if (hint.age) look.age = hint.age;
    else if (c.died - c.born > 300) look.age = "old";
    // Hand-set headwear only wins when it says something: a king's crown or a
    // priest's turban. Otherwise the design's headwear gives the variety, except
    // that only unnamed extras are drawn in a soldier's helmet.
    if (hint.head && (hint.head === "crown" || hint.head === "priest" || look.head === "helmet")) look.head = hint.head;
    if (hint.beard) look.beard = hint.beard;
    if (!look.beard) look.beard = fem ? "none" : (look.age === "old" ? "long" : "full");
    // An old man always has a beard, even when his design's is clean-shaven.
    if (!hint.beard && look.age === "old" && look.beard === "none") look.beard = "full";
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
    const showsHair = head === "bare" || head === "crown" || head === "band";

    // halo rings (background)
    out.push(`<circle cx="100" cy="112" r="92" stroke-width="0.6" opacity="0.25"/>`);
    out.push(`<circle cx="100" cy="112" r="84" stroke-width="0.4" opacity="0.14" stroke-dasharray="2 5"/>`);

    // shoulders / robe
    const sh = fem ? 62 : 72;
    const robe = `M${cx - sh - 18},240 C${cx - sh - 10},${chin + 40} ${cx - 40},${chin + 22} ${cx - 16},${chin + 14} L${cx + 16},${chin + 14} C${cx + 40},${chin + 22} ${cx + sh + 10},${chin + 40} ${cx + sh + 18},240`;
    fillP(robe, 1.3);
    S(`M${cx - 18},${chin + 15} L${cx},${chin + 40} L${cx + 18},${chin + 15}`, 1);
    for (let i = 0; i < 4; i++) {
      const x = cx + (i < 2 ? -1 : 1) * r(26, sh - 2);
      P(`M${f(x)},${f(chin + r(36, 50))} q${f(r(-6, 6))},${f(r(18, 28))} ${f(r(-4, 4))},${f(r(34, 46))}`, 0.7, 0.55);
    }
    // neck
    S(`M${cx - 13},${chin - 10} C${cx - 13},${chin + 4} ${cx - 15},${chin + 10} ${cx - 17},${chin + 16}`, 1.1);
    S(`M${cx + 13},${chin - 10} C${cx + 13},${chin + 4} ${cx + 15},${chin + 10} ${cx + 17},${chin + 16}`, 1.1);

    // ── back layers: long hair / cloth / veil drape behind the face ──
    if (showsHair && fem && (hair === "long" || hair === "curly")) {
      const hl = `M${cx - rx - 4},${cy - 10} C${cx - rx - 14},${cy + 40} ${cx - rx - 16},${chin + 30} ${cx - rx - 20},${chin + 58} L${cx + rx + 20},${chin + 58} C${cx + rx + 16},${chin + 30} ${cx + rx + 14},${cy + 40} ${cx + rx + 4},${cy - 10} Z`;
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
      const hl = `M${cx - rx - 3},${cy - 12} C${cx - rx - 10},${cy + 20} ${cx - rx - 12},${chin} ${cx - rx - 14},${chin + 22} L${cx + rx + 14},${chin + 22} C${cx + rx + 12},${chin} ${cx + rx + 10},${cy + 20} ${cx + rx + 3},${cy - 12} Z`;
      fillP(hl, 1.1);
      for (let i = 0; i < 8; i++) {
        const s = i % 2 ? 1 : -1, x = cx + s * (rx + r(0, 10));
        P(`M${f(x)},${f(cy + r(-6, 10))} q${f(s * r(1, 5))},${f(r(20, 30))} ${f(s * r(3, 8))},${f(r(40, 56))}`, 0.6, 0.6);
      }
    }
    if (showsHair && fem && hair === "bun") {
      const by = top - 1;
      ring(cx + r(-3, 3), by, 11 + r(-1, 1.5), 1.3, 0, true);
      for (let i = 0; i < 3; i++) P(`M${f(cx - 10 + i * 3)},${f(by - 2 - i * 3)} q${f(10 - i * 2)},${f(-6 + i)} ${f(18 - i * 5)},${f(4 - i)}`, 0.6, 0.6);
    }
    if (head === "cloth" || head === "veil" || head === "hood") {
      const w = head === "veil" ? 14 : head === "hood" ? 20 : 16;
      const peak = head === "veil" ? 10 : head === "hood" ? 20 : 12;
      const drape = `M${cx},${top - peak} C${cx + rx + w + 6},${top - 8} ${cx + rx + w + 4},${cy + 30} ${cx + rx + w + 22},${chin + 52} L${cx + rx + 2},${chin + 54} L${cx - rx - 2},${chin + 54} L${cx - rx - w - 22},${chin + 52} C${cx - rx - w - 4},${cy + 30} ${cx - rx - w - 6},${top - 8} ${cx},${top - peak} Z`;
      fillP(drape, 1.4);
      for (let i = 0; i < 6; i++) {
        const s = i % 2 ? 1 : -1, x = cx + s * (rx + r(5, w + 8));
        P(`M${f(x)},${f(cy + r(-10, 10))} q${f(s * r(1, 6))},${f(r(30, 45))} ${f(s * r(6, 14))},${f(r(60, 80))}`, 0.7, 0.55);
      }
      if (head === "cloth" && has("stripes")) {
        for (const s of [-1, 1]) for (const o of [9, 12.5]) {
          P(`M${f(cx + s * (rx + o - 4))},${f(top + 4)} C${f(cx + s * (rx + o + 2))},${f(cy + 10)} ${f(cx + s * (rx + o + 6))},${f(cy + 40)} ${f(cx + s * (rx + o + 14))},${f(chin + 50)}`, 0.9, 0.7);
        }
      }
    }
    if (head === "shawl") {
      // the shawl falls long over one shoulder and short over the other
      const s2 = R() < 0.5 ? -1 : 1, lo = (k) => (k === s2 ? chin + 56 : chin + 26), ww = (k) => (k === s2 ? 24 : 12);
      const sh2 = `M${cx},${f(top - 12)} C${f(cx + rx + 14)},${f(top - 10)} ${f(cx + rx + 12)},${f(cy + 20)} ${f(cx + rx + ww(1))},${f(lo(1))} C${f(cx + rx * 0.4)},${f(lo(1) + 4)} ${f(cx - rx * 0.4)},${f(lo(-1) + 4)} ${f(cx - rx - ww(-1))},${f(lo(-1))} C${f(cx - rx - 12)},${f(cy + 20)} ${f(cx - rx - 14)},${f(top - 10)} ${cx},${f(top - 12)} Z`;
      fillP(sh2, 1.3);
      for (let i = 0; i < 4; i++) P(`M${f(cx + s2 * (rx + r(4, 14)))},${f(cy + r(0, 16))} q${f(s2 * r(2, 6))},${f(r(20, 30))} ${f(s2 * r(6, 14))},${f(r(40, 56))}`, 0.7, 0.55);
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
      ? showsHair && (hair === "bun" || hair === "braids" || hair === "crownbraid" || hair === "short")
      : head === "bare" || head === "crown" || head === "turban" || head === "priest" || head === "cap" || head === "band" || head === "helmet";
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
      S(`M${f(ex - 8)},${f(uy)} C${f(ex - 4)},${f(uy - lid)} ${f(ex + 4)},${f(uy - lid)} ${f(ex + 8)},${f(uy)}`, fem ? 1.5 : 1.3);
      P(`M${f(ex - 7)},${f(ey + 0.5)} C${f(ex - 3)},${f(ey + (L.eye === "narrow" ? 2 : 3))} ${f(ex + 3)},${f(ey + (L.eye === "narrow" ? 2 : 3))} ${f(ex + 7)},${f(ey + 0.5)}`, 0.7, 0.6);
      const iy = L.eye === "downcast" ? ey + 0.9 : L.eye === "narrow" ? ey : ey - 0.5;
      out.push(`<circle cx="${f(ex + r(-0.5, 0.5))}" cy="${f(iy)}" r="${L.eye === "open" ? 2.3 : 1.9}" fill="currentColor" stroke="none"/>`);
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

    // nose
    const nl = r(18, 24) + (L.face === "long" ? 2 : 0);
    S(`M${cx - 2},${f(ey + 2)} C${cx - 3},${f(ey + nl - 6)} ${cx - 9},${f(ey + nl - 1)} ${cx - 4},${f(ey + nl + 1)} Q${cx},${f(ey + nl + 3)} ${cx + 5},${f(ey + nl)}`, 1.1);

    // beard (drawn before mouth)
    const my = ey + nl + 10;
    const moustache = () => {
      S(`M${cx},${f(my - 7)} C${cx - 8},${f(my - 9)} ${cx - 14},${f(my - 4)} ${cx - 18},${f(my + 3)}`, 1.2);
      S(`M${cx},${f(my - 7)} C${cx + 8},${f(my - 9)} ${cx + 14},${f(my - 4)} ${cx + 18},${f(my + 3)}`, 1.2);
    };
    if (L.beard !== "none" && L.bs === "goatee") {
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
      if (fem) {
        const pulled = hair === "bun" || hair === "braids" || hair === "crownbraid";
        S(`M${f(cx - rx - 3)},${f(cy + 6)} C${f(cx - rx - 6)},${f(top - 10)} ${f(cx + rx + 6)},${f(top - 10)} ${f(cx + rx + 3)},${f(cy + 6)} C${f(cx + rx - 4)},${f(hairline - 4)} ${cx + 10},${f(hairline - 8)} ${cx},${f(hairline - 2)} C${cx - 10},${f(hairline - 8)} ${f(cx - rx + 4)},${f(hairline - 4)} ${f(cx - rx - 3)},${f(cy + 6)} Z`, 1.3);
        if (pulled) {
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
        if (hair === "crownbraid") {
          for (let k = 0; k <= 10; k++) {
            const t = k / 10, x = cx - rx * 0.95 + t * rx * 1.9;
            const y = hairline - 7 - Math.sin(Math.PI * t) * (hairline - top - 2);
            fillP(`M${f(x - 4.5)},${f(y + 3)} Q${f(x)},${f(y - 5)} ${f(x + 4.5)},${f(y + 3)} Q${f(x)},${f(y - 0.5)} ${f(x - 4.5)},${f(y + 3)} Z`, 0.9);
          }
        }
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
        } else if (hair === "long") {
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
    } else if (head === "cloth") {
      // a plain cloth over the head, its folded front edge framing the face
      // (no cord ring: that is a later Bedouin fashion)
      const cap = `M${f(cx - rx - 6)},${f(hairline - 4)} Q${cx},${f(hairline - 16)} ${f(cx + rx + 6)},${f(hairline - 4)} C${f(cx + rx + 10)},${f(top - 4)} ${f(cx + 12)},${f(top - 14)} ${cx},${f(top - 12)} C${f(cx - 12)},${f(top - 14)} ${f(cx - rx - 10)},${f(top - 4)} ${f(cx - rx - 6)},${f(hairline - 4)} Z`;
      fillP(cap, 1.3);
      S(`M${f(cx - rx - 6)},${f(hairline - 4)} Q${cx},${f(hairline - 16)} ${f(cx + rx + 6)},${f(hairline - 4)}`, 1.4);
      P(`M${f(cx - rx - 4)},${f(hairline - 8)} Q${cx},${f(hairline - 19)} ${f(cx + rx + 4)},${f(hairline - 8)}`, 0.7, 0.55);
      for (let i = 0; i < 5; i++) P(`M${f(cx + r(-rx, rx))},${f(top - 8)} q${f(r(-4, 4))},${f(r(6, 10))} ${f(r(-3, 3))},${f(r(12, 18))}`, 0.6, 0.45);
    } else if (head === "veil") {
      const cap = `M${f(cx - rx - 4)},${f(cy - 2)} C${f(cx - rx - 6)},${f(top - 6)} ${f(cx + rx + 6)},${f(top - 6)} ${f(cx + rx + 4)},${f(cy - 2)} C${f(cx + rx - 2)},${f(hairline - 8)} ${f(cx - rx + 2)},${f(hairline - 8)} ${f(cx - rx - 4)},${f(cy - 2)} Z`;
      fillP(cap, 1.3);
      for (const s of [-1, 1]) P(`M${f(cx + s * 4)},${f(hairline - 6)} q${f(s * 10)},2 ${f(s * (rx - 2))},14`, 0.8, 0.65);
      P(`M${f(cx - rx + 4)},${f(top + 2)} Q${cx},${f(top - 8)} ${f(cx + rx - 4)},${f(top + 2)}`, 0.6, 0.4);
      if (has("vband")) {
        S(`M${f(cx - rx - 3)},${f(hairline - 2)} Q${cx},${f(hairline - 16)} ${f(cx + rx + 3)},${f(hairline - 2)}`, 1.8);
        P(`M${f(cx - rx - 3)},${f(hairline + 1.5)} Q${cx},${f(hairline - 12.5)} ${f(cx + rx + 3)},${f(hairline + 1.5)}`, 0.8, 0.7);
      }
    } else if (head === "hood") {
      // peaked hood with a thick hem framing the face
      const cap = `M${f(cx - rx - 5)},${f(cy + 4)} C${f(cx - rx - 8)},${f(top - 4)} ${f(cx - 16)},${f(top - 16)} ${cx},${f(top - 20)} C${f(cx + 16)},${f(top - 16)} ${f(cx + rx + 8)},${f(top - 4)} ${f(cx + rx + 5)},${f(cy + 4)} C${f(cx + rx)},${f(hairline - 2)} ${f(cx + rx * 0.5)},${f(hairline - 10)} ${cx},${f(hairline - 10)} C${f(cx - rx * 0.5)},${f(hairline - 10)} ${f(cx - rx)},${f(hairline - 2)} ${f(cx - rx - 5)},${f(cy + 4)} Z`;
      fillP(cap, 1.3);
      S(`M${f(cx - rx - 2)},${f(cy + 2)} C${f(cx - rx + 2)},${f(hairline - 4)} ${f(cx - rx * 0.5)},${f(hairline - 6)} ${cx},${f(hairline - 6)} C${f(cx + rx * 0.5)},${f(hairline - 6)} ${f(cx + rx - 2)},${f(hairline - 4)} ${f(cx + rx + 2)},${f(cy + 2)}`, 1.8);
      for (const s of [-1, 1]) {
        P(`M${f(cx + s * 6)},${f(top - 14)} q${f(s * 12)},6 ${f(s * (rx - 2))},${f(hairline - top + 6)}`, 0.7, 0.5);
        S(`M${f(cx + s * (rx + 2))},${f(cy + 4)} C${f(cx + s * (rx + 6))},${f(cy + 30)} ${f(cx + s * (rx + 2))},${f(chin + 10)} ${f(cx + s * 18)},${f(chin + 26)}`, 1.2);
      }
      if (!fem) for (let i = 0; i < 6; i++) P(`M${f(cx - rx * 0.6 + i * rx * 0.24)},${f(hairline - 4)} l${f(r(-2, 2))},${f(r(4, 7))}`, 0.6, 0.6);
    } else if (head === "shawl") {
      const cap = `M${f(cx - rx - 4)},${f(cy + 2)} C${f(cx - rx - 8)},${f(top - 12)} ${f(cx + rx + 8)},${f(top - 12)} ${f(cx + rx + 4)},${f(cy + 2)} C${f(cx + rx - 2)},${f(hairline - 6)} ${f(cx - rx + 2)},${f(hairline - 6)} ${f(cx - rx - 4)},${f(cy + 2)} Z`;
      fillP(cap, 1.3);
      S(`M${f(cx - rx - 1)},${f(cy)} C${f(cx - rx + 3)},${f(hairline - 3)} ${f(cx + rx - 3)},${f(hairline - 3)} ${f(cx + rx + 1)},${f(cy)}`, 1.1);
      for (const t of [-1, 1]) P(`M${f(cx + t * 6)},${f(top - 8)} q${f(t * 14)},6 ${f(t * (rx + 2))},${f(hairline - top + 10)}`, 0.7, 0.5);
      // hair showing at the parting
      for (const t of [-1, 1]) P(`M${f(cx + t * 2)},${f(hairline - 4)} q${f(t * 8)},1 ${f(t * (rx - 8))},8`, 0.7, 0.6);
    } else if (head === "cap") {
      // side hair below the cap
      for (const s of [-1, 1]) S(`M${f(cx + s * (rx + 1))},${f(cy - 2)} C${f(cx + s * (rx + 3))},${f(hairline + 4)} ${f(cx + s * (rx - 2))},${f(hairline - 2)} ${f(cx + s * (rx - 6))},${f(hairline - 6)}`, 1.2);
      const cap = `M${f(cx - rx - 1)},${f(hairline - 2)} C${f(cx - rx - 2)},${f(top - 14)} ${f(cx + rx + 2)},${f(top - 14)} ${f(cx + rx + 1)},${f(hairline - 2)} Q${cx},${f(hairline - 10)} ${f(cx - rx - 1)},${f(hairline - 2)} Z`;
      fillP(cap, 1.4);
      P(`M${f(cx - rx)},${f(hairline - 6)} Q${cx},${f(hairline - 14)} ${f(cx + rx)},${f(hairline - 6)}`, 0.8, 0.7);
      for (let i = -2; i <= 2; i++) P(`M${f(cx + i * rx * 0.3)},${f(hairline - 9 - (2 - Math.abs(i)) * 1.5)} Q${f(cx + i * rx * 0.2)},${f(top - 4)} ${cx},${f(top - 8)}`, 0.6, 0.5);
    } else if (head === "helmet") {
      // a plain metal helmet rising to a blunt point, no crest (1 Sam 17:5)
      const dome = `M${f(cx - rx - 4)},${f(hairline + 4)} C${f(cx - rx - 6)},${f(top - 6)} ${f(cx - 10)},${f(top - 22)} ${cx},${f(top - 28)} C${f(cx + 10)},${f(top - 22)} ${f(cx + rx + 6)},${f(top - 6)} ${f(cx + rx + 4)},${f(hairline + 4)} Q${cx},${f(hairline - 5)} ${f(cx - rx - 4)},${f(hairline + 4)} Z`;
      fillP(dome, 1.5);
      S(`M${f(cx - rx - 5)},${f(hairline + 4)} Q${cx},${f(hairline - 6)} ${f(cx + rx + 5)},${f(hairline + 4)}`, 2.2);
      P(`M${f(cx - rx - 3)},${f(hairline - 1)} Q${cx},${f(hairline - 11)} ${f(cx + rx + 3)},${f(hairline - 1)}`, 0.8, 0.7);
      P(`M${cx},${f(top - 26)} L${cx},${f(hairline - 6)}`, 0.8, 0.6);
      // side hair below the rim
      for (const s2 of [-1, 1]) S(`M${f(cx + s2 * (rx + 1))},${f(cy + 2)} C${f(cx + s2 * (rx + 3))},${f(hairline + 8)} ${f(cx + s2 * (rx + 1))},${f(hairline + 6)} ${f(cx + s2 * (rx - 2))},${f(hairline + 3)}`, 1.1);
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
      const uid = c.id + "-" + (counter++);
      return `<svg class="${cls || ""}" viewBox="0 0 200 240" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Drawing of ${c.name}">${build(c, uid)}</svg>`;
    },
    /** Re-run the design assignment, e.g. after the people list changes. */
    assign,
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
