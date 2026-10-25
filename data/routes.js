/*
 * ROUTES — the ways people travelled between the places on the window maps (hand-written).
 * ------------------------------------------------------------------
 * The line between two places follows the roads below, found by the shortest way along them,
 * unless TRAVELS gives the way itself. Each road and travel names its source:
 *   "B2", "B3", ... – a map in the New World Translation appendix (nwt_E.pdf): B2 Genesis and the
 *                     Travels of the Patriarchs, B3 The Exodus From Egypt, B4 Conquest of the Promised
 *                     Land, B7 Kingdom of David and Solomon, B10 Israel During the Time of Jesus,
 *                     B13 The Spread of Christianity (Paul's travels)
 *   "Acts 27" etc.  – the Bible account the way is traced from
 *   "common route"  – no source map shows it; the usual caravan or walking way of the region
 *                     (along valleys and the coast, around seas and mountains) is used
 * For people from Alexander the Great on, a leg not given here and leaving the land of Israel takes the
 * quickest way of ORBIS, the Stanford model of the roads and sea lanes of the Roman world (data/orbis.js,
 * tools/build-orbis.mjs). A sea voyage here bends around the capes and islands in its way, along the
 * corners tools/sea-way.mjs finds across the water of the map.
 * Points are place ids from data/places.js, names from WAY below, or [longitude, latitude].
 *
 * ROADS    { n: name, src, pts: [...] }        a road, drawn through its points in order
 * TRAVELS  "from>to": { src, via: [...] }       the way for one leg (either direction); in via,
 *                                              ">" between two points means "by the roads",
 *                                              otherwise the line goes straight from point to point
 *                                              (sea voyages, tracks through the wilderness), and
 *                                              "=a>b" takes the way TRAVELS gives from a to b
 */
window.ROUTE_WAY = {
  // Mesopotamia and Syria
  sippar: [44.25, 33.06], nippur: [45.23, 32.13], der: [45.75, 33.12], assur: [43.26, 35.46], nisibis: [41.22, 37.07],
  mari: [40.89, 34.55], tuttul: [39.05, 35.95], emar: [38.1, 35.98], tadmor: [38.27, 34.55],
  aleppo: [37.16, 36.2], ebla: [36.8, 35.8], apamea: [36.4, 35.42], homs: [36.71, 34.73],
  issus: [36.17, 36.84], seleucia: [35.93, 36.12], laodiceasyr: [35.78, 35.52], arvad: [35.86, 34.86],
  tripoli: [35.84, 34.43], byblos: [35.65, 34.12], sidon: [35.37, 33.56], tyre: [35.2, 33.27], ptolemais: [35.08, 32.92],
  // the land
  ramahb: [35.233, 31.85], jacobsford: [35.63, 33.0], bethshean: [35.5, 32.5], adam: [35.55, 32.1],
  bethhoron: [35.12, 31.88], ashdod: [34.65, 31.8], ashkelon: [34.55, 31.66],
  raphia: [34.25, 31.29], arad: [35.13, 31.28], ginae: [35.3, 32.46], sepphoris: [35.28, 32.75],
  tiberias: [35.53, 32.79], ashteroth: [36.0, 32.83], 
  heshbon: [35.8, 31.8], medeba: [35.8, 31.72], dibon: [35.78, 31.5], kirhareseth: [35.7, 31.18], bozrah: [35.6, 30.73],
  elath: [34.98, 29.55],
  // Egypt and Sinai
  sile: [32.55, 30.97], on: [31.29, 30.13], memphis: [31.25, 29.85], clysma: [32.55, 29.97], nakhl: [33.75, 29.9],
  succothegypt: [32.1, 30.55], etham: [32.35, 30.45], pihahiroth: [32.45, 30.05],
  marah: [32.95, 29.45], elim: [33.1, 29.1], wildsin: [33.3, 28.95], dophkah: [33.55, 28.85], 
  kibroth: [34.15, 28.75], rithmah: [34.7, 29.4], zin: [34.55, 29.95], punon: [35.5, 30.63], oboth: [35.65, 30.78],
  iyeabarim: [35.75, 30.95], zered: [35.78, 31.06], arnon: [35.8, 31.44], almon: [35.82, 31.6],
  // Asia Minor, Greece, Italy
  ciliciangates: [34.77, 37.28], attalia: [30.7, 36.88],
  apameaphr: [30.17, 38.07], smyrna: [27.14, 38.42], assos: [26.34, 39.49],
  neapolis: [24.41, 40.94], amphipolis: [23.84, 40.82], apollonia: [23.5, 40.6],
  megara: [23.35, 38.0],
  citium: [33.63, 34.92], amathus: [33.13, 34.71], curium: [32.88, 34.66],
  // ports and capes of Paul's voyages (Acts 16-28), placed as in ORBIS
  samothrace: [25.55, 40.42], mitylene: [26.56, 39.1], chios: [26.14, 38.37], samos: [26.94, 37.69], trogyllium: [27.02, 37.67],
  cos: [27.29, 36.89], rhodes: [28.23, 36.44], patara: [29.32, 36.26], myra: [29.98, 36.2], cnidus: [27.37, 36.68],
  salmone: [26.3, 35.25], fairhavens: [24.8, 34.93], cauda: [24.08, 34.85], piraeus: [23.63, 37.94],
  syracuse: [15.29, 37.07], rhegium: [15.65, 38.11], puteoli: [14.12, 40.82], capua: [14.25, 41.08],
  appiiforum: [13.1, 41.4], threetaverns: [12.9, 41.6],
  beneventum: [14.78, 41.13], venusia: [15.81, 40.96], tarentum: [17.24, 40.47], brundisium: [17.94, 40.63], lechaeum: [22.89, 37.93],
  // Ireland and Britain (the Bible Students' and translators' day)
  holyhead: [-4.63, 53.31],
};

