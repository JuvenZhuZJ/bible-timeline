/*
 * MAJOR EVENTS & ERAS
 * ------------------------------------------------------------------
 * Years: negative = B.C.E., positive = C.E.  (e.g. -4026 = 4026 B.C.E.)
 * Major events are drawn as large nodes on the main line and divide it
 * into eras. Dates follow the chronology in "Insight on the Scriptures"
 * (article "Chronology"). Edit freely; the site re-reads this on load.
 */
window.TIMELINE_EVENTS = [
  { id: "creation",   year: -4026, title: "Creation of Adam",            ref: "Genesis 2:7",            text: "Jehovah forms the first man from the dust of the ground; human history begins." },
  { id: "flood",      year: -2370, title: "The Flood",                   ref: "Genesis 7:11",           text: "The global Deluge begins in Noah's 600th year; only eight people survive in the ark." },
  { id: "covenant",   year: -1943, title: "Abrahamic Covenant",          ref: "Genesis 12:1-7",         text: "Abraham crosses the Euphrates toward Canaan; the covenant with him takes effect." },
  { id: "egypt",      year: -1728, title: "Jacob Enters Egypt",          ref: "Genesis 46:1-7",         text: "Jacob's household of 70 settles in Egypt under Joseph's care." },
  { id: "exodus",     year: -1513, title: "The Exodus",                  ref: "Exodus 12:40-41",        text: "Israel leaves Egypt; the Law covenant is made at Mount Sinai." },
  { id: "canaan",     year: -1473, title: "Entry into Canaan",           ref: "Joshua 3:14-17",         text: "Joshua leads Israel across the Jordan into the Promised Land." },
  { id: "monarchy",   year: -1117, title: "Saul Anointed King",          ref: "1 Samuel 10:1",          text: "Israel asks for a human king; Samuel anoints Saul." },
  { id: "temple",     year: -1027, title: "Solomon's Temple Completed",  ref: "1 Kings 6:37-38",        text: "The temple in Jerusalem is completed after seven years of building." },
  { id: "division",   year: -997,  title: "The Kingdom Divides",         ref: "1 Kings 12:16-20",       text: "Ten tribes break away under Jeroboam; Judah stays with Rehoboam." },
  { id: "samaria",    year: -740,  title: "Fall of Samaria",             ref: "2 Kings 17:5-6",         text: "Assyria conquers Samaria; the northern kingdom of Israel ends." },
  { id: "jerusalem1", year: -607,  title: "Jerusalem Destroyed",         ref: "2 Kings 25:8-10",        text: "Babylon destroys Jerusalem and its temple; the exile begins. The 'appointed times of the nations' (the 'seven times' of Daniel 4) start here." },
  { id: "babylon",    year: -539,  title: "Babylon Falls to Cyrus",      ref: "Daniel 5:30-31; Isaiah 45:1", text: "The Medes and Persians under Cyrus take Babylon in one night; Medo-Persia becomes the world power." },
  { id: "return",     year: -537,  title: "Return from Exile",           ref: "Ezra 1:1-4; 3:1",        text: "Freed by Cyrus, a remnant returns and sets up the altar in Jerusalem, 70 years after the land was left desolate." },
  { id: "temple2",    year: -515,  title: "Temple Rebuilt",              ref: "Ezra 6:14-15",           text: "Encouraged by the prophets Haggai and Zechariah, the returned Jews finish rebuilding the temple." },
  { id: "walls",      year: -455,  title: "Jerusalem's Walls Rebuilt",   ref: "Nehemiah 2:1-8; 6:15",   text: "Nehemiah is commissioned in Artaxerxes' 20th year; the wall is finished in 52 days. This word to rebuild Jerusalem starts Daniel's '70 weeks' of years." },
  { id: "birth",      year: -2,    title: "Birth of Jesus",              ref: "Luke 2:1-7",             text: "Jesus is born in Bethlehem." },
  { id: "baptism",    year: 29,    title: "Jesus Baptized",              ref: "Luke 3:21-23",           text: "Jesus is baptized by John and begins his ministry at about 30. As Daniel foretold, 'Messiah the Leader' arrives at the end of 69 'weeks' of years." },
  { id: "pentecost",  year: 33,    title: "Death, Resurrection & Pentecost", ref: "Matthew 27-28; Acts 2", text: "Jesus dies on Nisan 14, is raised on the third day; holy spirit is poured out at Pentecost." },
  { id: "gentiles",   year: 36,    title: "First Gentiles Baptized",     ref: "Acts 10:44-48",          text: "Holy spirit is poured out on Cornelius and his household, the first uncircumcised Gentile believers. Daniel's '70 weeks' end this year." },
  { id: "jerusalem2", year: 70,    title: "Jerusalem Destroyed by Rome", ref: "Luke 19:43-44",          text: "Roman armies under Titus destroy Jerusalem and its temple, as Daniel and Jesus foretold." },
  { id: "revelation", year: 96,    title: "John Receives Revelation",    ref: "Revelation 1:1, 9",      text: "Exiled on Patmos, the aged apostle John receives and records the Revelation." }
];

/* Eras: labelled bands between major events. */
window.TIMELINE_ERAS = [
  { from: -4026, to: -2370, name: "Before the Flood" },
  { from: -2370, to: -1943, name: "After the Flood" },
  { from: -1943, to: -1728, name: "The Patriarchs" },
  { from: -1728, to: -1513, name: "In Egypt" },
  { from: -1513, to: -1473, name: "Wilderness" },
  { from: -1473, to: -1117, name: "The Judges" },
  { from: -1117, to: -997,  name: "United Kingdom" },
  { from: -997,  to: -740,  name: "Divided Kingdom" },
  { from: -740,  to: -607,  name: "Judah Alone" },
  { from: -607,  to: -537,  name: "Exile in Babylon" },
  { from: -537,  to: -400,  name: "Restoration" },
  { from: -400,  to: -2,    name: "Between the Testaments" },
  { from: -2,    to: 33,    name: "Life of Jesus" },
  { from: 33,    to: 100,   name: "The Early Congregation" },
  // after the Bible: history only (data/history.js)
  { from: 100,   to: 313,   name: "After the Apostles" },
  { from: 313,   to: 622,   name: "Church and Empire" },
  { from: 622,   to: 1455,  name: "The Middle Ages" },
  { from: 1455,  to: 1870,  name: "The Printed Bible" },
  { from: 1870,  to: 1914,  name: "The Bible Students" },
  { from: 1914,  to: 2025,  name: "The Last Days" },
];
