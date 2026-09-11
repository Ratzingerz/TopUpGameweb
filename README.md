# 🎮 Top-Up Game Full-Stack Platform

Aplikasi web manajemen dan platform top-up game berbasis **Full-Stack** yang dilengkapi dengan panel admin dinamis, pemantauan transaksi, pelaporan keuangan, serta manajemen basis data relasional.

---

## 🚀 Tech Stack

* **Frontend:** React, Tailwind CSS, Vite
* **Backend:** Python, Flask, SQLAlchemy
* **Database:** MySQL / PyMySQL

---

## 📂 Struktur Proyek

```text
TopUpSystem Final/

├── backend/              # Flask REST API & Database Models
│   ├── static/           # Aset statis & upload
│   ├── uploads/          # Direktori file unggahan
│   └── app.py            # Titik masuk utama server Flask
│
├── frontend/             # Antarmuka Pengguna (React + Vite)
│   ├── src/              # Komponen React
│   ├── package.json      # Konfigurasi dependensi frontend
│   └── tailwind.config.js
│
└── .gitignore            # Berkas yang dikecualikan dari Git
```

---

## 🛠️ Installation & Setup

### 1. Clone Repository

Clone repository menggunakan Git:

```bash
git clone https://github.com/Ratzingerz/TopUpGameweb.git
```

Kemudian masuk ke folder project:

```bash
cd TopUpGameweb
```

---

### 2. Backend Setup

Masuk ke folder backend:

```bash
cd backend
```

Buat virtual environment:

```bash
python -m venv venv
```

Aktifkan virtual environment pada Windows:

```bash
venv\Scripts\activate
```

Install seluruh dependency:

```bash
pip install -r requirements.txt
```

---

### 3. Konfigurasi Environment

Buat file `.env` di dalam folder `backend/`.

Contoh:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost/mytopup_db
SECRET_KEY=your-secret-key
```

Sesuaikan `root`, `password`, dan konfigurasi database dengan MySQL yang digunakan.

> **Catatan:** File `.env` tidak disertakan dalam repository karena dapat berisi informasi sensitif seperti credential database dan secret key.

---

### 4. Setup Database

Pastikan MySQL sudah terinstall dan sedang berjalan.

Buat database dengan nama:

```sql
CREATE DATABASE mytopup_db;
```

Kemudian pastikan konfigurasi `DATABASE_URL` pada file `.env` sesuai dengan konfigurasi MySQL lokal.

Contoh:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost/mytopup_db
```

---

### 5. Menjalankan Backend

Pastikan masih berada di folder `backend` dan virtual environment sudah aktif.

Jalankan:

```bash
python app.py
```

Jika berhasil, Flask akan menjalankan server backend pada alamat yang ditampilkan di terminal, misalnya:

```text
http://127.0.0.1:5000
```

---

### 6. Frontend Setup

Buka terminal baru dan masuk ke folder project:

```bash
cd frontend
```

Install dependency:

```bash
npm install
```

Kemudian jalankan development server:

```bash
npm run dev
```

Vite akan memberikan alamat lokal pada terminal, biasanya:

```text
http://localhost:5173
```

Buka alamat tersebut melalui browser untuk mengakses aplikasi.

---

## 🔐 Environment Variables

Project ini menggunakan environment variables untuk menyimpan konfigurasi yang bersifat sensitif.

Contoh `.env`:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost/mytopup_db
SECRET_KEY=your-secret-key
```

File `.env` **tidak boleh di-upload ke repository**.

Pastikan `.gitignore` memiliki:

```gitignore
.env
```

Dengan demikian, credential database dan secret key tetap berada di lingkungan lokal pengguna.

---

## ✨ Fitur

### 👤 User

* Registrasi dan login
* Pemilihan game
* Pemilihan item top-up
* Melakukan transaksi top-up
* Melihat riwayat transaksi
* Memantau status transaksi

### 🛠️ Admin

* Dashboard admin
* Manajemen game
* Manajemen item top-up
* Manajemen pengguna
* Pemantauan transaksi
* Pengelolaan status transaksi
* Manajemen data melalui database
* Pemantauan laporan transaksi

---

## 📊 Status Transaksi

Transaksi memiliki beberapa status untuk menggambarkan proses top-up:

```text
Menunggu → Sukses
```

**Menunggu**
Transaksi telah dibuat dan masih menunggu proses atau konfirmasi admin.

**Sukses**
Transaksi telah berhasil diproses dan item top-up telah masuk ke akun game pengguna.

---

## 🖼️ Screenshot

Screenshot aplikasi akan ditambahkan untuk menampilkan beberapa bagian utama sistem, seperti:

* Halaman utama
* Halaman pemilihan game
* Halaman transaksi/top-up
* Riwayat transaksi
* Dashboard admin

---

## 🎯 Tujuan Project

Project ini dibuat sebagai implementasi sistem **Full-Stack Web Development** yang mengintegrasikan frontend, backend REST API, autentikasi pengguna, database relasional, serta sistem manajemen transaksi top-up game.

Project ini juga menjadi bagian dari pengembangan portofolio dalam bidang **Web Development / Full-Stack Development**.

---

## 👨‍💻 Author

**Devendra Valentio**

Full-Stack Web Developer

GitHub:
https://github.com/Ratzingerz

---

## 📄 License

Project ini dibuat untuk tujuan pembelajaran, pengembangan portofolio, dan demonstrasi kemampuan Full-Stack Web Development.
