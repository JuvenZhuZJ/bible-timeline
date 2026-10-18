/*
 * TERRAIN — the main landscape of the window maps (hand-written): mountain ranges, single mountains,
 * deserts and the names of valleys, plains, highlands and rivers. Only the features a reader needs to
 * follow the accounts are here, with the names the New World Translation appendix maps use
 * (nwt_E.pdf: B2 Genesis and the Travels of the Patriarchs, B3 The Exodus, B4 Conquest of the
 * Promised Land, B7 Kingdom of David and Solomon, B10 Israel During the Time of Jesus, B13 The Spread
 * of Christianity). Positions are traced by hand from those maps, so they are approximate.
 *
 * Every feature shows only while the map is no taller than `max` degrees of latitude (and, with `min`,
 * taller than `min`: a rough line for wide maps that gives way to the named ranges closer in), so a
 * map of the whole Fertile Crescent shows the great ranges and deserts, and a close-up of Galilee
 * shows Mount Tabor and the Jezreel Valley.
 *
 *   ranges  { n: name, max, line: [[lon, lat], ...], at: [lon, lat] }   drawn as a row of small peaks
 *           along the crest; `at` is where the name goes
 *   peaks   { n, max, ll: [lon, lat], place }   one mountain, drawn as a small triangle; `place` is its
 *           id in data/places.js, and the mark is left out when that place is on the map as a pin
 *   deserts { n, max, poly: [[lon, lat], ...], at }   drawn as a fine stipple with its name
 *   names   { n, max, ll, river }   a valley, plain or highland; `river: 1` for a river's name
 */
