import React, { useRef, useState } from 'react';

/* --------------------------------------------------------------- primitives */

export function TextInput({ label, value, onChange, placeholder, hint, type = 'text' }) {
  return (
    <label className="adm-field">
      {label && <span className="adm-label">{label}</span>}
      <input
        className="adm-input"
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="adm-hint">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3, hint }) {
  return (
    <label className="adm-field">
      {label && <span className="adm-label">{label}</span>}
      <textarea
        className="adm-input adm-textarea"
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="adm-hint">{hint}</span>}
    </label>
  );
}

export function Checkbox({ label, checked, onChange, hint }) {
  return (
    <label className="adm-check">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
      {hint && <span className="adm-hint">{hint}</span>}
    </label>
  );
}

/* ------------------------------------------------------------------- layout */

export function Card({ title, subtitle, children, open = true }) {
  return (
    <details className="adm-card" open={open}>
      <summary className="adm-card-summary">
        <span className="adm-card-title">{title}</span>
        {subtitle && <span className="adm-card-sub">{subtitle}</span>}
      </summary>
      <div className="adm-card-body">{children}</div>
    </details>
  );
}

/* -------------------------------------------------------------- section bits */

export function HeadingEditor({ value, onChange, label = 'Section heading' }) {
  const v = value || { text: '', accent: '', break: false };
  return (
    <div className="adm-subgroup">
      <span className="adm-legend">{label}</span>
      <div className="adm-grid-2">
        <TextInput label="Text" value={v.text} onChange={(text) => onChange({ ...v, text })} />
        <TextInput label="Italic accent" value={v.accent} onChange={(accent) => onChange({ ...v, accent })} />
      </div>
      <Checkbox
        label="Put the accent on its own line"
        checked={v.break}
        onChange={(brk) => onChange({ ...v, break: brk })}
      />
    </div>
  );
}

/* --------------------------------------------------------------- list fields */

