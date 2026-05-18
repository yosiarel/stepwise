# StepWise 🚀 — AI-Powered Personalized Tech Learning Roadmap & Career Advisor

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white&style=for-the-badge" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-purple?logo=vite&logoColor=white&style=for-the-badge" alt="Vite 8" />
  <img src="https://img.shields.io/badge/TypeScript-6-blue?logo=typescript&logoColor=white&style=for-the-badge" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/Node.js-22-green?logo=node.js&logoColor=white&style=for-the-badge" alt="Node 22" />
  <img src="https://img.shields.io/badge/Express-5-lightgrey?logo=express&logoColor=white&style=for-the-badge" alt="Express 5" />
  <img src="https://img.shields.io/badge/Prisma-7-indigo?logo=prisma&logoColor=white&style=for-the-badge" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql&logoColor=white&style=for-the-badge" alt="PostgreSQL" />
</div>

---

**StepWise** adalah platform edukasi digital revolusioner berbasis AI yang dirancang untuk membantu pelajar, mahasiswa, *fresh graduate*, maupun profesional (*career switcher*) dalam merancang peta jalan (*learning roadmap*) belajar IT secara personal dan adaptif. 

Berbeda dengan kurikulum belajar konvensional yang kaku, StepWise mengintegrasikan analisis kemampuan pengguna melalui pengisian kuesioner dinamis serta pemindaian CV bertenaga **Google Gemini AI** untuk menghasilkan rekomendasi karier IT yang paling relevan beserta langkah-langkah belajarnya. Platform ini juga memonitor progres belajar secara periodik dan mampu melakukan penyesuaian (*auto-adjustment*) kurikulum berdasarkan perkembangan pengguna secara cerdas.

---

## 🌟 Fitur Utama

### 1. Dynamic Personalized Assessment (Profiling & Familiaritas)
* **Kuesioner Adaptif Multi-Fase**: Sistem mendeteksi pemahaman digital dasar pengguna (*Fase 1*) untuk kemudian memecah alur asesmen ke **Jalur Teknis** (*Technical Path*) atau **Jalur Non-Teknis** (*Non-Technical Path*).
* **Profiling Gaya Belajar & Komitmen**: Menganalisis cara belajar terfavorit (visual, auditori, praktik, atau membaca), preferensi lingkungan kerja (startup, korporasi, freelance), hingga komitmen waktu belajar per minggu.

### 2. AI-Powered CV Ingestion & Skill Extractor
* **Unggah Resume/CV (PDF)**: Pengguna dapat mengunggah CV mereka secara instan.
* **Ekstraksi Otomatis**: Integrasi **Gemini AI** dan parser PDF mengekstrak riwayat pendidikan, pengalaman kerja, serta keahlian teknis (*skills*) yang sudah dimiliki pengguna guna menghindari pengulangan materi yang tidak perlu.

### 3. Smart Career Recommendation & Readiness Score
* **Pemetaan Karier**: AI membandingkan profil kuesioner atau hasil CV pengguna dengan kompetensi berbagai profesi IT (misalnya Frontend Developer, Backend Developer, Data Scientist, UI/UX Designer, dsb.).
* **Readiness Score & Skill Gap**: Menampilkan persentase kesiapan pengguna terhadap suatu profesi serta menyoroti keahlian yang masih harus dipelajari.

### 4. Adaptive Learning Roadmap Generator
* **Peta Jalan Belajar Bertahap**: Menghasilkan kurikulum terstruktur yang dibagi ke dalam beberapa fase belajar logis dilengkapi modul, deskripsi materi, dan estimasi waktu.
* **Penjadwalan Fleksibel**: Durasi penyelesaian modul disesuaikan secara otomatis berdasarkan kapasitas jam belajar mingguan yang dipilih pengguna.

### 5. Periodic Evaluation & Auto-Adjustment (Sistem Adaptif)
* **Evaluasi Berkala**: Melalui cron-job latar belakang (*node-cron*), pengguna akan diingatkan untuk merefleksikan proses belajar mereka (tingkat kesulitan, pergeseran minat, atau perubahan waktu luang).
* **Rekomendasi Penyesuaian**: AI dapat mengusulkan modifikasi roadmap secara dinamis, seperti mempercepat/memperlambat jadwal, mereorder materi, menambahkan materi baru, atau berpindah fokus karier jika dirasa tidak cocok.
* **Notifikasi Email**: Didukung oleh *Nodemailer* & *SMTP* untuk mengirim pengingat evaluasi langsung ke email pengguna.

