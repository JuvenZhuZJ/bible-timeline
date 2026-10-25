#!/usr/bin/env node
/*
 * Builds data/people.js, the list of every person shown on the timeline.
 *
 *   node tools/build-people.mjs
 *
 * Inputs
 *   data/characters.js               hand-written key figures (dates, events, look)
 *   data/source/insight-people.json  every person article in "Insight on the
 *                                    Scriptures", summarised for this site
 *   data/source/unnamed-people.json  people the Bible does not name (Lot's wife and
 *                                    daughters, Noah's wife, Jephthah's daughter ...),
 *                                    written by hand in the same shape
 *   data/source/added-people.json    people whose Insight article is missing from the
 *                                    extracted list (Abednego), same shape; "solo": no
 *                                    relatives, so no other record's relative matches them
 *   data/source/companions.json      people who served or traveled together (Elijah and
 *                                    Elisha, Paul and Barnabas), each group with its verses
 *   data/source/overrides.json       manual fixes (optional); "same" merges two
 *                                    Insight records of one person ("MISHAEL#2": "MESHACH")
 *   data/source/jobs.json            jobs shown as icons after names (king, prophet ...)
 *   data/source/activities.json      activities of people who are not key figures, taken
 *                                    from what their card says they did (Agrippa I kills
 *                                    James), each with its year, scripture, Chinese text
 *                                    and place
 * Outputs
 *   data/people.js                   window.TIMELINE_PEOPLE, read by js/app.js
 *   data/ASSUMED_DATES.md            people whose dates are placeholders
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const sandbox = { window: {} };
vm.runInNewContext(read("data/characters.js"), sandbox);
const CURATED = sandbox.window.TIMELINE_CHARACTERS;
const extra = (f) => fs.existsSync(path.join(ROOT, f)) ? JSON.parse(read(f)) : [];
const INSIGHT = JSON.parse(read("data/source/insight-people.json"))
  .concat(extra("data/source/unnamed-people.json"), extra("data/source/added-people.json"));
const OVR = fs.existsSync(path.join(ROOT, "data/source/overrides.json")) ? JSON.parse(read("data/source/overrides.json")) : {};
/* activities of other people (step 5); its "dates" are placeholder lives moved to take in an activity */
const ACTS = extra("data/source/activities.json");
OVR.dates = Object.assign({}, OVR.dates, ACTS.dates);

const MIN_Y = -4026, MAX_Y = 100;
const clampY = (y) => Math.max(MIN_Y, Math.min(MAX_Y, Math.round(y)));
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/\(.*?\)/g, " ").replace(/[^a-z\- ]/g, " ").replace(/\s+/g, " ").trim();
const slug = (s) => norm(s).replace(/ /g, "-").replace(/-+/g, "-");

/* ---------- 0. clean the extracted list ----------
   Insight often gives one person two articles under different spellings
   ("Hadassah ... same as Esther"). Those are merged into one record.
   Spirit persons (angels, Satan) and false gods are left out: the
   timeline shows human lifespans. */
