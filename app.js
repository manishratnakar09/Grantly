/* Grantly app logic.
   Structure: helpers → storage → eligibility engine → renderers → events. */
(() => {
"use strict";

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const inr = n => "₹" + n.toLocaleString("en-IN");
const daysLeft = d => Math.ceil((new Date(d) - new Date(new Date().toDateString())) / 864e5);
const byId = id => SCHOLARSHIPS.find(s => s.id === +id);
const STATUSES = ["Saved", "Applying", "Applied", "Awarded", "Rejected"];
let toastTimer;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("on"), 2200);
}

/* ---------- Storage (wrapped: storage can be blocked) ---------- */
const read = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
let tracked = read("grantly.tracked", {});   // { id: {status, docs:[0|1]} }
const saved = read("grantly.profile", null);

/* ---------- Eligibility engine ---------- */
const profile = () => ({
  lv: $("lvl").value, f: $("fld").value, c: $("cat").value, g: $("gen").value,
  inc: +$("inc").value, mk: +$("mk").value
});

// Returns passed/failed criteria (human-readable) and a 0-100 match score.
function evaluate(s, u) {
  const ok = [], no = [];
  const check = (pass, yes, nope) => (pass ? ok : no).push(pass ? yes : nope);
  check(s.lv.includes(u.lv), "Level fits", "Not for your level");
  if (s.f) check(s.f.includes(u.f), "Field fits", "Different field");
  if (s.c) check(s.c.includes(u.c), "Category fits", "Category: " + s.c.join("/"));
  if (s.g) check(s.g === u.g, "Gender criterion fits", "For " + s.g + " applicants");
  if (s.inc != null) check(u.inc <= s.inc, "Income under ₹" + s.inc + "L", "Income limit ₹" + s.inc + "L");
  if (s.mm) check(u.mk >= s.mm, "Marks ≥ " + s.mm + "%", "Needs " + s.mm + "%+ marks");
  return { ok, no, score: Math.round(ok.length / (ok.length + no.length) * 100), eligible: no.length === 0 };
}

/* ---------- Renderers ---------- */
const tags = e => e.ok.map(x => `<span class="tag">✓ ${x}</span>`).join("") + e.no.map(x => `<span class="tag e">✗ ${x}</span>`).join("");
const dayTag = k => `<span class="tag ${k <= 10 ? "e" : "w"}">${k} day${k === 1 ? "" : "s"} left</span>`;

// Hero: total money you can still claim + one "next best action".
function renderSummary() {
  const u = profile();
  const open = SCHOLARSHIPS.filter(s => daysLeft(s.deadline) >= 0).map(s => ({ s, e: evaluate(s, u) }));
  const el = open.filter(x => x.e.eligible);
  const total = el.reduce((a, x) => a + x.s.amount, 0);
  let nba = "Fill in your profile to see matches.";
  const urgentTracked = Object.keys(tracked).map(byId)
    .filter(s => ["Saved", "Applying"].includes(tracked[s.id].status))
    .sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline))[0];
  if (urgentTracked) {
    const t = tracked[urgentTracked.id], missing = t.docs.filter(d => !d).length;
    nba = `⏰ Next: ${urgentTracked.name} closes in ${daysLeft(urgentTracked.deadline)} days${missing ? ` · ${missing} document${missing > 1 ? "s" : ""} still missing` : " · all documents ready, apply now!"}`;
  } else if (el.length) {
    const best = el.sort((a, b) => b.s.amount - a.s.amount)[0].s;
    nba = `💡 Start with ${best.name} (${inr(best.amount)}). Tap “Track” to get its checklist.`;
  }
  $("sum").innerHTML = `<p>You may be eligible for</p><p><b>${el.length}</b> scholarship${el.length === 1 ? "" : "s"} worth up to <b>${inr(total)}</b></p><p class="nba">${nba}</p>`;
}

