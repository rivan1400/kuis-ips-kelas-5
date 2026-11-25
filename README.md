# Kuis IPS Kelas 5 — Vercel

Dua kuis terpisah berdasarkan file yang diberikan:
- PSAS IPS Semester Ganjil: 24 soal pilihan ganda.
- Latihan IPS Bab 2: 20 soal pilihan ganda.

## Jalankan lokal
1. Install Node.js 18+.
2. Jalankan `npm install`.
3. Jalankan `npm run dev`.

## Hosting ke Vercel
1. Upload folder proyek ini ke GitHub.
2. Import repository di https://vercel.com/new.
3. Framework preset: Vite (otomatis terdeteksi), Build Command `npm run build`, Output Directory `dist`.
4. Deploy. Untuk leaderboard bersama, lanjutkan langkah Supabase di bawah.

## Leaderboard online (Supabase)
Tanpa konfigurasi Supabase, leaderboard berjalan sebagai demo lokal di browser/perangkat yang sama.
1. Buat project di https://supabase.com.
2. Buka SQL Editor, jalankan isi `supabase/schema.sql`.
3. Salin Project URL dan anon/public key dari Project Settings → API.
4. Tambahkan di Vercel → Project → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Redeploy. Leaderboard kemudian tersimpan online dan dapat dilihat semua pemain.

Catatan keamanan: kebijakan SQL contoh mengizinkan siapa pun membaca dan mengirim skor. Ini cocok untuk leaderboard kelas sederhana, tetapi belum mencegah skor palsu/spam. Untuk penggunaan publik yang lebih serius, validasi skor melalui backend/serverless function dan tambahkan rate limit.

## Fitur
- Animasi jawaban benar/salah dan umpan balik.
- Meme reaksi diambil dari URL gambar meme publik; jika sumber gambar tidak tersedia, elemen gambar otomatis disembunyikan.
- Musik latar sederhana dan sound effect sintetis (klik/benar/salah) menggunakan Web Audio, tanpa file audio tambahan.
- Responsif untuk ponsel dan desktop.

## Catatan sumber soal
Soal pilihan ganda disusun dari kedua dokumen yang diunggah. Nomor 3 PSAS tentang letak astronomis tidak dimasukkan karena pilihan jawabannya kosong pada dokumen. Bagian isian dan esai tidak dimasukkan ke format pilihan ganda pada versi ini.
