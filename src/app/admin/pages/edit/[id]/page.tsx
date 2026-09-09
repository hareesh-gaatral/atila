'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Section {
  _id?: string;
  sectionType: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  items: Array<{ title: string; description: string; imageUrl: string; icon: string; link: string }>;
  order: number;
  isActive: boolean;
}

const defaultSection: Section = {
  sectionType: 'hero',
  title: '',
  subtitle: '',
  content: '',
  imageUrl: '',
  buttonText: '',
  buttonLink: '',
  items: [],
  order: 1,
  isActive: true,
};

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [page, setPage] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSection, setNewSection] = useState<Section>({ ...defaultSection });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const pageRes = await fetch(`/api/pages/${id}`);
      const pageData = await pageRes.json();
      if (pageData.success) setPage(pageData.data);

      const secRes = await fetch(`/api/sections`);
      const secData = await secRes.json();
      if (secData.success) {
        const pageSections = secData.data.filter((s: any) => s.pageSlug === pageData.data?.slug);
        setSections(pageSections);
      }
    } catch (err) {
      console.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  const updatePage = async () => {
    setSaving(true);
    try {
      await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });
      alert('Page saved!');
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addSection = async () => {
    try {
      await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSection,
          pageTitle: page.title,
          pageSlug: page.slug,
          order: sections.length + 1,
        }),
      });
      setNewSection({ ...defaultSection });
      fetchData();
    } catch (err) {
      alert('Failed to add section');
    }
  };

  const updateSection = async (sectionId: string, data: Partial<Section>) => {
    try {
      await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchData();
    } catch (err) {
      alert('Failed to update section');
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section?')) return;
    try {
      await fetch(`/api/sections/${sectionId}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Failed');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!page) return <div className="p-8">Page not found</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Atila Admin</h1>
          <div className="flex space-x-4">
            <Link href="/admin/pages" className="hover:text-gold">Pages</Link>
            <Link href={`/${page.slug}`} target="_blank" className="hover:text-gold">View Page</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-primary mb-8">Edit: {page.title}</h2>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="font-semibold mb-4">Page Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input className="w-full border rounded px-3 py-2" value={page.title} onChange={e => setPage({...page, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1">Slug</label>
              <input className="w-full border rounded px-3 py-2" value={page.slug} onChange={e => setPage({...page, slug: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm mb-1">Description</label>
              <textarea className="w-full border rounded px-3 py-2" rows={2} value={page.description || ''} onChange={e => setPage({...page, description: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1">Meta Title</label>
              <input className="w-full border rounded px-3 py-2" value={page.metaTitle || ''} onChange={e => setPage({...page, metaTitle: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1">Meta Description</label>
              <input className="w-full border rounded px-3 py-2" value={page.metaDescription || ''} onChange={e => setPage({...page, metaDescription: e.target.value})} />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" checked={page.isPublished} onChange={e => setPage({...page, isPublished: e.target.checked})} />
              <label>Published</label>
            </div>
          </div>
          <button onClick={updatePage} disabled={saving} className="mt-4 bg-accent text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="font-semibold mb-4">Existing Sections ({sections.length})</h3>
          {sections.length === 0 ? (
            <p className="text-gray-500">No sections yet. Add one below.</p>
          ) : (
            <div className="space-y-4">
              {sections.map((sec) => (
                <div key={sec._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{sec.sectionType}</span>
                      <span className="text-sm text-gray-500">Order: {sec.order}</span>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => updateSection(sec._id!, { isActive: !sec.isActive })}
                        className={`text-sm px-2 py-1 rounded ${sec.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {sec.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button onClick={() => deleteSection(sec._id!)} className="text-red-600 text-sm hover:underline">Delete</button>
                    </div>
                  </div>
                  <SectionEditor section={sec} onSave={(data) => updateSection(sec._id!, data)} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Add New Section</h3>
          <SectionForm section={newSection} onChange={setNewSection} />
          <button onClick={addSection} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            + Add Section
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ section, onSave }: { section: Section; onSave: (data: Partial<Section>) => void }) {
  const [edit, setEdit] = useState({ ...section });

  return (
    <div className="space-y-2 mt-2">
      <input className="w-full border rounded px-3 py-1 text-sm" placeholder="Title" value={edit.title} onChange={e => setEdit({...edit, title: e.target.value})} />
      <input className="w-full border rounded px-3 py-1 text-sm" placeholder="Subtitle" value={edit.subtitle} onChange={e => setEdit({...edit, subtitle: e.target.value})} />
      <textarea className="w-full border rounded px-3 py-1 text-sm" placeholder="Content" rows={3} value={edit.content} onChange={e => setEdit({...edit, content: e.target.value})} />
      <input className="w-full border rounded px-3 py-1 text-sm" placeholder="Image URL" value={edit.imageUrl} onChange={e => setEdit({...edit, imageUrl: e.target.value})} />
      <div className="grid grid-cols-2 gap-2">
        <input className="border rounded px-3 py-1 text-sm" placeholder="Button Text" value={edit.buttonText} onChange={e => setEdit({...edit, buttonText: e.target.value})} />
        <input className="border rounded px-3 py-1 text-sm" placeholder="Button Link" value={edit.buttonLink} onChange={e => setEdit({...edit, buttonLink: e.target.value})} />
      </div>
      <button onClick={() => onSave(edit)} className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">Save Section</button>
    </div>
  );
}

function SectionForm({ section, onChange }: { section: Section; onChange: (s: Section) => void }) {
  return (
    <div className="space-y-3">
      <select className="w-full border rounded px-3 py-2" value={section.sectionType} onChange={e => onChange({...section, sectionType: e.target.value})}>
        <option value="hero">Hero</option>
        <option value="about">About</option>
        <option value="services">Services</option>
        <option value="features">Features</option>
        <option value="testimonials">Testimonials</option>
        <option value="faq">FAQ</option>
        <option value="cta">CTA</option>
        <option value="contact">Contact</option>
        <option value="text">Text Content</option>
        <option value="banner">Banner</option>
        <option value="custom">Custom</option>
      </select>
      <input className="w-full border rounded px-3 py-2" placeholder="Title" value={section.title} onChange={e => onChange({...section, title: e.target.value})} />
      <input className="w-full border rounded px-3 py-2" placeholder="Subtitle" value={section.subtitle} onChange={e => onChange({...section, subtitle: e.target.value})} />
      <textarea className="w-full border rounded px-3 py-2" placeholder="Content" rows={4} value={section.content} onChange={e => onChange({...section, content: e.target.value})} />
      <input className="w-full border rounded px-3 py-2" placeholder="Image URL" value={section.imageUrl} onChange={e => onChange({...section, imageUrl: e.target.value})} />
      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Button Text" value={section.buttonText} onChange={e => onChange({...section, buttonText: e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Button Link" value={section.buttonLink} onChange={e => onChange({...section, buttonLink: e.target.value})} />
      </div>
    </div>
  );
}
