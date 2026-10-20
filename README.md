# Bible Family Tree

An interactive timeline of every named person in the Bible, from Adam to the apostles. Zoom and drag along the years, hover over a person to see lines to their family, and open a person's window for their dates, relatives and key scriptures.

The ⓘ button opens **About this timeline**, a short guide for visitors: moving around, opening a person, who is shown, how to read the three kinds of date, the map and the sources. It is written for people using the site, so it names no files or code; the text is in `index.html` (English) and `js/i18n.js` (Chinese, `about.*` keys).

The site is plain HTML, CSS and JavaScript. There is no build step and nothing to install to view it.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Logo

The logo is a small family tree in line art: a trunk on a horizon line (a nod to the timeline), two branches that split again, and gold dots for the people at each tip. The header copy is inline SVG in `index.html` (`.brand-mark`, styled in `css/style.css`); the browser tab uses the same tree, simplified for 16px, from `img/favicon.svg`. The tab icon has no background circle so the tree fills the space: it is bright gold when the browser is in dark mode and a deeper gold in light mode (a `prefers-color-scheme` rule inside the SVG), so it stays visible on any tab bar.

## Who is shown

The **People** button in the top bar picks who appears:

| Mode | Shows |
| --- | --- |
| Everyone | All 2,794 people, including the people the Bible does not name and 66 known from history (see below). Minor people appear as you zoom in. |
| Key figures | 228 people: the 140 hand-written key figures, 16 from history (Nabopolassar, Nabonidus, Alexander the Great, Ptolemy I, Seleucus I, Antiochus III, Antiochus IV, Mattathias, Judas Maccabeus, Simon, John Hyrcanus I, Pompey, Julius Caesar, Cleopatra VII, Nero and Titus) and everyone on the Adam-to-Jesus line. |
| Adam to Jesus line | 115 people: the 97 in Luke 3:23-38 and Matthew 1:1-16 (Mary among them) and the 18 other mothers the Bible names in the line. Eve (Genesis 3:20), Sarah (Genesis 21:2), Rebekah (Genesis 25:21-26) and Leah (Genesis 29:35); Tamar, Rahab, Ruth and Bathsheba, whom Matthew names (Matthew 1:3, 5, 6); and the mothers of the kings in Matthew's list, as Kings and Chronicles give them: Naamah, Maacah, Azubah, Jecoliah, Jerusha, Abijah, Hephzibah, Meshullemeth, Jedidah and Nehushta (1 Kings 14:21; 15:2; 22:42; 2 Kings 15:2, 33; 18:2; 21:1, 19; 22:1; 24:8). Their dates are mostly placeholders. |
| My bookmarks | Only the people the visitor starred (see [My notes and bookmarks](#my-notes-and-bookmarks)). |
| By job or family | Any mix of groups, picked as toggles. They narrow the mode picked above them instead of replacing it: Adam to Jesus line + Husbands and Wives shows only the line's couples, and Everyone + Kings shows every king; a switch under the heading shows either anyone in **any** picked group (the default) or only people in **all** of them (Kings and Prophets together gives David and Jesus; the menu shows how many people match). Saved in the browser in `bt-show` as the mode, then `;g:` (any) or `;a:` (all) and the groups, e.g. `line;g:husband,wife` (an older value with no mode, `g:king`, still loads as Everyone). Jobs: kings and queens, prophets, false prophets, patriarchs, judges, priests, apostles, officials, army commanders, Bible writers (see [Job icons](#job-icons)). Family roles, below a divider and with no timeline icon: husbands and wives (a recorded spouse), sons and daughters (a recorded father or mother). |

The overview bar at the bottom follows the same choice: it has one small mark at the birth of each person being shown (`renderMiniPeople()` in `js/app.js`), fainter when there are hundreds, so it shows which periods the chosen people belong to. Its era shading and event lines stay the same.

All the modes follow the same zoom rule: fully zoomed out you see only the timeline and its events, and people appear as you zoom in, the most important first. Key figures, Adam to Jesus line, My bookmarks and any job or family pick show their people a little sooner, since fewer people compete for space.

Searching for a person who is hidden by the current mode switches to Everyone. The choice is remembered in the browser.

On a phone the search box opens across the top bar, so the site title and the People button are hidden while it is open and come back when it closes (a CSS rule in the phone section of `css/style.css`). On a computer the search box sits beside the title and nothing is hidden.

## People the Bible does not name

The people list is built from the person articles in *Insight on the Scriptures*, and Insight writes an article only for a name. So people the Bible never names were missing, and their families had gaps: Ammon (Ben-ammi) had no mother. `data/source/unnamed-people.json` adds 34 of them, in the same shape as the Insight records, with a label for a name ("Lot's younger daughter", "Noah's wife", "Pharaoh of the Exodus") and the verses that mention them. A person is included when they have a clear family link to someone on the timeline (the wives of Cain, Noah, his sons, Lot, Potiphar, Manoah, Job, Jeroboam, Isaiah, Ezekiel, Peter and Pilate; Lot's daughters; Jephthah's and Jairus' daughters; Paul's sister and nephew) or a notable part in a Bible account (the Pharaohs of Joseph's day and of the Exodus, the Pharaoh's daughter who adopted Moses, the queen of Sheba, the widow of Zarephath, the Israelite girl in Naaman's house, the medium of En-dor, the Samaritan woman, the poor widow, the evildoer beside Jesus, the Ethiopian eunuch). Anonymous crowds, unnamed children and passing mentions are left out. A few unnamed people already had an Insight article and were there before (the Shunammite woman). Their windows cite only the Bible, not *Insight*.

## History between the Testaments

The Bible records almost nothing between Nehemiah (after 443 B.C.E.) and the birth of Jesus (2 B.C.E.). The site fills that gap with people and events known from history, as told in publications on wol.jw.org: the last Persian kings, Alexander the Great and the generals who split his empire, the Ptolemies of Egypt and the Seleucids of Syria who fought over Judea, Antiochus IV and the defiled temple, the Maccabees and the Hasmonaean kings, Pompey and Rome, and Herod's family. Herod the Great and Augustus, already on the site, gained activities from the same sources.

Before 900 B.C.E. the publications name almost no outside rulers with dates, so the earlier periods get history as activities on Bible people rather than as events on the main line. From *Insight* ("Archaeology," "Flood of Noah's Day," "Ur," "Lachish," "Sennacherib," "Cyrus"), each one a discovery that matches the Bible account: flood legends worldwide (Noah), Babylonian temple-towers (Nimrod), Ur at its height and the Nuzi adoption custom (Abraham), Egyptian titles and customs (Joseph), Jericho's burning and Hazor's size (Joshua), the Gihon water tunnel (David), Hazor as a chariot city (Solomon), Shishak's Karnak relief, the Moabite Stone (Jehoram of Israel), Sargon's annals, the Siloam Tunnel and Sennacherib's prism (Hezekiah), the Lachish reliefs (Sennacherib), Manasseh's tribute to Esar-haddon, the Babylonian ration lists naming Jehoiachin, the Lachish Letters (Zedekiah), Gedaliah's seal, Belshazzar in the Nabonidus texts, the Cyrus Cylinder, the Behistun inscription (Darius I), the Tiberius denarius, the Pilate stone and the Gallio inscription. They show as small squares on each person's lifespan and in their windows. Activities for these people that come from `overrides.json` no longer replace history activities: the build adds the two together.

Around the kings and prophets, history adds the empires the Bible speaks of, from *Insight* ("Assyria," "Shalmaneser," "Nineveh," "Medes, Media," "Babylon," "Nabonidus," "Persia"): Shalmaneser III's Black Obelisk with Jehu's tribute, Adad-nirari III and the tribute of Jehoash, the fall of Nineveh to Nabopolassar and Cyaxares (632 B.C.E.), Assyria's last stand at Harran (629), Nabonidus and Belshazzar, and Persia's wars with Greece (Marathon 490, Xerxes 480, Daniel 11:2). Rulers the Bible names are not repeated as history people; Nebuchadnezzar gains Carchemish (Jeremiah 46:2) as a Bible activity and Jehu the Black Obelisk as a history one. Shalmaneser III and Nabonidus, whom the Bible does not name, are now history people. Dates follow the wol.jw.org publications, which use Bible chronology; the Nineveh event says that many history books put these events about 20 years later and cites *The Watchtower*, October 1, 2011, on why.

After Acts the Bible's account ends, but history fills in what Jesus foretold for Jerusalem. From *Insight* ("Caesar," "Jerusalem," "Dagger Men," "Patmos") and *The Watchtower* (October 15, 1990, "Masada—Why Did It Happen?"): the emperors from Gaius (Caligula) to Nerva, among them Nero, the Caesar Paul appealed to; the fire of Rome in 64 C.E.; the Jewish revolt of 66 and Cestius Gallus' sudden withdrawal, which let Christians flee (Luke 21:20-22); Titus' siege in 70 (the destruction itself is one of the Bible's major events, since Jesus foretold it); and the fall of Masada in 73. John's window adds his release from Patmos after Domitian's death, as tradition says.

Everything from history is drawn as a **square** instead of a circle, on the main line, on people's dots, on lifespan tracks and in the windows' activity lists, and its names and event labels are in italics. The square follows the same fill rules as the circles (solid = the source gives the year, square with a small square = approximate, dashed = assumed). Windows and tooltips say "From history, not the Bible". The legend and the About box explain this in English and Chinese. History people are not a separate People filter: they appear under Everyone, Key figures (the key ones) and the job filters like everyone else, and only the square marks them.

Each item cites its source. A history person's window lists them under Sources; an activity's reference starts with the source and may add scriptures after it. Where the Bible speaks of an event, the scripture is listed too: Daniel 8 and 11 (the kings of the north and south, the disgusting thing), Daniel 7:7, John 10:22 (the Festival of Dedication) and Luke 2:1. These are given only as references; prophecy arcs are not drawn.

History events (20 of them, in `data/history.js`) appear only when zoomed in past `HIST_PPY` in `js/app.js`, and they are laid out after the Bible events, so a Bible event always keeps its label. History people follow the usual zoom rule and People modes.

Data:

- `data/history.js`: `HISTORY_SOURCES` (each source's wol.jw.org document number, which is the same in English and Chinese, and its title in both languages) and `HISTORY_EVENTS` (year, title, text, sources, optional scripture, `approx` for "c.", and the Chinese text under `zh`).
- `data/source/history-people.json`: the people. Each has dates, `q` (date labels; `history` means the source gives the year), role, jobs, portrait look, summary, note, activities and relatives by id. `replaces` turns an Insight record into a history person (Alexander the Great). `patch` changes a person already on the site: `unlink` removes a wrong family link, and `born`, `q`, `note` and `events` add history to Augustus.
- An activity's scripture field marks a history source with `@`: `"@it-herod; Matthew 2:1"` cites the Insight article on Herod and then Matthew 2:1. The keys are the ones in `HISTORY_SOURCES`. Key figures in `data/characters.js` use the same form (Herod's activities).
- Chinese text for history people goes in `data/zh/people.js` as usual; the event texts are in `data/history.js`.
- History people are kept out of Insight name matching, so the Mattathias of Luke 3 is not confused with the Maccabees' father.

## Era names

The names of the eras (Before the Flood, The Judges and so on) sit at the top of the screen. On a computer a name shows when it fits inside its era's band. Phones are too narrow for that, so there the names stack left to right in up to three rows at the top, and the people start a little lower to make room. The rows are `ERA_ROWS` in `js/app.js`. A dotted line runs down the screen at each boundary between eras, and only there: a major event inside an era (such as Solomon's Temple Completed in the United Kingdom) has its dot and name on the timeline but no dotted line, so the lines always match the eras in `TIMELINE_ERAS` in `data/events.js`.

## Event labels

Major event names sit in rows under the axis: three rows on a computer, two on a phone (`evRows` in `layout()` in `js/app.js`). Each label hangs from its dot by a straight stem, and the layout never lets a stem run through another label: a label may sit centred on its stem or slide to one side, and it takes a lower row only when the rows above are clear at its stem. A label that has no clear spot stays hidden until you zoom in; its dot still shows the details on hover or tap.

A major event's details open in a tooltip above the axis: point at the event on a computer, or tap it on a phone (tap it again to zoom in). Its scripture citation links to the passage on wol.jw.org and, when the event has a known place, a Google Maps link sits under its locator map. On a computer the tooltip stays open while the pointer moves from the event up into it (`hideTipSoon()` in `js/app.js` gives a short grace delay) and closes once the pointer has left both; on a phone it stays until you tap somewhere else. Labels have a thin outline in the page colour, so dotted lines behind them are cut cleanly.

The personal lifespan tracks (hover and open windows) start below the event label rows, so they never cover an event name.

## Portraits

Each person's lifespan line, solid or dotted, starts just after their name, and it also breaks wherever another person's name sits on it (a short-lived person's name may share a lane with a long line). So no name ever sits on top of a line. The gaps are sized to the measured name width (re-measured once the web fonts load); see `cutLifeLines()` in `js/app.js`.

Hovering (or tapping) a person shows their line-drawn portrait in a dark card, always in the same spot: under the lifespan tracks, between the timeline and the bottom controls, so it never sits on top of the names. The card moves down a little as open windows add tracks, and stops above the minimap and the window dock. When several people are open and there is no room left for the drawing, the card shrinks to just the name and dates, the tracks move a little closer together, and the hovered person's event notes are left out, so every lifespan line stays visible. Only if even that is not enough is the oldest open person's track left out (their window stays in the dock). The placement is `placePortrait()` and `trackFit()` in `js/app.js`.

Portraits are drawn by people group. There are 50 designs for men and 26 for women (listed as `PRESETS` in `js/portrait.js`), each tagged with the peoples it fits: Israelites (headbands, caps, the short Lachish turban, long or curly hair, braids), Egyptians (shaved heads, short or plaited wigs, broad collars, a pharaoh's striped headdress), Philistines (feathered headdress), Assyrians and Babylonians (long curled hair, tiered beards, tall caps, pointed helmets), Persians and Medes (fluted or rounded caps, a crenellated royal crown), Romans (cropped hair, clean-shaven, an officer's crested helmet, an emperor's laurel wreath), Greeks and the Herods, Canaanites and Phoenicians, Arameans, Edom, Moab and Ammon, desert peoples such as the Midianites, and Cushites. There are no draped head cloths, veils or hair buns. The looks follow Insight's articles on dress, headdress, hair and beards, the ancient reliefs they cite, and the illustrations in the *Lessons You Can Learn From the Bible* book on wol.jw.org; the comment above `PRESETS` lists the verses. A person's people comes from the nation or tribe Insight gives (the `group` field), or from words in their role and summary; a `look.culture` hint in `data/characters.js` overrides it (Joseph is drawn as an Egyptian official, Nimrod as a Mesopotamian king). Each person gets one design of their own people, picked once for the whole list: people are taken in birth order, each gets the design used longest ago, and a design a parent, child, sibling or spouse already has is skipped. Key figures are picked first among themselves, so neighbouring key figures also differ in headwear. A person's own `look` hints still set age, beard and any hair the Bible mentions (Samson, Samuel, Absalom); a priest's turban always wins, and a crowned king, or a foreign ruler whose role says so ("King of Assyria", "Pharaoh of Egypt", "Roman emperor"), wears his own people's royal headwear. Small differences are then drawn from each person's id, so two people with the same design never look exactly alike.

## Personal timelines and colours

Each open window adds that person's lifespan as a track under the timeline. The small dots on a track are the person's major activities: hover one (or tap it on a phone) to see its date and text, and click it (or tap it again) to open the person's window scrolled to that activity, which is briefly highlighted. It works the other way too: clicking an activity in a window briefly highlights its dot on the window's own lifespan bar, which stays pinned at the top of the window while you scroll through the activities.

A window's **Companions** row, the last row of the Family list (label on the left, names on the right), lists the people who served, traveled or stood with that person: Elijah and Elisha, Elisha and Gehazi, David and Jonathan, Daniel and his three friends, Job's three companions, Jesus and the apostles, Paul and his fellow workers (26 in all). The groups are in `data/source/companions.json`, each with the verses that show it; `node tools/build-people.mjs` gives everyone in a group the others (the `comp` field). Each chip's tooltip names its verses, all of them are under **Verses**, and family listed above is left out. The groups were found by checking every person's *Insight* relations and summary for companions, attendants, fellow workers and fellow travelers, then the Bible accounts. Apostle Philip, Eliphaz, Zophar, Joanna, Susanna, Epaphras and Epaphroditus were missing from the extracted *Insight* list and are in `data/source/added-people.json`.

When a key figure has no family links, their window shows the hand-written `family` line from `data/characters.js` instead; its `links` (person ids) make the names in it open those people (Daniel's companions Hananiah, Mishael and Azariah, Ezra's ancestor Aaron, Barnabas' cousin Mark). A name is found by the person's name or other names, in English or Chinese.

A key figure's window has a **Contemporaries** list under Family: the other key figures whose lifespans overlap theirs (Joshua, Caleb and Jethro in Moses' window), family left out since it is listed just above, and the people who shared the most years first. It is folded by default, so it adds one line until opened, and shows the first 8 names with a **Show all** button for longer lists (Paul has 29). Click a name to open that person. Most of these people have assumed dates placed by their generation, so the list is a guide, not a fact; their name chips have a dashed border and their tooltip says the overlap is approximate. Only key figures get the list and only key figures are in it, since a list from all 2,700 people would be hundreds of names long (Moses overlaps 299 people) and almost all on placeholder dates. The code is `contemporariesHTML()` in `js/app.js`.

Family links (the dashed curves shown while hovering a person) are coloured by sex at each end: blue for a man, rose for a woman, blending from one to the other along the line, and both the hovered person's dot and each relative's dot get a ring in their colour. So a father's links to his sons end in blue and to his daughters in rose. The 16 Insight entries whose sex is unknown (`gender: "u"`, for example Gog and Junias) keep a gold end. The two colours are `--male` and `--female` in `css/style.css`.

Gold marks people you are only hovering over. Every opened person gets their own colour (sea green, terracotta, lavender, sage, ivory; no blue or rose, since those mean man and woman on the family links), used for their window, track and ring on the timeline, so an opened person never looks the same as one that is not opened. The palette is `COLORS` in `js/app.js`.

## Scripture links

Every scripture citation in a person's window (the major activities, key scriptures, and any citation in the summary, note or family line) is a link. Clicking it opens that passage in a new tab on the Watchtower ONLINE LIBRARY Bible (wol.jw.org, *New World Translation* Study Edition), with the cited verses highlighted. A citation with several parts links each part: in "Genesis 2:7, 19-20" both "Genesis 2:7" and "19-20" are links, and in "Genesis 47:28; 49" the "49" opens Genesis 49. A chapter-only citation such as "Genesis 27-28" opens its first chapter. Clicking a citation in an activity opens only the passage; clicking elsewhere on the activity still jumps the timeline to it. The links look like the plain citations until you hover (a faint underline marks them on phones). The parsing is `js/scripture.js`; links have the form `https://wol.jw.org/en/wol/b/r1/lp-e/nwtsty/<book>/<chapter>#v=<book>:<chapter>:<verse>-<book>:<chapter>:<verse>`, the same form wol.jw.org uses for its own verse links.

## Job icons

Small line icons after a person's name, on the timeline and in their window, show what they are known for. A person known for more than one has each icon (David: king, prophet, Bible writer; Jesus: king, prophet, priest). The Legend lists them.

| Job | Icon | Who |
| --- | --- | --- |
| King / queen | crown | anyone whose role is king, queen, Pharaoh, emperor or tetrarch |
| Prophet | scroll | prophets, prophetesses and seers (not false prophets) |
| False prophet | broken scroll | false and lying prophets and prophetesses |
| Patriarch | shepherd's staff | the family heads from Adam to Jacob and Jacob's twelve sons (Acts 7:8-9; Hebrews 7:4) |
| Judge | scales | the judges of Israel |
| Priest | turban | priests and high priests |
| Apostle | Roman sandal | the apostles |
| Official | signet ring | governors, court officials, secretaries, stewards, proconsuls |
| Army commander | sword | army chiefs and commanders |
| Bible writer | quill | the writers in the NWT "Table of the Books of the Bible" |

`data/source/jobs.json` sets the jobs by hand for the key figures, the Bible writers and the patriarchs, and fixes a few others. Everyone else gets jobs from the words in their role (`jobsFromRole()` in `tools/build-people.mjs`). A title that belongs to someone else does not count, so "Father of King Saul" or "Priest under King Ahaz" gives no crown. The icons are SVG symbols at the top of `index.html` (`#job-king` ...), drawn in the colour of the name beside them.

## Shareable links

The address in the browser keeps what is on screen, so a study can be bookmarked or sent: `#p=david,solomon&y=-1050&z=4` opens those people's windows (the last one in front) with 1050 B.C.E. in the middle of the screen, zoomed to 4 times the whole-timeline view. It is updated as you move, zoom and open or close windows (`syncHash()` in `js/app.js`, using `history.replaceState`, so the Back button is not filled with every step).

The link button at the top of a window copies a short link to that person (`#p=moses`), which opens their window and shows them on the timeline. If the person is hidden by the viewer's People filter, the filter goes back to Everyone.

## Bible books band

The book button in the top bar (next to the People button) shows the 66 books of the Bible as lines just above the main line; the people move up to make room. The choice is remembered in the browser (`bt-books`) and kept in shared links (`&b=1`).

- **Lines:** each book spans the years it covers, from the *New World Translation* "Table of the Books of the Bible" (writer, place written, writing completed, time covered). The table gives one span for 1 and 2 Kings together and one for 1 and 2 Chronicles together, so each pair is drawn as one line ("1 Kings · 2 Kings"). A book the table gives no span for runs between its events (Ruth, Jonah, Malachi), or is just a mark at the year its writing was completed (Psalms, Proverbs, the letters).
- **Completed:** a hollow diamond (drawn under the event dots, so a dot in the same year sits inside it) marks the year the writing was completed (the table's "writing completed", `done`). Where that is later than the end of the span (Genesis, Judges, Chronicles, Ezra, the Gospels), a dotted tail runs from the line's end to the diamond; otherwise the diamond is the line's end. The tail counts as part of the book when the rows are packed.
- **Several writers:** 1 Samuel, Psalms and Proverbs list who wrote which part (`parts`) and who finished the book long after its first writer died (`by`), from *"All Scripture Is Inspired of God and Beneficial"* (Bible Book Numbers 9, 19, 20) and the superscriptions of the Psalms. Every other book's writers were alive in its completion year.
- **From a writer's window:** "Bible books written" lists every book the person wrote or had a part in (from `w`, `parts` and `by`); clicking one turns the band on, zooms to the book and opens its card beside the window.
- **Rows:** seven rows on a computer, six on a phone (`bookRows` in `layout()`), filled nearest the main line first in book order. No book is ever left out: a book with no room for its name is drawn as its line alone (its name is on its card), and where even that has no room, a small "+3" chip stands for the books there; its card lists them (each opens its own card, zoomed in) and clicking the chip zooms in on them. A name whose line starts off the left edge stays at the edge; when there is no room for a name before its line (Acts begins where the four Gospels end), it goes after the line.
- **Dots:** each book's main events, drawn like the activity dots on an open lifespan. Hover (or tap) for the activity, click (or tap again) to open it in the person's window. A dot that is a major event (for example the Exodus) shows the event's tooltip and zooms to it.
- **Card:** hovering a book name (or tapping it) shows its card: for the books the handbook *God's Word Is Truth* covers so far, a line on the book's main subject; then the writer (click to open their window), where and when it was written, the time covered, its main events (each clickable), a link to read the book on wol.jw.org and, where there is one, a link to the book's chapter in *God's Word Is Truth*. When the card is short of room (on a phone it sits under the main line), everything between the title and the links scrolls. The card sits above the band (or under the main line when there is too little room there), so it never covers a book's line or dots; a long list of events scrolls inside it. Click the book (or tap again) to open it as a window.
- **Window:** a book's window works like a person's (`bookWindowHTML()` and `wireBookWindow()` in `js/app.js`): it can be dragged, folded into the dock and closed, and has the same star, locate, link, fold and close buttons (`winBtns()`). It shows the card's details, a **My notes** box and the main events; hovering an event lights up its dot on the band (`setBookHL()`), and clicking one opens it. Locate turns the band on and zooms to the book. A book's id is `book-<Bible book number>` (Genesis `book-1`, Psalms `book-19`), used in notes and links: `#p=book-19` opens the Psalms window with the band on. Book windows do not get a lifespan track or move the Places map.

The data is in `data/books.js` (hand-editable). `focus` is the subject line in English and Chinese, written for this site from the handbook's chapter, and `gwt` is that chapter's document number on wol.jw.org. A dot is either `"person-id:n"`, the person's n-th activity in `data/people.js` (counting from 0, before the activities are sorted), or `"e:event-id"` from `data/events.js`, so its text and scripture come from there in both languages.

## My notes and bookmarks

The star at the top of a person's or a book's window bookmarks them, and the **My notes** box in the window keeps the visitor's own notes (saved as they type). Both are stored only in that browser (`localStorage` key `bt-notes`, `{ id: { s: starred, n: note, t: last change } }`); nothing is sent anywhere, and clearing the browser's data removes them.

- **My bookmarks** in the People menu shows only the starred people (it follows the same zoom rule as the other modes), and on the books band only the starred books.
- **My notes and bookmarks** in the People menu lists everyone with a star or a note in timeline order, then the books in the order they were completed; click a name to open their window. **Download** saves them as a text file, **Load** reads such a file back in (to move notes to another device or restore them), and **Print** prints just the list.
- **The file:** a readable list, then one `BFT-NOTES {…}` line with the same notes as data, which is what Load reads. Loading merges: a bookmark on either side stays, and when both sides have different notes for a person both texts are kept, the newer first, so nothing is lost.

## Read more

Under the key scriptures, a person's window lists where to read more about them, each a link that opens in a new tab on wol.jw.org: their article in *Insight on the Scriptures* (2,678 people), every chapter about them in *Imitate Their Faith* (23 chapters) and *Walk Courageously With God* (54 chapters), with the chapter number and title, and for a Bible writer the chapter about their book in *God's Word Is Truth—A Handbook to the Bible* ("Bible Book 26: Ezekiel"). In Chinese the links open the Chinese editions (《洞悉聖經》, 《信心的榜樣》, 《鼓起勇氣與上帝同行》) with their Chinese titles. A wol.jw.org document has the same number in both languages, so one number serves both.

The links are in `data/reading.js` (hand-editable): the chapter list says which people each chapter is about, and the Insight list maps a person's id to their article. Chapter numbers and titles were read from the books' contents pages on wol.jw.org (2026-10-20).

## Chinese (中文)

The settings button (the gear in the top bar) switches the whole site between English and Traditional Chinese (繁體中文). The choice is remembered in the browser (`localStorage` key `bt-lang`); a first visit from a browser set to Chinese opens in Chinese. Switching reloads the page.

In Chinese everything a visitor reads is Chinese: the interface, years (公元前1943年), every person's name, role, meaning, summary, notes and activities, the major events and eras, place names and notes, and the map labels. Scripture citations show the Chinese book names (創世記2:7) and open the Chinese *New World Translation* Study Edition on wol.jw.org (`https://wol.jw.org/cmn-Hant/wol/b/r24/lp-ch/nwtsty/<book>/<chapter>#v=…`); a person's sources line links to their article in Chinese *Insight* (洞悉聖經). Search finds people by their Chinese or English name.

Sources for the Chinese text:
- **Names** of people and places follow the current Chinese *New World Translation* (the verses on wol.jw.org, `cmn-Hant/wol/b/r24/lp-ch/nwtsty`). Each person's name was first taken from the title of their Chinese *Insight* article (same article id as the English one), then checked against the Chinese text of the verses the person appears in. Where the two differ (the Bible revision changed some spellings, e.g. Delilah 黛利拉, Ehud 以戶, Nun 努恩), the Bible's spelling is used.
- **Terms** follow the Chinese *New World Translation* and its glossary (聖經詞語解釋), e.g. 神聖力量, 聖幕, 部族, 士師.
- **Summaries, roles, activities, notes and events** were translated for this site from the English text, in the wording of those sources.

The Chinese text lives in `data/zh/` and is loaded only when the site is in Chinese:
- `data/zh/people.js`: one line per person id with `n` name, `r` role, `m` meaning, `s` summary, `note`, `fam`, `e` activities (same order as `data/people.js`), `rn` relatives' names, `aka`, and `src` (the Chinese *Insight* article: document id and title). Edit freely; if you rebuild `data/people.js`, new people show in English until a line is added here.
- `data/zh/places.js`: places, events, eras, terrain names, map tab and sea names, and the activity texts that `data/places.js` adds.
- `js/i18n.js`: the language switch and all interface strings (`ZH_UI`). In `js/app.js`, `T(key, vars, English)` gives the Chinese string when the site is in Chinese.

Chinese characters fall back to Noto Sans TC / Noto Serif TC (Google Fonts, loaded only in Chinese); Latin letters and numbers keep the site's own fonts.

## Places map

On a computer, a **Places** map window opens on the left beside the person windows. It shows the places of the window in use: click another person's window and the map switches to them. Its minimize button folds it to a "Map" chip in the dock, and the chip brings it back. Each place has a numbered pin in the order of the person's life, and a dashed line joins them. The places are part of **Major activities**: an activity that happened somewhere carries a small place tag with its pin number, and the places the Bible names that were not already activities (Isaac in Gerar, Paul at Paphos) are added to that list, so there is one list. Point at an activity or a pin and the pin lights up, with the place's name, how sure the site is and the reason under the map. The line under the map keeps the last place pointed at (tapped, on a phone) and ends with a link that opens that spot in Google Maps, satellite view, in a new tab (the Google Maps app on a phone); it reads "Open in Google Maps" for a certain site and just "Google Maps" for a likely or uncertain one, since there the pin is the proposed spot, not a certain one. Click a pin to scroll the window to the activities there, and click a place tag to see it on the map. Places closer together than a pin (Jericho and Gilgal; Hebron, Mamre and the cave of Machpelah) are pushed apart just enough that each keeps its own numbered pin and name, in the same direction from its neighbours, with a fine line back to a small dot where the place really is; a name with no room beside its pin sits a little farther out on a fine line. When a life ranges beyond the land, a switch picks between the first map and a closer map of the land. Each small area where three or more places crowd together gets its own close-up (Jesus has one for Judea and one for Galilee), and inside a close-up, places only a few km apart get a closer map still (Jerusalem: Jerusalem, the Mount of Olives, Bethany and Bethlehem; Hebron for Abraham), up to five maps per person, in the order the person first went there. On a wider map each closer map is a dashed box with its name, which opens it; a region map that would add only a place or two to the close-up is left out, so Joshua's Canaan map is just Jericho to Shechem and Kadesh stays on the first map. The first map is **Journey** for a life that went far from home (Abraham from Ur, Paul to Rome) and **All** otherwise. The names are kept short so the switch stays on one line, even on a phone (it scrolls sideways only on the narrowest phones); hovering a button shows its full name. The closer maps take the name the land had in the person's day: Canaan before the kings, Israel under Saul, David and Solomon, Israel and Judah after the split, and Galilee, Samaria and Judea in Jesus' day, joined with + (Galilee + Judea) (a close-up around Jerusalem is Judea); a map mostly outside the land before the kings (Moses at Kadesh and in Moab) is Near Canaan, and a close-up with no fitting name is named for the place visited most there (Cherith). The map turns by itself to follow the activities: pointing at an activity (tapping it on a phone) shows the closest map that has its place. The rule is `BibleMap.levels()` in js/map.js. The dots on a person's lifespan do the same: pointing at an activity dot on the timeline (while the person's window is open) or on the lifespan bar at the top of the window lights its place, with its distances, and turns the map to it, and on a computer the map window turns to that person; on a phone, where the window covers the lifespans, tapping a timeline dot twice opens the window at that activity with its place on the map (`pointAct()` and `wirePlaces()` in js/app.js). The map moves between its maps so the eye can follow: going to a closer map, the place (and the dashed box of the closer map) lights up on the map you are on, and the view then zooms into it (Abraham from 5 Egypt to 6 Hebron: Hebron's pin and the Canaan box light up on the Journey map, then the view zooms in to Hebron); going back out, the view zooms out and the box you came from and the new place light up; between two close-ups side by side (Galilee and Jerusalem) the view moves across. While a map is blown up its pins, names, lines and dashes stay their usual size on screen (they spread apart, as on a real map), so the zoom lands without a jump. It takes about half a second, a newer move cancels one still under way, and with the system's reduce-motion setting on, the map simply switches. The code is `setMapView()` in js/app.js. On a phone there is no room for a second window, so the map sits in the person's window and stays pinned under the lifespan bar while the activities scroll; the ▴ button (Hide map) folds it to give the list the room. Every major event with a known place also shows a small locator map in its tooltip. A dashed pin means the location is uncertain (its place tag ends in "?"). A person with only one place (Job in Uz, Noah at Ararat) gets a wider map so the place has its surroundings. People the Bible gives no locatable place for (Cain's land of Nod, most of those before the Flood) have no map.

**Landscape.** The maps show the main landscape, not every hill: mountain ranges as rows of small peaks (Lebanon, Anti-Lebanon, Taurus, Zagros, the hill country of Judah and Ephraim, Gilead, Mount Seir), single mountains as a small triangle (Hermon, Tabor, Gilboa, Ebal and Gerizim, Nebo, Sinai), deserts as a fine stipple (the Syrian and Arabian Deserts, the wildernesses of Shur, Paran, Sin and Judah, the Negeb), and the names of rivers, valleys and plains (Jordan Valley, Jezreel Valley, Plain of Sharon, Shephelah, Arabah) and highlands (Bashan, Gilead, Moab, Edom). Each feature shows only at a zoom where it helps: the whole Fertile Crescent shows the great ranges and deserts, a close-up of Galilee shows Mount Tabor and the Jezreel Valley, and a close-up of a few towns (around Jerusalem) shows none of the ranges. A feature never covers a pin or a name, and a mountain that is one of the person's places is shown only as its pin. The features are `data/terrain.js`, traced by hand from the *New World Translation* appendix maps (B2, B3, B4, B7, B10, B13), so they are approximate; `terrain()` in `js/map.js` draws them.

**Routes.** The line between two places follows the way people went, not a straight line. Each leg takes the shortest way along a network of the ancient roads drawn on the NWT appendix maps: the Euphrates road and the road through Syria (B2), the Way of the Sea and the King's Road (B2), the ridge road through the hill country, the Jordan Valley road and the Jericho road (B10), the Way of Beth-horon and the valleys to the coast (B4, B7), the Way to Shur and the Way to Mount Seir (B2, B3), and Paul's roads through Asia Minor, Macedonia and Greece (B13). Some legs are given whole: the Exodus follows B3's "Possible Route of Exodus" (Red Sea, Marah, Elim, Sinai, Kadesh, around Edom to the plains of Moab), and Paul's voyages follow B13 and the stops Acts names (Seleucia to Salamis, past Cnidus, Crete and Cauda to Malta, Syracuse, Rhegium and Puteoli). Where no source shows the way, the usual walking or sailing route of the region is used and marked "common route": along valleys and coasts, around the seas and the heads of the gulfs (Moses to Midian, Babylon to Susa, Apollos from Alexandria). A place off the roads (Mount Tabor, the Mount of Olives) is joined to the nearest road towns. A leg taken more than once is drawn once. **Distances.** When a place lights up (pointing at it or at one of its activities, tapping on a phone), each leg of the route from or to it shows its length beside it, in the route's colour: for Abraham, Haran shows ~990 km to Ur and ~710 km on to Shechem. The length is measured along the drawn way, not as the crow flies, and rounded with a ~ since the routes are approximate (to half a km under 10 km, to the km under 30, to 5 km under 300, else to 10). A number sits near the middle of its leg where it covers no pin, name, route or closer map's box; a leg too short on a map for its number shows it on the closer map. The code is `distLabels()` in `js/map.js`. Names keep off the routes: a place name moves to another side of its pin, or farther out on a fine line (never nearer another pin than its own), and only crosses a route when no spot is free; names of seas, landscape and closer maps move a little or are left out, and the small mountain marks skip the route. The Google Maps directions service could not be used for the fallback, since it needs a paid API key that a site without a server cannot keep secret. The data is `data/routes.js` (hand-written: `ROADS`, waypoints in `ROUTE_WAY`, and whole legs in `TRAVELS`, each with its source); `BibleMap.way(from, to)` in `js/map.js` finds the way and lists the source of each piece. Of the 191 legs on the maps, 124 follow source maps and roads only, 33 are mostly sourced with a short common-route link to a town off the roads, and 34 rely on common routes for a large part.

The data is `data/places.js`, written by hand and easy to edit:

- `BIBLE_PLACES` lists each place with its longitude and latitude, how sure the location is (`known`, `likely`, `possible`) and a note on how it is identified.
- `PERSON_PLACES` lists each person's places in order. `["haran", 0]` ties activity 0 of that person in `data/characters.js` to Haran; `["ur", -2018, "Grows up in Ur of the Chaldeans", "Genesis 11:28, 31; Acts 7:2"]` adds a place that is not one of the activities; the site shows it as an activity too.
- `EVENT_PLACES` gives the place of each major event in `data/events.js`.

**Where the locations come from.** Which place goes with which activity comes from the scripture cited for it. The coordinates come from the [OpenBible.info Bible Geocoding Data](https://github.com/openbibleinfo/Bible-Geocoding-Data) (CC BY 4.0), which also scores how confident scholars are; each place keeps its OpenBible id (`ob`), so you can look it up at `https://www.openbible.info/geo/ancient/<ob>`. Disputed sites were checked against *Insight on the Scriptures* on wol.jw.org and the maps in the *New World Translation* (nwt_E.pdf: Appendix A7 maps 1 to 6 and maps B2, B3 and B10), and where they prefer another site, that site is used: Kadesh at ʽAin Qedeis, Mount Sinai at Ras Safsafa (traditional site), Mount Hor at Jebel Madurah, Samuel's Ramah at Rentis, Cana at Khirbet Qana, the Red Sea crossing near the north end of the Gulf of Suez, the transfiguration probably on Mount Hermon, and Sodom at the south end of the Salt Sea. Two places OpenBible gives no point for are placed from *Insight* alone and marked uncertain: the land of Uz (Job) east of the Promised Land near Edom, in northern Arabia, and Eden (Adam and Eve) at its traditional site just south of Lake Van. 78 of the 125 places are certain, 19 likely and 28 uncertain.

The base map (`data/basemap.js`, generated) is the Natural Earth 1:10m coastline (public domain) with the Jordan, Euphrates, Tigris and Nile, the Dead Sea and the Sea of Galilee from OpenBible.info (from OpenStreetMap). The coastline and lakes are today's, so the Dead Sea and the head of the Persian Gulf look as they do now, not as they did in Bible times. `tools/build-basemap.mjs` rebuilds it; its first lines say what to download. The drawing code is `js/map.js`; the wiring is in `js/app.js`: `mapViews()` draws a person's maps, `syncMap()` keeps the map window on the window in use, `wirePlaces()` and `wireMapBox()` link pins and activities, and `showTip()` draws the event locator.

## Folding and closing all windows

While any window is open, the dock at the bottom of the screen starts with two buttons. **Fold all** minimizes every window into the dock (it then reads **Unfold all** and brings them all back), and **Close all** closes every window and its track, so the colours start again from teal. Minimized windows sit in the dock next to them as name chips. On a phone, dragging or pinching the timeline folds any open windows into the dock by itself, so the timeline is never hidden behind them; tap Unfold all or a name chip to bring them back. The code is `syncDockAll()` in `js/app.js`.

## Sources

- **People, relationships and scriptures:** *Insight on the Scriptures*, volumes 1 and 2 (it-1_E.pdf, it-2_E.pdf). Every person article was extracted, one record per numbered sense, into `data/source/insight-people.json`.
- **Line of descent:** Luke 3:23-38 and Matthew 1:1-16, from the *New World Translation Study Edition* (nwtsty1_E.pdf) and the matching Insight articles.
- **Places:** OpenBible.info Bible Geocoding Data (CC BY 4.0) for coordinates, checked against *Insight on the Scriptures* and the maps in the *New World Translation* (nwt_E.pdf). Coastline: Natural Earth (public domain). Roads, routes and landscape: the NWT appendix maps B2, B3, B4, B7, B10 and B13 and the Bible accounts (Acts 13-28 for Paul's voyages), with common routes where they show none. See [Places map](#places-map).
- **Unnamed people:** `data/source/unnamed-people.json`, written by hand from the verses each record cites (see [People the Bible does not name](#people-the-bible-does-not-name)).
- **Added people:** `data/source/added-people.json`, people who have an Insight article that is missing from the extracted list, in the same shape: Azariah (Abednego), Daniel's companion (Daniel 1:6, 7; 3:12-30). `"solo": true` marks a record no other record's relatives may be matched to by name, so a namesake's father is not given to them.
- **Key figures and events:** `data/characters.js` and `data/events.js`, written by hand from the same sources.
- **History between the Testaments:** *Insight on the Scriptures* (articles such as "Herod," "Greece," "Syria," "Rome" and "Festival of Dedication"), *Pay Attention to Daniel's Prophecy!* (chapters 9, 13 and 14), *The Watchtower* (November 15, 1998, "Who Were the Maccabees?", and June 15, 2001, "The Hasmonaeans and Their Legacy") and the NWT study note on John 10:22, all on wol.jw.org. Each item names its own source. See [History between the Testaments](#history-between-the-testaments).
- **Dates checked against:** the *New World Translation* (nwt_E.pdf): the table of Bible books (when each book was written and the years it covers), Appendix A6 (chart of the kings and prophets of Judah and Israel) and Appendix A7 (main events of Jesus' life); *Walk Courageously With God* (2025), whose section timelines give approximate life spans for the people in its 54 chapters; *Imitate Their Faith*, whose opening timeline dates Ruth, Hannah, Abigail, Elijah, Jonah, Esther and others; and *"Bearing Thorough Witness" About God's Kingdom* for the dates in Acts. Where a key figure's date is not recorded in the Bible and one of these books gives an approximate year, the site uses that year and the person's window note names the source. Where they differ from older *Insight* dates, the newer NWT chart is followed (Hezekiah died in 716 B.C.E., Manasseh in 661 and Josiah in 628, as in Appendix A6 and *Walk Courageously With God*).
- **God's Word Is Truth—A Handbook to the Bible** (2026, on wol.jw.org; Chinese 《上帝的話語就是真理：聖經導讀》). It is published a few chapters at a time; read so far (2026-10-20): Bible Books 26-29, Ezekiel, Daniel, Hosea and Joel. Every date in their timelines and tables is on the site: the dated prophecies of Ezekiel (612, 611, 609, 607, 607/606, 605, 593, 591 B.C.E.), the events of Daniel's life (618 first siege, about 606 the image dream, after 600 the tree dream, 553, 551, 539, 537, 536), the "70 weeks" (455 B.C.E. to 36 C.E.) and the "seven times" from 607 B.C.E. in the event texts, Hosea's book completed between 745 and 740 B.C.E., and Joel's about 820 B.C.E. Where it gave a different year from the site, the handbook, as the newest source, is followed: Nebuchadnezzar's dream of the image about 606 (was 605), the lions' pit in 539 (was 538), Cyrus freeing the Jews in 537 (was 538) and Daniel's vision of the ram and the goat in 551 (was 553); and the 593 B.C.E. vision in Ezekiel is the temple of chapter 40, not the dry bones of chapter 37. The books' subject lines, the people's summaries and notes are written for this site in our own words from its chapters.

Every birth and death year has one of three labels, shown in the legend and in each window: **from Bible ages** (worked out from ages and reign lengths the Bible states, on the *Insight* chronology; solid dot), **estimated** (the Bible or one of the books above gives a clue but no exact year, such as an age at death; ring with a small dot) and **assumed** (no source gives the year, so the site places it by generation; dashed ring). The labels are set in `data/characters.js` for key figures and in `tools/build-people.mjs` for everyone else.

Most minor people have no recorded dates. Their place on the timeline is an assumed date, placed by their generation or the period in which they appear, and their window says so. `data/ASSUMED_DATES.md` lists every assumed date. Because each placeholder is set on its own, the build then checks every parent and child: a father or mother whose placeholder life ends before a child is born either lives on to the birth (when the age stays believable for that era), or the parent's or child's placeholder is moved by up to 100 years. Dates from the Bible, the books above, key figures and `overrides.json` never move. Links still left with a gap (22 of them, listed by `node tools/build-people.mjs --gaps`) are mostly 1 Chronicles lists where "son of" means a later descendant (Mica son of Zabdi son of Asaph, Nehemiah 11:17) or "father of" names a town's founder.

## Project layout

```
index.html                  page
css/style.css               styles
img/favicon.svg             browser-tab icon (tree logo)
js/portrait.js              procedural line-art portraits
js/i18n.js                  language switch (English / 中文) and interface strings
js/scripture.js             scripture citations → wol.jw.org links (English or Chinese Bible)
js/map.js                   the small place maps in windows and event tooltips
js/app.js                   timeline, windows, search, People filter
data/characters.js          140 key figures (hand-written)
data/events.js              events and eras
data/history.js             events and sources from history, not the Bible (hand-written)
data/places.js              places of key figures and events (hand-written)
data/basemap.js             coastline, rivers and lakes for the maps (generated)
data/routes.js              ancient roads and travel routes for the maps (hand-written)
data/terrain.js             mountains, deserts and valleys for the maps (hand-written)
data/people.js              all people (generated, do not edit)
data/reading.js             "Read more" links: Insight articles and study-book chapters (hand-written)
data/books.js               Bible books band: writer, place, years and main events of each book (hand-written)
data/zh/people.js           Chinese text for every person (hand-editable)
data/zh/places.js           Chinese text for places, events, eras and map labels
data/ASSUMED_DATES.md       generated list of placeholder dates
data/source/jobs.json       job icons set by hand (key figures, Bible writers, patriarchs)
data/source/                extracted Insight records, unnamed people and manual overrides
tools/build-people.mjs      builds data/people.js
tools/build-basemap.mjs     builds data/basemap.js
```

## Rebuild the people data

After editing `data/characters.js`, `data/source/insight-people.json`, `data/source/history-people.json`, `data/source/activities.json` or `data/source/overrides.json`:

```sh
node tools/build-people.mjs
```

`node tools/build-people.mjs --matches` lists which Insight article each key figure was linked to, so a wrong link (a namesake) is easy to spot and fix in `overrides.json`.

The script merges the curated key figures with the Insight records, links relatives in both directions, finds the Adam-to-Jesus line, fills in placeholder dates and writes `data/people.js` and `data/ASSUMED_DATES.md`. It prints any key figures or line names it could not match.

`data/source/overrides.json` fixes matches by hand. Supported keys:

- `curated`: `{ "key-figure-id": "INSIGHT#N" }` forces a match, or `null` to stop one.
- `drop`: Insight keys to leave out (duplicates such as AMMON, the same man as Ben-ammi, and JEDIDIAH, Solomon's other name).
- `same`: `{ "INSIGHT#N": "INSIGHT#M" }` merges two Insight records of one person into the second, keeping both names (`"MISHAEL#2": "MESHACH"`). Thirteen such pairs are merged, all Insight records of one person under two names: Mishael/Meshach, Saul/Paul, John Mark/Mark, Joseph/Barnabas, Bartholomew/Nathanael, Thaddaeus/Judas, Simon the Zealous One/Simon the Cananaean, Levi/Matthew, Hoshea/Joshua, Hoshea/Hosea, Belteshazzar/Daniel, Chileab/Daniel and Naomi/Mara.
- `line`, `notLine`: person ids to add to or remove from the Adam-to-Jesus line.
- `tier`: `{ "id": 1-4 }` sets how far you must zoom in before a person appears (1 is always shown).
- `dates`: `{ "id": [born, died] }` replaces a placeholder life span that the generation estimate gets wrong (Ruth's family, for example: Obed is born when Ruth marries Boaz, not a generation later). Jesse is set here too: he must be alive at David's birth (1107 B.C.E.) and while David was a fugitive (1 Samuel 22:3, 4), and his father Obed was born in Ruth's day, so both lives are long.
- `notes`: `{ "id": "text" }` adds a window note to a person who is not a key figure, for example to explain an estimated date.
- `events`: `{ "id": [[year, "text", "scripture"], ...] }` gives activities to a person who is not a key figure (Joel, Gomer, Belshazzar, Darius the Mede). Their Chinese text goes in the person's `e` list in `data/zh/people.js`, in the same order.
- `unlink`: `{ "id": { "children": ["other-id"] } }` removes a wrong family link in both directions (Drusilla's son Agrippa had been matched to Herod Agrippa I, her father).
- `relNames`: `{ "id": { "children": ["Name"] } }` lists a relative by name only, with no link (Drusilla's son Agrippa, who has no record of his own).

## Activities of minor people

`data/source/activities.json` gives major activities to people who are not key figures, so that a person whose window tells what they did also shows it on their lifespan (Herod Agrippa I, Nicodemus, Laban, the men who rebuilt Jerusalem's wall). It covers about 770 people; with the key figures, history people and `overrides.json`, 989 of the 2,795 people now have activities. People known only from a genealogy, or only by an office with nothing they did, have none. The file has four parts:

- `people`: `{ "id": [[year, "text", "scripture", { "c": 1, "p": "place-id", "zh": "Chinese text" }], ...] }`. `c: 1` marks an approximate year, which shows as "c." before the year in the window and the dot's tooltip. `p` is a place id from `data/places.js`, so the activity carries a place tag and a pin on the person's map. `zh` is the Chinese text (no need for a line in `data/zh/people.js`). A string instead of a list names an entry in `shared`.
- `shared`: one activity done by many people together (the men who joined David at Ziklag, those who returned with Zerubbabel in 537 B.C.E., the builders of each part of the wall in Nehemiah 3).
- `dates`: placeholder life spans moved so that they take in an activity (Laban must be alive when Jacob leaves him in 1761 B.C.E.); merged into the `dates` of `overrides.json`.
- `about`: notes on the format.

Years follow the key-figure dates where the activity involves a key figure (Absalom's revolt, Nehemiah's wall), otherwise *Insight on the Scriptures* and the chart of dates in the *New World Translation* (Appendix A6, A7); where the Bible gives no year the activity is placed by the events around it and marked approximate. The texts are short summaries in the site's own words. The build warns about any activity that falls outside the person's life.

## Hosting

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to the default branch. To turn it on once, open the repository's **Settings → Pages** and set **Source** to **GitHub Actions**.

While publishing, the workflow adds the commit to every script, stylesheet and icon link in `index.html` (for example `js/app.js?v=9c834ba`). GitHub Pages lets browsers keep files for 10 minutes, so without this a reload right after a deploy could still run the old code.

## Known gaps

- Eight key figures are not linked to an Insight article yet (Nimrod, Abraham, Ehud, Barak, Goliath, Jeremiah, Zechariah the priest, Mary Magdalene), so they show only their hand-written family. The extracted Insight records have no entry for the judge Ehud or the prophet Jeremiah, so they are left unlinked rather than tied to a namesake.
- Three names in Luke's list (Maath, Naggai, Amos) are not on the line yet.
- The years of the Judges are uncertain: the periods the book of Judges gives add up to more than the time between the entry into Canaan (1473 B.C.E.) and Saul (1117 B.C.E.), so some overlapped. The site keeps Jephthah at about 1173 B.C.E. (Judges 11:26), places Gideon at least 88 years earlier (Judges 8:28; 9:22; 10:2-3) and Deborah 47 years before Gideon, and lets Ehud's 80 years of rest overlap. Ruth, Naomi and Boaz follow *Insight* and *Imitate Their Faith* (about the 14th century B.C.E.), which leaves a long gap from Obed to Jesse.
