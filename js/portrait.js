/*
 * Procedural line-art portraits.
 * Each character gets a deterministic drawing (seeded by its id) built from
 * its gender, age, headwear and beard hints. If a character has a
 * `portrait` image path in the data file, that image is used instead.
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

  function defaultLook(c) {
    const span = c.died - c.born;
    const look = Object.assign({}, c.look || {});
    if (!look.age) look.age = span > 300 ? "old" : "adult";
    if (!look.head) look.head = c.gender === "f" ? "veil" : "cloth";
    if (!look.beard) look.beard = c.gender === "f" ? "none" : (look.age === "old" ? "long" : "full");
    if (c.gender === "f") look.beard = "none";
    return look;
  }

  function build(c, uid) {
    const R = rng(hash(c.id));
    const r = (a, b) => a + (b - a) * R();
    const L = defaultLook(c);
    const fem = c.gender === "f";
    const old = L.age === "old", young = L.age === "young";

    const cx = 100, cy = 104;
    const rx = (fem ? 30 : 33) + r(-2, 3);
    const ry = (fem ? 40 : 42) + r(-2, 3);
    const top = cy - ry, chin = cy + ry;
    const jaw = fem ? 0.42 : r(0.5, 0.62);
    const tilt = r(-3, 3);
    const out = [];
    const S = (d, w, op) => {
      const dx = r(-0.9, 0.9), dy = r(-0.9, 0.9);
      out.push(`<path d="${d}" stroke-width="${w}"${op ? ` opacity="${op}"` : ""}/>`);
      out.push(`<path d="${d}" stroke-width="${f(w * 0.6)}" opacity="0.35" transform="translate(${f(dx)} ${f(dy)})"/>`);
    };
    const P = (d, w, op, extra) => out.push(`<path d="${d}" stroke-width="${w}"${op ? ` opacity="${op}"` : ""}${extra || ""}/>`);
    const fillP = (d, w) => out.push(`<path d="${d}" stroke-width="${w}" fill="var(--portrait-fill, #050505)"/>`);

    const face =
      `M${cx},${f(top)} C${f(cx + rx * 1.05)},${f(top)} ${f(cx + rx * 1.02)},${f(cy - 8)} ${f(cx + rx * 0.97)},${f(cy + 8)} ` +
      `C${f(cx + rx * 0.9)},${f(cy + ry * 0.62)} ${f(cx + rx * jaw)},${f(chin)} ${cx},${f(chin)} ` +
      `C${f(cx - rx * jaw)},${f(chin)} ${f(cx - rx * 0.9)},${f(cy + ry * 0.62)} ${f(cx - rx * 0.97)},${f(cy + 8)} ` +
      `C${f(cx - rx * 1.02)},${f(cy - 8)} ${f(cx - rx * 1.05)},${f(top)} ${cx},${f(top)} Z`;

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
    const head = L.head;
    if (fem && (head === "bare" || head === "crown")) {
      const hl = `M${cx - rx - 4},${cy - 10} C${cx - rx - 14},${cy + 40} ${cx - rx - 16},${chin + 30} ${cx - rx - 20},${chin + 58} L${cx + rx + 20},${chin + 58} C${cx + rx + 16},${chin + 30} ${cx + rx + 14},${cy + 40} ${cx + rx + 4},${cy - 10} Z`;
      fillP(hl, 1.1);
      for (let i = 0; i < 9; i++) {
        const s = i % 2 ? 1 : -1, x = cx + s * (rx + r(-2, 14));
        P(`M${f(x)},${f(cy + r(-4, 20))} q${f(s * r(2, 8))},${f(r(30, 50))} ${f(s * r(4, 12))},${f(r(60, 90))}`, 0.6, 0.6);
      }
    }
    if (head === "cloth" || head === "veil") {
      const w = head === "veil" ? 14 : 16;
      const drape = `M${cx},${top - (head === "veil" ? 10 : 12)} C${cx + rx + w + 6},${top - 8} ${cx + rx + w + 4},${cy + 30} ${cx + rx + w + 22},${chin + 52} L${cx + rx + 2},${chin + 54} L${cx - rx - 2},${chin + 54} L${cx - rx - w - 22},${chin + 52} C${cx - rx - w - 4},${cy + 30} ${cx - rx - w - 6},${top - 8} ${cx},${top - (head === "veil" ? 10 : 12)} Z`;
      fillP(drape, 1.4);
      for (let i = 0; i < 6; i++) {
        const s = i % 2 ? 1 : -1, x = cx + s * (rx + r(5, w + 8));
        P(`M${f(x)},${f(cy + r(-10, 10))} q${f(s * r(1, 6))},${f(r(30, 45))} ${f(s * r(6, 14))},${f(r(60, 80))}`, 0.7, 0.55);
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
    if (head === "bare" || head === "crown" || head === "turban" || head === "priest") {
      if (!fem) {
        S(`M${f(cx - rx * 0.97)},${cy - 2} c-8,-2 -9,16 -1,20`, 1.1);
        S(`M${f(cx + rx * 0.97)},${cy - 2} c8,-2 9,16 1,20`, 1.1);
      }
    }

    // eyes
    const ey = cy + r(-1, 3), es = r(12.5, 15);
    for (const s of [-1, 1]) {
      const ex = cx + s * es;
      S(`M${f(ex - 8)},${f(ey)} C${f(ex - 4)},${f(ey - 5)} ${f(ex + 4)},${f(ey - 5)} ${f(ex + 8)},${f(ey)}`, fem ? 1.5 : 1.3);
      P(`M${f(ex - 7)},${f(ey + 0.5)} C${f(ex - 3)},${f(ey + 3)} ${f(ex + 3)},${f(ey + 3)} ${f(ex + 7)},${f(ey + 0.5)}`, 0.7, 0.6);
      out.push(`<circle cx="${f(ex + r(-0.5, 0.5))}" cy="${f(ey - 0.5)}" r="2.3" fill="currentColor" stroke="none"/>`);
      if (fem) for (let k = 0; k < 3; k++) P(`M${f(ex + s * (3 + k * 2))},${f(ey - 3.6 + k * 0.6)} l${f(s * 1.5)},-2`, 0.6, 0.7);
      if (old) {
        P(`M${f(ex - 6)},${f(ey + 5)} q6,3 12,0`, 0.6, 0.5);
        P(`M${f(ex + s * 10)},${f(ey - 1)} l${f(s * 4)},-2 M${f(ex + s * 10)},${f(ey + 1)} l${f(s * 4)},1`, 0.5, 0.5);
      }
      // brows
      const by = ey - r(8, 11), bw = fem ? 1.1 : 2;
      S(`M${f(ex - s * 9)},${f(by + 1 + (s > 0 ? r(-1, 1) : 0))} Q${f(ex)},${f(by - 3 - r(0, 2))} ${f(ex + s * 10)},${f(by + r(0, 2))}`, bw);
    }

    // nose
    const nl = r(18, 24);
    S(`M${cx - 2},${f(ey + 2)} C${cx - 3},${f(ey + nl - 6)} ${cx - 9},${f(ey + nl - 1)} ${cx - 4},${f(ey + nl + 1)} Q${cx},${f(ey + nl + 3)} ${cx + 5},${f(ey + nl)}`, 1.1);

    // beard (drawn before mouth)
    const my = ey + nl + 10;
    if (L.beard !== "none") {
      const len = { short: 6, full: 26, long: 66 }[L.beard] || 20;
      const bx = rx * 0.98;
      const bottom = chin + len;
      const beard = `M${f(cx - bx)},${f(cy + 6)} C${f(cx - bx)},${f(cy + 34)} ${f(cx - rx * 0.62)},${f(bottom - 6)} ${cx},${f(bottom + (L.beard === "long" ? 8 : 0))} C${f(cx + rx * 0.62)},${f(bottom - 6)} ${f(cx + bx)},${f(cy + 34)} ${f(cx + bx)},${f(cy + 6)} C${f(cx + rx * 0.7)},${f(cy + 22)} ${f(cx + 16)},${f(my - 6)} ${cx},${f(my - 7)} C${f(cx - 16)},${f(my - 6)} ${f(cx - rx * 0.7)},${f(cy + 22)} ${f(cx - bx)},${f(cy + 6)} Z`;
      fillP(beard, 1.2);
      const n = L.beard === "short" ? 10 : 22;
      for (let i = 0; i < n; i++) {
        const t = R(), x = cx + (t - 0.5) * bx * 1.7;
        const y0 = my - 2 + r(0, 10) + Math.abs(t - 0.5) * 20;
        const len2 = r(8, Math.max(10, (bottom - y0) * 0.85));
        P(`M${f(x)},${f(y0)} q${f(r(-4, 4))},${f(len2 / 2)} ${f((cx - x) * 0.18 + r(-3, 3))},${f(len2)}`, 0.6, old ? 0.5 : 0.75);
      }
      // moustache
      S(`M${cx},${f(my - 7)} C${cx - 8},${f(my - 9)} ${cx - 14},${f(my - 4)} ${cx - 18},${f(my + 3)}`, 1.2);
      S(`M${cx},${f(my - 7)} C${cx + 8},${f(my - 9)} ${cx + 14},${f(my - 4)} ${cx + 18},${f(my + 3)}`, 1.2);
    }

    // mouth
    const mw = fem ? 8 : 9;
    S(`M${cx - mw},${f(my)} Q${cx},${f(my + r(1, 3.5))} ${cx + mw},${f(my)}`, fem ? 1.3 : 1.1);
    P(`M${cx - mw + 3},${f(my + 4)} Q${cx},${f(my + (fem ? 7 : 6))} ${cx + mw - 3},${f(my + 4)}`, 0.7, 0.55);
    if (!young && L.beard === "none" || old) {
      P(`M${cx - 12},${f(ey + nl - 2)} q-4,8 -2,14 M${cx + 12},${f(ey + nl - 2)} q4,8 2,14`, 0.6, old ? 0.55 : 0.3);
    }
    if (old) {
      P(`M${cx - 14},${f(top + 16)} q14,-4 28,0 M${cx - 10},${f(top + 22)} q10,-3 20,0`, 0.6, 0.45);
    }

    // ── headwear / hair (front layer) ──
    const hairline = cy - ry * 0.5;
    if (head === "bare" || head === "crown") {
      if (fem) {
        S(`M${f(cx - rx - 3)},${f(cy + 6)} C${f(cx - rx - 6)},${f(top - 10)} ${f(cx + rx + 6)},${f(top - 10)} ${f(cx + rx + 3)},${f(cy + 6)} C${f(cx + rx - 4)},${f(hairline - 4)} ${cx + 10},${f(hairline - 8)} ${cx},${f(hairline - 2)} C${cx - 10},${f(hairline - 8)} ${f(cx - rx + 4)},${f(hairline - 4)} ${f(cx - rx - 3)},${f(cy + 6)} Z`, 1.3);
        for (let i = 0; i < 8; i++) P(`M${f(cx + r(-20, 20))},${f(top - 4)} q${f(r(-12, 12))},${f(r(10, 18))} ${f(r(-20, 20))},${f(r(14, 24))}`, 0.6, 0.6);
      } else if (old && R() < 0.5) {
        // balding crown with side hair
        for (const s of [-1, 1]) S(`M${f(cx + s * rx * 0.98)},${f(cy + 4)} C${f(cx + s * (rx + 6))},${f(cy - 14)} ${f(cx + s * (rx + 2))},${f(hairline)} ${f(cx + s * rx * 0.6)},${f(top + 6)}`, 1.4);
        P(`M${cx - 10},${f(top + 8)} q10,-3 20,0`, 0.6, 0.4);
      } else {
        const hairTop = `M${f(cx - rx - 2)},${f(cy + 2)} C${f(cx - rx - 8)},${f(top - 12)} ${f(cx + rx + 8)},${f(top - 12)} ${f(cx + rx + 2)},${f(cy + 2)} C${f(cx + rx - 2)},${f(hairline + 4)} ${f(cx + rx * 0.4)},${f(hairline - r(2, 8))} ${cx},${f(hairline - 4)} C${f(cx - rx * 0.4)},${f(hairline - r(2, 8))} ${f(cx - rx + 2)},${f(hairline + 4)} ${f(cx - rx - 2)},${f(cy + 2)} Z`;
        fillP(hairTop, 1.3);
        for (let i = 0; i < 12; i++) {
          const x = cx + r(-rx, rx);
          P(`M${f(x)},${f(top - 6 + Math.abs(x - cx) * 0.2)} q${f(r(-6, 6))},${f(r(6, 12))} ${f(r(-8, 8))},${f(r(14, 22))}`, 0.6, 0.6);
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
    } else if (head === "cloth") {
      // band (agal) and the cloth's inner edge framing the face
      S(`M${f(cx - rx - 6)},${f(hairline - 4)} Q${cx},${f(hairline - 16)} ${f(cx + rx + 6)},${f(hairline - 4)}`, 2.2);
      S(`M${f(cx - rx - 6)},${f(hairline + 1)} Q${cx},${f(hairline - 11)} ${f(cx + rx + 6)},${f(hairline + 1)}`, 1.2);
      const cap = `M${f(cx - rx - 6)},${f(hairline - 4)} Q${cx},${f(hairline - 16)} ${f(cx + rx + 6)},${f(hairline - 4)} C${f(cx + rx + 10)},${f(top - 4)} ${f(cx + 12)},${f(top - 14)} ${cx},${f(top - 12)} C${f(cx - 12)},${f(top - 14)} ${f(cx - rx - 10)},${f(top - 4)} ${f(cx - rx - 6)},${f(hairline - 4)} Z`;
      fillP(cap, 1.3);
      for (let i = 0; i < 5; i++) P(`M${f(cx + r(-rx, rx))},${f(top - 8)} q${f(r(-4, 4))},${f(r(6, 10))} ${f(r(-3, 3))},${f(r(12, 18))}`, 0.6, 0.45);
    } else if (head === "veil") {
      const cap = `M${f(cx - rx - 4)},${f(cy - 2)} C${f(cx - rx - 6)},${f(top - 6)} ${f(cx + rx + 6)},${f(top - 6)} ${f(cx + rx + 4)},${f(cy - 2)} C${f(cx + rx - 2)},${f(hairline - 8)} ${f(cx - rx + 2)},${f(hairline - 8)} ${f(cx - rx - 4)},${f(cy - 2)} Z`;
      fillP(cap, 1.3);
      for (const s of [-1, 1]) P(`M${f(cx + s * 4)},${f(hairline - 6)} q${f(s * 10)},2 ${f(s * (rx - 2))},14`, 0.8, 0.65);
      P(`M${f(cx - rx + 4)},${f(top + 2)} Q${cx},${f(top - 8)} ${f(cx + rx - 4)},${f(top + 2)}`, 0.6, 0.4);
    } else if (head === "turban" || head === "priest") {
      const tall = head === "priest" ? 34 : 22, wide = head === "priest" ? 5 : 12;
      const tb = `M${f(cx - rx - 5)},${f(hairline + 2)} C${f(cx - rx - wide - 8)},${f(hairline - 14)} ${f(cx - rx - wide)},${f(top - tall)} ${cx},${f(top - tall - 2)} C${f(cx + rx + wide)},${f(top - tall)} ${f(cx + rx + wide + 8)},${f(hairline - 14)} ${f(cx + rx + 5)},${f(hairline + 2)} Q${cx},${f(hairline - 8)} ${f(cx - rx - 5)},${f(hairline + 2)} Z`;
      fillP(tb, 1.4);
      for (let i = 0; i < 4; i++) {
        const y = hairline - 4 - i * ((tall + 26) / 5);
        const ww = rx + (head === "priest" ? 2 : wide - 2) - i * 4;
        S(`M${f(cx - ww)},${f(y + 6 - i * 2)} Q${f(cx + r(-6, 6))},${f(y - 6 - r(0, 6))} ${f(cx + ww)},${f(y - 6 + i * 2)}`, 0.9, 0.8);
      }
      if (head === "priest") {
        out.push(`<rect x="${cx - 8}" y="${f(hairline - 14)}" width="16" height="8" rx="1" stroke-width="1.1"/>`);
        P(`M${cx - 5},${f(hairline - 10)} h10`, 0.6, 0.7);
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
    }
  };
})();
