'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/pages');
      } else {
        alert(data.error || 'Failed to create page');
      }
    } catch (err) {
      alert('Failed to create page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Atila Admin</h1>
          <Link href="/admin/pages" className="hover:text-gold">Back to Pages</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-primary mb-8">Create New Page</h2>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Page Title</label>
            <input
              className="w-full border rounded-lg px-4 py-2"
              value={form.title}
              onChange={e => {
                const title = e.target.value;
                setForm({ ...form, title, slug: generateSlug(title) });
              }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug (URL path)</label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">/</span>
              <input
                className="w-full border rounded-lg px-4 py-2"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg px-4 py-2"
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Title (SEO)</label>
            <input
              className="w-full border rounded-lg px-4 py-2"
              value={form.metaTitle}
              onChange={e => setForm({ ...form, metaTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Description (SEO)</label>
            <textarea
              className="w-full border rounded-lg px-4 py-2"
              rows={2}
              value={form.metaDescription}
              onChange={e => setForm({ ...form, metaDescription: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              checked={form.isPublished}
              onChange={e => setForm({ ...form, isPublished: e.target.checked })}
            />
            <label htmlFor="published">Published</label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Page'}
          </button>
        </form>
      </div>
    </div>
  );
}
