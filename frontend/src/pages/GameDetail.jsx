import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function GameDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);

  // Form input top up
  const [accountFormValues, setAccountFormValues] = useState({});
  const [contact, setContact] = useState(''); // State untuk Nomor WhatsApp
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Modal Verifikasi & Syarat Ketentuan
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // State Modal Simulasi Pembayaran QR & Timer
  const [paymentModal, setPaymentModal] = useState(null); 
  const [timeLeft, setTimeLeft] = useState(120); // 2 Menit (120 detik)

  useEffect(() => {
    fetch(`http://localhost:5000/api/games/${slug}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.data) {
          setGame(resData.data.game);
          setProducts(resData.data.products || []);
          setPayments(resData.data.payments || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal memuat detail game:', err);
        setLoading(false);
      });
  }, [slug]);

  // Efek Timer Hitung Mundur Pembayaran
  useEffect(() => {
    let timer;
    if (paymentModal && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && paymentModal) {
      alert('Waktu pembayaran habis! Transaksi dibatalkan.');
      setPaymentModal(null);
      setTimeLeft(120);
    }
    return () => clearInterval(timer);
  }, [paymentModal, timeLeft]);

  // Parse kolom akun secara dinamis berdasarkan koma
  const getAccountFieldsList = () => {
    if (!game?.account_fields) return ['User ID'];
    if (game.account_fields.includes(',')) {
      return game.account_fields.split(',').map(s => s.trim());
    }
    if (game.account_fields.includes('(')) {
      const parts = game.account_fields.replace(')', '').split('(');
      return parts.map(s => s.trim());
    }
    return [game.account_fields];
  };

  const accountFieldsList = getAccountFieldsList();

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    const subtotal = selectedProduct ? selectedProduct.price : 0;
    try {
      const res = await fetch('http://localhost:5000/api/check-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotal: subtotal })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedPromo({ code: promoCode, discount: data.discount });
        alert('Promo berhasil digunakan!');
      } else {
        alert(data.message || 'Kode promo tidak valid');
        setAppliedPromo(null);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengecek promo');
    }
  };

  // Validasi awal sebelum memunculkan pop-up verifikasi
  const handlePreCheckout = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Silakan pilih item top up terlebih dahulu!');
      return;
    }
    if (!selectedPayment) {
      alert('Silakan pilih metode pembayaran!');
      return;
    }
    if (!contact) {
      alert('Silakan masukkan nomor WhatsApp/Kontak terlebih dahulu!');
      return;
    }

    const combinedAccountData = accountFieldsList
      .map((label, idx) => accountFormValues[idx] ? `${accountFormValues[idx]}` : '')
      .filter(Boolean)
      .join(' ');

    if (!combinedAccountData) {
      alert('Silakan lengkapi data akun terlebih dahulu!');
      return;
    }

    // Jika lolos validasi, buka pop-up verifikasi akhir
    setAgreedTerms(false);
    setShowVerificationModal(true);
  };

  // Eksekusi checkout ke backend setelah user menyetujui syarat di pop-up verifikasi
  const handleConfirmCheckout = async () => {
    if (!agreedTerms) {
      alert('Anda harus menyetujui syarat & ketentuan terlebih dahulu!');
      return;
    }

    const combinedAccountData = accountFieldsList
      .map((label, idx) => accountFormValues[idx] ? `${accountFormValues[idx]}` : '')
      .filter(Boolean)
      .join(' ');

    const subtotal = selectedProduct.price;
    const discount = appliedPromo ? appliedPromo.discount : 0;
    const fee = selectedPayment.fee || 0;
    const totalPrice = Math.max(0, subtotal - discount + fee);

    const payload = {
      game_name: game.name,
      product_name: selectedProduct.name,
      account_data: combinedAccountData,
      contact: contact, 
      qty: 1,
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
        setShowVerificationModal(false); // Tutup modal verifikasi
        setPaymentModal({
          invoice: data.invoice,
          totalPrice: totalPrice,
          paymentMethod: selectedPayment.name
        });
        setTimeLeft(120); // Reset timer 2 menit
      } else {
        alert(data.message || 'Gagal membuat pesanan');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal terhubung ke server backend.');
    }
  };

  const handleSimulateSuccess = () => {
    alert('Simulasi Pembayaran Berhasil! Pesanan Anda sedang diproses.');
    setPaymentModal(null);
    navigate('/');
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

  const combinedAccountDataDisplay = accountFieldsList
    .map((label, idx) => accountFormValues[idx] || '')
    .filter(Boolean)
    .join(' / ');

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 text-white relative">
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

      <form onSubmit={handlePreCheckout} className="space-y-6">
        {/* Step 1: Data Akun & WhatsApp */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Masukkan Data Akun & Kontak
          </h3>

          <div className={`grid grid-cols-1 ${accountFieldsList.length > 1 ? 'sm:grid-cols-2' : ''} gap-3`}>
            {accountFieldsList.map((label, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-xs text-gray-400">{label}</label>
                <input 
                  type="text" 
                  required
                  placeholder={`Masukkan ${label}`}
                  value={accountFormValues[idx] || ''}
                  onChange={e => {
                    setAccountFormValues({
                      ...accountFormValues,
                      [idx]: e.target.value
                    });
                  }}
                  className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-white text-sm outline-none focus:border-blue-500 font-mono"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-gray-400">Nomor WhatsApp (Untuk Bukti/Notifikasi)</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: 081234567890"
              value={contact}
              onChange={e => setContact(e.target.value)}
              className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-white text-sm outline-none focus:border-blue-500 font-mono"
            />
          </div>
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
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${selectedProduct?.id === prod.id ? 'bg-blue-900/40 border-blue-500 shadow-md' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
              >
                {prod.image_url ? (
                  <img src={prod.image_url} alt={prod.name} className="w-12 h-12 object-cover rounded-lg border border-gray-700 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0">No Image</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate">{prod.name}</div>
                  <div className="text-green-400 font-extrabold text-xs mt-1">Rp {prod.price.toLocaleString('id-ID')}</div>
                </div>
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
          {payments.length === 0 && <p className="text-gray-500 text-sm">Belum ada metode pembayaran tersedia.</p>}
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

          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-base transition shadow-lg mt-4">
            Beli Sekarang & Verifikasi Data
          </button>
        </div>
      </form>

      {/* MODAL POP-UP VERIFIKASI AKHIR & SYARAT KETENTUAN */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-5 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white">Konfirmasi Data & Syarat Ketentuan</h3>
              <button onClick={() => setShowVerificationModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3 bg-gray-800 p-4 rounded-xl text-sm border border-gray-700">
              <div className="flex justify-between"><span className="text-gray-400">Game:</span> <span className="font-bold text-white">{game.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Data Akun:</span> <span className="font-mono text-blue-400 font-bold">{combinedAccountDataDisplay}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">No. WhatsApp:</span> <span className="font-mono text-white">{contact}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Item Dipilih:</span> <span className="font-bold text-white">{selectedProduct?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Metode Bayar:</span> <span className="font-bold text-purple-400">{selectedPayment?.name}</span></div>
              <div className="flex justify-between border-t border-gray-700 pt-2 text-base"><span className="text-gray-300 font-bold">Total Tagihan:</span> <span className="font-extrabold text-green-400">Rp {grandTotal.toLocaleString('id-ID')}</span></div>
            </div>

            <div className="text-xs text-gray-400 bg-gray-950 p-3 rounded-lg border border-gray-800 space-y-1">
              <p className="font-bold text-gray-300">Ketentuan Layanan:</p>
              <p>1. Pastikan ID Akun yang dimasukkan sudah benar. Kesalahan pengisian ID di luar tanggung jawab kami.</p>
              <p>2. Proses pengisian game diproses otomatis setelah pembayaran dikonfirmasi.</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="modalTerms" 
                checked={agreedTerms} 
                onChange={e => setAgreedTerms(e.target.checked)} 
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer" 
              />
              <label htmlFor="modalTerms" className="text-xs text-gray-200 cursor-pointer font-medium">
                Saya menyatakan data di atas sudah benar dan setuju dengan Syarat & Ketentuan.
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-xs text-gray-300 transition"
              >
                Periksa Kembali
              </button>
              <button 
                onClick={handleConfirmCheckout}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm transition shadow-lg text-white"
              >
                Konfirmasi & Lanjut Bayar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SIMULASI PEMBAYARAN QR & TIMER */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 space-y-6 text-center shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Selesaikan Pembayaran</h3>
              <p className="text-xs text-gray-400">No. Invoice: <span className="font-mono text-blue-400 font-bold">{paymentModal.invoice}</span></p>
            </div>

            {/* Timer Hitung Mundur */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex justify-between items-center text-sm">
              <span className="text-red-300 font-medium">Batas Waktu Pembayaran:</span>
              <span className="font-mono font-extrabold text-red-400 text-lg">{formatTime(timeLeft)}</span>
            </div>

            {/* Mock QR Code */}
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner mx-auto">
              <div className="w-48 h-48 bg-gray-200 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded text-gray-600 text-xs font-mono">
                <span>[ MOCK QR CODE ]</span>
                <span className="mt-2 font-bold">{paymentModal.paymentMethod}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-400">Total Tagihan:</div>
              <div className="text-2xl font-black text-green-400">Rp {paymentModal.totalPrice.toLocaleString('id-ID')}</div>
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={handleSimulateSuccess}
                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-sm transition shadow-lg text-white"
              >
                Simulasikan Pembayaran Berhasil ✅
              </button>
              <button 
                onClick={() => setPaymentModal(null)}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-xs text-gray-400 transition"
              >
                Batalkan Pesanan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}