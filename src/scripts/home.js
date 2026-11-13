/* Krue home page behaviour (plain JS port of the design file's logic).
   1. Hero "untangle": the coloured lines behind the prep sheet straighten as the hero scrolls into view.
      Each line lerps between a tangled path (t) and a straight path (s); progress is written to --p.
   2. "How it works": the step nearest the middle of the screen becomes active. The pinned phone screen,
      its pop-out callout and the step number colours all follow from CSS variables set on <html>:
      --so0..3 (screen opacity), --sy0..3 (callout slide), --cur0..3 / --curfg0..3 (step number colours),
      --activeTint (blob behind the phone). Clicking a step scrolls to it. */
(() => {
  const SETS = {"c": [{"t": [[-20, 40.0], [156, 162.0, 153, 171, 300, 210], [491, 237, 440, 207, 600, 62], [670, 106, 834, 132, 900, 250], [960, 215, 1037, 430, 1220, 343]], "s": [[-20, 161.5], [80, 161.5, 190, 161.5, 290, 161.5], [390, 161.5, 500, 161.5, 600, 161.5], [700, 161.5, 810, 161.5, 910, 161.5], [1010, 161.5, 1120, 161.5, 1220, 161.5]]}, {"t": [[-20, 91.42857142857143], [98, 42.42857142857143, 107, 127, 300, 34], [451, 90, 479, 38, 600, 191], [803, 212, 750, 430, 900, 320], [1047, 430, 1013, 208, 1220, 278]], "s": [[-20, 172.5], [80, 172.5, 190, 172.5, 290, 172.5], [390, 172.5, 500, 172.5, 600, 172.5], [700, 172.5, 810, 172.5, 910, 172.5], [1010, 172.5, 1120, 172.5, 1220, 172.5]]}, {"t": [[-20, 142.85714285714286], [125, 22.85714285714286, 148, 278, 300, 152], [458, 242, 402, 362, 600, 403], [684, 430, 782, 49, 900, 48], [1015, 119, 1132, 167, 1220, 124]], "s": [[-20, 183.5], [80, 183.5, 190, 183.5, 290, 183.5], [390, 183.5, 500, 183.5, 600, 183.5], [700, 183.5, 810, 183.5, 910, 183.5], [1010, 183.5, 1120, 183.5, 1220, 183.5]]}, {"t": [[-20, 194.28571428571428], [101, 308.2857142857143, 174, 351, 300, 339], [496, 430, 530, 287, 600, 210], [739, 328, 739, 338, 900, 375], [1092, 318, 1005, 94, 1220, 206]], "s": [[-20, 194.5], [80, 194.5, 190, 194.5, 290, 194.5], [390, 194.5, 500, 194.5, 600, 194.5], [700, 194.5, 810, 194.5, 910, 194.5], [1010, 194.5, 1120, 194.5, 1220, 194.5]]}, {"t": [[-20, 245.71428571428572], [104, 384.7142857142857, 98, 257, 300, 351], [473, 188, 497, 246, 600, 136], [820, 10, 821, 190, 900, 224], [1090, 372, 1021, 381, 1220, 308]], "s": [[-20, 205.5], [80, 205.5, 190, 205.5, 290, 205.5], [390, 205.5, 500, 205.5, 600, 205.5], [700, 205.5, 810, 205.5, 910, 205.5], [1010, 205.5, 1120, 205.5, 1220, 205.5]]}, {"t": [[-20, 297.14285714285717], [107, 430, 85, 347, 300, 253], [480, 409, 460, 58, 600, 217], [807, 171, 786, 53, 900, 46], [1070, 10, 1115, 430, 1220, 371]], "s": [[-20, 216.5], [80, 216.5, 190, 216.5, 290, 216.5], [390, 216.5, 500, 216.5, 600, 216.5], [700, 216.5, 810, 216.5, 910, 216.5], [1010, 216.5, 1120, 216.5, 1220, 216.5]]}, {"t": [[-20, 348.57142857142856], [185, 354.57142857142856, 105, 161, 300, 131], [387, 97, 427, 10, 600, 95], [691, 137, 823, 99, 900, 80], [965, 45, 1150, 30, 1220, 129]], "s": [[-20, 227.5], [80, 227.5, 190, 227.5, 290, 227.5], [390, 227.5, 500, 227.5, 600, 227.5], [700, 227.5, 810, 227.5, 910, 227.5], [1010, 227.5, 1120, 227.5, 1220, 227.5]]}, {"t": [[-20, 400.0], [91, 430, 105, 184, 300, 122], [504, 242, 538, 275, 600, 408], [704, 315, 701, 294, 900, 291], [971, 430, 1100, 172, 1220, 311]], "s": [[-20, 238.5], [80, 238.5, 190, 238.5, 290, 238.5], [390, 238.5, 500, 238.5, 600, 238.5], [700, 238.5, 810, 238.5, 910, 238.5], [1010, 238.5, 1120, 238.5, 1220, 238.5]]}]};
  const STEPS = [{"color": "#7AD1EF", "tint": "#E2F5FC", "fg": "#14325A"}, {"color": "#E0EE40", "tint": "#F4F8D2", "fg": "#14325A"}, {"color": "#F290BA", "tint": "#FCE6F0", "fg": "#14325A"}, {"color": "#235592", "tint": "#E4EDF8", "fg": "#FFFFFF"}];
  const REST_FG = ["#1F7FA3", "#6E7A0C", "#A93E72", "#235592"];
  const root = document.documentElement;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lerpPath = (l, p) => {
    const m = [l.t[0][0] + (l.s[0][0] - l.t[0][0]) * p, l.t[0][1] + (l.s[0][1] - l.t[0][1]) * p];
    let d = "M " + m[0].toFixed(1) + " " + m[1].toFixed(1);
    for (let k = 1; k < l.t.length; k++) {
      const a = l.t[k], b = l.s[k];
      d += " C " + a.map((v, j) => (v + (b[j] - v) * p).toFixed(1)).join(" ").replace(/^(\S+ \S+) (\S+ \S+) /, "$1, $2, ");
    }
    return d;
  };
  const untangle = () => {
    const vh = window.innerHeight || 900;
    document.querySelectorAll("[data-untangle]").forEach(st => {
      const set = SETS[st.getAttribute("data-untangle")]; if (!set) return;
      const r = st.getBoundingClientRect();
      let p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.7)));
      p = p * p * (3 - 2 * p);
      st.style.setProperty("--p", p.toFixed(3));
      st.querySelectorAll(".h-l").forEach((el, i) => set[i] && el.setAttribute("d", lerpPath(set[i], p)));
    });
  };

  let active = -1;
  const setActive = (a) => {
    if (a === active) return;
    active = a;
    STEPS.forEach((s, i) => {
      root.style.setProperty("--cur" + i, i === a ? s.color : s.tint);
      root.style.setProperty("--curfg" + i, i === a ? s.fg : REST_FG[i]);
      root.style.setProperty("--so" + i, i === a ? "1" : "0");
      root.style.setProperty("--sy" + i, i === a ? "0px" : "14px");
    });
    root.style.setProperty("--activeTint", STEPS[a].tint);
  };
  const steps = () => document.querySelectorAll("[data-step]");
  const onScroll = () => {
    let a = 0;
    steps().forEach((el, i) => { if (el.getBoundingClientRect().top < window.innerHeight * 0.5) a = i; });
    setActive(a);
  };

  setActive(0);
  const tick = () => { untangle(); onScroll(); };
  document.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", tick);
  document.addEventListener("DOMContentLoaded", tick);
  tick();
  steps().forEach((el) => el.addEventListener("click", () => el.scrollIntoView({ behavior: "smooth", block: "center" })));
})();
