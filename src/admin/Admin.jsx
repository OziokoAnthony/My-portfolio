import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProjectsEditor from './ProjectsEditor.jsx';
import { ArrayEditor, Card, HeadingEditor, PairList, StringList, TextArea, TextInput, UploadInput } from './fields.jsx';
import './admin.css';

/* ------------------------------------------------------------------ helpers */

async function api(path, { method = 'GET', body } = {}) {
  const init = { method, credentials: 'include', headers: {} };
  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body;
    } else {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }

  let res;
  try {
    res = await fetch(path, init);
  } catch {
    throw new Error('Cannot reach the server. Is the API running?');
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const TABS = [
  ['hero', 'Hero', 'The first screen: availability, name, statement, photo and buttons.'],
  ['about', 'About', 'Your story, the lead paragraph and the three value cards.'],
  ['skills', 'Skills', 'Skill groups and the tags shown inside each card.'],
  ['projects', 'Projects', 'Add, edit, reorder, duplicate or remove the work shown on the site.'],
  ['experience', 'Experience', 'Roles, organisations and the certificates panel.'],
  ['services', 'Services', 'The dark band that lists what you offer.'],
  ['contact', 'Contact', 'Email, WhatsApp, GitHub, CV and the closing section.'],
  ['files', 'Files', 'Everything uploaded to /uploads, plus a full content reset.'],
];

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}`;

/* ------------------------------------------------------------------- login */

function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError('');
    try {
      await api('/api/auth/login', { method: 'POST', body: { password } });
      onSuccess();
    } catch (ex) {
      setError(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login-wrap">
      <form className="adm-login" onSubmit={submit}>
        <span className="adm-login-brand">ANTHONY<span>.</span></span>
        <h1>Admin</h1>
        <p>Enter your password to edit the portfolio.</p>
        <label className="adm-field">
          <span className="adm-label">Password</span>
          <input
            className="adm-input"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        {error && <p className="adm-error adm-error-block">{error}</p>}
        <button className="adm-btn adm-btn-primary adm-btn-block" disabled={busy || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <a className="adm-login-back" href="/">← Back to the site</a>
      </form>
    </div>
  );
}

/* --------------------------------------------------------------- tab panels */

function HeroPanel({ data, set, upload }) {
  const primary = data.primaryCta || { label: '', href: '' };
  const secondary = data.secondaryCta || { label: '', href: '' };

  return (
    <>
      <Card title="Intro" subtitle="Availability, role line and name">
        <TextInput label="Availability label" value={data.availability} onChange={(availability) => set({ availability })} hint="Small tracked label above the name." />
        <TextInput label="Role line" value={data.role} onChange={(role) => set({ role })} />
        <div className="adm-grid-2">
          <TextInput label="First name" value={data.firstName} onChange={(firstName) => set({ firstName })} />
          <TextInput label="Last name" value={data.lastName} onChange={(lastName) => set({ lastName })} />
        </div>
        <StringList
          label="Statement"
          value={data.statement}
          onChange={(statement) => set({ statement })}
          placeholder="One line of the statement"
          addLabel="Add line"
          hint="Each entry becomes its own line. The last line gets the gradient accent."
        />
        <TextArea label="Short paragraph" rows={4} value={data.description} onChange={(description) => set({ description })} />
      </Card>

      <Card title="Portrait photo" subtitle="Used in the hero, the header logo and the footer">
        <UploadInput
          label="Photo"
          value={data.photo}
          onChange={(photo) => set({ photo })}
          upload={upload}
          hint="A tall portrait works best. The image is never cropped in the hero."
        />
      </Card>

      <Card title="Buttons" subtitle="Primary action and CV download">
        <div className="adm-grid-2">
          <TextInput label="Primary button label" value={primary.label} onChange={(label) => set({ primaryCta: { ...primary, label } })} />
          <TextInput label="Primary button link" value={primary.href} onChange={(href) => set({ primaryCta: { ...primary, href } })} />
          <TextInput label="Secondary button label" value={secondary.label} onChange={(label) => set({ secondaryCta: { ...secondary, label } })} />
          <TextInput label="Secondary button link" value={secondary.href} onChange={(href) => set({ secondaryCta: { ...secondary, href } })} hint="Usually your CV file." />
        </div>
      </Card>

      <Card title="Scroll label & marquee" subtitle="The moving strip under the hero" open={false}>
        <TextInput label="Scroll label" value={data.scrollLabel} onChange={(scrollLabel) => set({ scrollLabel })} />
        <PairList label="Marquee items" value={data.marquee} onChange={(marquee) => set({ marquee })} firstLabel="Bold word" secondLabel="Light word" addLabel="Add marquee item" />
      </Card>
    </>
  );
}

function AboutPanel({ data, set }) {
  return (
    <>
      <Card title="Section header">
        <TextInput label="Section label" value={data.kicker} onChange={(kicker) => set({ kicker })} hint="e.g. 01 / ABOUT ME" />
        <TextInput label="Overline" value={data.overline} onChange={(overline) => set({ overline })} />
        <HeadingEditor value={data.heading} onChange={(heading) => set({ heading })} />
      </Card>

      <Card title="Copy">
        <TextArea label="Lead sentence" rows={2} value={data.lead} onChange={(lead) => set({ lead })} />
        <StringList label="Paragraphs" multiline value={data.paragraphs} onChange={(paragraphs) => set({ paragraphs })} addLabel="Add paragraph" />
        <TextInput label="Link label" value={data.linkLabel} onChange={(linkLabel) => set({ linkLabel })} />
      </Card>

      <Card title="Value cards" subtitle="The three cards under the text">
        <ArrayEditor
          items={data.values}
          onChange={(values) => set({ values })}
          addLabel="Add value card"
          makeItem={() => ({ id: uid('v'), title: 'New value', text: '' })}
          itemTitle={(v) => v.title || 'Untitled'}
          render={(v, setV) => (
            <>
              <TextInput label="Title" value={v.title} onChange={(title) => setV({ title })} />
              <TextArea label="Text" rows={2} value={v.text} onChange={(text) => setV({ text })} />
            </>
          )}
        />
      </Card>
    </>
  );
}

function SkillsPanel({ data, set }) {
  return (
    <>
      <Card title="Section header">
        <TextInput label="Section label" value={data.kicker} onChange={(kicker) => set({ kicker })} hint="e.g. 02 / WHAT I WORK WITH" />
        <TextInput label="Overline" value={data.overline} onChange={(overline) => set({ overline })} />
        <HeadingEditor value={data.heading} onChange={(heading) => set({ heading })} />
        <TextArea label="Section note" rows={3} value={data.note} onChange={(note) => set({ note })} />
      </Card>

      <Card title="Skill groups">
        <ArrayEditor
          items={data.groups}
          onChange={(groups) => set({ groups })}
          addLabel="Add skill group"
          makeItem={() => ({ id: uid('s'), title: 'New group', items: [] })}
          itemTitle={(g) => g.title || 'Untitled group'}
          render={(g, setG) => (
            <>
              <TextInput label="Group title" value={g.title} onChange={(title) => setG({ title })} />
              <StringList label="Skills" value={g.items} onChange={(items) => setG({ items })} placeholder="React" addLabel="Add skill" />
            </>
          )}
        />
      </Card>
    </>
  );
}

function ProjectsPanel({ data, set, upload }) {
  return (
    <>
      <Card title="Section header">
        <TextInput label="Section label" value={data.kicker} onChange={(kicker) => set({ kicker })} hint="e.g. 03 / SELECTED WORK" />
        <TextInput label="Overline" value={data.overline} onChange={(overline) => set({ overline })} />
        <HeadingEditor value={data.heading} onChange={(heading) => set({ heading })} />
        <TextArea label="Section note" rows={3} value={data.note} onChange={(note) => set({ note })} />
      </Card>

      <Card title="Projects" subtitle={`${data.items.length} project${data.items.length === 1 ? '' : 's'} — drag-free reordering with the arrows`}>
        <ProjectsEditor items={data.items} onChange={(items) => set({ items })} upload={upload} />
      </Card>

      <Card title="Footer note" open={false}>
        <TextArea label="Note under the grid" rows={2} value={data.footerNote} onChange={(footerNote) => set({ footerNote })} />
      </Card>
    </>
  );
}

function ExperiencePanel({ data, set }) {
  const cert = data.certificates || { overline: '', heading: { text: '', accent: '', break: false }, items: [] };
  const setCert = (patch) => set({ certificates: { ...cert, ...patch } });

  return (
    <>
      <Card title="Section header">
        <TextInput label="Section label" value={data.kicker} onChange={(kicker) => set({ kicker })} hint="e.g. 04 / EXPERIENCE & LEARNING" />
        <TextInput label="Overline" value={data.overline} onChange={(overline) => set({ overline })} />
        <HeadingEditor value={data.heading} onChange={(heading) => set({ heading })} />
        <TextArea label="Section note" rows={3} value={data.note} onChange={(note) => set({ note })} />
      </Card>

      <Card title="Roles">
        <ArrayEditor
          items={data.items}
          onChange={(items) => set({ items })}
          addLabel="Add role"
          makeItem={() => ({ id: uid('e'), org: 'New organisation', role: 'New role', desc: '' })}
          itemTitle={(e) => e.role || e.org || 'Untitled role'}
          render={(e, setE) => (
            <>
              <div className="adm-grid-2">
                <TextInput label="Role" value={e.role} onChange={(role) => setE({ role })} />
                <TextInput label="Organisation" value={e.org} onChange={(org) => setE({ org })} />
              </div>
              <TextArea label="Description" rows={3} value={e.desc} onChange={(desc) => setE({ desc })} />
            </>
          )}
        />
      </Card>

      <Card title="Certificates" subtitle="Shown in the panel beside the timeline" open={false}>
        <TextInput label="Overline" value={cert.overline} onChange={(overline) => setCert({ overline })} />
        <HeadingEditor value={cert.heading} onChange={(heading) => setCert({ heading })} />
        <StringList label="Certificates" value={cert.items} onChange={(items) => setCert({ items })} addLabel="Add certificate" />
      </Card>
    </>
  );
}

function ServicesPanel({ data, set }) {
  return (
    <>
      <Card title="Section header">
        <TextInput label="Section label" value={data.kicker} onChange={(kicker) => set({ kicker })} hint="e.g. 05 / HOW I CAN HELP" />
        <HeadingEditor value={data.heading} onChange={(heading) => set({ heading })} />
      </Card>

      <Card title="Service list">
        <StringList label="Services" value={data.items} onChange={(items) => set({ items })} addLabel="Add service" />
      </Card>
    </>
  );
}

function ContactPanel({ data, set, footer, setFooter, upload }) {
  return (
    <>
      <Card title="Section header">
        <TextInput label="Section label" value={data.kicker} onChange={(kicker) => set({ kicker })} hint="e.g. 06 / LET'S CONNECT" />
        <TextInput label="Overline" value={data.overline} onChange={(overline) => set({ overline })} />
        <HeadingEditor value={data.heading} onChange={(heading) => set({ heading })} />
        <TextArea label="Copy" rows={3} value={data.copy} onChange={(copy) => set({ copy })} />
        <TextInput label="Button label" value={data.buttonLabel} onChange={(buttonLabel) => set({ buttonLabel })} />
      </Card>

      <Card title="Contact details" subtitle="Email, WhatsApp, GitHub and CV">
        <div className="adm-grid-2">
          <TextInput label="Email" type="email" value={data.email} onChange={(email) => set({ email })} />
          <TextInput label="GitHub URL" value={data.github} onChange={(github) => set({ github })} />
          <TextInput label="WhatsApp number (digits)" value={data.whatsapp} onChange={(whatsapp) => set({ whatsapp })} hint="International format without +, e.g. 2349037191117" />
          <TextInput label="WhatsApp display" value={data.whatsappDisplay} onChange={(whatsappDisplay) => set({ whatsappDisplay })} hint="How the number appears on the page." />
        </div>
        <UploadInput
          label="CV file"
          value={data.cv}
          onChange={(cv) => set({ cv })}
          upload={upload}
          accept="application/pdf"
          preview={false}
          placeholder="/uploads/cv.pdf"
          hint="PDF only. This is linked from the header, hero and contact section."
        />
      </Card>

      <Card title="Footer" open={false}>
        <TextInput label="Tagline" value={footer.tagline} onChange={(tagline) => setFooter({ tagline })} />
        <TextInput label="Name" value={footer.name} onChange={(name) => setFooter({ name })} hint="The year is added automatically." />
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------- files */

function UploadButton({ upload, onDone, notify }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const res = await upload(file);
      notify(`Uploaded ${res.name}. Copy its URL to use it anywhere.`);
      onDone?.();
    } catch (ex) {
      notify(ex.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="adm-btn adm-btn-sm" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? 'Uploading…' : 'Upload file'}
      </button>
      <input ref={ref} type="file" accept="image/*,application/pdf" onChange={pick} hidden />
    </>
  );
}

function FilesPanel({ upload, notify, onReset }) {
  const [files, setFiles] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setBusy(true);
    api('/api/files')
      .then((r) => setFiles(r.files))
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setBusy(false));
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const copy = async (url) => {
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).href);
      notify('URL copied to the clipboard.');
    } catch {
      notify('Could not copy — select the URL manually.', 'error');
    }
  };

  const remove = async (name) => {
    if (!confirm(`Delete ${name}?\n\nAnything still using it will show a broken image or link.`)) return;
    try {
      await api(`/api/files/${encodeURIComponent(name)}`, { method: 'DELETE' });
      notify('File deleted.');
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <>
      <Card title="Uploaded files" subtitle="Images and documents used across the site">
        <div className="adm-files-head">
          <UploadButton upload={upload} onDone={load} notify={notify} />
          <button type="button" className="adm-btn adm-btn-sm" onClick={load} disabled={busy}>{busy ? 'Refreshing…' : 'Refresh'}</button>
        </div>

        {!files ? (
          <p className="adm-hint">Loading files…</p>
        ) : files.length === 0 ? (
          <p className="adm-empty">No files uploaded yet. Uploads from the Hero, Projects and Contact tabs appear here.</p>
        ) : (
          <div className="adm-file-list">
            {files.map((f) => (
              <div className="adm-file" key={f.name}>
                {/\.(jpe?g|png|webp|avif|gif)$/i.test(f.name)
                  ? <img src={f.url} alt="" />
                  : <span className="adm-file-icon">PDF</span>}
                <div className="adm-file-meta">
                  <b>{f.name}</b>
                  <span>{(f.size / 1024).toFixed(1)} KB · {new Date(f.modified).toLocaleDateString()}</span>
                </div>
                <div className="adm-file-actions">
                  <button type="button" className="adm-btn adm-btn-sm" onClick={() => copy(f.url)}>Copy URL</button>
                  <a className="adm-btn adm-btn-sm adm-btn-ghost" href={f.url} target="_blank" rel="noreferrer">Open</a>
                  <button type="button" className="adm-btn adm-btn-sm adm-danger" onClick={() => remove(f.name)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Reset content" subtitle="Start again from the original copy" open={false}>
        <p className="adm-hint" style={{ marginTop: 0 }}>
          This restores every text section, project and link to the defaults that shipped with the site.
          Uploaded files are <b>not</b> deleted, so you can reuse them.
        </p>
        <button type="button" className="adm-btn adm-danger" onClick={onReset}>Reset all content</button>
      </Card>
    </>
  );
}

/* -------------------------------------------------------------------- shell */

export default function Admin() {
  const [auth, setAuth] = useState('checking');
  const [content, setContent] = useState(null);
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const draftRef = useRef(draft);
  draftRef.current = draft;

  const notify = useCallback((text, type = 'ok') => {
    setToast({ text, type, id: Date.now() });
  }, []);

  /* Auth check */
  useEffect(() => {
    api('/api/auth/me')
      .then((r) => setAuth(r?.authed ? 'in' : 'out'))
      .catch(() => setAuth('out'));
  }, []);

  /* Load content once signed in */
  useEffect(() => {
    if (auth !== 'in') return;
    let alive = true;
    setLoading(true);
    api('/api/content')
      .then((data) => {
        if (!alive) return;
        setContent(data);
        setDraft(data);
      })
      .catch((e) => {
        if (!alive) return;
        if (e.status === 401) setAuth('out');
        else notify(e.message, 'error');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [auth, notify]);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const dirty = useMemo(
    () => !!content && !!draft && JSON.stringify(content) !== JSON.stringify(draft),
    [content, draft]
  );

  /* Warn before leaving with unsaved edits */
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const save = useCallback(async () => {
    if (!draftRef.current || saving) return;
    setSaving(true);
    try {
      const res = await api('/api/content', { method: 'PUT', body: draftRef.current });
      const next = { ...draftRef.current, updatedAt: res.updatedAt };
      setContent(next);
      setDraft(next);
      notify('Saved. The live site now shows these changes.');
    } catch (e) {
      if (e.status === 401) setAuth('out');
      notify(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [saving, notify]);

  /* Ctrl/Cmd + S */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const upload = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api('/api/upload', { method: 'POST', body: fd });
  }, []);

  const patch = useCallback((section, values) => {
    setDraft((d) => (d ? { ...d, [section]: { ...d[section], ...values } } : d));
  }, []);

  const logout = async () => {
    if (dirty && !confirm('You have unsaved changes. Log out anyway?')) return;
    try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    setAuth('out');
    setContent(null);
    setDraft(null);
  };

  const reset = async () => {
    if (!confirm('Reset all content to the original defaults?\n\nYour current text and project changes will be replaced. Uploaded files are kept.')) return;
    try {
      const res = await api('/api/content/reset', { method: 'POST' });
      setContent(res.content);
      setDraft(res.content);
      notify('Content reset to defaults.');
    } catch (e) {
      if (e.status === 401) setAuth('out');
      notify(e.message, 'error');
    }
  };

  if (auth === 'checking') return <div className="admin-boot">Loading admin…</div>;
  if (auth === 'out') return <Login onSuccess={() => setAuth('in')} />;
  if (loading || !draft) return <div className="admin-boot">Loading content…</div>;

  const activeTab = TABS.find((t) => t[0] === tab) || TABS[0];

  return (
    <div className="adm-shell">
      <header className="adm-topbar">
        <a className="adm-brand" href="/">ANTHONY<span>.</span></a>
        <span className="adm-tag">Admin</span>
        <div className="adm-topbar-actions">
          <span className={`adm-status${dirty ? ' is-dirty' : ''}`}>
            {dirty ? 'Unsaved changes' : content?.updatedAt ? `Saved ${new Date(content.updatedAt).toLocaleString()}` : 'All changes saved'}
          </span>
          <a className="adm-btn adm-btn-sm adm-btn-ghost" href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <button type="button" className="adm-btn adm-btn-sm adm-btn-primary" onClick={save} disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={logout}>Log out</button>
        </div>
      </header>

      <div className="adm-body">
        <nav className="adm-tabs" aria-label="Admin sections">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`adm-tab${tab === id ? ' is-active' : ''}`}
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>

        <main className="adm-main">
          <div className="adm-panel-head">
            <h2>{activeTab[1]}</h2>
            <p>{activeTab[2]}</p>
          </div>

          {tab === 'hero' && <HeroPanel data={draft.hero} set={(v) => patch('hero', v)} upload={upload} />}
          {tab === 'about' && <AboutPanel data={draft.about} set={(v) => patch('about', v)} />}
          {tab === 'skills' && <SkillsPanel data={draft.skills} set={(v) => patch('skills', v)} />}
          {tab === 'projects' && <ProjectsPanel data={draft.projects} set={(v) => patch('projects', v)} upload={upload} />}
          {tab === 'experience' && <ExperiencePanel data={draft.experience} set={(v) => patch('experience', v)} />}
          {tab === 'services' && <ServicesPanel data={draft.services} set={(v) => patch('services', v)} />}
          {tab === 'contact' && (
            <ContactPanel
              data={draft.contact}
              set={(v) => patch('contact', v)}
              footer={draft.footer}
              setFooter={(v) => patch('footer', v)}
              upload={upload}
            />
          )}
          {tab === 'files' && <FilesPanel upload={upload} notify={notify} onReset={reset} />}

          <p className="adm-footnote">
            {dirty ? 'You have unsaved changes — press Ctrl + S or use Save changes.' : 'Everything is saved. Changes appear on the live site immediately.'}
          </p>
        </main>
      </div>

      {toast && (
        <div key={toast.id} className={`adm-toast${toast.type === 'error' ? ' is-error' : ''}`} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}
