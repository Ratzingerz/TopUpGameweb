import React, { useState, useEffect } from 'react';
import DashboardOverview from '../components/DashboardOverview';
import GameManagement from '../components/GameManagement';
import PaymentManagement from '../components/PaymentManagement';
import PromoManagement from '../components/PromoManagement';
import BannerManagement from '../components/BannerManagement';
import TransactionReports from '../components/TransactionReports';
import UserManagement from '../components/UserManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [games, setGames] = useState([]);
  const [payments, setPayments] = useState([]);
  const [promos, setPromos] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [activeAuditLogs, setActiveAuditLogs] = useState(null);

  // Form States (Game & Product)
  const [gameName, setGameName] = useState('');
  const [gameSlug, setGameSlug] = useState('');
  const [accountFields, setAccountFields] = useState('User ID (Zone ID)');
  const [gameIsActive, setGameIsActive] = useState(true);
  const [gameImage, setGameImage] = useState(null);
  const [editGameId, setEditGameId] = useState(null);

  const [selectedGameId, setSelectedGameId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodImage, setProdImage] = useState(null);
  const [editProductId, setEditProductId] = useState(null);

  // Form States (Payment)
  const [payGameId, setPayGameId] = useState('');
  const [payName, setPayName] = useState('');
  const [payFee, setPayFee] = useState('');
  const [payIsActive, setPayIsActive] = useState(true);
  const [editPaymentId, setEditPaymentId] = useState(null);

  // Form States (Promo)
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
      const resGames = await fetch('http://localhost:5000/api/admin/games', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

  // --- HANDLERS ---
  const handleSaveGame = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', gameName);
    formData.append('slug', gameSlug);
    formData.append('account_fields', accountFields);
    formData.append('is_active', gameIsActive);
    if (gameImage) formData.append('image', gameImage);

    const url = editGameId ? `http://localhost:5000/api/admin/games/${editGameId}` : 'http://localhost:5000/api/admin/games';
    const method = editGameId ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
    if (res.ok) {
      alert('Game berhasil disimpan!');
      resetGameForm();
      loadBaseData();
    }
  };

  const resetGameForm = () => {
    setGameName(''); setGameSlug(''); setAccountFields('User ID (Zone ID)'); setGameIsActive(true); setGameImage(null); setEditGameId(null);
  };

  const handleEditGame = (g) => {
    setEditGameId(g.id); 
    setGameName(g.name); 
    setGameSlug(g.slug); 
    setAccountFields(g.account_fields || 'User ID (Zone ID)');
    setGameIsActive(g.is_active !== false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteGame = async (id) => {
    if (!confirm('Yakin hapus game ini beserta seluruh itemnya?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/games/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) loadBaseData();
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('game_id', selectedGameId);
    formData.append('name', prodName);
    formData.append('price', prodPrice);
    formData.append('is_active', prodIsActive);
    if (prodImage) formData.append('image', prodImage);

    const url = editProductId ? `http://localhost:5000/api/admin/products/${editProductId}` : 'http://localhost:5000/api/admin/products';
    const method = editProductId ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
    if (res.ok) {
      alert('Item berhasil disimpan!');
      resetProductForm();
      loadBaseData();
    }
  };

  const resetProductForm = () => {
    setProdName(''); setProdPrice(''); setProdIsActive(true); setProdImage(null); setEditProductId(null); setSelectedGameId('');
  };

  const handleEditProduct = (prod) => {
    setEditProductId(prod.id); 
    setSelectedGameId(prod.game_id || ''); 
    setProdName(prod.name); 
    setProdPrice(prod.price);
    setProdIsActive(prod.is_active !== false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Yakin hapus item ini?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) loadBaseData();
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    const url = editPaymentId ? `http://localhost:5000/api/admin/payments/${editPaymentId}` : 'http://localhost:5000/api/admin/payments';
    const method = editPaymentId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        name: payName, 
        fee: Number(payFee), 
        game_id: payGameId ? Number(payGameId) : null,
        is_active: payIsActive 
      })
    });
    if (res.ok) {
      alert('Metode pembayaran disimpan!');
      resetPaymentForm();
      loadBaseData();
    }
  };

  const resetPaymentForm = () => {
    setPayName(''); setPayFee(''); setPayGameId(''); setPayIsActive(true); setEditPaymentId(null);
  };

  const handleEditPayment = (p) => {
    setEditPaymentId(p.id); 
    setPayGameId(p.game_id || ''); 
    setPayName(p.name); 
    setPayFee(p.fee);
    setPayIsActive(p.is_active !== false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePayment = async (id) => {
    if (!confirm('Yakin hapus metode pembayaran ini?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/payments/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) loadBaseData();
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    const url = editPromoId ? `http://localhost:5000/api/admin/promos/${editPromoId}` : 'http://localhost:5000/api/admin/promos';
    const method = editPromoId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        code: promoCode, 
        discount: Number(promoDiscount), 
        min_spend: Number(promoMinSpend || 0), 
        is_active: promoIsActive 
      })
    });
    if (res.ok) {
      alert('Promo berhasil disimpan!');
      resetPromoForm();
      loadBaseData();
    }
  };

  const resetPromoForm = () => {
    setPromoCode(''); setPromoDiscount(''); setPromoMinSpend(''); setPromoIsActive(true); setEditPromoId(null);
  };

  // ✅ DIPERBAIKI: Menggunakan fallback aman agar tidak ada nilai undefined saat tombol Edit diklik
  const handleEditPromo = (pr) => {
    setEditPromoId(pr.id); 
    setPromoCode(pr.code || ''); 
    setPromoDiscount(pr.discount ?? pr.disc ?? pr.amount ?? ''); 
    setPromoMinSpend(pr.min_spend ?? pr.minSpend ?? ''); 
    setPromoIsActive(pr.is_active ?? true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePromo = async (id) => {
    if (!confirm('Yakin hapus promo ini?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/promos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) loadBaseData();
  };

  const updateOrderStatus = async (id, status) => {
    const adminNote = prompt('Catatan Admin (opsional):', '');
    const res = await fetch(`http://localhost:5000/api/admin/transactions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ order_status: status, admin_note: adminNote })
    });
    if (res.ok) loadTransactions();
  };

  // Computations
  const successfulTransactions = transactions.filter(t => t.order_status === 'SUCCESS' || t.order_status === 'PROCESSING');
  const totalRevenue = successfulTransactions.reduce((acc, t) => acc + t.total_price, 0);
  const totalOrdersCount = transactions.length;
  const successRate = totalOrdersCount > 0 ? Math.round((successfulTransactions.length / totalOrdersCount) * 100) : 0;

  const gameSalesCount = transactions.reduce((acc, t) => {
    acc[t.game_name] = (acc[t.game_name] || 0) + 1;
    return acc;
  }, {});
  const popularGamesSorted = Object.entries(gameSalesCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const recentTransactions = [...transactions].slice(0, 5);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            totalRevenue={totalRevenue}
            totalOrdersCount={totalOrdersCount}
            successRate={successRate}
            gamesCount={games.length}
            transactions={transactions}
            popularGamesSorted={popularGamesSorted}
            recentTransactions={recentTransactions}
            setActiveTab={setActiveTab}
          />
        );
      case 'games':
        return (
          <GameManagement 
            editGameId={editGameId} gameName={gameName} setGameName={setGameName} gameSlug={gameSlug} setGameSlug={setGameSlug} accountFields={accountFields} setAccountFields={setAccountFields} gameIsActive={gameIsActive} setGameIsActive={setGameIsActive} setGameImage={setGameImage} handleSaveGame={handleSaveGame} resetGameForm={resetGameForm}
            editProductId={editProductId} selectedGameId={selectedGameId} setSelectedGameId={setSelectedGameId} prodName={prodName} setProdName={setProdName} prodPrice={prodPrice} setProdPrice={setProdPrice} prodIsActive={prodIsActive} setProdIsActive={setProdIsActive} setProdImage={setProdImage} handleSaveProduct={handleSaveProduct} resetProductForm={resetProductForm}
            games={games} handleEditGame={handleEditGame} handleDeleteGame={handleDeleteGame} handleEditProduct={handleEditProduct} handleDeleteProduct={handleDeleteProduct}
          />
        );
      case 'payments':
        return (
          <PaymentManagement 
            editPaymentId={editPaymentId} payGameId={payGameId} setPayGameId={setPayGameId} payName={payName} setPayName={setPayName} payFee={payFee} setPayFee={setPayFee} payIsActive={payIsActive} setPayIsActive={setPayIsActive} handleSavePayment={handleSavePayment} resetPaymentForm={resetPaymentForm} games={games} payments={payments} handleEditPayment={handleEditPayment} handleDeletePayment={handleDeletePayment}
          />
        );
      case 'promos':
        return (
          <PromoManagement 
            editPromoId={editPromoId} promoCode={promoCode} setPromoCode={setPromoCode} promoDiscount={promoDiscount} setPromoDiscount={setPromoDiscount} promoMinSpend={promoMinSpend} setPromoMinSpend={setPromoMinSpend} promoIsActive={promoIsActive} setPromoIsActive={setPromoIsActive} handleSavePromo={handleSavePromo} resetPromoForm={resetPromoForm} promos={promos} handleEditPromo={handleEditPromo} handleDeletePromo={handleDeletePromo}
          />
        );
      case 'banners':
        return <BannerManagement token={token} />;
      case 'transactions':
      case 'reports':
        return (
          <TransactionReports 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterOrderStatus={filterOrderStatus} setFilterOrderStatus={setFilterOrderStatus} filterPaymentStatus={filterPaymentStatus} setFilterPaymentStatus={setFilterPaymentStatus} transactions={transactions} token={token} loadTransactions={loadTransactions} updateOrderStatus={updateOrderStatus} activeAuditLogs={activeAuditLogs} setActiveAuditLogs={setActiveAuditLogs} activeTab={activeTab}
          />
        );
      case 'users':
        return <UserManagement token={token} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center print:hidden border-b border-gray-700 pb-4">
          <h1 className="text-2xl font-bold">Admin Panel Dashboard</h1>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg font-bold transition text-xs sm:text-sm ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              🕹️ Analitik
            </button>
            <button onClick={() => setActiveTab('games')} className={`px-4 py-2 rounded-lg font-bold transition text-xs sm:text-sm ${activeTab === 'games' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              🎮 Game & Item
            </button>
            <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 rounded-lg font-bold transition text-xs sm:text-sm ${activeTab === 'payments' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              💳 Pembayaran
            </button>
            <button onClick={() => setActiveTab('promos')} className={`px-4 py-2 rounded-lg font-bold transition text-xs sm:text-sm ${activeTab === 'promos' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              🎟️ Promo
            </button>
            <button onClick={() => setActiveTab('banners')} className={`px-4 py-2 rounded-lg font-bold transition text-xs sm:text-sm ${activeTab === 'banners' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              🖼️ Banner
            </button>
            <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 rounded-lg font-bold transition text-xs sm:text-sm ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              ⚡ Transaksi
            </button>
            <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg font-bold transition text-xs sm:text-sm ${activeTab === 'reports' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              📊 Laporan
            </button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg font-bold transition text-xs sm:text-sm ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              👥 Users
            </button>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}