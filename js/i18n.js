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
    "books.aria": "顯示聖經書卷",
    "books.t": "聖經書卷",
    "books.on": "聖經書卷已顯示在主線上方",
    "show.menu": "顯示哪些人",
    "show.h": "顯示",
    "show.all": "所有人",
    "show.all.d": "聖經提到名字的每個人",
    "show.key": "主要人物",
    "show.key.d": "最為人熟知的人物和耶穌的祖先",
    "show.line": "亞當到耶穌的世系",
    "show.line.d": "只顯示從亞當到耶穌的世系",
    "show.current": "目前顯示：{m}。選擇顯示哪些人",
    "show.jobs": "按身分或家庭角色",
    "show.fam.husband": "丈夫",
    "show.fam.wife": "妻子",
    "show.fam.son": "兒子",
    "show.fam.daughter": "女兒",
    "show.groups.note": "可以選多項，符合任何一項的人都會顯示。",
    "show.groups.more": "{a}等{n}項",
    "show.mine": "我的書籤",
    "show.mine.d": "只顯示你加了星號的人",
    "notes.open": "我的筆記和書籤",
    "notes.title": "我的筆記和書籤",
    "notes.intro": "這些資料只儲存在這部裝置的這個瀏覽器裡。清除瀏覽器資料就會刪除它們，所以最好不時下載一份副本。要在另一部裝置上使用，可以在這裡下載，再到那部裝置上按<strong>載入</strong>。",
    "notes.download": "下載",
    "notes.print": "列印",
    "notes.load": "載入",
    "notes.loaded": "已載入{n}個人的筆記和書籤",
    "notes.badfile": "這個檔案裡沒有本網站的筆記",
    "notes.filetail": "以下內容用來把筆記載入回聖經家譜，請不要修改：",
    "notes.empty": "還沒有。開啟人物的視窗，然後按星號加入書籤，或在「我的筆記」裡寫下筆記。",
    "notes.count": "{n}個人 · {s}個書籤",
    "notes.file": "聖經家譜：我的筆記和書籤（{d}）",
    "note.h": "我的筆記",
    "note.aria": "我對{name}的筆記",
    "note.ph": "寫下你對{name}的筆記……",
    "note.local": "只儲存在這個瀏覽器裡",
    "note.saved": "已儲存",
    "note.fail": "這個瀏覽器無法儲存",
    "star": "把{name}加入書籤",
    "star.t": "書籤",
    "star.on": "已把{name}加入書籤",
    "star.off": "已移除{name}的書籤",
    "show.groups.more.all": "{a}等{n}項（全部符合）",
    "show.groups.note.all": "只顯示同時符合所有選項的人，例如身兼君王和先知的人。",
    "show.and": "兼",
    "show.match": "選多項時",
    "show.match.k": "顯示",
    "show.match.any": "符合任何一項的人",
    "show.match.all": "符合所有項目的人",
    "show.result": "{n}人",
    "show.job.king": "君王和王后",
    "show.job.prophet": "先知",
    "show.job.falseprophet": "假先知",
    "show.job.patriarch": "族長",
    "show.job.judge": "士師",
    "show.job.priest": "祭司",
    "show.job.apostle": "使徒",
    "show.job.official": "官員",
    "show.job.commander": "軍隊首領",
    "show.job.writer": "聖經執筆者",
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
    "legend.assumed": "假定的年份",
    "legend.event": "重大事件",
    "legend.man": "跟男子的親屬關係",
    "legend.woman": "跟女子的親屬關係",
    "legend.job.king": "君王／王后",
    "legend.job.prophet": "先知",
    "legend.job.falseprophet": "假先知",
    "legend.job.patriarch": "族長",
    "legend.job.judge": "士師",
    "legend.job.priest": "祭司",
    "legend.job.apostle": "使徒",
    "legend.job.official": "官員",
    "legend.job.commander": "軍隊首領",
    "legend.job.writer": "聖經執筆者",
    "legend.book": "聖經書卷涵蓋的時期",
    "job.king": "君王",
    "job.king.f": "王后",
    "job.prophet": "先知",
    "job.prophet.f": "女先知",
    "job.falseprophet": "假先知",
    "job.falseprophet.f": "假女先知",
    "job.patriarch": "族長",
    "job.judge": "士師",
    "job.priest": "祭司",
    "job.apostle": "使徒",
    "job.official": "官員",
    "job.commander": "軍隊首領",
    "job.writer": "聖經執筆者",
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
    "about.intro": "這個時間線顯示聖經裡的人物，從亞當到公元1世紀的基督徒。每個點代表一個人，每個大圓點是聖經歷史的一個轉捩點。",
    "about.move.h": "瀏覽方法",
    "about.move": "拖動時間線可以穿越時間，捲動滑鼠滾輪（或在手機上用雙指）可以放大縮小。放大後會顯示更多人物。也可以按<strong>＋</strong>和<strong>－</strong>按鈕縮放，按下面的按鈕或點一下網站標誌就會回到整個時間線。底部的長條顯示整段歷史，人物按鈕目前顯示的每個人都有一個小標記；點一下或拖動就可以跳到那個時期。要找某個人，可以在搜尋框輸入名字。按頂部的語言按鈕可以切換英文和中文。",
    "about.person.h": "查看人物",
    "about.person": "把滑鼠移到（或輕觸）一個點上，就能看到那個人的畫像、生卒年份和親屬關係；點一下（或再輕觸一次）就會開啟他的視窗。在視窗裡點一下親屬的名字，就會開啟那個人的視窗；點一下生平線上的點，就能看到他一生中發生的事。經文出處會開啟線上的《新世界譯本》。在<strong>延伸閱讀</strong>下面，視窗會連結到《洞悉聖經》裡關於這個人的文章，以及《信心的榜樣》或《鼓起勇氣與上帝同行》裡講述他的章節。主要人物的視窗還會列出跟他同時在世的其他主要人物。按視窗頂部的連結按鈕，可以複製一個開啟這個人的連結；瀏覽器的網址也會一直記錄畫面上的內容，所以你可以把它加入書籤或傳給別人。你可以同時開啟幾個視窗來比較不同人物的生平，他們的生平線會固定顯示在主線下方；按底部的<strong>全部收起</strong>或<strong>全部關閉</strong>就能一次整理所有視窗。",
    "about.books.h": "聖經書卷",
    "about.books": "按頂部的書本按鈕，主線上方就會顯示聖經各卷書。每條線代表那卷書涵蓋的時期，線上的圓點是書中記載的主要事件。把滑鼠移到書卷上（或輕觸一下），就會看到執筆者、寫作地點和完成寫作的年份，還有線上閱讀的連結；點一下（或再輕觸一次）就會放大到那卷書。點一下圓點，就會在相關人物的視窗中開啟那件事。詩篇和書信等沒有涵蓋特定時期的書卷，會在完成寫作的年份顯示一個短標記。年份根據《新世界譯本》的「聖經書卷一覽表」。",
    "about.notes.h": "我的筆記和書籤",
    "about.notes": "按視窗頂部的星號，就可以把這個人加入書籤；在簡介下面的<strong>我的筆記</strong>裡，可以寫下你對他的任何想法。人物按鈕裡的<strong>我的書籤</strong>只顯示你加了星號的人，<strong>我的筆記和書籤</strong>則會列出所有內容，方便下載或列印。這些資料只儲存在這部裝置的這個瀏覽器裡；要帶到另一部裝置，可以下載檔案，再在那裡按<strong>載入</strong>。",
    "about.show.h": "顯示哪些人",
    "about.show": "按頂部的人物按鈕，可以選擇顯示聖經提到名字的<strong>所有人</strong>、<strong>主要人物</strong>，或只顯示<strong>從亞當到耶穌的世系</strong>（路加福音3:23-38；馬太福音1:1-16）。在<strong>按身分或家庭角色</strong>下面，還可以只顯示君王和王后、先知、聖經執筆者、妻子、女兒等；可以選多項，符合任何一項的人都會顯示；如果改選<strong>符合所有項目的人</strong>，就只會顯示同時符合每一項的人，例如身兼君王和先知的人。名字後面的小圖示表示這個人以甚麼身分為人所知：王冠代表君王或王后，書卷代表先知（破損的書卷代表假先知），牧杖代表族長，天平代表士師，頭巾代表祭司，涼鞋代表使徒，印戒代表官員，劍代表軍隊首領，羽毛筆代表聖經執筆者。有些人有不止一個身分，例如大衛，就會有幾個圖示。<strong>圖例</strong>列出了所有圖示。",
    "about.dates.h": "怎樣看年份",
    "about.dates": "每個出生和死亡年份都屬於以下三種之一，按<strong>圖例</strong>按鈕可以看到各種的標示方法。<strong>實心點</strong>表示年份是按聖經記載的歲數和在位年數推算的。<strong>圓圈中間有小點</strong>表示年份是<strong>估計</strong>的：聖經提供了線索（例如去世時的歲數），但沒有確切年份。<strong>虛線圓圈</strong>表示年份是<strong>假定</strong>的：聖經沒有記載，所以按那個人所屬的世代或出現的時期來安排。大多數人的年份都是假定的，所以他們在時間線上的位置只能作為大概的參考。年份前面有「約」字，表示是大約的年份。",
    "about.places.h": "地方",
    "about.places": "開啟人物視窗後，地圖會按照他生平的先後次序，用數字標出聖經提到跟他有關的地方，並畫出地方之間的道路和航線。在某個地方發生的活動都有地名標籤，每個重大事件也會顯示發生的地點。在手機上，地圖會顯示在視窗的頂部。虛線圖釘表示地點不確定。",
    "about.sources.h": "資料來源",
    "about.sources": "經文出處、引文和人名的寫法都根據《聖經新世界譯本》（研讀版）。人物和親屬關係的資料取自《洞悉聖經》（第1、2冊），簡介是本網站撰寫的。年份根據《洞悉聖經》的年代學和《新世界譯本》的圖表。地點取自 OpenBible.info，並對照了《洞悉聖經》和《新世界譯本》的地圖。畫像只是插圖，僅供參考。",
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
    "readmore": "延伸閱讀",
    "age.at": "{a}{n}歲",
    "locate": "在時間線上顯示{name}",
    "locate.t": "在時間線上顯示",
    "min": "收起",
    "link": "複製{name}的連結",
    "link.t": "複製連結",
    "link.copied": "已複製{name}的連結",
    "bk.kind": "聖經書卷",
    "bk.writer": "執筆者",
    "bk.at": "寫作地點",
    "bk.done": "完成寫作",
    "bk.span": "涵蓋時期",
    "bk.read": "閱讀{b}",
    "bk.c": "約{y}",
    "bk.a": "{y}以後",
    "bk.b": "{y}以前",
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
