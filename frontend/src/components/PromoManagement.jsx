import React from 'react';

export default function PromoManagement({
  editPromoId,
  promoCode, setPromoCode,
  promoDiscount, setPromoDiscount,
  promoMinSpend, setPromoMinSpend,
  promoIsActive, setPromoIsActive,
  handleSavePromo, resetPromoForm,
  promos,
  handleEditPromo, handleDeletePromo
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-yellow-400 text-sm">{editPromoId ? 'Edit Promo' : 'Tambah Promo'}</h3>
          {editPromoId && <button onClick={resetPromoForm} className="text-xs text-gray-400 hover:text-white underline">Batal</button>}
        </div>
        <form onSubmit={handleSavePromo} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Kode Promo" required className="w-full p-2 bg-gray-900 rounded text-sm text-white uppercase border border-gray-700" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
            <input type="number" placeholder="Diskon (Rp)" required className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" value={promoDiscount} onChange={e => setPromoDiscount(e.target.value)} />
            <input type="number" placeholder="Min Spend" className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" value={promoMinSpend} onChange={e => setPromoMinSpend(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="isActive" checked={promoIsActive} onChange={e => setPromoIsActive(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
            <label htmlFor="isActive" className="text-xs text-gray-300">Status Aktif</label>
          </div>
          <button className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded text-sm font-bold text-black transition">{editPromoId ? 'Update Promo' : 'Simpan Promo'}</button>
        </form>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
        <h3 className="font-bold text-lg text-white">Daftar Kode Promo</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {promos.map(pr => (
            <div key={pr.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-yellow-400 uppercase">{pr.code}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pr.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {pr.is_active ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">Diskon: Rp {pr.discount} (Min: Rp {pr.min_spend})</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditPromo(pr)} className="bg-yellow-600 hover:bg-yellow-700 text-black px-2 py-1 rounded text-xs font-bold">Edit</button>
                <button onClick={() => handleDeletePromo(pr.id)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-bold">Hapus</button>
              </div>
            </div>
          ))}
          {promos.length === 0 && <p className="text-xs text-gray-500 italic">Belum ada promo.</p>}
        </div>
      </div>
    </div>
  );
}