import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ username, onLogout }) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10 print:hidden">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-500">MyTopUp.id</Link>
        
        <div className="flex items-center gap-6">
          <Link to="/riwayat" className="text-sm text-gray-300 hover:text-white font-semibold">
            Riwayat Transaksi
          </Link>
          
          {username ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-yellow-400 font-bold">Halo, {username}</span>
              <button 
                onClick={onLogout} 
                className="bg-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/user/login" className="bg-blue-600 px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 transition">
              Login User
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}