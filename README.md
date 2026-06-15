# 🎵 YTGrab - YouTube Downloader
> *"Dibuat dengan cinta, dipersembahkan untuk Illyasviel von Einzbern 🤍"*

Download YouTube video sebagai MP3 atau MP4 dengan pilihan rentang waktu sesukamu.

---

## 📋 Persyaratan

Sebelum mulai, install dulu software berikut:

### 1. Node.js
Download dan install dari: https://nodejs.org (pilih versi LTS)

### 2. yt-dlp
- Download `yt-dlp.exe` dari: https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe
- **Taruh file `yt-dlp.exe` di dalam folder project ini** (folder `yt-downloader`)

### 3. FFmpeg
- Download dari: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
- Ekstrak zip tersebut
- Masuk ke folder `bin` di dalamnya (ada file `ffmpeg.exe`, `ffprobe.exe`, `ffplay.exe`)
- Copy path folder `bin` tersebut (contoh: `D:\ffmpeg\bin`)
- Tambahkan ke PATH Windows:
  1. Tekan `Win + S`, cari "Environment Variables"
  2. Klik "Edit the system environment variables"
  3. Klik "Environment Variables..."
  4. Di bagian "System variables", cari dan klik "Path" lalu klik "Edit"
  5. Klik "New" dan paste path folder `bin` tadi
  6. Klik OK semua
  7. **Restart Command Prompt**
- Verifikasi dengan: `where ffmpeg` → harusnya muncul path seperti `D:\ffmpeg\bin\ffmpeg.exe`

---

## 🚀 Cara Menjalankan

1. Buka Command Prompt / PowerShell
2. Masuk ke folder project:
   ```
   cd D:\PROJECT\Youtube Downloader
   ```
3. Install dependencies (cukup sekali):
   ```
   npm install
   ```
4. Jalankan server:
   ```
   npm start
   ```
5. Buka browser, akses: **http://localhost:3000**

> ⚠️ Jangan tutup Command Prompt selama menggunakan website!

---

## 🎯 Cara Pakai

1. **Paste link YouTube** di kolom input
2. Klik **"Cek Video"** untuk melihat preview judul & thumbnail
3. Pilih format output:
   - 🎵 **MP3** — audio saja (lebih kecil)
   - 🎬 **MP4** — video + audio
4. Isi **Rentang Waktu** *(opsional)*:
   - Format: `menit:detik` — contoh `5:30` = menit ke-5 detik ke-30
   - Contoh: Mulai `0:00` sampai `6:00` → hanya download 6 menit pertama
   - Contoh: Mulai `5:00` sampai `12:30` → download dari menit 5 sampai 12:30
   - **Kosongkan kedua kolom** untuk download video penuh
5. Klik **"Download Sekarang"** dan tunggu beberapa saat
6. File otomatis terdownload ke komputer kamu ✅

---

## 🛠️ Troubleshooting

| Masalah | Solusi |
|---|---|
| `EADDRINUSE: port 3000` | Jalankan `npx kill-port 3000` lalu `npm start` lagi |
| `ffmpeg not found` | Pastikan path ffmpeg sudah benar di `server.js` (variabel `FFMPEG_DIR`) |
| File 0 bytes | Cek koneksi internet, coba URL YouTube yang berbeda |
| Server tidak muncul | Pastikan sudah `npm install` dan Node.js terinstall |

---

## 🗂️ Struktur File

```
yt-downloader/
├── server.js          ← Backend Node.js
├── package.json       ← Konfigurasi npm
├── yt-dlp.exe         ← Taruh di sini (download manual)
├── public/
│   └── index.html     ← Tampilan website
├── downloads/         ← Folder temporary (otomatis dibuat & dibersihkan)
└── README.md          ← Kamu lagi baca ini 😄
```

---

## ⚠️ Disclaimer

Gunakan hanya untuk video yang bebas didownload — konten bebas hak cipta, video milik sendiri, atau dengan izin pembuatnya. Hormati karya orang lain ya! 🙏

---

*Made with ❤️ for Illyasviel von Einzbern*
