import React, { useState, useEffect } from 'react';

export default function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data user dari backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Gagal mengambil data user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handler ubah role user
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Yakin ingin mengubah role user ini menjadi ${newRole}?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(data.message || 'Gagal mengubah role');
      }
    } catch (err) {
      console.error('Error ubah role:', err);
    }
  };

  // Handler hapus user
  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Yakin ingin menghapus user "${username}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('User berhasil dihapus');
        fetchUsers();
      } else {
        alert(data.message || 'Gagal menghapus user');
      }
    } catch (err) {
      console.error('Error hapus user:', err);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-white">👥 Manajemen User & Admin</h2>
        <button 
          onClick={fetchUsers} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-6">Memuat data user...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-gray-300">
            <thead>
              <tr className="bg-gray-700 text-gray-200">
                <th className="p-3">ID</th>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Terdaftar</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-400">Tidak ada user ditemukan.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-3">#{u.id}</td>
                    <td className="p-3 font-semibold text-white">{u.username}</td>
                    <td className="p-3 text-gray-400">{u.email || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-200'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 text-xs">{u.created_at || '-'}</td>
                    <td className="p-3 text-center space-x-2">
                      <button 
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                      >
                        Ubah Role
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}