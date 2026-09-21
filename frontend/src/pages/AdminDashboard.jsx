import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [games, setGames] = useState([]);
  const [payments, setPayments] = useState([]);
  const [promos, setPromos] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // State Filter & Pencarian Transaksi
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');

  // State Modal Audit Log
  const [activeAuditLogs, setActiveAuditLogs] = useState(null);

  // Form state Game
  const [gameName, setGameName] = useState('');
  const [gameSlug, setGameSlug] = useState('');
  const [accountFields, setAccountFields] = useState('User ID (Zone ID)');
  const [gameImage, setGameImage] = useState(null);
  const [editGameId, setEditGameId] = useState(null);

  // Form state Item / Product
  const [selectedGameId, setSelectedGameId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState(null);
  const [editProductId, setEditProductId] = useState(null);

  // Form state Payment
  const [payGameId, setPayGameId] = useState('');
  const [payName, setPayName] = useState('');
  const [payFee, setPayFee] = useState('');
  const [editPaymentId, setEditPaymentId] = useState(null);

  // Form state Promo
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoMinSpend, setPromoMinSpend] = useState('');
  const [promoIsActive, setPromoIsActive] = useState(true);
  const [editPromoId, setEditPromoId] = useState(null);

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions' || activeTab === 'dashboard') {
      loadTransactions();
    }
  }, [searchQuery, filterOrderStatus, filterPaymentStatus, activeTab]);

  const loadBaseData = async () => {
    try {
      const resGames = await fetch('http://localhost:5000/api/games');
      const dGames = await resGames.json();
      setGames(dGames.data || []);

      const resPay = await fetch('http://localhost:5000/api/admin/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dPay = await resPay.json();
      setPayments(dPay.data || []);

      const resPromos = await fetch('http://localhost:5000/api/admin/promos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dPromos = await resPromos.json();
      setPromos(dPromos.data || []);

      loadTransactions();
    } catch (err) {
      console.error('Gagal mengambil data admin:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterOrderStatus) params.append('order_status', filterOrderStatus);
      if (filterPaymentStatus) params.append('payment_status', filterPaymentStatus);

      const resTrx = await fetch(`http://localhost:5000/api/admin/transactions?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dTrx = await resTrx.json();
      setTransactions(dTrx.data || []);
    } catch (err) {
      console.error('Gagal mengambil transaksi:', err);
    }
  };

  // --- GAME ACTIONS ---
  const handleSaveGame = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', gameName);
    formData.append('slug', gameSlug);
    formData.append('account_fields', accountFields);
    if (gameImage) formData.append('image', gameImage);

    const url = editGameId ? `http://localhost:5000/api/admin/games/${editGameId}` : 'http://localhost:5000/api/admin/games';
    const method = editGameId ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
    if (res.ok) {
      alert('Game berhasil disimpan!');
      resetGameForm();
      loadBaseData();
    } else {
      const d = await res.json();
      alert(d.message || 'Gagal menyimpan game');
    }
  };

  const resetGameForm = () => {
    setGameName(''); setGameSlug(''); setAccountFields('User ID (Zone ID)'); setGameImage(null); setEditGameId(null);
  };

  const handleEditGame = (g) => {
    setEditGameId(g.id);
    setGameName(g.name);
    setGameSlug(g.slug);
    setAccountFields(g.account_fields || 'User ID (Zone ID)');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteGame = async (id) => {
    if (!confirm('Yakin ingin menghapus game ini beserta seluruh itemnya?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/games/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) loadBaseData();
  };

  // --- PRODUCT ACTIONS ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('game_id', selectedGameId);
    formData.append('name', prodName);
    formData.append('price', prodPrice);
    if (prodImage) formData.append('image', prodImage);

    const url = editProductId ? `http://localhost:5000/api/admin/products/${editProductId}` : 'http://localhost:5000/api/admin/products';
    const method = editProductId ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
    if (res.ok) {
      alert('Item berhasil disimpan!');
      resetProductForm();
      loadBaseData();
    } else {
      const d = await res.json();
      alert(d.message || 'Gagal menyimpan item');
    }
  };

  const resetProductForm = () => {
    setProdName(''); setProdPrice(''); setProdImage(null); setEditProductId(null); setSelectedGameId('');
  };

  const handleEditProduct = (prod) => {
    setEditProductId(prod.id);
    setSelectedGameId(prod.game_id || '');
    setProdName(prod.name);
    setProdPrice(prod.price);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Yakin ingin menghapus item ini?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) loadBaseData();
    else alert('Gagal menghapus item');
  };

  // --- PAYMENT ACTIONS ---
  const handleSavePayment = async (e) => {
    e.preventDefault();
    const url = editPaymentId ? `http://localhost:5000/api/admin/payments/${editPaymentId}` : 'http://localhost:5000/api/admin/payments';
    const method = editPaymentId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: payName, fee: Number(payFee), game_id: payGameId ? Number(payGameId) : null })
    });
    if (res.ok) {
      alert('Metode pembayaran disimpan!');
      resetPaymentForm();
      loadBaseData();
    } else {
      const d = await res.json();
      alert(d.message || 'Gagal menyimpan pembayaran');
    }
  };

  const resetPaymentForm = () => {
    setPayName(''); setPayFee(''); setPayGameId(''); setEditPaymentId(null);
  };

  const handleEditPayment = (p) => {
    setEditPaymentId(p.id);
    setPayGameId(p.game_id || '');
    setPayName(p.name);
    setPayFee(p.fee);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePayment = async (id) => {
    if (!confirm('Yakin ingin menghapus metode pembayaran ini?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/payments/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) loadBaseData();
    else alert('Gagal menghapus pembayaran');
  };

  // --- PROMO ACTIONS ---
  const handleSavePromo = async (e) => {
    e.preventDefault();
    const url = editPromoId ? `http://localhost:5000/api/admin/promos/${editPromoId}` : 'http://localhost:5000/api/admin/promos';
    const method = editPromoId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ code: promoCode, discount: Number(promoDiscount), min_spend: Number(promoMinSpend), is_active: promoIsActive })
    });
    if (res.ok) {
      alert('Promo berhasil disimpan!');
      resetPromoForm();
      loadBaseData();
    } else {
      const d = await res.json();
      alert(d.message || 'Gagal menyimpan promo');
    }
  };

  const resetPromoForm = () => {
    setPromoCode(''); setPromoDiscount(''); setPromoMinSpend(''); setPromoIsActive(true); setEditPromoId(null);
  };

  const handleEditPromo = (pr) => {
    setEditPromoId(pr.id);
    setPromoCode(pr.code);
    setPromoDiscount(pr.discount);
    setPromoMinSpend(pr.min_spend);
    setPromoIsActive(pr.is_active);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePromo = async (id) => {
    if (!confirm('Yakin ingin menghapus promo ini?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/promos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) loadBaseData();
    else alert('Gagal menghapus promo');
  };

  const updateOrderStatus = async (id, status) => {
    const adminNote = prompt('Catatan Admin (opsional):', '');
    const res = await fetch(`http://localhost:5000/api/admin/transactions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ order_status: status, admin_note: adminNote })
    });
    if (res.ok) loadTransactions();
    else {
      const d = await res.json();
      alert(d.message || 'Gagal mengubah status');
    }
  };

  // --- ANALYTICS COMPUTATIONS ---
  const successfulTransactions = transactions.filter(t => t.order_status === 'SUCCESS' || t.order_status === 'PROCESSING');
  const totalRevenue = successfulTransactions.reduce((acc, t) => acc + t.total_price, 0);
  const totalOrdersCount = transactions.length;
  const successRate = totalOrdersCount > 0 ? Math.round((successfulTransactions.length / totalOrdersCount) * 100) : 0;

  // Hitung Popular Games berdasarkan transaksi
  const gameSalesCount = transactions.reduce((acc, t) => {
    acc[t.game_name] = (acc[t.game_name] || 0) + 1;
    return acc;
  }, {});
  const popularGamesSorted = Object.entries(gameSalesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 5 Transaksi Terbaru (Recent Transactions)
  const recentTransactions = [...transactions].slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 text-white">
      <div className="flex justify-between items-center print:hidden border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold">Admin Panel Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('dashboard')} className={`px-5 py-2.5 rounded-t-lg font-bold transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            🕹️ Kelola & Analitik Toko
          </button>
          <button onClick={() => setActiveTab('transactions')} className={`px-5 py-2.5 rounded-t-lg font-bold transition ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            ⚡ Transaksi & Log
          </button>
          <button onClick={() => setActiveTab('reports')} className={`px-5 py-2.5 rounded-t-lg font-bold transition ${activeTab === 'reports' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            📊 Laporan
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8 print:hidden">
          
          {/* TAHAP 2: STATISTIK KARTU (METRICS) */}
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
              <h3 className="text-2xl font-black text-yellow-400">{games.length} Game</h3>
              <p className="text-[10px] text-gray-500 mt-2">Aktif di etalase toko</p>
            </div>
          </div>

          {/* TAHAP 2: CHART & POPULAR GAMES ANALYTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visualisasi Grafik Sederhana (Chart) */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-white">📈 Tren Pendapatan & Volume Transaksi</h3>
                <span className="text-xs text-gray-400 bg-gray-900 px-3 py-1 rounded border border-gray-700">Real-time</span>
              </div>
              <div className="h-64 bg-gray-900 rounded-xl border border-gray-700 p-4 flex flex-col justify-end">
                {/* Simulated Chart Bars */}
                <div className="flex items-end justify-between h-44 gap-2 px-2 border-b border-gray-800 pb-2">
                  {transactions.slice(-7).map((t, idx) => {
  // Hitung tinggi berbasis piksel (maksimal tinggi batang 120px)
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

          {/* TAHAP 2: RECENT TRANSACTIONS WIDGET */}
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

          <hr className="border-gray-700 my-6" />

          {/* Forms Section (Game, Item, Pembayaran, Promo) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Form Game */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-blue-400 text-sm">{editGameId ? 'Edit Game' : 'Tambah Game'}</h3>
                {editGameId && <button onClick={resetGameForm} className="text-xs text-gray-400 hover:text-white underline">Batal</button>}
              </div>
              <form onSubmit={handleSaveGame} className="space-y-3">
                <input type="text" placeholder="Nama Game" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={gameName} onChange={e => setGameName(e.target.value)} />
                <input type="text" placeholder="Slug (misal: mobile-legends)" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={gameSlug} onChange={e => setGameSlug(e.target.value)} />
                <input type="text" placeholder="Format Kolom" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={accountFields} onChange={e => setAccountFields(e.target.value)} />
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
                <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-bold transition">{editProductId ? 'Update Item' : 'Simpan Item'}</button>
              </form>
            </div>

            {/* Form Pembayaran */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-purple-400 text-sm">{editPaymentId ? 'Edit Pembayaran' : 'Tambah Pembayaran'}</h3>
                {editPaymentId && <button onClick={resetPaymentForm} className="text-xs text-gray-400 hover:text-white underline">Batal</button>}
              </div>
              <form onSubmit={handleSavePayment} className="space-y-3">
                <select className="w-full p-2 bg-gray-900 rounded text-sm text-white outline-none" value={payGameId} onChange={e => setPayGameId(e.target.value)}>
                  <option value="">-- Semua Game (Global) --</option>
                  {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input type="text" placeholder="Metode (BCA, QRIS)" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={payName} onChange={e => setPayName(e.target.value)} />
                <input type="number" placeholder="Biaya Admin" className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={payFee} onChange={e => setPayFee(e.target.value)} />
                <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded text-sm font-bold transition">{editPaymentId ? 'Update Pembayaran' : 'Simpan Pembayaran'}</button>
              </form>
            </div>

            {/* Form Promo */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-yellow-400 text-sm">{editPromoId ? 'Edit Promo' : 'Tambah Promo'}</h3>
                {editPromoId && <button onClick={resetPromoForm} className="text-xs text-gray-400 hover:text-white underline">Batal</button>}
              </div>
              <form onSubmit={handleSavePromo} className="space-y-3">
                <input type="text" placeholder="Kode Promo" required className="w-full p-2 bg-gray-900 rounded text-sm text-white uppercase" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
                <input type="number" placeholder="Diskon (Rp)" required className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={promoDiscount} onChange={e => setPromoDiscount(e.target.value)} />
                <input type="number" placeholder="Min Spend" className="w-full p-2 bg-gray-900 rounded text-sm text-white" value={promoMinSpend} onChange={e => setPromoMinSpend(e.target.value)} />
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" id="isActive" checked={promoIsActive} onChange={e => setPromoIsActive(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                  <label htmlFor="isActive" className="text-xs text-gray-300">Status Aktif</label>
                </div>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded text-sm font-bold text-black transition">{editPromoId ? 'Update Promo' : 'Simpan Promo'}</button>
              </form>
            </div>
          </div>

          {/* List Management Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* List Game & Produknya */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4 md:col-span-2">
              <h3 className="font-bold text-lg text-white">Daftar Game & Item Produk</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {games.map(g => (
                  <div key={g.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <div>
                        <div className="font-bold text-base text-blue-400">{g.name} <span className="text-xs text-gray-400">({g.slug})</span></div>
                        <div className="text-xs text-gray-400">Format Akun: {g.account_fields}</div>
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
                                <div className="font-bold text-white">{prod.name}</div>
                                <div className="text-green-400">Rp {prod.price?.toLocaleString('id-ID')}</div>
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

            {/* List Pembayaran */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
              <h3 className="font-bold text-lg text-white">Daftar Metode Pembayaran</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {payments.map(p => (
                  <div key={p.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-white">{p.name} <span className="text-xs text-purple-400">(Fee: Rp {p.fee})</span></div>
                      <div className="text-xs text-gray-400">Target: {p.game_id ? `Game ID #${p.game_id}` : 'Semua Game (Global)'}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditPayment(p)} className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs font-bold">Edit</button>
                      <button onClick={() => handleDeletePayment(p.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-bold">Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* List Promo */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
              <h3 className="font-bold text-lg text-white">Daftar Kode Promo</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
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
              </div>
            </div>

          </div>
        </div>
      )}

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
              
              {/* Kolom Status Pembayaran & Order */}
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

              {/* Kolom Aksi */}
              <td className="p-3">
                <div className="flex gap-1 justify-center items-center flex-wrap">
                  {t.payment_status === 'UNPAID' && (
                    <button 
                      onClick={async () => {
                        try {
                          const res = await fetch(`http://localhost:5000/api/admin/transactions/${t.id}/payment-status`, {
                            method: 'PUT',
                            headers: { 
                              'Content-Type': 'application/json', 
                              'Authorization': `Bearer ${token}` 
                            },
                            body: JSON.stringify({ payment_status: 'PAID' })
                          });

                          const contentType = res.headers.get("content-type");
                          let data = {};
                          if (contentType && contentType.includes("application/json")) {
                            data = await res.json();
                          }

                          if (res.ok) {
                            alert('Status pembayaran berhasil diubah menjadi PAID!');
                            loadTransactions();
                          } else {
                            alert(data.message || `Gagal mengubah status (Error Code: ${res.status})`);
                          }
                        } catch (err) {
                          console.error('Error detail:', err);
                          alert('Terjadi kesalahan koneksi ke server Flask! Pastikan backend sudah berjalan.');
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

      <button 
        onClick={() => setActiveAuditLogs(null)} 
        className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-bold transition"
      >
        Tutup
      </button>
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