const SPIRIT = /^(angel|angels|spirit|spirit creature|god|deity|demon)$/i;
const byKey = new Map(INSIGHT.filter((p) => p && p.key).map((p) => [p.key, p]));
const parent = new Map();
const find = (k) => { while (parent.has(k)) k = parent.get(k); return k; };
for (const p of INSIGHT) {
  if (!p || !p.key) continue;
  const h = p.relHints || "";
  for (const m of h.matchAll(/(\b\w+\s+)?same as ([A-Z][A-Z'\-]+(?:, [A-Z][A-Z'\-]+)?(?:#\w+)*)/g)) {
    if (m[1] && /^(possibly|maybe|probably|perhaps|not|likely|may|might)\s/i.test(m[1])) continue;
    const t = m[2];
    if (!byKey.has(t) || find(t) === find(p.key)) continue;
    parent.set(find(p.key), find(t));
  }
}
for (const [a, b] of Object.entries(OVR.same || {})) if (byKey.has(a) && byKey.has(b) && find(a) !== find(b)) parent.set(find(a), find(b));
const merged = new Map();
for (const p of INSIGHT) {
  if (!p || !p.key || SPIRIT.test(p.group || "")) continue;
  const root = find(p.key);
  if (root === p.key) continue;
  const r = byKey.get(root);
  r.aka = [...new Set([...(r.aka || []), p.name, ...(p.aka || [])])];
  for (const k of ["spouses", "children", "siblings"]) r[k] = [...new Set([...(r[k] || []), ...(p[k] || [])])];
  if (!r.father && p.father) r.father = p.father;
  if (!r.mother && p.mother) r.mother = p.mother;
  r.refs = [...new Set([...(r.refs || []), ...(p.refs || [])])].slice(0, 5);
  r.relHints = (r.relHints || "") + "; " + (p.relHints || "");
  merged.set(p.key, root);
}

/* ---------- 1. Insight persons -> records ---------- */
const people = [];
const usedIds = new Set();
for (const c of CURATED) usedIds.add(c.id);   // hand-written ids keep their names
function uid(base) { let id = base, n = 2; while (usedIds.has(id)) id = `${base}-${n++}`; usedIds.add(id); return id; }

for (const p of INSIGHT) {
  if (!p || !p.name || !p.key) continue;
  if (merged.has(p.key) || SPIRIT.test(p.group || "")) continue;
  if (OVR.drop && OVR.drop.includes(p.key)) continue;
  const [head, ...nums] = p.key.split("#");
  const idBase = slug(p.name) + (nums.length ? "-" + nums.join("").toLowerCase() : "");
  let year = typeof p.year === "number" ? p.year : null;
  let born = typeof p.born === "number" ? p.born : null;
  let died = typeof p.died === "number" ? p.died : null;
  if (year == null) year = born != null ? born + 30 : died != null ? died - 30 : 0;
  const qB = born != null ? (p.dateQ === "derived" ? "derived" : "estimated") : "assumed";
  const qD = died != null ? (p.dateQ === "derived" ? "derived" : "estimated") : "assumed";
  if (born == null && died == null) { born = year - 30; died = year + 30; }
  else if (born == null) born = died - 60;
  else if (died == null) died = Math.max(born + 60, year + 10);
  if (died < born) [born, died] = [died, born];
  born = clampY(born); died = clampY(died);
  if (died - born < 2) died = clampY(born + 2);
  if (born === died) born = died - 2;
  const head0 = head.split(",")[0].trim();
  const sense = nums[0] && /^\d+$/.test(nums[0]) ? ` No. ${nums[0]}` : "";
  people.push({
    id: uid(p.id || idBase), ikey: p.key, name: p.name, aka: (p.aka || []).filter((a) => a && norm(a) !== norm(p.name)),
    gender: p.gender === "f" || p.gender === "u" ? p.gender : "m", meaning: p.meaning || "", role: p.role || "", summary: p.summary || "",
    born, died, year: clampY(year), q: [qB, qD], group: p.group || "", refs: (p.refs || []).slice(0, 4),
    raw: { father: p.father, mother: p.mother, spouses: p.spouses || [], children: p.children || [], siblings: p.siblings || [], hints: p.relHints || "" },
    src: p.unnamed ? "" : head0.toLowerCase().replace(/(^|[\s\-])([a-z])/g, (m, a, b) => a + b.toUpperCase()) + sense,
    tier: 4, solo: !!p.solo,
  });
}

/* ---------- 2. name index ---------- */
const byName = new Map();
const addName = (n, p) => { const k = norm(n); if (!k) return; if (!byName.has(k)) byName.set(k, []); if (!byName.get(k).includes(p)) byName.get(k).push(p); };
const indexAll = () => { byName.clear(); for (const p of people) { addName(p.name, p); for (const a of p.aka) addName(a, p); } };
indexAll();

/* ---------- 3. merge hand-written key figures ---------- */
/* "Father: Terah · Wife: Sarah · Sons: Ishmael, Isaac" -> relations */
function familyFromText(t) {
  const raw = { father: "", mother: "", spouses: [], children: [], siblings: [], hints: t || "" };
  for (const part of String(t || "").split(/\s*·\s*/)) {
    const m = part.match(/^([^:]+):\s*(.+)$/); if (!m) continue;
    const label = m[1].toLowerCase();
    const names = m[2].replace(/\(.*?\)/g, "").split(/,|&|\band\b/).map((x) => x.trim()).filter((x) => x && /^[A-Z]/.test(x) && !/^(others|many|several|\d)/i.test(x) && x.split(" ").length <= 3);
    if (/^parents?$/.test(label)) { raw.father = raw.father || names[0] || ""; raw.mother = raw.mother || names[1] || ""; }
    else if (/father/.test(label) && !/grand|in-law/.test(label)) raw.father = names[0] || "";
    else if (/mother/.test(label) && !/grand|in-law/.test(label)) raw.mother = names[0] || "";
    else if (/wife|wives|husband|spouse/.test(label)) raw.spouses.push(...names);
    else if (/^(sons?|daughters?|children|child)$/.test(label)) raw.children.push(...names);
    else if (/brother|sister|sibling/.test(label) && !/in-law/.test(label)) raw.siblings.push(...names);
  }
  return raw;
}
function unionRaw(a, b) {
  const u = (x, y) => [...new Set([...(x || []), ...(y || [])])];
  return { father: a.father || b.father, mother: a.mother || b.mother, spouses: u(a.spouses, b.spouses), children: u(a.children, b.children), siblings: u(a.siblings, b.siblings), hints: [a.hints, b.hints].filter(Boolean).join("; ") };
}
const mid = (c) => (c.born + c.died) / 2;
for (const c of CURATED) {
  const names = [c.name, ...(c.name.match(/\((.*?)\)/) || []).slice(1)].map((n) => n.replace(/\(.*?\)/, "").trim());
  let match = null;
  const forced = OVR.curated && OVR.curated[c.id];
  if (forced) match = people.find((p) => p.ikey === forced) || null;
  if (!match && forced !== null) {
    let best = Infinity;
    for (const n of names) for (const p of byName.get(norm(n)) || []) {
      if (p.curated || p.taken) continue;
      const d = Math.max(0, c.born - 40 - p.year, p.year - c.died - 40) - (norm(p.name) === norm(n) ? 20 : 0);
      if (d < best && d < 250) { best = d; match = p; }
    }
  }
  const rec = Object.assign({}, c, { key: true, tier: c.tier || 3, curated: true, year: Math.round(mid(c)) });
  const fam = familyFromText(c.family);
  if (match) {
    rec.raw = unionRaw(match.raw, fam); rec.aka = match.aka; rec.refs = match.refs; rec.src = match.src; rec.group = match.group;
    rec.ikey = match.ikey;
    if (!rec.meaning || rec.meaning === "—") rec.meaning = match.meaning;
    match.taken = true;
    people.splice(people.indexOf(match), 1, rec);
  } else {
    rec.raw = fam;
    rec.aka = []; rec.refs = [];
    people.push(rec);
  }
}
indexAll();

/* ---------- 4. resolve relatives by name ---------- */
const GAP = (p) => (p.year < -2300 ? 90 : 32);
function resolve(p, name, kind) {
  const k = norm(name).replace(/^(king|queen|prophet|the) /, "");
  if (!k) return null;
  // "solo" people (added-people.json) have no relatives in the Bible, so no one's relative is matched to them
  let cands = (byName.get(k) || []).filter((c) => c !== p && !c.solo);
  if (!cands.length) cands = (byName.get(k.split(" ")[0]) || []).filter((c) => c !== p && !c.solo);
  if (!cands.length) return null;
  const expect = kind === "father" || kind === "mother" ? p.year - GAP(p) : kind === "children" ? p.year + GAP(p) : p.year;
  const back = { father: "children", mother: "children", children: null, spouses: "spouses", siblings: "siblings" }[kind];
  let best = null, bestS = Infinity;
  for (const c of cands) {
    let s = Math.abs(c.year - expect);
    const r = c.raw || {};
    const theirs = kind === "children" ? [r.father, r.mother] : back ? [].concat(r[back] || []) : [];
    if (theirs.some((n) => norm(n) === norm(p.name) || (p.aka || []).some((a) => norm(a) === norm(n)))) s -= 400;
    if (c.ikey && p.raw.hints && p.raw.hints.includes(c.ikey)) s -= 300;
    if (s < bestS) { bestS = s; best = c; }
  }
  return bestS < 160 ? best : null;
}
const REL = ["father", "mother", "spouses", "children", "siblings"];
for (const p of people) { p.rel = { father: [], mother: [], spouses: [], children: [], siblings: [] }; p.relNames = {}; }
for (const p of people) {
  for (const kind of REL) {
    const names = [].concat(p.raw[kind] || []).filter(Boolean);
    for (const n of names) {
      const r = resolve(p, n, kind);
      if (r) { if (!p.rel[kind].includes(r.id)) p.rel[kind].push(r.id); }
      else (p.relNames[kind] = p.relNames[kind] || []).push(n);
    }
  }
}
/* ---------- 4b. people known from history, not from the Bible ----------
   data/source/history-people.json: hand-written, with their relatives given as ids. They
   are added after the name matching above, so no Bible person is matched to one of them
   by name (the Mattathias of Luke 3 is not the Maccabees' father). "replaces" takes over
   a record already in the data (Alexander the Great has an Insight article because
   Daniel foretold him); "patch" adds dates and activities to people already in the data. */
const HIST = fs.existsSync(path.join(ROOT, "data/source/history-people.json")) ? JSON.parse(read("data/source/history-people.json")) : { people: [], patch: {} };
const histFixed = new Set();
for (let h of HIST.people || []) {
  /* "living": no death in the sources, so the line runs to the timeline's end (TIMELINE_END in js/app.js) */
  if (h.living) h = { ...h, died: 2025 };
  const rec = { aka: [], refs: [], ...h, hist: true, hsrc: h.src || [], src: "", rel: { father: [], mother: [], spouses: [], children: [], siblings: [] }, relNames: h.relNames || {} };
  delete rec.replaces;
  let p = h.replaces && people.find((x) => x.id === h.replaces);
  if (p) { Object.assign(p, rec, { id: p.id, refs: p.refs, src: p.src, aka: [...new Set([...(p.aka || []), ...(h.aka || []), p.name])].filter((a) => a !== rec.name) }); p.rel = rec.rel; }
  else { usedIds.add(rec.id); p = rec; people.push(p); }
  p.year = Math.round(mid(p));
  p.raw = { hints: "" };
  histFixed.add(p.id);
}
{
  const ids = new Map(people.map((p) => [p.id, p]));
  for (const h of HIST.people || []) {
    const p = ids.get(h.replaces || h.id);
    for (const kind of REL) for (const id of (h.rel || {})[kind] || []) {
      const r = ids.get(id);
      if (!r) { console.log(`history-people.json: ${p.id} has unknown relative ${id}`); continue; }
      if (!p.rel[kind].includes(id)) p.rel[kind].push(id);
      /* a child listed here gets this person as their parent, in place of a name match */
      if (kind === "children") {
        const k = p.gender === "f" ? "mother" : "father";
        for (const old of r.rel[k]) { const o = ids.get(old); if (o && o !== p) o.rel.children = o.rel.children.filter((x) => x !== r.id); }
        r.rel[k] = [p.id];
      }
    }
  }
  for (const [id, pt] of Object.entries(HIST.patch || {})) {
    const p = ids.get(id);
    if (!p) { console.log(`history-people.json: patch for unknown person ${id}`); continue; }
    for (const k of ["born", "died", "q", "note"]) if (pt[k] !== undefined) p[k] = pt[k];
    if (pt.events) p.events = (p.events || []).concat(pt.events);
    p.year = Math.round(mid(p));
    histFixed.add(p.id);
  }
}

/* make links two-way */
const byId = new Map(people.map((p) => [p.id, p]));
const link = (a, kind, b) => { if (a && b && a !== b && !a.rel[kind].includes(b.id)) a.rel[kind].push(b.id); };
for (const p of people) {
  for (const id of p.rel.father) link(byId.get(id), "children", p);
  for (const id of p.rel.mother) link(byId.get(id), "children", p);
  for (const id of p.rel.spouses) link(byId.get(id), "spouses", p);
  for (const id of p.rel.siblings) link(byId.get(id), "siblings", p);
}
for (const p of people) for (const id of p.rel.children) {
  const ch = byId.get(id);
  if (!ch || ch.rel.father.includes(p.id) || ch.rel.mother.includes(p.id)) continue;
  link(ch, p.gender === "f" ? "mother" : "father", p);
}
/* links a name match got wrong, removed both ways (history-people.json patch "unlink") */
for (const [id, pt] of Object.entries(HIST.patch || {})) for (const other of pt.unlink || []) {
  for (const [a, b] of [[id, other], [other, id]]) { const p = byId.get(a); if (p) for (const k of REL) p.rel[k] = p.rel[k].filter((x) => x !== b); }
}
/* one wrong link, removed both ways (overrides.json "unlink": { id: { kind: [ids] } }); Drusilla's
   son Agrippa is not her father Herod Agrippa I */
const BACK = { father: ["children"], mother: ["children"], children: ["father", "mother"], spouses: ["spouses"], siblings: ["siblings"] };
for (const [id, kinds] of Object.entries(OVR.unlink || {})) for (const [k, others] of Object.entries(kinds)) for (const other of others) {
  const p = byId.get(id), o = byId.get(other);
  if (p) p.rel[k] = p.rel[k].filter((x) => x !== other);
  if (o) for (const b of BACK[k]) o.rel[b] = o.rel[b].filter((x) => x !== id);
}
/* a parent appears once; drop a second "father" if it came from a weak match */
for (const p of people) { p.rel.father = p.rel.father.slice(0, 1); p.rel.mother = p.rel.mother.slice(0, 1); }
/* drop plain-text names that ended up resolved through the reverse link */
for (const p of people) for (const kind of Object.keys(p.relNames)) {
  const have = new Set(p.rel[kind].map((id) => norm(byId.get(id).name)));
  p.relNames[kind] = p.relNames[kind].filter((n) => !have.has(norm(n)));
  if (!p.relNames[kind].length) delete p.relNames[kind];
}
/* relatives known only by name, put back after an unlink (overrides.json "relNames") */
for (const [id, kinds] of Object.entries(OVR.relNames || {})) { const p = byId.get(id); if (p) for (const [k, names] of Object.entries(kinds)) p.relNames[k] = [...new Set([...(p.relNames[k] || []), ...names])]; }

/* ---------- 5. the line from Adam to Jesus (Luke 3:23-38; Matthew 1:1-16) ---------- */
const LUKE = "Adam Seth Enosh Kenan Mahalalel Jared Enoch Methuselah Lamech Noah Shem Arpachshad Cainan Shelah Eber Peleg Reu Serug Nahor Terah Abraham Isaac Jacob Judah Perez Hezron Ram Amminadab Nahshon Salmon Boaz Obed Jesse David Nathan Mattatha Menna Melea Eliakim Jonam Joseph Judas Symeon Levi Matthat Jorim Eliezer Jesus Er Elmadam Cosam Addi Melchi Neri Shealtiel Zerubbabel Rhesa Joanan Joda Josech Semein Mattathias Maath Naggai Esli Nahum Amos Mattathias Joseph Jannai Melchi Levi Matthat Heli".split(" ");
const MATT = "David Solomon Rehoboam Abijah Asa Jehoshaphat Jehoram Uzziah Jotham Ahaz Hezekiah Manasseh Amon Josiah Jeconiah Shealtiel Zerubbabel Abiud Eliakim Azor Zadok Achim Eliud Eleazar Matthan Jacob".split(" ");
function chain(names, startBorn, gene, strictFrom) {
  const out = [];
  let prev = startBorn;
  names.forEach((n, i) => {
    const strict = strictFrom != null && i >= strictFrom;
    const cands = (byName.get(norm(n)) || []).filter((c) => !out.includes(c) && c.id !== "joseph-carpenter" && c.id !== "jesus" && (strict || (c.born > prev - 80 && c.born < prev + (prev < -2300 ? 560 : 320))));
    let best = null, bs = Infinity;
    for (const c of cands) {
      const text = [c.role, c.summary, (c.refs || []).join(" "), c.raw && c.raw.hints].join(" ");
      const gene_ = /\b(Luke 3|Matthew 1)[:\s]/.test(text) || /ancestor of Jesus|Jesus[’'] (ancestor|forefather)|line(age)? of (Jesus|the Messiah)|messianic line|genealogy of Jesus/i.test(text);
      if (strict && !gene_) continue;
      let s = Math.abs(c.born - (prev + gene(prev)));
      if (gene_) s -= 400;
      if (c.curated && norm(c.name) === norm(n)) s -= 150;
      if (s < bs) { bs = s; best = c; }
    }
    out.push(best);
    prev = best ? best.born : prev + gene(prev);
  });
  return out;
}
const gen = (y) => (y < -2300 ? 120 : y < -1700 ? 60 : 30);
const lukeLine = chain(LUKE, -4126, gen, LUKE.indexOf("Nathan"));
const mattLine = chain(MATT.slice(1), byId.get("david") ? byId.get("david").born : -1107, () => 30, MATT.indexOf("Abiud") - 1);
/* Most of these ancestors have no recorded dates. Space the undated ones
   evenly between the nearest dated ancestors before and after them, so the
   line reads in order from Adam to Jesus. */
function spread(line, endBorn) {
  const pts = line.map((p, i) => ({ p, i })).filter((o) => o.p);
  const anchor = (o) => o.p.q[0] !== "assumed";
  const list = pts.concat([{ p: null, i: line.length, born: endBorn }]);
  let last = { i: -1, born: null };
  for (let k = 0; k < list.length; k++) {
    const o = list[k];
    const isA = o.p ? anchor(o) : true;
    if (!isA) continue;
    const b = o.p ? o.p.born : o.born;
    if (last.born != null) {
      for (const m of list.slice(0, k)) {
        if (!m.p || anchor(m) || m.p.curated || m.i <= last.i) continue;
        const nb = Math.round(last.born + (b - last.born) * ((m.i - last.i) / (o.i - last.i)));
        const life = m.p.died - m.p.born;
        m.p.born = nb; m.p.died = Math.min(MAX_Y, nb + Math.min(life, 70)); m.p.year = nb + 30;
      }
    }
    last = { i: o.i, born: b };
  }
}
spread(lukeLine, -2 - 30);
spread(mattLine, -2 - 30);
/* placeholder dates fixed by hand (overrides.json "dates"), applied after the spacing above */
for (const [id, [b, d]] of Object.entries(OVR.dates || {})) {
  const p = byId.get(id);
  if (p) { p.born = b; p.died = d; p.year = Math.round((b + d) / 2); }
}
for (const [id, note] of Object.entries(OVR.notes || {})) if (byId.get(id)) byId.get(id).note = note;
/* activities for people who are not key figures (overrides.json "events"): [year, text, scripture] */
for (const [id, evs] of Object.entries(OVR.events || {})) if (byId.get(id)) byId.get(id).events = evs.concat(byId.get(id).events || []);   // keeps history activities added in step 4b
/* activities from data/source/activities.json: [year, text, scripture, { c: 1 if the year is approximate,
   p: place in data/places.js, zh: Chinese text }]; a string names a shared activity in "shared" */
const actIds = new Set();
for (const [id, list] of Object.entries(ACTS.people || {})) {
  const p = byId.get(id);
  if (!p) { console.log("activities.json: no person", id); continue; }
  const evs = list.map((e) => {
    const [y, text, ref, f] = typeof e === "string" ? ACTS.shared[e] : e;
    if (y === undefined) console.log("activities.json: no shared activity", e);
    return f && Object.keys(f).length ? [y, text, ref, f] : [y, text, ref];
  });
  p.events = (p.events || []).concat(evs);
  actIds.add(id);
}

/* ---------- 5b. a parent is alive when each child is born ----------
   Placeholder dates are set one person at a time, so a father or mother can
   end up dying before a child is born (Jesse died before David). Only assumed
   dates move; dates from the Bible, the books, curated key figures and
   overrides.json "dates" stay put. A father may die shortly before the birth,
   a mother may not. */
const fixedId = new Set([...Object.keys(OVR.dates || {}), ...histFixed]);
const movable = (p) => !p.curated && !fixedId.has(p.id) && p.q[0] === "assumed" && p.q[1] === "assumed";
const endable = (p) => !fixedId.has(p.id) && p.q[1] === "assumed";
/* how far a placeholder may move, and how long a life may be stretched; a
   bigger gap is a genealogy where "son of" means descendant (Mica son of
   Zabdi son of Asaph, Nehemiah 11:17), so the link is left as it is */
const MAX_MOVE = 100;
const maxLife = (p) => (p.born < -2370 ? 970 : p.born < -1900 ? 200 : p.born < -1400 ? 140 : 120);
const kidsOf = (p) => p.rel.children.map((id) => byId.get(id)).filter(Boolean);
const shift = (p, d) => { p.born = clampY(p.born + d); p.died = clampY(p.died + d); p.year = clampY(p.year + d); };
const parentGaps = () => {
  const out = [];
  for (const c of people) for (const kind of ["father", "mother"]) for (const id of c.rel[kind]) {
    const p = byId.get(id);
    if (p && p.died < c.born - (kind === "father" ? 1 : 0)) out.push([p, c, kind]);
  }
  return out;
};
const gapsBefore = parentGaps();
const datesFixed = new Set();
for (let pass = 0; pass < 200; pass++) {
  const gaps = parentGaps();
  if (!gaps.length) break;
  for (const [p, c, kind] of gaps) {
    if (p.died >= c.born - (kind === "father" ? 1 : 0)) continue;   // fixed earlier in this pass
    const gap = c.born - p.died;
    /* 1. a short gap: the parent simply lived a little longer */
    if (endable(p) && gap <= 30 && c.born - p.born <= maxLife(p)) { p.died = c.born; datesFixed.add(p.id); continue; }
    /* 2. move the parent's whole life to one generation before the child,
          unless that puts them too close to (or after) another child's birth */
    if (movable(p)) {
      const d = c.born - GAP(p) - p.born;
      const others = Math.min(...kidsOf(p).filter((k) => k !== c).map((k) => k.born));
      const own = Math.min(...[...p.rel.father, ...p.rel.mother].map((id) => byId.get(id)).filter(Boolean).map((q) => q.died));
      if (d > 0 && d <= MAX_MOVE && p.born + d <= others - 15 && p.born + d <= own) { shift(p, d); datesFixed.add(p.id); continue; }
    }
    /* 3. the parent lived on until the birth, if that is a believable age */
    if (endable(p) && c.born - p.born <= maxLife(p)) { p.died = c.born; datesFixed.add(p.id); continue; }
    /* 4. move the child back to be born in the parent's lifetime */
    if (movable(c)) {
      const floor = Math.max(...[...c.rel.father, ...c.rel.mother].map((id) => byId.get(id)).filter(Boolean).map((q) => q.born + 15));
      const d = Math.max(p.born + 20, p.died - 10) - c.born;
      if (d < 0 && -d <= MAX_MOVE && c.born + d >= floor) { shift(c, d); datesFixed.add(c.id); }
    }
  }
}
const gapsAfter = parentGaps();
if (process.argv.includes("--gaps")) for (const [p, c] of gapsAfter) console.log(`  ${p.id} (d. ${p.died}) -> ${c.id} (b. ${c.born}): ${c.born - p.died} years`);
console.log(`Parents dying before a child's birth: ${gapsBefore.length} pairs found, ${datesFixed.size} placeholder dates moved, ${gapsAfter.length} left as descendant links (--gaps lists them).`);

const missing = [];
lukeLine.forEach((p, i) => { if (p) p.line = true; else missing.push("Luke: " + LUKE[i]); });
mattLine.forEach((p, i) => { if (p) p.line = true; else missing.push("Matthew: " + MATT[i + 1]); });
for (const id of ["jesus", "mary", "joseph-carpenter"]) if (byId.get(id)) byId.get(id).line = true;
for (const id of OVR.line || []) if (byId.get(id)) byId.get(id).line = true;
for (const id of OVR.notLine || []) if (byId.get(id)) byId.get(id).line = false;

/* ---------- 6. tiers ---------- */
const NOTABLE = /\b(king|queen|prophet|prophetess|judge|apostle|high priest|pharaoh|emperor|governor)\b/i;
for (const p of people) {
  if (p.curated || p.hist) continue;
  const nRel = REL.reduce((s, k) => s + p.rel[k].length, 0);
  p.tier = (p.line || NOTABLE.test(p.role) || nRel >= 6) ? 3 : 4;
}
for (const [id, t] of Object.entries(OVR.tier || {})) if (byId.get(id)) byId.get(id).tier = t;

/* ---------- 6b. jobs ----------
   Small icons after the name (king, prophet ...). data/source/jobs.json sets them by hand for the
   key figures and the Bible writers; everyone else gets them from the words in their role. A title
   after "of", "to", "under" ... ("Father of King Saul", "Priest under King Ahaz") or followed by
   "'s" ("High priest's slave") is someone else's, so it does not count. False prophets get their
   own icon (a broken scroll), not the prophet's. */
const JOBS = JSON.parse(read("data/source/jobs.json"));
const JOB_WORDS = {
  king: "king|queen|pharaoh|emperor|tetrarch", prophet: "prophet|prophetess|seer|visionary", judge: "judge", priest: "priest|high priest",
  apostle: "apostle", official: "governor|official|prime minister|steward|recorder|secretary|satrap|proconsul|chamberlain|ruler|cupbearer",
  commander: "commander|general|army chief|captain",
};
const NOT_THEIRS = "of|to|under|serving|with|for|against|by|beside";
function jobsFromRole(role) {
  const out = [];
  for (const [job, words] of Object.entries(JOB_WORDS)) {
    const w = `(?:${words})`;
    if (!new RegExp(`\\b${w}\\b(?!'s)`, "i").test(role)) continue;
    // every mention is someone else's title, or a false prophet
    const all = role.match(new RegExp(`(?:\\S+\\s+){0,3}\\b${w}\\b(?!'s)`, "gi")) || [];
    const own = all.filter((m) => !new RegExp(`\\b(?:${NOT_THEIRS})\\s+(?:\\S+\\s+){0,2}${w}$`, "i").test(m) && !/\b(false|lying)\s+prophet/i.test(m));
    if (own.length) out.push(job);
  }
  if (/\b(false|lying)\s+prophet/i.test(role) && !/\bof\s+(\S+\s+)?(false|lying)\s+prophet/i.test(role)) out.push("falseprophet");
  return out;
}
for (const p of people) {
  const set = JOBS.set[p.id];
  p.jobs = set ? set.slice() : p.hist && p.jobs ? p.jobs : jobsFromRole(p.role || "");
}

/* ---------- 6c. companions ----------
   data/source/companions.json: groups of people who served, traveled or stood together, by id,
   each with the verses that show it. Everyone in a group gets the others, with those verses. */
const COMP = extra("data/source/companions.json");
for (const g of COMP) {
  const missing = g.ids.filter((id) => !byId.get(id));
  if (missing.length) console.warn("Companions, unknown ids:", missing.join(", "));
  for (const a of g.ids) {
    const p = byId.get(a);
    if (!p) continue;
    p.comp = p.comp || [];
    for (const b of g.ids) {
      if (b === a || !byId.get(b)) continue;
      const have = p.comp.find((x) => x[0] === b);
      if (!have) p.comp.push([b, g.ref]);
      else if (!have[1].includes(g.ref)) have[1] += "; " + g.ref;
    }
  }
}

/* ---------- 7. write ---------- */
const KEEP = ["id", "name", "aka", "meaning", "born", "died", "q", "tier", "gender", "role", "look", "portrait", "summary", "family", "links", "note", "events", "refs", "group", "rel", "relNames", "comp", "src", "key", "line", "jobs", "hist", "hsrc", "living"];
const outList = people.slice().sort((a, b) => a.born - b.born || a.name.localeCompare(b.name)).map((p) => {
  const o = {};
  for (const k of KEEP) {
    let v = p[k];
    if (k === "rel") { v = {}; for (const r of REL) if (p.rel[r].length) v[r] = p.rel[r]; if (!Object.keys(v).length) continue; }
    if (k === "relNames" && (!v || !Object.keys(v).length)) continue;
    if (k === "family" && p.rel && REL.some((r) => p.rel[r].length)) continue;
    if (v === undefined || v === "" || v === false || (Array.isArray(v) && !v.length)) continue;
    o[k] = v;
  }
  return o;
});
const header = `/*
 * GENERATED by tools/build-people.mjs. Do not edit by hand:
 * edit data/characters.js, data/source/insight-people.json or
 * data/source/overrides.json, then run  node tools/build-people.mjs
 * ${outList.length} people.
 */
`;
fs.writeFileSync(path.join(ROOT, "data/people.js"), header + "window.TIMELINE_PEOPLE = [\n" + outList.map((o) => JSON.stringify(o)).join(",\n") + "\n];\n");

const fmt = (y) => (y < 0 ? `${-y} B.C.E.` : `${y} C.E.`);
const assumed = outList.filter((p) => p.q.includes("assumed"));
let md = `# Assumed dates\n\nGenerated by \`node tools/build-people.mjs\`. These ${assumed.length} of ${outList.length} people have at least one date that the Bible does not record. The placeholder is estimated from their generation or the period in which they appear. Fix a date in \`data/characters.js\` (key figures) or \`data/source/insight-people.json\` (everyone else), then rebuild.\n\n| Person | Born | Died | Role |\n|---|---|---|---|\n`;
for (const p of assumed) md += `| ${p.name} (\`${p.id}\`) | ${p.q[0] === "assumed" ? "~" : ""}${fmt(p.born)} | ${p.living ? "living" : (p.q[1] === "assumed" ? "~" : "") + fmt(p.died)} | ${(p.role || "").replace(/\|/g, "/")} |\n`;
fs.writeFileSync(path.join(ROOT, "data/ASSUMED_DATES.md"), md);

/* an activity should fall within the person's life */
for (const p of outList) if (actIds.has(p.id)) for (const e of p.events) if (e[0] < p.born - 1 || e[0] > p.died + 1) console.log(`activity outside life: ${p.id} (${p.born} to ${p.died}) ${e[0]} ${e[1]}`);
const linked = outList.filter((p) => p.rel).length;
console.log(`${outList.length} people (${outList.filter((p) => p.key).length} key figures, ${outList.filter((p) => p.line).length} on the Adam-to-Jesus line), ${linked} with family links, ${assumed.length} with assumed dates.`);
const unmatched = CURATED.filter((c) => !people.find((p) => p.id === c.id && p.ikey)).map((c) => c.id);
if (unmatched.length) console.log("Key figures not matched to an Insight article:", unmatched.join(", "));
if (missing.length) console.log("Line of descent, not found:", missing.join(", "));
if (process.argv.includes("--matches")) {
  for (const c of CURATED) { const p = people.find((x) => x.id === c.id); const r = p && p.ikey && byKey.get(p.ikey.split("#").slice(0, 2).join("#")); console.log(`${c.id} = ${p && p.ikey || "-"}: ${r ? r.summary : ""}`); }
}
if (process.argv.includes("--line")) {
  console.log("Luke:", lukeLine.map((p, i) => p ? `${p.name}(${p.id},${p.year})` : `?${LUKE[i]}`).join(" > "));
  console.log("Matthew:", mattLine.map((p, i) => p ? `${p.name}(${p.id},${p.year})` : `?${MATT[i + 1]}`).join(" > "));
}
