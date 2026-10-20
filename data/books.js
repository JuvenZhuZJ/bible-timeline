/*
 * THE BOOKS OF THE BIBLE, drawn as the Bible books band.
 * ------------------------------------------------------------------
 * From the New World Translation, "Table of the Books of the Bible" (writer, place written,
 * writing completed, time covered). Years: negative = B.C.E. (-1513 = 1513 B.C.E.).
 *
 * b     book number, 1 Genesis ... 66 Revelation (the order of js/scripture.js)
 * w     writers: person ids from data/people.js
 * at    place written, English and Chinese
 * done  year the writing was completed; dq "c." about, "a." after, "b." before
 * from, to   time covered. The table gives one span for 1 and 2 Kings together and one for
 *       1 and 2 Chronicles together (after the genealogies of 1 Chronicles 1-9), so each book of
 *       the pair has that span. Left out when the table gives none: the line then runs between
 *       the book's events, or is a short mark at the year the writing was completed.
 * doneTo     last year when the table gives a range for the completion ("c. 60-65")
 * fq, tq     "c." / "a." / "b." for the covered years
 * ev    the book's main events, drawn as dots on its line. Each is either "person-id:n",
 *       the n-th activity of that person in data/people.js (counting from 0), or "e:event-id"
 *       from data/events.js, so its text, year and scripture come from there in both languages.
 */
