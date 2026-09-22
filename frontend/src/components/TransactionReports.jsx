import React from 'react';

export default function TransactionReports({
  searchQuery, setSearchQuery,
  filterOrderStatus, setFilterOrderStatus,
  filterPaymentStatus, setFilterPaymentStatus,
  transactions,
  token,
  loadTransactions,
  updateOrderStatus,
  activeAuditLogs, setActiveAuditLogs,
  activeTab
}) {
  return (
    <div className="space-y-6">
      {/* Tampilan Tab Transactions / Logs */}
      {activeTab === 'transactions' && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-lg text-white">⚡ Kelola Transaksi & Log</h3>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Cari Invoice / Kontak..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-gray-900 border border-gray-700 px-3 py-2 rounded text-xs text-white flex-1 md:w-60"
              />
              <select 
                value={filterOrderStatus} 
                onChange={e => setFilterOrderStatus(e.target.value)}
                className="bg-gray-900 border border-gray-700 px-3 py-2 rounded text-xs text-white"
              >
                <option value="">Semua Status Order</option>
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
              <select 
                value={filterPaymentStatus} 
                onChange={e => setFilterPaymentStatus(e.target.value)}
                className="bg-gray-900 border border-gray-700 px-3 py-2 rounded text-xs text-white"
              >
                <option value="">Semua Status Pembayaran</option>
                <option value="PAID">PAID</option>
                <option value="UNPAID">UNPAID</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="bg-gray-900 text-gray-400 border-b border-gray-700">
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Game & Item</th>
                  <th className="p-3">Akun & Kontak</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status (Bayar / Order)</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
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
                    <td className="p-3 space-y-1">
                      <div>
                        <span className="text-[10px] text-gray-400">Bayar: </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.payment_status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {t.payment_status || 'UNPAID'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400">Order: </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.order_status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : t.order_status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {t.order_status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-center items-center flex-wrap">
                        {t.payment_status === 'UNPAID' && (
                          <button 
                            onClick={async () => {
                              try {
                                const res = await fetch(`http://localhost:5000/api/admin/transactions/${t.id}/payment-status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                  body: JSON.stringify({ payment_status: 'PAID' })
                                });
                                if (res.ok) {
                                  alert('Status pembayaran berhasil diubah menjadi PAID!');
                                  loadTransactions();
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }} 
                            className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs font-bold transition"
                          >
                            Set Paid
                          </button>
                        )}
                        <button onClick={() => updateOrderStatus(t.id, 'SUCCESS')} className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs font-bold transition">Sukses</button>
                        <button onClick={() => updateOrderStatus(t.id, 'FAILED')} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-bold transition">Batal</button>
                        <button onClick={() => setActiveAuditLogs(t.audit_logs || [])} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition">📜 Log</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-500">Tidak ada transaksi ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Audit Log */}
      {activeAuditLogs && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-lg w-full p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-white">Riwayat Audit Log Transaksi</h3>
              <button onClick={() => setActiveAuditLogs(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {!Array.isArray(activeAuditLogs) || activeAuditLogs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  {typeof activeAuditLogs === 'string' ? activeAuditLogs : 'Belum ada catatan log untuk transaksi ini.'}
                </p>
              ) : (
                activeAuditLogs.map((log, idx) => (
                  <div key={idx} className="bg-gray-900 p-3 rounded border border-gray-700 text-xs space-y-1">
                    <div className="flex justify-between text-gray-400">
                      <span className="font-bold text-blue-400">{log.action || 'UPDATE'}</span>
                      <span>{log.timestamp || '-'}</span>
                    </div>
                    <div>
                      Status: <span className="text-yellow-400">{log.old_status || '-'}</span> ➔ <span className="text-green-400">{log.new_status || '-'}</span>
                    </div>
                    {log.admin_note && (
                      <div className="text-gray-300 italic">Catatan: "{log.admin_note}"</div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button onClick={() => setActiveAuditLogs(null)} className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-bold transition">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Tampilan Tab Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white text-black p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold uppercase">Laporan Pendapatan</h1>
            <button onClick={() => window.print()} className="bg-gray-900 text-white px-4 py-2 rounded font-bold text-sm print:hidden">
              🖨️ Cetak Laporan
            </button>
          </div>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-2 px-2">Invoice</th>
                <th className="py-2 px-2">Game & Item / Produk</th>
                <th className="py-2 px-2 text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {transactions.filter(t => t.order_status === 'SUCCESS').map(t => (
                <tr key={t.id} className="border-b border-gray-200">
                  <td className="py-2 px-2 font-mono">{t.invoice}</td>
                  <td className="py-2 px-2">{t.game_name} - {t.product_name}</td>
                  <td className="py-2 px-2 font-bold text-right">Rp {t.total_price.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}