window.ROADS = [
  // the great road along the Euphrates and around the Fertile Crescent (B2)
  { n: "Euphrates road", src: "B2", pts: ["ur", "erech", "nippur", "babylon", "sippar", "mari", "tuttul", "emar", "carchemish"] },
  { n: "Euphrates road", src: "B2", pts: ["tuttul", "haran"] },
  { n: "Road to Nineveh", src: "B2", pts: ["carchemish", "haran", "nisibis", "nineveh"] },
  { n: "Tigris road", src: "B2", pts: ["babylon", "tigris", "assur", "nineveh"] },
  { n: "Road to Susa", src: "common route", pts: ["babylon", "der", "susa"] },
  { n: "Chebar", src: "common route", pts: ["nippur", "chebar"] },
  { n: "Road through Syria", src: "B2", pts: ["carchemish", "aleppo", "ebla", "hamath", "homs", "riblah", "damascus"] },
  { n: "Road to Antioch", src: "B13", pts: ["hamath", "apamea", "antioch", "seleucia"] },
  { n: "Desert road by Tadmor", src: "B2", pts: ["mari", "tadmor", "damascus"] },
  // the coastal road, the Way of the Sea (B2, B10)
  { n: "Coastal road", src: "B13", pts: ["tarsus", "issus", "antioch"] },
  { n: "Coastal road", src: "B13", pts: ["seleucia", "laodiceasyr", "arvad", "tripoli", "byblos", "sidon", "zarephath", "tyre", "ptolemais"] },
  { n: "Way of the Sea", src: "B2", pts: ["damascus", "hazor", "megiddo", "aphek", "lydda", "ashdod", "ashkelon", "gaza", "raphia", "sile", "goshen", "on", "memphis"] },
  { n: "Way of the Sea", src: "B10", pts: ["hazor", "jacobsford", "bethsaida", "capernaum", "magdala", "tiberias"] },
  { n: "Coastal plain", src: "B10", pts: ["ptolemais", "caesarea", "aphek"] },
  { n: "Road to Joppa", src: "B10", pts: ["lydda", "joppa"] },
  { n: "Nile road", src: "common route", pts: ["goshen", "rameses", "tahpanhes", "sile"] },
  { n: "Delta road", src: "common route", pts: ["on", "egypt", "memphis"] },
  { n: "Road to Alexandria", src: "common route", pts: ["on", "alexandria"] },
  // the King's Road east of the Jordan (B2, B3)
  { n: "King's Road", src: "B2", pts: ["damascus", "ashteroth", "edrei", "ramothgilead", "rabbah", "heshbon", "medeba", "dibon", "kirhareseth", "bozrah", "elath"] },
  // the road along the ridge of the hill country (B2, B10)
  { n: "Ridge road", src: "B10", pts: ["megiddo", "ginae", "dothan", "samaria", "shechem", "shiloh", "bethel", "ramahb", "gibeah", "jerusalem", "bethlehem", "tekoa", "hebron", "beersheba"] },
  { n: "Ridge road", src: "B10", pts: ["ginae", "jezreel", "shunem", "nain", "nazareth", "sepphoris", "cana", "tiberias"] },
  { n: "Road to Ptolemais", src: "B10", pts: ["sepphoris", "ptolemais"] },
  { n: "Jezreel Valley", src: "B10", pts: ["megiddo", "jezreel", "bethshean"] },
  { n: "Carmel", src: "common route", pts: ["megiddo", "carmel", "ptolemais"] },
  // the Jordan Valley and the ways across it (B10)
  { n: "Jordan Valley road", src: "B10", pts: ["tiberias", "bethshean", "abelmeholah", "adam", "jericho"] },
  { n: "Jericho road", src: "B10", pts: ["jerusalem", "bethany", "jericho"] },
  { n: "Ford of the Jordan", src: "B10", pts: ["jericho", "jordanford", "shittim", "heshbon"] },
  { n: "Way by the Jabbok", src: "B2", pts: ["shechem", "tirzah", "adam", "succoth", "penuel", "mahanaim", "ramothgilead"] },
  { n: "Road to Gilead", src: "B7", pts: ["bethshean", "cherith", "gilead"] },
  { n: "Road to Gilgal", src: "B4", pts: ["jericho", "gilgal", "ai", "bethel"] },
  { n: "Road north", src: "B10", pts: ["hazor", "kedesh", "dan", "caesareaph", "damascus"] },
  { n: "Road north", src: "B10", pts: ["bethsaida", "caesareaph"] },
  // across the hills to the coast (B4, B7, B10)
  { n: "Way of Beth-horon", src: "B4", pts: ["jerusalem", "gibeon", "bethhoron", "lydda"] },
  { n: "Road to Shiloh", src: "B7", pts: ["shiloh", "zeredah", "aphek"] },
  { n: "Road to Ramah", src: "common route", pts: ["ramah", "zeredah"] },
  { n: "Road to Gibeon", src: "common route", pts: ["ramahb", "gibeon"] },
  { n: "Road through Philistia", src: "common route", pts: ["gath", "ziklag"] },
  { n: "Road to the Jabbok", src: "common route", pts: ["rabbah", "mahanaim"] },
  { n: "Valley of Elah", src: "B7", pts: ["bethlehem", "elah", "gath", "ashdod"] },
  { n: "Sorek valley", src: "B7", pts: ["jerusalem", "sorek", "zorah", "timnah", "ashdod"] },
  { n: "Road to Gaza", src: "B10", pts: ["hebron", "mareshah", "gazaroad", "gaza"] },
  { n: "Negeb road", src: "B2", pts: ["gaza", "gerar", "beersheba", "arad"] },
  { n: "Road to Ziklag", src: "B7", pts: ["gerar", "ziklag", "beersheba"] },
  { n: "Road by Mamre", src: "B2", pts: ["hebron", "mamre", "machpelah"] },
  { n: "Debir", src: "B4", pts: ["hebron", "debir", "beersheba"] },
  { n: "Road to Sodom", src: "B2", pts: ["hebron", "zoar", "sodom"] },
  // south to Egypt and through the wilderness (B2, B3)
  { n: "Way to Shur", src: "B2", pts: ["beersheba", "kadesh", "shur", "goshen"] },
  { n: "Way to Shur", src: "B2", pts: ["beersheba", "shur"] },
  { n: "Way to Mount Seir", src: "B3", pts: ["kadesh", "hor", "punon", "bozrah"] },
  { n: "Way of the Arabah", src: "B3", pts: ["hor", "elath"] },
  { n: "Road to Paran", src: "B2", pts: ["kadesh", "paran"] },
  { n: "Wilderness of Sinai", src: "B3", pts: ["kadesh", "zin", "rithmah", "hazeroth", "kibroth", "sinai"] },
  { n: "Wilderness of Sinai", src: "B3", pts: ["hazeroth", [34.55, 29.2], [34.8, 29.48], [34.92, 29.56], "elath"] },
  { n: "Road to Midian", src: "common route", pts: ["elath", "midian"] },
  { n: "Pilgrims' road across Sinai", src: "common route", pts: ["clysma", "nakhl", "elath"] },
  { n: "Road to Clysma", src: "common route", pts: ["memphis", "clysma"] },
  { n: "Road to Clysma", src: "common route", pts: ["goshen", "clysma", "redsea"] },
  // Asia Minor, Greece, Cyprus and Italy (B13)
  { n: "Road through the Cilician Gates", src: "B13", pts: ["tarsus", "ciliciangates", "derbe", "lystra", "iconium", "pantioch"] },
  { n: "Road to Perga", src: "B13", pts: ["pantioch", [31.0, 37.6], "perga", "attalia"] },
  { n: "Road to Ephesus", src: "B13", pts: ["pantioch", "apameaphr", "colossae", "laodicea", "ephesus"] },
  { n: "Road to Troas", src: "B13", pts: ["ephesus", "smyrna", "pergamum", "assos", "troas"] },
  { n: "Road to Miletus", src: "B13", pts: ["ephesus", "miletus"] },
  { n: "Egnatian Way", src: "B13", pts: ["neapolis", "philippi", "amphipolis", "apollonia", "thessalonica", "beroea"] },
  { n: "Road to Corinth", src: "B13", pts: ["athens", "megara", "corinth", "cenchreae"] },
  { n: "Road across Cyprus", src: "B13", pts: ["salamis", "citium", "amathus", "curium", "cyprus"] },
  { n: "Appian Way", src: "B13", pts: ["puteoli", "capua", "appiiforum", "threetaverns", "rome"] },
  { n: "Appian Way to Brundisium", src: "common route", pts: ["capua", "beneventum", "venusia", "tarentum", "brundisium"] },
];