window.BIBLE_BOOKS = [
{ b: 1, w: ["moses"], at: ["Wilderness", "曠野"], done: -1513, from: -4026, to: -1657, ev: ["e:creation", "adam:1", "cain:0", "enoch:2", "noah:5", "e:flood", "noah:2", "nimrod:0", "e:covenant", "abraham:1", "abraham:2", "abraham:4", "isaac:1", "isaac:3", "jacob:0", "jacob:2", "joseph-patriarch:0", "joseph-patriarch:2", "e:egypt", "jacob:4", "joseph-patriarch:4"] },
{ b: 2, w: ["moses"], at: ["Wilderness", "曠野"], done: -1512, from: -1657, to: -1512, ev: ["moses:0", "moses:1", "moses:2", "aaron:0", "e:exodus", "miriam:1", "joshua:0", "aaron:1"] },
{ b: 3, w: ["moses"], at: ["Wilderness", "曠野"], done: -1512, from: -1512, to: -1512, ev: ["aaron:2"] },
{ b: 4, w: ["moses"], at: ["Wilderness and Plains of Moab", "曠野和摩押平原"], done: -1473, from: -1512, to: -1473, ev: ["joshua:1", "caleb:0", "miriam:2", "miriam:3", "moses:5", "aaron:3"] },
{ b: 5, w: ["moses"], at: ["Plains of Moab", "摩押平原"], done: -1473, from: -1473, to: -1473, ev: ["moses:4"] },
{ b: 6, w: ["joshua"], at: ["Canaan", "迦南"], done: -1450, dq: "c.", from: -1473, to: -1450, tq: "c.", ev: ["e:canaan", "rahab:0", "joshua:3", "caleb:1", "othniel:0", "joshua:4"] },
{ b: 7, w: ["samuel"], at: ["Israel", "以色列"], done: -1100, dq: "c.", from: -1450, fq: "c.", to: -1120, tq: "c.", ev: ["othniel:1", "ehud:0", "deborah:0", "gideon:0", "gideon:2", "gideon:3", "jephthah:0", "samson:0", "samson:2"] },
{ b: 8, w: ["samuel"], at: ["Israel", "以色列"], done: -1090, dq: "c.", ev: ["ruth:0", "ruth:2"] },
{ b: 9, w: ["samuel", "gad-3", "nathan"], at: ["Israel", "以色列"], done: -1078, dq: "c.", from: -1180, fq: "c.", to: -1078, ev: ["hannah:1", "samuel:0", "eli:2", "e:monarchy", "jonathan:0", "saul:2", "david:0", "jonathan:1", "david:6", "saul:3"] },
{ b: 10, w: ["gad-3", "nathan"], at: ["Israel", "以色列"], done: -1040, dq: "c.", from: -1077, to: -1040, tq: "c.", ev: ["david:1", "david:2", "david:3", "david:4", "nathan:1", "absalom:0", "absalom:1", "absalom:2"] },
{ b: 11, w: ["jeremiah"], at: ["Judah and Egypt", "猶大和埃及"], done: -580, from: -1040, fq: "c.", to: -580, ev: ["nathan:2", "solomon:0", "e:temple", "solomon:3", "solomon:4", "e:division", "rehoboam:1", "asa:1", "ahab:0", "elijah:0", "elijah:1", "elijah:2", "ahab:2", "ahab:3"] },
{ b: 12, w: ["jeremiah"], at: ["Judah and Egypt", "猶大和埃及"], done: -580, from: -1040, fq: "c.", to: -580, ev: ["elijah:3", "elisha:2", "elisha:3", "jehu:0", "elisha:4", "e:samaria", "hezekiah:1", "josiah:2", "josiah:3", "nebuchadnezzar:1", "zedekiah:1", "e:jerusalem1"] },
{ b: 13, w: ["ezra"], at: ["Jerusalem (?)", "耶路撒冷（？）"], done: -460, dq: "c.", from: -1077, fq: "c.", to: -537, ev: ["david:1", "david:2", "david:3", "solomon:0"] },
{ b: 14, w: ["ezra"], at: ["Jerusalem (?)", "耶路撒冷（？）"], done: -460, dq: "c.", from: -1077, fq: "c.", to: -537, ev: ["solomon:2", "e:division", "asa:3", "jehoshaphat:1", "hezekiah:4", "manasseh:1", "josiah:2", "e:jerusalem1", "cyrus:1"] },
{ b: 15, w: ["ezra"], at: ["Jerusalem", "耶路撒冷"], done: -460, dq: "c.", from: -537, to: -467, tq: "c.", ev: ["e:return", "zerubbabel:1", "zerubbabel:2", "e:temple2", "ezra:0", "ezra:1"] },
{ b: 16, w: ["nehemiah"], at: ["Jerusalem", "耶路撒冷"], done: -443, dq: "a.", from: -456, to: -443, tq: "a.", ev: ["nehemiah:0", "nehemiah:1", "ezra:2", "nehemiah:2"] },
{ b: 17, w: ["mordecai"], at: ["Shushan, Elam", "以攔的書珊"], done: -475, dq: "c.", from: -493, to: -475, tq: "c.", ev: ["esther:0", "mordecai:0", "esther:1", "esther:2", "esther:3"] },
{ b: 18, w: ["moses"], at: ["Wilderness", "曠野"], done: -1473, dq: "c.", from: -1657, to: -1473, ev: ["job:0", "job:1", "job:2"] },
{ b: 19, w: ["david"], at: null, done: -460, dq: "c.", ev: [] },
{ b: 20, w: ["solomon", "agur", "lemuel"], at: ["Jerusalem", "耶路撒冷"], done: -717, dq: "c.", ev: [] },
{ b: 21, w: ["solomon"], at: ["Jerusalem", "耶路撒冷"], done: -1000, dq: "b.", ev: [] },
{ b: 22, w: ["solomon"], at: ["Jerusalem", "耶路撒冷"], done: -1020, dq: "c.", ev: [] },
{ b: 23, w: ["isaiah"], at: ["Jerusalem", "耶路撒冷"], done: -732, dq: "a.", from: -778, fq: "c.", to: -732, tq: "a.", ev: ["isaiah:0", "isaiah:1", "isaiah:2", "hezekiah:2", "isaiah:3"] },
{ b: 24, w: ["jeremiah"], at: ["Judah; Egypt", "猶大；埃及"], done: -580, from: -647, to: -580, ev: ["jeremiah:0", "josiah:2", "jeremiah:1", "jeremiah:2", "zedekiah:2", "jeremiah:3", "jeremiah:4"] },
{ b: 25, w: ["jeremiah"], at: ["Near Jerusalem", "耶路撒冷附近"], done: -607, ev: [] },
{ b: 26, w: ["ezekiel"], at: ["Babylon", "巴比倫"], done: -591, dq: "c.", from: -613, to: -591, tq: "c.", ev: ["ezekiel:1", "ezekiel:2", "e:jerusalem1", "ezekiel:3", "ezekiel:4"] },
{ b: 27, w: ["daniel"], at: ["Babylon", "巴比倫"], done: -536, dq: "c.", from: -618, to: -536, tq: "c.", ev: ["daniel:0", "daniel:1", "nebuchadnezzar:4", "daniel:2", "daniel:3", "daniel:4"] },
{ b: 28, w: ["hosea"], at: ["Samaria (District)", "撒馬利亞（地區）"], done: -745, dq: "a.", from: -804, fq: "b.", to: -745, tq: "a.", ev: ["hosea:0", "hosea:1"] },
{ b: 29, w: ["joel-9"], at: ["Judah", "猶大"], done: -820, dq: "c.", ev: [] },
{ b: 30, w: ["amos"], at: ["Judah", "猶大"], done: -804, dq: "c.", ev: ["amos:0"] },
{ b: 31, w: ["obadiah-8"], at: null, done: -607, dq: "c.", ev: [] },
{ b: 32, w: ["jonah"], at: null, done: -844, dq: "c.", ev: ["jonah:0", "jonah:1"] },
{ b: 33, w: ["micah"], at: ["Judah", "猶大"], done: -717, dq: "b.", from: -777, fq: "c.", to: -717, ev: ["micah:0", "micah:1"] },
{ b: 34, w: ["nahum-1"], at: ["Judah", "猶大"], done: -632, dq: "b.", ev: [] },
{ b: 35, w: ["habakkuk"], at: ["Judah", "猶大"], done: -628, dq: "c.", ev: [] },
{ b: 36, w: ["zephaniah-2"], at: ["Judah", "猶大"], done: -648, dq: "b.", ev: [] },
{ b: 37, w: ["haggai"], at: ["Jerusalem", "耶路撒冷"], done: -520, from: -520, to: -520, ev: ["haggai:0"] },
{ b: 38, w: ["zechariah-prophet"], at: ["Jerusalem", "耶路撒冷"], done: -518, from: -520, to: -518, ev: ["zechariah-prophet:0", "zechariah-prophet:1"] },
{ b: 39, w: ["malachi"], at: ["Jerusalem", "耶路撒冷"], done: -443, dq: "a.", ev: ["malachi:0", "malachi:1"] },
{ b: 40, w: ["matthew"], at: ["Israel", "以色列"], done: 41, dq: "c.", from: -2, to: 33, ev: ["e:birth", "e:baptism", "matthew:0", "jesus:3", "john-baptist:3", "peter:1", "jesus:4"] },
{ b: 41, w: ["mark"], at: ["Rome", "羅馬"], done: 60, dq: "c.", doneTo: 65, from: 29, to: 33, ev: ["e:baptism", "peter:6", "john-baptist:3", "peter:1", "jesus:4"] },
{ b: 42, w: ["luke"], at: ["Caesarea", "凱撒里亞"], done: 56, dq: "c.", doneTo: 58, from: -3, to: 33, ev: ["mary:0", "e:birth", "jesus:1", "e:baptism", "peter:6", "peter:1", "jesus:4"] },
{ b: 43, w: ["john"], at: ["Ephesus, or near", "以弗所或附近"], done: 98, dq: "c.", from: 29, to: 33, ev: ["john:0", "e:baptism", "john:1", "jesus:4"] },
{ b: 44, w: ["luke"], at: ["Rome", "羅馬"], done: 61, dq: "c.", from: 33, to: 61, tq: "c.", ev: ["jesus:5", "e:pentecost", "stephen:1", "philip:1", "paul:0", "e:gentiles", "paul:1", "paul:2", "paul:3", "paul:4", "paul:7", "paul:5"] },
{ b: 45, w: ["paul"], at: ["Corinth", "哥林多"], done: 56, dq: "c.", ev: [] },
{ b: 46, w: ["paul"], at: ["Ephesus", "以弗所"], done: 55, dq: "c.", ev: [] },
{ b: 47, w: ["paul"], at: ["Macedonia", "馬其頓"], done: 55, dq: "c.", ev: [] },
{ b: 48, w: ["paul"], at: ["Corinth or Syrian Antioch", "哥林多或敘利亞的安提阿"], done: 50, dq: "c.", doneTo: 52, ev: [] },
{ b: 49, w: ["paul"], at: ["Rome", "羅馬"], done: 60, dq: "c.", doneTo: 61, ev: [] },
{ b: 50, w: ["paul"], at: ["Rome", "羅馬"], done: 60, dq: "c.", doneTo: 61, ev: [] },
{ b: 51, w: ["paul"], at: ["Rome", "羅馬"], done: 60, dq: "c.", doneTo: 61, ev: [] },
{ b: 52, w: ["paul"], at: ["Corinth", "哥林多"], done: 50, dq: "c.", ev: [] },
{ b: 53, w: ["paul"], at: ["Corinth", "哥林多"], done: 51, dq: "c.", ev: [] },
{ b: 54, w: ["paul"], at: ["Macedonia", "馬其頓"], done: 61, dq: "c.", doneTo: 64, ev: [] },
{ b: 55, w: ["paul"], at: ["Rome", "羅馬"], done: 65, dq: "c.", ev: [] },
{ b: 56, w: ["paul"], at: ["Macedonia (?)", "馬其頓（？）"], done: 61, dq: "c.", doneTo: 64, ev: [] },
{ b: 57, w: ["paul"], at: ["Rome", "羅馬"], done: 60, dq: "c.", doneTo: 61, ev: [] },
{ b: 58, w: ["paul"], at: ["Rome", "羅馬"], done: 61, dq: "c.", ev: [] },
{ b: 59, w: ["james-brother"], at: ["Jerusalem", "耶路撒冷"], done: 62, dq: "b.", ev: [] },
{ b: 60, w: ["peter"], at: ["Babylon", "巴比倫"], done: 62, dq: "c.", doneTo: 64, ev: [] },
{ b: 61, w: ["peter"], at: ["Babylon (?)", "巴比倫（？）"], done: 64, dq: "c.", ev: [] },
{ b: 62, w: ["john"], at: ["Ephesus, or near", "以弗所或附近"], done: 98, dq: "c.", ev: [] },
{ b: 63, w: ["john"], at: ["Ephesus, or near", "以弗所或附近"], done: 98, dq: "c.", ev: [] },
{ b: 64, w: ["john"], at: ["Ephesus, or near", "以弗所或附近"], done: 98, dq: "c.", ev: [] },
{ b: 65, w: ["jude"], at: ["Israel (?)", "以色列（？）"], done: 65, dq: "c.", ev: [] },
{ b: 66, w: ["john"], at: ["Patmos", "拔摩島"], done: 96, dq: "c.", ev: ["john:3"] },
];
