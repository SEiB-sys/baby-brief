/* The Baby Brief: morning push notifier.
   Reads the same content.json and config.json as the website,
   works out today's tip, and sends it to every Pushover user key. */
import fs from "fs";

const content = JSON.parse(fs.readFileSync(new URL("../content.json", import.meta.url), "utf8"));
const cfg = JSON.parse(fs.readFileSync(new URL("../config.json", import.meta.url), "utf8"));

const TOKEN = process.env.PUSHOVER_TOKEN;
const USERS = (process.env.PUSHOVER_USERS || "").split(",").map(s => s.trim()).filter(Boolean);
const NTFY_TOPIC = (process.env.NTFY_TOPIC || "").trim();   // free option: set this secret and skip Pushover entirely
const FORCE = !!process.env.FORCE;
const DRY = !!process.env.DRY_RUN;

const tz = cfg.timezone || "Australia/Melbourne";
const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(new Date()));
const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

/* Runs hourly; only delivers at the configured local hour, so daylight saving never breaks it. */
if (!FORCE && hour !== (cfg.deliveryHour ?? 7)) {
  console.log(`Local time in ${tz} is ${hour}:00; delivery hour is ${cfg.deliveryHour ?? 7}:00. Nothing to do.`);
  process.exit(0);
}

const pmod = (n, m) => ((n % m) + m) % m;
const days = (a, b) => Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 86400000);

let tip, phase, label;
if (cfg.birthDate) {
  const age = Math.max(0, days(cfg.birthDate, today));
  const band = content.BANDS.find(b => age >= b.from && age <= b.to) || content.BANDS[content.BANDS.length - 1];
  tip = band.tips[pmod(age - band.from, band.tips.length)];
  phase = band.name;
  label = `Day ${age + 1} of her life`;
} else {
  const idx = pmod(-days(today, cfg.dueDate) - 1, content.PREP.length);
  tip = content.PREP[idx];
  phase = "Before she arrives";
  const left = days(today, cfg.dueDate);
  label = left > 0 ? `${left} days to go` : left === 0 ? "Due today" : "Any moment now";
}

const title = `☀️ ${tip[0]}`;
const message = `${tip[1]}\n\n${phase} · ${label}`;

if (DRY) {
  console.log("[dry run]", { title, message, url: cfg.siteUrl, via: NTFY_TOPIC ? "ntfy" : "pushover" });
  process.exit(0);
}

/* ---- Free path: ntfy.sh ---- */
if (NTFY_TOPIC) {
  const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: "POST",
    body: message,
    headers: {
      Title: tip[0],            // plain text; emoji lives in Tags below
      Click: cfg.siteUrl,       // one tap on the notification opens the site
      Tags: "sun_with_face",
      Priority: "default",
    },
  });
  if (!res.ok) { console.error("ntfy send failed:", res.status, await res.text()); process.exit(1); }
  console.log("Sent via ntfy topic", NTFY_TOPIC.slice(0, 6) + "…");
  process.exit(0);
}

/* ---- Paid path: Pushover ---- */
if (!TOKEN || USERS.length === 0) {
  console.error("Set either the NTFY_TOPIC secret (free) or PUSHOVER_TOKEN and PUSHOVER_USERS (paid).");
  process.exit(1);
}

for (const user of USERS) {
  const body = new URLSearchParams({
    token: TOKEN,
    user,
    title,
    message,
    url: cfg.siteUrl,
    url_title: "Open today's Baby Brief",
  });
  const res = await fetch("https://api.pushover.net/1/messages.json", { method: "POST", body });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || out.status !== 1) {
    console.error("Pushover send failed for one recipient:", res.status, JSON.stringify(out));
    process.exitCode = 1;
  } else {
    console.log("Sent to", user.slice(0, 4) + "…");
  }
}
