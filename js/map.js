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
    let vw = (x1 - x0) * 1.3 + 4, vh = (y1 - y0) * 1.3 + 4;
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
    const v = view(pts, w, h, opt.minSpan && opt.minSpan * KY);
    const u = v.w / w;                       // map units per screen pixel
    const X = (x) => ((x - v.x) / u).toFixed(1), Y = (y) => ((y - v.y) / u).toFixed(1);
    let s = `<svg class="bmap ${opt.cls || ""}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opt.label || "Map")}">`;
    s += `<rect class="bm-sea" width="${w}" height="${h}"/>`;
    s += `<g transform="scale(${(1 / u).toFixed(5)}) translate(${(-v.x).toFixed(2)} ${(-v.y).toFixed(2)})">`;
    s += `<path class="bm-land" d="${B.land}"/><path class="bm-lake" d="${B.lakes}"/><path class="bm-river" d="${B.rivers}"/></g>`;

    // route through the stops, in order of the person's life
    const seq = list.map((x, i) => pts[i]).filter((p, i, a) => !i || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]);
    if (opt.route && seq.length > 1) s += `<path class="bm-route" d="M${seq.map((p) => X(p[0]) + " " + Y(p[1])).join(" L")}"/>`;

    // one pin per place, numbered by first visit
    const seen = new Map();
    list.forEach((st, i) => { if (!seen.has(st.id)) seen.set(st.id, { st, p: pts[i] }); });
    const boxes = [];
    // places closer together than a pin (Hebron, Mamre and Machpelah; Salem and Moriah) share one pin
    const pins = [];
    for (const { st, p } of seen.values()) {
      const x = +X(p[0]), y = +Y(p[1]);
      const near = !(opt.near && opt.near.includes(st.id)) && pins.find((q) => !q.far && Math.hypot(q.x - x, q.y - y) < 11);
      if (near) { near.ids.push(st.id); near.names.push(P[st.id].n); continue; }
      pins.push({ st, x, y, pl: P[st.id], ids: [st.id], names: [P[st.id].n], far: !!(opt.near && opt.near.includes(st.id)) });
    }
    pins.forEach((q) => boxes.push([q.x - 7, q.y - 7, q.x + 7, q.y + 7]));
    const hits = (b) => b[0] < 2 || b[2] > w - 2 || b[1] < 2 || b[3] > h - 2 || boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);

    let marks = "", labels = "";
    if (opt.near) {    // the Canaan stops are drawn in the detail map; here they are one marked area
      const nb = pins.filter((q) => opt.near.includes(q.st.id));
      const xs = nb.map((q) => q.x), ys = nb.map((q) => q.y);
      const bx = Math.min(...xs) - 8, by = Math.min(...ys) - 8, bw = Math.max(...xs) - bx + 8, bh = Math.max(...ys) - by + 8;
      s += `<rect class="bm-inset" x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4"/>`;
      const lb = [bx + bw + 3, by + bh / 2 - 6, bx + bw + 60, by + bh / 2 + 5];
      if (!hits(lb)) { s += `<text class="bm-label bm-inset-t" x="${(bx + bw + 4).toFixed(1)}" y="${(by + bh / 2 + 3).toFixed(1)}">Canaan ↓</text>`; boxes.push(lb); }
      for (const q of nb) q.small = true;
    }
    for (const { st, x, y, pl, small, ids, names } of pins) {
      const grp = esc(ids.join(" "));
      if (small) { marks += `<g class="bm-pin small s-${pl.s}" data-place="${esc(st.id)}" data-group="${grp}" transform="translate(${x} ${y})"><title>${esc(pl.n)}</title><circle class="bm-ring" r="2.4"/></g>`; continue; }
      const cls = `bm-pin s-${pl.s}${pl.r ? " region" : ""}${st.hl ? " hl" : ""}`;
      marks += `<g class="${cls}" data-place="${esc(st.id)}" data-group="${grp}" transform="translate(${x} ${y})"><title>${esc(names.join(" · "))}${ids.length > 1 ? "" : pl.s === "known" ? "" : pl.s === "likely" ? " (likely site)" : " (location uncertain)"}</title>`;
      if (pl.r) marks += `<circle class="bm-area" r="11"/>`;
      marks += `<circle class="bm-ring" r="${st.n != null ? 6.5 : 5}"/>`;
      marks += st.n != null ? `<text class="bm-n" y="2.6" text-anchor="middle">${st.n}</text>` : `<circle class="bm-dot" r="2"/>`;
      marks += `</g>`;
      // label: try right, left, above, below
      if (opt.labels === false || (opt.near && opt.near.includes(st.id))) continue;
      const all = names.map(shortName).join(", ");
      const name = all.length <= 18 ? all : shortName(names[0]) + (names.length > 1 ? ` +${names.length - 1}` : ""), tw = name.length * 5.4 + 2;
      const cand = [[x + 9, y + 3.5, "start", [x + 8, y - 5, x + 9 + tw, y + 5]], [x - 9, y + 3.5, "end", [x - 9 - tw, y - 5, x - 8, y + 5]],
        [x, y - 10, "middle", [x - tw / 2, y - 18, x + tw / 2, y - 8]], [x, y + 17, "middle", [x - tw / 2, y + 8, x + tw / 2, y + 19]]];
      const c = cand.find((k) => !hits(k[3]));
      if (!c) continue;
      boxes.push(c[3]);
      labels += `<text class="bm-label${st.hl ? " hl" : ""}" data-place="${esc(st.id)}" data-group="${grp}" x="${c[0].toFixed(1)}" y="${c[1].toFixed(1)}" text-anchor="${c[2]}">${esc(name)}</text>`;
    }
    for (const sea of SEAS) {
      if (sea.max && v.h > sea.max) continue;
      for (const at of sea.at) {
        const [mx, my] = proj(at), x = +X(mx), y = +Y(my), tw = sea.t.length * 5.6;
        const b = [x - tw / 2, y - 7, x + tw / 2, y + 4];
        if (x < 0 || x > w || y < 0 || y > h || hits(b)) continue;
        labels = `<text class="bm-sea-t" x="${x}" y="${y}" text-anchor="middle">${esc(sea.t)}</text>` + labels;
        boxes.push(b); break;
      }
    }
    s += marks + labels;
    // scale bar
    const km = niceKm(v.w / KX * 111 * B.k * 0.25), px = km / (111 * B.k) * KX / u;
    s += `<g class="bm-scale" transform="translate(${w - 10 - px} ${h - 10})"><path d="M0 -3 V0 H${px.toFixed(1)} V-3"/><text x="${(px / 2).toFixed(1)}" y="-5" text-anchor="middle">${km} km</text></g>`;
    return s + `</svg>`;
  }
  const niceKm = (k) => [5, 10, 20, 50, 100, 200, 500, 1000].reduce((a, b) => (Math.abs(b - k) < Math.abs(a - k) ? b : a));
  const shortName = (n) => n.replace(/ \(.*\)$/, "").replace(/, (near|by|plains of|Cyprus|Hebron).*$/i, "").replace(/^(Torrent valley of|A city in the land of) /, "");

  /* a person whose places span far beyond Canaan (Abraham from Ur, Paul to Rome) gets a second,
     closer map of the stops in and around Canaan, where most of the pins would otherwise pile up */
  const LEVANT = [33.6, 29.3, 36.9, 33.7];
  function detail(stops) {
    const ll = stops.map((s) => P[s.id] && P[s.id].ll).filter(Boolean);
    const lat = ll.map((p) => p[1]), lon = ll.map((p) => p[0]);
    const span = Math.max(Math.max(...lat) - Math.min(...lat), (Math.max(...lon) - Math.min(...lon)) * 0.6);
    const near = stops.filter((s) => { const p = P[s.id] && P[s.id].ll; return p && p[0] >= LEVANT[0] && p[0] <= LEVANT[2] && p[1] >= LEVANT[1] && p[1] <= LEVANT[3]; });
    return span > 2.6 && new Set(near.map((s) => s.id)).size >= 3 && near.length < stops.length ? near : null;
  }

  window.BibleMap = { svg, detail, place: (id) => P[id], shortName };
})();
