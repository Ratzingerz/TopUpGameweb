# 🎮 Top-Up Game Full-Stack Platform

Aplikasi web manajemen dan platform top-up game berbasis *Full-Stack* yang dilengkapi dengan panel admin dinamis, pemantauan transaksi, pelaporan keuangan, serta manajemen basis data relasional.

---

## 🚀 Tech Stack

* **Frontend:** React, Tailwind CSS, Vite
* **Backend:** Python, Flask, SQLAlchemy, MySQL
* **Database Management:** MySQL / PyMySQL

---

## 📂 Struktur Proyek

```text
TopUpSystem Final/
├── backend/          # Flask REST API & Database Models
│   ├── static/       # Aset statis & upload
│   ├── uploads/      # Direktori file unggahan
│   └── app.py        # Titik masuk utama server Flask
├── frontend/         # Antarmuka Pengguna (React + Vite)
│   ├── src/          # Komponen React (AdminDashboard, dll)
│   ├── package.json  # Konfigurasi dependensi frontend
│   └── tailwind.config.js
└── .gitignore        # Berkas pengecualian Git