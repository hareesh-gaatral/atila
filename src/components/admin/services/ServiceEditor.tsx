'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { IService, IServiceStep, IServiceCta, ServiceBlockType } from '@/types';

/**
 * ServiceEditor — the "Services mini-CMS" form.
 *
 * One DB record (Service) drives the home card, the /services index card, the
 * navigation dropdown and the dynamic /services/[slug] page. This editor
 * manages every part of that record: card + hero copy, menu/publish flags, SEO
 * and the ordered detail-page regions (steps / benefits / features /
 * howItWorks / cta). New and Edit screens both render this component and only
 * differ in the onSubmit payload target.
 */

// ---- Styling tokens (shared with the rest of the admin panel) -------------
const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition';
const labelCls = 'block text-sm font-medium text-[#4a5568] dark:text-slate-300 mb-1';
const cardCls = 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5';
const btnPrimary =
  'bg-[#1e3a5f] hover:bg-[#2c5282] text-white font-medium px-6 py-2 rounded-lg text-sm transition disabled:opacity-50';
const btnGhost =
  'px-3 py-1.5 rounded-lg text-sm font-medium text-[#718096] hover:bg-gray-100 dark:hover:bg-slate-700 transition';
const btnTeal = 'bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition';

export const BLOCK_META: { type: ServiceBlockType; label: string; hint: string }[] = [
  { type: 'steps', label: 'Walkthrough Steps', hint: 'Alternating illustrated steps with points + result.' },
  { type: 'keyPoints', label: 'Key Points', hint: 'Top-of-page highlight checklist (“Key points at a glance”).' },
  { type: 'benefits', label: 'Key Benefits', hint: 'Short “Why you’ll love it” cards.' },
  { type: 'features', label: 'Features', hint: '“Everything included” checklist cards.' },
  { type: 'howItWorks', label: 'How It Works', hint: 'Numbered process cards.' },
  { type: 'cta', label: 'Call To Action', hint: 'Bottom gradient banner (contact prompts).' },
];

const BLOCK_LABEL: Record<ServiceBlockType, string> = {
  steps: 'Walkthrough Steps',
  keyPoints: 'Key Points',
  benefits: 'Key Benefits',
  features: 'Features',
  howItWorks: 'How It Works',
  cta: 'Call To Action',
};

// ---- Small reusable field sub-components -----------------------------------

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-[#a0aec0]">{hint}</p>}
    </div>
  );
}

