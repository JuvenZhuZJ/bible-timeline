/*
 * Bible Family Tree: interactive timeline engine.
 * Plain JS, no build step. Data comes from data/events.js and data/characters.js.
 */
(function () {
  "use strict";

  const EVENTS = window.TIMELINE_EVENTS || [];
  const ERAS = window.TIMELINE_ERAS || [];
  const CHARS = window.TIMELINE_PEOPLE || window.TIMELINE_CHARACTERS || [];
  const $ = (id) => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  document.documentElement.classList.toggle("touch", isTouch);

  /* ───────────────────────── years ─────────────────────────
     Data years use historical numbering (no year 0; -1 = 1 B.C.E.).
     Internally we use astronomical years (t) so spans are continuous. */
  const A = (y) => (y < 0 ? y + 1 : y);
  const fromA = (t) => (t <= 0 ? t - 1 : t);
  const fmtYear = (y, long) => (y < 0 ? `${-y} ${long ? "B.C.E." : "BCE"}` : `${y} ${long ? "C.E." : "CE"}`);
  const fmtT = (t, long) => fmtYear(fromA(Math.round(t)), long);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  function fmtRange(c) {
    const pb = c.q[0] === "derived" ? "" : "c. ";
    const pd = c.q[1] === "derived" ? "" : "c. ";
    if (c.born < 0 && c.died < 0) return `${pb}${-c.born} – ${pd}${-c.died} B.C.E.`;
    if (c.born < 0) return `${pb}${-c.born} B.C.E. – ${pd}${c.died} C.E.`;
    return `${pb}${c.born} – ${pd}${c.died} C.E.`;
  }
  const ageText = (c) => `${c.assumed ? "~" : ""}${c.td - c.tb} yrs`;

  CHARS.forEach((c) => {
    c.q = c.q || ["assumed", "assumed"];
    c.tb = A(c.born);
    c.td = A(c.died);
    c.assumed = c.q.includes("assumed");
    c.tier = c.tier || 3;
    // the places in data/places.js that are not one of the activities become activities too, so the
    // window has one list
    const rawEvents = (c.events || []).slice();
    const visits = ((window.PERSON_PLACES || {})[c.id] || []).map(([id, a, text, ref]) => {
      if (text === undefined) return [id, rawEvents[a]];
      const ev = [a, text, ref];
      rawEvents.push(ev);
      return [id, ev];
    });
    c.events = rawEvents.slice().sort((a, b) => a[0] - b[0]);
    c.places = placesOf(c, visits);
    c.labelW = c.name.length * (c.tier === 1 ? 7.6 : 6.3) + 16;
    c.rel = c.rel || {};
    c.refs = c.refs || [];
  });
  const CHAR_BY_ID = new Map(CHARS.map((c) => [c.id, c]));

  /* places in a person's life (data/places.js): each stop is { id, n, k, y }, where k is the index of
     its activity in c.events and n is the number on that place's pin, counted by first visit */
  function placesOf(c, visits) {
    if (!visits.length || !window.BibleMap) return null;
    const stops = visits.map(([id, ev]) => (ev && BibleMap.place(id) ? { id, k: c.events.indexOf(ev), y: ev[0] } : null))
      .filter(Boolean).sort((a, b) => a.k - b.k);
    const nums = new Map();
    stops.forEach((st) => { if (!nums.has(st.id)) nums.set(st.id, nums.size + 1); st.n = nums.get(st.id); });
    return stops.length ? stops : null;
  }
  const REL_KEYS = [["father", "Father"], ["mother", "Mother"], ["spouses", "Spouse"], ["siblings", "Sibling"], ["children", "Child"]];
  CHARS.forEach((c) => {
    const ids = new Set();
    for (const [k] of REL_KEYS) for (const id of c.rel[k] || []) if (CHAR_BY_ID.has(id)) ids.add(id);
    c.relIds = [...ids];
    c.nRel = ids.size;
  });

  /* who is shown: everyone, key figures only, or only the line from Adam to Jesus */
  const SHOW_MODES = { all: "Everyone", key: "Key figures", line: "Adam to Jesus line" };
  let showMode = "all";
  try { const m = localStorage.getItem("bt-show"); if (SHOW_MODES[m]) showMode = m; } catch (_) {}
  const inMode = (c) => showMode === "all" || (showMode === "line" ? !!c.line : !!(c.key || c.line));

  const T0 = A(-4026) - 90;
  const T1 = A(100) + 70;
  const TIER = { 1: 0.45, 2: 1.4, 3: 3.4, 4: 7 };   // px-per-year needed to show each tier
  const MAX_PPY = 140;

  /* ───────────────────────── DOM ───────────────────────── */
  const stage = $("stage"), svg = $("timeline");
  const g = { eras: $("gEras"), cursor: $("gCursor"), axis: $("gAxis"), rels: $("gRels"), life: $("gLife"), main: $("gMain"), events: $("gEvents"), dots: $("gDots"), tracks: $("gTracks") };
  const eraLabelBox = $("eraLabels");
  const tip = $("eventTip");

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ───────────────────────── layout ───────────────────────── */
  let W = 0, H = 0, L = {};
  const ERA_ROWS = 3;
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    const mobile = W < 760;
    const top = (mobile ? 56 + (ERA_ROWS - 1) * 15 : 64) + 30;   // room for the era names above the people
    const bottom = mobile ? 104 : 108;
    const lineY = Math.round(top + (H - top - bottom) * (mobile ? 0.5 : 0.55));
    const laneStep = mobile ? 28 : 31;
    // event labels sit in a fixed band of rows under the axis; the personal tracks start below it
    const evRows = mobile ? 2 : 3, evRow0 = lineY + 40, evRowStep = 22;
    L = {
      mobile, top, bottom, lineY, laneStep, evRows, evRow0, evRowStep,
      maxLanes: Math.max(3, Math.floor((lineY - top - 22) / laneStep)),
      trackY0: evRow0 + (evRows - 1) * evRowStep + 11 + 22,
      trackStep: mobile ? 30 : 34,
    };
    lastPack.key = "";
  }

  /* ───────────────────────── view ───────────────────────── */
  const view = { t0: T0, ppy: 0.3 };
  const fitPpy = () => (W - (L.mobile ? 32 : 80)) / (T1 - T0);
  const X = (t) => (t - view.t0) * view.ppy;
  const tAt = (x) => view.t0 + x / view.ppy;

  function clampView() {
    const minP = fitPpy() * 0.85;
    view.ppy = Math.min(MAX_PPY, Math.max(minP, view.ppy));
    const span = W / view.ppy;
    if (span >= T1 - T0) {
      view.t0 = (T0 + T1) / 2 - span / 2;
    } else {
      const pad = span * 0.35;
      view.t0 = Math.max(T0 - pad, Math.min(T1 + pad - span, view.t0));
    }
  }
  function fit() { view.ppy = fitPpy(); view.t0 = (T0 + T1) / 2 - W / view.ppy / 2; clampView(); }
  function zoomAt(factor, x) {
    const t = tAt(x);
    view.ppy *= factor; clampView();
    view.t0 = t - x / view.ppy; clampView();
    requestRender();
  }

  let anim = null;
  function animateTo(centerT, ppy, dur) {
    const from = { c: tAt(W / 2), p: Math.log(view.ppy) };
    const to = { c: centerT, p: Math.log(Math.min(MAX_PPY, Math.max(fitPpy() * 0.85, ppy))) };
    const start = performance.now(); dur = dur || 700;
    if (anim) cancelAnimationFrame(anim);
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      view.ppy = Math.exp(from.p + (to.p - from.p) * e);
      view.t0 = from.c + (to.c - from.c) * e - W / 2 / view.ppy;
      clampView(); render();
      anim = k < 1 ? requestAnimationFrame(step) : null;
    };
    anim = requestAnimationFrame(step);
  }

  let raf = 0;
  function requestRender() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); }

  /* ───────────────────────── static elements ───────────────────────── */
  const eraEls = ERAS.map((e, i) => {
    const rect = el("rect", { class: "era-band", y: 0 }, g.eras);
    if (i % 2) rect.style.fill = "transparent";
    const lab = document.createElement("div");
    lab.className = "era-label"; lab.textContent = e.name;
    eraLabelBox.appendChild(lab);
    return { e, rect, lab, w: e.name.length * 7.4 + 24, a: A(e.from), b: A(e.to) };
  });
  // dotted lines mark era boundaries only; events inside an era already have their own node and label
  const sepEls = [...new Set(ERAS.flatMap((e) => [A(e.from), A(e.to)]))].map((t) => ({ t, line: el("line", { class: "era-sep" }, g.eras) }));

  const mainGlow = el("line", { class: "main-line-glow" }, g.main);
  const mainLine = el("line", { class: "main-line" }, g.main);
  const spanHl = el("line", { class: "span-hl", stroke: "var(--accent)" }, g.main);

  const evEls = EVENTS.map((ev) => {
    const t = A(ev.year);
    const stem = el("line", { class: "ev-stem" }, g.events);
    const node = el("g", { class: "ev-node", tabindex: "0", role: "button", "aria-label": `${ev.title}, ${fmtYear(ev.year, true)}` }, g.events);
    el("circle", { class: "ev-halo", r: 15 }, node);
    el("circle", { class: "ev-ring", r: 7.5 }, node);
    el("circle", { class: "ev-core", r: 3 }, node);
    el("circle", { r: 20, fill: "transparent" }, node);
    const label = el("text", { class: "ev-label" }, g.events);
    label.textContent = ev.title;
    const year = el("text", { class: "ev-year" }, g.events);
    year.textContent = fmtYear(ev.year);
    node.__ev = ev;
    return { ev, t, stem, node, label, year, w: ev.title.length * 7.3 + 14 };
  });

  /* Dots are created lazily, the first time a person comes into view,
     so thousands of people cost nothing until they are needed. */
  const dotEls = CHARS.map((c) => ({ c, node: null, life: null, sel: null, name: null, gap: 0, visible: false, lane: -1 }));
  const DOT_BY_ID = new Map(dotEls.map((d) => [d.c.id, d]));
  function buildDot(d) {
    const c = d.c;
    d.life = el("path", { class: "life" + (c.q[1] === "assumed" ? " q-assumed" : "") }, g.life);
    const node = el("g", {
      class: `dot tier-${c.tier} q-${c.q[0]}${c.line ? " on-line" : ""}`, tabindex: "0", role: "button",
      "aria-label": `${c.name}, ${fmtRange(c)}`,
    }, g.dots);
    el("rect", { class: "hit", x: -12, y: -15, width: c.labelW + 10, height: 31 }, node);   // as tall as a lane, so neighbours leave no gap
    d.sel = el("circle", { class: "d-sel", r: 10, stroke: "transparent" }, node);
    el("circle", { class: "d-ring", r: c.tier === 1 ? 5.5 : 4.5 }, node);
    if (c.q[0] !== "assumed") el("circle", { class: "d-core", r: c.q[0] === "derived" ? (c.tier === 1 ? 5.5 : 4.5) : 2 }, node);
    const name = el("text", { class: "d-name", x: 11, y: 4 }, node);
    name.textContent = c.name;
    d.name = name;
    const yr = el("text", { class: "d-year", x: 11, y: 15 }, node);
    yr.textContent = fmtYear(c.born);
    node.__c = c;
    d.node = node;
    node.style.display = "none"; d.life.style.display = "none";
  }

  /* ───────────────────────── lane packing ─────────────────────────
     Only people near the view are packed, most important first.
     Whoever finds no free lane is hidden until you zoom in further,
     so names never pile on top of each other. The packed window is
     wider than the screen, so panning a little does not reshuffle lanes. */
  const lastPack = { ppy: 0, key: "", a: 0, b: 0 };
  const prio = (c) => (c.tier * 1000) - (c.line ? 300 : 0) - (c.key ? 200 : 0) - Math.min(150, c.nRel * 10 + c.refs.length * 5);
  function packLanes(cands, force) {
    const span = W / view.ppy;
    const a = tAt(0), b = tAt(W);
    const inside = a >= lastPack.a && b <= lastPack.b;
    // Hovering or pinning someone who already has a lane must not repack: the dot would
    // jump away from under the cursor, lose the hover, jump back, and flicker.
    // Only repack when such a person is in range but has no lane yet.
    const unplaced = cands.some((d) => d.lane < 0 && (isPinned(d.c) || d.c === hoverC) && d.c.td >= lastPack.a - 40 && d.c.tb <= lastPack.b);
    const key = showMode;
    if (!force && !unplaced && inside && key === lastPack.key && Math.abs(view.ppy / lastPack.ppy - 1) < 0.12) return;
    lastPack.key = key; lastPack.ppy = view.ppy; lastPack.a = a - span; lastPack.b = b + span;
    for (const d of dotEls) d.lane = -1;
    const list = cands.filter((d) => d.c.td >= lastPack.a - 40 && d.c.tb <= lastPack.b);
    list.sort((p, q) => (isPinned(q.c) - isPinned(p.c)) || prio(p.c) - prio(q.c) || p.c.tb - q.c.tb);
    const lanes = Array.from({ length: L.maxLanes }, () => []);   // per lane: [start, labelEnd, lifeEnd]
    const free = (lane, s, e, idx) => lane.every((iv) => e <= iv[0] || s >= iv[idx]);
    for (const d of list) {
      const c = d.c, lw = (c.labelW + 14) / view.ppy;
      const s = c.tb, lbl = c.tb + lw, life = Math.max(c.td, lbl);
      let lane = lanes.findIndex((ln) => ln.every((iv) => life <= iv[0] || s >= iv[2]));
      if (lane < 0) lane = lanes.findIndex((ln) => free(ln, s, lbl, 1));
      if (lane < 0 && (isPinned(c) || c === hoverC)) { let m = Infinity; lanes.forEach((ln, i) => { const o = ln.filter((iv) => !(lbl <= iv[0] || s >= iv[1])).length; if (o < m) { m = o; lane = i; } }); }
      if (lane < 0) continue;
      d.lane = lane;
      lanes[lane].push([s, lbl, life]);
    }
  }
  const laneY = (lane) => L.lineY - 30 - lane * L.laneStep;

  /* ───────────────────────── render ───────────────────────── */
  let hoverC = null, cursorT = null, packForce = false;
  let cardTop = Infinity;   // the hover card's top edge; track notes stop above it

  function render() {
    const { lineY } = L;
    svg.classList.toggle("has-hover", !!hoverC);

    // eras: on a wide screen a name shows when it fits inside its band; on a phone the bands are
    // too narrow for that, so names stack left to right in up to ERA_ROWS rows at the top.
    if (L.mobile && eraEls[0].mw !== W) eraEls.forEach((o) => { o.mw = W; o.pw = o.lab.offsetWidth; });
    const eraRows = [];
    eraEls.map((o) => {
      const xa = X(o.a), xb = X(o.b);
      o.rect.setAttribute("x", xa); o.rect.setAttribute("width", Math.max(0, xb - xa)); o.rect.setAttribute("height", H);
      return { o, va: Math.max(xa, 0), vb: Math.min(xb, W) };
    }).forEach(({ o, va, vb }) => {
      let show = vb - va > o.w, row = 0;
      const cx = (va + vb) / 2;
      if (L.mobile) {
        show = false;
        const half = o.pw / 2 + 6, lx = Math.min(W - half, Math.max(half, cx));
        if (vb > va && lx - half < vb && lx + half > va) {
          for (row = 0; row < ERA_ROWS; row++) {
            if (!(eraRows[row] || []).some(([p, q]) => lx - half < q && lx + half > p)) { (eraRows[row] = eraRows[row] || []).push([lx - half, lx + half]); show = true; break; }
          }
        }
        if (show) { o.lab.style.left = lx + "px"; o.lab.style.top = ""; o.lab.style.transform = `translate(-50%, ${row * 15}px)`; }
      } else if (show) { o.lab.style.left = cx + "px"; o.lab.style.transform = ""; }
      o.lab.style.opacity = show ? 1 : 0;
    });
    sepEls.forEach(({ t, line: s }) => {
      const x = X(t);
      s.setAttribute("x1", x); s.setAttribute("x2", x); s.setAttribute("y1", L.top - 4); s.setAttribute("y2", H - L.bottom + 20);
    });

    // main line
    const x0 = Math.max(-10, X(T0 + 40)), x1 = Math.min(W + 10, X(T1 - 30));
    for (const ln of [mainLine, mainGlow]) { ln.setAttribute("x1", x0); ln.setAttribute("x2", x1); ln.setAttribute("y1", lineY); ln.setAttribute("y2", lineY); }

    // axis
    g.axis.textContent = "";
    const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
    const minPx = L.mobile ? 64 : 84;
    const step = steps.find((s) => s * view.ppy >= minPx) || 1000;
    const minor = steps[Math.max(0, steps.indexOf(step) - 2)];
    const tA = tAt(-40), tB = tAt(W + 40);
    const ticks = (st) => {
      const out = [];
      for (let bce = Math.ceil((1 - tB) / st) * st; bce <= 1 - tA; bce += st) if (bce >= 1) out.push(1 - bce);
      for (let ce = Math.ceil(Math.max(1, tA) / st) * st; ce <= tB; ce += st) out.push(ce);
      return out;
    };
    if (minor * view.ppy >= 9) for (const t of ticks(minor)) el("line", { class: "axis-tick minor", x1: X(t), x2: X(t), y1: lineY, y2: lineY + 4 }, g.axis);
    for (const t of ticks(step)) {
      const x = X(t);
      el("line", { class: "axis-tick", x1: x, x2: x, y1: lineY, y2: lineY + 8 }, g.axis);
      el("text", { class: "axis-label", x: x, y: lineY + 21, "text-anchor": "middle" }, g.axis).textContent = fmtT(t);
    }

    // events: nodes + labels in rows under the axis. Each label's stem drops straight down from
    // its dot, so a label may only go in a row if its stem crosses no label in the rows above,
    // and no deeper label's stem runs through it. A label may sit centred on its stem or slide
    // left or right of it to fit; one that fits nowhere waits for more zoom (its dot still
    // shows the details on hover or tap).
    const rows = Array.from({ length: L.evRows }, () => []);   // [a, b] of each placed label
    const stems = [];                                            // [x, row] of each placed label
    const rowY = (r) => L.evRow0 + r * L.evRowStep;
    const PAD = 10;
    const xs = evEls.map((o) => X(o.t));
    evEls.forEach((o, i) => {
      const x = xs[i];
      const on = x > -60 && x < W + 60;
      o.node.style.display = on ? "" : "none";
      o.node.setAttribute("transform", `translate(${x},${lineY})`);
      let row = -1, lx = x;
      if (on && !o.mw) { o.label.style.display = ""; const m = o.label.getComputedTextLength(); if (m) o.w = o.mw = m + 14; }
      const fits = (r, cx) => {
        const a = cx - o.w / 2, b = cx + o.w / 2;
        if (x < a + 4 || x > b - 4) return false;
        if (rows[r].some(([p, q]) => a < q + PAD && b > p - PAD)) return false;
        for (let k = 0; k < r; k++) if (rows[k].some(([p, q]) => x > p - 6 && x < q + 6)) return false;
        return !stems.some(([sx, sr]) => sr > r && sx > a - 6 && sx < b + 6);
      };
      const clampX = (cx) => Math.min(W - o.w / 2 - 6, Math.max(o.w / 2 + 6, cx));
      if (on) {
        // prefer a spot that leaves the dots still to come uncovered, so their stems can pass
        let best = Infinity;
        const tries = [clampX(x), clampX(x + o.w / 2 - 14), clampX(x - o.w / 2 + 14)];
        for (let r = 0; r < L.evRows; r++) tries.forEach((cx, k) => {
          if (!fits(r, cx)) return;
          const a = cx - o.w / 2 - 6, b = cx + o.w / 2 + 6;
          const blocks = xs.filter((ox, j) => j > i && ox > a && ox < b).length;
          const score = blocks * 2 + r + (k ? 0.5 : 0);
          if (score < best) { best = score; row = r; lx = cx; }
        });
        if (row >= 0) { rows[row].push([lx - o.w / 2, lx + o.w / 2]); stems.push([x, row]); }
      }
      const vis = row >= 0;
      o.label.style.display = o.year.style.display = o.stem.style.display = vis ? "" : "none";
      if (vis) {
        const y = rowY(row);
        o.label.setAttribute("x", lx); o.label.setAttribute("y", y); o.label.setAttribute("text-anchor", "middle");
        o.year.setAttribute("x", lx); o.year.setAttribute("y", y + 11); o.year.setAttribute("text-anchor", "middle");
        o.stem.setAttribute("x1", x); o.stem.setAttribute("x2", x); o.stem.setAttribute("y1", lineY + 26); o.stem.setAttribute("y2", y - 10);
      }
    });

    // characters
    // with a filter on, fewer people compete for space, so they show up sooner
    const need = (c) => TIER[showMode === "all" ? c.tier : Math.min(c.tier, 3)];
    const cands = dotEls.filter((d) => isPinned(d.c) || hoverC === d.c || (inMode(d.c) && view.ppy >= need(d.c)));
    packLanes(cands, packForce); packForce = false;
    const relSet = new Set(hoverC ? hoverC.relIds : []);
    for (const d of dotEls) {
      const c = d.c;
      const xb = X(c.tb), xd = X(c.td);
      const on = d.lane >= 0 && xd > -40 && xb < W + 40;
      if (!on) {
        if (d.visible) { d.node.style.display = "none"; d.life.style.display = "none"; d.visible = false; }
        continue;
      }
      if (!d.node) buildDot(d);
      if (!d.visible) {
        d.node.style.display = ""; d.life.style.display = "";
        d.node.classList.add("entering");
        requestAnimationFrame(() => d.node.classList.remove("entering"));
        d.visible = true;
      }
      const y = laneY(d.lane);
      d.node.setAttribute("transform", `translate(${xb},${y})`);
      // the line starts after the name, so the label never sits on top of it
      if (!d.gap) d.gap = 11 + d.name.getComputedTextLength() + 6;
      const pin = pinColor(c);
      d.sel.setAttribute("stroke", pin || "transparent");
      d.node.classList.toggle("pinned", !!pin);
      d.node.classList.toggle("is-hover", hoverC === c);
      d.life.classList.toggle("is-hover", hoverC === c);
      d.node.classList.toggle("is-rel", relSet.has(c.id));
      d.y = y; d.xb = xb; d.xd = xd;
    }
    cutLifeLines();

    placePortrait();
    renderRels();
    renderTracks();
    renderCursor();
    renderMinimap();
  }

  /* A lifespan line starts after its own name, and is also cut wherever another person's name
     sits on it (packing lets a short-lived person's name share a lane with a long line). */
  function cutLifeLines() {
    const byLane = new Map();
    for (const d of dotEls) {
      if (!d.visible) continue;
      if (!byLane.has(d.lane)) byLane.set(d.lane, []);
      byLane.get(d.lane).push(d);
    }
    for (const ds of byLane.values()) {
      for (const d of ds) {
        let segs = [[Math.min(d.xb + d.gap, d.xd), d.xd]];
        for (const o of ds) {
          if (o === d) continue;
          const a = o.xb - 8, b = o.xb + o.gap - 3;
          segs = segs.flatMap(([s, e]) => (b <= s || a >= e) ? [[s, e]] : [[s, a], [b, e]].filter(([p, q]) => q - p > 0.5));
        }
        d.life.setAttribute("d", segs.map(([s, e]) => `M${s},${d.y}H${e}`).join(""));
      }
    }
  }

  /* family links: while hovering a person, curved lines join them to the relatives on screen.
     Each end of a line takes the colour of the person at that end (blue male, rose female),
     blending in the middle, so father-to-son and father-to-daughter read at a glance. */
  const SEX_COLOR = { m: "var(--male)", f: "var(--female)" };
  function renderRels() {
    g.rels.textContent = "";
    if (!hoverC) return;
    const h = DOT_BY_ID.get(hoverC.id);
    if (!h || !h.visible) return;
    const x0 = X(hoverC.tb), y0 = h.y;
    const defs = el("defs", {}, g.rels);
    let n = 0;
    const a = SEX_COLOR[hoverC.gender] || "var(--accent)";
    for (const id of hoverC.relIds) {
      const r = DOT_BY_ID.get(id);
      if (!r || !r.visible) continue;
      const x1 = X(r.c.tb), y1 = r.y;
      const lift = Math.min(60, Math.abs(x1 - x0) * 0.25 + 12);
      const grad = el("linearGradient", { id: "relg" + n, gradientUnits: "userSpaceOnUse", x1: x0, y1: y0, x2: x1, y2: y1 + (x1 === x0 && y1 === y0 ? 1 : 0) }, defs);
      const b = SEX_COLOR[r.c.gender] || "var(--accent)";
      [[0, a], [0.3, a], [0.7, b], [1, b]].forEach(([o, col]) => el("stop", { offset: o, style: `stop-color:${col}` }, grad));
      el("path", { class: "rel-link", style: `stroke:url(#relg${n})`, d: `M${x0},${y0} C${x0},${Math.min(y0, y1) - lift} ${x1},${Math.min(y0, y1) - lift} ${x1},${y1}` }, g.rels);
      el("circle", { class: "rel-end", cx: x1, cy: y1, r: r.c.tier === 1 ? 8 : 7, style: `stroke:${b}` }, g.rels);
      n++;
    }
    // the hovered person's own end: a ring in their colour, so the hub of the links is easy to find
    if (n) el("circle", { class: "rel-end rel-hub", cx: x0, cy: y0, r: hoverC.tier === 1 ? 8.5 : 7.5, style: `stroke:${a}` }, g.rels);
  }

  /* personal timelines (hover + pinned windows), juxtaposed under the main line */
  function renderTracks() {
    g.tracks.textContent = "";
    const list = wins.map((w) => ({ c: w.c, color: w.color }));
    if (hoverC && !list.some((o) => o.c === hoverC)) list.push({ c: hoverC, color: "var(--accent)", hover: true });
    const fit = trackFit(list.length);
    while (list.length > fit.n) list.splice(list.findIndex((o) => o.c !== hoverC), 1);   // drop the oldest, keep the hover track
    const lastIdx = list.length - 1;

    if (hoverC) {
      const xb = X(hoverC.tb), xd = X(hoverC.td);
      spanHl.style.display = "";
      spanHl.setAttribute("x1", xb); spanHl.setAttribute("x2", Math.max(xd, xb + 2));
      spanHl.setAttribute("y1", L.lineY); spanHl.setAttribute("y2", L.lineY);
    } else spanHl.style.display = "none";

    list.forEach((o, i) => {
      const c = o.c, y = L.trackY0 + i * fit.step;
      const xb = X(c.tb), xd = Math.max(X(c.td), xb + 3);
      const active = o.hover || c === hoverC;
      const grp = el("g", { opacity: active || !hoverC ? 1 : 0.45 }, g.tracks);
      if (active) {
        for (const x of [xb, xd]) el("line", { class: "conn", x1: x, x2: x, y1: L.lineY + 3, y2: y, stroke: o.color }, grp);
      }
      el("line", { class: "track-line" + (c.assumed ? " q-assumed" : ""), x1: xb, x2: xd, y1: y, y2: y, stroke: o.color }, grp);
      el("circle", { class: "track-end", cx: xb, cy: y, r: 3.5, stroke: o.color }, grp);
      el("circle", { class: "track-end", cx: xd, cy: y, r: 3.5, stroke: o.color }, grp);

      // name label: left of the track if room, otherwise above its start
      const nm = el("text", { class: "track-name", fill: o.color }, grp);
      nm.textContent = c.name;
      const nw = c.name.length * 7 + 10;
      if (xd < 0 || xb > W) {   // whole life off-screen: point toward it
        const left = xd < 0;
        nm.textContent = `${left ? "‹ " : ""}${c.name} · ${fmtYear(c.born)}${left ? "" : " ›"}`;
        nm.setAttribute("x", left ? 8 : W - 8); nm.setAttribute("y", y + 4); nm.setAttribute("text-anchor", left ? "start" : "end");
        return;
      }
      if (xb - nw > 4) { nm.setAttribute("x", xb - 10); nm.setAttribute("y", y + 4); nm.setAttribute("text-anchor", "end"); }
      else { nm.setAttribute("x", Math.max(4, xb)); nm.setAttribute("y", y - 8); }
      const ag = el("text", { class: "track-age", x: xd + 9, y: y + 3 }, grp);
      ag.textContent = ageText(c);

      const showLabels = active && i === lastIdx;
      const rowsEnd = [-Infinity, -Infinity];
      c.events.forEach(([yr, text], k) => {
        const x = X(A(yr));
        const act = el("g", { class: "track-act" + (tipAct && tipAct.c === c && tipAct.k === k ? " active" : "") }, grp);
        act.__act = { c, k, x, y, color: o.color };
        el("circle", { class: "hit", cx: x, cy: y, r: L.mobile ? 11 : 8 }, act);
        el("circle", { class: "track-ev", cx: x, cy: y, r: 2.6, fill: o.color }, act);
        if (!showLabels) return;
        const label = text.length > 34 ? text.slice(0, 33) + "…" : text;
        const w = label.length * 5.6 + 50;
        const r = rowsEnd.findIndex((e) => e < x - 4);
        if (r < 0) return;
        rowsEnd[r] = x + w;
        const ty = y + 16 + r * 13;
        if (ty > Math.min(H - L.bottom + 18, cardTop - 6)) return;
        const t1 = el("text", { class: "track-evyear", x, y: ty }, grp);
        t1.textContent = fmtYear(yr);
        const t2 = el("text", { class: "track-evlabel", x: x + fmtYear(yr).length * 5.6 + 6, y: ty }, grp);
        t2.textContent = label;
      });
    });
  }

  function renderCursor() {
    g.cursor.textContent = "";
    if (cursorT == null) return;
    const x = X(cursorT);
    el("line", { class: "cursor-line", x1: x, x2: x, y1: L.top, y2: H - L.bottom + 10 }, g.cursor);
    el("text", { class: "cursor-label", x: x + 6, y: L.top + 12 }, g.cursor).textContent = fmtT(cursorT, true);
  }

  /* ───────────────────────── minimap ───────────────────────── */
  const mini = $("minimap"), miniSvg = $("miniSvg"), miniView = $("miniView");
  (function buildMini() {
    miniSvg.setAttribute("viewBox", "0 0 1000 30");
    const mx = (t) => ((t - T0) / (T1 - T0)) * 1000;
    ERAS.forEach((e, i) => { if (!(i % 2)) el("rect", { class: "mini-era", x: mx(A(e.from)), width: mx(A(e.to)) - mx(A(e.from)), y: 0, height: 30 }, miniSvg); });
    EVENTS.forEach((e) => el("line", { class: "mini-ev", x1: mx(A(e.year)), x2: mx(A(e.year)), y1: 8, y2: 22, "vector-effect": "non-scaling-stroke" }, miniSvg));
    CHARS.filter((c) => c.tier === 1).forEach((c, i) => el("rect", { class: "mini-dot", x: mx(c.tb), y: 24 - (i % 4) * 3, width: 2.5, height: 1.4 }, miniSvg));
  })();
  function renderMinimap() {
    const mw = mini.clientWidth;
    const a = ((view.t0 - T0) / (T1 - T0)) * mw, b = ((tAt(W) - T0) / (T1 - T0)) * mw;
    const l = Math.max(0, a), r = Math.min(mw, b);
    miniView.style.left = l + "px"; miniView.style.width = Math.max(3, r - l) + "px";
  }
  function miniJump(e) {
    const rect = mini.getBoundingClientRect();
    const t = T0 + ((e.clientX - rect.left) / rect.width) * (T1 - T0);
    view.t0 = t - W / 2 / view.ppy; clampView(); requestRender();
  }
  mini.addEventListener("pointerdown", (e) => { mini.setPointerCapture(e.pointerId); miniJump(e); hideHint(); });
  mini.addEventListener("pointermove", (e) => { if (mini.hasPointerCapture(e.pointerId)) miniJump(e); });

  /* ───────────────────────── hover & portrait ───────────────────────── */
  const pStage = $("portraitStage"), pFrame = $("portraitFrame");
  let portraitFor = null, hoverTimer = 0;
  function setHover(c) {
    clearTimeout(hoverTimer);
    if (hoverC === c) return;
    hoverC = c;
    if (c) {
      if (portraitFor !== c) {
        pFrame.innerHTML = window.Portrait.html(c);
        portraitFor = c;
      }
      $("pcName").textContent = c.name;
      $("pcYears").textContent = `${fmtRange(c)} · ${ageText(c)}`;
      $("pcRole").textContent = c.role || "";
      $("pcHint").textContent = isPinned(c) ? "Tap again to bring its window forward" : "Tap again for details";
      placePortrait();
      pStage.classList.add("show");
    } else {
      pStage.classList.remove("show");
    }
    requestRender();
  }
  // The portrait gets its own dark card in one fixed spot: under the lifespan tracks, between
  // the timeline and the bottom controls, where it never covers the names. It moves down as
  // more windows add tracks and stops above the minimap (or the window dock). When there is no
  // longer room for the drawing, the card shrinks to just the name and dates, so the tracks
  // above it stay visible.
  const CARD_FULL = () => (L.mobile ? 130 : 150), CARD_SMALL = () => (L.mobile ? 76 : 58);
  function bottomLimit() {
    const limit = L.mobile ? H - L.bottom - 4 : H - 58;
    return wins.length ? Math.min(limit, dock.getBoundingClientRect().top - 4) : limit;   // stop above the window dock
  }
  // How many personal tracks fit, and how far apart: with a hover card, leave room for the small
  // card. Tracks squeeze a little closer before any is left out.
  function trackFit(want) {
    const room = bottomLimit() - L.trackY0 - (hoverC ? 14 + CARD_SMALL() : 16);
    const step = want > 1 ? Math.max(20, Math.min(L.trackStep, room / (want - 1))) : L.trackStep;
    return { n: Math.max(1, Math.min(want, Math.floor(room / step) + 1)), step };
  }
  function placePortrait() {
    cardTop = Infinity;
    if (!hoverC) return;
    const s = pStage.style, m = L.mobile ? 12 : 24, limit = bottomLimit();
    const { n, step } = trackFit(wins.length + (isPinned(hoverC) ? 0 : 1));
    // under the last track and the hover track's event notes, or just under the track if the notes don't fit
    let top = Math.min(L.trackY0 + (n - 1) * step + 52, limit - CARD_SMALL());
    const small = limit - top < CARD_FULL();
    cardTop = top;
    pStage.classList.toggle("compact", small);
    const h = Math.min(limit - top, L.mobile ? 200 : 220), cw = Math.min(W - 2 * m, 560);
    s.setProperty("--pw", Math.round((h - 20) / 1.2) + "px");
    s.left = (W - cw) / 2 + "px"; s.top = top + "px"; s.width = cw + "px";
  }

  // People sit close together, so the cursor often brushes past a neighbour or the
  // thin gap between two names. A short grace period keeps that from fading the
  // portrait out and back in, or swapping it to whoever was only passed over.
  const HOVER_LEAVE_MS = 450, HOVER_SWITCH_MS = 90;
  function clearHoverSoon() { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => setHover(null), HOVER_LEAVE_MS); }

  g.dots.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse" || dragging) return;
    const n = e.target.closest(".dot"); if (!n) return;
    const c = n.__c;
    if (!hoverC || hoverC === c) { setHover(c); return; }
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => setHover(c), HOVER_SWITCH_MS);
  });
  g.dots.addEventListener("pointerout", (e) => {
    if (e.pointerType !== "mouse") return;
    const n = e.target.closest(".dot");
    if (n && !(e.relatedTarget && n.contains(e.relatedTarget))) clearHoverSoon();
  });
  g.dots.addEventListener("focusin", (e) => { const n = e.target.closest(".dot"); if (n) setHover(n.__c); });
  g.dots.addEventListener("focusout", () => clearHoverSoon());
  g.dots.addEventListener("keydown", (e) => {
    const n = e.target.closest(".dot");
    if (n && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openWindow(n.__c); }
  });

  /* event tooltip: its scripture citations and Google Maps link can be clicked, so with a mouse it
     stays open while the pointer travels from the event into it (a short grace delay) and closes once
     the pointer has left both; on a phone a tap opens it and it stays until a tap elsewhere */
  let tipEv = null, tipTimer = 0;
  function showTip(ev) {
    clearTimeout(tipTimer);
    if (tipEv === ev && tip.classList.contains("show")) return;
    tipEv = ev;
    const pid = (window.EVENT_PLACES || {})[ev.id], pl = pid && window.BibleMap && BibleMap.place(pid);
    const map = pl ? `<div class="et-map">${BibleMap.svg([{ id: pid }], { w: 252, h: 112, cls: "bm-tip", labels: false, minSpan: 7, label: pl.n })}<div class="et-place">${esc(pl.n)}${pl.s === "known" ? "" : `<span class="pl-s s-${pl.s}">${pl.s === "likely" ? "likely site" : "location uncertain"}</span>`} ${gmapLink(pl)}</div></div>` : "";
    tip.innerHTML = `<div class="et-year">${esc(fmtYear(ev.year, true))}</div><div class="et-title">${esc(ev.title)}</div><div class="et-text">${esc(ev.text)}</div><div class="et-ref">${Scripture.linkRefs(ev.ref)}</div>${map}`;
    const x = Math.min(W - 150, Math.max(150, X(A(ev.year))));
    tip.style.left = x + "px";
    tip.style.top = Math.max(L.top, L.lineY - 26 - tip.offsetHeight) + "px";
    tip.classList.add("show", "live");
    evEls.forEach((o) => o.node.classList.toggle("active", o.ev === ev));
  }
  function hideTip() { clearTimeout(tipTimer); tipEv = null; tip.classList.remove("show", "live"); evEls.forEach((o) => o.node.classList.remove("active")); hideActTip(); }
  function hideTipSoon() { clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 350); }
  g.events.addEventListener("pointerover", (e) => { if (e.pointerType === "mouse") { const n = e.target.closest(".ev-node"); if (n) showTip(n.__ev); } });
  g.events.addEventListener("pointerout", (e) => { if (e.pointerType === "mouse" && e.target.closest(".ev-node") && tipEv) hideTipSoon(); });
  g.events.addEventListener("focusin", (e) => { const n = e.target.closest(".ev-node"); if (n) showTip(n.__ev); });
  g.events.addEventListener("focusout", (e) => { if (!tip.contains(e.relatedTarget)) hideTip(); });
  tip.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && tipEv) clearTimeout(tipTimer); });
  tip.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && tipEv) hideTipSoon(); });
  tip.addEventListener("focusout", (e) => { if (tipEv && !tip.contains(e.relatedTarget) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".ev-node"))) hideTip(); });
  // a press inside the tooltip is not a timeline drag or tap, so its links get the click
  tip.addEventListener("pointerdown", (e) => e.stopPropagation());
  g.events.addEventListener("keydown", (e) => { const n = e.target.closest(".ev-node"); if (n && e.key === "Enter") zoomToEvent(n.__ev); });
  function zoomToEvent(ev) { animateTo(A(ev.year), Math.max(view.ppy * 1.8, TIER[1] * 1.6)); }

  /* major-activity dots on the personal lifespan tracks: hover (or tap) for the date and
     activity, click (or tap again) to open the person's window at that activity */
  let tipAct = null;
  function showActTip(a, touch) {
    hideTip();
    tipAct = a;
    const [yr, text, ref] = a.c.events[a.k];
    tip.innerHTML = `<div class="et-year" style="color:${esc(a.color)}">${esc(fmtYear(yr, true))} · ${esc(a.c.name)}</div><div class="et-act">${esc(text)}</div><div class="et-ref">${esc(ref)}</div><div class="et-hint">${touch ? "Tap again" : "Click"} to open in ${esc(a.c.name)}’s window</div>`;
    tip.style.left = Math.min(W - 150, Math.max(150, a.x)) + "px";
    tip.style.top = Math.max(L.top, a.y - 14 - tip.offsetHeight) + "px";
    tip.classList.add("show");
    g.tracks.querySelectorAll(".track-act").forEach((n) => n.classList.toggle("active", n.__act.c === a.c && n.__act.k === a.k));
  }
  function hideActTip() {
    if (!tipAct) return;
    tipAct = null;
    if (!tipEv) tip.classList.remove("show");
    g.tracks.querySelectorAll(".track-act.active").forEach((n) => n.classList.remove("active"));
  }
  function openActivity(c, k) {
    hideActTip();
    openWindow(c);
    const w = wins.find((x) => x.c === c);
    const li = w && w.el.querySelector(`.acts li[data-i="${k}"]`);
    if (!li) return;
    scrollToRow(w, li);
    w.el.querySelectorAll(".acts li.act-hl").forEach((o) => o.classList.remove("act-hl"));
    void li.offsetWidth; li.classList.add("act-hl");
    cursorT = +li.dataset.t; requestRender();
  }
  g.tracks.addEventListener("pointerover", (e) => {
    const n = e.target.closest(".track-act"); if (!n || e.pointerType !== "mouse" || dragging) return;
    if (n.__act.c === hoverC) clearTimeout(hoverTimer);   // keep a hover-only track alive while it is used
    showActTip(n.__act, false);
  });
  g.tracks.addEventListener("pointerout", (e) => {
    const n = e.target.closest(".track-act"); if (!n || e.pointerType !== "mouse") return;
    if (e.relatedTarget && n.contains(e.relatedTarget)) return;
    hideActTip();
    if (n.__act.c === hoverC && !isPinned(hoverC)) clearHoverSoon();
  });

  /* ───────────────────────── pointer: pan, pinch, tap ───────────────────────── */
  const pointers = new Map();
  let dragging = false, gesture = null;
  stage.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    if (pointers.size === 1) {
      gesture = { type: "pan", x: e.clientX, t0: view.t0, moved: false, target: e.target, pointerType: e.pointerType };
    } else if (pointers.size === 2) {
      const [p, q] = [...pointers.values()];
      gesture = { type: "pinch", d: Math.hypot(p.x - q.x, p.y - q.y) || 1, mx: (p.x + q.x) / 2, ppy: view.ppy, t: tAt((p.x + q.x) / 2), moved: true };
      foldForGesture();
    }
  });
  // On a phone the open windows cover most of the timeline, so dragging or pinching it folds them
  // into the dock; Unfold all (or a name chip) brings them back.
  function foldForGesture() { if (L.mobile) wins.forEach(minimize); }
  stage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId) || !gesture) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (gesture.type === "pan") {
      const dx = e.clientX - gesture.x;
      if (!gesture.moved && Math.abs(dx) > (e.pointerType === "mouse" ? 4 : 8)) { gesture.moved = true; dragging = true; stage.classList.add("dragging"); hideTip(); hideHint(); foldForGesture(); }
      if (gesture.moved) { view.t0 = gesture.t0 - dx / view.ppy; clampView(); requestRender(); }
    } else if (gesture.type === "pinch" && pointers.size >= 2) {
      const [p, q] = [...pointers.values()];
      const d = Math.hypot(p.x - q.x, p.y - q.y) || 1, mx = (p.x + q.x) / 2;
      view.ppy = gesture.ppy * (d / gesture.d); clampView();
      view.t0 = gesture.t - mx / view.ppy; clampView();
      hideHint(); requestRender();
    }
  });
  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (gesture && gesture.type === "pan" && !gesture.moved && e.type === "pointerup") handleTap(gesture.target, gesture.pointerType);
    if (pointers.size === 1 && gesture && gesture.type === "pinch") {
      const [p] = [...pointers.values()];
      gesture = { type: "pan", x: p.x, t0: view.t0, moved: true };
    } else if (pointers.size === 0) {
      gesture = null; dragging = false; stage.classList.remove("dragging");
    }
  }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);

  function handleTap(target, type) {
    const dot = target && target.closest && target.closest(".dot");
    const ev = target && target.closest && target.closest(".ev-node");
    const act = target && target.closest && target.closest(".track-act");
    if (act) {
      const a = act.__act;
      if (type === "mouse" || (tipAct && tipAct.c === a.c && tipAct.k === a.k)) openActivity(a.c, a.k);
      else showActTip(a, true);
      return;
    }
    hideActTip();
    if (dot) {
      const c = dot.__c;
      if (type === "mouse") { setHover(c); openWindow(c); }
      else if (hoverC === c) openWindow(c);
      else { hideTip(); setHover(c); }
      return;
    }
    if (ev) {
      if (type === "mouse") zoomToEvent(ev.__ev);
      else if (tipEv === ev.__ev) zoomToEvent(ev.__ev);
      else showTip(ev.__ev);
      return;
    }
    hideTip();
    if (type !== "mouse") setHover(null);
  }

  stage.addEventListener("wheel", (e) => {
    e.preventDefault();
    hideHint(); hideTip();
    const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    const dx = e.deltaX * k, dy = e.deltaY * k;
    if (e.ctrlKey) { zoomAt(Math.exp(-dy * 0.012), e.clientX); return; }
    if (Math.abs(dx) > Math.abs(dy) || e.shiftKey) {
      view.t0 += (Math.abs(dx) > Math.abs(dy) ? dx : dy) / view.ppy; clampView(); requestRender(); return;
    }
    zoomAt(Math.exp(-dy * 0.0016), e.clientX);
  }, { passive: false });

  /* controls */
  $("zoomIn").addEventListener("click", () => { hideHint(); animateTo(tAt(W / 2), view.ppy * 1.9, 420); });
  $("zoomOut").addEventListener("click", () => animateTo(tAt(W / 2), view.ppy / 1.9, 420));
  $("zoomFit").addEventListener("click", () => animateTo((T0 + T1) / 2, fitPpy(), 600));
  $("brand").addEventListener("click", (e) => { e.preventDefault(); setHover(null); animateTo((T0 + T1) / 2, fitPpy(), 600); });

  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "Escape") { if (!$("about").hidden) closeAbout(); else { setHover(null); hideTip(); showBox.classList.remove("open"); } return; }
    if (e.target.closest && e.target.closest(".win")) return;
    if (e.key === "ArrowLeft") { view.t0 -= (W * 0.12) / view.ppy; clampView(); requestRender(); }
    else if (e.key === "ArrowRight") { view.t0 += (W * 0.12) / view.ppy; clampView(); requestRender(); }
    else if (e.key === "+" || e.key === "=") zoomAt(1.4, W / 2);
    else if (e.key === "-" || e.key === "_") zoomAt(1 / 1.4, W / 2);
    else if (e.key === "0") animateTo((T0 + T1) / 2, fitPpy(), 600);
  });

  /* hint */
  const hint = $("zoomHint");
  function hideHint() { hint.classList.add("hide"); }
  setTimeout(hideHint, 12000);

  /* ───────────────────────── locate ───────────────────────── */
  function locate(c, then) {
    const span = Math.max(30, c.td - c.tb);
    const ppy = Math.max(TIER[c.tier] * 1.15, Math.min((W * (L.mobile ? 0.7 : 0.45)) / span, 30));
    animateTo((c.tb + c.td) / 2, ppy, 800);
    setTimeout(() => { setHover(c); if (then) then(); }, 820);
  }

  /* ───────────────────────── floating windows ───────────────────────── */
  const winBox = $("windows"), dock = $("dock");
  // Gold (--accent) marks people who are hovered but not opened, so opened windows use other hues.
  // no blue or rose here: those mean man / woman on the family links
  const COLORS = ["#6fc2a4", "#d98a64", "#b69ad8", "#9fc38a", "#e3ded3"];
  const wins = [];
  let zTop = 10;
  const isPinned = (c) => wins.some((w) => w.c === c);
  const pinColor = (c) => { const w = wins.find((w) => w.c === c); return w ? w.color : null; };

  const ICON = {
    locate: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
    min: '<svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg>',
    restorePath: "M6 7h12v11H6zM6 10h12",
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };
  const QLABEL = { derived: "from Bible ages", estimated: "estimated", assumed: "assumed" };

  function miniTimeline(c) {
    const a = c.tb, b = Math.max(c.td, c.tb + 1), w = 300, pad = 12;
    const mx = (t) => pad + ((t - a) / (b - a)) * (w - pad * 2);
    let s = `<svg class="mini-tl" viewBox="0 0 ${w} 44" preserveAspectRatio="none" aria-hidden="true">`;
    s += `<line x1="${pad}" x2="${w - pad}" y1="16" y2="16" stroke="var(--wc)" stroke-width="1.5"${c.assumed ? ' stroke-dasharray="4 3"' : ""}/>`;
    s += `<circle cx="${pad}" cy="16" r="3.5" fill="var(--bg)" stroke="var(--wc)"/><circle cx="${w - pad}" cy="16" r="3.5" fill="var(--bg)" stroke="var(--wc)"/>`;
    c.events.forEach(([yr], i) => {
      const x = Math.max(pad, Math.min(w - pad, mx(A(yr))));
      s += `<circle class="mt-ev" data-i="${i}" cx="${x.toFixed(1)}" cy="16" r="2.4" fill="var(--wc)"/>`;
    });
    s += `<text x="${pad - 2}" y="36">${esc(fmtYear(c.born))}</text><text x="${w - pad + 2}" y="36" text-anchor="end">${esc(fmtYear(c.died))}</text>`;
    s += `<text x="${w / 2}" y="36" text-anchor="middle">${esc(ageText(c))}</text></svg>`;
    return s;
  }

  function familyHTML(c) {
    const rows = REL_KEYS.map(([k, label]) => {
      const ids = (c.rel[k] || []).filter((id) => CHAR_BY_ID.has(id));
      const extra = (c.relNames && c.relNames[k]) || [];
      if (!ids.length && !extra.length) return "";
      const chips = ids.map((id) => { const r = CHAR_BY_ID.get(id); return `<button class="rel-chip" data-rel="${esc(id)}" title="${esc(r.role || "")}">${esc(r.name)}</button>`; });
      const plain = extra.map((n) => `<span class="rel-plain">${esc(n)}</span>`);
      const n = ids.length + extra.length;
      const lab = label === "Child" ? (n > 1 ? "Children" : "Child") : label + (n > 1 ? "s" : "");
      return `<div class="rel-row"><span class="rel-k">${lab}</span><span class="rel-v">${chips.concat(plain).join("")}</span></div>`;
    }).join("");
    if (rows) return `<div class="win-h">Family</div><div class="rel">${rows}</div>`;
    return c.family ? `<div class="win-family">${Scripture.linkText(c.family)}</div>` : "";
  }

  /* the map of a person's places: on a computer it is drawn in the map window (mapW, below), which
     follows the window in use; on a phone it is drawn in the person's own window and stays pinned
     under the lifespan bar while the activities scroll. A life that ranges far beyond Canaan
     (Abraham from Ur, Paul to Rome) gets a second, closer map of Canaan, chosen with a switch. */
  const SURE = { likely: "likely site", possible: "location uncertain" };
  function mapViews(c, phone) {
    const near = BibleMap.detail(c.places), h = phone ? 150 : 210;
    const all = BibleMap.svg(c.places, { w: 340, h, route: true, labels: near ? "far" : true, near: near && near.map((s) => s.id), label: `Places in the life of ${c.name}` });
    const canaan = near ? BibleMap.svg(near, { w: 340, h: phone ? 150 : 230, route: true, label: `Places in Canaan in the life of ${c.name}` }) : "";
    const sw = near ? `<button class="bm-sw" data-v="all" aria-pressed="true">Whole journey</button><button class="bm-sw" data-v="canaan" aria-pressed="false">Canaan</button>` : "";
    const hide = phone ? `<button class="bm-hide" aria-expanded="true">Hide map</button>` : "";
    return `<div class="bm-views" data-v="all" data-near="${near ? esc([...new Set(near.map((s) => s.id))].join(" ")) : ""}">`
      + (sw || hide ? `<div class="bm-bar">${sw}${hide}</div>` : "")
      + `<div class="bm-v bm-v-all">${all}</div>${canaan ? `<div class="bm-v bm-v-canaan">${canaan}</div>` : ""}<div class="bm-cap"></div></div>`;
  }
  const placeNote = (pl) => (pl.note || "").replace(/^Identified with /, "Usually placed at ");
  function placeTitle(pl) {
    const sure = SURE[pl.s] ? ` (${SURE[pl.s]})` : "", note = placeNote(pl);
    return pl.n + sure + (note ? `. ${note}` : "");
  }

  function windowHTML(c) {
    const acts = c.events.map(([yr, text, ref], i) => {
      const age = A(yr) - c.tb;
      const ageS = age >= 0 && age <= c.td - c.tb + 1 ? ` <span class="act-age">· ${c.q[0] === "derived" ? "" : "~"}age ${age}</span>` : "";
      const sts = c.places ? c.places.filter((p) => p.k === i) : [];
      const pl = sts.map((st) => { const p = BibleMap.place(st.id); return ` <button class="act-p s-${p.s}" data-place="${esc(st.id)}" title="${esc(placeTitle(p))}"><b>${st.n}</b>${esc(BibleMap.shortName(p.n))}${p.s === "possible" ? "?" : ""}</button>`; }).join("");
      return `<li data-t="${A(yr)}" data-i="${i}"${sts.length ? ` data-place="${esc(sts.map((st) => st.id).join(" "))}"` : ""}><span class="act-y">${esc(fmtYear(yr, true))}${ageS}${pl}</span><span class="act-t">${esc(text)}</span><span class="act-r">${Scripture.linkRefs(ref)}</span></li>`;
    }).join("");
    return `
      <div class="win-head">
        <div class="win-thumb">${window.Portrait.html(c)}</div>
        <div class="win-title"><div class="win-name">${esc(c.name)}</div><div class="win-dates"><span>${esc(fmtRange(c))}</span> · <span>${esc(ageText(c))}</span></div></div>
        <div class="win-btns">
          <button class="win-btn" data-act="locate" aria-label="Show ${esc(c.name)} on the timeline" title="Show on timeline">${ICON.locate}</button>
          <button class="win-btn" data-act="min" aria-label="Minimize" title="Minimize">${ICON.min}</button>
          <button class="win-btn" data-act="close" aria-label="Close" title="Close">${ICON.close}</button>
        </div>
      </div>
      <div class="win-body">
        <div class="win-role">${esc(c.role)}</div>
        ${c.meaning ? `<div class="win-meaning">“${esc(c.meaning)}”</div>` : ""}
        <div class="badges">
          <span class="badge${c.q[0] === "assumed" ? " assumed" : ""}">Birth: ${QLABEL[c.q[0]]}</span>
          <span class="badge${c.q[1] === "assumed" ? " assumed" : ""}">Death: ${QLABEL[c.q[1]]}</span>
        </div>
        ${c.note ? `<p class="win-note">${c.assumed ? "⚑ " : ""}${Scripture.linkText(c.note)}</p>` : ""}
        <p class="win-summary">${Scripture.linkText(c.summary)}</p>
        ${familyHTML(c)}
        <div class="win-h">Lifespan</div>
        ${miniTimeline(c)}
        ${c.places ? `<div class="win-map">${mapViews(c, true)}</div>` : ""}
        ${acts ? `<div class="win-h">Major activities</div><ul class="acts">${acts}</ul>` : ""}
        ${c.refs.length ? `<div class="win-h">Key scriptures</div><div class="win-refs">${c.refs.map(Scripture.linkRefs).join(" · ")}</div>` : ""}
        <div class="win-src">Scripture: <em>New World Translation of the Holy Scriptures</em> (Study Edition). ${c.src ? `Person: <em>Insight on the Scriptures</em>, “${esc(c.src)}.” ` : ""}Chronology after <em>Insight on the Scriptures</em>, “Chronology.”${c.places && c.places.length ? " Places: OpenBible.info Bible Geocoding Data (CC BY 4.0), checked against <em>Insight</em> and the maps in the <em>New World Translation</em> (Appendix A7 and B)." : ""}</div>
      </div>`;
  }

  function openWindow(c) {
    let w = wins.find((x) => x.c === c);
    if (w) { restore(w); focusWin(w); w.el.classList.remove("flash"); void w.el.offsetWidth; w.el.classList.add("flash"); return; }
    const used = new Set(wins.map((x) => x.color));
    const color = COLORS.find((k) => !used.has(k)) || COLORS[wins.length % COLORS.length];
    const node = document.createElement("section");
    node.className = "win";
    node.setAttribute("role", "dialog");
    node.setAttribute("aria-label", c.name);
    node.style.setProperty("--wc", color);
    node.innerHTML = windowHTML(c);
    winBox.appendChild(node);

    const n = wins.length;
    const ww = node.offsetWidth, wh = node.offsetHeight;
    let x, y;
    if (L.mobile) { x = (W - ww) / 2 + (n % 4) * 6; y = Math.max(60, H - wh - 150) - (n % 4) * 22; }   // clear of the dock
    else { x = W - ww - 84 - (n % 6) * 34; y = 84 + (n % 6) * 34; }
    w = { c, el: node, color, minimized: false, chip: null };
    place(w, x, y);
    wins.push(w);
    wireWindow(w);
    focusWin(w);
    syncDockAll();
    requestRender();
  }

  function place(w, x, y) {
    const ww = w.el.offsetWidth, wh = w.el.offsetHeight;
    x = Math.min(W - 60, Math.max(60 - ww, x));
    y = Math.min(H - 48, Math.max(L.mobile ? 52 : 56, y));
    if (L.mobile) x = Math.min(W - ww * 0.4, Math.max(-ww * 0.6, x));
    w.x = x; w.y = y;
    w.el.style.left = x + "px"; w.el.style.top = y + "px";
    void wh;
  }

  let focusedW = null;
  function focusWin(w) {
    wins.forEach((o) => o.el.classList.toggle("focused", o === w));
    w.el.style.zIndex = ++zTop;
    focusedW = w;
    syncMap();
  }

  /* scroll a window's activity row into the middle of what can be seen of the list, below the
     lifespan bar and (on a phone) the map pinned under it */
  function scrollToRow(w, li) {
    const body = w.el.querySelector(".win-body"), br = body.getBoundingClientRect();
    let pinned = 0;
    for (const n of w.el.querySelectorAll(".mini-tl, .win-map")) if (n.offsetParent) pinned += n.offsetHeight;
    const top = body.scrollTop + li.getBoundingClientRect().top - br.top;
    const room = Math.max(li.offsetHeight, body.clientHeight - pinned);
    body.scrollTo({ top: top - pinned - (room - li.offsetHeight) / 2, behavior: "smooth" });
  }

  function wireDrag(w) {
    const head = w.el.querySelector(".win-head");
    let drag = null;
    head.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".win-btn")) return;
      drag = { id: e.pointerId, dx: e.clientX - w.x, dy: e.clientY - w.y };
      head.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    head.addEventListener("pointermove", (e) => { if (drag && e.pointerId === drag.id) place(w, e.clientX - drag.dx, e.clientY - drag.dy); });
    const end = (e) => { if (drag && e.pointerId === drag.id) drag = null; };
    head.addEventListener("pointerup", end);
    head.addEventListener("pointercancel", end);
  }

  function wireWindow(w) {
    const head = w.el.querySelector(".win-head");
    w.el.addEventListener("pointerdown", () => focusWin(w));
    wireDrag(w);
    head.addEventListener("dblclick", (e) => { if (!e.target.closest(".win-btn")) minimize(w); });

    w.el.querySelector('[data-act="close"]').addEventListener("click", () => closeWin(w));
    w.el.querySelector('[data-act="min"]').addEventListener("click", () => minimize(w));
    w.el.querySelector('[data-act="locate"]').addEventListener("click", () => { if (L.mobile) minimize(w); locate(w.c); });

    w.el.querySelectorAll(".rel-chip").forEach((b) => b.addEventListener("click", () => {
      const r = CHAR_BY_ID.get(b.dataset.rel); if (!r) return;
      openWindow(r); locate(r);
    }));
    wirePlaces(w);
    const acts = w.el.querySelector(".acts");
    if (acts) acts.addEventListener("pointerover", (e) => { const li = e.target.closest("li"); if (li) { cursorT = +li.dataset.t; requestRender(); } });
    if (acts) acts.addEventListener("pointerleave", () => { cursorT = null; requestRender(); });
    if (acts) acts.addEventListener("click", (e) => {
      if (e.target.closest(".ref-link")) return;   // the citation opens wol.jw.org in a new tab instead
      const tag = e.target.closest(".act-p");
      if (tag) { showPlace(w, tag.dataset.place); return; }
      const li = e.target.closest("li"); if (!li) return;
      if (li.dataset.place) { const id = li.dataset.place.split(" ")[0]; followView(w, id); markPlace(w, id); }
      const t = +li.dataset.t;
      cursorT = t;
      animateTo(t, Math.max(view.ppy, TIER[w.c.tier] * 1.2), 600);
      // briefly highlight the matching dot on the window's own lifespan bar
      const dot = w.el.querySelector(`.mini-tl .mt-ev[data-i="${li.dataset.i}"]`);
      if (dot) { dot.classList.remove("mt-hl"); void dot.getBoundingClientRect(); dot.classList.add("mt-hl"); }
    });
  }

  /* places: hovering an activity with a place tag, or a pin, lights the pin and the activities there;
     clicking a pin scrolls the window to the first activity there, and clicking a place tag shows it */
  const mapBoxes = (w) => [w.el.querySelector(".win-map"), mapW.c === w.c && !L.mobile ? mapW.body : null].filter(Boolean);
  const hasId = (n, id) => (n.dataset.place || "").split(" ").includes(id);
  // Google Maps at the place, satellite view; an uncertain site opens at the spot used here, which the
  // link says is the suggested one
  function gmapLink(pl) {
    const [lon, lat] = pl.ll, z = pl.r ? 7 : 14;
    const url = `https://www.google.com/maps/place/${lat},${lon}/@${lat},${lon},${z}z/data=!3m1!1e3`;
    const text = pl.s === "known" ? "Open in Google Maps" : "Google Maps";
    return `<a class="bm-gmap" href="${esc(url)}" target="_blank" rel="noopener" title="${esc(pl.n)} in Google Maps (opens a new tab)">${text} ↗</a>`;
  }
  // the caption under the map keeps the last place pointed at, so its Google Maps link can be reached
  function markPlace(w, id) {
    if (id) w.capId = id;
    for (const box of mapBoxes(w)) {
      box.querySelectorAll(".bm-pin, .bm-label").forEach((n) => n.classList.toggle("hl", !!id && hasId(n, id)));
      const cap = box.querySelector(".bm-cap"), pl = w.capId && BibleMap.place(w.capId);
      if (!cap || cap.dataset.id === (w.capId || "")) continue;   // unchanged: keep the link under the pointer
      cap.dataset.id = w.capId || "";
      cap.innerHTML = pl ? `<b>${esc(pl.n)}</b>${SURE[pl.s] ? ` <span class="pl-s s-${pl.s}">${SURE[pl.s]}</span>` : ""}${placeNote(pl) ? ` <span>${esc(placeNote(pl))}</span>` : ""} ${gmapLink(pl)}` : capHint(box, w.c);
    }
    w.el.querySelectorAll(".acts li[data-place]").forEach((n) => n.classList.toggle("at-place", !!id && hasId(n, id)));
  }
  // with nothing hovered, the map window says what it can do; a phone has no room for that
  const capHint = (box, c) => (box === mapW.body ? `${new Set(c.places.map((s) => s.id)).size} places · point at a pin or an activity’s place tag` : "");
  function setMapView(box, v) {
    const views = box.querySelector(".bm-views");
    if (!views || !views.querySelector(".bm-v-canaan")) return;
    views.dataset.v = v;
    views.querySelectorAll(".bm-sw").forEach((b) => b.setAttribute("aria-pressed", b.dataset.v === v));
  }
  function followView(w, id) {
    for (const box of mapBoxes(w)) {
      const views = box.querySelector(".bm-views");
      if (views) setMapView(box, views.dataset.near.split(" ").includes(id) ? "canaan" : "all");
    }
  }
  function showPlace(w, id) {
    if (!L.mobile && mapW.min) { mapW.min = false; syncMap(); }
    for (const box of mapBoxes(w)) {
      const views = box.querySelector(".bm-views");
      if (views) {
        views.classList.remove("folded");
        const hb = views.querySelector(".bm-hide"); if (hb) { hb.textContent = "Hide map"; hb.setAttribute("aria-expanded", "true"); }
      }
    }
    followView(w, id);
    markPlace(w, id);
    for (const box of mapBoxes(w)) box.querySelectorAll(".bm-pin").forEach((n) => {
      if (!hasId(n, id)) return;
      n.classList.remove("ping"); void n.getBoundingClientRect(); n.classList.add("ping");
    });
  }
  function rowsAt(w, id) { return [...w.el.querySelectorAll(".acts li[data-place]")].filter((n) => hasId(n, id)); }
  function goToPlace(w, id) {
    const rows = rowsAt(w, id);
    if (!rows.length) return;
    scrollToRow(w, rows[0]);
    w.el.querySelectorAll(".acts li.act-hl").forEach((o) => o.classList.remove("act-hl"));
    rows.forEach((li) => { void li.offsetWidth; li.classList.add("act-hl"); });
  }
  // the map's own controls and pins, in a window (phone) or in the map window (computer)
  function wireMapBox(box, who) {
    box.addEventListener("pointerover", (e) => { const n = e.target.closest(".bm-pin, .bm-label"); const w = who(); if (w) markPlace(w, n ? n.dataset.place : null); });
    box.addEventListener("pointerleave", () => { const w = who(); if (w) markPlace(w, null); });
    box.addEventListener("click", (e) => {
      const w = who(); if (!w) return;
      const sw = e.target.closest(".bm-sw");
      if (sw) { setMapView(box, sw.dataset.v); return; }
      const hb = e.target.closest(".bm-hide");
      if (hb) {
        const views = box.querySelector(".bm-views"), fold = !views.classList.contains("folded");
        views.classList.toggle("folded", fold);
        hb.textContent = fold ? "Show map" : "Hide map"; hb.setAttribute("aria-expanded", !fold);
        return;
      }
      if (e.target.closest(".bm-inset-t")) { setMapView(box, "canaan"); return; }
      const n = e.target.closest(".bm-pin, .bm-label");
      if (n) { markPlace(w, n.dataset.place); goToPlace(w, n.dataset.place); }
    });
  }
  function wirePlaces(w) {
    const box = w.el.querySelector(".win-map"), acts = w.el.querySelector(".acts");
    if (box) wireMapBox(box, () => w);
    if (!acts || !w.c.places) return;
    // pointing at an activity (tapping it on a phone) also turns the map to the view its place is on:
    // the Canaan close-up for a place in Canaan, the whole journey for one beyond it (Haran, Egypt)
    acts.addEventListener("pointerover", (e) => {
      const li = e.target.closest("li[data-place]"), id = li && (e.target.closest(".act-p") || li).dataset.place.split(" ")[0];
      if (id) followView(w, id);
      markPlace(w, id || null);
    });
    acts.addEventListener("pointerleave", () => markPlace(w, null));
  }

  /* the map window (computer only): one window that shows the places of the person window in use,
     the focused one, or the last one opened that is not folded away. It can be minimized to the dock. */
  const dockAll = $("dockAll"), foldAllBtn = $("foldAll");
  const mapW = { el: document.createElement("section"), c: undefined, min: false, x: 0, y: 0, placed: false };
  mapW.el.className = "win mapwin";
  mapW.el.setAttribute("role", "dialog");
  mapW.el.setAttribute("aria-label", "Map of places");
  mapW.el.hidden = true;
  mapW.el.innerHTML = `<div class="win-head"><div class="mw-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg></div>`
    + `<div class="win-title"><div class="win-name">Places</div><div class="win-dates"><span class="mw-who"></span></div></div>`
    + `<div class="win-btns"><button class="win-btn" data-act="min" aria-label="Minimize the map" title="Minimize">${ICON.min}</button></div></div><div class="win-body mw-body"></div>`;
  winBox.appendChild(mapW.el);
  mapW.body = mapW.el.querySelector(".mw-body");
  const mapChip = document.createElement("button");
  mapChip.className = "chip map-chip";
  mapChip.hidden = true;
  mapChip.addEventListener("click", () => { mapW.min = false; syncMap(); mapW.el.style.zIndex = ++zTop; });
  dockAll.after(mapChip);
  mapW.el.addEventListener("pointerdown", () => { mapW.el.style.zIndex = ++zTop; });
  mapW.el.querySelector('[data-act="min"]').addEventListener("click", () => { mapW.min = true; syncMap(); });
  mapW.el.querySelector(".win-head").addEventListener("dblclick", (e) => { if (!e.target.closest(".win-btn")) { mapW.min = true; syncMap(); } });
  wireDrag(mapW);
  const mapFor = () => wins.find((w) => w.c === mapW.c && !w.minimized);
  wireMapBox(mapW.body, mapFor);

  function syncMap() {
    const open = wins.filter((w) => !w.minimized);
    const w = L.mobile ? null : focusedW && open.includes(focusedW) ? focusedW : open[open.length - 1];
    mapW.el.hidden = !w || mapW.min;
    mapChip.hidden = !w || !mapW.min;
    if (!w) return;
    mapW.el.style.setProperty("--wc", w.color);
    mapChip.style.setProperty("--wc", w.color);
    mapChip.innerHTML = `<i></i>Map · ${esc(w.c.name)}`;
    mapChip.setAttribute("aria-label", `Show the map of ${w.c.name}`);
    if (mapW.c !== w.c) {
      mapW.c = w.c;
      mapW.el.querySelector(".mw-who").textContent = w.c.name;
      mapW.body.innerHTML = w.c.places ? mapViews(w.c, false) : `<p class="mw-empty">The Bible names no places for ${esc(w.c.name)}.</p>`;
      if (w.c.places) { mapW.body.querySelector(".bm-cap").textContent = capHint(mapW.body, w.c); if (w.capId) markPlace(w, null); }
    }
    if (!mapW.el.hidden && !mapW.placed) { mapW.placed = true; place(mapW, 24, 84); }
  }

  function minimize(w) {
    if (w.minimized) return;
    w.minimized = true;
    w.el.style.display = "none";
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.style.setProperty("--wc", w.color);
    chip.innerHTML = `<i></i>${esc(w.c.name)}`;
    chip.setAttribute("aria-label", `Restore ${w.c.name}`);
    chip.addEventListener("click", () => { restore(w); focusWin(w); });
    dock.appendChild(chip);
    w.chip = chip;
    syncDockAll();
  }
  function restore(w) {
    if (!w.minimized) return;
    w.minimized = false;
    w.el.style.display = "";
    if (w.chip) w.chip.remove();
    w.chip = null;
    place(w, w.x, w.y);
    syncDockAll();
  }
  function closeWin(w) {
    const i = wins.indexOf(w);
    if (i >= 0) wins.splice(i, 1);
    w.el.remove();
    if (w.chip) w.chip.remove();
    if (focusedW === w) focusedW = null;
    cursorT = null;
    syncDockAll();
    requestRender();
  }

  /* fold or close every window at once; the buttons sit at the start of the dock while any window is open */
  const allFolded = () => wins.every((w) => w.minimized);
  function syncDockAll() {
    dockAll.hidden = !wins.length;
    const unfold = wins.length && allFolded();
    foldAllBtn.querySelector("span").textContent = unfold ? "Unfold all" : "Fold all";
    foldAllBtn.setAttribute("aria-label", unfold ? "Restore all windows" : "Minimize all windows");
    foldAllBtn.querySelector("path").setAttribute("d", unfold ? ICON.restorePath : "M6 12h12");
    syncMap();
  }
  foldAllBtn.addEventListener("click", () => {
    if (allFolded()) { wins.forEach(restore); if (wins.length) focusWin(wins[wins.length - 1]); }
    else wins.forEach(minimize);
  });
  $("closeAll").addEventListener("click", () => { [...wins].forEach(closeWin); });

  /* ───────────────────────── search ───────────────────────── */
  const sBox = $("search"), sIn = $("searchInput"), sRes = $("searchResults");
  let sSel = 0, sList = [];
  function runSearch() {
    const q = sIn.value.trim().toLowerCase();
    if (!q) { sRes.classList.remove("open"); sList = []; return; }
    const named = (c) => c.name.toLowerCase().includes(q) || (c.aka || []).some((n) => n.toLowerCase().includes(q));
    const starts = (c) => (c.name.toLowerCase().startsWith(q) ? 0 : (c.aka || []).some((n) => n.toLowerCase().startsWith(q)) ? 1 : 2);
    sList = CHARS.filter((c) => named(c) || (c.role || "").toLowerCase().includes(q))
      .sort((a, b) => (named(b) - named(a)) || starts(a) - starts(b) || prio(a) - prio(b) || a.tb - b.tb)
      .slice(0, 20);
    sSel = 0;
    sRes.innerHTML = sList.length
      ? sList.map((c, i) => `<li role="option" data-id="${c.id}" aria-selected="${i === sSel}"><span class="sr-n">${esc(c.name)}<small>${esc(c.role || "")}</small></span><span class="sr-y">${esc(fmtYear(c.born))}</span></li>`).join("")
      : `<li aria-disabled="true"><span>No match</span></li>`;
    sRes.classList.add("open");
  }
  function pick(c) {
    if (!c) return;
    sIn.value = ""; sRes.classList.remove("open"); sIn.blur(); sBox.classList.remove("open");
    hideHint();
    if (!inMode(c)) setShowMode("all");
    locate(c, () => openWindow(c));
  }
  sIn.addEventListener("input", runSearch);
  sIn.addEventListener("focus", () => { sBox.classList.add("open"); runSearch(); });
  sIn.addEventListener("blur", () => setTimeout(() => { sRes.classList.remove("open"); if (!sIn.value) sBox.classList.remove("open"); }, 180));
  sIn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      sSel = (sSel + (e.key === "ArrowDown" ? 1 : -1) + sList.length) % Math.max(1, sList.length);
      [...sRes.children].forEach((li, i) => li.setAttribute("aria-selected", i === sSel));
    } else if (e.key === "Enter") pick(sList[sSel]);
    else if (e.key === "Escape") { sIn.value = ""; sIn.blur(); }
  });
  sRes.addEventListener("pointerdown", (e) => { const li = e.target.closest("li[data-id]"); if (li) { e.preventDefault(); pick(CHAR_BY_ID.get(li.dataset.id)); } });

  /* ───────────────────────── legend / about ───────────────────────── */
  $("legendToggle").addEventListener("click", () => {
    const lg = $("legend"); const open = !lg.classList.contains("open");
    lg.classList.toggle("open", open); $("legendToggle").setAttribute("aria-expanded", open);
  });
  const about = $("about");
  function closeAbout() { about.hidden = true; }
  $("infoBtn").addEventListener("click", () => { about.hidden = false; $("aboutClose").focus(); });
  $("aboutClose").addEventListener("click", closeAbout);
  about.addEventListener("click", (e) => { if (e.target === about) closeAbout(); });
  const nAssumed = CHARS.filter((c) => c.assumed).length;
  $("aboutStats").textContent = `${CHARS.length.toLocaleString()} people · ${EVENTS.length} major events · ${nAssumed.toLocaleString()} people with at least one assumed date.`;

  /* show: everyone / key figures / Adam-to-Jesus line */
  const showBox = $("show"), showBtn = $("showBtn"), showMenu = $("showMenu");
  function setShowMode(m) {
    showMode = m;
    try { localStorage.setItem("bt-show", m); } catch (_) {}
    showBox.classList.toggle("filtered", m !== "all");
    showBtn.setAttribute("aria-label", `Showing: ${SHOW_MODES[m]}. Change who is shown`);
    $("showLabel").textContent = SHOW_MODES[m];
    showMenu.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-checked", b.dataset.mode === m));
    packForce = true; requestRender();
  }
  const counts = { all: CHARS.length, key: CHARS.filter((c) => c.key || c.line).length, line: CHARS.filter((c) => c.line).length };
  showMenu.querySelectorAll("[data-mode]").forEach((b) => {
    b.querySelector(".sm-n").textContent = counts[b.dataset.mode].toLocaleString();
    b.addEventListener("click", () => { setShowMode(b.dataset.mode); showBox.classList.remove("open"); showBtn.setAttribute("aria-expanded", "false"); });
  });
  showBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !showBox.classList.contains("open");
    showBox.classList.toggle("open", open); showBtn.setAttribute("aria-expanded", open);
  });
  document.addEventListener("pointerdown", (e) => { if (!showBox.contains(e.target)) { showBox.classList.remove("open"); showBtn.setAttribute("aria-expanded", "false"); } });
  setShowMode(showMode);

  /* ───────────────────────── boot ───────────────────────── */
  let resizeT = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const c = W ? tAt(W / 2) : (T0 + T1) / 2;
      const rel = W ? view.ppy / fitPpy() : 1;
      layout();
      view.ppy = fitPpy() * rel; view.t0 = c - W / 2 / view.ppy; clampView();
      wins.forEach((w) => place(w, w.x, w.y));
      if (mapW.placed) place(mapW, mapW.x, mapW.y);
      syncMap();
      render();
    }, 80);
  });

  layout();
  fit();
  render();
  // names measured with a fallback font are re-measured once the web fonts arrive
  if (document.fonts) document.fonts.ready.then(() => { dotEls.forEach((d) => { d.gap = 0; }); evEls.forEach((o) => { o.mw = 0; }); requestRender(); });

  // expose for debugging / tests
  window.Timeline = { setShowMode, view, openWindow: (id) => openWindow(CHAR_BY_ID.get(id)), locate: (id) => locate(CHAR_BY_ID.get(id)), setHover: (id) => setHover(id ? CHAR_BY_ID.get(id) : null), zoomAt, animateTo, A, chars: CHARS, render };
})();
