import React, { useState, useEffect } from 'react';

export default function BannerManagement({ token }) {
  const [banners, setBanners] = useState([]);
  const [games, setGames] = useState([]);
  const [promos, setPromos] = useState([]); 
  const [bannerTitle, setBannerTitle] = useState('');
  const [selectedPromoCode, setSelectedPromoCode] = useState(''); 
  const [targetGameId, setTargetGameId] = useState(''); 
  const [bannerImage, setBannerImage] = useState(null);

  useEffect(() => {
    fetchBanners();
    fetchGames();
    fetchPromos(); 
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

  const fetchGames = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/games');
      if (res.ok) {
        const data = await res.json();
        setGames(data.data || data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPromos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/promos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPromos(data.data || data || []);
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
    formData.append('promo_code', selectedPromoCode);
    formData.append('game_id', targetGameId);
    formData.append('image', bannerImage);

    try {
      const res = await fetch('http://localhost:5000/api/admin/banners', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        alert("Banner berhasil ditambahkan!");
        setBannerTitle(''); 
        setSelectedPromoCode(''); 
        setTargetGameId('');
        setBannerImage(null);
        fetchBanners();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menambah banner");
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
          <input 
            type="text" 
            placeholder="Judul Banner (Cth: Promo Diskon MLBB)" 
            className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" 
            value={bannerTitle} 
            onChange={e => setBannerTitle(e.target.value)} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Pilihan Kode Promo dari Database */}
            <select 
              value={selectedPromoCode} 
              onChange={e => setSelectedPromoCode(e.target.value)}
              className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700"
            >
              <option value="">-- Pilih Kode Promo (Opsional) --</option>
              {promos.map(p => {
                const discVal = Number(p.discount || 0);
                return (
                  <option key={p.id} value={p.code}>
                    {p.code} (Rp {discVal.toLocaleString('id-ID')})
                  </option>
                );
              })}
            </select>

            {/* Pilihan Game Tujuan */}
            <select 
              value={targetGameId} 
              onChange={e => setTargetGameId(e.target.value)}
              className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700"
            >
              <option value="">-- Arahkan ke Game (Opsional) --</option>
              {games.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <input 
            type="file" 
            onChange={e => setBannerImage(e.target.files[0])} 
            className="w-full text-xs text-gray-400" 
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-bold transition">
            Upload Banner
          </button>
        </form>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
        <h3 className="font-bold text-lg text-white">Daftar Banner</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {banners.map(b => (
            <div key={b.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 space-y-2">
              <img src={b.image_url} alt={b.title} className="w-full h-32 object-cover rounded" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-white truncate">{b.title || 'Tanpa Judul'}</div>
                <div className="flex gap-1 flex-wrap">
                  {b.promo_code && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-mono">
                      Promo: {b.promo_code}
                    </span>
                  )}
                  {b.game_name && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                      Game: {b.game_name}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDeleteBanner(b.id)} 
                className="w-full bg-red-600 hover:bg-red-700 py-1 rounded text-xs font-bold transition"
              >
                Hapus
              </button>
            </div>
          ))}
          {banners.length === 0 && <p className="text-xs text-gray-500 italic col-span-full">Belum ada banner.</p>}
        </div>
      </div>
    </div>
  );
}