import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
/* DATA_DIR lets a host mount persistent storage somewhere else (Render, Fly, a VPS). */
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const SEED_FILE = path.join(ROOT, 'src', 'content.json');

const PORT = Number(process.env.PORT || 4000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const IS_PROD = process.env.NODE_ENV === 'production';
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 8);

for (const dir of [DATA_DIR, UPLOAD_DIR, BACKUP_DIR]) fs.mkdirSync(dir, { recursive: true });

if (!process.env.ADMIN_PASSWORD) {
  console.warn('\n  ⚠  ADMIN_PASSWORD is not set — using the default password "changeme".');
  console.warn('     Create a .env file (see .env.example) before putting this online.\n');
}
if (IS_PROD && !process.env.ADMIN_PASSWORD) {
  console.error('Refusing to start in production without ADMIN_PASSWORD.');
  process.exit(1);
}
if (IS_PROD && !process.env.JWT_SECRET) {
  console.warn('\n  ⚠  JWT_SECRET is not set — a random one was generated for this boot.');
  console.warn('     Every restart will sign admins out. Set JWT_SECRET in your host.\n');
}

/* ------------------------------------------------------------------ store */

let contentCache = null;

async function ensureContent() {
  if (!fs.existsSync(CONTENT_FILE)) {
    await fsp.copyFile(SEED_FILE, CONTENT_FILE);
  }
}

async function readContent() {
  if (contentCache) return contentCache;
  await ensureContent();
  const raw = await fsp.readFile(CONTENT_FILE, 'utf8');
  contentCache = JSON.parse(raw);
  return contentCache;
}

let writeChain = Promise.resolve();

