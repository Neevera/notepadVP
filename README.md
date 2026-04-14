# 📋 Notepaper — Vercel + Neon PostgreSQL (100% GRATIS)

Aplikasi catatan kolaboratif real-time menggunakan:
- **Vercel** — hosting serverless gratis
- **Neon** — PostgreSQL gratis (0.5 GB, tanpa batas request)

---

## 🗂 Struktur File

```
notepaper/
├── api/
│   ├── notes/
│   │   ├── index.js     ← GET /api/notes  &  POST /api/notes
│   │   └── [id].js      ← PUT /api/notes/:id  &  DELETE /api/notes/:id
│   └── ping.js          ← POST /api/ping (siapa yang online)
├── lib/
│   └── db.js            ← Koneksi Neon + auto-create tabel
├── public/
│   └── index.html       ← Frontend lengkap (HTML + CSS + JS)
├── vercel.json          ← Routing Vercel
├── package.json
└── README.md
```

---

## 🚀 Cara Deploy (Step by Step)

### ① Buat Database Gratis di Neon

1. Buka **https://neon.tech** → klik **Sign Up** (pakai akun Google/GitHub)
2. Klik **New Project**
3. Isi:
   - **Name**: `notepaper`
   - **Region**: `AWS Asia Pacific (Singapore)` ← pilih ini agar cepat dari Indonesia
   - **Postgres version**: biarkan default (16)
4. Klik **Create Project**
5. Di halaman berikutnya, cari bagian **Connection string**
6. Klik **Copy** pada string yang dimulai dengan `postgresql://...`

   Contoh connection string:
   ```
   postgresql://neondb_owner:AbCdEf123@ep-cool-name-abc123.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
7. **Simpan string ini** — akan dipakai di langkah ③

---

### ③ Deploy ke Vercel & Set Environment Variable

1. Buka **https://vercel.com** → login dengan GitHub
2. Klik **Add New → Project**
3. Pilih repo `notepaper` → klik **Import**
4. Sebelum deploy, buka bagian **Environment Variables**:

   | Name             | Value                                      |
   |------------------|--------------------------------------------|
   | `DATABASE_URL`   | *(paste connection string dari Neon tadi)* |

5. Klik **Deploy**
6. Tunggu ~1 menit hingga selesai ✅

Website kamu live di URL seperti:
```
https://notepaper-abc123.vercel.app
```

**Bagikan URL ini ke teman untuk berkolaborasi!** 🎉

---

## 💻 Development Lokal

```bash
# Install dependensi
npm install

# Buat file environment lokal
echo 'DATABASE_URL=postgresql://...' > .env.development.local

# Jalankan (butuh Vercel CLI)
npm install -g vercel
vercel dev
```

Buka → **http://localhost:3000**

---

## 🔌 API Reference

### `GET /api/notes`
Ambil semua catatan, urut terbaru.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "title": "Judul Catatan",
    "body": "Isi catatan...",
    "color": "#FFE066",
    "author": "Budi",
    "editedBy": "Sari",
    "createdAt": 1710000000000,
    "updatedAt": 1710000001000
  }
]
```

### `POST /api/notes` — buat catatan baru
```json
{ "title": "...", "body": "...", "color": "#FFE066", "author": "Nama" }
```

### `PUT /api/notes/:id` — edit catatan
```json
{ "title": "...", "body": "...", "color": "...", "editedBy": "Nama" }
```

### `DELETE /api/notes/:id` — hapus catatan
Response: `{ "success": true }`

### `POST /api/ping` — update status online
```json
{ "name": "Nama Kamu" }
```
Response: `{ "online": ["Budi", "Sari"] }`

---

## ✨ Fitur

- 🔐 Login nama tanpa password
- 📝 Buat, baca, edit, hapus catatan
- 🎨 8 pilihan warna per catatan
- 👤 Badge siapa penulis & editor terakhir
- 🟢 Indikator siapa yang sedang online
- 🔍 Pencarian catatan real-time
- 🔄 Auto-sync tiap 5 detik
- ⌨️ Shortcut: `Ctrl+Enter` simpan, `ESC` tutup
- 📱 Responsif mobile & desktop

---

## 🆓 Batas Free Tier Neon

| Resource         | Batas Gratis     |
|------------------|------------------|
| Storage          | 0.5 GB           |
| Compute          | 190 jam/bulan    |
| Projects         | 1 project        |
| Branches         | 10 branch        |
| Concurrent conn. | 100 koneksi      |

Untuk aplikasi catatan biasa, batas ini **lebih dari cukup** ✅

---

## ❓ Troubleshooting

**Error: "DATABASE_URL belum diset"**
→ Pastikan environment variable `DATABASE_URL` sudah ditambahkan di Vercel Dashboard → Settings → Environment Variables → lalu **Redeploy**

**Catatan tidak muncul setelah deploy**
→ Tabel dibuat otomatis saat request pertama. Login ke website, lalu coba refresh.

**Koneksi lambat pertama kali**
→ Neon pakai "auto-suspend" setelah 5 menit idle. Request pertama setelah idle ~2-3 detik untuk wake up. Normal!

**Error 500 di production**
→ Cek log di Vercel Dashboard → Functions → pilih function yang error → lihat error message-nya
