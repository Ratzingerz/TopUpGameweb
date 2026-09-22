import React from 'react';

export default function PaymentManagement({
  editPaymentId,
  payGameId, setPayGameId,
  payName, setPayName,
  payFee, setPayFee,
  payIsActive, setPayIsActive, // State status aktif pembayaran
  handleSavePayment, resetPaymentForm,
  games, payments,
  handleEditPayment, handleDeletePayment
}) {
  return (
    <div className="space-y-6">
      {/* Form Tambah / Edit Pembayaran */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-purple-400 text-sm">{editPaymentId ? 'Edit Pembayaran' : 'Tambah Pembayaran'}</h3>
          {editPaymentId && <button onClick={resetPaymentForm} className="text-xs text-gray-400 hover:text-white underline">Batal</button>}
        </div>
        <form onSubmit={handleSavePayment} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select className="w-full p-2 bg-gray-900 rounded text-sm text-white outline-none border border-gray-700" value={payGameId} onChange={e => setPayGameId(e.target.value)}>
              <option value="">-- Semua Game (Global) --</option>
              {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <input type="text" placeholder="Metode (BCA, QRIS)" required className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" value={payName} onChange={e => setPayName(e.target.value)} />
            <input type="number" placeholder="Biaya Admin" className="w-full p-2 bg-gray-900 rounded text-sm text-white border border-gray-700" value={payFee} onChange={e => setPayFee(e.target.value)} />
          </div>

          {/* Toggle Status Aktif Pembayaran */}
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="payIsActive" checked={payIsActive} onChange={e => setPayIsActive(e.target.checked)} className="w-4 h-4 accent-purple-500 rounded" />
            <label htmlFor="payIsActive" className="text-xs text-gray-300">Status Aktif (Tampil di Opsi Checkout User)</label>
          </div>

          <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded text-sm font-bold transition">
            {editPaymentId ? 'Update Pembayaran' : 'Simpan Pembayaran'}
          </button>
        </form>
      </div>

      {/* Daftar Metode Pembayaran */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
        <h3 className="font-bold text-lg text-white">Daftar Metode Pembayaran</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {payments.map(p => (
            <div key={p.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{p.name}</span>
                  {/* Badge Status Pembayaran */}
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.is_active !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.is_active !== false ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>
                <div className="text-xs text-purple-400 mt-0.5">Fee: Rp {p.fee}</div>
                <div className="text-xs text-gray-400">Target: {p.game_id ? `Game ID #${p.game_id}` : 'Semua Game (Global)'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditPayment(p)} className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs font-bold">Edit</button>
                <button onClick={() => handleDeletePayment(p.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-bold">Hapus</button>
              </div>
            </div>
          ))}
          {payments.length === 0 && <p className="text-xs text-gray-500 italic">Belum ada metode pembayaran.</p>}
        </div>
      </div>
    </div>
  );
}