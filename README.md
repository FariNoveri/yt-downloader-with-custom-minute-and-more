# 🎵 YTGrab - YouTube Downloader
<<<<<<< HEAD
> *"Dibuat dengan cinta, dipersembahkan untuk Illyasviel von Einzbern 🤍"*

Download YouTube video sebagai MP3 atau MP4 dengan pilihan rentang waktu sesukamu.
=======

Download YouTube video sebagai MP3 atau MP4 dengan pilihan rentang waktu.
>>>>>>> 13c344c (first release)

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
<<<<<<< HEAD
- Copy path folder `bin` tersebut (contoh: `D:\ffmpeg\bin`)
=======
- Copy path folder `bin` tersebut (contoh: `C:\ffmpeg\bin`)
>>>>>>> 13c344c (first release)
- Tambahkan ke PATH Windows:
  1. Tekan `Win + S`, cari "Environment Variables"
  2. Klik "Edit the system environment variables"
  3. Klik "Environment Variables..."
  4. Di bagian "System variables", cari dan klik "Path" lalu klik "Edit"
  5. Klik "New" dan paste path folder `bin` tadi
  6. Klik OK semua
  7. **Restart Command Prompt**
<<<<<<< HEAD
- Verifikasi dengan: `where ffmpeg` → harusnya muncul path seperti `D:\ffmpeg\bin\ffmpeg.exe`
=======
>>>>>>> 13c344c (first release)

---

## 🚀 Cara Menjalankan

1. Buka Command Prompt / PowerShell
2. Masuk ke folder project:
   ```
<<<<<<< HEAD
   cd D:\PROJECT\Youtube Downloader
   ```
3. Install dependencies (cukup sekali):
=======
   cd C:\path\ke\yt-downloader
   ```
3. Install dependencies:
>>>>>>> 13c344c (first release)
   ```
   npm install
   ```
4. Jalankan server:
   ```
   npm start
   ```
5. Buka browser, akses: **http://localhost:3000**

<<<<<<< HEAD
> ⚠️ Jangan tutup Command Prompt selama menggunakan website!

=======
>>>>>>> 13c344c (first release)
---

## 🎯 Cara Pakai

1. **Paste link YouTube** di kolom input
<<<<<<< HEAD
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
=======
2. Klik **"Cek Video"** untuk melihat preview
3. Pilih format: **MP3** (audio) atau **MP4** (video)
4. Isi **Rentang Waktu** (opsional):
   - Contoh: Mulai `0:00` sampai `6:00` → download menit 0 sampai 6
   - Contoh: Mulai `5:00` sampai `12:30` → download menit 5 sampai 12:30
   - Kosongkan untuk download video penuh
5. Klik **"Download Sekarang"**
6. Tunggu beberapa saat, file akan otomatis terdownload

---

## ⚠️ Catatan Penting

- Gunakan hanya untuk video yang bebas didownload (tidak ada hak cipta, atau milik sendiri)
- Durasi proses tergantung kecepatan internet dan panjang video
- File sementara otomatis terhapus setelah download selesai
>>>>>>> 13c344c (first release)

---

## 🗂️ Struktur File

```
yt-downloader/
├── server.js          ← Backend Node.js
├── package.json       ← Konfigurasi npm
├── yt-dlp.exe         ← Taruh di sini (download manual)
├── public/
│   └── index.html     ← Tampilan website
<<<<<<< HEAD
├── downloads/         ← Folder temporary (otomatis dibuat & dibersihkan)
└── README.md          ← Kamu lagi baca ini 😄
```

---

## ⚠️ Disclaimer

Gunakan hanya untuk video yang bebas didownload — konten bebas hak cipta, video milik sendiri, atau dengan izin pembuatnya. Hormati karya orang lain ya! 🙏

---

*Made with ❤️ for Illyasviel von Einzbern*
=======
├── downloads/         ← Folder temporary (otomatis dibuat)
└── README.md          ← Panduan ini
```
>>>>>>> 13c344c (first release)