window.TRAVELS = {
  // the Exodus, along the "Possible Route of Exodus" on map B3
  "sinai>redsea": { src: "common route; B3", via: ["sinai", "rephidim", "dophkah", "wildsin", "elim", "marah", "clysma", ">", "goshen", "succothegypt", "etham", "pihahiroth", "redsea"], note: "back to Egypt along the Gulf of Suez (Exodus 4:20), then out with Israel" },
  "redsea>sinai": { src: "B3", via: ["redsea", "marah", "elim", "wildsin", "dophkah", "rephidim", "sinai"] },
  "egypt>redsea": { src: "B3", via: ["egypt", ">", "goshen", "succothegypt", "etham", "pihahiroth", "redsea"] },
  "egypt>sinai": { src: "B3", via: ["egypt", "=egypt>redsea", "redsea", "=redsea>sinai", "sinai"] },
  "redsea>hazeroth": { src: "B3", via: ["redsea", "=redsea>sinai", "sinai", "kibroth", "hazeroth"] },
  "redsea>kadesh": { src: "B3", via: ["redsea", "=redsea>sinai", "sinai", "=sinai>kadesh", "kadesh"] },
  "sinai>kadesh": { src: "B3", via: ["sinai", "kibroth", "hazeroth", "rithmah", "zin", "kadesh"] },
  "kadesh>shittim": { src: "B3", via: ["kadesh", "hor", [35.15, 30.3], "elath", [35.3, 30.2], "punon", "oboth", "iyeabarim", "zered", "arnon", "dibon", "almon", "nebo", "shittim"] },
  "kadesh>nebo": { src: "B3", via: ["kadesh", "=kadesh>shittim", "nebo"] },
  "kadesh>jericho": { src: "B3, B4", via: ["kadesh", "hor", [35.15, 30.3], "elath", [35.3, 30.2], "punon", "oboth", "iyeabarim", "zered", "arnon", "dibon", "almon", "nebo", "shittim", "jordanford", "jericho"] },
  // Paul's travels, along map B13 and the accounts in Acts
  "antioch>salamis": { src: "B13; Acts 13:4-5", via: ["antioch", "seleucia", [34.9, 35.62], "salamis"] },
  "cyprus>perga": { src: "B13; Acts 13:13", via: ["cyprus", [31.9, 35.3], [31.0, 36.45], "attalia", "perga"] },
  "cyprus>pantioch": { src: "B13; Acts 13:13-14", via: ["cyprus", "=cyprus>perga", "perga", [31.0, 37.6], "pantioch"] },
  "lystra>jerusalem": { src: "B13; Acts 14:21-26; 15:2-4", via: ["lystra", "iconium", "pantioch", [31.0, 37.6], "perga", "attalia", [31.4, 36.35], [33.4, 35.85], [35.3, 35.95], "seleucia", ">", "jerusalem"] },
  "jerusalem>philippi": { src: "B13; Acts 15:40-16:12", via: ["jerusalem", ">", "antioch", ">", "lystra", "iconium", "pantioch", [29.6, 38.9], [27.6, 39.45], "troas", "=troas>philippi", "philippi"] },
  "troas>philippi": { src: "B13; Acts 16:11-12", via: ["troas", [25.84, 39.86], [25.54, 40.34], "samothrace", "neapolis", "philippi"] },
  "philippi>athens": { src: "B13; Acts 16:12-17:15", via: ["philippi", ">", "beroea", "=beroea>athens", "athens"] },
  "beroea>athens": { src: "B13; Acts 17:14-15", via: ["beroea", [22.6, 40.33], [23.4, 39.95], [24.0, 39.5], [24.55, 38.95], [24.74, 38.76], [24.75, 38.25], [24.39, 37.74], [24.15, 37.55], [23.64, 37.86], "piraeus", "athens"] },
  "corinth>ephesus": { src: "B13; Acts 18:18-19", via: ["corinth", "cenchreae", [23.71, 37.74], [24.2, 37.5], [24.74, 37.39], [25.09, 37.29], [25.55, 37.28], [26.45, 37.52], [26.7, 37.95], [27.2, 37.9], "ephesus"] },
  "ephesus>jerusalem": { src: "B13; Acts 20:15-21:15", via: ["ephesus", ">", "miletus", "=miletus>tyre", "tyre", ">", "jerusalem"] },
  "miletus>tyre": { src: "B13; Acts 21:1-3", via: ["miletus", [27.21, 37.46], [27.16, 36.99], "cos", [27.41, 36.59], "rhodes", "patara", [31.31, 35.16], [31.5, 34.95], [33.6, 34.3], "tyre"] },
  "caesarea>malta": { src: "B13; Acts 27:1-28:1", via: ["caesarea", [34.91, 32.89], [35.31, 33.56], "sidon", [34.85, 35.45], [34.46, 35.76], [33.5, 35.82], [32.0, 36.15], "myra", [29.46, 36.06], [28.06, 36.51], [27.74, 36.51], [27.39, 36.66], "cnidus", "salmone", [26.36, 35.11], [26.09, 34.94], [24.79, 34.91], "fairhavens", "cauda", [20.0, 35.2], [16.5, 35.7], [14.44, 35.96], "malta"] },
  "malta>rome": { src: "B13; Acts 28:11-16", via: ["malta", [15.19, 36.74], [15.34, 37.04], "syracuse", [15.55, 37.6], "rhegium", [15.61, 38.24], [15.64, 38.26], [15.5, 38.6], [14.9, 39.6], [14.1, 40.6], "puteoli", ">", "rome"] },
  // the companions' legs: the same voyages, joined (Acts 13:4-13; 16:11; 17:14-18:5; 20:6-28:16)
  "philippi>corinth": { src: "B13; Acts 17:14-15; 18:5", via: ["philippi", "=philippi>athens", "athens", ">", "corinth"] },
  "philippi>rome": { src: "B13; Acts 20:6-28:16", via: ["philippi", "neapolis", [24.99, 40.64], [26.06, 39.74], "troas", ">", "assos", [26.59, 39.11], "mitylene", [26.66, 39.01], [26.24, 38.56], "chios", [26.54, 37.86], [26.61, 37.64], [26.91, 37.64], "samos", "trogyllium", [27.21, 37.46], "miletus", "=miletus>tyre", "tyre", ">", "caesarea", "=caesarea>malta", "malta", "=malta>rome", "rome"] },
  "jerusalem>perga": { src: "B13; Acts 12:25-13:13", via: ["jerusalem", ">", "antioch", "=antioch>salamis", "salamis", ">", "cyprus", "=cyprus>perga", "perga"] },
  // no source map: the usual ways through the wilderness, and by sea and road where ORBIS has no way
  "midian>sinai": { src: "common route", via: ["midian", "elath", [34.92, 29.56], [34.8, 29.48], [34.6, 29.1], "sinai"] },
  // Dublin to Holyhead by the packet boat, then the post road through Shrewsbury and Birmingham to London
  "dublin>london": { src: "common route", via: ["dublin", "holyhead", [-4.13, 53.23], [-3.17, 52.97], [-2.75, 52.71], [-1.9, 52.48], [-1.51, 52.41], [-0.99, 52.13], [-0.34, 51.75], "london"] },
  "dublin>cambridge": { src: "common route", via: ["dublin", "=dublin>london", "london", "cambridge"] },
};
