import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [games, setGames] = useState([]);
  const [payments, setPayments] = useState([]);
  const [promos, setPromos] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Form state Game
  const [gameName, setGameName] = useState('');
  const [gameSlug, setGameSlug] = useState('');
  const [accountFields, setAccountFields] = useState('User ID');
  const [gameImage, setGameImage] = useState(null);
  const [editGameId, setEditGameId] = useState(null);

  // Form state Item / Product
  const [selectedGameId, setSelectedGameId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState(null);

  // Form state Payment
  const [payName, setPayName] = useState('');
  const [payFee, setPayFee] = useState('');

  // Form state Promo
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoMinSpend, setPromoMinSpend] = useState('');

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const resGames = await fetch('http://localhost:5000/api/games');
      const dGames = await resGames.json();
      setGames(dGames.data || []);

      const resPay = await fetch('http://localhost:5000/api/admin/payments');
      const dPay = await resPay.json();
      setPayments(dPay.data || []);

      const resPromos = await fetch('http://localhost:5000/api/admin/promos');
      const dPromos = await resPromos.json();
      setPromos(dPromos.data || []);

      const resTrx = await fetch('http://localhost:5000/api/admin/transactions');
      const dTrx = await resTrx.json();
      setTransactions(dTrx.data || []);
    } catch (err) {
      console.error('Gagal mengambil data admin:', err);
    }
  };

  const handleSaveGame = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', gameName);
    formData.append('slug', gameSlug);
    formData.append('account_fields', accountFields);
    if (gameImage) formData.append('image', gameImage);

    const url = editGameId 
      ? `http://localhost:5000/api/admin/games/${editGameId}`
      : 'http://localhost:5000/api/admin/games';
    const method = editGameId ? 'PUT' : 'POST';

    const res = await fetch(url, { method, body: formData });
    if (res.ok) {
      alert('Game berhasil disimpan ke database!');
      setGameName(''); setGameSlug(''); setAccountFields('User ID'); setGameImage(null); setEditGameId(null);
      loadData();
    } else {
      alert('Gagal menyimpan game');
    }
  };

  const handleDeleteGame = async (id) => {
    if (!confirm('Yakin ingin menghapus game ini?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/games/${id}`, { method: 'DELETE' });
    if (res.ok) loadData();
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('game_id', selectedGameId);
    formData.append('name', prodName);
    formData.append('price', prodPrice);
    if (prodImage) formData.append('image', prodImage);

    const res = await fetch('http://localhost:5000/api/admin/products', { method: 'POST', body: formData });
    if (res.ok) {
      alert('Item berhasil ditambahkan!');
      setProdName(''); setProdPrice(''); setProdImage(null);
      loadData();
    } else {
      alert('Gagal menambah item');
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: payName, fee: Number(payFee) })
    });
    if (res.ok) {
      alert('Metode pembayaran ditambahkan!');
      setPayName(''); setPayFee('');
      loadData();
    }
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoCode, discount: Number(promoDiscount), min_spend: Number(promoMinSpend), is_active: true })
    });
    if (res.ok) {
      alert('Promo berhasil dibuat!');
      setPromoCode(''); setPromoDiscount(''); setPromoMinSpend('');
      loadData();
    }
  };

  const updateOrderStatus = async (id, status) => {
    const adminNote = prompt('Catatan Admin (opsional):', '');
    const res = await fetch(`http://localhost:5000/api/admin/transactions/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ order_status: status, admin_note: adminNote })
    });
    if (res.ok) {
      loadData();
    } else {
      const d = await res.json();
      alert(d.message || 'Gagal mengubah status');
    }
  };

  const successfulTransactions = transactions.filter(t => t.order_status === 'SUCCESS');
  const dailyRevenue = successfulTransactions.reduce((acc, t) => acc + t.total_price, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center print:hidden border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold">Admin Panel Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('dashboard')} className={`px-5 py-2.5 rounded-t-lg font-bold transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            🕹️ Kelola Toko
          </button>
          <button onClick={() => setActiveTab('transactions')} className={`px-5 py-2.5 rounded-t-lg font-bold transition ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            ⚡ Transaksi
          </button>
          <button onClick={() => setActiveTab('reports')} className={`px-5 py-2.5 rounded-t-lg font-bold transition ${activeTab === 'reports' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            📊 Laporan
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-900 to-gray-900 p-6 rounded-xl border border-green-700/50 shadow-lg">
              <p className="text-sm text-green-300 font-semibold mb-1">Total Pendapatan Sukses</p>
              <h3 className="text-3xl font-bold text-white">Rp {dailyRevenue.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Form Game */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="font-bold mb-3 text-blue-400">{editGameId ? 'Edit Game' : 'Tambah Game'}</h3>
              <form onSubmit={handleSaveGame} className="space-y-3">
                <input type="text" placeholder="Nama Game" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={gameName} onChange={e => setGameName(e.target.value)} />
                <input type="text" placeholder="Slug (misal: mobile-legends)" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={gameSlug} onChange={e => setGameSlug(e.target.value)} />
                <input type="text" placeholder="Format Kolom" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={accountFields} onChange={e => setAccountFields(e.target.value)} />
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Gambar Game</label>
                  <input type="file" onChange={e => setGameImage(e.target.files[0])} className="w-full text-xs text-gray-400" />
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-bold transition">Simpan Game</button>
              </form>
            </div>

            {/* Form Item */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="font-bold mb-3 text-green-400">Tambah Item Game</h3>
              <form onSubmit={handleSaveProduct} className="space-y-3">
                <select required className="w-full p-2 bg-gray-900 rounded text-sm text-white outline-none" value={selectedGameId} onChange={e => setSelectedGameId(e.target.value)}>
                  <option value="">-- Pilih Game --</option>
                  {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input type="text" placeholder="Nama Item" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={prodName} onChange={e => setProdName(e.target.value)} />
                <input type="number" placeholder="Harga" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={prodPrice} onChange={e => setProdPrice(e.target.value)} />
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Gambar Item</label>
                  <input type="file" onChange={e => setProdImage(e.target.files[0])} className="w-full text-xs text-gray-400" />
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-bold transition">Simpan Item</button>
              </form>
            </div>

            {/* Form Pembayaran */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="font-bold mb-3 text-purple-400">Tambah Pembayaran</h3>
              <form onSubmit={handleSavePayment} className="space-y-3">
                <input type="text" placeholder="Metode (BCA, QRIS)" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={payName} onChange={e => setPayName(e.target.value)} />
                <input type="number" placeholder="Biaya Admin" className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={payFee} onChange={e => setPayFee(e.target.value)} />
                <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded text-sm font-bold transition">Simpan Pembayaran</button>
              </form>
            </div>

            {/* Form Promo */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="font-bold mb-3 text-yellow-400">Tambah Promo</h3>
              <form onSubmit={handleSavePromo} className="space-y-3">
                <input type="text" placeholder="Kode Promo" required className="w-full p-2 bg-gray-900 rounded text-sm text-white uppercase" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
                <input type="number" placeholder="Diskon (Rp)" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={promoDiscount} onChange={e => setPromoDiscount(e.target.value)} />
                <input type="number" placeholder="Min Spend" className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={promoMinSpend} onChange={e => setPromoMinSpend(e.target.value)} />
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded text-sm font-bold text-black transition">Simpan Promo</button>
              </form>
            </div>
          </div>

          {/* List Game */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="font-bold text-lg mb-4 text-white">Daftar Game Tersedia</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {games.map(g => (
                <div key={g.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm text-white">{g.name}</div>
                    <div className="text-xs text-gray-400">{g.products?.length || 0} Item</div>
                  </div>
                  <button onClick={() => handleDeleteGame(g.id)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-bold">Hapus</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 print:hidden">
          <h2 className="text-xl font-bold mb-6 text-white">Antrean Transaksi Masuk</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-900 text-gray-400 text-sm border-b border-gray-700">
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Game & Item</th>
                  <th className="p-4">Data Akun</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {transactions.map(t => (
                  <tr key={t.id} className="border-b border-gray-700">
                    <td className="p-4 font-bold text-blue-400">{t.invoice}</td>
                    <td className="p-4">{t.game_name} - {t.product_name}</td>
                    <td className="p-4 font-mono text-xs">{t.account_data}</td>
                    <td className="p-4 font-bold text-green-400">Rp {t.total_price.toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.order_status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {t.order_status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => updateOrderStatus(t.id, 'SUCCESS')} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-bold">Sukses</button>
                        <button onClick={() => updateOrderStatus(t.id, 'FAILED')} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-bold">Batal</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                <th className="py-2 px-2">Game & Item</th>
                <th className="py-2 px-2 text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {successfulTransactions.map(t => (
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