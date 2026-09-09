'use client';

import { useState, useEffect, useRef } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
}

export default function MediaAdmin() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) setMedia(data.data);
    } catch (err) { console.error('Failed'); } finally { setLoading(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await fetch('/api/media', { method: 'POST', body: formData });
      fetchMedia();
    } catch (err) { console.error('Failed'); } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteMedia = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/media/${id}`, { method: 'DELETE' });
    fetchMedia();
  };

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1a202c]">Media Library</h1>
                <p className="text-sm text-[#718096] mt-1">Upload and manage files</p>
              </div>
              <div>
                <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-[#1e3a5f] hover:bg-[#2c5282] text-white font-medium px-4 py-2 rounded-lg text-sm transition disabled:opacity-50">
                  {uploading ? 'Uploading...' : '+ Upload File'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-[#718096] py-8">Loading...</div>
            ) : media.length === 0 ? (
              <div className="text-center text-[#718096] py-8">No media files yet.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {media.map((item) => (
                  <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                    <div className="aspect-square bg-gray-50 flex items-center justify-center">
                      {item.mimeType.startsWith('image/') ? (
                        <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">📄</span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-500 truncate">{item.originalName}</p>
                    </div>
                    <div className="p-2 border-t border-gray-100 flex justify-end">
                      <button onClick={() => deleteMedia(item._id)} className="text-red-500 text-xs hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
