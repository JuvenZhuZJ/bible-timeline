/*
 * "About this timeline" card: topic tabs, the clickable drawing at the top, the figures in
 * the intro line, and the "try it" buttons that close the card and open the part they describe.
 * Opening and closing the card itself is in js/app.js (legend / about).
 */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const about = $("about");
  if (!about) return;
  const tabs = [...about.querySelectorAll(".ab-tab")];
  const panels = [...about.querySelectorAll(".ab-panel")];
  const scene = [...about.querySelectorAll(".ab-go")];

  function pick(name, focus) {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach((p) => { p.hidden = p.dataset.tab !== name; });
    scene.forEach((g) => g.classList.toggle("on", g.dataset.go === name));
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => { pick(t.dataset.tab); reveal(t.dataset.tab); });
    t.addEventListener("keydown", (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      let j = d ? (i + d + tabs.length) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
      if (j < 0) return;
      e.preventDefault(); pick(tabs[j].dataset.tab, true);
    });
  });

  // when the chosen topic starts below the bottom of the card (on a phone the tiles fill the
  // screen), scroll so the tiles sit at the top and the topic shows under them
  const card = about.querySelector(".about-card"), tabsBar = about.querySelector(".ab-tabs");
  function reveal(name) {
    const p = $("abp-" + name);
    if (!p || !card || !tabsBar) return;
    if (p.getBoundingClientRect().top > card.getBoundingClientRect().bottom - 120) tabsBar.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  // the drawing: each part opens the topic that explains it
  scene.forEach((g) => g.addEventListener("click", () => { pick(g.dataset.go); reveal(g.dataset.go); }));
  pick("start");

  // the figures line ("3,000 people · 60 major events · …") as separate chips with the number large
  const stats = $("aboutStats");
  if (stats && stats.textContent) {
    const parts = stats.textContent.replace(/[.。]\s*$/, "").split(/\s*·\s*/);
    stats.textContent = "";
    parts.forEach((s) => {
      const m = s.match(/^([\d,]+)(.*)$/);
      const chip = document.createElement("span");
      chip.className = "ab-stat";
      if (m) { const b = document.createElement("b"); b.textContent = m[1]; chip.append(b, m[2]); }
      else chip.textContent = s;
      stats.append(chip);
    });
  }

  // "try it": close the card, then open what the topic is about (after this click has finished,
  // so the page's own click-outside handling does not close it again)
  const TRY = {
    search() { const inp = $("searchInput"); if (inp) inp.focus(); },   // focusing it opens the box
    people() { const b = $("showBtn"); if (b && b.getAttribute("aria-expanded") !== "true") b.click(); },
    books() { const b = $("booksBtn"); if (b && b.getAttribute("aria-pressed") !== "true") b.click(); },
    legend() { if (!$("legend").classList.contains("open")) $("legendToggle").click(); },
    notes() { const b = $("notesOpen"); if (b) b.click(); },
  };
  about.querySelectorAll("[data-try]").forEach((b) => b.addEventListener("click", () => {
    about.hidden = true;
    const f = TRY[b.dataset.try];
    if (f) setTimeout(f, 0);
  }));
})();
