# Bible Family Tree

An interactive timeline of every named person in the Bible, from Adam to the apostles. Zoom and drag along the years, hover over a person to see lines to their family, and open a person's window for their dates, relatives and key scriptures.

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
| Everyone | All 2,737 people, including 34 the Bible does not name (see below). Minor people appear as you zoom in. |
| Key figures | 201 people: the 140 hand-written key figures plus everyone on the Adam-to-Jesus line. |
| Adam to Jesus line | Only the 97 ancestors in Luke 3:23-38 and Matthew 1:1-16. |

All three modes follow the same zoom rule: fully zoomed out you see only the timeline and its events, and people appear as you zoom in, the most important first. The Key figures and Adam-to-Jesus modes show their people a little sooner, since fewer people compete for space.

Searching for a person who is hidden by the current mode switches to Everyone. The choice is remembered in the browser.

On a phone the search box opens across the top bar, so the site title and the People button are hidden while it is open and come back when it closes (a CSS rule in the phone section of `css/style.css`). On a computer the search box sits beside the title and nothing is hidden.

## People the Bible does not name

The people list is built from the person articles in *Insight on the Scriptures*, and Insight writes an article only for a name. So people the Bible never names were missing, and their families had gaps: Ammon (Ben-ammi) had no mother. `data/source/unnamed-people.json` adds 34 of them, in the same shape as the Insight records, with a label for a name ("Lot's younger daughter", "Noah's wife", "Pharaoh of the Exodus") and the verses that mention them. A person is included when they have a clear family link to someone on the timeline (the wives of Cain, Noah, his sons, Lot, Potiphar, Manoah, Job, Jeroboam, Isaiah, Ezekiel, Peter and Pilate; Lot's daughters; Jephthah's and Jairus' daughters; Paul's sister and nephew) or a notable part in a Bible account (the Pharaohs of Joseph's day and of the Exodus, the Pharaoh's daughter who adopted Moses, the queen of Sheba, the widow of Zarephath, the Israelite girl in Naaman's house, the medium of En-dor, the Samaritan woman, the poor widow, the evildoer beside Jesus, the Ethiopian eunuch). Anonymous crowds, unnamed children and passing mentions are left out. A few unnamed people already had an Insight article and were there before (the Shunammite woman). Their windows cite only the Bible, not *Insight*.

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

A key figure's window has a **Contemporaries** list under Family: the other key figures whose lifespans overlap theirs (Joshua, Caleb and Jethro in Moses' window), family left out since it is listed just above, and the people who shared the most years first. It is folded by default, so it adds one line until opened, and shows the first 8 names with a **Show all** button for longer lists (Paul has 29). Click a name to open that person. Most of these people have dates estimated from their generation, so the list is a guide, not a fact; their name chips have a dashed border and their tooltip says the overlap is approximate. Only key figures get the list and only key figures are in it, since a list from all 2,700 people would be hundreds of names long (Moses overlaps 299 people) and almost all on placeholder dates. The code is `contemporariesHTML()` in `js/app.js`.

Family links (the dashed curves shown while hovering a person) are coloured by sex at each end: blue for a man, rose for a woman, blending from one to the other along the line, and both the hovered person's dot and each relative's dot get a ring in their colour. So a father's links to his sons end in blue and to his daughters in rose. The 16 Insight entries whose sex is unknown (`gender: "u"`, for example Gog and Junias) keep a gold end. The two colours are `--male` and `--female` in `css/style.css`.

Gold marks people you are only hovering over. Every opened person gets their own colour (sea green, terracotta, lavender, sage, ivory; no blue or rose, since those mean man and woman on the family links), used for their window, track and ring on the timeline, so an opened person never looks the same as one that is not opened. The palette is `COLORS` in `js/app.js`.

## Scripture links

Every scripture citation in a person's window (the major activities, key scriptures, and any citation in the summary, note or family line) is a link. Clicking it opens that passage in a new tab on the Watchtower ONLINE LIBRARY Bible (wol.jw.org, *New World Translation* Study Edition), with the cited verses highlighted. A citation with several parts links each part: in "Genesis 2:7, 19-20" both "Genesis 2:7" and "19-20" are links, and in "Genesis 47:28; 49" the "49" opens Genesis 49. A chapter-only citation such as "Genesis 27-28" opens its first chapter. Clicking a citation in an activity opens only the passage; clicking elsewhere on the activity still jumps the timeline to it. The links look like the plain citations until you hover (a faint underline marks them on phones). The parsing is `js/scripture.js`; links have the form `https://wol.jw.org/en/wol/b/r1/lp-e/nwtsty/<book>/<chapter>#v=<book>:<chapter>:<verse>-<book>:<chapter>:<verse>`, the same form wol.jw.org uses for its own verse links.