function ImageField({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/media', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success && data.data?.url) onChange(data.data.url);
      else if (data.error) alert(data.error);
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-start gap-2">
        <input
          type="text"
          className={inputCls}
          placeholder="/images/… or https://…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className="flex-shrink-0 cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-[#4a5568] dark:text-slate-200 text-sm font-medium px-3 py-2 rounded-lg transition">
          {uploading ? 'Uploading…' : 'Upload'}
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
      </div>
      {hint && <p className="mt-1 text-xs text-[#a0aec0]">{hint}</p>}
      {value && (
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
    </div>
  );
}

function StringListEditor({
  value,
  onChange,
  placeholder,
  hint,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  // Editing is done one-item-per-line in a textarea for fast bulk entry.
  const text = value.join('\n');
  return (
    <div>
      <textarea
        className={`${inputCls} min-h-[90px]`}
        placeholder={placeholder || 'One item per line'}
        value={text}
        onChange={(e) => {
          const lines = e.target.value
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
          onChange(lines);
        }}
      />
      {hint && <p className="mt-1 text-xs text-[#a0aec0]">{hint}</p>}
    </div>
  );
}

/**
 * Editable bullet-point list (used for each step's "Key points"). Each point is
 * its own row with a remove button and an explicit "+ Add point" action, so
 * adding more bullets is obvious. Blank rows are trimmed/dropped on save.
 */
function PointListEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const update = (index: number, text: string) => {
    const next = [...value];
    next[index] = text;
    onChange(next);
  };
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));
  const add = () => onChange([...value, '']);
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {value.map((point, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 h-6 flex-shrink-0 rounded-full bg-teal-600/10 dark:bg-teal-400/20 text-teal-700 dark:text-teal-400 text-xs font-bold flex items-center justify-center">
            {i + 1}
          </span>
          <input
            type="text"
            className={inputCls}
            value={point}
            placeholder={placeholder || `Point ${i + 1}`}
            onChange={(e) => update(i, e.target.value)}
          />
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#718096] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"
              aria-label="Move point up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === value.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#718096] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"
              aria-label="Move point down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              aria-label="Remove point"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 dark:text-teal-400 hover:underline transition"
      >
        <span className="text-base leading-none">+</span> Add point
      </button>
    </div>
  );
}

// ---- Editor state shape -----------------------------------------------------

interface StepDraft extends IServiceStep {
  key: number;
}
interface FormState {
  title: string;
  slug: string;
  tagline: string;
  icon: string;
  image: string;
  shortDescription: string;
  description: string;
  showInMenu: boolean;
  menuOrder: number;
  order: number;
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  sections: ServiceBlockType[];
  steps: StepDraft[];
  keyPoints: string[];
  benefits: string[];
  features: string[];
  howItWorks: string[];
  cta: IServiceCta;
}

function blankStep(key: number): StepDraft {
  return { key, num: '', title: '', description: '', points: [], result: '', image: '' };
}

const DEFAULT_CTA: IServiceCta = {
  heading: '',
  text: '',
  buttonText: '',
  buttonHref: '/contact',
  secondaryText: '',
  secondaryHref: '/#contact',
};

export function emptyForm(): FormState {
  return {
    title: '',
    slug: '',
    tagline: '',
    icon: '',
    image: '',
    shortDescription: '',
    description: '',
    showInMenu: true,
    menuOrder: 1,
    order: 1,
    isPublished: true,
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
    sections: ['steps', 'cta'],
    steps: [],
    keyPoints: [],
    benefits: [],
    features: [],
    howItWorks: [],
    cta: { ...DEFAULT_CTA },
  };
}

export function serviceToForm(s: IService): FormState {
  const page = s.page || {};
  const sections =
    Array.isArray(page.sections) && page.sections.length > 0
      ? ([...page.sections] as ServiceBlockType[])
      : (['steps', 'cta'] as ServiceBlockType[]);
  const steps = Array.isArray(page.steps) ? page.steps : [];
  return {
    title: s.title || '',
    slug: s.slug || '',
    tagline: s.tagline || '',
    icon: s.icon || '',
    image: s.image || '',
    shortDescription: s.shortDescription || '',
    description: s.description || '',
    showInMenu: s.showInMenu !== false,
    menuOrder: typeof s.menuOrder === 'number' ? s.menuOrder : 1,
    order: typeof s.order === 'number' ? s.order : 1,
    isPublished: s.isPublished !== false,
    metaTitle: s.metaTitle || '',
    metaDescription: s.metaDescription || '',
    ogImage: s.ogImage || '',
    sections,
    steps: steps.map((st, i) => ({ ...blankStep(i), ...st })),
    keyPoints: page.keyPoints || [],
    benefits: page.benefits || [],
    features: page.features || [],
    howItWorks: page.howItWorks || [],
    cta: { ...DEFAULT_CTA, ...(page.cta || {}) },
  };
}

export function formToServicePayload(form: FormState): Partial<IService> & { page: any } {
  return {
    title: form.title.trim(),
    slug: form.slug.trim().toLowerCase(),
    tagline: form.tagline.trim(),
    icon: form.icon.trim(),
    image: form.image.trim(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    showInMenu: form.showInMenu,
    menuOrder: Number(form.menuOrder) || 0,
    order: Number(form.order) || 0,
    isPublished: form.isPublished,
    metaTitle: form.metaTitle.trim(),
    metaDescription: form.metaDescription.trim(),
    ogImage: form.ogImage.trim(),
    page: {
      sections: form.sections,
      steps: form.steps.map(({ key, num, title, description, points, result, image }) => ({
        num: (num || '').trim(),
        title: (title || '').trim(),
        description: (description || '').trim(),
        points: Array.isArray(points) ? points.map((p) => p.trim()).filter(Boolean) : [],
        result: (result || '').trim(),
        image: (image || '').trim(),
      })),
      keyPoints: form.keyPoints,
      benefits: form.benefits,
      features: form.features,
      howItWorks: form.howItWorks,
      cta: {
        heading: (form.cta.heading || '').trim(),
        text: (form.cta.text || '').trim(),
        buttonText: (form.cta.buttonText || '').trim(),
        buttonHref: (form.cta.buttonHref || '/contact').trim(),
        secondaryText: (form.cta.secondaryText || '').trim(),
        secondaryHref: (form.cta.secondaryHref || '/#contact').trim(),
      },
    },
  };
}

export const slugify = (input: string) =>
  input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// ---- The editor itself ------------------------------------------------------

export default function ServiceEditor({
  initial,
  onSubmit,
  submitLabel,
  savingLabel,
  backHref = '/admin/services',
}: {
  initial: IService | null;
  onSubmit: (payload: Partial<IService>) => Promise<void>;
  submitLabel?: string;
  savingLabel?: string;
  backHref?: string;
}) {
  const isNew = !initial || !initial._id;
  const [form, setForm] = useState<FormState>(() => (initial ? serviceToForm(initial) : emptyForm()));
  const [autoSlug, setAutoSlug] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const initialKey = initial?._id || 'new';
  // Rebuild form state when the loaded record changes (e.g. after navigation).
  const [key, setKey] = useState(initialKey);
  if (key !== initialKey) {
    setKey(initialKey);
    setForm(initial ? serviceToForm(initial) : emptyForm());
  }

  const previewUrlValue = useMemo(
    () => (isNew ? (form.slug ? `/services/${form.slug}` : '') : initial?._id ? `/services/${initial.slug}` : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.slug, isNew, initial?._id]
  );

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const patchCta = (patch: Partial<IServiceCta>) => setForm((prev) => ({ ...prev, cta: { ...prev.cta, ...patch } }));

  const setStep = (index: number, patch: Partial<StepDraft>) =>
    setForm((prev) => {
      const steps = [...prev.steps];
      steps[index] = { ...steps[index], ...patch };
      return { ...prev, steps };
    });
  const setStepPoints = (index: number, points: string[]) => setStep(index, { points });
  const addStep = () =>
    setForm((prev) => {
      const nextKey = prev.steps.length ? Math.max(...prev.steps.map((s) => s.key)) + 1 : 1;
      const steps = [...prev.steps, blankStep(nextKey)];
      return { ...prev, steps };
    });
  const removeStep = (index: number) =>
    setForm((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));
  const moveStep = (index: number, dir: -1 | 1) =>
    setForm((prev) => {
      const steps = [...prev.steps];
      const target = index + dir;
      if (target < 0 || target >= steps.length) return prev;
      const [row] = steps.splice(index, 1);
      steps.splice(target, 0, row);
      return { ...prev, steps };
    });

  const toggleSection = (type: ServiceBlockType, enabled: boolean) =>
    setForm((prev) => {
      const has = prev.sections.includes(type);
      if (enabled && !has) return { ...prev, sections: [...prev.sections, type] };
      if (!enabled && has) return { ...prev, sections: prev.sections.filter((s) => s !== type) };
      return prev;
    });
  const moveSection = (type: ServiceBlockType, dir: -1 | 1) =>
    setForm((prev) => {
      const idx = prev.sections.indexOf(type);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.sections.length) return prev;
      const sections = [...prev.sections];
      const [row] = sections.splice(idx, 1);
      sections.splice(target, 0, row);
      return { ...prev, sections };
    });

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    const slug = slugify(form.slug);
    if (!slug) {
      setError('Slug is required (used for the URL /services/{slug}).');
      return;
    }
    if (autoSlug && slugify(form.title) !== slug) {
      setError('The slug does not match the auto-generated slug. Clear the slug field (or uncheck auto-slug) to continue.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onSubmit(formToServicePayload({ ...form, slug }));
      setMessage('Saved. The public site (cards, menu, detail page) has been updated.');
    } catch (err: any) {
      setError(err?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const openJson = () => {
    setJsonText(JSON.stringify(formToServicePayload(form), null, 2));
    setJsonOpen(true);
  };

  const sectionMeta = BLOCK_META;

  return (
    <div>
      {/* Heading + actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <Link href={backHref} className="text-sm text-[#718096] hover:text-teal-700 transition">
            ← Services
          </Link>
          <h1 className="text-2xl font-bold text-[#1a202c] mt-1">{isNew ? 'Add New Service' : `Edit Service: ${form.title || initial?.slug || ''}`}</h1>
          <p className="text-sm text-[#718096] mt-1">
            The same record powers the home card, /services index, nav dropdown and /services/{form.slug || '[slug]'} page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {previewUrlValue && (
            <Link
              href={previewUrlValue}
              target="_blank"
              className="text-sm font-medium text-green-700 hover:underline px-2"
            >
              Preview ↗
            </Link>
          )}
          <button onClick={openJson} className={btnGhost}>
            JSON
          </button>
          <button onClick={handleSubmit} disabled={saving} className={btnPrimary}>
            {saving ? savingLabel || 'Saving…' : submitLabel || (isNew ? 'Create Service' : 'Save Changes')}
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

      {jsonOpen && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[#1a202c]">Advanced JSON</h3>
            <button onClick={() => setJsonOpen(false)} className={btnGhost}>
              Close
            </button>
          </div>
          <p className="text-xs text-[#a0aec0] mb-3">
            Edit the exact payload that will be saved. Changes are only applied when you click “Apply JSON”.
          </p>
          <textarea
            className="w-full h-80 font-mono text-xs border border-gray-200 rounded-lg p-3 bg-[#0f172a] text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                try {
                  const parsed = JSON.parse(jsonText);
                  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    setError('JSON must be an object');
                    return;
                  }
                  const t = serviceToForm({ ...(initial || ({} as any)), ...parsed });
                  setForm(t);
                  setJsonOpen(false);
                  setError(null);
                  setMessage('JSON applied — review then Save.');
                } catch (e: any) {
                  setError('Invalid JSON: ' + e?.message);
                }
              }}
              className="bg-[#1e3a5f] hover:bg-[#2c5282] text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Apply JSON
            </button>
            <button onClick={() => setJsonOpen(false)} className="text-sm font-medium text-[#718096] hover:bg-gray-100 px-4 py-2 rounded-lg transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* ---- Card + hero details ---- */}
        <div className={cardCls}>
          <h3 className="font-semibold text-[#1a202c] dark:text-slate-100 mb-4">Card &amp; Hero Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Service Title" hint="Shown on the card, dropdown and page hero.">
              <input
                type="text"
                className={inputCls}
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  set('title', title);
                  if (autoSlug) set('slug', slugify(title));
                }}
                placeholder="e.g. Contract Management"
                required
              />
            </Field>
            <Field label="Slug (URL)" hint={autoSlug ? 'Auto-generated from title — type to override.' : 'Type to override the auto-generated slug.'}>
              <div className="flex items-center">
                <span className="text-sm text-[#a0aec0] mr-1 flex-shrink-0">/services/</span>
                <input
                  type="text"
                  className={inputCls}
                  value={form.slug}
                  onChange={(e) => set('slug', slugify(e.target.value))}
                  placeholder="contract-management"
                  required
                />
              </div>
              <label className="mt-2 inline-flex items-center gap-2 text-xs text-[#718096] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#1e3a5f]"
                />
                Auto-generate slug from title
              </label>
            </Field>
            <Field label="Icon (emoji)" hint="Stored as an emoji string — e.g. 🛒 📦 ⚖️ 📊 ✅ 🛡️">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className={`${inputCls} w-24 text-center text-xl`}
                  value={form.icon}
                  onChange={(e) => set('icon', e.target.value)}
                  maxLength={4}
                />
                <div className="flex flex-wrap gap-1">
                  {['🛒', '📦', '⚖️', '📊', '✅', '🛡️', '🤝', '💼', '🧾', '🔗'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => set('icon', em)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg border transition ${
                        form.icon === em
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10'
                          : 'border-gray-200 dark:border-slate-700 hover:border-teal-400'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </Field>
            <Field label="Hero / Card Image URL" hint="Optional image for the page hero and cards.">
              <ImageField value={form.image} onChange={(v) => set('image', v)} label="" />
            </Field>
            <Field label="Tagline" hint="One-line accent shown under the title (teal text).">
              <input
                type="text"
                className={inputCls}
                value={form.tagline}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder="e.g. Govern every contract from request to renewal"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Short Description (card copy)" hint="Shown on the home + /services cards.">
                <textarea
                  className={`${inputCls} min-h-[70px]`}
                  value={form.shortDescription}
                  onChange={(e) => set('shortDescription', e.target.value)}
                  placeholder="One or two sentences for the card."
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Description (page hero)" hint="Longer paragraph under the title on the detail page.">
                <textarea
                  className={`${inputCls} min-h-[90px]`}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Fuller description used at the top of /services/{slug}."
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ---- Menu + publishing ---- */}
        <div className={cardCls}>
          <h3 className="font-semibold text-[#1a202c] dark:text-slate-100 mb-4">Menu &amp; Publishing</h3>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[#4a5568] dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => set('isPublished', e.target.checked)}
                className="w-4 h-4 text-[#1e3a5f] rounded focus:ring-[#1e3a5f]/30"
              />
              Published (live on the site)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-[#4a5568] dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showInMenu}
                onChange={(e) => set('showInMenu', e.target.checked)}
                className="w-4 h-4 text-[#1e3a5f] rounded focus:ring-[#1e3a5f]/30"
              />
              Show in “Services” nav dropdown
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#4a5568] dark:text-slate-300">Menu order</span>
              <input
                type="number"
                className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm dark:bg-slate-800 dark:border-slate-700"
                value={form.menuOrder}
                onChange={(e) => set('menuOrder', Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#4a5568] dark:text-slate-300">Card order</span>
              <input
                type="number"
                className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm dark:bg-slate-800 dark:border-slate-700"
                value={form.order}
                onChange={(e) => set('order', Number(e.target.value))}
              />
            </div>
            {!isNew && (
              <span className="text-xs text-[#a0aec0]">DB id: {initial?._id}</span>
            )}
          </div>
        </div>

        {/* ---- SEO ---- */}
        <div className={cardCls}>
          <h3 className="font-semibold text-[#1a202c] dark:text-slate-100 mb-4">SEO &amp; Sharing</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Meta Title" hint="Browser tab / search result title.">
              <input
                type="text"
                className={inputCls}
                value={form.metaTitle}
                onChange={(e) => set('metaTitle', e.target.value)}
                placeholder={`${form.title || 'Service'} | ATILA Procurement Platform`}
              />
            </Field>
            <Field label="OG Image URL" hint="Social share image (falls back to card image).">
              <ImageField value={form.ogImage} onChange={(v) => set('ogImage', v)} label="" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Meta Description">
                <textarea
                  className={`${inputCls} min-h-[70px]`}
                  value={form.metaDescription}
                  onChange={(e) => set('metaDescription', e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ---- Page content regions ---- */}
        <div className={cardCls}>
          <h3 className="font-semibold text-[#1a202c] dark:text-slate-100 mb-1">Page Content</h3>
          <p className="text-sm text-[#718096] mb-4">
            Enable the regions you want on the detail page and drag their order with ↑/↓.
          </p>

          {/* Region toggles + ordering */}
          <div className="space-y-2 mb-6">
            {sectionMeta.map((meta) => {
              const enabled = form.sections.includes(meta.type);
              const idx = form.sections.indexOf(meta.type);
              return (
                <div
                  key={meta.type}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    enabled
                      ? 'border-teal-200 bg-teal-50/50 dark:border-teal-500/30 dark:bg-teal-500/5'
                      : 'border-gray-200 dark:border-slate-700 bg-gray-50/40 dark:bg-slate-800/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => toggleSection(meta.type, e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500/30"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${enabled ? 'text-[#1a202c] dark:text-slate-100' : 'text-[#718096]'}`}>
                      {meta.label}
                    </p>
                    <p className="text-xs text-[#a0aec0] truncate">{meta.hint}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(meta.type, -1)}
                      disabled={!enabled || idx <= 0}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#718096] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(meta.type, 1)}
                      disabled={!enabled || idx < 0 || idx >= form.sections.length - 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#718096] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Steps */}
          {form.sections.includes('steps') && (
            <div className="border-t border-gray-100 dark:border-slate-700 pt-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-[#1a202c] dark:text-slate-100">Walkthrough Steps</h4>
                <button onClick={addStep} className={btnTeal}>
                  + Add Step
                </button>
              </div>
              {form.steps.length === 0 ? (
                <p className="text-sm text-[#a0aec0] py-4 text-center border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                  No steps yet. Add a step to build the walkthrough section.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.steps.map((step, i) => (
                    <div key={step.key} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-[#fbfdff] dark:bg-slate-800/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#a0aec0] uppercase tracking-wider">Step {i + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveStep(i, -1)}
                            disabled={i === 0}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#718096] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"
                            aria-label="Move step up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStep(i, 1)}
                            disabled={i === form.steps.length - 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#718096] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"
                            aria-label="Move step down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeStep(i)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                            aria-label="Remove step"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-4 gap-3">
                        <Field label="Step #">
                          <input
                            type="text"
                            className={inputCls}
                            value={step.num || ''}
                            onChange={(e) => setStep(i, { num: e.target.value })}
                            placeholder="01"
                          />
                        </Field>
                        <div className="md:col-span-3">
                          <Field label="Step title">
                            <input
                              type="text"
                              className={inputCls}
                              value={step.title || ''}
                              onChange={(e) => setStep(i, { title: e.target.value })}
                            />
                          </Field>
                        </div>
                      </div>
                      <Field label="Description">
                        <textarea
                          className={`${inputCls} min-h-[60px]`}
                          value={step.description || ''}
                          onChange={(e) => setStep(i, { description: e.target.value })}
                        />
                      </Field>
                      <Field label="Key points" hint="Each point becomes a bullet on the detail page — use “Add point” to add more.">
                        <PointListEditor
                          value={step.points || []}
                          onChange={(points) => setStepPoints(i, points)}
                          placeholder="e.g. Online requisition with item, quantity and need-by date"
                        />
                      </Field>
                      <Field label="Result callout" hint="Optional highlighted “Result: …” line.">
                        <input
                          type="text"
                          className={inputCls}
                          value={step.result || ''}
                          onChange={(e) => setStep(i, { result: e.target.value })}
                        />
                      </Field>
                      <Field label="Step image">
                        <ImageField value={step.image || ''} onChange={(v) => setStep(i, { image: v })} label="" />
                      </Field>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Key Points — a top-of-page highlight checklist */}
          {form.sections.includes('keyPoints') && (
            <div className="border-t border-gray-100 dark:border-slate-700 pt-5 mb-6">
              <h4 className="font-semibold text-[#1a202c] dark:text-slate-100 mb-1">{BLOCK_LABEL.keyPoints}</h4>
              <p className="text-xs text-[#a0aec0] mb-3">“Key points at a glance” highlights — one per line.</p>
              <StringListEditor
                value={form.keyPoints}
                onChange={(keyPoints) => set('keyPoints', keyPoints)}
                placeholder={'e.g. End-to-end procure-to-pay automation under one platform'}
              />
            </div>
          )}

          {/* Benefits / Features / How it works — all simple string lists */}
          {form.sections.includes('benefits') && (
            <div className="border-t border-gray-100 dark:border-slate-700 pt-5 mb-6">
              <h4 className="font-semibold text-[#1a202c] dark:text-slate-100 mb-1">{BLOCK_LABEL.benefits}</h4>
              <p className="text-xs text-[#a0aec0] mb-3">“Why you’ll love it” cards — one per line.</p>
              <StringListEditor
                value={form.benefits}
                onChange={(benefits) => set('benefits', benefits)}
                placeholder={'e.g. Faster cycle times with automated approvals'}
              />
            </div>
          )}

          {form.sections.includes('features') && (
            <div className="border-t border-gray-100 dark:border-slate-700 pt-5 mb-6">
              <h4 className="font-semibold text-[#1a202c] dark:text-slate-100 mb-1">{BLOCK_LABEL.features}</h4>
              <p className="text-xs text-[#a0aec0] mb-3">“Everything included” checklist — one per line.</p>
              <StringListEditor
                value={form.features}
                onChange={(features) => set('features', features)}
                placeholder={'e.g. Centralized contract repository'}
              />
            </div>
          )}

          {form.sections.includes('howItWorks') && (
            <div className="border-t border-gray-100 dark:border-slate-700 pt-5 mb-6">
              <h4 className="font-semibold text-[#1a202c] dark:text-slate-100 mb-1">{BLOCK_LABEL.howItWorks}</h4>
              <p className="text-xs text-[#a0aec0] mb-3">Numbered process cards — one per line.</p>
              <StringListEditor
                value={form.howItWorks}
                onChange={(howItWorks) => set('howItWorks', howItWorks)}
                placeholder={'e.g. Submit a request through the portal'}
              />
            </div>
          )}

          {/* CTA */}
          {form.sections.includes('cta') && (
            <div className="border-t border-gray-100 dark:border-slate-700 pt-5">
              <h4 className="font-semibold text-[#1a202c] dark:text-slate-100 mb-1">{BLOCK_LABEL.cta}</h4>
              <p className="text-xs text-[#a0aec0] mb-3">
                Bottom gradient banner. Leave blank to use the default (title-aware) copy.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Heading">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.cta.heading || ''}
                    onChange={(e) => patchCta({ heading: e.target.value })}
                    placeholder="Ready to Streamline {Service}?"
                  />
                </Field>
                <Field label="Text">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.cta.text || ''}
                    onChange={(e) => patchCta({ text: e.target.value })}
                    placeholder="Talk to our procurement experts today."
                  />
                </Field>
                <Field label="Primary button text">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.cta.buttonText || ''}
                    onChange={(e) => patchCta({ buttonText: e.target.value })}
                    placeholder="Contact / Enquiry"
                  />
                </Field>
                <Field label="Primary button link">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.cta.buttonHref || ''}
                    onChange={(e) => patchCta({ buttonHref: e.target.value })}
                    placeholder="/contact"
                  />
                </Field>
                <Field label="Secondary button text">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.cta.secondaryText || ''}
                    onChange={(e) => patchCta({ secondaryText: e.target.value })}
                    placeholder="Ask a Question"
                  />
                </Field>
                <Field label="Secondary button link">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.cta.secondaryHref || ''}
                    onChange={(e) => patchCta({ secondaryHref: e.target.value })}
                    placeholder="/#contact"
                  />
                </Field>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom sticky-ish save */}
      <div className="mt-6 flex justify-end gap-2">
        <Link href={backHref} className={btnGhost}>
          Cancel
        </Link>
        <button onClick={handleSubmit} disabled={saving} className={btnPrimary}>
          {saving ? savingLabel || 'Saving…' : submitLabel || (isNew ? 'Create Service' : 'Save Changes')}
        </button>
      </div>
    </div>
  );
}
