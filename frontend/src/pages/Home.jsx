import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [games, setGames] = useState([]);
  const [banners, setBanners] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/games').then(res => res.json()),
      fetch('http://localhost:5000/api/banners').then(res => res.json())
    ])
      .then(([gamesData, bannersData]) => {
        setGames(gamesData.data || []);
        setBanners(bannersData.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal mengambil data dari server:', err);
        setLoading(false);
      });
  }, []);

  const filteredGames = games.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Memuat data dari database...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Banner Section (Bisa dipencet & ada gambar) */}
      {banners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map(banner => {
            const linkTarget = banner.game_slug ? `/game/${banner.game_slug}` : '#';

            return (
              <Link 
                key={banner.id} 
                to={linkTarget}
                className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-700 group block transition hover:border-blue-500"
              >
                <img 
                  src={banner.image_url.startsWith('http') ? banner.image_url : `http://localhost:5000/${banner.image_url}`} 
                  alt={banner.title || 'Banner'} 
                  className="w-full h-44 md:h-52 object-cover group-hover:scale-105 transition duration-300" 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/600x200?text=Banner+Image';
                  }}
                />
                {banner.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                    <h3 className="text-white font-bold text-base">{banner.title}</h3>
                    {banner.promo_code && (
                      <span className="inline-block mt-1 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded font-bold">
                        Kode Promo: {banner.promo_code}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 rounded-2xl text-center shadow-xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">Top Up Game Favoritmu</h1>
        <p className="text-gray-300 text-sm md:text-base mb-6">Proses instan, aman, dan terpercaya 24/7</p>
        <input 
          type="text" 
          placeholder="Cari game..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Daftar Game */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredGames.map(game => (
          <Link 
            key={game.id} 
            to={`/game/${game.slug}`} 
            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition group shadow-lg"
          >
            <img 
              src={game.image_url || 'https://via.placeholder.com/150'} 
              alt={game.name} 
              className="w-full h-40 object-cover group-hover:scale-105 transition duration-300" 
            />
            <div className="p-3 text-center">
              <h3 className="font-bold text-white text-sm">{game.name}</h3>
            </div>
          </Link>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <p className="text-center text-gray-500 py-10">Game tidak ditemukan.</p>
      )}
    </div>
  );
}