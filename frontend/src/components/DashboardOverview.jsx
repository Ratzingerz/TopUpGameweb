import React from 'react';

export default function DashboardOverview({ 
  totalRevenue, 
  totalOrdersCount, 
  successRate, 
  gamesCount, 
  transactions, 
  popularGamesSorted, 
  recentTransactions, 
  setActiveTab 
}) {
  return (
    <div className="space-y-8 print:hidden">
      {/* STATISTIK KARTU (METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md">
          <p className="text-xs text-gray-400 font-semibold mb-1">Total Pendapatan</p>
          <h3 className="text-2xl font-black text-green-400">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
          <p className="text-[10px] text-gray-500 mt-2">Dari pesanan sukses & diproses</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md">
          <p className="text-xs text-gray-400 font-semibold mb-1">Total Pesanan</p>
          <h3 className="text-2xl font-black text-blue-400">{totalOrdersCount} Transaksi</h3>
          <p className="text-[10px] text-gray-500 mt-2">Semua status pesanan</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md">
          <p className="text-xs text-gray-400 font-semibold mb-1">Tingkat Keberhasilan</p>
          <h3 className="text-2xl font-black text-purple-400">{successRate}%</h3>
          <p className="text-[10px] text-gray-500 mt-2">Rasio pesanan sukses</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md">
          <p className="text-xs text-gray-400 font-semibold mb-1">Total Game Terdaftar</p>
          <h3 className="text-2xl font-black text-yellow-400">{gamesCount} Game</h3>
          <p className="text-[10px] text-gray-500 mt-2">Aktif di etalase toko</p>
        </div>
      </div>

      {/* CHART & POPULAR GAMES ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualisasi Grafik Sederhana (Chart) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-white">📈 Tren Pendapatan & Volume Transaksi</h3>
            <span className="text-xs text-gray-400 bg-gray-900 px-3 py-1 rounded border border-gray-700">Real-time</span>
          </div>
          <div className="h-64 bg-gray-900 rounded-xl border border-gray-700 p-4 flex flex-col justify-end">
            <div className="flex items-end justify-between h-44 gap-2 px-2 border-b border-gray-800 pb-2">
              {transactions.slice(-7).map((t, idx) => {
                const maxPrice = Math.max(...transactions.map(item => item.total_price), 1);
                const barHeight = Math.max(15, (t.total_price / maxPrice) * 120);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-1 group relative h-full">
                    <div 
                      className="w-full bg-blue-600 hover:bg-blue-500 rounded-t transition-all duration-300 cursor-pointer"
                      style={{ height: `${barHeight}px` }}
                      title={`Invoice: ${t.invoice} | Rp ${t.total_price.toLocaleString('id-ID')}`}
                    ></div>
                    <span className="text-[9px] text-gray-400 truncate w-full text-center font-mono">#{t.id}</span>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Belum ada data grafik transaksi.</div>
              )}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 pt-2 px-2">
              <span>Transaksi Terdahulu</span>
              <span>Transaksi Terbaru</span>
            </div>
          </div>
        </div>

        {/* Popular Games Widget */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="font-bold text-base text-white">🔥 Popular Games</h3>
          <div className="space-y-3">
            {popularGamesSorted.length > 0 ? (
              popularGamesSorted.map(([gName, count], idx) => (
                <div key={idx} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">#{idx + 1}</span>
                    <span className="font-bold text-white">{gName}</span>
                  </div>
                  <span className="text-gray-400 font-mono">{count} Order</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic py-6 text-center">Belum ada data penjualan game.</p>
            )}
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS WIDGET */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-white">⚡ Transaksi Terbaru (Recent Transactions)</h3>
          <button onClick={() => setActiveTab('transactions')} className="text-xs text-blue-400 hover:underline">Lihat Semua →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
            <thead>
              <tr className="bg-gray-900 text-gray-400 border-b border-gray-700">
                <th className="p-3">Invoice</th>
                <th className="p-3">Game & Item</th>
                <th className="p-3">Kontak / Akun</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(t => (
                <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-900/50">
                  <td className="p-3 font-mono font-bold text-blue-400">{t.invoice}</td>
                  <td className="p-3">
                    <div className="font-semibold">{t.game_name}</div>
                    <div className="text-[10px] text-gray-400">{t.product_name}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-mono">{t.account_data}</div>
                    <div className="text-[10px] text-gray-400">{t.contact}</div>
                  </td>
                  <td className="p-3 font-bold text-green-400">Rp {t.total_price.toLocaleString('id-ID')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.order_status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : t.order_status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {t.order_status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">Belum ada transaksi tercatat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}