import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function InvoicePage() {
  const { id } = useParams(); // id bertindak sebagai nomor invoice
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/invoice/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setInvoice(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal mengambil data invoice:', err);
        setLoading(false);
      });
  }, [id]);

  const handleSimulatePay = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/checkout/${id}/pay`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        alert('Pembayaran berhasil disimulasikan!');
        window.location.reload();
      } else {
        alert(data.message || 'Gagal memproses pembayaran');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExpire = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/checkout/${id}/expire`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('Invoice kadaluarsa.');
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Memuat detail invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-12 text-center text-red-400">Invoice tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl space-y-6">
      <div className="text-center space-y-2 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-white">Detail Transaksi</h2>
        <p className="font-mono text-blue-400 font-bold">{invoice.invoice}</p>
      </div>

      <div className="space-y-3 text-sm text-gray-300">
        <div className="flex justify-between">
          <span>Game:</span>
          <span className="font-bold text-white">{invoice.game_name}</span>
        </div>
        <div className="flex justify-between">
          <span>Item Produk:</span>
          <span className="font-bold text-white">{invoice.product_name}</span>
        </div>
        <div className="flex justify-between">
          <span>Data Akun:</span>
          <span className="font-mono text-white">{invoice.account_data}</span>
        </div>
        <div className="flex justify-between">
          <span>Metode Pembayaran:</span>
          <span className="font-bold text-white">{invoice.payment_method}</span>
        </div>
        <div className="flex justify-between border-t border-gray-700 pt-3">
          <span>Status Pembayaran:</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${invoice.payment_status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {invoice.payment_status}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Status Pesanan:</span>
          <span className="font-bold text-white">{invoice.order_status}</span>
        </div>
        <div className="flex justify-between text-base font-extrabold text-white border-t border-gray-700 pt-3">
          <span>Total Harga:</span>
          <span className="text-green-400">Rp {invoice.total_price.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {invoice.payment_status === 'UNPAID' && (
        <div className="flex gap-3 pt-2">
          <button 
            onClick={handleSimulatePay}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-sm transition shadow-lg"
          >
            Simulasi Bayar Sekarang
          </button>
          <button 
            onClick={handleExpire}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-sm transition"
          >
            Batalkan
          </button>
        </div>
      )}

      <button 
        onClick={() => navigate('/')} 
        className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-bold transition text-gray-300"
      >
        Kembali ke Beranda
      </button>
    </div>
  );
}