/*
 * Small maps of Bible places: the "Places" map in each person's window and the locator map
 * in a major event's tooltip. Plain SVG strings, drawn from data/basemap.js and data/places.js.
 *
 *   BibleMap.svg(stops, { w, h, cls, route, minSpan })   stops: [{ id, n }] (n = the number on the pin); returns SVG markup
 *   BibleMap.place(id)                   a place from data/places.js
 *
 * The base map is pre-projected (x = lon * cos 31° * 10, y = -lat * 10), so each map is the same
 * paths seen through a different viewBox, fitted around its places.
 */
(function () {
  "use strict";
  const B = window.BASEMAP, P = window.BIBLE_PLACES || {};
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const KX = B.k * B.sc, KY = B.sc;
  const proj = ([lon, lat]) => [lon * KX, -lat * KY];
  const MIN_SPAN = 1.5 * KY;    // never zoom closer than about 1.5° of latitude, so the coast stays in view

  // sea labels: the first candidate inside the view and clear of the pins is used
  const SEAS = [
    { t: "Great Sea", at: [[34.35, 32.75], [33.7, 33.2], [32.6, 33.5], [30.5, 33.6], [27.5, 34.6], [20.5, 35.2], [16.5, 38.4]] },
    { t: "Salt Sea", at: [[35.62, 31.38]], max: 3.2 * KY },
    { t: "Red Sea", at: [[33.35, 28.35], [34.75, 28.75], [37.6, 22.6]] },
  ];

  function view(pts, w, h, minSpan) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const pad = Math.min(4, minSpan || 4);   // a close-up keeps a narrower margin
    let vw = (x1 - x0) * 1.3 + pad, vh = (y1 - y0) * 1.3 + pad;
    const ar = w / h;
    vh = Math.max(vh, minSpan || MIN_SPAN, vw / ar); vw = vh * ar;
    let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + vh * 0.03;
    // stay inside the base map
    const [bx0, by1] = proj([B.bbox[0], B.bbox[1]]), [bx1, by0] = proj([B.bbox[2], B.bbox[3]]);
    if (vw > bx1 - bx0) { vw = bx1 - bx0; vh = vw / ar; }
    if (vh > by1 - by0) { vh = by1 - by0; vw = vh * ar; }
    cx = Math.min(bx1 - vw / 2, Math.max(bx0 + vw / 2, cx));
    cy = Math.min(by1 - vh / 2, Math.max(by0 + vh / 2, cy));
    return { x: cx - vw / 2, y: cy - vh / 2, w: vw, h: vh };
  }

  /* stops: [{ id, n, hl }] in order; route draws a faint line through them in that order */
  function svg(stops, opt) {
    opt = opt || {};
    const w = opt.w || 320, h = opt.h || 200;
    const list = stops.filter((s) => P[s.id]);
    if (!list.length) return "";
    const pts = list.map((s) => proj(P[s.id].ll));
    // a lone place (Job in Uz, Noah at Ararat) is shown with its surroundings, not a blank close-up
    const span = opt.minSpan || (new Set(list.map((s) => s.id)).size === 1 ? 7 : 0);
    const v = view(pts, w, h, span && span * KY);
    const u = v.w / w;                       // map units per screen pixel
    const X = (x) => ((x - v.x) / u).toFixed(1), Y = (y) => ((y - v.y) / u).toFixed(1);
    let s = `<svg class="bmap ${opt.cls || ""}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opt.label || "Map")}">`;
    s += `<rect class="bm-sea" width="${w}" height="${h}"/>`;
    s += `<g transform="scale(${(1 / u).toFixed(5)}) translate(${(-v.x).toFixed(2)} ${(-v.y).toFixed(2)})">`;
    s += `<path class="bm-land" d="${B.land}"/><path class="bm-lake" d="${B.lakes}"/><path class="bm-river" d="${B.rivers}"/></g>`;

    // one pin per place, numbered by first visit
    const near = (opt.insets || []).flatMap((i) => i.ids), isNear = (id) => near.includes(id);
    const pins = [], byId = new Map();
    list.forEach((st, i) => {
      if (byId.has(st.id)) return;
      const q = { st, x: +X(pts[i][0]), y: +Y(pts[i][1]), pl: P[st.id], small: isNear(st.id) };
      q.ax = q.x; q.ay = q.y;           // where the place really is
      pins.push(q); byId.set(st.id, q);
    });
    // places closer together than a pin (Jericho and Gilgal; Hebron, Mamre and Machpelah) are pushed
    // apart just enough to show each pin with its own number and name, each keeping its direction from
    // the others, with a fine line back to a dot where the place really is
    const big = pins.filter((q) => !q.small), GAP = 14.5;
    for (let it = 0; it < 120; it++) {
      let moved = false;
      for (let a = 0; a < big.length; a++) for (let b = a + 1; b < big.length; b++) {
        const p1 = big[a], p2 = big[b];
        let ddx = p2.x - p1.x, ddy = p2.y - p1.y, d = Math.hypot(ddx, ddy);
        if (d >= GAP) continue;
        if (d < 0.01) { const an = (a * 2.4 + b) % (2 * Math.PI); ddx = Math.cos(an); ddy = Math.sin(an); d = 1; }
        const push = (GAP - d) / 2 + 0.05;
        p1.x -= (ddx / d) * push; p1.y -= (ddy / d) * push;
        p2.x += (ddx / d) * push; p2.y += (ddy / d) * push;
        moved = true;
      }
      for (const q of big) { q.x = Math.min(w - 9, Math.max(9, q.x)); q.y = Math.min(h - 9, Math.max(9, q.y)); }
      if (!moved) break;
    }
    for (const q of big) {
      q.x = +q.x.toFixed(1); q.y = +q.y.toFixed(1);
      const d = Math.hypot(q.x - q.ax, q.y - q.ay);
      if (d > 1.5) { q.dx = (q.x - q.ax) / d; q.dy = (q.y - q.ay) / d; }
    }

    // route through the stops, in order of the person's life, joining the pins as drawn
    const seq = list.map((st) => byId.get(st.id)).filter((q, i, a) => !i || q !== a[i - 1]);
    if (opt.route && seq.length > 1) s += `<path class="bm-route" d="M${seq.map((q) => q.x + " " + q.y).join(" L")}"/>`;

    const boxes = pins.filter((q) => !q.small).map((q) => [q.x - 7, q.y - 7, q.x + 7, q.y + 7]);
    const labelBoxes = [];
    const out = (b) => b[0] < 2 || b[2] > w - 2 || b[1] < 2 || b[3] > h - 2;
    const over = (b, list) => list.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
    const hits = (b) => out(b) || over(b, boxes) || over(b, labelBoxes);
    const km = niceKm(v.w / KX * 111 * B.k * 0.25), px = km / (111 * B.k) * KX / u;
    labelBoxes.push([w - 14 - px, h - 22, w - 6, h - 6]);   // the scale bar, bottom right

    let marks = "", labels = "";
    // the stops of each closer map are drawn there; here each closer map is one marked area,
    // with its name to click
    for (const ins of opt.insets || []) {
      const nb = pins.filter((q) => q.small && ins.ids.includes(q.st.id));
      if (!nb.length) continue;
      const xs = nb.map((q) => q.x), ys = nb.map((q) => q.y);
      const bx = Math.min(...xs) - 8, by = Math.min(...ys) - 8, bw = Math.max(...xs) - bx + 8, bh = Math.max(...ys) - by + 8;
      s += `<rect class="bm-inset" x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4"/>`;
      const tw = 14 + 6 * ins.name.length;
      const cands = [[bx + bw + 4, by + bh / 2 + 3], [bx - tw - 2, by + bh / 2 + 3], [bx, by - 4], [bx, by + bh + 10]];
      for (const [tx, ty] of cands) {
        const lb = [tx - 1, ty - 9, tx + tw, ty + 2];
        if (hits(lb)) continue;
        s += `<text class="bm-label bm-inset-t" data-k="${ins.k}" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}">${esc(ins.name)} ↓</text>`; labelBoxes.push(lb); break;
      }
    }
    for (const q of pins) if (q.dx != null) marks += `<path class="bm-lead" d="M${q.ax} ${q.ay} L${q.x} ${q.y}"/><circle class="bm-at" cx="${q.ax}" cy="${q.ay}" r="1.5"/>`;
    for (const { st, x, y, pl, small, dx, dy } of pins) {
      const id = esc(st.id);
      if (small) { marks += `<g class="bm-pin small s-${pl.s}" data-place="${id}" transform="translate(${x} ${y})"><title>${esc(pl.n)}</title><circle class="bm-ring" r="2.4"/></g>`; continue; }
      const cls = `bm-pin s-${pl.s}${pl.r ? " region" : ""}${st.hl ? " hl" : ""}`;
      marks += `<g class="${cls}" data-place="${id}" transform="translate(${x} ${y})"><title>${esc(pl.n)}${pl.s === "known" ? "" : pl.s === "likely" ? " (likely site)" : " (location uncertain)"}</title>`;
      if (pl.r) marks += `<circle class="bm-area" r="11"/>`;
      marks += `<circle class="bm-ring" r="${st.n != null ? 6.5 : 5}"/>`;
      marks += st.n != null ? `<text class="bm-n" y="2.6" text-anchor="middle">${st.n}</text>` : `<circle class="bm-dot" r="2"/>`;
      marks += `</g>`;
      if (opt.labels === false) continue;
      // label: beside the pin, on the side away from its neighbours when it was spread apart
      const name = shortName(pl.n), tw = name.length * 5.4 + 2;
      const R = [x + 9, y + 3.5, "start", [x + 8, y - 5, x + 9 + tw, y + 5]], Lf = [x - 9, y + 3.5, "end", [x - 9 - tw, y - 5, x - 8, y + 5]];
      const U = [x, y - 10, "middle", [x - tw / 2, y - 18, x + tw / 2, y - 8]], D = [x, y + 17, "middle", [x - tw / 2, y + 8, x + tw / 2, y + 19]];
      const UR = [x + 6, y - 7, "start", [x + 5, y - 16, x + 6 + tw, y - 5]], DR = [x + 6, y + 14, "start", [x + 5, y + 5, x + 6 + tw, y + 16]];
      const UL = [x - 6, y - 7, "end", [x - 6 - tw, y - 16, x - 5, y - 5]], DL = [x - 6, y + 14, "end", [x - 6 - tw, y + 5, x - 5, y + 16]];
      let cand = [R, Lf, U, D, UR, DR, UL, DL];
      if (dx != null) {
        const side = Math.abs(dy) > Math.abs(dx) * 1.4 ? (dy < 0 ? [U, UR, UL] : [D, DR, DL]) : dx < 0 ? [Lf, UL, DL] : [R, UR, DR];
        cand = side.concat(cand.filter((k) => !side.includes(k)));
      }
      // farther out, joined to the pin by a fine line, for a crowded spot
      for (const [ux, uy] of [[1, 0], [-1, 0], [0, -1], [0, 1], [0.8, -0.8], [0.8, 0.8], [-0.8, -0.8], [-0.8, 0.8]]) for (const d of [24, 36]) {
        const ex = x + ux * d, ey = y + uy * d, anc = ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle";
        const bx0 = anc === "start" ? ex : anc === "end" ? ex - tw : ex - tw / 2;
        cand.push([ex, ey + 3.5, anc, [bx0, ey - 5, bx0 + tw, ey + 5], [x + ux * 7, y + uy * 7, ex - ux * 2, ey - uy * 2]]);
      }
      // a name never covers another name or leaves the map; failing a free spot, it crosses as few pins as it can
      const nPins = (b) => boxes.filter((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]).length;
      let c = cand.find((k) => !hits(k[3]));
      if (!c) c = cand.filter((k) => !out(k[3]) && !over(k[3], labelBoxes)).sort((k1, k2) => nPins(k1[3]) - nPins(k2[3]))[0];
      if (!c) continue;
      labelBoxes.push(c[3]);
      if (c[4]) { const [x1, y1, x2, y2] = c[4].map((v) => v.toFixed(1)); labels += `<path class="bm-lead" d="M${x1} ${y1} L${x2} ${y2}"/>`; }
      labels += `<text class="bm-label${st.hl ? " hl" : ""}" data-place="${id}" x="${c[0].toFixed(1)}" y="${c[1].toFixed(1)}" text-anchor="${c[2]}">${esc(name)}</text>`;
    }
    for (const sea of SEAS) {
      if (sea.max && v.h > sea.max) continue;
      for (const at of sea.at) {
        const [mx, my] = proj(at), x = +X(mx), y = +Y(my), tw = sea.t.length * 5.6;
        const b = [x - tw / 2, y - 7, x + tw / 2, y + 4];
        if (x < 0 || x > w || y < 0 || y > h || hits(b)) continue;
        labels = `<text class="bm-sea-t" x="${x}" y="${y}" text-anchor="middle">${esc(sea.t)}</text>` + labels;
        labelBoxes.push(b); break;
      }
    }
    s += marks + labels;
    // scale bar
    s += `<g class="bm-scale" transform="translate(${w - 10 - px} ${h - 10})"><path d="M0 -3 V0 H${px.toFixed(1)} V-3"/><text x="${(px / 2).toFixed(1)}" y="-5" text-anchor="middle">${km} km</text></g>`;
    return s + `</svg>`;
  }
  const niceKm = (k) => [5, 10, 20, 50, 100, 200, 500, 1000].reduce((a, b) => (Math.abs(b - k) < Math.abs(a - k) ? b : a));
  const shortName = (n) => n.replace(/ \(.*\)$/, "").replace(/, (near|by|plains of|Cyprus|Hebron).*$/i, "").replace(/^(Torrent valley of|A city in the land of) /, "");

  /* the maps of a person's places, widest first: the whole journey; for a life that ranges far
     beyond Canaan (Abraham from Ur, Paul to Rome) a closer map of the stops in and around Canaan;
     then a close-up of each small area where three or more places crowd together (Jesus in Galilee
     and in Judea), and inside a close-up, a closer one still where places lie only a few km apart
     (Jerusalem, the Mount of Olives and Bethany), up to five maps in all, so the towns are big enough
     to read and the trail is easy to follow. Places left out of a closer map stay on the wider one.
     Returns [{ stops, name, depth, parent, minSpan }] in the order of the switch. */
  const LEVANT = [33.6, 29.3, 36.9, 33.7];
  const WINDOWS = [[0.65, 0.55], [0.15, 0.12]];   // half a close-up's width and height, in degrees (about 120 km, then 25 km across)
  const MIN_SPANS = [0.8, 0.12];                  // and how far in it may zoom
  const MAX_MAPS = 5;
  const lls = (stops) => stops.map((s) => P[s.id] && P[s.id].ll).filter(Boolean);
  function spanOf(stops) {
    const ll = lls(stops), lat = ll.map((p) => p[1]), lon = ll.map((p) => p[0]);
    return Math.max(Math.max(...lat) - Math.min(...lat), (Math.max(...lon) - Math.min(...lon)) * 0.6);
  }
  const ids = (stops) => new Set(stops.map((s) => s.id));
  // the busiest small areas of a map, busiest first, each with three or more places
  function clusters(stops, win) {
    const out = [], n = ids(stops).size, span = spanOf(stops);
    let rest = stops;
    while (out.length < 3) {
      let best = null;
      for (const [cx, cy] of lls(rest)) {
        const inn = rest.filter((s) => { const p = P[s.id] && P[s.id].ll; return p && Math.abs(p[0] - cx) <= win[0] && Math.abs(p[1] - cy) <= win[1]; });
        if (!best || ids(inn).size > ids(best).size) best = inn;
      }
      const k = best ? ids(best).size : 0;
      if (k < 3 || k >= n || span <= 1.6 * spanOf(best)) break;
      out.push(best);
      const got = ids(best); rest = rest.filter((s) => !got.has(s.id));
    }
    return out;
  }
  /* what the land of the map was called in the person's day: Canaan before the kings (Joshua 14:1),
     Israel under Saul, David and Solomon, Israel and Judah once the kingdom split (1 Kings 12:19-20),
     and Galilee, Samaria and Judea in Jesus' day (Luke 3:1; Acts 9:31), with Syria for Damascus;
     a map mostly outside the land before the kings (Kadesh, the plains of Moab) is Near Canaan */
  function partOf(ll, y) {
    const [lon, lat] = ll;
    if (lat > 33.3 && lon < 35.5) return "Phoenicia";
    if (lat > 33.3 || lon > 35.9) return y < -63 ? "Aram" : "Syria";
    if (y < -1117) return lon < 35.58 && lat > 31.0 ? "Canaan" : "";
    if (y < -997) return "Israel";
    if (y < -63) return lat >= 31.85 || lon >= 35.58 ? "Israel" : "Judah";
    return lat >= 32.55 ? "Galilee" : lat >= 32.1 && lon > 35.0 ? "Samaria" : "Judea";
  }
  const ORDER = ["Canaan", "Israel", "Judah", "Galilee", "Samaria", "Judea", "Phoenicia", "Aram", "Syria"];
  function areaName(stops, y) {
    const n = new Map(), seen = stops.filter((s) => P[s.id]);
    for (const s of seen) { const k = partOf(P[s.id].ll, y); n.set(k, (n.get(k) || 0) + 1); }
    const total = seen.length;
    // the parts the person was in more than once; a single visit (Zarephath, Caesarea Philippi) does not rename the map
    const parts = ORDER.filter((k) => n.get(k) && (n.get(k) >= 2 || n.get(k) === total));
    if (!parts.length || (n.get("") || 0) * 2 > total) return "";
    return parts.join(" + ");    // short, so the map switch stays on one line
  }
  const midYear = (stops) => { const y = stops.map((s) => s.y).filter((v) => v != null).sort((a, b) => a - b); return y.length ? y[y.length >> 1] : 0; };
  function levels(stops) {
    // "Journey" (the whole journey) only for a life that took the person far from home (Abraham from Ur,
    // Paul to Rome); names are kept short so the switch fits on one line, with the full name as its tooltip
    const far = spanOf(stops) > 6;
    const out = [{ stops, name: far ? "Journey" : "All", full: far ? "Whole journey" : "All places", depth: 0, parent: -1 }];
    if (!stops.some((s) => P[s.id])) return out;
    const y = midYear(stops);
    const inL = (s) => { const p = P[s.id] && P[s.id].ll; return p && p[0] >= LEVANT[0] && p[0] <= LEVANT[2] && p[1] >= LEVANT[1] && p[1] <= LEVANT[3]; };
    const near = stops.filter(inL);
    let mid = spanOf(stops) > 2.6 && ids(near).size >= 3 && near.length < stops.length ? near : null;
    let cs = clusters(mid || stops, WINDOWS[0]);
    // a region map that only adds a place or two to its one close-up (Kadesh) is left out: those stay on the first map
    if (mid && cs.length === 1 && ids(cs[0]).size >= ids(mid).size * 2 / 3 && ids(mid).size - ids(cs[0]).size <= 2) mid = null;
    if (mid) out.push({ stops: mid, name: areaName(mid, y) || (y < -1117 ? "Near Canaan" : "Close-up"), depth: 1, parent: 0 });
    const used = new Set(out.map((l) => l.name));
    const around = (c) => {    // named for the place visited most often there
      const n = new Map(); for (const s of c) n.set(s.id, (n.get(s.id) || 0) + 1);
      return shortName(P[[...n].sort((a, b) => b[1] - a[1])[0][0]].n);
    };
    const add = (c, w, parent) => {
      if (out.length >= MAX_MAPS) return;
      let name = w ? "" : areaName(c, y);
      let full = name;
      if (!name || used.has(name)) { name = around(c); full = "Around " + name; }
      used.add(name);
      out.push({ stops: c, name, full, depth: out[parent].depth + 1, parent, minSpan: MIN_SPANS[w] });
      return out.length - 1;
    };
    // close-ups in the order the person first went there, each followed by a closer map still
    // inside it; past five maps, the busiest areas keep theirs
    const first = (c) => Math.min(...c.map((s) => (s.k == null ? Infinity : s.k)));
    const subs = cs.map((c) => clusters(c, WINDOWS[1]));
    let room = Math.max(0, MAX_MAPS - out.length - cs.length);
    const order = cs.map((c, i) => i).sort((a, b) => first(cs[a]) - first(cs[b]));
    const top = mid ? 1 : 0;
    for (const i of order) {
      const k = add(cs[i], 0, top);
      if (k == null) continue;
      for (const c of subs[i].slice(0, room)) { add(c, 1, k); room--; }
    }
    return out;
  }



  window.BibleMap = { svg, levels, place: (id) => P[id], shortName };
})();
