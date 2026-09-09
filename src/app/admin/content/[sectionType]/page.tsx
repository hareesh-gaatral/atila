'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { CMS_CONTENT_BY_TYPE, CMS_CONTENT_TYPES, CmsContentField, CmsContentGroup, CmsItemField } from '@/lib/cmsContent';
import { CMS_SECTION_DEFAULTS } from '@/lib/cmsDefaults';
import { useAppDispatch } from '@/store/hooks';
import { upsertContentSection } from '@/store/slices/contentSlice';

const META_KEYS = new Set([
  '_id',
  'pageTitle',
  'pageSlug',
  'sectionType',
  'order',
  'isActive',
  'createdAt',
  'updatedAt',
  '__v',
]);

type AnyRecord = Record<string, any>;

/** Read a value at a (possibly dotted) path, e.g. "heading.brand". */
function getPath(obj: AnyRecord | undefined, path: string): any {
  if (!obj) return '';
  const parts = path.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return '';
    cur = cur[p];
  }
  return cur ?? '';
}

/** Write a value at a (possibly dotted) path, e.g. "heading.brand". */
function setPath(obj: AnyRecord, path: string, value: any): AnyRecord {
  const parts = path.split('.');
  const next: AnyRecord = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const child = cur[p];
    cur[p] = child && typeof child === 'object' && !Array.isArray(child) ? { ...child } : {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
  return next;
}

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition';
const labelCls = 'block text-sm font-medium text-[#4a5568] dark:text-slate-300 mb-1';

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: CmsContentField;
  value: any;
  onChange: (v: any) => void;
}) {
  const isImage = field.type === 'image';

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/media', { method: 'POST', body: form });
    const data = await res.json();
    if (data.success && data.data?.url) onChange(data.data.url);
  };

  return (
    <div>
      <label className={labelCls}>{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea
          className={`${inputCls} min-h-[110px]`}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'number' ? (
        <input
          type="number"
          className={inputCls}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      ) : (
        <div className="flex items-start gap-2">
          <input
            type="text"
            className={inputCls}
            placeholder={isImage ? '/images/… or https://…' : ''}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {isImage && (
            <label className="flex-shrink-0 cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-[#4a5568] dark:text-slate-200 text-sm font-medium px-3 py-2 rounded-lg transition">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                  e.currentTarget.value = '';
                }}
              />
            </label>
          )}
        </div>
      )}
      {isImage && value && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-16 w-auto rounded-lg border border-gray-100 dark:border-slate-700 object-cover bg-gray-50"
            onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')}
            onLoad={(e) => ((e.target as HTMLImageElement).style.opacity = '1')}
          />
        </div>
      )}
      {field.hint && <p className="mt-1 text-xs text-[#a0aec0]">{field.hint}</p>}
    </div>
  );
}

