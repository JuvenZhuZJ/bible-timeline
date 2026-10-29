/*
 * Scripture citations → links to the Bible on wol.jw.org (Watchtower ONLINE LIBRARY,
 * New World Translation Study Edition, the default Bible of wol.jw.org/en/wol/binav/r1/lp-e).
 *
 *   Scripture.linkRefs("Genesis 2:7, 19-20; Hebrews 11:4")   a citation field, every part linked
 *   Scripture.linkText("… called Amram in 1 Chronicles 1:41.") prose, only "Book ch:v" citations linked
 *
 * Both take plain text and return escaped HTML. Each citation part gets its own link:
 * "Genesis 2:7, 19-20" links "Genesis 2:7" and "19-20". A chapter-only part ("Genesis 27-28")
 * opens the first chapter; a verse part opens its chapter with the verses highlighted
 * (WOL's own #v=book:chapter:verse-book:chapter:verse; plain #v= keeps the study pane closed on phones).
 */
(function () {
  "use strict";

  const BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
    "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther",
    "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
    "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
    "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians",
    "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
    "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
    "1 John", "2 John", "3 John", "Jude", "Revelation"];
  const NUM = new Map(BOOKS.map((b, i) => [b, i + 1]));
  NUM.set("Psalm", 19);
  const ONE_CHAPTER = new Set([31, 57, 63, 64, 65]);   // Obadiah, Philemon, 2 John, 3 John, Jude: "Jude 14" is a verse

  // the same books in the Chinese New World Translation (中文《新世界譯本》)
  const ZH_BOOKS = ["創世記", "出埃及記", "利未記", "民數記", "申命記", "約書亞記", "士師記", "路得記", "撒母耳記上", "撒母耳記下",
    "列王紀上", "列王紀下", "歷代志上", "歷代志下", "以斯拉記", "尼希米記", "以斯帖記", "約伯記", "詩篇", "箴言", "傳道書", "雅歌",
    "以賽亞書", "耶利米書", "耶利米哀歌", "以西結書", "但以理書", "何西阿書", "約珥書", "阿摩司書", "俄巴底亞書", "約拿書", "彌迦書",
    "那鴻書", "哈巴谷書", "西番雅書", "哈該書", "撒迦利亞書", "瑪拉基書", "馬太福音", "馬可福音", "路加福音", "約翰福音", "使徒行傳",
    "羅馬書", "哥林多前書", "哥林多後書", "加拉太書", "以弗所書", "腓立比書", "歌羅西書", "帖撒羅尼迦前書", "帖撒羅尼迦後書",
    "提摩太前書", "提摩太後書", "提多書", "腓利門書", "希伯來書", "雅各書", "彼得前書", "彼得後書", "約翰一書", "約翰二書", "約翰三書",
    "猶大書", "啟示錄"];
  // in Chinese, citations show the Chinese book names and open the Chinese Study Edition on wol.jw.org
  const ZH = !!(window.I18N && window.I18N.zh);
  const BASE = ZH ? "https://wol.jw.org/cmn-Hant/wol/b/r24/lp-ch/nwtsty/" : "https://wol.jw.org/en/wol/b/r1/lp-e/nwtsty/";
  // "Genesis 2:7, 19-20; 3:1" → "創世記2:7,19-20；3:1"
  const zhText = (t) => t.replace(BOOK_AT_ANY, (m, b) => ZH_BOOKS[NUM.get(b) - 1]).replace(/;\s*/g, "；").replace(/,\s*/g, ",");
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const names = [...NUM.keys()].sort((a, b) => b.length - a.length).join("|");
  const BOOK_AT = new RegExp(`^(${names})\\s+(?=\\d)`);
  const BOOK_AT_ANY = new RegExp(`(?:^|\\b)(${names})\\s+(?=\\d)`, "g");
  // one part: "27", "27-28", "32:24-28", "1:1-2:3", "7:superscription", or (in a verse context) "19-20"
  const PART = /^(\d+)(?::(\d+|superscription))?(?:-(\d+)(?::(\d+))?)?$/i;

  function url(b, ch, v1, ch2, v2) {
    let u = `${BASE}${b}/${ch}`;
    if (v1) u += `#v=${b}:${ch}:${v1}` + (v2 ? `-${b}:${ch2}:${v2}` : "");
    return u;
  }
  const a = (href, text, title) => `<a class="ref-link" href="${esc(href)}" target="_blank" rel="noopener" title="${esc(title)}">${esc(text)}</a>`;

  /* "Genesis 2:7, 19-20; 3:1; Hebrews 11:4": segments split on ";", parts on ",".
     A segment without a book keeps the last book; a bare number after a verse is a verse.
     Returns the pieces in order: { sep } for a separator, { text, r } for a part, where r is
     { b, ch, va, ch2, vb } (va 0 = whole chapters) or null when the part is not a citation. */
  function parse(str) {
    const s = String(str == null ? "" : str), out = [];
    let book = 0, chap = 0, inVerse = false;
    s.split(/(;\s*)/).forEach((seg, si) => {
      if (si % 2) { out.push({ sep: seg, semi: true }); return; }
      let lead = "";
      const m = seg.match(BOOK_AT);
      if (m) { book = NUM.get(m[1]); lead = m[0]; seg = seg.slice(lead.length); }
      inVerse = false;                         // "Genesis 47:28; 49" → chapter 49
      if (!book) { out.push({ text: lead + seg, r: null }); return; }
      seg.split(/(,\s*)/).forEach((part, pi) => {
        if (pi % 2) { out.push({ sep: part }); return; }
        const text = (pi === 0 ? lead : "") + part;
        const p = part.trim().match(PART);
        if (!p) { out.push({ text, r: null }); return; }
        let [, n1, v1, n2, v2] = p;
        let ch, ch2, va, vb;
        if (v1) { ch = +n1; va = /^\d+$/.test(v1) ? +v1 : 0; if (v2) { ch2 = +n2; vb = +v2; } else { ch2 = ch; vb = n2 ? +n2 : 0; } }
        else if (inVerse) { ch = ch2 = chap; va = +n1; vb = n2 ? +n2 : 0; }
        else if (ONE_CHAPTER.has(book)) { ch = ch2 = 1; va = +n1; vb = n2 ? +n2 : 0; }
        else { ch = +n1; ch2 = n2 ? +n2 : ch; }
        chap = ch2; inVerse = !!(va || v1);    // "Psalm 7:superscription, 3" → verse 3
        out.push({ text, r: { b: book, ch, va, ch2, vb } });
      });
    });
    return out;
  }
  function linkRefs(str) {
    return parse(str).map((t) => {
      if (t.sep != null) return esc(ZH ? (t.semi ? "；" : ",") : t.sep);
      const shown = ZH ? zhText(t.text) : t.text;
      if (!t.r) return esc(shown);
      const { b, ch, va, ch2, vb } = t.r;
      const name = ZH ? ZH_BOOKS[b - 1] : BOOKS[b - 1];
      const sp = ZH ? "" : " ";
      const label = va ? `${name}${sp}${ch}:${va}${vb ? (ch2 !== ch ? `-${ch2}:${vb}` : `-${vb}`) : ""}` : `${name}${sp}${ch}${ch2 !== ch ? `-${ch2}` : ""}`;
      return a(url(b, ch, va, ch2, vb), shown, ZH ? `在守望台線上書庫閱讀${label}` : `Read ${label} on wol.jw.org`);
    }).join("");
  }

  /* does a citation field cite this verse (or, with v 0, anything in this chapter)? */
  function cites(str, b, c, v) {
    return parse(str).some(({ r }) => {
      if (!r || r.b !== b) return false;
      const end = r.vb || r.va;
      if (!v) return c >= r.ch && c <= r.ch2;
      if (!r.va) return c >= r.ch && c <= r.ch2;
      if (c < r.ch || c > r.ch2) return false;
      return (c > r.ch || v >= r.va) && (c < r.ch2 || v <= (end || r.va));
    });
  }

  /* what a reader types into search: "Dan 9:25", "daniel 9", "1 Sam 17", "但以理書9:25", "但以理書 9".
     Returns { b, c, v } (v 0 for a whole chapter) or null. A book name may be shortened to its first letters. */
  // "Jude 14" is a verse of a one-chapter book
  const ref = (b, c, v) => (ONE_CHAPTER.has(b) && !v ? { b, c: 1, v: c } : { b, c, v });
  function query(q) {
    const s = String(q || "").trim();
    let m = s.match(/^([1-3]?\s*[a-z][a-z .]*?)\.?\s*(\d+)(?:\s*:\s*(\d+))?$/i);
    if (m) {
      const k = m[1].replace(/\s+/g, " ").replace(/\.$/, "").toLowerCase().replace(/^([1-3])(?=[a-z])/, "$1 ");
      const i = BOOKS.findIndex((x) => x.toLowerCase() === k);
      const j = i >= 0 ? i : (k.replace(/^[1-3] /, "").length >= 2 ? BOOKS.findIndex((x) => x.toLowerCase().startsWith(k)) : -1);
      if (j >= 0 || k === "psalm") return ref(j >= 0 ? j + 1 : 19, +m[2], m[3] ? +m[3] : 0);
      return null;
    }
    m = s.match(/^(\D+?)\s*(\d+)(?:\s*[:：]\s*(\d+))?$/);
    if (m) {
      const z = m[1].trim(), i = ZH_BOOKS.findIndex((x) => x === z || (z.length >= 2 && x.startsWith(z)));
      if (i >= 0) return ref(i + 1, +m[2], m[3] ? +m[3] : 0);
    }
    return null;
  }

  /* prose: link "Book ch:v[-v][, v[-v]]" wherever it appears */
  const IN_TEXT = new RegExp(`\\b(?:${names})\\s+\\d+:\\d+(?:-\\d+(?::\\d+)?)?(?:,\\s*\\d+(?:-\\d+)?)*`, "g");
  // Chinese prose cites "創世記5:5" or "創世記7:7,13；彼得前書3:20": turned back into the English form, then linked
  const zhNames = ZH_BOOKS.map((b, i) => [b, i]).sort((x, y) => y[0].length - x[0].length);
  const ZH_IN_TEXT = new RegExp(`(?:${zhNames.map((x) => x[0]).join("|")})\\d+(?::\\d+(?:[-－]\\d+(?::\\d+)?)?)?(?:[,，、]\\s*\\d+(?:[-－]\\d+)?)*`, "g");
  const toEn = (m) => { const z = zhNames.find((x) => m.startsWith(x[0])); return `${BOOKS[z[1]]} ${m.slice(z[0].length)}`.replace(/[，、]/g, ", ").replace(/－/g, "-"); };
  function linkText(str) {
    const s = String(str == null ? "" : str);
    if (ZH) {
      let out = "", at = 0;
      for (const m of s.matchAll(ZH_IN_TEXT)) { out += esc(s.slice(at, m.index)) + linkRefs(toEn(m[0])); at = m.index + m[0].length; }
      return out + esc(s.slice(at));
    }
    let out = "", at = 0;
    for (const m of s.matchAll(IN_TEXT)) { out += esc(s.slice(at, m.index)) + linkRefs(m[0]); at = m.index + m[0].length; }
    return out + esc(s.slice(at));
  }

  // a citation as plain text, in the site's language
  const label = (str) => (ZH ? zhText(String(str == null ? "" : str)) : String(str == null ? "" : str));

  // a book's name in the site's language, by its number (1 Genesis ... 66 Revelation)
  const bookName = (b) => (ZH ? ZH_BOOKS : BOOKS)[b - 1];

  window.Scripture = { linkRefs, linkText, url, label, bookName, cites, query };
})();
