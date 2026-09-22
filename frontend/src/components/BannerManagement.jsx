import React, { useState, useEffect } from 'react';

export default function BannerManagement({ token }) {
  const [banners, setBanners] = useState([]);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImage, setBannerImage] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/banners', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBanners(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!bannerImage) return alert("Pilih gambar banner!");
    const formData = new FormData();
    formData.append('title', bannerTitle);
    formData.append('image', bannerImage);

    try {
      const res = await fetch('http://localhost:5000/api/admin/banners', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        alert("Banner berhasil ditambahkan!");
        setBannerTitle(''); setBannerImage(null);
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm("Yakin hapus banner ini?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h3 className="font-bold text-blue-400 text-sm mb-3">Upload Banner Baru</h3>
        <form onSubmit={handleAddBanner} className="space-y-3">
          <input type="text" placeholder="Judul Banner" className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} />
          <input type="file" onChange={e => setBannerImage(e.target.files[0])} className="w-full text-xs text-gray-400" />
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-bold transition">Upload Banner</button>
        </form>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
        <h3 className="font-bold text-lg text-white">Daftar Banner</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {banners.map(b => (
            <div key={b.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 space-y-2">
              <img src={b.image_url} alt={b.title} className="w-full h-32 object-cover rounded" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white truncate">{b.title || 'Tanpa Judul'}</span>
                <button onClick={() => handleDeleteBanner(b.id)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-bold">Hapus</button>
              </div>
            </div>
          ))}
          {banners.length === 0 && <p className="text-xs text-gray-500 italic col-span-full">Belum ada banner.</p>}
        </div>
      </div>
    </div>
  );
}