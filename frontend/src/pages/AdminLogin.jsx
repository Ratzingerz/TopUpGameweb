import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.message || 'Login Admin Gagal!');
        return;
      }
      
      localStorage.setItem('admin_token', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      alert('Gagal terhubung ke server Flask.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-xl space-y-4">
      <h2 className="text-2xl font-bold text-center text-white">Login Admin Panel</h2>
      <form onSubmit={handleAdminLogin} className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Username Admin</label>
          <input
            type="text"
            required
            className="w-full p-3 bg-gray-900 rounded-lg text-sm border border-gray-700 text-white outline-none focus:border-blue-500"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Password</label>
          <input
            type="password"
            placeholder="Password Admin"
            required
            className="w-full p-3 bg-gray-900 rounded-lg text-sm border border-gray-700 text-white outline-none focus:border-blue-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-sm transition shadow-lg">
          Masuk Panel Admin
        </button>
      </form>
    </div>
  );
}