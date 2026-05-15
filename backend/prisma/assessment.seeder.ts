import { prisma } from '../src/lib/prisma.js';


async function main() {
  console.log('Cleaning up old assessment data...');
  await prisma.assessmentAnswer.deleteMany();
  await prisma.assessmentSession.deleteMany();
  await prisma.assessmentOption.deleteMany();
  await prisma.assessmentQuestion.deleteMany();

  // ═══════════════════════════════════════════════════════════════
  // FASE 1 — Familiaritas Teknologi  (Wajib, Semua Pengguna)
  // Routing: A/B → jalur Non-Teknis (2A) | C/D → jalur Teknis (2B)
  // ═══════════════════════════════════════════════════════════════
  const fase1 = await prisma.assessmentQuestion.create({
    data: {
      key:       'FASE1',
      text:      'Seperti apa kebiasaanmu menggunakan teknologi digital sehari-hari?',
      helpText:  'Pilih salah satu yang paling menggambarkan dirimu.',
      inputType: 'single_choice',
      order:     1,
      options: {
        create: [
          {
            label: 'Pengguna Dasar – Saya biasanya hanya memakai aplikasi untuk chat, media sosial, browsing ringan, dan nonton video.',
            value: 'A',
            order: 1,
            nextQuestionKey: 'FASE2A_1',
          },
          {
            label: 'Pengguna Cukup Aktif – Saya lancar mengedit dokumen, membuat konten di Canva, mengolah data di Excel, dan mudah beradaptasi dengan aplikasi baru.',
            value: 'B',
            order: 2,
            nextQuestionKey: 'FASE2A_1',
          },
          {
            label: 'Pengguna Mahir – Saya terbiasa dengan tools profesional (desain, akuntansi, manajemen proyek) dan pernah mencoba coding atau otomatisasi sederhana.',
            value: 'C',
            order: 3,
            nextQuestionKey: 'FASE2B_1',
          },
          {
            label: 'Pengguna Sangat Mahir – Saya aktif menulis kode, mengelola server, mengolah data dengan Python/SQL, atau merancang antarmuka aplikasi.',
            value: 'D',
            order: 4,
            nextQuestionKey: 'FASE2B_1',
          },
        ],
      },
    },
  });
  console.log(`✓ FASE1 created        (id: ${fase1.id})`);

  // ═══════════════════════════════════════════════════════════════
  // FASE 2A — Eksplorasi Potensi  (Jalur Non-Teknis, 2 pertanyaan)
  // ═══════════════════════════════════════════════════════════════

  // ── 2A-1 : Aktivitas & Hobi ───────────────────────────────────
  const fase2a1 = await prisma.assessmentQuestion.create({
    data: {
      key:           'FASE2A_1',
      text:          'Dari aktivitas berikut, mana yang paling sering kamu lakukan atau paling kamu nikmati?',
      helpText:      'Pilih maksimal 2.',
      inputType:     'multi_choice',
      maxSelections: 2,
      order:         2,
      options: {
        create: [
          { label: 'Mengedit foto/video, membuat desain grafis, atau menata konten media sosial',                        value: 'desain',    order: 1, nextQuestionKey: 'FASE2A_2' },
          { label: 'Membaca artikel, menonton video edukatif, atau riset mendalam tentang suatu topik',                  value: 'riset',     order: 2, nextQuestionKey: 'FASE2A_2' },
          { label: 'Mengorganisir file, membuat daftar rapi, atau menganalisis data dan angka',                          value: 'analitis',  order: 3, nextQuestionKey: 'FASE2A_2' },
          { label: 'Menulis cerita, membuat konten kreatif, atau aktif di media sosial',                                 value: 'konten',    order: 4, nextQuestionKey: 'FASE2A_2' },
          { label: 'Memperbaiki barang rusak, merakit sesuatu, atau mengutak-atik perangkat elektronik',                 value: 'teknis',    order: 5, nextQuestionKey: 'FASE2A_2' },
          { label: 'Berdiskusi, menjelaskan sesuatu ke orang lain, atau aktif dalam kegiatan sosial',                   value: 'sosial',    order: 6, nextQuestionKey: 'FASE2A_2' },
          { label: 'Berjualan online, merencanakan proyek, atau mencari peluang baru',                                   value: 'bisnis',    order: 7, nextQuestionKey: 'FASE2A_2' },
        ],
      },
    },
  });
  console.log(`✓ FASE2A_1 created     (id: ${fase2a1.id})`);

  // ── 2A-2 : Minat IT Versi Awam ────────────────────────────────
  const fase2a2 = await prisma.assessmentQuestion.create({
    data: {
      key:       'FASE2A_2',
      text:      'Dari gambaran karier berikut, mana yang paling menarik bagimu meskipun kamu belum punya pengalamannya?',
      helpText:  'Pilih maksimal 2.',
      inputType: 'multi_choice',
      maxSelections: 2,
      order:     3,
      options: {
        create: [
          { label: 'Membuat tampilan aplikasi atau website yang indah dan mudah dipakai',        value: 'frontend_uiux',      order: 1,  nextQuestionKey: 'FASE3_1' },
          { label: 'Membangun "otak" di balik aplikasi — logika, database, dan koneksi antar sistem', value: 'backend',       order: 2,  nextQuestionKey: 'FASE3_1' },
          { label: 'Membuat aplikasi smartphone yang bisa diunduh di Play Store atau App Store', value: 'mobile',             order: 3,  nextQuestionKey: 'FASE3_1' },
          { label: 'Menganalisis data untuk menemukan pola dan membantu pengambilan keputusan',  value: 'data',               order: 4,  nextQuestionKey: 'FASE3_1' },
          { label: 'Membangun sistem AI atau machine learning yang bisa "belajar" sendiri',      value: 'ai_ml',              order: 5,  nextQuestionKey: 'FASE3_1' },
          { label: 'Melindungi sistem dari serangan siber dan memastikan keamanan data',        value: 'cyber',              order: 6,  nextQuestionKey: 'FASE3_1' },
          { label: 'Mengelola server dan infrastruktur cloud agar aplikasi berjalan lancar',    value: 'cloud_devops',       order: 7,  nextQuestionKey: 'FASE3_1' },
          { label: 'Membuat game yang seru dan imersif',                                        value: 'game',               order: 8,  nextQuestionKey: 'FASE3_1' },
          { label: 'Mempromosikan produk digital dan mengoptimalkan visibilitas online',        value: 'digital_marketing',  order: 9,  nextQuestionKey: 'FASE3_1' },
          { label: 'Memimpin tim produk, menentukan fitur apa yang harus dibangun dan kenapa',  value: 'product_mgmt',       order: 10, nextQuestionKey: 'FASE3_1' },
          { label: 'Belum tahu, masih ingin eksplorasi lebih lanjut',                           value: 'explore',            order: 11, nextQuestionKey: 'FASE3_1' },
        ],
      },
    },
  });
  console.log(`✓ FASE2A_2 created     (id: ${fase2a2.id})`);

  // ═══════════════════════════════════════════════════════════════
  // FASE 2B — Pemetaan Kompetensi  (Jalur Teknis, 2 pertanyaan)
  // ═══════════════════════════════════════════════════════════════

  // ── 2B-1 : Area Minat IT Detail ───────────────────────────────
  const fase2b1 = await prisma.assessmentQuestion.create({
    data: {
      key:           'FASE2B_1',
      text:          'Dari area IT berikut, mana yang paling membuatmu bersemangat untuk digeluti lebih dalam?',
      helpText:      'Pilih maksimal 2.',
      inputType:     'multi_choice',
      maxSelections: 2,
      order:         4,
      options: {
        create: [
          // Membangun Produk
          { label: 'Frontend & UI Development – HTML, CSS, JS, React, Vue. Profesi: Frontend Dev, UI Engineer.',                             value: 'frontend',          order: 1,  nextQuestionKey: 'FASE2B_2' },
          { label: 'Backend & API Development – Node.js, Express, Laravel, PostgreSQL. Profesi: Backend Dev, API Engineer.',                 value: 'backend',           order: 2,  nextQuestionKey: 'FASE2B_2' },
          { label: 'Mobile Development – Flutter, React Native, Swift, Kotlin. Profesi: Mobile Dev.',                                       value: 'mobile',            order: 3,  nextQuestionKey: 'FASE2B_2' },
          // Data & AI
          { label: 'Data Science & Analytics – Python, SQL, Pandas, Tableau. Profesi: Data Analyst, Data Scientist.',                       value: 'data_science',      order: 4,  nextQuestionKey: 'FASE2B_2' },
          { label: 'AI & Machine Learning – TensorFlow, PyTorch. Profesi: AI/ML Engineer.',                                                 value: 'ai_ml',             order: 5,  nextQuestionKey: 'FASE2B_2' },
          // Infrastruktur & Keamanan
          { label: 'Cybersecurity & Network – Kali Linux, Wireshark. Profesi: Security Analyst, Network Engineer.',                         value: 'cyber',             order: 6,  nextQuestionKey: 'FASE2B_2' },
          { label: 'Cloud & DevOps – AWS, Docker, Kubernetes. Profesi: DevOps Engineer, Cloud Engineer.',                                   value: 'cloud_devops',      order: 7,  nextQuestionKey: 'FASE2B_2' },
          { label: 'QA / Quality Assurance – Selenium, JIRA. Profesi: QA Engineer, Software Tester.',                                      value: 'qa',                order: 8,  nextQuestionKey: 'FASE2B_2' },
          // Desain & Produk
          { label: 'UI/UX Design – Figma, Adobe XD. Profesi: UI/UX Designer, Product Designer.',                                           value: 'uiux',              order: 9,  nextQuestionKey: 'FASE2B_2' },
          { label: 'Product Management – JIRA, Notion. Profesi: Product Manager.',                                                         value: 'product_mgmt',     order: 10, nextQuestionKey: 'FASE2B_2' },
          // Teknologi Khusus
          { label: 'Game Development – Unity, Unreal Engine. Profesi: Game Developer.',                                                     value: 'game',              order: 11, nextQuestionKey: 'FASE2B_2' },
          { label: 'IoT & Embedded Systems – Arduino, Raspberry Pi. Profesi: IoT Engineer.',                                               value: 'iot',               order: 12, nextQuestionKey: 'FASE2B_2' },
          { label: 'Blockchain & Web3 – Solidity, Ethereum. Profesi: Blockchain Developer.',                                               value: 'blockchain',        order: 13, nextQuestionKey: 'FASE2B_2' },
          { label: 'Digital Marketing & SEO – Google Analytics, Meta Ads. Profesi: Digital Marketer, Growth Hacker.',                      value: 'digital_marketing', order: 14, nextQuestionKey: 'FASE2B_2' },
        ],
      },
    },
  });
  console.log(`✓ FASE2B_1 created     (id: ${fase2b1.id})`);

  // ── 2B-2 : Motivasi & Aspirasi Karier ─────────────────────────
  const fase2b2 = await prisma.assessmentQuestion.create({
    data: {
      key:           'FASE2B_2',
      text:          'Apa yang paling mendorongmu ingin mendalami IT lebih serius?',
      helpText:      'Pilih maksimal 2.',
      inputType:     'multi_choice',
      maxSelections: 2,
      order:         5,
      options: {
        create: [
          { label: 'Membangun produk yang dipakai banyak orang',              value: 'produk',     order: 1, nextQuestionKey: 'FASE3_1' },
          { label: 'Memecahkan masalah kompleks dan mencari solusi cerdas',   value: 'problem',    order: 2, nextQuestionKey: 'FASE3_1' },
          { label: 'Mendapatkan penghasilan tinggi dan stabilitas finansial',  value: 'finansial',  order: 3, nextQuestionKey: 'FASE3_1' },
          { label: 'Fleksibilitas kerja (remote, freelance, jam fleksibel)',   value: 'fleksibel',  order: 4, nextQuestionKey: 'FASE3_1' },
          { label: 'Terus belajar teknologi baru dan tidak stagnan',           value: 'growth',     order: 5, nextQuestionKey: 'FASE3_1' },
          { label: 'Berkontribusi pada proyek open source atau dampak sosial', value: 'dampak',     order: 6, nextQuestionKey: 'FASE3_1' },
        ],
      },
    },
  });
  console.log(`✓ FASE2B_2 created     (id: ${fase2b2.id})`);

  // ═══════════════════════════════════════════════════════════════
  // FASE 3 — Gaya & Preferensi  (Wajib, Semua Pengguna)
  // ═══════════════════════════════════════════════════════════════

  // ── 3-1 : Kepribadian Dominan (RIASEC) ────────────────────────
  const fase3_1 = await prisma.assessmentQuestion.create({
    data: {
      key:       'FASE3_1',
      text:      'Dari enam deskripsi berikut, mana yang paling terdengar seperti dirimu?',
      helpText:  'Pilih satu yang paling dominan.',
      inputType: 'single_choice',
      order:     6,
      options: {
        create: [
          {
            label: 'Si Praktis – Suka kegiatan nyata dan hasil yang terlihat langsung. Lebih nyaman mengerjakan sesuatu secara langsung daripada berpikir terlalu lama.',
            value: 'R', order: 1, nextQuestionKey: 'FASE3_2',
          },
          {
            label: 'Si Pemikir – Suka memahami sesuatu sampai ke akarnya, senang riset, dan menikmati teka-teki atau masalah yang butuh analisis mendalam.',
            value: 'I', order: 2, nextQuestionKey: 'FASE3_2',
          },
          {
            label: 'Si Kreatif – Suka menciptakan, mengekspresikan diri, dan membuat sesuatu yang unik. Tidak suka terikat aturan yang kaku.',
            value: 'A', order: 3, nextQuestionKey: 'FASE3_2',
          },
          {
            label: 'Si Penolong – Suka membantu, mengajar, atau mendukung orang lain. Peduli dengan perasaan orang di sekitar.',
            value: 'S', order: 4, nextQuestionKey: 'FASE3_2',
          },
          {
            label: 'Si Pemimpin – Suka ambil inisiatif, mempengaruhi orang lain, dan berorientasi pada pencapaian target.',
            value: 'E', order: 5, nextQuestionKey: 'FASE3_2',
          },
          {
            label: 'Si Teratur – Suka keteraturan, prosedur, dan data yang rapi. Puas ketika semuanya berjalan sesuai rencana.',
            value: 'C', order: 6, nextQuestionKey: 'FASE3_2',
          },
        ],
      },
    },
  });
  console.log(`✓ FASE3_1 created      (id: ${fase3_1.id})`);

  // ── 3-2 : Gaya Belajar ────────────────────────────────────────
  const fase3_2 = await prisma.assessmentQuestion.create({
    data: {
      key:       'FASE3_2',
      text:      'Bagaimana kamu paling mudah memahami hal baru?',
      helpText:  'Pilih satu.',
      inputType: 'single_choice',
      order:     7,
      options: {
        create: [
          { label: 'Visual – Menonton video, melihat diagram, atau infografis.',                      value: 'visual',   order: 1, nextQuestionKey: 'FASE3_3' },
          { label: 'Auditori – Mendengarkan penjelasan, podcast, atau diskusi.',                      value: 'auditori', order: 2, nextQuestionKey: 'FASE3_3' },
          { label: 'Praktik Langsung – Langsung mencoba sendiri dan belajar dari kesalahan.',         value: 'praktik',  order: 3, nextQuestionKey: 'FASE3_3' },
          { label: 'Membaca & Menulis – Membaca dokumentasi atau artikel panjang dan membuat catatan.', value: 'membaca', order: 4, nextQuestionKey: 'FASE3_3' },
        ],
      },
    },
  });
  console.log(`✓ FASE3_2 created      (id: ${fase3_2.id})`);

  // ── 3-3 : Preferensi Lingkungan Kerja ─────────────────────────
  const fase3_3 = await prisma.assessmentQuestion.create({
    data: {
      key:       'FASE3_3',
      text:      'Lingkungan kerja seperti apa yang paling membuatmu nyaman dan produktif?',
      helpText:  'Pilih satu.',
      inputType: 'single_choice',
      order:     8,
      options: {
        create: [
          { label: 'Bekerja sendiri dengan fokus penuh, tanpa banyak gangguan.',             value: 'individu',  order: 1, nextQuestionKey: 'FASE3_4' },
          { label: 'Bekerja dalam tim kecil yang erat (2–5 orang).',                         value: 'tim_kecil', order: 2, nextQuestionKey: 'FASE3_4' },
          { label: 'Bekerja dalam tim besar dengan peran dan struktur yang jelas.',           value: 'tim_besar', order: 3, nextQuestionKey: 'FASE3_4' },
          { label: 'Fleksibel — bisa menyesuaikan diri di berbagai situasi.',                value: 'fleksibel', order: 4, nextQuestionKey: 'FASE3_4' },
        ],
      },
    },
  });
  console.log(`✓ FASE3_3 created      (id: ${fase3_3.id})`);

  const fase3_4 = await prisma.assessmentQuestion.create({
    data: {
      key:       'FASE3_4',
      text:      'Tipe perusahaan seperti apa yang paling kamu idamkan?',
      helpText:  'Pilih satu.',
      inputType: 'single_choice',
      order:     9,
      options: {
        create: [
          { label: 'Startup – Dinamis, cepat, banyak belajar, tapi kurang stabil.',                  value: 'startup',      order: 1, nextQuestionKey: 'FASE3_5' },
          { label: 'Korporat – Struktur jelas, jenjang karier terdefinisi, lebih stabil.',            value: 'korporat',     order: 2, nextQuestionKey: 'FASE3_5' },
          { label: 'Freelance / Mandiri – Bekerja lepas, atur jadwal dan proyek sendiri.',            value: 'freelance',    order: 3, nextQuestionKey: 'FASE3_5' },
          { label: 'Tech Company / Digital Agency – Fokus produk digital, lingkungan inovatif.',      value: 'tech_company', order: 4, nextQuestionKey: 'FASE3_5' },
          { label: 'Belum terpikirkan – Masih menjelajah.',                                           value: 'belum',        order: 5, nextQuestionKey: 'FASE3_5' },
        ],
      },
    },
  });
  console.log(`✓ FASE3_4 created      (id: ${fase3_4.id})`);

  const fase3_5 = await prisma.assessmentQuestion.create({
    data: {
      key:       'FASE3_5',
      text:      'Berapa jam per minggu yang secara realistis bisa kamu sisihkan untuk belajar?',
      helpText:  'Jujur saja — ini untuk membuat jadwal yang realistis, bukan menghakimi.',
      inputType: 'single_choice',
      order:     10,
      options: {
        create: [
          { label: 'Kurang dari 5 jam',   value: '<5',   order: 1, nextQuestionKey: null },
          { label: '5–10 jam',            value: '5-10', order: 2, nextQuestionKey: null },
          { label: '10–20 jam',           value: '10-20',order: 3, nextQuestionKey: null },
          { label: 'Lebih dari 20 jam',   value: '>20',  order: 4, nextQuestionKey: null },
        ],
      },
    },
  });
  console.log(`✓ FASE3_5 created      (id: ${fase3_5.id})`);

}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());