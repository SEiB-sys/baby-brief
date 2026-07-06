# The Baby Brief

A private morning briefing for two first-time parents. One push notification each day at 7am, one tap to open the full site: today's tip, an eight-course library, checklists, red flags and a quiz. Tips run on a countdown to the due date, then switch to day-by-day once the birth date is set.

## What's in here

| File | Job |
|---|---|
| `index.html` | The website (hosted free on GitHub Pages) |
| `content.json` | Every tip, lesson, checklist and quiz question. One source of truth shared by the site and the notifications |
| `config.json` | Your dates, timezone, delivery hour and site address |
| `scripts/send-tip.mjs` | Works out today's tip and sends it to both phones via Pushover |
| `.github/workflows/daily-brief.yml` | Runs the script every hour; it only delivers at your chosen local hour, so daylight saving never breaks it |

## Setup (about 30 minutes, no coding required)

### 1. Choose your notification channel

**Free option: ntfy**
1. Both of you: install the free **ntfy** app from the App Store.
2. Invent one long, random topic name you share, e.g. `babybrief-k93x7q2mzp41`. Anyone who guesses the topic name can read it, so make it unguessable and keep it off social media. No account needed.
3. In the app on both phones: **+ Subscribe to topic**, enter the name, and allow notifications.
4. In step 5 below, add a single secret `NTFY_TOPIC` with that topic name, and skip the Pushover secrets entirely.

**Paid option: Pushover (roughly US$5 each, one-off)**
Slightly more reliable delivery on iPhone in my experience of reports, and no shared-topic consideration. If you'd rather use it:
1. Both of you: install **Pushover** from the App Store and create an account each (free 30-day trial, then a one-off purchase of roughly US$5 per person; check current pricing).
2. Note each **User Key** (shown on the app's main screen or at pushover.net).
3. One of you: log in at **pushover.net → Create an Application/API Token**. Name it "Baby Brief". Note the **API Token**.

### 2. GitHub
1. Create a free account at github.com if you don't have one.
2. Create a new repository called **baby-brief** (public is fine; private also works with Pages on some plans).
3. Upload everything in this folder (on github.com: **Add file → Upload files**, drag the lot in, including the `.github` folder). If the `.github` folder won't drag from your machine, create the file manually: **Add file → Create new file**, name it `.github/workflows/daily-brief.yml`, and paste the contents in.

### 3. Turn on the website
1. Repository **Settings → Pages → Source: Deploy from a branch → Branch: main, folder: / (root) → Save**.
2. After a minute your site is live at `https://YOUR-USERNAME.github.io/baby-brief/`.

### 4. Edit `config.json` (in the repo, tap the pencil icon)
- `dueDate`: your actual due date, format `YYYY-MM-DD`
- `timezone`: an IANA name, e.g. `Australia/Melbourne`, `Europe/London`
- `deliveryHour`: 7 means 7am
- `siteUrl`: your real Pages address from step 3

### 5. Add the secrets
Repository **Settings → Secrets and variables → Actions → New repository secret**:
- Free route: `NTFY_TOPIC` = your shared topic name, nothing else needed
- Pushover route: `PUSHOVER_TOKEN` = the API token, and `PUSHOVER_USERS` = both user keys separated by a comma, e.g. `abc123,xyz789`

### 6. Test it
**Actions** tab → **Daily Baby Brief** → **Run workflow**. Both phones should buzz within a minute. Tap the notification, then "Open today's Baby Brief".

### 7. On both phones
Open the site in Safari → Share → **Add to Home Screen**. It now behaves like an app, icon and all.

## When she arrives
Edit `config.json` and set `"birthDate": "YYYY-MM-DD"`. The site and the notifications both switch to day-by-day briefs matched to her exact age. That's the only maintenance this project ever needs.

## Notes
- Streaks, ticked lessons and checklists save per phone (localStorage), so you each keep your own progress.
- GitHub's scheduler can run a few minutes late. It's a baby tip, not a margin call.
- To change any tip, edit `content.json` directly in the repo.
