/* Krue blog index: category filter pills.
   Pills look like the hero condition pills (pale at rest, vibrant on hover); the selected pill stays vibrant.
   The first post that matches the filter shows in the large "featured" card; the rest show in the grid.
   With a CMS, render one featured block + one grid card per post (with data-idx and data-type) and keep this script. */
(() => {
  const PILL = {"All": ["#E4EDF8", "#235592", "#235592", "#FFFFFF"], "Company news": ["#FCE6F0", "#A93E72", "#E2169E", "#FFFFFF"], "Articles": ["#E2F5FC", "#1F7FA3", "#3ABAE8", "#14325A"], "Practical guides": ["#E3F2EC", "#3E7F66", "#90C9B2", "#14325A"]};
  const pills = [...document.querySelectorAll("[data-filter]")];
  const feats = [...document.querySelectorAll(".b-feat[data-idx]")];
  const cards = [...document.querySelectorAll(".b-grid .b-card[data-idx]")];
  const apply = (label) => {
    pills.forEach((b) => {
      const sel = b.dataset.filter === label;
      const [bg, fg, bgh, fgh] = PILL[b.dataset.filter];
      b.setAttribute("aria-pressed", String(sel));
      b.style.setProperty("--bg", sel ? bgh : bg);
      b.style.setProperty("--fg", sel ? fgh : fg);
    });
    const match = (el) => label === "All" || el.dataset.type === label;
    const first = feats.find(match);
    feats.forEach((f) => (f.hidden = f !== first));
    cards.forEach((c) => (c.hidden = !match(c) || (first && c.dataset.idx === first.dataset.idx)));
  };
  pills.forEach((b) => b.addEventListener("click", () => apply(b.dataset.filter)));
  apply("All");
})();
