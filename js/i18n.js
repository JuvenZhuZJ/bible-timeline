/*
 * Language: English or Traditional Chinese (中文).
 * ------------------------------------------------------------------
 * The choice is kept in localStorage ("bt-lang"); a first visit from a browser set to Chinese opens
 * in Chinese. Changing it reloads the page, so every part of the site is drawn once, in one language.
 *
 *   I18N.lang            "en" | "zh"
 *   I18N.t(key, vars)    an interface string, e.g. I18N.t("overlap", { n: 12 }); English if a key has
 *                        no Chinese text
 *   I18N.tlen(s)         a string's width in Latin letters (a Chinese character is about two), for
 *                        the code that sizes labels before drawing them
 *   I18N.apply()         runs before js/app.js: puts the Chinese text of data/zh/*.js into the data
 *                        and translates the page's fixed text (elements with data-i18n)
 *
 * Chinese text for the data lives in data/zh/ (people, events, places, map names). Names follow the
 * Chinese New World Translation (新世界譯本) and Insight (洞悉聖經) on wol.jw.org.
 */
(function () {
  "use strict";

  let lang = "en";
  try {
    const saved = localStorage.getItem("bt-lang");
    if (saved === "en" || saved === "zh") lang = saved;
    else if (/^zh/i.test(navigator.language || "")) lang = "zh";
  } catch (_) {}

  const ZH_UI = {
    // page
    "title": "聖經家譜",
    "description": "聖經家譜：聖經裡每個人物的互動時間線，從亞當到使徒約翰。",
    "brand.sub": "公元前4026年 — 約公元100年",
    "brand.aria": "重設檢視",
    "search.aria": "搜尋人物",
    "search.ph": "搜尋人物…",
    "search.none": "沒有找到",
    "show.aria": "選擇顯示哪些人",
    "show.menu": "顯示哪些人",
    "show.h": "顯示",
    "show.all": "所有人",
    "show.all.d": "聖經提到名字的每個人",
    "show.key": "主要人物",
    "show.key.d": "最為人熟知的人物和耶穌的祖先",
    "show.line": "亞當到耶穌的世系",
    "show.line.d": "只顯示從亞當到耶穌的世系",
    "show.current": "目前顯示：{m}。選擇顯示哪些人",
    "info.aria": "關於這個時間線",
    "settings.aria": "語言",
    "settings.h": "語言",
    "timeline.aria": "聖經人物時間線",
    "stage.aria": "時間線",
    "zoom.desktop": "捲動滑鼠滾輪可縮放 · 拖動可穿越時間",
    "zoom.touch": "雙指縮放 · 拖動可穿越時間",
    "legend": "圖例",
    "legend.derived": "根據聖經記載的歲數推算的年份",
    "legend.estimated": "估計的年份",
    "legend.assumed": "假定的年份（有待核實）",
    "legend.event": "重大事件",
    "legend.man": "跟男子的親屬關係",
    "legend.woman": "跟女子的親屬關係",
    "zoom.aria": "縮放",
    "zoom.in": "放大",
    "zoom.out": "縮小",
    "zoom.fit": "顯示整個時間線",
    "mini.aria": "全覽",
    "dock.aria": "已開啟的視窗",
    "dock.all": "所有視窗",
    "fold.all": "全部收起",
    "unfold.all": "全部展開",
    "fold.all.aria": "收起所有視窗",
    "unfold.all.aria": "展開所有視窗",
    "close.all": "全部關閉",
    "close": "關閉",
    // about
    "about.title": "關於這個時間線",
    "about.intro": "每個點代表一個人；每個大圓點是聖經歷史的一個轉捩點。放大可以看到更多人物。把滑鼠移到（或輕觸）一個點上，就能看到那個人的畫像、生卒年份和親屬關係；點一下（或再輕觸一次）就會開啟他的視窗。你可以同時開啟幾個視窗來比較不同人物的生平，也可以按底部的<strong>全部收起</strong>或<strong>全部關閉</strong>一次整理所有視窗。已開啟的人物的生平線會固定顯示在主線下方。在視窗裡點一下親屬的名字，就會開啟那個人的視窗。",
    "about.show.h": "顯示哪些人",
    "about.show": "按頂部的人物按鈕，可以選擇顯示聖經提到名字的<strong>所有人</strong>、<strong>主要人物</strong>，或只顯示<strong>從亞當到耶穌的世系</strong>（路加福音3:23-38；馬太福音1:1-16）。",
    "about.bible.h": "聖經經文",
    "about.bible": "經文出處、引文和人名的寫法都根據《聖經新世界譯本》（研讀版）。",
    "about.people.h": "人物",
    "about.people": "人物和親屬關係的資料取自《洞悉聖經》（第1、2冊）的人物條目。簡介是本網站撰寫的。",
    "about.dates.h": "年份",
    "about.dates": "年份根據《洞悉聖經》的「年代學」條目，以公元前607年和公元前539年為基準，生卒年份則按聖經記載的歲數推算。如果聖經提供線索但沒有確切年份（例如去世時的歲數），年份就是<strong>估計</strong>的。大多數人的出生和死亡年份沒有記載，他們的年份是按他們所屬的世代或出現的時期定出的<strong>假定年份</strong>，用虛線外框表示，並列在<code>data/ASSUMED_DATES.md</code>，有待核實。",
    "about.places.h": "地方",
    "about.places": "地圖會按照人物生平的先後次序，用數字標出聖經提到他去過的地方。在某個地方發生的活動都有地名標籤，每個重大事件也會顯示發生的地點。在手機上，地圖會顯示在人物視窗的頂部。地點取自 OpenBible.info 的聖經地理編碼資料，並對照了《洞悉聖經》和《新世界譯本》的地圖。虛線圖釘表示地點不確定。",
    "about.portraits.h": "畫像",
    "about.portraits": "畫像是電腦生成的線條畫，僅供參考。你可以在<code>data/characters.js</code>加上<code>portrait</code>圖片路徑，換成其他圖片。",
    "about.lang.h": "中文版",
    "about.lang": "人名、地名和經文的寫法根據中文《新世界譯本》和《洞悉聖經》（守望台線上書庫）。中文資料沒有的內容由本網站翻譯。",
    "about.stats": "{n}個人物 · {e}個重大事件 · {a}個人物至少有一個假定年份。",
    // years
    "bce.short": "公元前{y}",
    "ce.short": "公元{y}",
    "bce.long": "公元前{y}年",
    "ce.long": "公元{y}年",
    "c.": "約",
    "range.bce": "{pb}公元前{b}年 – {pd}{d}年",
    "range.cross": "{pb}公元前{b}年 – {pd}公元{d}年",
    "range.ce": "{pb}公元{b}年 – {pd}{d}年",
    "age": "{a}{n}歲",
    "age.approx": "約",
    // hover card
    "hint.again": "再輕觸一次查看詳情",
    "hint.front": "再輕觸一次把視窗移到前面",
    // event tip
    "site.likely": "可能的地點",
    "site.possible": "地點不確定",
    "act.hint.tap": "再輕觸一次，在{name}的視窗中開啟",
    "act.hint.click": "點一下，在{name}的視窗中開啟",
    // window
    "q.derived": "根據聖經記載的歲數",
    "q.estimated": "估計",
    "q.assumed": "假定",
    "birth": "出生：{q}",
    "death": "死亡：{q}",
    "rel.father": "父親",
    "rel.mother": "母親",
    "rel.spouses": "配偶",
    "rel.siblings": "兄弟姊妹",
    "rel.children": "兒女",
    "family": "家人",
    "overlap": "在世時間重疊{a}{n}年{q}",
    "overlap.about": "約",
    "overlap.approx": "（年份是大約的）",
    "show.all.n": "顯示全部{n}位",
    "show.fewer": "顯示較少",
    "contemp": "同時代的人",
    "contemp.note": "跟這個人同時在世的主要人物，按重疊的年數排列。虛線外框：年份是假定的。",
    "lifespan": "生平",
    "acts": "主要事蹟",
    "keyrefs": "重要經文",
    "age.at": "{a}{n}歲",
    "locate": "在時間線上顯示{name}",
    "locate.t": "在時間線上顯示",
    "min": "收起",
    "src.bible": "經文：《聖經新世界譯本》（研讀版）。",
    "src.person": "人物：《洞悉聖經》「{a}」。",
    "src.chron": "年代：根據《洞悉聖經》「年代學」。",
    "src.places": "地方：OpenBible.info 聖經地理編碼資料（CC BY 4.0），並對照了《洞悉聖經》和《新世界譯本》的地圖（附錄A7和B）。",
    "src.zh": "中文：人名和地名根據中文《新世界譯本》和《洞悉聖經》；簡介由本網站翻譯。",
    // map
    "map.label": "{name}生平去過的地方",
    "map.label.k": "{map}地圖：{name}生平去過的地方",
    "map.hide": "隱藏地圖",
    "map.show": "顯示地圖 ▾",
    "map.show.aria": "顯示地圖",
    "map.places": "{n}個地方 · 指向圖釘或活動的地名標籤",
    "map.none": "聖經沒有提到{name}去過哪些地方。",
    "map.title": "地方",
    "map.aria": "地方地圖",
    "map.min": "收起地圖",
    "map.chip": "地圖 · {name}",
    "map.chip.aria": "顯示{name}的地圖",
    "restore": "展開{name}的視窗",
    "gmap": "在 Google 地圖中開啟",
    "gmap.short": "Google 地圖",
    "gmap.title": "在 Google 地圖中查看{place}（在新分頁開啟）",
    "usually": "通常認為在",
    "map": "地圖",
  };

  const EN_UI = {
  };

  const fill = (s, vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] == null ? "" : vars[k])) : s);
  function t(key, vars) {
    const s = lang === "zh" ? ZH_UI[key] : EN_UI[key];
    return s == null ? null : fill(s, vars);
  }

  // width of a string in Latin letters: CJK characters and full-width punctuation are about two
  const WIDE = /[⺀-鿿豈-﫿＀-￯　-〿]/g;
  const tlen = (s) => { s = String(s == null ? "" : s); const m = s.match(WIDE); return s.length + (m ? m.length * 0.9 : 0); };

  function setLang(l) {
    try { localStorage.setItem("bt-lang", l); } catch (_) {}
    location.reload();
  }

  /* put the Chinese text into the data the site reads (data/zh/*.js), keeping the English
     name for search */
  function applyData() {
    const Z = window.ZH || {};
    const people = Z.people || {};
    for (const c of window.TIMELINE_PEOPLE || []) {
      const z = people[c.id];
      c.en = c.name;
      if (!z) continue;
      if (z.n) c.name = z.n;
      if (z.r != null) c.role = z.r;
      if (z.m != null) c.meaning = z.m;
      if (z.s != null) c.summary = z.s;
      if (z.note != null) c.note = z.note;
      if (z.fam != null) c.family = z.fam;
      if (z.src != null) c.srcZh = z.src;
      if (z.aka) c.akaZh = z.aka;
      if (z.e && c.events) c.events = c.events.map((e, i) => (z.e[i] ? [e[0], z.e[i], e[2]] : e));
      if (z.rn && c.relNames) for (const k in c.relNames) if (z.rn[k]) c.relNames[k] = z.rn[k];
    }
    const ev = Z.events || {};
    for (const e of window.TIMELINE_EVENTS || []) { const z = ev[e.id]; if (z) { if (z.title) e.title = z.title; if (z.text) e.text = z.text; } }
    const eras = Z.eras || [];
    (window.TIMELINE_ERAS || []).forEach((e, i) => { if (eras[i]) e.name = eras[i]; });
    const pl = Z.places || {};
    for (const id in window.BIBLE_PLACES || {}) {
      const p = window.BIBLE_PLACES[id], z = pl[id];
      if (!z) continue;
      p.en = p.n;
      if (z.n) p.n = z.n;
      if (z.note != null) p.note = z.note;
    }
    // activities that data/places.js adds: [place, year, text, ref]
    const pp = Z.personPlaces || {};
    for (const id in window.PERSON_PLACES || {}) {
      const z = pp[id]; if (!z) continue;
      window.PERSON_PLACES[id].forEach((v, i) => { if (v.length > 2 && z[i]) v[2] = z[i]; });
    }
    // terrain.js lists its features as { n: name } in nested lists
    if (window.TERRAIN) translateNames(window.TERRAIN, Z.terrain || {});
  }
  function translateNames(o, dict) {
    if (Array.isArray(o)) { o.forEach((x) => translateNames(x, dict)); return; }
    if (!o || typeof o !== "object") return;
    if (typeof o.n === "string" && dict[o.n]) o.n = dict[o.n];
    for (const k in o) if (o[k] && typeof o[k] === "object") translateNames(o[k], dict);
  }

  /* fixed text in index.html: data-i18n="key" sets the text (or the HTML, for keys whose text has
     markup), data-i18n-aria / -ph / -title set those attributes */
  function applyPage() {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.documentElement.classList.toggle("lang-zh", lang === "zh");
    document.querySelectorAll("[data-i18n],[data-i18n-aria],[data-i18n-ph],[data-i18n-title]").forEach((n) => {
      const k = n.dataset.i18n, a = n.dataset.i18nAria, p = n.dataset.i18nPh, ti = n.dataset.i18nTitle;
      if (k) { const s = t(k); if (s != null) { if (/[<&]/.test(s)) n.innerHTML = s; else n.textContent = s; } }
      if (a) { const s = t(a); if (s != null) n.setAttribute("aria-label", s); }
      if (p) { const s = t(p); if (s != null) n.setAttribute("placeholder", s); }
      if (ti) { const s = t(ti); if (s != null) n.setAttribute("title", s); }
    });
    if (lang === "zh") {
      document.title = ZH_UI.title;
      const d = document.querySelector('meta[name="description"]'); if (d) d.setAttribute("content", ZH_UI.description);
    }
    // the settings menu: language choice
    document.querySelectorAll("[data-lang]").forEach((b) => {
      b.setAttribute("aria-checked", b.dataset.lang === lang);
      b.addEventListener("click", () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang); });
    });
  }

  function apply() {
    if (lang === "zh") applyData();
    applyPage();
  }

  window.I18N = { lang, t, tlen, setLang, apply, zh: lang === "zh" };
})();