### 6. Swagger API Documentation
* Dokumentasi API yang lengkap dan interaktif menggunakan Swagger UI untuk memudahkan pengembangan, pengujian, dan integrasi backend.

---

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework Core**: React 19 (TypeScript)
* **Build Tool**: Vite 8
* **Styling**: Tailwind CSS v4 (Sleek and Modern Glassmorphism UI)
* **State Management**: Zustand
* **Data Fetching & Caching**: TanStack Query v5 (React Query)
* **Routing**: React Router Dom v7
* **Icons & UI Assets**: Lucide React

### Backend (Server)
* **Runtime**: Node.js (ESM Module System)
* **Framework**: Express 5 (TypeScript)
* **ORM**: Prisma Client v7
* **Database**: PostgreSQL (Relational Database)
* **Development Tools**: TSX (TypeScript Execute) & TypeScript 6
* **API Documentation**: Swagger JSdoc & Swagger UI Express

### Integrasi Layanan (Services)
* **AI Engine**: Google Generative AI (@google/generative-ai / Gemini API) & OpenAI API
* **File Upload Cloud**: Cloudinary SDK (untuk penyimpanan dokumen CV)
* **Job Scheduler**: Node-cron (untuk evaluasi periodik otomatis)
* **Email Dispatcher**: Nodemailer (untuk notifikasi pengingat evaluasi)

---

## 📁 Struktur Folder Proyek

```text
stepwise/
├── backend/                  # Server Node.js (Express & Prisma)
│   ├── prisma/               # Skema Prisma, Migrasi, & Seeder database
│   ├── src/
│   │   ├── controllers/      # Pengendali Request & Response API
│   │   ├── cron/             # Background Worker (Evaluasi & Notifikasi)
│   │   ├── middlewares/      # Validasi Auth, Upload, & Error Handling
│   │   ├── repositories/     # Akses Data Abstraksi (Prisma Queries)
│   │   ├── routes/           # Routing API Express
│   │   ├── services/         # Logika Bisnis & Integrasi AI/Cloud/Email
│   │   ├── swagger.ts        # Konfigurasi Swagger UI Docs
│   │   ├── app.ts            # Setup Middleware & Express App
│   │   └── index.ts          # Entry point server (Port 5000)
│   └── tsconfig.json
│
├── frontend/                 # Client React (Vite & Tailwind v4)
│   ├── src/
│   │   ├── components/       # Komponen UI Reusable (Navbar, Sidebar, Layout, dll.)
│   │   ├── hooks/            # Custom React Hooks
│   │   ├── pages/            # Komponen Halaman Utama (Dashboard, Assessment, Profile, dll.)
│   │   ├── services/         # Integrasi API Client (Axios & React Query)
│   │   ├── store/            # State Management (Zustand Stores)
│   │   └── main.tsx
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── package.json              # Script utama / root
```

---

## 🚀 Cara Menjalankan Secara Lokal

Ikuti langkah-langkah di bawah ini untuk memasang dan menjalankan proyek StepWise di komputer lokal Anda.

### 📋 Prasyarat (*Prerequisites*)
Pastikan Anda sudah menginstal beberapa software berikut:
* **Node.js** (Versi >= 22.12.0 direkomendasikan)
* **NPM** (Bawaan Node.js)
* **PostgreSQL Database** (Bisa berjalan lokal atau menggunakan cloud gratis seperti Supabase, Neon, atau Railway)

---

### Langkah 1: Kloning Repositori
Buka terminal Anda dan masuk ke direktori tempat Anda menyimpan proyek ini (`c:/Code/stepwise`).

---

### Langkah 2: Konfigurasi & Menjalankan Backend

1. **Masuk ke folder backend**:
   ```bash
   cd backend
   ```

2. **Instal dependensi backend**:
   ```bash
   npm install
   ```

3. **Buat berkas `.env`**:
   Salin berkas `.env.example` menjadi `.env` di dalam folder `backend/`:
   ```bash
   cp .env.example .env
   ```

