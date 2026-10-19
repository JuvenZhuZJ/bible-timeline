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
  // in Chinese (js/i18n.js), map words come from data/zh/places.js; tlen sizes labels (a Chinese character is about two letters)
  const ZHM = !!(window.I18N && window.I18N.zh), ZMAP = (window.ZH && window.ZH.map) || {};
  const TR = (s) => (ZHM && ZMAP[s.trim()] ? ZMAP[s.trim()] : s);
  const tlen = window.I18N ? window.I18N.tlen : (s) => String(s).length;

  // sea labels: the first candidate inside the view and clear of the pins is used
  const SEAS = [
    { t: "Great Sea", at: [[34.35, 32.75], [33.7, 33.2], [32.6, 33.5], [30.5, 33.6], [27.5, 34.6], [20.5, 35.2], [16.5, 38.4]] },
    { t: "Salt Sea", at: [[35.62, 31.38]], max: 3.2 * KY },
    { t: "Red Sea", at: [[33.35, 28.35], [34.75, 28.75], [37.6, 22.6]] },
  ];
  SEAS.forEach((sea) => { sea.t = TR(sea.t); });

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
    let s = `<svg class="bmap ${opt.cls || ""}" viewBox="0 0 ${w} ${h}" data-vb="${[v.x, v.y, v.w, v.h].map((n) => n.toFixed(2)).join(" ")}" role="img" aria-label="${esc(opt.label || "Map")}">`;
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

    // route through the stops, in order of the person's life, joining the pins as drawn; each leg
    // follows its way along the roads and sea lanes (way() below), drawn once however often it was taken
    s += "<!--terrain-->";
    const seq = list.map((st) => byId.get(st.id)).filter((q, i, a) => !i || q !== a[i - 1]);
    const segs = [];      // the route as drawn, in short straight pieces, so names can keep off it
    const legs = [];      // each leg as drawn, with its length along the way, for its distance label
    if (opt.route && seq.length > 1) {
      const done = new Set();
      let d = "";
      for (let i = 1; i < seq.length; i++) {
        const a = seq[i - 1], b = seq[i], key = [a.st.id, b.st.id].sort().join(">");
        if (done.has(key)) continue;
        done.add(key);
        const wy = way(a.st.id, b.st.id).pts;
        const mid = wy.slice(1, -1).map((ll) => { const [mx, my] = proj(ll); return [+X(mx), +Y(my)]; });
        const p = [[a.x, a.y], ...mid, [b.x, b.y]];
        d += smooth(p);
        const c = curve(p);
        legs.push({ a: a.st.id, b: b.st.id, c, km: wy.reduce((t, ll, j) => (j ? t + gcKm(wy[j - 1], ll) : 0), 0) });
        for (let j = 1; j < c.length; j++) segs.push([c[j - 1][0], c[j - 1][1], c[j][0], c[j][1]]);
      }
      s += `<path class="bm-route" d="${d}"/>`;
    }

    const boxes = pins.filter((q) => !q.small).map((q) => [q.x - 7, q.y - 7, q.x + 7, q.y + 7]);
    const labelBoxes = [];
    const out = (b) => b[0] < 2 || b[2] > w - 2 || b[1] < 2 || b[3] > h - 2;
    const over = (b, list) => list.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
    const hits = (b) => out(b) || over(b, boxes) || over(b, labelBoxes);
    // a name on the route hides it under the name's dark outline, so names keep off the route where they can
    const onRoute = (b) => segs.some((sg) => cuts(sg, b[0] - 1, b[1] - 1, b[2] + 1, b[3] + 1));
    const hitsR = (b) => hits(b) || onRoute(b);
    const km = niceKm(v.w / KX * 111 * B.k * 0.25), px = km / (111 * B.k) * KX / u;
    labelBoxes.push([w - 14 - px, h - 22, w - 6, h - 6]);   // the scale bar, bottom right

    let marks = "", labels = "";
    const edges = [];     // the sides of the closer maps' boxes, which distances keep off too
    // the stops of each closer map are drawn there; here each closer map is one marked area,
    // with its name to click
    for (const ins of opt.insets || []) {
      const nb = pins.filter((q) => q.small && ins.ids.includes(q.st.id));
      if (!nb.length) continue;
      const xs = nb.map((q) => q.x), ys = nb.map((q) => q.y);
      const bx = Math.min(...xs) - 8, by = Math.min(...ys) - 8, bw = Math.max(...xs) - bx + 8, bh = Math.max(...ys) - by + 8;
      const ex = bx + bw, ey = by + bh;
      edges.push([bx, by, ex, by], [ex, by, ex, ey], [bx, ey, ex, ey], [bx, by, bx, ey]);
      s += `<rect class="bm-inset" data-k="${ins.k}" x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4"/>`;
      const tw = 14 + 6 * ins.name.length;
      const cands = [[bx + bw + 4, by + bh / 2 + 3], [bx - tw - 2, by + bh / 2 + 3], [bx, by - 4], [bx, by + bh + 10]];
      const box = ([tx, ty]) => [tx - 1, ty - 9, tx + tw, ty + 2];
      for (const [tx, ty] of cands.filter((c) => !hitsR(box(c))).concat(cands)) {
        const lb = box([tx, ty]);
        if (hits(lb)) continue;
        s += `<text class="bm-label bm-inset-t" data-k="${ins.k}" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}">${esc(ins.name)} ↓</text>`; labelBoxes.push(lb); break;
      }
    }
    for (const q of pins) if (q.dx != null) marks += `<path class="bm-lead" d="M${q.ax} ${q.ay} L${q.x} ${q.y}"/><circle class="bm-at" cx="${q.ax}" cy="${q.ay}" r="1.5"/>`;
    for (const { st, x, y, pl, small, dx, dy } of pins) {
      const id = esc(st.id);
      if (small) { marks += `<g class="bm-pin small s-${pl.s}" data-place="${id}" transform="translate(${x} ${y})"><title>${esc(pl.n)}</title><circle class="bm-ring" r="2.4"/></g>`; continue; }
      const cls = `bm-pin s-${pl.s}${pl.r ? " region" : ""}${st.hl ? " hl" : ""}`;
      marks += `<g class="${cls}" data-place="${id}" transform="translate(${x} ${y})"><title>${esc(pl.n)}${pl.s === "known" ? "" : pl.s === "likely" ? TR(" (likely site)") : TR(" (location uncertain)")}</title>`;
      if (pl.r) marks += `<circle class="bm-area" r="11"/>`;
      marks += `<circle class="bm-ring" r="${st.n != null ? 6.5 : 5}"/>`;
      marks += st.n != null ? `<text class="bm-n" y="2.6" text-anchor="middle">${st.n}</text>` : `<circle class="bm-dot" r="2"/>`;
      marks += `</g>`;
      if (opt.labels === false) continue;
      // label: beside the pin, on the side away from its neighbours when it was spread apart
      const name = shortName(pl.n), tw = tlen(name) * 5.4 + 2;
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
      // a name never covers another name or leaves the map, and keeps off the route if any spot allows
      // (farther out on a fine line if need be); failing a free spot, it crosses as few pins as it can
      const nPins = (b) => boxes.filter((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]).length;
      // a name set farther out must still sit nearer its own pin than any other, or it reads as the other's
      const gap = (b, px, py) => Math.hypot(Math.max(b[0] - px, 0, px - b[2]), Math.max(b[1] - py, 0, py - b[3]));
      const clear = (b) => !big.some((o) => o.st.id !== st.id && gap(b, o.x, o.y) < gap(b, x, y));
      const crossings = (b) => segs.filter((sg) => cuts(sg, b[0] - 1, b[1] - 1, b[2] + 1, b[3] + 1)).length;
      let c = cand.find((k) => !hitsR(k[3]) && clear(k[3]));
      if (!c) c = cand.filter((k) => !hits(k[3]) && clear(k[3])).map((k, i) => [crossings(k[3]) + i * 0.01, k]).sort((a, b) => a[0] - b[0]).map((e) => e[1])[0];
      if (!c) c = cand.filter((k) => !out(k[3]) && !over(k[3], labelBoxes) && clear(k[3])).sort((k1, k2) => nPins(k1[3]) - nPins(k2[3]))[0];
      if (!c) c = cand.find((k) => !hits(k[3]));
      if (!c) c = cand.filter((k) => !out(k[3]) && !over(k[3], labelBoxes)).sort((k1, k2) => nPins(k1[3]) - nPins(k2[3]))[0];
      if (!c) continue;
      labelBoxes.push(c[3]);
      if (c[4]) { const [x1, y1, x2, y2] = c[4].map((v) => v.toFixed(1)); labels += `<path class="bm-lead" d="M${x1} ${y1} L${x2} ${y2}"/>`; }
      labels += `<text class="bm-label${st.hl ? " hl" : ""}" data-place="${id}" x="${c[0].toFixed(1)}" y="${c[1].toFixed(1)}" text-anchor="${c[2]}">${esc(name)}</text>`;
    }
    for (const sea of SEAS) {
      if (sea.max && v.h > sea.max) continue;
      for (const at of sea.at) {
        const [mx, my] = proj(at), x = +X(mx), y = +Y(my), tw = tlen(sea.t) * 5.6;
        const b = [x - tw / 2, y - 7, x + tw / 2, y + 4];
        if (x < 0 || x > w || y < 0 || y > h || hitsR(b)) continue;
        labels = `<text class="bm-sea-t" x="${x}" y="${y}" text-anchor="middle">${esc(sea.t)}</text>` + labels;
        labelBoxes.push(b); break;
      }
    }
    s = s.replace("<!--terrain-->", terrain(v, u, w, h, X, Y, list, hitsR, boxes, labelBoxes, (t) => { labels = t + labels; }));
    s += marks + labels + distLabels(legs, { hits, out, pins: (b) => over(b, boxes) }, segs.concat(edges), w, h);
    // scale bar
    s += `<g class="bm-scale" transform="translate(${w - 10 - px} ${h - 10})"><path d="M0 -3 V0 H${px.toFixed(1)} V-3"/><text x="${(px / 2).toFixed(1)}" y="-5" text-anchor="middle">${km} km</text></g>`;
    return s + `</svg>`;
  }
  // km along the earth's surface between two [lon, lat] points
  function gcKm([lon1, lat1], [lon2, lat2]) {
    const r = Math.PI / 180, a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
    return 12742 * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  // rounded as the routes are only approximate: to half a km under 10 km, to the km under 30, to 5 km under 300, else to 10
  const roundKm = (k) => (k < 10 ? Math.max(0.5, Math.round(k * 2) / 2) : k < 30 ? Math.round(k) : k < 300 ? Math.round(k / 5) * 5 : Math.round(k / 10) * 10);
  /* each leg's length along its way, set beside the leg in the route's colour: hidden until one of its
     two places lights up (markPlace() in js/app.js gives it the hl class). It sits near the middle of
     the leg, on the side and at the spot where it covers no pin, name, other distance, route or closer map's box; a leg
     too short on this map for its number has none (the closer map shows it) */
  function distLabels(legs, chk, segs, w, h) {
    const hits = chk.hits;
    let out = "";
    const placed = [];
    const over = (b) => placed.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
    const onRoute = (b) => segs.some((sg) => cuts(sg, b[0], b[1], b[2], b[3]));
    for (const lg of legs) {
      const c = lg.c, len = [0];
      for (let i = 1; i < c.length; i++) len.push(len[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
      // only the part of the leg on this map counts (a leg to a place off the map, from a close-up)
      const vis = c.map(([x, y], i) => (x > 8 && x < w - 8 && y > 8 && y < h - 8 ? len[i] : null)).filter((v) => v != null);
      if (!vis.length) continue;
      const lo = Math.min(...vis), hi = Math.max(...vis), L = hi - lo;
      if (L < 18) continue;
      const t = `~${roundKm(lg.km).toLocaleString("en")} km`, tw = t.length * 4.6 + 2;
      const cand = [];
      for (const f of [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74, 0.18, 0.82, 0.1, 0.9]) {
        const at = lo + f * L;
        let i = 1;
        while (i < c.length - 1 && len[i] < at) i++;
        const [x0, y0] = c[i - 1], [x1, y1] = c[i], sl = len[i] - len[i - 1] || 1, q = (at - len[i - 1]) / sl;
        const x = x0 + (x1 - x0) * q, y = y0 + (y1 - y0) * q, nx = -(y1 - y0) / sl, ny = (x1 - x0) / sl;
        for (const more of [0, 5, 10]) for (const sd of [1, -1]) {
          const off = Math.abs(nx) * (tw / 2) + Math.abs(ny) * 5 + 2.5 + more, cx = x + nx * sd * off, cy = y + ny * sd * off;
          cand.push([cx, cy + 3, [cx - tw / 2, cy - 5, cx + tw / 2, cy + 4], f]);
        }
      }
      // failing a free spot: over a route, then over a name, but never over a pin or off the map if it can help it
      const k = cand.find((o) => !hits(o[2]) && !over(o[2]) && !onRoute(o[2])) || cand.find((o) => !hits(o[2]) && !over(o[2]))
        || cand.find((o) => !chk.out(o[2]) && !chk.pins(o[2]) && !over(o[2])) || cand.find((o) => !chk.out(o[2]) && !over(o[2])) || cand[0];
      placed.push(k[2]);
      out += `<text class="bm-dist" data-place="${lg.a} ${lg.b}" x="${k[0].toFixed(1)}" y="${k[1].toFixed(1)}" text-anchor="middle">${t}</text>`;
    }
    return out;
  }
  // the same line as points, a few along each rounded corner
  function curve(p) {
    if (p.length < 3) return p;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], out = [p[0], mid(p[0], p[1])];
    for (let i = 1; i < p.length - 1; i++) {
      const a = out[out.length - 1], c = i === p.length - 2 ? p[i + 1] : mid(p[i], p[i + 1]);
      for (let t = 0.25; t <= 1; t += 0.25) out.push([(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * p[i][0] + t * t * c[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * p[i][1] + t * t * c[1]]);
    }
    return out;
  }
  // does the piece of line [x1, y1, x2, y2] pass through the box x0..x1, y0..y1 (Liang-Barsky)
  function cuts([ax, ay, bx, by], x0, y0, x1, y1) {
    let t0 = 0, t1 = 1;
    const dx = bx - ax, dy = by - ay;
    for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]]) {
      if (p === 0) { if (q < 0) return false; continue; }
      const r = q / p;
      if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
    }
    return true;
  }
  // a line through the points with its corners rounded off
  function smooth(p) {
    const f = (q) => q[0].toFixed(1) + " " + q[1].toFixed(1);
    if (p.length < 3) return `M${f(p[0])} L${f(p[p.length - 1])}`;
    let d = `M${f(p[0])}`;
    for (let i = 1; i < p.length - 1; i++) {
      const m = [(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2];
      d += i === 1 ? ` L${f([(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2])}` : "";
      d += ` Q${f(p[i])} ${f(i === p.length - 2 ? p[i + 1] : m)}`;
    }
    return d;
  }

  /* the landscape of data/terrain.js seen at this zoom: deserts as a fine stipple, mountain ranges as
     rows of small peaks, single mountains as a small triangle, and the names of each, set where they
     cover no pin and no name; returns the marks, and hands the names to put() to go under the pins' names */
  function terrain(v, u, w, h, X, Y, list, hits, boxes, labelBoxes, put) {
    const T = window.TERRAIN;
    if (!T) return "";
    const deg = v.h / KY, on = new Set(list.map((st) => st.id));
    const scr = (ll) => { const [mx, my] = proj(ll); return [+X(mx), +Y(my)]; };
    const inView = ([x, y]) => x > 4 && x < w - 4 && y > 4 && y < h - 4;
    let sand = "", peaks = "", names = "";
    // a name goes at its spot, or a little above, below or beside it, where it covers no pin, name or route
    const name = (t, [x0, y0], cls, shift) => {
      const tw = tlen(t) * (cls === "bm-river-t" ? 4.6 : 4.9);
      for (const [ox, oy] of shift === false ? [[0, 0]] : [[0, 0], [0, -9], [0, 9], [-tw / 3, 0], [tw / 3, 0]]) {
        const x = x0 + ox, y = y0 + oy, b = [x - tw / 2, y - 7, x + tw / 2, y + 3];
        if (!inView([x, y]) || hits(b)) continue;
        names += `<text class="${cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle">${esc(t)}</text>`;
        labelBoxes.push(b);
        return true;
      }
      return false;
    };
    // deserts: dots on a loose grid inside the outline
    for (const ds of T.deserts) {
      if (deg > ds.max) continue;
      const poly = ds.poly.map(scr);
      const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
      const x0 = Math.max(0, Math.min(...xs)), x1 = Math.min(w, Math.max(...xs)), y0 = Math.max(0, Math.min(...ys)), y1 = Math.min(h, Math.max(...ys));
      if (x0 >= x1 || y0 >= y1) continue;
      const inside = (x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
      const G = 6;
      for (let gy = Math.floor(y0 / G); gy * G < y1; gy++) for (let gx = Math.floor(x0 / G); gx * G < x1; gx++) {
        const r = Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453, j = r - Math.floor(r);
        const x = gx * G + (gy % 2) * 3 + j * 2, y = gy * G + j * 2.5;
        if (inside(x, y)) sand += `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
      }
    }
    // a single mountain, unless it is on the map as a pin
    for (const pk of T.peaks) {
      if (deg > pk.max || (pk.place && on.has(pk.place))) continue;
      const [x, y] = scr(pk.ll);
      if (!inView([x, y]) || boxes.some((o) => x > o[0] - 3 && x < o[2] + 3 && y > o[1] - 3 && y < o[3] + 3)) continue;
      peaks += `<path class="bm-peak" d="M${(x - 3.5).toFixed(1)} ${(y + 2.5).toFixed(1)}l3.5 -5.5l3.5 5.5z"/>`;
      const tw = tlen(pk.n) * 4.9;
      for (const [tx, ty] of [[x + 6 + tw / 2, y + 3], [x - 6 - tw / 2, y + 3], [x, y - 5], [x, y + 11]]) if (name(pk.n, [tx, ty], "bm-ter-t", false)) break;
      boxes.push([x - 4, y - 4, x + 4, y + 3]);
    }
    const shown = (f) => deg <= f.max && !(f.min && deg <= f.min);
    for (const ds of T.deserts) if (shown(ds)) name(ds.n, scr(ds.at), "bm-ter-t");
    for (const rg of T.ranges) if (shown(rg) && rg.n && rg.at) name(rg.n, scr(rg.at), "bm-ter-t");
    for (const nm of T.names) if (shown(nm)) name(nm.n, scr(nm.ll), nm.river ? "bm-river-t" : "bm-ter-t");
    // ranges: a small peak every few pixels along the crest, skipping any spot under a pin or a name
    let crest = "";
    for (const rg of T.ranges) {
      if (!shown(rg) || deg < 0.5) continue;   // in a close-up of a few towns, the hills are no help
      const p = rg.line.map(scr);
      let carry = 5;
      for (let i = 1; i < p.length; i++) {
        const [ax, ay] = p[i - 1], [bx, by] = p[i], len = Math.hypot(bx - ax, by - ay);
        for (let t = carry; t < len; t += 11) {
          const x = ax + ((bx - ax) * t) / len, y = ay + ((by - ay) * t) / len;
          if (!inView([x, y]) || hits([x - 3, y - 2, x + 3, y + 2])) continue;
          crest += `M${(x - 3).toFixed(1)} ${(y + 1.5).toFixed(1)}l3 -3.4l3 3.4`;
        }
        carry = ((carry - len) % 11 + 11) % 11;
      }
    }
    put(names);
    return (sand ? `<path class="bm-sand" d="${sand}"/>` : "") + (crest ? `<path class="bm-crest" d="${crest}"/>` : "") + peaks;
  }

  /* the way between two places along the roads of data/routes.js: a leg TRAVELS describes takes that
     way (the Exodus, Paul's voyages); any other takes the shortest way along the ROADS, with a place off
     the roads joined to the nearest road towns; failing a road way not much longer than the straight
     line, the line goes straight. Returns { pts: [[lon, lat], ...], src: [...] } */
  const RW = window.ROUTE_WAY || {}, ROADS = window.ROADS || [], TRAVELS = window.TRAVELS || {};
  const llOf = (p) => (Array.isArray(p) ? p : (P[p] && P[p].ll) || RW[p]);
  const keyOf = (p) => (Array.isArray(p) ? p.join(",") : p);
  const kmOf = (a, b) => Math.hypot((a[0] - b[0]) * Math.cos(((a[1] + b[1]) * Math.PI) / 360), a[1] - b[1]) * 111;
  let G = null;
  function graph() {
    if (G) return G;
    G = new Map();
    const node = (p) => { const k = keyOf(p); if (!G.has(k)) G.set(k, { ll: llOf(p), e: [], road: true }); return G.get(k); };
    for (const r of ROADS) for (let i = 1; i < r.pts.length; i++) {
      if (!llOf(r.pts[i - 1]) || !llOf(r.pts[i])) continue;
      const a = node(r.pts[i - 1]), b = node(r.pts[i]), d = kmOf(a.ll, b.ll);
      a.e.push({ to: b, d, src: r.src }); b.e.push({ to: a, d, src: r.src });
    }
    return G;
  }
  function attach(id) {
    const g = graph();
    if (g.has(id)) return g.get(id);
    const ll = llOf(id);
    if (!ll) return null;
    const n = { ll, e: [] };
    const near = [...g.values()].filter((m) => m.road).map((m) => [m, kmOf(ll, m.ll)]).sort((a, b) => a[1] - b[1])
      .slice(0, 2).filter(([, d], i) => d < 150 && (!i || d < 40));
    for (const [m, d] of near) { n.e.push({ to: m, d: d * 1.3, src: "common route" }); m.e.push({ to: n, d: d * 1.3, src: "common route" }); }
    g.set(id, n);
    return n;
  }
  function shortest(a, b) {
    const s = attach(a), t = attach(b);
    if (!s || !t) return null;
    const dist = new Map([[s, 0]]), prev = new Map(), done = new Set(), q = [s];
    while (q.length) {
      let bi = 0;
      for (let i = 1; i < q.length; i++) if (dist.get(q[i]) < dist.get(q[bi])) bi = i;
      const n = q.splice(bi, 1)[0];
      if (done.has(n)) continue;
      done.add(n);
      if (n === t) break;
      for (const e of n.e) {
        const nd = dist.get(n) + e.d;
        if (nd < (dist.has(e.to) ? dist.get(e.to) : Infinity)) { dist.set(e.to, nd); prev.set(e.to, [n, e.src]); q.push(e.to); }
      }
    }
    if (!dist.has(t)) return null;
    const pts = [t.ll], src = new Set(), seg = [];
    for (let n = t; prev.has(n); ) { const [p, sr] = prev.get(n); pts.unshift(p.ll); seg.unshift(sr); src.add(sr); n = p; }
    return { pts, src: [...src], seg, d: dist.get(t) };
  }
  const ways = new Map();
  function way(a, b) {
    const key = a + ">" + b;
    if (ways.has(key)) return ways.get(key);
    let r;
    const t = TRAVELS[key] || TRAVELS[b + ">" + a];
    if (t) {
      // seg: the source of each piece of the line, for checking (tools: which legs follow a source map)
      const via = TRAVELS[key] ? t.via : t.via.slice().reverse(), pts = [], src = new Set([t.src]), seg = [];
      for (let i = 0; i < via.length; i++) {
        if (typeof via[i] === "string" && via[i][0] === "=") {   // the way another travel gives
          const [x, y] = via[i].slice(1).split(">"), sub = way(x, y);
          pts.push(...sub.pts.slice(1, -1)); seg.push(...sub.seg.slice(0, -1)); sub.src.forEach((v) => src.add(v));
          continue;
        }
        if (via[i] !== ">") { pts.push(llOf(via[i])); if (i < via.length - 1 && via[i + 1] !== ">") seg.push(t.src); continue; }
        const sp = shortest(keyOf(via[i - 1]), keyOf(via[i + 1]));
        if (sp) { pts.push(...sp.pts.slice(1, -1)); seg.push(...sp.seg); sp.src.forEach((x) => src.add(x)); }
      }
      r = { pts, src: [...src], seg };
    } else {
      const A = llOf(a), Bp = llOf(b), sp = shortest(a, b), direct = kmOf(A, Bp);
      r = sp && sp.d <= direct * 1.8 + 15 ? { pts: sp.pts, src: sp.src, seg: sp.seg } : { pts: [A, Bp], src: ["straight"], seg: ["straight"] };
    }
    ways.set(key, r);
    return r;
  }

  const niceKm = (k) => [5, 10, 20, 50, 100, 200, 500, 1000].reduce((a, b) => (Math.abs(b - k) < Math.abs(a - k) ? b : a));
  const shortName = (n) => n.replace(/ \(.*\)$/, "").replace(/（.*）$/, "").replace(/, (near|by|plains of|Cyprus|Hebron).*$/i, "").replace(/^(Torrent valley of|A city in the land of) /, "");

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
    return parts.map(TR).join(ZHM ? "＋" : " + ");    // short, so the map switch stays on one line
  }
  const midYear = (stops) => { const y = stops.map((s) => s.y).filter((v) => v != null).sort((a, b) => a - b); return y.length ? y[y.length >> 1] : 0; };
  function levels(stops) {
    // "Journey" (the whole journey) only for a life that took the person far from home (Abraham from Ur,
    // Paul to Rome); names are kept short so the switch fits on one line, with the full name as its tooltip
    const far = spanOf(stops) > 6;
    const out = [{ stops, name: TR(far ? "Journey" : "All"), full: TR(far ? "Whole journey" : "All places"), depth: 0, parent: -1 }];
    if (!stops.some((s) => P[s.id])) return out;
    const y = midYear(stops);
    const inL = (s) => { const p = P[s.id] && P[s.id].ll; return p && p[0] >= LEVANT[0] && p[0] <= LEVANT[2] && p[1] >= LEVANT[1] && p[1] <= LEVANT[3]; };
    const near = stops.filter(inL);
    let mid = spanOf(stops) > 2.6 && ids(near).size >= 3 && near.length < stops.length ? near : null;
    let cs = clusters(mid || stops, WINDOWS[0]);
    // a region map that only adds a place or two to its one close-up (Kadesh) is left out: those stay on the first map
    if (mid && cs.length === 1 && ids(cs[0]).size >= ids(mid).size * 2 / 3 && ids(mid).size - ids(cs[0]).size <= 2) mid = null;
    if (mid) out.push({ stops: mid, name: areaName(mid, y) || TR(y < -1117 ? "Near Canaan" : "Close-up"), depth: 1, parent: 0 });
    const used = new Set(out.map((l) => l.name));
    const around = (c) => {    // named for the place visited most often there
      const n = new Map(); for (const s of c) n.set(s.id, (n.get(s.id) || 0) + 1);
      return shortName(P[[...n].sort((a, b) => b[1] - a[1])[0][0]].n);
    };
    const add = (c, w, parent) => {
      if (out.length >= MAX_MAPS) return;
      let name = w ? "" : areaName(c, y);
      let full = name;
      if (!name || used.has(name)) { name = around(c); full = ZHM ? name + "一帶" : "Around " + name; }
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



  window.BibleMap = { svg, levels, way, place: (id) => P[id], shortName };
})();
