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

Searching for a person who is hidden by the current mode switches to Everyone. The choice is remembered in the browser.

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

## Known gaps

- Six key figures are not linked to an Insight article yet (Nimrod, Abraham, Barak, Goliath, Zechariah the priest, Mary Magdalene), so they show only their hand-written family.
- Three names in Luke's list (Maath, Naggai, Amos) are not on the line yet.
