import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import GameDetail from './pages/GameDetail';
import InvoicePage from './pages/InvoicePage';
import UserTransactions from './pages/UserTransactions';
import UserAuth from './pages/UserAuth';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [username, setUsername] = useState(localStorage.getItem('username'));

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('username');
    setUsername(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <Navbar username={username} onLogout={handleLogout} />

        <main className="pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:slug" element={<GameDetail />} />
            <Route path="/invoice/:id" element={<InvoicePage />} />
            <Route path="/riwayat" element={<UserTransactions />} />
            <Route path="/user/login" element={<UserAuth />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}