4. **Isi variabel lingkungan di `.env`**:
   Buka berkas `.env` dan masukkan kredensial Anda:
   ```env
   # Koneksi Database PostgreSQL
   DATABASE_URL="postgresql://username:password@localhost:5432/nama_database_anda"

   # Secret Key untuk Authentication (JWT)
   JWT_ACCESS_SECRET="ganti_dengan_random_string_panjang_akses"
   JWT_REFRESH_SECRET="ganti_dengan_random_string_panjang_refresh"

   # Cloudinary (Untuk unggah berkas CV)
   CLOUDINARY_CLOUD_NAME="cloud_name_cloudinary_anda"
   CLOUDINARY_API_KEY="api_key_cloudinary_anda"
   CLOUDINARY_API_SECRET="api_secret_cloudinary_anda"

   # AI API Keys (Wajib diisi salah satu/keduanya untuk rekomendasi AI & parsing CV)
   GEMINI_API_KEY="key_gemini_ai_anda"
   NVIDIA_API_KEY="key_nvidia_ai_anda" # Opsional jika memakai model nvidia

   # SMTP Mail Server (Untuk notifikasi email pengingat evaluasi)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER="email_gmail_anda@gmail.com"
   SMTP_PASS="password_aplikasi_gmail_anda" # Gunakan App Password dari Google Akun
   SMTP_FROM="Stepwise <email_gmail_anda@gmail.com>"
   ```

5. **Jalankan Migrasi Database (Prisma)**:
   Buat tabel database di PostgreSQL sesuai skema Prisma:
   ```bash
   npx prisma db push
   ```

6. **Jalankan Seed Database (Penting!)**:
   Anda **wajib** menjalankan perintah seeding untuk mengisi bank soal kuesioner asesmen awal di database:
   ```bash
   npx prisma db seed
   ```
   *Catatan: Script seed akan mengeksekusi berkas [assessment.seeder.ts](file:///c:/Code/stepwise/backend/prisma/assessment.seeder.ts) untuk mengisi data pertanyaan kuesioner dinamis.*

7. **Jalankan Server Backend dalam Mode Development**:
   ```bash
   npm run dev
   ```
   Server backend sekarang akan aktif di **`http://localhost:5000`**. Anda dapat memverifikasi status backend dengan mengakses **`http://localhost:5000/health`**.

---

### Langkah 3: Konfigurasi & Menjalankan Frontend

1. **Buka terminal baru** dan masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```

2. **Instal dependensi frontend**:
   ```bash
   npm install
   ```

3. **Buat/Edit berkas `.env`**:
   Secara default, frontend sudah memiliki berkas `.env` yang merujuk ke Railway production. Ubah isinya agar mengarah ke server lokal Anda saat proses pengembangan:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Jalankan Server Frontend (Vite)**:
   ```bash
   npm run dev
   ```
   Aplikasi frontend sekarang aktif di **`http://localhost:5173`**.

---

### Langkah 4: Akses Aplikasi & Dokumentasi API

Setelah kedua server berjalan, Anda dapat mengakses:
* **Aplikasi StepWise (Web Interface)**: [http://localhost:5173](http://localhost:5173)
* **Dokumentasi API Terintegrasi (Swagger)**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## 💡 Alur Kerja Sistem (System Workflow)

1. **Registrasi & Login**: Pengguna mendaftarkan akun dan masuk ke dalam sistem.
2. **Memulai Asesmen**:
   * **Opsi A**: Mengisi kuesioner asesmen dinamis 13 pertanyaan yang mendeteksi minat, kepribadian, jam belajar, dan kesiapan finansial.
   * **Opsi B**: Mengunggah CV (PDF) untuk mengekstrak kompetensi secara otomatis menggunakan AI.
3. **Mendapatkan Rekomendasi**: AI menganalisis profil dan memberikan 3 alternatif karier IT teratas lengkap dengan persentase kesiapan.
4. **Memilih & Mengaktifkan Roadmap**: Pengguna memilih salah satu profesi, dan sistem membuatkan jadwal belajar bertahap.
5. **Belajar & Melacak Progres**: Menandai materi yang sudah diselesaikan pada dashboard interaktif.
6. **Evaluasi & Penyesuaian Adaptif**: Secara periodik, sistem mengirimkan email pengingat evaluasi progres. Dari hasil evaluasi, AI merancang opsi penyesuaian roadmap baru demi optimalnya proses belajar.

---

## 🔒 Keamanan & Kebijakan
* Semua password pengguna disimpan dengan aman menggunakan hashing satu arah bertenaga **bcrypt**.
* Keamanan API dilindungi menggunakan token **JWT (JSON Web Token)** yang disimpan dalam *HTTP-only cookies* untuk memitigasi serangan XSS.
* Integrasi CORS diatur dengan ketat hanya mengizinkan origin development (`http://localhost:5173`, `http://localhost:3000`) dan domain produksi yang telah dideklarasikan di variabel lingkungan.
