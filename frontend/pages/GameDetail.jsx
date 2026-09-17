import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function GameDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [promos, setPromos] = useState([]);

  // Form input top up
  const [accountData, setAccountData] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil detail game & produk berdasarkan slug
    fetch(`http://localhost:5000/api/games/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGame(data.data.game);
          setProducts(data.data.products || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal memuat detail game:', err);
        setLoading(false);
      });

    // Ambil metode pembayaran
    fetch('http://localhost:5000/api/admin/payments')
      .then(res => res.json())
      .then(data => setPayments(data.data || []));

    // Ambil daftar promo
    fetch('http://localhost:5000/api/admin/promos')
      .then(res => res.json())
      .then(data => setPromos(data.data || []));
  }, [slug]);

  const handleApplyPromo = () => {
    const found = promos.find(p => p.code.toUpperCase() === promoCode.toUpperCase() && p.is_active);
    if (!found) {
      alert('Kode promo tidak valid atau sudah tidak aktif!');
      setAppliedPromo(null);
      return;
    }
    const subtotal = selectedProduct ? selectedProduct.price : 0;
    if (found.min_spend && subtotal < found.min_spend) {
      alert(`Minimum pembelian untuk promo ini adalah Rp ${found.min_spend.toLocaleString('id-ID')}`);
      return;
    }
    setAppliedPromo(found);
    alert('Promo berhasil digunakan!');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Silakan pilih item top up terlebih dahulu!');
      return;
    }
    if (!selectedPayment) {
      alert('Silakan pilih metode pembayaran!');
      return;
    }

    const subtotal = selectedProduct.price;
    const discount = appliedPromo ? appliedPromo.discount : 0;
    const fee = selectedPayment.fee || 0;
    const totalPrice = Math.max(0, subtotal - discount + fee);

    const payload = {
      game_name: game.name,
      product_name: selectedProduct.name,
      account_data: accountData,
      payment_method: selectedPayment.name,
      total_price: totalPrice
    };

    try {
      const res = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        alert(`Pesanan berhasil dibuat!\nNo Invoice: ${data.invoice}\nTotal: Rp ${totalPrice.toLocaleString('id-ID')}`);
        navigate('/');
      } else {
        alert(data.message || 'Gagal membuat pesanan');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal terhubung ke server backend.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Memuat halaman game...</div>;
  }

  if (!game) {
    return <div className="p-12 text-center text-red-400">Game tidak ditemukan.</div>;
  }

  const subtotal = selectedProduct ? selectedProduct.price : 0;
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const fee = selectedPayment ? selectedPayment.fee : 0;
  const grandTotal = Math.max(0, subtotal - discount + fee);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header Banner Game */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col md:flex-row gap-6 items-center shadow-lg">
        <img 
          src={game.image_url || 'https://via.placeholder.com/150'} 
          alt={game.name} 
          className="w-32 h-32 object-cover rounded-xl border border-gray-600 shadow" 
        />
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{game.name}</h1>
          <p className="text-sm text-gray-300">Masukkan data akun dan pilih nominal top up favoritmu di bawah ini.</p>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="space-y-6">
        {/* Step 1: Data Akun */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-3">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Masukkan Data Akun ({game.account_fields || 'User ID'})
          </h3>
          <input 
            type="text" 
            required
            placeholder={`Contoh: 12345678 (Server ID)`}
            value={accountData}
            onChange={e => setAccountData(e.target.value)}
            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-white text-sm outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Step 2: Pilih Item */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Pilih Nominal Top Up
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(prod => (
              <div 
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${selectedProduct?.id === prod.id ? 'bg-blue-900/40 border-blue-500 shadow-md' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
              >
                <div className="font-bold text-sm text-white mb-2">{prod.name}</div>
                <div className="text-green-400 font-extrabold text-sm">Rp {prod.price.toLocaleString('id-ID')}</div>
              </div>
            ))}
          </div>
          {products.length === 0 && <p className="text-gray-500 text-sm">Belum ada item produk untuk game ini.</p>}
        </div>

        {/* Step 3: Metode Pembayaran */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
            Pilih Metode Pembayaran
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {payments.map(pay => (
              <div 
                key={pay.id}
                onClick={() => setSelectedPayment(pay)}
                className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${selectedPayment?.id === pay.id ? 'bg-purple-900/40 border-purple-500 shadow-md' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
              >
                <span className="font-bold text-sm text-white">{pay.name}</span>
                <span className="text-xs text-gray-400">Biaya Admin: Rp {(pay.fee || 0).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Promo & Ringkasan */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
            Kode Promo & Pembayaran
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Masukkan Kode Promo"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value)}
              className="p-3 bg-gray-900 rounded-lg border border-gray-700 text-white text-sm outline-none uppercase flex-1"
            />
            <button type="button" onClick={handleApplyPromo} className="px-5 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-sm transition">
              Gunakan
            </button>
          </div>

          <div className="border-t border-gray-700 pt-4 space-y-2 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Subtotal Produk:</span>
              <span className="font-bold text-white">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-green-400">
                <span>Diskon ({appliedPromo.code}):</span>
                <span>- Rp {discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Biaya Admin:</span>
              <span className="font-bold text-white">Rp {fee.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-white border-t border-gray-700 pt-2">
              <span>Total Pembayaran:</span>
              <span className="text-green-400">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-base transition shadow-lg mt-4">
            Beli Sekarang & Bayar
          </button>
        </div>
      </form>
    </div>
  );
}