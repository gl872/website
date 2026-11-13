/* Krue site: shared behaviour for every page.
   - Waitlist pop-up (links ending in #start, #waitlist or #try, or [data-waitlist]). #try is the old site's waitlist anchor, kept so existing links still work
   - Updates pop-up for investors/partners/press (links ending in #updates, or [data-updates])
   - Touch devices: sections with [data-glow] get .k-awake while on screen (the hover colours) */
// Endpoints come from build-time env vars (see .env.example). If either is unset, its form shows
// the error message instead of a fake success, so a misconfigured deploy is visible right away.
const WAITLIST_ENDPOINT = import.meta.env.PUBLIC_INTAKE_URL || "";
const UPDATES_ENDPOINT = import.meta.env.PUBLIC_UPDATES_URL || "";

// Pushes a PII-free event to GTM's dataLayer (only acts once analytics consent is granted in GTM).
const track = (event, form) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, form });
};

// Sends a waitlist sign-up to the live Google Apps Script, using the same JSON contract as the
// previous site's inline form (the script replies {"ok":true}). Fields the new form no longer
// asks for (role, beta, help, updates) are sent empty so the Sheet columns stay aligned.
async function sendWaitlist(name, email) {
  if (!WAITLIST_ENDPOINT) throw new Error("PUBLIC_INTAKE_URL is not set");
  const res = await fetch(WAITLIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      submittedAt: new Date().toISOString(),
      form: "waitlist",
      name,
      email,
      role: "",
      roleOther: "",
      beta: false,
      help: "",
      updates: false,
      source: "waitlist-popup",
      page: location.pathname,
      website: "",
    }),
  });
  const json = await res.json();
  if (json?.ok !== true) throw new Error("Waitlist endpoint did not confirm");
}

// Sends an updates sign-up to the "Updates" Apps Script (krue-site-handoff/integrations/
// updates-sheet-apps-script.gs), which reads form-encoded fields. no-cors means the response
// can't be read, so only network failures surface as errors.
async function sendUpdates(fields) {
  if (!UPDATES_ENDPOINT) throw new Error("PUBLIC_UPDATES_URL is not set");
  await fetch(UPDATES_ENDPOINT, { method: "POST", mode: "no-cors", body: new URLSearchParams(fields) });
}

