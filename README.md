# Bible Timeline

An interactive timeline of every named person in the Bible, from Adam to the apostles. Zoom and drag along the years, hover over a person to see lines to their family, and open a person's window for their dates, relatives and key scriptures.

The site is plain HTML, CSS and JavaScript. There is no build step and nothing to install to view it.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Who is shown

The **People** button in the top bar picks who appears:

| Mode | Shows |
| --- | --- |
| Everyone | All 2,704 people. Minor people appear as you zoom in. |
| Key figures | 195 people: the 134 hand-written key figures plus everyone on the Adam-to-Jesus line. |
| Adam to Jesus line | Only the 97 ancestors in Luke 3:23-38 and Matthew 1:1-16. |

All three modes follow the same zoom rule: fully zoomed out you see only the timeline and its events, and people appear as you zoom in, the most important first. The Key figures and Adam-to-Jesus modes show their people a little sooner, since fewer people compete for space.

Searching for a person who is hidden by the current mode switches to Everyone. The choice is remembered in the browser.

## Era names

The names of the eras (Before the Flood, The Judges and so on) sit at the top of the screen. On a computer a name shows when it fits inside its era's band. Phones are too narrow for that, so there the names stack left to right in up to three rows at the top, and the people start a little lower to make room. The rows are `ERA_ROWS` in `js/app.js`.

## Portraits

Each person's lifespan line starts just after their name, so the name never sits on top of its own line. The gap is sized to the measured name width (re-measured once the web fonts load); see `d.gap` in `render()` in `js/app.js`.

Hovering (or tapping) a person shows their line-drawn portrait in a dark card, always in the same spot: under the lifespan tracks, between the timeline and the bottom controls, so it never sits on top of the names. The card moves down a little as open windows add tracks, and stops above the minimap and the window dock. The placement is `placePortrait()` in `js/app.js`.

## Personal timelines and colours

Each open window adds that person's lifespan as a track under the timeline. The small dots on a track are the person's major activities: hover one (or tap it on a phone) to see its date and text, and click it (or tap it again) to open the person's window scrolled to that activity, which is briefly highlighted.

Family links (the dashed curves shown while hovering a person) are coloured by sex at each end: blue for a man, rose for a woman, gold in the middle, and both the hovered person's dot and each relative's dot get a ring in their colour. So a father's links to his sons end in blue and to his daughters in rose. The 16 Insight entries whose sex is unknown (`gender: "u"`, for example Gog and Junias) keep a plain gold end. The two colours are `--male` and `--female` in `css/style.css`.

Gold marks people you are only hovering over. Every opened person gets their own colour (sea green, terracotta, lavender, sage, ivory; no blue or rose, since those mean man and woman on the family links), used for their window, track and ring on the timeline, so an opened person never looks the same as one that is not opened. The palette is `COLORS` in `js/app.js`.

## Folding and closing all windows

While any window is open, the dock at the bottom of the screen starts with two buttons. **Fold all** minimizes every window into the dock (it then reads **Unfold all** and brings them all back), and **Close all** closes every window and its track, so the colours start again from teal. Minimized windows sit in the dock next to them as name chips. On a phone, dragging or pinching the timeline folds any open windows into the dock by itself, so the timeline is never hidden behind them; tap Unfold all or a name chip to bring them back. The code is `syncDockAll()` in `js/app.js`.

## Sources

- **People, relationships and scriptures:** *Insight on the Scriptures*, volumes 1 and 2 (it-1_E.pdf, it-2_E.pdf). Every person article was extracted, one record per numbered sense, into `data/source/insight-people.json`.
- **Line of descent:** Luke 3:23-38 and Matthew 1:1-16, from the *New World Translation Study Edition* (nwtsty1_E.pdf) and the matching Insight articles.
- **Key figures and events:** `data/characters.js` and `data/events.js`, written by hand from the same sources.

Most minor people have no recorded dates. Their place on the timeline is estimated from their generation or the period in which they appear, and their window says so. `data/ASSUMED_DATES.md` lists every assumed date.

## Project layout

```
index.html                  page
css/style.css               styles
js/portrait.js              procedural line-art portraits
js/app.js                   timeline, windows, search, People filter
data/characters.js          134 key figures (hand-written)
data/events.js              events and eras
data/people.js              all people (generated, do not edit)
data/ASSUMED_DATES.md       generated list of placeholder dates
data/source/                extracted Insight records and manual overrides
tools/build-people.mjs      builds data/people.js
```

## Rebuild the people data

After editing `data/characters.js`, `data/source/insight-people.json` or `data/source/overrides.json`:

```sh
node tools/build-people.mjs
```

The script merges the curated key figures with the Insight records, links relatives in both directions, finds the Adam-to-Jesus line, fills in placeholder dates and writes `data/people.js` and `data/ASSUMED_DATES.md`. It prints any key figures or line names it could not match.

`data/source/overrides.json` fixes matches by hand. Supported keys:

- `curated`: `{ "key-figure-id": "INSIGHT#N" }` forces a match, or `null` to stop one.
- `drop`: Insight keys to leave out.
- `line`, `notLine`: person ids to add to or remove from the Adam-to-Jesus line.
- `tier`: `{ "id": 1-4 }` sets how far you must zoom in before a person appears (1 is always shown).

## Hosting

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to the default branch. To turn it on once, open the repository's **Settings → Pages** and set **Source** to **GitHub Actions**.

While publishing, the workflow adds the commit to every script and stylesheet link in `index.html` (for example `js/app.js?v=9c834ba`). GitHub Pages lets browsers keep files for 10 minutes, so without this a reload right after a deploy could still run the old code.

## Known gaps

- Six key figures are not linked to an Insight article yet (Nimrod, Abraham, Barak, Goliath, Zechariah the priest, Mary Magdalene), so they show only their hand-written family.
- Three names in Luke's list (Maath, Naggai, Amos) are not on the line yet.
