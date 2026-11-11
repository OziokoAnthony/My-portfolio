# Anthony Ozioko — Portfolio Website

A responsive React + Vite portfolio with a crystal-sky background (vivid azure, drifting clouds, sunlight and floating light specks), an arched portrait frame, reveal-on-scroll sections, project filtering, responsive navigation and a downloadable CV.

The site is content-driven: every text block, project, skill, role, certificate, service and contact link comes from a JSON document, and a private admin panel at `/admin` edits that document plus uploads images and the CV.

---

## Run locally

1. Install Node.js (Node 20+ recommended).
2. Open the project folder in a terminal.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the site **and** the API together:

   ```bash
   npm run dev
   ```

   - Public site → <http://localhost:5173>
   - Admin panel → <http://localhost:5173/admin>
   - API → <http://localhost:4000>

   Vite proxies `/api` and `/uploads` to the API, so the site works on one URL in development.

5. Sign in to `/admin`. Until you set `ADMIN_PASSWORD`, the password is **`changeme`**.

### Other scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite + API together (development) |
| `npm run dev:web` | Vite only |
| `npm run dev:api` | API only (with `--watch`) |
| `npm run build` | Build the site into `dist/` |
| `npm start` | Production server: API + built site on `PORT` |

---

## The admin panel

`/admin` is private: it is not linked anywhere on the public site, it asks for a password, and the session is an `httpOnly` cookie that lasts 7 days. Logins are rate-limited (10 attempts per 10 minutes per IP).

What you can edit:

- **Hero** — availability label, role line, name, the multi-line statement, paragraph, portrait photo, both buttons, scroll label and the moving marquee.
- **About** — section labels, heading (plain text + italic accent, optionally on a new line), lead, paragraphs, link label and the three value cards.
- **Skills** — section copy plus any number of skill groups and their tags.
- **Projects** — add, edit, duplicate, reorder and delete projects; set name, type/category, description, tech tags, icon, status, link and a screenshot.
- **Experience** — roles and organisations, plus the certificates panel.
- **Services** — the dark band listing what you offer.
- **Contact** — email, WhatsApp number and display text, GitHub URL, CV file, heading, copy and button label. The footer tagline and name live here too.
- **Files** — every uploaded image/PDF, with copy-URL, open and delete, plus a full content reset.

Saving writes to `server/data/content.json`. Before each save the previous version is copied to `server/data/backups/` (the last 20 are kept), so a bad edit can be recovered by hand.

**Shortcuts:** `Ctrl + S` / `Cmd + S` saves. Unsaved changes trigger a warning if you close the tab.

> The public site reads `GET /api/content` on load. If the API is offline it quietly falls back to the bundled copy in `src/content.json`, so the site never breaks.

---

## Configure

Copy `.env.example` to `.env` and change the values:

```bash
cp .env.example .env
```

| Variable | Meaning |
| --- | --- |
| `ADMIN_PASSWORD` | Password for `/admin`. **Required in production** — the server refuses to start without it. |
| `JWT_SECRET` | Signs the session cookie. Use a long random string. |
| `PORT` | Server port (default `4000`). |
| `NODE_ENV` | Set to `production` when deployed. Enables secure cookies, so the site must be served over HTTPS. |
| `MAX_UPLOAD_MB` | Maximum upload size (default `8`). |
| `DATA_DIR` | Where `content.json`, `uploads/` and `backups/` live. Defaults to `server/data`. Point it at your host's persistent disk. |
| `TRUST_PROXY` | How many proxies sit in front of the app. Defaults to `1` in production (Render). Set to `2` if you add Cloudflare. |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Accepted uploads: JPG, PNG, WebP, AVIF, GIF and PDF.

---

## Deploy

The app is a single Node service: it serves the built site and the API.

```bash
npm install
npm run build
NODE_ENV=production npm start
```

### Render (recommended)

This repo ships a `render.yaml` blueprint, so Render configures itself:

1. Push the repo to GitHub.
2. Render Dashboard → **New → Blueprint** → pick this repo → **Apply**.
3. When prompted, set **`ADMIN_PASSWORD`** to your admin password. Leave `JWT_SECRET` alone — Render generates it.
4. Wait for the first deploy, then open the URL Render gives you. `/admin` is on that same domain.

What the blueprint sets up, if you'd rather do it by hand:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Plan | Starter (**not** Free — Free sleeps after 15 minutes and cannot mount a disk) |
| Region | Frankfurt |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Health check | `/api/health` |
| Disk | 1 GB mounted at `/opt/render/project/src/server/data` |
| Env vars | `NODE_ENV=production`, `MAX_UPLOAD_MB=8`, `DATA_DIR=/opt/render/project/src/server/data`, `ADMIN_PASSWORD`, `JWT_SECRET` |

Don't set `PORT` — Render assigns it.

**Persist `server/data/`.** It contains `content.json`, `uploads/` and `backups/`. Without the disk, every deploy resets your edits and uploads. If you change the mount path, change `DATA_DIR` to match.

On first boot the server copies `src/content.json` into the data directory, so whatever is committed there is your starting content. Saved edits then live on the disk and are **not** in git — the admin panel is the source of truth once the site is live.

### Custom domain

`render.yaml` already declares **`talk2oziokoanthony.space`** and `www.talk2oziokoanthony.space`, so Render adds both automatically when the blueprint is applied. You only need to point DNS at Render:

1. Render → your service → **Settings → Custom Domains** → copy the records it shows.
2. At your registrar (or Cloudflare, if you moved DNS there), add:
   - `A` record for `@` → the IP Render shows
   - `CNAME` record for `www` → `<your-service>.onrender.com`
3. Wait for DNS (minutes to a few hours). Render issues a free TLS certificate automatically once it verifies the records.

Don't use your registrar's "URL forwarding" — it breaks the admin session cookie. And if you put Cloudflare's proxy in front (orange cloud), set SSL mode to **Full (strict)** and add `TRUST_PROXY=2` to the service's env vars.

If you deploy the API separately from a static host, set `API_URL` when building the frontend and point your host's proxy at the API for `/api` and `/uploads`.

---

## Project structure

```
src/
  main.jsx           public site + /admin route switch
  content.json       default content (also the server seed)
  style.css          public site styles
  admin/
    Admin.jsx        login, tabs, save/reset/logout, file manager
    fields.jsx       form primitives (inputs, lists, uploads, cards)
    ProjectsEditor.jsx
    admin.css        admin-only styles
server/
  index.js           Express API: content, auth, uploads, static site
  data/              created at runtime (gitignored)
public/
  anthony-profile.jpg
  Anthony-Ozioko-CV.pdf
```

## Personalise without the admin panel

`src/content.json` is the source of default content. Editing it changes the seed used when `server/data/content.json` does not exist yet; if you already have saved content, use the admin panel or reset it. Uploaded files live in `server/data/uploads/`.