function ItemEditor({
  item,
  fields,
  index,
  onChange,
  onRemove,
  onMove,
  canUp,
  canDown,
}: {
  item: AnyRecord;
  fields: CmsItemField[];
  index: number;
  onChange: (patch: AnyRecord) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  canUp: boolean;
  canDown: boolean;
}) {
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-[#fbfdff] dark:bg-slate-800/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#a0aec0] uppercase tracking-wider">Item {index + 1}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={!canUp}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#718096] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={!canDown}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#718096] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      </div>
      {fields.map((f) => (
        <div key={f.key}>
          <label className={labelCls}>{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea
              className={`${inputCls} min-h-[80px]`}
              value={item?.[f.key] ?? ''}
              onChange={(e) => onChange({ ...item, [f.key]: e.target.value })}
            />
          ) : f.type === 'number' ? (
            <input
              type="number"
              className={inputCls}
              value={item?.[f.key] ?? ''}
              onChange={(e) => onChange({ ...item, [f.key]: e.target.value === '' ? '' : Number(e.target.value) })}
            />
          ) : f.type === 'image' ? (
            <div className="flex items-start gap-2">
              <input
                type="text"
                className={inputCls}
                placeholder="/images/… or https://…"
                value={item?.[f.key] ?? ''}
                onChange={(e) => onChange({ ...item, [f.key]: e.target.value })}
              />
              <label className="flex-shrink-0 cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-[#4a5568] dark:text-slate-200 text-sm font-medium px-3 py-2 rounded-lg transition">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const form = new FormData();
                      form.append('file', file);
                      fetch('/api/media', { method: 'POST', body: form })
                        .then((r) => r.json())
                        .then((data) => {
                          if (data.success && data.data?.url) onChange({ ...item, [f.key]: data.data.url });
                        })
                        .catch(() => {
                          // Silent — the text field remains editable as a fallback.
                        });
                    }
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
          ) : (
            <input
              type="text"
              className={inputCls}
              value={item?.[f.key] ?? ''}
              onChange={(e) => onChange({ ...item, [f.key]: e.target.value })}
            />
          )}
          {f.type === 'image' && item?.[f.key] && (
            <div className="mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item[f.key]}
                alt=""
                className="h-12 w-auto rounded-lg border border-gray-100 dark:border-slate-700 object-cover bg-gray-50"
                onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')}
                onLoad={(e) => ((e.target as HTMLImageElement).style.opacity = '1')}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ContentTypeEditor() {
  const router = useRouter();
  const params = useParams();
  const sectionType = (params?.sectionType as string) || '';
  const dispatch = useAppDispatch();

  const def = CMS_CONTENT_BY_TYPE[sectionType];

  const defaultContent: AnyRecord = useMemo(
    () => (CMS_SECTION_DEFAULTS[sectionType] ? JSON.parse(JSON.stringify(CMS_SECTION_DEFAULTS[sectionType])) : {}),
    [sectionType]
  );

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [content, setContent] = useState<AnyRecord>(defaultContent);
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const stripMeta = (doc: AnyRecord): AnyRecord => {
    const out: AnyRecord = {};
    for (const [key, val] of Object.entries(doc)) {
      if (!META_KEYS.has(key)) out[key] = JSON.parse(JSON.stringify(val));
    }
    return out;
  };

  const load = useCallback(async () => {
    if (!def) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/sections?pageSlug=${def.scope}&sectionType=${def.type}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const doc = data.data[0];
        setSectionId(doc._id || null);
        // DB-first: the document already holds the rich JSON content; merge any
        // default keys that are missing so new JSON fields show up too.
        setContent({ ...JSON.parse(JSON.stringify(defaultContent)), ...stripMeta(doc) });
        setOrder(typeof doc.order === 'number' ? doc.order : 0);
        setIsActive(doc.isActive !== false);
      } else {
        setSectionId(null);
        setContent(defaultContent);
        setOrder(0);
        setIsActive(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load section content');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionType]);

  useEffect(() => {
    load();
  }, [load]);

  if (!def) {
    return (
      <div className="min-h-screen bg-[#f7fafc]">
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-lg font-bold text-[#1a202c]">Unknown content type</h1>
            <p className="text-sm text-[#718096] mt-2">No editor is defined for “{sectionType}”.</p>
            <Link href="/admin/content" className="inline-block mt-4 text-teal-700 hover:underline text-sm font-medium">
              ← Back to Website Content
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normalize the content type's repeatable lists. Types using the classic
  // single list (hasItems) map onto one group; types that declare `groups`
  // get several lists, each addressed by a (possibly dotted) path in the
  // content object (e.g. "buyers.cards").
  const groups: CmsContentGroup[] =
    def.groups && def.groups.length
      ? def.groups
      : def.hasItems
      ? [
          {
            itemKey: def.itemKey || 'items',
            itemLabel: def.itemLabel,
            itemValueType: 'object',
            itemFields: def.itemFields,
          },
        ]
      : [];

  const patchContent = (patch: (prev: AnyRecord) => AnyRecord) => setContent((prev) => patch(prev));
  const setField = (key: string, value: any) => patchContent((prev) => setPath(prev, key, value));

  const isStringGroup = (g: CmsContentGroup) => g.itemValueType === 'string';
  /** Raw array at a group's path, converting plain-string rows to { value } for editing. */
  const readList = (g: CmsContentGroup): AnyRecord[] => {
    const raw = getPath(content, g.itemKey);
    if (!Array.isArray(raw)) return [];
    if (isStringGroup(g)) return raw.map((s) => ({ value: String(s) }));
    return raw as AnyRecord[];
  };
  /** Persist a group's list back into content, converting { value } rows to strings. */
  const writeList = (g: CmsContentGroup, list: any[]) => {
    const stored = isStringGroup(g) ? list.map((it) => it?.value ?? '') : list;
    patchContent((prev) => setPath(prev, g.itemKey, stored));
  };
  const setItem = (g: CmsContentGroup, index: number, item: any) => {
    const next = [...readList(g)];
    next[index] = item;
    writeList(g, next);
  };
  const addItem = (g: CmsContentGroup) => {
    if (isStringGroup(g)) {
      writeList(g, [...readList(g), { value: '' }]);
      return;
    }
    const blank: AnyRecord = {};
    (g.itemFields || []).forEach((f) => {
      blank[f.key] = f.type === 'number' ? 0 : '';
    });
    writeList(g, [...readList(g), blank]);
  };
  const removeItem = (g: CmsContentGroup, index: number) => {
    writeList(g, readList(g).filter((_, i) => i !== index));
  };
  const moveItem = (g: CmsContentGroup, index: number, dir: -1 | 1) => {
    const next = [...readList(g)];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    writeList(g, next);
  };

  const openJson = () => {
    setJsonText(JSON.stringify(content, null, 2));
    setShowJson(true);
  };
  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setError('JSON must be an object');
        return;
      }
      setContent(parsed);
      setShowJson(false);
      setError(null);
      setMessage('JSON applied — review then Save.');
    } catch (e: any) {
      setError('Invalid JSON: ' + e?.message);
    }
  };

  const save = async () => {
    if (!def) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    // Normalize number fields before sending (keeps ratings/counts numeric).
    let normalized = JSON.parse(JSON.stringify(content)) as AnyRecord;
    (def.fields || []).forEach((f) => {
      if (f.type === 'number' && normalized[f.key] !== undefined && normalized[f.key] !== '') {
        normalized[f.key] = Number(normalized[f.key]);
      }
    });
    // Normalize every repeatable list: numeric fields for object rows, and
    // { value } rows back to plain strings for string lists.
    groups.forEach((g) => {
      const raw = getPath(normalized, g.itemKey);
      if (!Array.isArray(raw)) return;
      const rows = raw.map((row: AnyRecord) => {
        if (isStringGroup(g)) return row && typeof row === 'object' && 'value' in row ? row.value : row;
        const out = { ...row };
        (g.itemFields || []).forEach((f) => {
          if (f.type === 'number' && out[f.key] !== undefined && out[f.key] !== '') out[f.key] = Number(out[f.key]);
        });
        return out;
      });
      normalized = setPath(normalized, g.itemKey, rows);
    });

    const payload = {
      pageTitle: def.pageTitle,
      pageSlug: def.scope,
      sectionType: def.type,
      order,
      isActive,
      ...normalized,
    };

    try {
      const url = sectionId ? `/api/sections/${sectionId}` : '/api/sections';
      const res = await fetch(url, {
        method: sectionId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Save failed (${res.status})`);
      }
      const saved = data.data;
      setSectionId(saved?._id || sectionId);
      if (saved) {
        setContent({ ...JSON.parse(JSON.stringify(defaultContent)), ...stripMeta(saved) });
        dispatch(upsertContentSection(saved));
      }
      setMessage('Content saved. The public site has been updated.');
    } catch (err: any) {
      setError(err?.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setContent(defaultContent);
    setMessage('Reset to JSON defaults — click Save to write them to the DB.');
  };

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <main className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div>
                <Link href="/admin/content" className="text-sm text-[#718096] hover:text-teal-700 transition">
                  ← Website Content
                </Link>
                <h1 className="text-2xl font-bold text-[#1a202c] mt-1 flex items-center gap-2">
                  <span>{def.icon}</span> {def.label}
                </h1>
                <p className="text-sm text-[#718096] mt-1">{def.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetToDefaults}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#718096] hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  Reset to defaults
                </button>
                <button
                  onClick={save}
                  disabled={saving || loading}
                  className="bg-[#1e3a5f] hover:bg-[#2c5282] text-white font-medium px-6 py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {saving ? 'Saving…' : sectionId ? 'Save Changes' : 'Create Section'}
                </button>
              </div>
            </div>

            {message && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm border border-green-100 dark:border-green-500/20">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-500/20">
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-[#718096]">
                Loading…
              </div>
            ) : (
              <div className="space-y-6">
                {/* Publishing / order */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-wrap items-center gap-x-8 gap-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#4a5568]">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#1e3a5f] rounded focus:ring-[#1e3a5f]/30"
                    />
                    Published (visible on site)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#4a5568]">Order</span>
                    <input
                      type="number"
                      className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                    />
                  </div>
                  {sectionId && <span className="text-xs text-[#a0aec0]">DB id: {sectionId}</span>}
                </div>

                {/* Convenient scalar fields */}
                {def.fields.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-semibold text-[#1a202c] mb-4">Fields</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {def.fields.map((f) => (
                        <FieldControl
                          key={f.key}
                          field={f}
                          value={getPath(content, f.key)}
                          onChange={(v) => setField(f.key, v)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Repeatable rows — one block per group/list */}
                {groups.map((g, gi) => {
                  const items = readList(g);
                  const label = (g.itemLabel || 'Item').toLowerCase();
                  return (
                    <div key={g.itemKey || gi} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[#1a202c]">{g.itemLabel || 'Item'}s</h3>
                        <button
                          onClick={() => addItem(g)}
                          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <span className="text-base leading-none">+</span> Add {label}
                        </button>
                      </div>
                      {items.length === 0 ? (
                        <p className="text-sm text-[#a0aec0] py-4 text-center border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                          No {label} yet. Click “Add” to create one.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {items.map((item, i) => (
                            <ItemEditor
                              key={i}
                              item={item}
                              fields={g.itemFields || []}
                              index={i}
                              onChange={(patch) => setItem(g, i, patch)}
                              onRemove={() => removeItem(g, i)}
                              onMove={(dir) => moveItem(g, i, dir)}
                              canUp={i > 0}
                              canDown={i < items.length - 1}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Advanced JSON */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[#1a202c]">Advanced JSON</h3>
                      <p className="text-xs text-[#a0aec0] mt-0.5">
                        Edit any field not covered above (nested objects, arrays, extra keys). Changes apply after
                        clicking “Apply JSON”.
                      </p>
                    </div>
                    {!showJson && (
                      <button
                        onClick={openJson}
                        className="text-sm font-medium text-[#1e3a5f] hover:underline"
                      >
                        Edit JSON
                      </button>
                    )}
                  </div>
                  {showJson ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full h-80 font-mono text-xs border border-gray-200 rounded-lg p-3 bg-[#0f172a] text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40"
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        spellCheck={false}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={applyJson}
                          className="bg-[#1e3a5f] hover:bg-[#2c5282] text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                        >
                          Apply JSON
                        </button>
                        <button
                          onClick={() => setShowJson(false)}
                          className="text-sm font-medium text-[#718096] hover:bg-gray-100 px-4 py-2 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#a0aec0]">
                      Current content is {JSON.stringify(content).length.toLocaleString()} bytes across{' '}
                      {Object.keys(content).length} top-level key(s).
                    </p>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
