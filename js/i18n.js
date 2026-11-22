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
    "brand.sub": "公元前4026年 — 公元2025年",
    "brand.aria": "重設檢視",
    "search.aria": "搜尋人物、地點、年份或經文",
    "search.ph": "搜尋人物、地點、年份、經文…",
    "sr.year": "年份",
    "sr.verse": "經文",
    "sr.book": "聖經書卷",
    "sr.event": "事件",
    "sr.place": "地點",
    "sr.read": "閱讀{ref}",
    "sr.found": "時間線上找到{n}項",
    "sr.people": "時間線上有{n}項活動在這裡",
    "search.none": "沒有找到",
    "show.aria": "選擇顯示哪些人",
    "books.aria": "顯示聖經書卷",
    "books.t": "聖經書卷",
    "books.on": "聖經書卷已顯示在主線上方",
    "show.menu": "顯示哪些人",
    "show.h": "顯示",
    "show.all": "所有人",
    "show.all.d": "聖經提到名字的每個人，以及歷史人物",
    "show.key": "主要人物",
    "show.key.d": "最為人熟知的人物和耶穌的祖先",
    "show.line": "亞當到耶穌的世系",
    "show.line.d": "只顯示從亞當到耶穌的世系，以及聖經提到的世系中的母親",
    "show.current": "目前顯示：{m}。選擇顯示哪些人",
    "show.jobs": "按身分或家庭角色",
    "show.fam.husband": "丈夫",
    "show.fam.wife": "妻子",
    "show.fam.son": "兒子",
    "show.fam.daughter": "女兒",
    "show.groups.note": "可以選多項，從上面所選的人物中，顯示符合任何一項的人。",
    "show.within": "：",
    "show.groups.more": "{a}等{n}項",
    "show.mine": "我的書籤",
    "show.mine.d": "只顯示你加了星號的人",
    "notes.open": "我的筆記和書籤",
    "notes.title": "我的筆記和書籤",
    "notes.intro": "這些資料只儲存在這部裝置的這個瀏覽器裡。清除瀏覽器資料就會刪除它們，所以最好不時下載一份副本。要在另一部裝置上使用，可以在這裡下載，再到那部裝置上按<strong>載入</strong>。",
    "notes.download": "下載",
    "notes.print": "列印",
    "notes.load": "載入",
    "notes.loaded": "已載入筆記和書籤（{n}項）",
    "notes.badfile": "這個檔案裡沒有本網站的筆記",
    "notes.filetail": "以下內容用來把筆記載入回聖經家譜，請不要修改：",
    "notes.empty": "還沒有。開啟人物或聖經書卷的視窗，然後按星號加入書籤，或在「我的筆記」裡寫下筆記。",
    "notes.count": "已存{n}項 · {s}個書籤",
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
    "show.groups.note.all": "從上面所選的人物中，只顯示同時符合所有選項的人，例如身兼君王和先知的人。",
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
    "settings.aria": "語言和字體大小",
    "settings.h": "語言",
    "settings.size": "字體大小",
    "size.s": "小",
    "size.m": "標準",
    "size.l": "大",
    "size.xl": "特大",
    "timeline.aria": "聖經人物時間線",
    "stage.aria": "時間線",
    "zoom.desktop": "捲動滑鼠滾輪可縮放 · 拖動可穿越時間",
    "zoom.touch": "雙指縮放 · 拖動可穿越時間",
    "welcome.title": "從這裡開始",
    "welcome.open": "點一下人名，就能看到這個人的生平、家人和相關經文。",
    "welcome.open.t": "輕觸人名，就能看到這個人的生平、家人和相關經文。",
    "welcome.zoom": "捲動滑鼠滾輪放大，就會出現更多人物。拖動可穿越時間。",
    "welcome.zoom.t": "雙指放大，就會出現更多人物。拖動可穿越時間。",
    "welcome.books": "「聖經書卷」顯示每卷書是什麼時候寫成的。",
    "welcome.show": "「人物」可以選擇顯示哪些人：主要人物、君王、先知、亞當到耶穌的世系等等。",
    "welcome.search": "「搜尋」可以找人物、事件、地點、年份或經文（例如：但以理書9:25），並帶你到那裡。",
    "welcome.ok": "知道了",
    "legend": "圖例",
    "legend.derived": "根據聖經記載的歲數推算的年份",
    "legend.estimated": "估計的年份",
    "legend.assumed": "假定的年份",
    "legend.event": "重大事件",
    "legend.hist": "歷史人物",
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
    "legend.done": "書卷完成寫作的年份",
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
    "about.intro": "從亞當到公元1世紀基督徒的聖經人物，以及直到2025年的歷史，都在同一條可以縮放和穿越的時間線上。請選擇一個主題，或點一下上面圖畫的某個部分。",
    "ab.topics": "主題",
    "ab.t.start": "瀏覽方法",
    "ab.t.people": "查看人物",
    "ab.t.show": "顯示哪些人",
    "ab.t.books": "聖經書卷",
    "ab.t.dates": "年份",
    "ab.t.places": "地方",
    "ab.t.history": "歷史",
    "ab.t.notes": "我的筆記",
    "ab.t.credits": "鳴謝",
    "ab.start.1": "<strong>拖動</strong>時間線可以穿越時間；<strong>捲動滑鼠滾輪</strong>（或在手機上用<strong>雙指</strong>）可以放大縮小。放大後會顯示更多人物。",
    "ab.start.2": "也可以按<strong>＋</strong>和<strong>－</strong>按鈕縮放；按下面的按鈕或點一下網站標誌，就會回到整個時間線。",
    "ab.start.3": "底部的長條顯示整段歷史，目前顯示的每個人都有一個小標記；點一下或拖動就可以跳到那個時期。",
    "ab.start.4": "<strong>搜尋框</strong>可以找人物、事件、地方、年份和經文，例如輸入「但以理書9:25」或「公元前1000」。",
    "ab.start.5": "按<strong>語言</strong>按鈕可以切換英文和中文，也可以調整文字大小。",
    "ab.try.search": "試試搜尋",
    "ab.people.1": "把滑鼠<strong>移到</strong>一個點上（或輕觸一下），就能看到那個人的畫像、生卒年份和親屬關係。",
    "ab.people.2": "<strong>點一下</strong>（或再輕觸一次）就會開啟他的視窗，裡面有親屬、生平事件、地圖和重要經文。點一下親屬的名字，就會開啟那個人的視窗。",
    "ab.people.3": "<strong>延伸閱讀</strong>連結到《洞悉聖經》裡關於這個人的文章，以及《信心的榜樣》或《鼓起勇氣與上帝同行》裡講述他的章節。每個經文出處都會開啟《新世界譯本》裡的經文。",
    "ab.people.4": "<strong>同伴</strong>是跟他一起服事或同行的人，例如以利亞和以利沙、保羅和巴拿巴。主要人物的視窗還會列出跟他同時在世的其他主要人物。",
    "ab.people.5": "同時開啟幾個視窗，就可以比較不同人物的生平。按<strong>全部收起</strong>或<strong>全部關閉</strong>就能一次整理所有視窗。",
    "ab.people.6": "按連結按鈕可以複製開啟這個人的連結；瀏覽器的網址也會一直記錄畫面上的內容，方便加入書籤或傳給別人。",
    "ab.show.lead": "按人物按鈕可以選擇時間線上顯示哪些人：",
    "ab.show.line": "路加福音3章和馬太福音1章，也包括聖經提到的世系中的母親",
    "ab.show.jobs": "在<strong>按身分或家庭角色</strong>下面，可以只顯示君王、先知、妻子、女兒等。選多項時，符合任何一項的人都會顯示；改選<strong>符合所有項目的人</strong>，就只顯示同時符合每一項的人，例如身兼君王和先知的人。",
    "ab.show.icons": "名字後面的小圖示表示這個人以甚麼身分為人所知；像大衛這樣的人就有不止一個圖示。",
    "ab.try.people": "開啟人物選單",
    "ab.books.ev": "書中記載的事件",
    "ab.books.1": "按<strong>書本</strong>按鈕，主線上方就會顯示聖經各卷書；每條線代表那卷書涵蓋的時期。",
    "ab.books.2": "把滑鼠<strong>移到</strong>書卷上（或輕觸一下），就會看到執筆者、寫作地點和時間；<strong>點一下</strong>就會開啟那卷書的視窗，可以移動、收起、加入書籤和分享。",
    "ab.books.3": "大多數書卷的線在菱形結束；如果較晚才寫成，例如創世記和福音書，就會有一條虛線延伸到菱形。詩篇和書信等沒有涵蓋特定時期的書卷，只顯示菱形。",
    "ab.books.4": "書卷太擠時，會用「+3」這樣的數字代表幾卷書：把滑鼠移到上面就會列出這些書卷，點一下就會放大。",
    "ab.try.books": "顯示聖經書卷",
    "ab.dates.lead": "每個出生和死亡年份都屬於以下三種之一：",
    "ab.dates.d": "根據聖經推算",
    "ab.dates.d.t": "按聖經記載的歲數和在位年數推算。",
    "ab.dates.e": "估計",
    "ab.dates.e.t": "聖經提供了線索（例如去世時的歲數），但沒有確切年份。",
    "ab.dates.a": "假定",
    "ab.dates.a.t": "聖經沒有記載，按世代或出現的時期安排，只能作為大概的參考。",
    "ab.dates.hist": "來自歷史記載的人物和事件用<strong>方形</strong>，畫法相同。",
    "ab.dates.ev": "主線上的大圓點是重大事件，也就是聖經歷史的轉捩點。",
    "ab.dates.c.ic": "約",
    "ab.dates.c": "年份前面有「約」字，表示是大約的年份。",
    "ab.try.legend": "開啟圖例",
    "ab.places.1": "人物視窗裡有一幅地圖，按照他生平的先後次序，用數字標出聖經提到跟他有關的地方，並用當時的道路和航線連起來。",
    "ab.places.2": "每項活動都有地名標籤，每個重大事件也會顯示發生的地點。",
    "ab.places.3": "用＋和－按鈕、雙指或滑鼠滾輪可以縮放地圖，拖曳可以查看四周；在電腦上，拖曳地圖的右下角可以把地圖放大。",
    "ab.places.4": "虛線圖釘表示地點不確定。",
    "ab.hist.lead": "<strong>方形</strong>和<em>斜體</em>名字表示來自歷史記載而不是聖經的人物和事件。每一項都附有守望台線上書庫的資料來源連結；如果聖經預言過或提到這件事，也會列出相關經文。",
    "ab.hist.1.h": "大洪水到所羅門",
    "ab.hist.1": "吾珥、耶利哥和夏瑣的遺址等考古發現，以小方形顯示在人物的生平線上。",
    "ab.hist.2.h": "列王和先知",
    "ab.hist.2": "周圍的列強：尼尼微的陷落、亞述和巴比倫最後的君王，以及波斯跟希臘的戰爭。",
    "ab.hist.3.h": "兩約之間",
    "ab.hist.3": "尼希米之後的波斯王、亞歷山大大帝、埃及和敘利亞的希臘君王、馬加比家族和希律的家族。",
    "ab.hist.4.h": "使徒行傳之後",
    "ab.hist.4": "耶穌對耶路撒冷說的話怎樣應驗：羅馬皇帝、公元66年猶太人的起義，以及公元73年梅察達的失守。",
    "ab.hist.5.h": "直到2025年",
    "ab.hist.5": "基督教怎樣演變：君士坦丁和教會會議、聖經翻譯家、宗教改革、聖經研究者，以及耶和華見證人中央長老團。",
    "ab.hist.note": "年份跟資料來源一樣根據聖經年代，所以有些比許多歷史書早大約20年。聖經時代以後的人物用名字的第一個字代替畫像，因為畫像畫的是聖經時代的服飾。",
    "ab.notes.1": "按視窗上的<strong>星號</strong>可以把這個人或這卷書加入書籤；在<strong>我的筆記</strong>裡可以寫下你的想法。",
    "ab.notes.2": "人物選單裡的<strong>我的書籤</strong>只顯示你加了星號的項目；<strong>我的筆記和書籤</strong>會列出所有內容，方便下載或列印。",
    "ab.notes.3": "這些資料只儲存在這個瀏覽器裡。要在另一部裝置上使用，可以下載檔案，再在那裡按<strong>載入</strong>。",
    "ab.try.notes": "開啟我的筆記",
    "ab.cr.jw.h": "感謝耶和華見證人",
    "ab.cr.jw": "本網站的內容建基於耶和華見證人的書刊，這些書刊可以在 <a href=\"https://www.jw.org/cmn-hant/\" target=\"_blank\" rel=\"noopener\">jw.org</a> 和<a href=\"https://wol.jw.org/cmn-Hant/wol/h/r24/lp-ch\" target=\"_blank\" rel=\"noopener\">守望台線上書庫</a>免費閱讀。經文、人物和親屬關係、年份、背景資料和歷史記載都取自這些書刊。",
    "ab.cr.nwt": "《聖經新世界譯本》（研讀版）：經文、人名、聖經書卷一覽表和地圖",
    "ab.cr.it": "《洞悉聖經》：人物、親屬關係、年代和地方",
    "ab.cr.gwt": "《上帝的話語就是真理：聖經導讀》：聖經書卷的年份和背景",
    "ab.cr.read": "《信心的榜樣》和《鼓起勇氣與上帝同行》：關於人物的延伸閱讀",
    "ab.cr.hist": "《要留意但以理的預言！》、《人類尋求真神》、《耶和華見證人——上帝王國的宣揚者》、《守望台》和《警醒！》：聖經以外的歷史",
    "ab.cr.zh": "這些書刊的中文版：中文的人名、地名和用詞",
    "ab.cr.own": "人物簡介，以及中文書刊沒有的中文內容，都是本網站撰寫的。本網站是個人的研經項目，不是耶和華見證人出版的。",
    "ab.cr.also": "也感謝",
    "ab.cr.ob": "<a href=\"https://www.openbible.info/geo/\" target=\"_blank\" rel=\"noopener\">OpenBible.info</a> 聖經地理資料（CC BY 4.0）：地方的位置",
    "ab.cr.orbis": "<a href=\"https://github.com/sfsheath/gorbit\" target=\"_blank\" rel=\"noopener\">ORBIS</a>，史丹福大學的羅馬世界地理網絡模型（W. Scheidel 和 E. Meeks）：羅馬世界的道路和航線",
    "ab.cr.ne": "<a href=\"https://www.naturalearthdata.com/\" target=\"_blank\" rel=\"noopener\">Natural Earth</a>（公有領域）：海岸線",
    "ab.cr.osm": "<a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> 貢獻者：河流和湖泊",
    "ab.cr.fonts": "<a href=\"https://fonts.google.com/\" target=\"_blank\" rel=\"noopener\">Google Fonts</a>：網站使用的字體",
    "ab.cr.art": "畫像是為本網站繪製的，只是插圖，僅供參考。",
    "about.stats": "{n}個人物 · {e}個重大事件 · {a}個人物至少有一個假定年份 · {h}個歷史人物和{he}個歷史事件。",
    // years
    "bce.short": "公元前{y}",
    "ce.short": "公元{y}",
    "bce.long": "公元前{y}年",
    "ce.long": "公元{y}年",
    "c.": "約",
    "range.bce": "{pb}公元前{b}年 – {pd}{d}年",
    "range.cross": "{pb}公元前{b}年 – {pd}公元{d}年",
    "range.ce": "{pb}公元{b}年 – {pd}{d}年",
    "range.open": "{pb}公元{b}年 –",
    "death.none": "沒有去世記錄",
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
    "q.history": "根據歷史資料",
    "hist.tag": "來自歷史資料，不是聖經",
    "src": "資料來源：",
    "see": "參看",
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
    "comp": "同伴",
    "comp.refs": "經文",
    "contemp": "同時代的人",
    "contemp.note": "跟這個人同時在世的主要人物，按重疊的年數排列。虛線外框：年份是假定的。",
    "contemp.all": "跟這個人同時在世的人，按重疊的年數排列。虛線外框：年份是假定的。",
    "contemp.near": "時間軸上沒有別人跟這個人同時在世；這些人生活的年代最接近。",
    "apart": "在世時間相隔{n}年",
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
    "bk.done.at": "完成寫作：{y}",
    "bk.evs.h": "主要事件",
    "bk.src": "執筆者、寫作地點、完成寫作時間和涵蓋時期：《新世界譯本》的聖經書卷表。",
    "bk.hint.tap": "再輕觸一次開啟視窗",
    "bk.hint.click": "點一下開啟視窗",
    "bk.writer": "執筆者",
    "books.written": "寫過的聖經書卷",
    "bk.kind.n": "{n}卷聖經書卷",
    "bk.more.hint": "放大就能在書卷帶上看到書名",
    "bk.at": "寫作地點",
    "bk.done": "完成寫作",
    "bk.span": "涵蓋時期",
    "bk.read": "閱讀{b}",
    "bk.gwt": "《上帝的話語就是真理》對這卷書的介紹",
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
    "map.zin": "放大地圖",
    "map.zout": "縮小地圖",
    "map.zreset": "還原地圖",
    "map.resize": "拖曳以調整地圖視窗大小",
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
      // activities from data/source/activities.json carry their Chinese: [year, text, ref, { zh }]
      if (c.events) c.events = c.events.map((e) => (e[3] && e[3].zh ? [e[0], e[3].zh, ...e.slice(2)] : e));
      if (!z) continue;
      if (z.n) c.name = z.n;
      if (z.r != null) c.role = z.r;
      if (z.m != null) c.meaning = z.m;
      if (z.s != null) c.summary = z.s;
      if (z.note != null) c.note = z.note;
      if (z.fam != null) c.family = z.fam;
      if (z.src != null) c.srcZh = z.src;
      if (z.aka) c.akaZh = z.aka;
      if (z.e && c.events) c.events = c.events.map((e, i) => (z.e[i] ? [e[0], z.e[i], ...e.slice(2)] : e));
      if (z.rn && c.relNames) for (const k in c.relNames) if (z.rn[k]) c.relNames[k] = z.rn[k];
    }
    const ev = Z.events || {};
    for (const e of window.TIMELINE_EVENTS || []) { const z = ev[e.id]; if (z) { if (z.title) e.title = z.title; if (z.text) e.text = z.text; } }
    // events from history (data/history.js) carry their Chinese with them
    for (const e of window.HISTORY_EVENTS || []) if (e.zh) { e.en = e.title; e.title = e.zh.title; e.text = e.zh.text; }
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