export function StringList({ label, value = [], onChange, placeholder, addLabel = 'Add item', multiline = false, hint }) {
  const rows = value || [];
  const set = (i, v) => onChange(rows.map((row, j) => (j === i ? v : row)));
  const remove = (i) => onChange(rows.filter((_, j) => j !== i));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="adm-field">
      {label && <span className="adm-label">{label}</span>}
      <div className="adm-rows">
        {rows.map((row, i) => (
          <div className="adm-row" key={i}>
            {multiline ? (
              <textarea
                className="adm-input adm-textarea"
                rows={2}
                value={row}
                placeholder={placeholder}
                onChange={(e) => set(i, e.target.value)}
              />
            ) : (
              <input
                className="adm-input"
                value={row}
                placeholder={placeholder}
                onChange={(e) => set(i, e.target.value)}
              />
            )}
            <div className="adm-row-tools">
              <button type="button" className="adm-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} title="Move up" aria-label="Move up">↑</button>
              <button type="button" className="adm-icon-btn" onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="Move down" aria-label="Move down">↓</button>
              <button type="button" className="adm-icon-btn adm-danger" onClick={() => remove(i)} title="Remove" aria-label="Remove">✕</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="adm-empty-row">Nothing here yet.</p>}
      </div>
      <button type="button" className="adm-btn adm-btn-sm adm-add" onClick={() => onChange([...rows, ''])}>+ {addLabel}</button>
      {hint && <span className="adm-hint">{hint}</span>}
    </div>
  );
}

export function PairList({ label, value = [], onChange, firstLabel = 'First', secondLabel = 'Second', addLabel = 'Add pair' }) {
  const rows = value || [];
  const set = (i, idx, v) => onChange(rows.map((row, j) => (j === i ? row.map((x, k) => (k === idx ? v : x)) : row)));
  const remove = (i) => onChange(rows.filter((_, j) => j !== i));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="adm-field">
      {label && <span className="adm-label">{label}</span>}
      <div className="adm-rows">
        {rows.map((row, i) => (
          <div className="adm-row" key={i}>
            <input className="adm-input" value={row[0]} placeholder={firstLabel} onChange={(e) => set(i, 0, e.target.value)} />
            <input className="adm-input" value={row[1]} placeholder={secondLabel} onChange={(e) => set(i, 1, e.target.value)} />
            <div className="adm-row-tools">
              <button type="button" className="adm-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} title="Move up" aria-label="Move up">↑</button>
              <button type="button" className="adm-icon-btn" onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="Move down" aria-label="Move down">↓</button>
              <button type="button" className="adm-icon-btn adm-danger" onClick={() => remove(i)} title="Remove" aria-label="Remove">✕</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="adm-empty-row">Nothing here yet.</p>}
      </div>
      <button type="button" className="adm-btn adm-btn-sm adm-add" onClick={() => onChange([...rows, ['', '']])}>+ {addLabel}</button>
    </div>
  );
}

/* Generic collapsible editor for an array of objects. */
export function ArrayEditor({ items = [], onChange, makeItem, render, itemTitle, addLabel = 'Add item', empty = 'Nothing here yet.' }) {
  const list = items || [];
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i) => onChange(list.filter((_, j) => j !== i));
  const duplicate = (i) => {
    const copy = { ...list[i], id: `${list[i].id || 'item'}-${Date.now().toString(36)}` };
    onChange([...list.slice(0, i + 1), copy, ...list.slice(i + 1)]);
  };
  const update = (i, patch) => onChange(list.map((item, j) => (j === i ? { ...item, ...patch } : item)));

  const tools = (i) => (
    <span className="adm-item-tools" onClick={(e) => e.preventDefault()} onKeyDown={(e) => e.stopPropagation()}>
      <button type="button" className="adm-icon-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); move(i, -1); }} disabled={i === 0} title="Move up" aria-label="Move up">↑</button>
      <button type="button" className="adm-icon-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); move(i, 1); }} disabled={i === list.length - 1} title="Move down" aria-label="Move down">↓</button>
      <button type="button" className="adm-icon-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); duplicate(i); }} title="Duplicate" aria-label="Duplicate">⧉</button>
      <button type="button" className="adm-icon-btn adm-danger" onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(i); }} title="Remove" aria-label="Remove">✕</button>
    </span>
  );

  return (
    <div className="adm-array">
      {list.map((item, i) => (
        <details className="adm-item" key={item.id || i} open={list.length <= 3}>
          <summary className="adm-item-summary">
            <span className="adm-item-title">{itemTitle ? itemTitle(item, i) : `Item ${i + 1}`}</span>
            {tools(i)}
          </summary>
          <div className="adm-item-body">
            {render(item, (patch) => update(i, patch), i)}
          </div>
        </details>
      ))}
      {list.length === 0 && <p className="adm-empty">{empty}</p>}
      <button type="button" className="adm-btn adm-btn-sm adm-add" onClick={() => onChange([...list, makeItem()])}>+ {addLabel}</button>
    </div>
  );
}

/* ---------------------------------------------------------------- file input */

export function UploadInput({ label, value, onChange, upload, accept = 'image/*', preview = true, hint, placeholder = '/uploads/…' }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      const res = await upload(file);
      onChange(res.url);
    } catch (ex) {
      setErr(ex.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-field">
      {label && <span className="adm-label">{label}</span>}
      <div className="adm-upload">
        {preview && (
          value
            ? <img className="adm-thumb" src={value} alt="" />
            : <div className="adm-thumb adm-thumb-empty">No image</div>
        )}
        <div className="adm-upload-main">
          <input
            className="adm-input"
            value={value ?? ''}
            placeholder={placeholder}
            spellCheck={false}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="adm-upload-actions">
            <button type="button" className="adm-btn adm-btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? 'Uploading…' : 'Upload file'}
            </button>
            {value && <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => onChange('')}>Remove</button>}
            <input ref={fileRef} type="file" accept={accept} onChange={pick} hidden />
          </div>
          {hint && <span className="adm-hint">{hint}</span>}
          {err && <span className="adm-error">{err}</span>}
        </div>
      </div>
    </div>
  );
}
