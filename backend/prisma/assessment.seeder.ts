import { prisma } from '../src/lib/prisma.js';

async function main() {
  console.log('⚡ Menjalankan Seeder Pertanyaan Asesmen StepWise...');

  // Bersihkan data lama untuk menghindari duplikasi / constraint error
  await prisma.assessmentAnswer.deleteMany();
  await prisma.assessmentSession.deleteMany();
  await prisma.assessmentOption.deleteMany();
  await prisma.assessmentQuestion.deleteMany();

  // ===============================================================
  // FASE 1 — Profiling & Familiaritas (Wajib, Semua Pengguna)
  // ===============================================================
  const fase1 = await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE1',
      text: 'Like apa kebiasaanmu menggunakan teknologi digital sehari-hari?',
      helpText: 'Pilih salah satu yang paling menggambarkan dirimu.',
      inputType: 'single_choice',
      order: 1,
      options: {
        create: [
          {
            label: 'Pengguna Dasar – Saya biasanya hanya memakai aplikasi untuk chat, media sosial, browsing ringan, dan nonton video. Saya jarang atau belum pernah mencoba tools yang lebih teknis seperti rumus Excel kompleks, editing, apalagi coding.',
            value: 'A',
            order: 1,
            nextQuestionKey: 'FASE2A_1' // Mengarah ke Jalur Non-Teknis
          },
          {
            label: 'Pengguna Cukup Aktif – Saya cukup lancar menggunakan berbagai aplikasi untuk belajar dan bekerja — mengedit dokumen, membuat konten sederhana di Canva, mengolah data dengan Excel, atau mengatur file cloud. Saya bisa beradaptasi dengan aplikasi baru tanpa banyak kesulitan.',
            value: 'B',
            order: 2,
            nextQuestionKey: 'FASE2A_1' // Mengarah ke Jalur Non-Teknis
          },
          {
            label: 'Pengguna Mahir – Saya terbiasa menggunakan tools profesional untuk pekerjaan spesifik: software desain, akuntansi, manajemen proyek, atau pernah mencoba coding dan otomatisasi sederhana. Saya cukup percaya diri mengeksplorasi teknologi baru.',
            value: 'C',
            order: 3,
            nextQuestionKey: 'FASE2B_1' // Mengarah ke Jalur Teknis
          },
          {
            label: 'Pengguna Sangat Mahir – Saya membuat atau mengutak-atik teknologi — menulis kode, mengelola server, mengolah data dengan Python/SQL, atau merancang antarmuka aplikasi. Ini adalah bagian penting dari pekerjaan atau hobi saya.',
            value: 'D',
            order: 4,
            nextQuestionKey: 'FASE2B_1' // Mengarah ke Jalur Teknis
          }
        ]
      }
    }
  });
  console.log(`✓ FASE1 Berhasil Dibuat (ID: ${fase1.id})`);

  // ===============================================================
  // FASE 2A — Eksplorasi Potensi (Jalur Non-Teknis)
  // ===============================================================
  const fase2a1 = await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE2A_1',
      text: 'Bayangkan kamu diminta membantu sebuah acara amal. Kamu paling bersemangat mengambil peran yang mana?',
      helpText: 'Pilih satu yang paling menggambarkan dirimu.',
      inputType: 'single_choice',
      order: 2,
      options: {
        create: [
          { label: 'Merancang tampilan dekorasi, poster, dan feed Instagram acara', value: 'A', order: 1, nextQuestionKey: 'FASE2A_2' },
          { label: 'Mengatur jadwal, logistik, memastikan semua tim terkoordinasi lancar', value: 'B', order: 2, nextQuestionKey: 'FASE2A_2' },
          { label: 'Mencatat dana masuk/keluar, membuat perkiraan anggaran, menghitung tiket terjual', value: 'C', order: 3, nextQuestionKey: 'FASE2A_2' },
          { label: 'Memikirkan ide konten kreatif, menulis caption, atau membuat video pendek', value: 'D', order: 4, nextQuestionKey: 'FASE2A_2' },
          { label: 'Mengawasi jalannya acara, memastikan keamanan, punya rencana cadangan jika ada masalah', value: 'E', order: 5, nextQuestionKey: 'FASE2A_2' },
          { label: 'Membantu di mana saja dibutuhkan — menyambut tamu, mengangkat barang, dll.', value: 'F', order: 6, nextQuestionKey: 'FASE2A_2' }
        ]
      }
    }
  });

  await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE2A_2',
      text: 'Dari aktivitas berikut, mana yang paling menarik perhatianmu atau paling menggambarkan hobimu sehari-hari?',
      helpText: 'Pilih maksimal 2 pilihan.',
      inputType: 'multi_choice',
      maxSelections: 2,
      order: 3,
      options: {
        create: [
          { label: 'Mengedit foto atau video, membuat desain grafis, atau menata feeds agar estetik', value: 'A', order: 1, nextQuestionKey: 'FASE2A_3' },
          { label: 'Membaca artikel, buku, atau menonton video yang membahas suatu topik mendalam', value: 'B', order: 2, nextQuestionKey: 'FASE2A_3' },
          { label: 'Mengatur sesuatu agar rapi dan terstruktur atau mencari tahu data statistik', value: 'C', order: 3, nextQuestionKey: 'FASE2A_3' },
          { label: 'Menulis cerita, caption, membuat konten, atau bermain media sosial', value: 'D', order: 4, nextQuestionKey: 'FASE2A_3' },
          { label: 'Memperbaiki barang rusak, membongkar pasang mainan/elektronik, merakit sesuatu', value: 'E', order: 5, nextQuestionKey: 'FASE2A_3' },
          { label: 'Berdiskusi tentang isu terkini, berdebat sehat, atau menjelaskan sesuatu ke teman', value: 'F', order: 6, nextQuestionKey: 'FASE2A_3' }
        ]
      }
    }
  });

  await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE2A_3',
      text: 'Dari deskripsi kepribadian ini, mana yang paling terdengar seperti dirimu?',
      helpText: 'Pilih satu yang paling dominan.',
      inputType: 'single_choice',
      order: 4,
      options: {
        create: [
          { label: 'Si Praktis – Suka kegiatan nyata, menggunakan tangan/alat, hasil terlihat jelas.', value: 'R', order: 1, nextQuestionKey: 'FASE2A_4' },
          { label: 'Si Pemikir – Suka memahami akar masalah, penasaran, riset, and analisa data.', value: 'I', order: 2, nextQuestionKey: 'FASE2A_4' },
          { label: 'Si Kreatif – Suka menciptakan sesuatu yang unik, indah, ekspresif, tanpa aturan kaku.', value: 'A', order: 3, nextQuestionKey: 'FASE2A_4' },
          { label: 'Si Penolong – Peduli sekitar, suka mengajar, mendukung, and membantu teman.', value: 'S', order: 4, nextQuestionKey: 'FASE2A_4' },
          { label: 'Si Pemimpin – Suka mengambil inisiatif, memimpin proyek, and berorientasi hasil.', value: 'E', order: 5, nextQuestionKey: 'FASE2A_4' },
          { label: 'Si Teratur – Sistematis, teliti, menyukai prosedur jadwal harian, and folder rapi.', value: 'C', order: 6, nextQuestionKey: 'FASE2A_4' }
        ]
      }
    }
  });

  await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE2A_4',
      text: 'Saat menghadapi tugas baru dan kamu tidak tahu harus mulai dari mana, apa tindakanmu?',
      helpText: 'Pilih salah satu.',
      inputType: 'single_choice',
      order: 5,
      options: {
        create: [
          { label: 'Langsung mencoba-coba sendiri, belajar dari kesalahan', value: 'A', order: 1, nextQuestionKey: 'FASE3_1' },
          { label: 'Mencari tutorial, membaca panduan, atau bertanya pada ahlinya', value: 'B', order: 2, nextQuestionKey: 'FASE3_1' },
          { label: 'Menunggu instruksi jelas atau bantuan sebelum mulai', value: 'C', order: 3, nextQuestionKey: 'FASE3_1' },
          { label: 'Diskusi dengan teman atau tim untuk brainstorming bersama', value: 'D', order: 4, nextQuestionKey: 'FASE3_1' }
        ]
      }
    }
  });
  console.log('✓ Jalur Kamar FASE 2A Berhasil Disuntikkan.');

  // ===============================================================
  // FASE 2B — Pemetaan Kompetensi (Jalur Teknis)
  // ===============================================================
  const fase2b1 = await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE2B_1',
      text: 'Dari area IT berikut, mana yang paling membuatmu bersemangat untuk digeluti lebih dalam?',
      helpText: 'Pilih maksimal 2 pilihan industri.',
      inputType: 'multi_choice',
      maxSelections: 2,
      order: 6,
      options: {
        create: [
          { label: 'Frontend & UI Development – Membangun tampilan aplikasi yang indah dan interaktif.', value: 'frontend', order: 1, nextQuestionKey: 'FASE2B_2' },
          { label: 'Backend & API Development – Membangun logika server, database, and arsitektur API.', value: 'backend', order: 2, nextQuestionKey: 'FASE2B_2' },
          { label: 'Mobile Development – Membangun aplikasi native/hybrid smartphone Android/iOS.', value: 'mobile', order: 3, nextQuestionKey: 'FASE2B_2' },
          { label: 'Data Science & Analytics – Mengolah data besar untuk insight bisnis and visualisasi.', value: 'data_science', order: 4, nextQuestionKey: 'FASE2B_2' },
          { label: 'Artificial Intelligence & ML – Merancang algoritma cerdas and pemodelan kognitif.', value: 'ai_ml', order: 5, nextQuestionKey: 'FASE2B_2' },
          { label: 'UI/UX Design – Merancang pengalaman and alur interaksi pengguna di Figma.', value: 'uiux', order: 6, nextQuestionKey: 'FASE2B_2' }
        ]
      }
    }
  });

  await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE2B_2',
      text: 'Apa motivasi utama yang paling mendorongmu ingin mendalami bidang IT?',
      helpText: 'Pilih maksimal 2 pilihan.',
      inputType: 'multi_choice',
      maxSelections: 2,
      order: 7,
      options: {
        create: [
          { label: 'Membangun produk nyata yang dipakai oleh banyak orang', value: 'A', order: 1, nextQuestionKey: 'FASE2B_3' },
          { label: 'Memecahkan masalah kompleks dan mencari solusi logis', value: 'B', order: 2, nextQuestionKey: 'FASE2B_3' },
          { label: 'Mendapatkan penghasilan tinggi dan stabilitas karier jangka panjang', value: 'C', order: 3, nextQuestionKey: 'FASE2B_3' },
          { label: 'Fleksibilitas kerja yang tinggi (Remote Work, WFH, Freelance)', value: 'D', order: 4, nextQuestionKey: 'FASE2B_3' }
        ]
      }
    }
  });

  await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE2B_3',
      text: 'Dari deskripsi karakter berikut, mana yang paling mendekati kepribadianmu?',
      helpText: 'Pilih satu yang paling utama.',
      inputType: 'single_choice',
      order: 8,
      options: {
        create: [
          { label: 'Si Praktis – Suka eksekusi nyata, merakit komponen, hasil langsung terlihat.', value: 'R', order: 1, nextQuestionKey: 'FASE3_1' },
          { label: 'Si Pemikir – Suka menganalisis kode, algoritma, memecahkan teka-teki logika.', value: 'I', order: 2, nextQuestionKey: 'FASE3_1' },
          { label: 'Si Kreatif – Suka mendesain antarmuka unik, estetika layout, mendobrak pakem kaku.', value: 'A', order: 3, nextQuestionKey: 'FASE3_1' },
          { label: 'Si Teratur – Menyukai standardisasi folder, dokumentasi rapi, and checklist sistematis.', value: 'C', order: 4, nextQuestionKey: 'FASE3_1' }
        ]
      }
    }
  });
  console.log(`✓ Jalur Kamar FASE 2B Berhasil Disuntikkan (ID Awal: ${fase2b1.id})`);

  // ===============================================================
  // FASE 3 — Gaya & Preferensi (Wajib, Semua Pengguna)
  // ===============================================================
  await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE3_1',
      text: 'Bagaimana kamu paling nyaman mempelajari suatu materi baru?',
      helpText: 'Pilih satu gaya belajar utama.',
      inputType: 'single_choice',
      order: 9,
      options: {
        create: [
          { label: 'Visual – Menonton video tutorial, bagan arsitektur, atau membaca infografis.', value: 'visual', order: 1, nextQuestionKey: 'FASE3_2' },
          { label: 'Auditori – Mendengarkan rekaman penjelasan, sesi podcast, atau diskusi kelompok.', value: 'auditori', order: 2, nextQuestionKey: 'FASE3_2' },
          { label: 'Praktik Langsung – Menulis kode langsung di text editor dan debugging mandiri.', value: 'praktik', order: 3, nextQuestionKey: 'FASE3_2' },
          { label: 'Membaca & Menulis – Membaca dokumentasi API resmi, artikel teknis, and mencatat.', value: 'membaca', order: 4, nextQuestionKey: 'FASE3_2' }
        ]
      }
    }
  });

  await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE3_2',
      text: 'Lingkungan ekosistem kerja seperti apa yang paling membuatmu produktif?',
      helpText: 'Pilih salah satu lingkungan.',
      inputType: 'single_choice',
      order: 10,
      options: {
        create: [
          { label: 'Bekerja sendiri dengan fokus penuh – Produktif tanpa adanya interupsi luar.', value: 'individu', order: 1, nextQuestionKey: 'FASE3_3' },
          { label: 'Bekerja dalam kelompok kecil (2–5 orang) – Kolaborasi intensif and lincah.', value: 'tim_kecil', order: 2, nextQuestionKey: 'FASE3_3' },
          { label: 'Bekerja dalam tim besar dengan koridor peran terdefinisi sangat jelas.', value: 'tim_besar', order: 3, nextQuestionKey: 'FASE3_3' },
          { label: 'Fleksibel — Mampu menyesuaikan diri baik dalam kesendirian maupun kerja tim.', value: 'fleksibel', order: 4, nextQuestionKey: 'FASE3_3' }
        ]
      }
    }
  });

  await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE3_3',
      text: 'Tipe model bisnis perusahaan seperti apa yang paling kamu idamkan?',
      helpText: 'Pilih tipe instansi.',
      inputType: 'single_choice',
      order: 11,
      options: {
        create: [
          { label: 'Startup – Ekosistem bergerak sangat cepat, dinamis, menuntut adaptabilitas.', value: 'startup', order: 1, nextQuestionKey: 'FASE3_4' },
          { label: 'Korporat / Perusahaan Mapan – Struktur birokrasi rapi, stabil, jenjang karier pasti.', value: 'korporat', order: 2, nextQuestionKey: 'FASE3_4' },
          { label: 'Freelance / Mandiri – Memiliki otoritas penuh atas kendali waktu dan klien mandiri.', value: 'freelance', order: 3, nextQuestionKey: 'FASE3_4' },
          { label: 'Tech Company / Digital Agency – Fokus pada produk inovasi digital teknologi murni.', value: 'tech_company', order: 4, nextQuestionKey: 'FASE3_4' }
        ]
      }
    }
  });

  await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE3_4',
      text: 'Berapa jam per minggu yang secara realistis bisa kamu komit untuk belajar?',
      helpText: 'Pilih kapasitas waktu terdekat.',
      inputType: 'single_choice',
      order: 12,
      options: {
        create: [
          { label: 'Kurang dari 5 jam per minggu', value: '<5', order: 1, nextQuestionKey: 'FASE3_5' },
          { label: '5–10 jam per minggu', value: '5-10', order: 2, nextQuestionKey: 'FASE3_5' },
          { label: '10–20 jam per minggu', value: '10-20', order: 3, nextQuestionKey: 'FASE3_5' },
          { label: 'Lebih dari 20 jam per minggu', value: '>20', order: 4, nextQuestionKey: 'FASE3_5' }
        ]
      }
    }
  });

  // 🛠️ INTEGRASI BARU: FASE3_5 Untuk memicu tombol 'Selesaikan Asesmen' di frontend & supply ProfilePage
  const fase35 = await prisma.assessmentQuestion.create({
    data: {
      key: 'FASE3_5',
      text: 'Berapa ekspektasi uang saku atau target pendapatan per bulan yang kamu harapkan?',
      helpText: 'Pilih kisaran ekspektasi minimum Anda.',
      inputType: 'single_choice',
      order: 13,
      options: {
        create: [
          { label: 'Uang saku / Pendapatan di bawah Rp 3.000.000', value: 'Rp < 3.000.000', order: 1, nextQuestionKey: null }, // Akhir Kuesioner
          { label: 'Uang saku / Pendapatan berkisar Rp 3.000.000 — Rp 5.000.000', value: 'Rp 3.000.000 — Rp 5.000.000', order: 2, nextQuestionKey: null },
          { label: 'Pendapatan profesional berkisar Rp 5.000.000 — Rp 10.000.000', value: 'Rp 5.000.000 — Rp 10.000.000', order: 3, nextQuestionKey: null },
          { label: 'Pendapatan profesional di atas Rp 10.000.000', value: 'Rp > 10.000.000', order: 4, nextQuestionKey: null }
        ]
      }
    }
  });

  console.log(`✓ FASE3_5 Penutup Berhasil Dibuat (ID: ${fase35.id})`);
  console.log('\n🚀 SEEDING BERHASIL! Seluruh 13 simpul kuesioner StepWise sinkron dengan Frontend.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });