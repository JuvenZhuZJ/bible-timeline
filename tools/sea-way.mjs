// Ways by sea that keep to the water: the land of data/basemap.js laid on a grid of 0.025° (about 2.5 km),
// and a way between two ports found across the water cells, a little off the coast, then cut down to the
// few corners where it turns. Used by tools/build-orbis.mjs for the ORBIS sea lanes; run on its own,
//   node tools/sea-way.mjs lon,lat lon,lat
// it prints the corners of the way between two points (for the voyages written by hand in data/routes.js).
import fs from 'fs';

const STEP = 0.025, BB = [-11, 27, 45, 57];       // lon0, lat0, lon1, lat1: the Mediterranean, the Black Sea, the head of the Red Sea and the seas to Britain
const W = Math.round((BB[2] - BB[0]) / STEP), H = Math.round((BB[3] - BB[1]) / STEP);

export function seaWays(basemapFile = 'data/basemap.js') {
  const src = fs.readFileSync(basemapFile, 'utf8');
  const B = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  const KX = B.k * B.sc, KY = B.sc;
  // the land rings, in longitude and latitude
  const rings = B.land.split('M').filter(Boolean).map((r) => {
    const v = r.replace('Z', '').trim().split(/\s+/).map(Number), pts = [];
    for (let i = 0; i + 1 < v.length; i += 2) pts.push([v[i] / KX, -v[i + 1] / KY]);
    return pts;
  });
  // fill the grid row by row: a cell is land where a line along its row has crossed the coast an odd number of times
  const land = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    const lat = BB[1] + (y + 0.5) * STEP, xs = [];
    for (const r of rings) for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length];
      if ((a[1] > lat) !== (b[1] > lat)) xs.push(a[0] + ((lat - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const x0 = Math.max(0, Math.ceil((xs[i] - BB[0]) / STEP - 0.5)), x1 = Math.min(W - 1, Math.floor((xs[i + 1] - BB[0]) / STEP - 0.5));
      for (let x = x0; x <= x1; x++) land[y * W + x] = 1;
    }
  }
  // cells next to the coast cost more, so a way keeps a little off the shore where it can
  const near = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!land[y * W + x]) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const X = x + dx, Y = y + dy;
      if (X >= 0 && Y >= 0 && X < W && Y < H) near[Y * W + X] = 1;
    }
  }
  const cell = ([lon, lat]) => [Math.floor((lon - BB[0]) / STEP), Math.floor((lat - BB[1]) / STEP)];
  const ll = (x, y) => [+(BB[0] + (x + 0.5) * STEP).toFixed(2), +(BB[1] + (y + 0.5) * STEP).toFixed(2)];
  const isLand = (p) => {
    const [x, y] = cell(p);
    return x < 0 || y < 0 || x >= W || y >= H ? false : !!land[y * W + x];
  };
  const km = (a, b) => Math.hypot((a[0] - b[0]) * Math.cos(((a[1] + b[1]) * Math.PI) / 360), a[1] - b[1]) * 111;
  // the land a straight line crosses, in km, leaving out the first and last few km (a port stands on the shore)
  function landOn(a, b, skipA = 4, skipB = skipA) {
    const d = km(a, b), n = Math.max(2, Math.ceil(d / 1));
    let l = 0;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (t * d < skipA || (1 - t) * d < skipB) continue;
      if (isLand([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])) l += d / n;
    }
    return l;
  }
  // the nearest water cell to a point, within about 40 km
  function water(p) {
    const [cx, cy] = cell(p);
    for (let r = 0; r < 16; r++) {
      let bestC = null, bd = Infinity;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x >= W || y >= H || land[y * W + x]) continue;
        const d = dx * dx + dy * dy;
        if (d < bd) { bd = d; bestC = [x, y]; }
      }
      if (bestC) return bestC;
    }
    return null;
  }
  // the way across the water cells (A*), in a box around the two ports
  function route(a, b) {
    const s = water(a), t = water(b);
    if (!s || !t) return null;
    const M = 160;    // cells of margin around the two ports: about 4°
    const x0 = Math.max(0, Math.min(s[0], t[0]) - M), x1 = Math.min(W - 1, Math.max(s[0], t[0]) + M);
    const y0 = Math.max(0, Math.min(s[1], t[1]) - M), y1 = Math.min(H - 1, Math.max(s[1], t[1]) + M);
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1, N = bw * bh;
    const g = new Float64Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), shut = new Uint8Array(N);
    const id = (x, y) => (y - y0) * bw + (x - x0);
    const cos = Math.cos(((a[1] + b[1]) * Math.PI) / 360);
    const hst = (x, y) => Math.hypot((x - t[0]) * cos, y - t[1]);
    const heap = [];   // a binary heap of [f, cell]
    const push = (f, c) => { heap.push([f, c]); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    const si = id(s[0], s[1]), ti = id(t[0], t[1]);
    g[si] = 0; push(hst(s[0], s[1]), si);
    while (heap.length) {
      const [, c] = pop();
      if (shut[c]) continue;
      shut[c] = 1;
      if (c === ti) break;
      const cx = (c % bw) + x0, cy = Math.floor(c / bw) + y0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const x = cx + dx, y = cy + dy;
        if (x < x0 || y < y0 || x > x1 || y > y1 || land[y * W + x]) continue;
        const n = id(x, y), step = Math.hypot(dx * cos, dy) * (near[y * W + x] ? 1.6 : 1), ng = g[c] + step;
        if (ng < g[n]) { g[n] = ng; from[n] = c; push(ng + hst(x, y), n); }
      }
    }
    if (!shut[ti]) return null;
    const cells = [];
    for (let c = ti; c !== -1; c = from[c]) cells.unshift(ll((c % bw) + x0, Math.floor(c / bw) + y0));
    // keep only the corners: from the port, the farthest cell seen across open water, and on from there
    const pts = [a, ...cells, b], last = pts.length - 1, corners = [];
    for (let k = 0; k < last; ) {
      let j = k + 1;
      for (let m = last; m > k + 1; m--) if (landOn(pts[k], pts[m], k ? 0 : 4, m === last ? 4 : 0) < 1) { j = m; break; }
      if (j < last) corners.push(pts[j]);
      k = j;
    }
    return corners;
  }
  return { route, landOn, isLand, km };
}

if (process.argv[1] && process.argv[1].endsWith('sea-way.mjs') && process.argv.length >= 4) {
  const [a, b] = process.argv.slice(2, 4).map((s) => s.split(',').map(Number));
  const S = seaWays();
  console.log(JSON.stringify(S.route(a, b)));
}