window.TERRAIN = {
  ranges: [
    { n: "Lebanon Mts.", max: 12, line: [[35.5, 33.38], [35.8, 33.78], [36.1, 34.2], [36.35, 34.55]], at: [35.7, 34.05] },
    { n: "Anti-Lebanon Mts.", max: 12, line: [[35.95, 33.52], [36.2, 33.85], [36.45, 34.15], [36.65, 34.42]], at: [36.6, 33.9] },
    { n: "Taurus Mts.", max: 30, line: [[29.8, 37.15], [30.8, 37.3], [31.8, 37.3], [32.8, 37.1], [33.8, 37.2], [34.6, 37.4], [35.4, 37.7], [36.2, 38.1], [37.0, 38.4]], at: [33.4, 36.75] },
    { n: "Zagros Mts.", max: 30, line: [[45.6, 35.6], [46.4, 34.7], [47.2, 33.9], [48.0, 33.1], [48.8, 32.3], [49.6, 31.5], [50.4, 30.7]], at: [47.6, 34.2] },
    { n: "Mountains of Ararat", max: 30, line: [[41.0, 39.2], [42.0, 39.35], [43.0, 39.5], [43.9, 39.65]], at: [42.3, 39.9] },
    { n: "Amanus Mts.", max: 8, line: [[36.15, 36.45], [36.35, 36.75], [36.5, 37.05]], at: [36.75, 36.75] },
    { n: "", max: 9, line: [[35.33, 32.9], [35.4, 33.03], [35.45, 33.16]] },                       // the hills of Galilee
    { n: "Mt. Carmel", max: 3.5, line: [[34.99, 32.79], [35.07, 32.68], [35.15, 32.58]], at: [34.9, 32.62] },
    { n: "Mountains of Ephraim", max: 3.5, line: [[35.18, 32.4], [35.24, 32.2], [35.25, 32.02]], at: [35.0, 32.18] },
    { n: "", max: 9, min: 3.5, line: [[35.2, 32.42], [35.25, 32.1], [35.22, 31.85]] },                        // the central hill country, on wider maps
    { n: "Hill Country of Judah", max: 3.5, line: [[35.2, 31.8], [35.14, 31.58], [35.08, 31.38]], at: [34.88, 31.5] },
    { n: "", max: 9, min: 3.5, line: [[35.17, 31.72], [35.1, 31.42]] },
    { n: "", max: 9, line: [[35.74, 32.55], [35.8, 32.3], [35.77, 32.05]] },                        // the hills of Gilead
    { n: "Mt. Seir", max: 9, line: [[35.6, 30.95], [35.5, 30.6], [35.43, 30.25], [35.32, 29.85]], at: [35.95, 30.45] },
    { n: "", max: 14, line: [[33.7, 28.8], [33.95, 28.55], [34.2, 28.3]] },                          // the mountains of southern Sinai
  ],
  peaks: [
    { n: "Mt. Hermon", max: 12, ll: [35.86, 33.42], place: "hermon" },
    { n: "Mt. Tabor", max: 3.5, ll: [35.39, 32.69], place: "tabor" },
    { n: "Mt. Gilboa", max: 3.5, ll: [35.41, 32.45], place: "gilboa" },
    { n: "Mt. Ebal", max: 2.2, ll: [35.27, 32.24] },
    { n: "Mt. Gerizim", max: 2.2, ll: [35.27, 32.2] },
    { n: "Mt. of Olives", max: 0.6, ll: [35.244, 31.778], place: "olives" },
    { n: "Mt. Nebo", max: 3.5, ll: [35.73, 31.77], place: "nebo" },
    { n: "Mt. Sinai", max: 14, ll: [33.97, 28.54], place: "sinai" },
    { n: "Mt. Ararat", max: 30, ll: [44.3, 39.7], place: "ararat" },
  ],
  deserts: [
    { n: "Syrian Desert", max: 40, poly: [[36.9, 33.4], [37.8, 34.3], [38.6, 34.95], [39.8, 35.0], [40.6, 34.6], [41.6, 33.9], [42.0, 33.1], [41.2, 32.1], [39.9, 31.6], [38.5, 31.6], [37.4, 32.0], [36.9, 32.6]], at: [39.4, 33.3] },
    { n: "Arabian Desert", max: 40, poly: [[36.6, 31.3], [38.5, 31.2], [40.0, 31.2], [41.5, 31.3], [43.0, 30.8], [44.3, 30.0], [45.0, 28.8], [44.0, 27.0], [41.0, 26.8], [38.5, 27.2], [37.3, 28.2], [36.5, 29.3], [36.2, 30.4]], at: [40.3, 29.3] },
    { n: "Wilderness of Paran", max: 9, poly: [[33.7, 30.35], [34.45, 30.5], [34.85, 30.1], [34.85, 29.7], [34.4, 29.35], [33.8, 29.45], [33.45, 29.8]], at: [34.1, 29.9] },
    { n: "Wilderness of Shur", max: 9, poly: [[32.75, 30.75], [33.6, 30.95], [34.2, 30.85], [34.3, 30.55], [33.6, 30.4], [32.9, 30.2], [32.65, 30.4]], at: [33.4, 30.68] },
    { n: "Wilderness of Sin", max: 6, poly: [[32.95, 29.4], [33.3, 29.25], [33.45, 28.9], [33.2, 28.75], [32.95, 29.05]], at: [33.15, 29.35] },
    { n: "Negeb", max: 6, poly: [[34.45, 31.22], [34.95, 31.3], [35.3, 31.2], [35.25, 30.85], [35.0, 30.55], [34.6, 30.55], [34.35, 30.85]], at: [34.85, 30.85] },
    { n: "Wilderness of Judah", max: 3.5, poly: [[35.24, 31.82], [35.4, 31.8], [35.42, 31.55], [35.37, 31.3], [35.27, 31.33], [35.22, 31.55]], at: [35.32, 31.6] },
  ],
  names: [
    { n: "Mesopotamia", max: 40, ll: [41.4, 36.3] },
    { n: "Euphrates", max: 30, ll: [39.0, 35.4], river: 1 },
    { n: "Tigris", max: 30, ll: [43.8, 35.0], river: 1 },
    { n: "Nile", max: 30, ll: [31.45, 28.6], river: 1 },
    { n: "Jordan", max: 3.5, ll: [35.6, 32.0], river: 1 },
    { n: "Bashan", max: 6, ll: [36.15, 32.9] },
    { n: "Gilead", max: 6, ll: [35.9, 32.25] },
    { n: "Moab", max: 6, ll: [35.95, 31.45] },
    { n: "Edom", max: 6, ll: [35.8, 30.75] },
    { n: "Arabah", max: 6, ll: [35.15, 30.35] },
    { n: "Jordan Valley", max: 2.2, ll: [35.42, 32.08] },
    { n: "Jezreel Valley", max: 2.2, ll: [35.25, 32.6] },
    { n: "Plain of Sharon", max: 2.2, ll: [34.92, 32.38] },
    { n: "Shephelah", max: 2.2, ll: [34.88, 31.65] },
  ],
};
