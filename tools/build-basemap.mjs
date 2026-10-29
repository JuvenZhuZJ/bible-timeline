// Builds data/basemap.js: the land outline of the whole world (Natural Earth 1:10m, public domain, from the world-atlas npm package)
// plus the Jordan, Euphrates, Tigris and Nile, the Dead Sea and the Sea of Galilee (OpenBible.info geometry, CC BY 4.0).
// Usage: node tools/build-basemap.mjs <topojson-client.js> <world-atlas/land-10m.json> <dir of OpenBible geometry/*.geojson> data/basemap.js [tolerance=0.02]
// Pass - as the geometry dir to keep the rivers and lakes already in data/basemap.js.
import fs from 'fs'; import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const topo = require(process.argv[2]);           // topojson-client
const land = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')); // land-10m.json
const geoDir = process.argv[4]; const out = process.argv[5];
const TOL = +(process.argv[6] || 0.02);
const BB = [-180, -60, 190, 84];                 // lon0, lat0, lon1, lat1: the whole map
// the coastline is simplified more or less by region: the Bible lands and Europe in full detail, the
// eastern United States (for the Bible Students, after the Bible) more coarsely, and the rest of the
// world (for people of modern times) coarser still, with islands under about a third of a degree
// left out there. Coasts are not cut at the regions' edges, so no straight seams show.
const REGIONS = [{ bb: [-10, 8, 62, 56], tol: 1 }, { bb: [-102, 24, -66, 50], tol: 3 }];
const REST = 15;
const tolAt = ([x, y]) => { for (const rg of REGIONS) if (x >= rg.bb[0] && x <= rg.bb[2] && y >= rg.bb[1] && y <= rg.bb[3]) return rg.tol; return REST; };
const K = Math.cos(31 * Math.PI / 180), SC = 10;   // x = lon*K*SC, y = -lat*SC
const P = ([lon, lat]) => [lon * K * SC, -lat * SC];
function dp(pts, tol) {                          // Douglas-Peucker
  if (pts.length < 3) return pts;
  const n = pts.length - 1;
  if (pts[0][0] === pts[n][0] && pts[0][1] === pts[n][1]) {   // closed ring: split in half
    const h = n >> 1; return dp(pts.slice(0, h + 1), tol).concat(dp(pts.slice(h), tol).slice(1));
  }
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) { const [i, j] = st.pop(); let md = 0, mi = -1;
    const [ax, ay] = pts[i], [bx, by] = pts[j], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
    for (let k = i + 1; k < j; k++) { const d = Math.abs(dy * (pts[k][0] - ax) - dx * (pts[k][1] - ay)) / L / tolAt(pts[k]); if (d > md) { md = d; mi = k; } }
    if (md > tol) { keep[mi] = 1; st.push([i, mi], [mi, j]); } }
  return pts.filter((_, k) => keep[k]);
}
const f = (n) => Math.round(n * 10) / 10;        // 0.1 unit = 0.01 deg
function path(rings, closed) {
  let s = '';
  for (const r of rings) { if (r.length < 2) continue; const q = r.map(P);
    let px, py; s += q.map(([x, y], i) => { const X = f(x), Y = f(y); if (i && X === px && Y === py) return ''; px = X; py = Y; return (i ? 'L' : 'M') + X + ' ' + Y; }).join('') + (closed ? 'Z' : ''); }
  return s.replace(/L(-?[\d.]+) (-?[\d.]+)/g, ' $1 $2');
}
const geo = topo.feature(land, land.objects.land);
const rings = [];
for (const ft of geo.features) for (const poly of (ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates))
  for (let r0 of poly) {
    // a ring that crosses 180° (Fiji, Chukotka) is kept in one piece east of it
    if (r0.some((p, i) => i && Math.abs(p[0] - r0[i - 1][0]) > 180)) r0 = r0.map(([x, y]) => [x < -90 ? x + 360 : x, y]);
    // Pacific islands just west of 180° (Samoa) are repeated east of it, so the South Pacific is not split by the map's edge
    for (const r of r0.every(([x]) => x < -168) ? [r0, r0.map(([x, y]) => [x + 360, y])] : [r0]) {
      const xs = r.map((p) => p[0]), ys = r.map((p) => p[1]);
      if (r.every((p) => tolAt(p) === REST) && Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) < 0.35) continue;
      const d = dp(r, TOL); if (d.length > 3) rings.push(d);
    }
  }
const OLD = geoDir === '-' && (() => { const w = {}; new Function('window', fs.readFileSync(out, 'utf8'))(w); return w.BASEMAP; })();
const g = (id) => JSON.parse(fs.readFileSync(`${geoDir}/${id}.geojson`, 'utf8'));
function lines(id, role) { const fc = g(id); const fts = fc.features.filter(x => role.test(x.properties.id || ''));
  const L = []; for (const ft of fts) { const gm = ft.geometry; const parts = gm.type === 'LineString' ? [gm.coordinates] : gm.type === 'MultiLineString' ? gm.coordinates : gm.type === 'Polygon' ? gm.coordinates : gm.type === 'MultiPolygon' ? gm.coordinates.flat() : [];
    for (const p of parts) L.push(dp(p, TOL / 3)); } return L; }
const pick = (id) => { const fc = g(id); return fc.features.map(x => x.properties.id + ':' + x.geometry.type); };
const RIVERS = { jordan: 'ae686c9', euphrates: 'a62dec4', tigris: 'a38ebfd', nile: 'a012705' };
const LAKES = { dead: 'abed304', galilee: 'a562fcc' };
if (process.argv[7] === 'list') { for (const id of [...Object.values(RIVERS), ...Object.values(LAKES)]) console.log(id, pick(id).join(' | ')); process.exit(); }
const role = /simplified|precise$|geometry$/;
const pref = (id) => { const s = g(id).features.map(x => x.properties.id).find(i => /\.geometry$/.test(i)); return new RegExp('^' + s.replace('.', '\\.') + '$'); };
const rivers = OLD ? OLD.rivers : Object.values(RIVERS).map(id => path(lines(id, pref(id)), false)).join('');
const lakes = OLD ? OLD.lakes : Object.values(LAKES).map(id => path(lines(id, pref(id)), true)).join('');
const landD = path(rings, true);
const js = `/* Base map for the window maps (generated by tools/build-basemap.mjs, do not edit).
 * Land: Natural Earth 1:10m (public domain), via the world-atlas package.
 * Rivers and lakes: OpenBible.info Bible Geocoding Data (CC BY 4.0), from OpenStreetMap (ODbL).
 * Coordinates are projected: x = longitude * cos(31°) * 10, y = -latitude * 10. */
window.BASEMAP = ${JSON.stringify({ k: K, sc: SC, bbox: BB, land: landD, lakes, rivers })};
`;
fs.writeFileSync(out, js); console.log('land', landD.length, 'rivers', rivers.length, 'lakes', lakes.length, 'total', js.length);
