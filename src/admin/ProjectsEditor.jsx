import React from 'react';
import { ArrayEditor, TextInput, TextArea, StringList, UploadInput } from './fields.jsx';

export default function ProjectsEditor({ items, onChange, upload }) {
  return (
    <ArrayEditor
      items={items}
      onChange={onChange}
      addLabel="Add project"
      makeItem={() => ({
        id: `p-${Date.now().toString(36)}`,
        name: 'New project',
        type: 'Web application',
        desc: '',
        stack: [],
        icon: '✦',
        status: 'Project showcase',
        url: '',
        image: '',
      })}
      itemTitle={(p) => p.name || 'Untitled project'}
      render={(p, set) => (
        <>
          <div className="adm-grid-2">
            <TextInput label="Project name" value={p.name} onChange={(name) => set({ name })} />
            <TextInput label="Type / category" value={p.type} onChange={(type) => set({ type })} hint="Becomes a filter chip above the grid" />
          </div>
          <TextArea label="Description" rows={4} value={p.desc} onChange={(desc) => set({ desc })} />
          <div className="adm-grid-3">
            <TextInput label="Icon" value={p.icon} onChange={(icon) => set({ icon })} hint="A single symbol, e.g. ✦" />
            <TextInput label="Status" value={p.status} onChange={(status) => set({ status })} hint="Shown at the card foot" />
            <TextInput label="Link (optional)" value={p.url} onChange={(url) => set({ url })} placeholder="https://…" />
          </div>
          <StringList label="Tech stack tags" value={p.stack} onChange={(stack) => set({ stack })} placeholder="React" addLabel="Add tag" />
          <UploadInput
            label="Screenshot (optional)"
            value={p.image}
            onChange={(image) => set({ image })}
            upload={upload}
            hint="JPG, PNG, WebP, AVIF or GIF. Leave empty for a text-only card."
          />
        </>
      )}
    />
  );
}
