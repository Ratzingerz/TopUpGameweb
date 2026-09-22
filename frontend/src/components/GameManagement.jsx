import React from 'react';

export default function GameManagement({
  editGameId,
  gameName, setGameName,
  gameSlug, setGameSlug,
  accountFields, setAccountFields,
  gameIsActive, setGameIsActive, // State status aktif Game
  setGameImage,
  handleSaveGame, resetGameForm,
  editProductId,
  selectedGameId, setSelectedGameId,
  prodName, setProdName,
  prodPrice, setProdPrice,
  prodIsActive, setProdIsActive, // State status aktif Produk
  setProdImage,
  handleSaveProduct, resetProductForm,
  games,
  handleEditGame, handleDeleteGame,
  handleEditProduct, handleDeleteProduct
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form Game */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-blue-400 text-sm">{editGameId ? 'Edit Game' : 'Tambah Game'}</h3>
            {editGameId && <button onClick={resetGameForm} className="text-xs text-gray-400 hover:text-white underline">Batal</button>}
          </div>
          <form onSubmit={handleSaveGame} className="space-y-3">
            <input type="text" placeholder="Nama Game" required className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" value={gameName} onChange={e => setGameName(e.target.value)} />
            <input type="text" placeholder="Slug (misal: mobile-legends)" required className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" value={gameSlug} onChange={e => setGameSlug(e.target.value)} />
            <input type="text" placeholder="Format Kolom" required className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" value={accountFields} onChange={e => setAccountFields(e.target.value)} />
            
            {/* Toggle Status Aktif Game */}
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="gameIsActive" checked={gameIsActive} onChange={e => setGameIsActive(e.target.checked)} className="w-4 h-4 accent-blue-500 rounded" />
              <label htmlFor="gameIsActive" className="text-xs text-gray-300">Status Aktif (Tampil di Toko)</label>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Gambar Game</label>
              <input type="file" onChange={e => setGameImage(e.target.files[0])} className="w-full text-xs text-gray-400" />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-bold transition">{editGameId ? 'Update Game' : 'Simpan Game'}</button>
          </form>
        </div>

        {/* Form Item */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-green-400 text-sm">{editProductId ? 'Edit Item' : 'Tambah Item Game'}</h3>
            {editProductId && <button onClick={resetProductForm} className="text-xs text-gray-400 hover:text-white underline">Batal</button>}
          </div>
          <form onSubmit={handleSaveProduct} className="space-y-3">
            <select required className="w-full p-2 bg-gray-900 rounded text-sm text-white outline-none border border-gray-700" value={selectedGameId} onChange={e => setSelectedGameId(e.target.value)}>
              <option value="">-- Pilih Game --</option>
              {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <input type="text" placeholder="Nama Item" required className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" value={prodName} onChange={e => setProdName(e.target.value)} />
            <input type="number" placeholder="Harga" required className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" value={prodPrice} onChange={e => setProdPrice(e.target.value)} />
            
            {/* Toggle Status Aktif Produk */}
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="prodIsActive" checked={prodIsActive} onChange={e => setProdIsActive(e.target.checked)} className="w-4 h-4 accent-green-500 rounded" />
              <label htmlFor="prodIsActive" className="text-xs text-gray-300">Status Aktif (Tersedia untuk Dibeli)</label>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Gambar Item</label>
              <input type="file" onChange={e => setProdImage(e.target.files[0])} className="w-full text-xs text-gray-400" />
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-bold transition">{editProductId ? 'Update Item' : 'Simpan Item'}</button>
          </form>
        </div>
      </div>

      {/* List Game & Produknya */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
        <h3 className="font-bold text-lg text-white">Daftar Game & Item Produk</h3>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {games.map(g => (
            <div key={g.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-blue-400">{g.name}</span>
                    <span className="text-xs text-gray-400">({g.slug})</span>
                    {/* Badge Status Game */}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${g.is_active !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {g.is_active !== false ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Format Akun: {g.account_fields}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditGame(g)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-bold">Edit Game</button>
                  <button onClick={() => handleDeleteGame(g.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-bold">Hapus Game</button>
                </div>
              </div>

              <div className="space-y-2 pl-2">
                <div className="text-xs font-semibold text-gray-300">Daftar Item / Produk:</div>
                {g.products && g.products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {g.products.map(prod => (
                      <div key={prod.id} className="bg-gray-800 p-2.5 rounded border border-gray-700 flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{prod.name}</span>
                            {/* Badge Status Produk */}
                            <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${prod.is_active !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {prod.is_active !== false ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>
                          <div className="text-green-400 mt-0.5">Rp {prod.price?.toLocaleString('id-ID')}</div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEditProduct(prod)} className="bg-green-600 hover:bg-green-700 px-2 py-0.5 rounded font-bold text-[10px]">Edit</button>
                          <button onClick={() => handleDeleteProduct(prod.id)} className="bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded font-bold text-[10px]">Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">Belum ada item produk untuk game ini.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}