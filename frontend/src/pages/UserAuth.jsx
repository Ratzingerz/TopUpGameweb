import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin 
      ? 'http://localhost:5000/api/user/login' 
      : 'http://localhost:5000/api/user/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Terjadi kesalahan pada server');
        return;
      }

      if (isLogin) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('username', data.username);
        alert('Login berhasil!');
        window.location.href = '/';
      } else {
        alert('Registrasi berhasil! Silakan masuk menggunakan akun baru.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal terhubung ke backend Flask. Pastikan server Flask sudah menyala.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-xl space-y-6">
      <div className="flex justify-center gap-6 border-b border-gray-700 pb-3">
        <button 
          type="button"
          onClick={() => setIsLogin(true)} 
          className={`font-bold pb-2 text-sm transition ${isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          Login User
        </button>
        <button 
          type="button"
          onClick={() => setIsLogin(false)} 
          className={`font-bold pb-2 text-sm transition ${!isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          Buat Akun (Register)
        </button>
      </div>

      <h2 className="text-xl font-bold text-center text-white">
        {isLogin ? 'Masuk ke Akun Kamu' : 'Daftar Akun Baru'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Username</label>
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
            required
            className="w-full p-3 bg-gray-900 rounded-lg text-sm border border-gray-700 text-white outline-none focus:border-blue-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm transition shadow-lg">
          {isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}
        </button>
      </form>
    </div>
  );
}