// WAITLIST POP-UP: every "Join the waitlist" button (links ending in #start) opens this form.
function mountWaitlist() {
  if (document.getElementById("wl-root")) return () => {};
  const css = `
  #wl-root{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}
  #wl-root.wl-open{display:flex}
  .wl-back{position:absolute;inset:0;background:rgba(20,50,90,.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity 240ms}
  .wl-open .wl-back{opacity:1}
  .wl-card{position:relative;width:100%;max-width:460px;max-height:calc(100dvh - 32px);overflow:auto;box-sizing:border-box;background:#FFFFFF;border-radius:28px;padding:0 32px 28px;box-shadow:0 24px 60px rgba(20,50,90,.22);color:#14325A;font-family:var(--font-body);transform:translateY(16px) scale(.98);opacity:0;transition:transform 320ms cubic-bezier(0.16,1,0.3,1),opacity 240ms}
  .wl-open .wl-card{transform:none;opacity:1}
  .wl-art{display:block;width:calc(100% + 64px);height:64px;margin:56px -32px 14px}
  .wl-art path{transition:d 700ms cubic-bezier(0.16,1,0.3,1)}
  .wl-x{position:absolute;top:12px;right:12px;width:40px;height:40px;border:0;border-radius:999px;background:#FFFFFF;color:#69727F;font:400 26px/1 var(--font-body);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(20,50,90,.12)}
  .wl-x:hover{background:#F4F1EC;color:#14325A}
  .wl-eye{margin:0 0 8px;font:700 13px/1 var(--font-display);letter-spacing:.16em;text-transform:uppercase;color:#69727F}
  .wl-h{margin:0 0 10px;font:800 32px/1.08 var(--font-display);letter-spacing:-0.03em;color:#14325A}
  .wl-p{margin:0 0 22px;font:400 17px/1.55 var(--font-body);color:#3B4656;text-wrap:pretty}
  .wl-f{display:flex;flex-direction:column;gap:16px}
  .wl-l{display:flex;flex-direction:column;gap:6px;font:700 15px/1.2 var(--font-display);color:#14325A}
  .wl-i{font:400 16px/1.3 var(--font-body);color:#14325A;background:#FBF8F4;border:1.5px solid #DDD5C8;border-radius:14px;padding:14px 16px;outline:none;transition:border-color 160ms,box-shadow 160ms;width:100%;box-sizing:border-box}
  .wl-i::placeholder{color:#9AA1AB}
  .wl-i:focus{border-color:#235592;box-shadow:0 0 0 4px #E2F5FC;background:#FFFFFF}
  .wl-i[aria-invalid="true"]{border-color:#A93E72;box-shadow:0 0 0 4px #FCE6F0}
  .wl-err{min-height:0;margin:0;font:500 14px/1.4 var(--font-body);color:#A93E72}
  .wl-err:empty{display:none}
  .wl-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
  .wl-btn{margin-top:4px;border:0;cursor:pointer;background:#E0EE40;color:#14325A;font:700 17px/1 var(--font-display);padding:18px 28px;border-radius:999px;transition:background-color 200ms,transform 200ms cubic-bezier(0.16,1,0.3,1)}
  .wl-btn:hover{background:#D2E02A;transform:translateY(-1px)}
  .wl-btn:focus-visible,.wl-x:focus-visible,.wl-done:focus-visible{outline:3px solid #235592;outline-offset:3px}
  .wl-btn[disabled]{opacity:.7;cursor:progress;transform:none}
  .wl-fine{margin:16px 0 0;font:400 14px/1.5 var(--font-body);color:#69727F;text-align:center}
  .wl-fine a{color:#235592;font-weight:700;text-decoration:underline;text-decoration-color:#F290BA;text-underline-offset:3px;text-decoration-thickness:2px}
  .wl-ok{display:none;text-align:center;padding:4px 0 4px}
  .wl-sent .wl-ok{display:block}
  .wl-sent .wl-form{display:none}
  .wl-check{width:64px;height:64px;margin:4px auto 16px;border-radius:999px;background:#E3F2EC;display:flex;align-items:center;justify-content:center}
  .wl-done{margin-top:6px;border:1.5px solid #14325A;background:transparent;color:#14325A;cursor:pointer;font:700 16px/1 var(--font-display);padding:15px 26px;border-radius:999px}
  .wl-done:hover{background:#14325A;color:#FFFFFF}
  @media (max-width:520px){.wl-card{padding:0 22px 22px;border-radius:24px}.wl-art{width:calc(100% + 44px);margin:52px -22px 12px}.wl-h{font-size:28px}}
  @media (prefers-reduced-motion:reduce){.wl-card,.wl-back,.wl-art path{transition:none}}
  `;
  const COLORS = ["#235592", "#7AD1EF", "#90C9B2", "#F3B258", "#F68B65", "#F290BA", "#AC72B0"];
  const wavy = (i) => { const y = 14 + i * 6; return `M -10 ${y} C 60 ${y - 16}, 110 ${y + 18}, 180 ${y} S 300 ${y - 14}, 470 ${y + 4}`; };
  const flat = (i) => { const y = 14 + i * 6; return `M -10 ${y} C 60 ${y}, 110 ${y}, 180 ${y} S 300 ${y}, 470 ${y}`; };
  const art = `<svg class="wl-art" viewBox="0 0 460 64" preserveAspectRatio="none" aria-hidden="true">${COLORS.map((c, i) => `<path d="${wavy(i)}" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`).join("")}</svg>`;
  const root = document.createElement("div");
  root.id = "wl-root";
  root.innerHTML = `<style>${css}</style>
  <div class="wl-back" data-wl-close></div>
  <div class="wl-card" role="dialog" aria-modal="true" aria-labelledby="wl-h">
    ${art}
    <button type="button" class="wl-x" aria-label="Close" data-wl-close>&times;</button>
    <div class="wl-form">
      <p class="wl-eye">Krue beta</p>
      <h2 class="wl-h" id="wl-h">Join the waitlist</h2>
      <p class="wl-p">Be one of the first to try Krue. We'll email you when there's a spot for you.</p>
      <form class="wl-f" novalidate>
        <label class="wl-l">Name<input class="wl-i" name="name" type="text" autocomplete="name" placeholder="Your name" required></label>
        <label class="wl-l">Email<input class="wl-i" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" required></label>
        <label class="wl-hp" aria-hidden="true">Company<input name="company" tabindex="-1" autocomplete="off"></label>
        <p class="wl-err" role="alert"></p>
        <button class="wl-btn" type="submit">Join the waitlist</button>
      </form>
      <p class="wl-fine">We'll only use this to contact you about Krue. <a href="/privacy/" target="_blank">Privacy</a></p>
    </div>
    <div class="wl-ok" aria-live="polite">
      <div class="wl-check"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3E7F66" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <h2 class="wl-h" tabindex="-1">You're on the list.</h2>
      <p class="wl-p wl-thanks"></p>
      <button type="button" class="wl-done" data-wl-close>Done</button>
    </div>
  </div>`;
  document.body.appendChild(root);
  const card = root.querySelector(".wl-card");
  const form = root.querySelector("form");
  const err = root.querySelector(".wl-err");
  const btn = root.querySelector(".wl-btn");
  const paths = root.querySelectorAll(".wl-art path");
  let lastFocus = null;
  const setArt = (straight) => paths.forEach((p, i) => p.setAttribute("d", straight ? flat(i) : wavy(i)));
  const open = () => {
    lastFocus = document.activeElement;
    card.classList.remove("wl-sent"); form.reset(); err.textContent = ""; setArt(false);
    form.querySelectorAll(".wl-i").forEach(i => i.removeAttribute("aria-invalid"));
    btn.disabled = false; btn.textContent = "Join the waitlist";
    root.classList.add("wl-open"); document.documentElement.style.overflow = "hidden";
    setTimeout(() => form.elements.name.focus(), 60);
  };
  const close = () => {
    root.classList.remove("wl-open"); document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  const onDocClick = (e) => {
    const a = e.target.closest && e.target.closest('a[href$="#start"], a[href$="#waitlist"], a[href$="#try"], [data-waitlist]');
    if (a) { e.preventDefault(); open(); return; }
    if (e.target.closest && e.target.closest("[data-wl-close]") && root.contains(e.target)) close();
  };
  const onKey = (e) => {
    if (!root.classList.contains("wl-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      const f = [...card.querySelectorAll("button, input:not([tabindex='-1']), a[href]")].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const okName = name.length > 0, okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    form.elements.name.setAttribute("aria-invalid", String(!okName));
    form.elements.email.setAttribute("aria-invalid", String(!okEmail));
    if (!okName || !okEmail) { err.textContent = !okName ? "Please add your name." : "Please check your email address."; (!okName ? form.elements.name : form.elements.email).focus(); return; }
    err.textContent = ""; btn.disabled = true; btn.textContent = "Joining…";
    try {
      // Spam trap: bots that fill the hidden "company" field get the success screen, but nothing is sent.
      if (!form.elements.company.value) await sendWaitlist(name, email);
      track("form_submit_success", "waitlist");
      root.querySelector(".wl-thanks").textContent = `Thanks, ${name.split(/\s+/)[0]}. We'll email you at ${email} when Krue opens up.`;
      card.classList.add("wl-sent"); setArt(true);
      setTimeout(() => root.querySelector(".wl-ok .wl-h").focus(), 60);
    } catch (x) {
      console.warn("Waitlist sign-up failed:", x && x.message);
      track("form_submit_error", "waitlist");
      btn.disabled = false; btn.textContent = "Join the waitlist";
      err.textContent = "Something went wrong. Please try again, or email community@krue.io.";
    }
  });
  document.addEventListener("click", onDocClick, true);
  document.addEventListener("keydown", onKey);
  if (location.hash === "#waitlist" || location.hash === "#try") setTimeout(open, 300);
  return () => { document.removeEventListener("click", onDocClick, true); document.removeEventListener("keydown", onKey); root.remove(); document.documentElement.style.overflow = ""; };
}

// UPDATES POP-UP: "Get updates from Krue" links (ending in #updates) open this form, for investors, partners and press.
// Reuses the waitlist pop-up's styles (mountWaitlist must run first).
function mountUpdates() {
  if (document.getElementById("up-root")) return () => {};
  const css = `
  #up-root{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}
  #up-root.wl-open{display:flex}
  .up-card .wl-eye{color:#235592}
  .up-top{display:block;height:56px}
  .up-roles{border:0;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
  .up-roles legend{padding:0;margin-bottom:8px;font:700 15px/1.2 var(--font-display);color:#14325A}
  .up-pills{display:flex;flex-wrap:wrap;gap:8px}
  .up-pill{position:relative}
  .up-pill input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}
  .up-pill span{display:inline-block;padding:10px 16px;border-radius:999px;background:#E4EDF8;color:#235592;font:700 15px/1 var(--font-display);transition:background-color 160ms,color 160ms}
  .up-pill input:checked + span{background:#14325A;color:#FFFFFF}
  .up-pill input:focus-visible + span{outline:3px solid #7AD1EF;outline-offset:2px}
  .up-opt{font-weight:500;color:#69727F}
  .up-card .wl-btn{background:#14325A;color:#FFFFFF}
  .up-card .wl-btn:hover{background:#235592}
  .up-card .wl-check{background:#E4EDF8}
  @media (max-width:520px){.up-top{height:52px}}
  `;
  const root = document.createElement("div");
  root.id = "up-root";
  root.innerHTML = `<style>${css}</style>
  <div class="wl-back" data-up-close></div>
  <div class="wl-card up-card" role="dialog" aria-modal="true" aria-labelledby="up-h">
    <span class="up-top" aria-hidden="true"></span>
    <button type="button" class="wl-x" aria-label="Close" data-up-close>&times;</button>
    <div class="wl-form">
      <p class="wl-eye">Investors, partners, press</p>
      <h2 class="wl-h" id="up-h">Get updates from Krue</h2>
      <p class="wl-p">News on how Krue is growing, a few times a year. This isn’t the waitlist for the app.</p>
      <form class="wl-f" novalidate>
        <label class="wl-l">Name<input class="wl-i" name="name" type="text" autocomplete="name" placeholder="Your name" required></label>
        <label class="wl-l">Email<input class="wl-i" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" required></label>
        <fieldset class="up-roles"><legend>I’m a…</legend><div class="up-pills">
          <label class="up-pill"><input type="radio" name="role" value="Investor"><span>Investor</span></label>
          <label class="up-pill"><input type="radio" name="role" value="Partner"><span>Partner</span></label>
          <label class="up-pill"><input type="radio" name="role" value="Press"><span>Press</span></label>
          <label class="up-pill"><input type="radio" name="role" value="Other"><span>Other</span></label>
        </div></fieldset>
        <label class="wl-l"><span>Organization <span class="up-opt">(optional)</span></span><input class="wl-i" name="org" type="text" autocomplete="organization" placeholder="Company or publication"></label>
        <label class="wl-hp" aria-hidden="true">Company<input name="company" tabindex="-1" autocomplete="off"></label>
        <p class="wl-err" role="alert"></p>
        <button class="wl-btn" type="submit">Get updates</button>
      </form>
      <p class="wl-fine">We’ll only use this to send Krue updates. Unsubscribe any time. <a href="/privacy/" target="_blank">Privacy</a></p>
    </div>
    <div class="wl-ok" aria-live="polite">
      <div class="wl-check"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#235592" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <h2 class="wl-h" tabindex="-1">You’re on the list for updates.</h2>
      <p class="wl-p up-thanks"></p>
      <button type="button" class="wl-done" data-up-close>Done</button>
    </div>
  </div>`;
  document.body.appendChild(root);
  const card = root.querySelector(".wl-card");
  const form = root.querySelector("form");
  const err = root.querySelector(".wl-err");
  const btn = root.querySelector(".wl-btn");
  let lastFocus = null;
  const open = () => {
    lastFocus = document.activeElement;
    card.classList.remove("wl-sent"); form.reset(); err.textContent = "";
    form.querySelectorAll(".wl-i").forEach(i => i.removeAttribute("aria-invalid"));
    btn.disabled = false; btn.textContent = "Get updates";
    root.classList.add("wl-open"); document.documentElement.style.overflow = "hidden";
    setTimeout(() => form.elements.name.focus(), 60);
  };
  const close = () => {
    root.classList.remove("wl-open"); document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  const onDocClick = (e) => {
    const a = e.target.closest && e.target.closest('a[href$="#updates"], [data-updates]');
    if (a) { e.preventDefault(); open(); return; }
    if (e.target.closest && e.target.closest("[data-up-close]") && root.contains(e.target)) close();
  };
  const onKey = (e) => {
    if (!root.classList.contains("wl-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      const f = [...card.querySelectorAll("button, input:not([tabindex='-1']), a[href]")].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const role = (form.querySelector('input[name="role"]:checked') || {}).value || "";
    const org = form.elements.org.value.trim();
    const okName = name.length > 0, okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    form.elements.name.setAttribute("aria-invalid", String(!okName));
    form.elements.email.setAttribute("aria-invalid", String(!okEmail));
    if (!okName || !okEmail) { err.textContent = !okName ? "Please add your name." : "Please check your email address."; (!okName ? form.elements.name : form.elements.email).focus(); return; }
    err.textContent = ""; btn.disabled = true; btn.textContent = "Sending…";
    try {
      if (!form.elements.company.value) {
        await sendUpdates({ list: "updates", name, email, role, org, page: location.pathname, submitted: new Date().toISOString() });
      }
      track("form_submit_success", "updates");
      root.querySelector(".up-thanks").textContent = `Thanks, ${name.split(/\s+/)[0]}. We’ll send Krue news to ${email}.`;
      card.classList.add("wl-sent");
      setTimeout(() => root.querySelector(".wl-ok .wl-h").focus(), 60);
    } catch (x) {
      console.warn("Updates sign-up failed:", x && x.message);
      track("form_submit_error", "updates");
      btn.disabled = false; btn.textContent = "Get updates";
      err.textContent = "Something went wrong. Please try again, or email community@krue.io.";
    }
  });
  document.addEventListener("click", onDocClick, true);
  document.addEventListener("keydown", onKey);
  if (location.hash === "#updates") setTimeout(open, 300);
  return () => { document.removeEventListener("click", onDocClick, true); document.removeEventListener("keydown", onKey); root.remove(); document.documentElement.style.overflow = ""; };
}

const boot = () => {
  mountWaitlist();
  mountUpdates();
  if (window.matchMedia && matchMedia("(hover: none)").matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("k-awake", e.isIntersecting)), { threshold: 0.35 });
    document.querySelectorAll("[data-glow]").forEach(el => io.observe(el));
  }
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