## Places map

On a computer, a **Places** map window opens on the left beside the person windows. It shows the places of the window in use: click another person's window and the map switches to them. Its minimize button folds it to a "Map" chip in the dock, and the chip brings it back. Each place has a numbered pin in the order of the person's life, and a dashed line joins them. The places are part of **Major activities**: an activity that happened somewhere carries a small place tag with its pin number, and the places the Bible names that were not already activities (Isaac in Gerar, Paul at Paphos) are added to that list, so there is one list. Point at an activity or a pin and the pin lights up, with the place's name, how sure the site is and the reason under the map. The line under the map keeps the last place pointed at (tapped, on a phone) and ends with a link that opens that spot in Google Maps, satellite view, in a new tab (the Google Maps app on a phone); it reads "Open in Google Maps" for a certain site and just "Google Maps" for a likely or uncertain one, since there the pin is the proposed spot, not a certain one. Click a pin to scroll the window to the activities there, and click a place tag to see it on the map. Places closer together than a pin (Jericho and Gilgal; Hebron, Mamre and the cave of Machpelah) are pushed apart just enough that each keeps its own numbered pin and name, in the same direction from its neighbours, with a fine line back to a small dot where the place really is; a name with no room beside its pin sits a little farther out on a fine line. When a life ranges beyond the land, a switch picks between the first map and a closer map of the land. Each small area where three or more places crowd together gets its own close-up (Jesus has one for Judea and one for Galilee), and inside a close-up, places only a few km apart get a closer map still (Jerusalem: Jerusalem, the Mount of Olives, Bethany and Bethlehem; Hebron for Abraham), up to five maps per person, in the order the person first went there. On a wider map each closer map is a dashed box with its name, which opens it; a region map that would add only a place or two to the close-up is left out, so Joshua's Canaan map is just Jericho to Shechem and Kadesh stays on the first map. The first map is **Journey** for a life that went far from home (Abraham from Ur, Paul to Rome) and **All** otherwise. The names are kept short so the switch stays on one line, even on a phone (it scrolls sideways only on the narrowest phones); hovering a button shows its full name. The closer maps take the name the land had in the person's day: Canaan before the kings, Israel under Saul, David and Solomon, Israel and Judah after the split, and Galilee, Samaria and Judea in Jesus' day, joined with + (Galilee + Judea) (a close-up around Jerusalem is Judea); a map mostly outside the land before the kings (Moses at Kadesh and in Moab) is Near Canaan, and a close-up with no fitting name is named for the place visited most there (Cherith). The map turns by itself to follow the activities: pointing at an activity (tapping it on a phone) shows the closest map that has its place. The rule is `BibleMap.levels()` in js/map.js. The map moves between its maps so the eye can follow: going to a closer map, the place (and the dashed box of the closer map) lights up on the map you are on, and the view then zooms into it (Abraham from 5 Egypt to 6 Hebron: Hebron's pin and the Canaan box light up on the Journey map, then the view zooms in to Hebron); going back out, the view zooms out and the box you came from and the new place light up; between two close-ups side by side (Galilee and Jerusalem) the view moves across. While a map is blown up its pins, names, lines and dashes stay their usual size on screen (they spread apart, as on a real map), so the zoom lands without a jump. It takes about half a second, a newer move cancels one still under way, and with the system's reduce-motion setting on, the map simply switches. The code is `setMapView()` in js/app.js. On a phone there is no room for a second window, so the map sits in the person's window and stays pinned under the lifespan bar while the activities scroll; the ▴ button (Hide map) folds it to give the list the room. Every major event with a known place also shows a small locator map in its tooltip. A dashed pin means the location is uncertain (its place tag ends in "?"). A person with only one place (Job in Uz, Noah at Ararat) gets a wider map so the place has its surroundings. People the Bible gives no locatable place for (Cain's land of Nod, most of those before the Flood) have no map.

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
- **Key figures and events:** `data/characters.js` and `data/events.js`, written by hand from the same sources.
- **Dates checked against:** the *New World Translation* (nwt_E.pdf): the table of Bible books (when each book was written and the years it covers), Appendix A6 (chart of the kings and prophets of Judah and Israel) and Appendix A7 (main events of Jesus' life); *Walk Courageously With God* (2025), whose section timelines give approximate life spans for the people in its 54 chapters; *Imitate Their Faith*, whose opening timeline dates Ruth, Hannah, Abigail, Elijah, Jonah, Esther and others; and *"Bearing Thorough Witness" About God's Kingdom* for the dates in Acts. Where a key figure's date is not recorded in the Bible and one of these books gives an approximate year, the site uses that year and the person's window note names the source. Where they differ from older *Insight* dates, the newer NWT chart is followed (Hezekiah died in 716 B.C.E., Manasseh in 661 and Josiah in 628, as in Appendix A6 and *Walk Courageously With God*).

Most minor people have no recorded dates. Their place on the timeline is estimated from their generation or the period in which they appear, and their window says so. `data/ASSUMED_DATES.md` lists every assumed date.

## Project layout

```
index.html                  page
css/style.css               styles
img/favicon.svg             browser-tab icon (tree logo)
js/portrait.js              procedural line-art portraits
js/scripture.js             scripture citations → wol.jw.org links
js/map.js                   the small place maps in windows and event tooltips
js/app.js                   timeline, windows, search, People filter
data/characters.js          140 key figures (hand-written)
data/events.js              events and eras
data/places.js              places of key figures and events (hand-written)
data/basemap.js             coastline, rivers and lakes for the maps (generated)
data/routes.js              ancient roads and travel routes for the maps (hand-written)
data/terrain.js             mountains, deserts and valleys for the maps (hand-written)
data/people.js              all people (generated, do not edit)
data/ASSUMED_DATES.md       generated list of placeholder dates
data/source/                extracted Insight records, unnamed people and manual overrides
tools/build-people.mjs      builds data/people.js
tools/build-basemap.mjs     builds data/basemap.js
```

## Rebuild the people data

After editing `data/characters.js`, `data/source/insight-people.json` or `data/source/overrides.json`:

```sh
node tools/build-people.mjs
```

`node tools/build-people.mjs --matches` lists which Insight article each key figure was linked to, so a wrong link (a namesake) is easy to spot and fix in `overrides.json`.

The script merges the curated key figures with the Insight records, links relatives in both directions, finds the Adam-to-Jesus line, fills in placeholder dates and writes `data/people.js` and `data/ASSUMED_DATES.md`. It prints any key figures or line names it could not match.

`data/source/overrides.json` fixes matches by hand. Supported keys:

- `curated`: `{ "key-figure-id": "INSIGHT#N" }` forces a match, or `null` to stop one.
- `drop`: Insight keys to leave out (duplicates such as AMMON, the same man as Ben-ammi, and JEDIDIAH, Solomon's other name).
- `line`, `notLine`: person ids to add to or remove from the Adam-to-Jesus line.
- `tier`: `{ "id": 1-4 }` sets how far you must zoom in before a person appears (1 is always shown).
- `dates`: `{ "id": [born, died] }` replaces a placeholder life span that the generation estimate gets wrong (Ruth's family, for example: Obed is born when Ruth marries Boaz, not a generation later).

## Hosting

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to the default branch. To turn it on once, open the repository's **Settings → Pages** and set **Source** to **GitHub Actions**.

While publishing, the workflow adds the commit to every script, stylesheet and icon link in `index.html` (for example `js/app.js?v=9c834ba`). GitHub Pages lets browsers keep files for 10 minutes, so without this a reload right after a deploy could still run the old code.

## Known gaps

- Eight key figures are not linked to an Insight article yet (Nimrod, Abraham, Ehud, Barak, Goliath, Jeremiah, Zechariah the priest, Mary Magdalene), so they show only their hand-written family. The extracted Insight records have no entry for the judge Ehud or the prophet Jeremiah, so they are left unlinked rather than tied to a namesake.
- Three names in Luke's list (Maath, Naggai, Amos) are not on the line yet.
- The years of the Judges are uncertain: the periods the book of Judges gives add up to more than the time between the entry into Canaan (1473 B.C.E.) and Saul (1117 B.C.E.), so some overlapped. The site keeps Jephthah at about 1173 B.C.E. (Judges 11:26), places Gideon at least 88 years earlier (Judges 8:28; 9:22; 10:2-3) and Deborah 47 years before Gideon, and lets Ehud's 80 years of rest overlap. Ruth, Naomi and Boaz follow *Insight* and *Imitate Their Faith* (about the 14th century B.C.E.), which leaves a long gap from Obed to Jesse.