function renderList() {
  const u = profile(), q = $("q").value.toLowerCase(), mode = $("srt").value, only = $("only").checked;
  let r = SCHOLARSHIPS.filter(s => daysLeft(s.deadline) >= 0 && (s.name + s.provider).toLowerCase().includes(q))
    .map(s => ({ s, e: evaluate(s, u) })).filter(x => !only || x.e.eligible);
  r.sort((a, b) => mode === "a" ? b.s.amount - a.s.amount : mode === "d" ? daysLeft(a.s.deadline) - daysLeft(b.s.deadline) : b.e.score - a.e.score);
  $("list").innerHTML = r.map(({ s, e }) => `
    <article class="card" aria-labelledby="n${s.id}">
      <div class="head"><div><h3 id="n${s.id}" style="margin:0">${s.name}</h3><p class="mu">${s.provider}</p></div><div class="amt">${inr(s.amount)}</div></div>
      <div class="meter" role="img" aria-label="${e.score}% match"><i style="width:${e.score}%"></i></div>
      <p><b>${e.score}% match</b> · ${e.eligible ? "✅ You look eligible" : "⚠️ Partly eligible"} · ${dayTag(daysLeft(s.deadline))}</p>
      <div>${tags(e)}</div>
      <div class="actions">
        <button type="button" data-act="track" data-id="${s.id}" ${tracked[s.id] ? "disabled" : ""}>${tracked[s.id] ? "Tracking ✓" : "+ Track"}</button>
        <button type="button" class="g" data-act="detail" data-id="${s.id}">Details</button>
      </div>
    </article>`).join("") ||
    `<div class="card empty"><div class="big">🔎</div><p>No scholarships match your search or filters.</p></div>`;
}

function renderTracker() {
  const ids = Object.keys(tracked).sort((a, b) => daysLeft(byId(a).deadline) - daysLeft(byId(b).deadline));
  const n = st => ids.filter(i => tracked[i].status === st).length;
  $("stats").innerHTML = ["Saved", "Applying", "Applied"].map(x => `<div class="card"><b>${n(x)}</b><span class="mu">${x}</span></div>`).join("");
  $("tracker").innerHTML = ids.map(i => {
    const s = byId(i), t = tracked[i], done = t.docs.reduce((a, b) => a + b, 0), pc = Math.round(done / t.docs.length * 100);
    return `<article class="card" aria-labelledby="tn${i}">
      <div class="head"><div><h3 id="tn${i}" style="margin:0">${s.name}</h3><p class="mu">${inr(s.amount)} · ${dayTag(daysLeft(s.deadline))}</p></div>
        <div><label for="st${i}">Status</label><select id="st${i}" data-act="status" data-id="${i}">${STATUSES.map(x => `<option ${x === t.status ? "selected" : ""}>${x}</option>`).join("")}</select></div></div>
      <div class="meter" role="img" aria-label="${pc}% of documents ready"><i style="width:${pc}%"></i></div>
      <p class="mu small">Documents ready: ${done}/${t.docs.length}</p>
      ${s.docs.map((d, j) => `<label class="chk"><input type="checkbox" data-act="doc" data-id="${i}" data-i="${j}" ${t.docs[j] ? "checked" : ""}> ${d}</label>`).join("")}
      <div class="actions"><button type="button" class="g" data-act="detail" data-id="${i}">Details</button><button type="button" class="g" data-act="remove" data-id="${i}">Remove</button></div>
    </article>`;
  }).join("") || `<div class="card empty"><div class="big">📌</div><h2>Nothing tracked yet</h2><p class="mu">Open Discover and tap “+ Track” on a scholarship to get a deadline countdown and document checklist.</p></div>`;
}

const renderAll = () => { renderSummary(); renderList(); renderTracker(); };

