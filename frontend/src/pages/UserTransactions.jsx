import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('user_token');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('http://localhost:5000/api/user/transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Gagal mengambil data');
        }
        setTransactions(data.data || []);
      })
      .catch(err => {
        console.error('Gagal memuat riwayat:', err);
      })
      .finally(() => {
        setLoading(false); // Dijamin berhenti loading apapun hasilnya
      });
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center p-6 bg-gray-800 rounded-xl border border-gray-700 space-y-4">
        <p className="text-gray-300 text-sm">Kamu harus login terlebih dahulu untuk melihat riwayat transaksi.</p>
        <button 
          onClick={() => navigate('/user/login')} 
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 transition rounded-lg text-sm font-bold text-white"
        >
          Login Sekarang
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Memuat riwayat transaksi...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-white">Riwayat Transaksi Saya</h1>
      
      <div className="space-y-4">
        {transactions.map((trx, idx) => (
          <div key={idx} className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue-400 text-sm">{trx.invoice}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${trx.payment_status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {trx.payment_status}
                </span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs font-bold">
                  {trx.order_status}
                </span>
              </div>
              <div className="text-sm font-bold text-white">{trx.product_name} (x{trx.qty})</div>
              <div className="text-xs text-gray-400">Akun: {trx.account_data} | Pembayaran: {trx.payment_method}</div>
            </div>

            <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
              <div className="text-green-400 font-extrabold text-sm">Rp {trx.total_price.toLocaleString('id-ID')}</div>
              <button 
                onClick={() => navigate(`/invoice/${trx.invoice}`)}
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold transition text-white"
              >
                Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="text-center text-gray-500 py-12 bg-gray-800/50 rounded-xl border border-gray-700/50">
          Belum ada riwayat transaksi yang tercatat.
        </div>
      )}
    </div>
  );
}