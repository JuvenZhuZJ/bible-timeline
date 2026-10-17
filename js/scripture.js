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

  const BASE = "https://wol.jw.org/en/wol/b/r1/lp-e/nwtsty/";
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const names = [...NUM.keys()].sort((a, b) => b.length - a.length).join("|");
  const BOOK_AT = new RegExp(`^(${names})\\s+(?=\\d)`);
  // one part: "27", "27-28", "32:24-28", "1:1-2:3", "7:superscription", or (in a verse context) "19-20"
  const PART = /^(\d+)(?::(\d+|superscription))?(?:-(\d+)(?::(\d+))?)?$/i;

  function url(b, ch, v1, ch2, v2) {
    let u = `${BASE}${b}/${ch}`;
    if (v1) u += `#v=${b}:${ch}:${v1}` + (v2 ? `-${b}:${ch2}:${v2}` : "");
    return u;
  }
  const a = (href, text, title) => `<a class="ref-link" href="${esc(href)}" target="_blank" rel="noopener" title="${esc(title)}">${esc(text)}</a>`;

  /* "Genesis 2:7, 19-20; 3:1; Hebrews 11:4": segments split on ";", parts on ",".
     A segment without a book keeps the last book; a bare number after a verse is a verse. */
  function linkRefs(str) {
    const s = String(str == null ? "" : str);
    let book = 0, chap = 0, inVerse = false;
    return s.split(/(;\s*)/).map((seg, si) => {
      if (si % 2) return esc(seg);
      let lead = "";
      const m = seg.match(BOOK_AT);
      if (m) { book = NUM.get(m[1]); lead = m[0]; seg = seg.slice(lead.length); inVerse = false; }
      else inVerse = false;                    // "Genesis 47:28; 49" → chapter 49
      if (!book) return esc(lead + seg);
      return seg.split(/(,\s*)/).map((part, pi) => {
        const text = (pi === 0 ? lead : "") + part;
        if (pi % 2) return esc(part);
        const p = part.trim().match(PART);
        if (!p) return esc(text);
        let [, n1, v1, n2, v2] = p;
        let ch, ch2, va, vb;
        if (v1) { ch = +n1; va = /^\d+$/.test(v1) ? +v1 : 0; if (v2) { ch2 = +n2; vb = +v2; } else { ch2 = ch; vb = n2 ? +n2 : 0; } }
        else if (inVerse) { ch = ch2 = chap; va = +n1; vb = n2 ? +n2 : 0; }
        else if (ONE_CHAPTER.has(book)) { ch = ch2 = 1; va = +n1; vb = n2 ? +n2 : 0; }
        else { ch = +n1; ch2 = n2 ? +n2 : ch; }
        chap = ch2; inVerse = !!(va || v1);    // "Psalm 7:superscription, 3" → verse 3
        const name = BOOKS[book - 1];
        const label = va ? `${name} ${ch}:${va}${vb ? (ch2 !== ch ? `-${ch2}:${vb}` : `-${vb}`) : ""}` : `${name} ${ch}${ch2 !== ch ? `-${ch2}` : ""}`;
        return a(url(book, ch, va, ch2, vb), text, `Read ${label} on wol.jw.org`);
      }).join("");
    }).join("");
  }

  /* prose: link "Book ch:v[-v][, v[-v]]" wherever it appears */
  const IN_TEXT = new RegExp(`\\b(?:${names})\\s+\\d+:\\d+(?:-\\d+(?::\\d+)?)?(?:,\\s*\\d+(?:-\\d+)?)*`, "g");
  function linkText(str) {
    const s = String(str == null ? "" : str);
    let out = "", at = 0;
    for (const m of s.matchAll(IN_TEXT)) { out += esc(s.slice(at, m.index)) + linkRefs(m[0]); at = m.index + m[0].length; }
    return out + esc(s.slice(at));
  }

  window.Scripture = { linkRefs, linkText, url };
})();