async function writeContent(next) {
  writeChain = writeChain.then(async () => {
    const previous = fs.existsSync(CONTENT_FILE) ? await fsp.readFile(CONTENT_FILE, 'utf8') : null;
    if (previous) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      await fsp.writeFile(path.join(BACKUP_DIR, `content-${stamp}.json`), previous);
      const files = (await fsp.readdir(BACKUP_DIR)).filter((f) => f.startsWith('content-')).sort();
      for (const old of files.slice(0, Math.max(0, files.length - 20))) {
        await fsp.rm(path.join(BACKUP_DIR, old), { force: true });
      }
    }
    const payload = { ...next, version: 1, updatedAt: new Date().toISOString() };
    const tmp = `${CONTENT_FILE}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(payload, null, 2), 'utf8');
    await fsp.rename(tmp, CONTENT_FILE);
    contentCache = payload;
    return payload;
  });
  return writeChain;
}

/* ------------------------------------------------------------------- auth */

const COOKIE = 'pf_session';

function sign() {
  return jwt.sign({ sub: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

function isAuthed(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

function requireAuth(req, res, next) {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not signed in.' });
  next();
}

const attempts = new Map();

function rateLimit(req, res, next) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, first: now };
  if (now - entry.first > 10 * 60 * 1000) {
    entry.count = 0;
    entry.first = now;
  }
  entry.count += 1;
  attempts.set(key, entry);
  if (entry.count > 10) {
    return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });
  }
  next();
}

/* ----------------------------------------------------------------- uploads */

const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
  ['image/gif', '.gif'],
  ['application/pdf', '.pdf'],
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = ALLOWED.get(file.mimetype) || path.extname(file.originalname).toLowerCase();
      const base = path
        .basename(file.originalname, path.extname(file.originalname))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48) || 'file';
      cb(null, `${Date.now()}-${crypto.randomBytes(3).toString('hex')}-${base}${ext}`);
    },
  }),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WebP, AVIF, GIF or PDF files are allowed.'));
    }
    cb(null, true);
  },
});

/* -------------------------------------------------------------------- app */

const app = express();
app.disable('x-powered-by');
/* Hosts like Render terminate TLS at their proxy: trust one hop so req.ip is the
   real visitor (rate limiting) and req.protocol reports https (secure cookies).
   Set TRUST_PROXY=2 when another proxy (e.g. Cloudflare) sits in front. */
const TRUST_PROXY_RAW = (process.env.TRUST_PROXY || '').trim();
const TRUST_PROXY = TRUST_PROXY_RAW ? Number(TRUST_PROXY_RAW) : (IS_PROD ? 1 : 0);
if (Number.isFinite(TRUST_PROXY) && TRUST_PROXY > 0) app.set('trust proxy', TRUST_PROXY);
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', fallthrough: false }));

app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.get('/api/content', async (_req, res) => {
  try {
    const data = await readContent();
    res.set('Cache-Control', 'no-store');
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not read content.' });
  }
});

app.get('/api/auth/me', (req, res) => res.json({ authed: isAuthed(req) }));

app.post('/api/auth/login', rateLimit, (req, res) => {
  const password = String(req.body?.password || '');
  const expected = ADMIN_PASSWORD;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) return res.status(401).json({ error: 'Wrong password.' });
  attempts.delete(req.ip || 'unknown');
  res.cookie(COOKIE, sign(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  res.json({ ok: true });
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ ok: true });
});

app.put('/api/content', requireAuth, async (req, res) => {
  const next = req.body;
  if (!next || typeof next !== 'object' || Array.isArray(next)) {
    return res.status(400).json({ error: 'Invalid content payload.' });
  }
  for (const key of ['hero', 'about', 'skills', 'projects', 'experience', 'services', 'contact', 'footer']) {
    if (!next[key] || typeof next[key] !== 'object') {
      return res.status(400).json({ error: `Missing section: ${key}` });
    }
  }
  if (!Array.isArray(next.projects?.items)) {
    return res.status(400).json({ error: 'projects.items must be an array.' });
  }
  try {
    const saved = await writeContent(next);
    res.json({ ok: true, updatedAt: saved.updatedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save content.' });
  }
});

app.post('/api/content/reset', requireAuth, async (_req, res) => {
  try {
    const seed = JSON.parse(await fsp.readFile(SEED_FILE, 'utf8'));
    const saved = await writeContent(seed);
    res.json({ ok: true, content: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not reset content.' });
  }
});

app.post('/api/upload', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file received.' });
    res.json({
      ok: true,
      name: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      type: req.file.mimetype,
    });
  });
});

app.get('/api/files', requireAuth, async (_req, res) => {
  try {
    const names = await fsp.readdir(UPLOAD_DIR);
    const files = await Promise.all(
      names.map(async (name) => {
        const stat = await fsp.stat(path.join(UPLOAD_DIR, name));
        return { name, url: `/uploads/${name}`, size: stat.size, modified: stat.mtime.toISOString() };
      })
    );
    files.sort((x, y) => (x.modified < y.modified ? 1 : -1));
    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not list files.' });
  }
});

app.delete('/api/files/:name', requireAuth, async (req, res) => {
  const name = path.basename(String(req.params.name));
  if (!name || name !== req.params.name) return res.status(400).json({ error: 'Invalid file name.' });
  try {
    await fsp.rm(path.join(UPLOAD_DIR, name), { force: true });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete file.' });
  }
});

/* --------------------------------------------------------------- errors */

app.use((err, _req, res, next) => {
  if (res.headersSent) return next(err);
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in the request body.' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'That request is too large.' });
  }
  const status = Number(err?.status || err?.statusCode) || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status === 404 ? 'Not found.' : 'Unexpected server error.' });
});

/* ------------------------------------------------------------- static site */

const dist = path.join(ROOT, 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use((req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found.' });
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`\n  Portfolio API  →  http://localhost:${PORT}`);
  console.log(`  Admin panel    →  http://localhost:${PORT}/admin`);
  console.log(`  Content file   →  ${CONTENT_FILE}`);
  console.log(`  Uploads        →  ${UPLOAD_DIR}\n`);
});