/* ---------- Detail dialog + calendar reminder ---------- */
function openDetail(id) {
  const s = byId(id), e = evaluate(s, profile()), k = daysLeft(s.deadline);
  $("dlg").innerHTML = `<h2 id="dt">${s.name}</h2><p class="mu">${s.provider}</p>
    <p style="margin-top:8px">${s.about}</p><p><b>${inr(s.amount)}</b> · ${dayTag(k)} · Deadline ${s.deadline}</p>
    <h3>Your eligibility</h3><div>${tags(e)}</div>
    <h3>Documents needed</h3><ul>${s.docs.map(d => `<li>${d}</li>`).join("")}</ul>
    <div class="actions">
      <button type="button" data-act="track" data-id="${s.id}" ${tracked[s.id] ? "disabled" : ""}>${tracked[s.id] ? "Tracking ✓" : "+ Track"}</button>
      <button type="button" class="g" data-act="ics" data-id="${s.id}">📅 Add reminder</button>
      <a href="${APPLY_URL}" target="_blank" rel="noopener noreferrer"><button type="button" class="g">Apply on portal ↗</button></a>
      <button type="button" class="g" data-act="close">Close</button>
    </div>`;
  $("dlg").showModal();
}

// Builds an .ics file: all-day event on the deadline with an alert 3 days earlier.
function downloadReminder(id) {
  const s = byId(id), d = s.deadline.replace(/-/g, ""), nx = new Date(s.deadline); nx.setDate(nx.getDate() + 1);
  const end = nx.toISOString().slice(0, 10).replace(/-/g, "");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Grantly//EN", "BEGIN:VEVENT", `UID:grantly-${s.id}@local`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:Deadline: ${s.name}`, "BEGIN:VALARM", "TRIGGER:-P3D", "ACTION:DISPLAY", "DESCRIPTION:Scholarship deadline in 3 days", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = `grantly-${s.id}.ics`; a.click(); URL.revokeObjectURL(a.href);
  toast("Reminder file downloaded");
}

/* ---------- Events (delegated, no inline handlers) ---------- */
function onAction(el) {
  const { act, id } = el.dataset;
  if (act === "track") { tracked[id] = { status: "Saved", docs: byId(id).docs.map(() => 0) }; write("grantly.tracked", tracked); toast("Added to your tracker"); }
  else if (act === "remove") { delete tracked[id]; write("grantly.tracked", tracked); toast("Removed"); }
  else if (act === "doc") tracked[id].docs[+el.dataset.i] = el.checked ? 1 : 0;
  else if (act === "status") tracked[id].status = el.value;
  else if (act === "detail") return openDetail(id);
  else if (act === "ics") return downloadReminder(id);
  else if (act === "close") return $("dlg").close();
  write("grantly.tracked", tracked);
  if ($("dlg").open) $("dlg").close();
  renderAll();
}
document.addEventListener("click", ev => { const el = ev.target.closest("button[data-act]"); if (el) onAction(el); });
document.addEventListener("change", ev => { const el = ev.target.closest("[data-act='doc'],[data-act='status']"); if (el) onAction(el); });

// Profile and filters re-render live; profile is remembered.
["lvl", "fld", "cat", "gen", "inc", "mk"].forEach(i => $(i).addEventListener("input", () => { write("grantly.profile", profile()); renderAll(); }));
["q", "srt", "only"].forEach(i => $(i).addEventListener("input", renderList));

// Accessible tabs: click + arrow-key navigation.
const tabs = [$("t-d"), $("t-t")];
function selectTab(t) {
  tabs.forEach(x => { const on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $(x.getAttribute("aria-controls")).hidden = !on; });
  t.focus(); renderTracker();
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => selectTab(t));
  t.addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") selectTab(tabs[(i + 1) % tabs.length]); });
});

// Theme toggle.
$("theme").addEventListener("click", () => {
  const r = document.documentElement, dark = getComputedStyle(r).colorScheme === "dark";
  r.dataset.theme = dark ? "light" : "dark";
});

/* ---------- Init ---------- */
if (saved) Object.entries({ lvl: "lv", fld: "f", cat: "c", gen: "g", inc: "inc", mk: "mk" }).forEach(([id, k]) => { $(id).value = saved[k]; });
renderAll();
})();
