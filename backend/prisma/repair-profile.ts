import { prisma } from '../src/lib/prisma.js';
import { completeSessionService } from '../src/services/assessment.service.js';

async function main() {
  console.log('🔧 Memulai proses pemulihan dan sinkronisasi kuesioner menggantung...');

  // Ambil semua profil pengguna
  const profiles = await prisma.userProfile.findMany({});

  console.log(`Menganalisis ${profiles.length} profil pengguna untuk disinkronkan...`);

  for (const profile of profiles) {
    // Cari sesi kuesioner terakhir apa pun statusnya
    const session = await prisma.assessmentSession.findFirst({
      where: {
        userId: profile.userId,
      },
      include: {
        answers: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (session) {
      console.log(`\n👤 Menganalisis Sesi ${session.id} untuk userId: ${profile.userId}`);
      console.log(`   - Status saat ini di DB: ${session.status}`);
      console.log(`   - Jumlah jawaban tersimpan: ${session.answers.length}`);

      const hasFase34 = session.answers.some((a) => a.questionKey === 'FASE3_4');

      if (hasFase34) {
        console.log(`   💡 Ditemukan jawaban FASE3_4 (Jam Belajar). Memulai penyelesaian otomatis...`);
        try {
          // Panggil service penyelesaian resmi agar data terpetakan secara lengkap dan valid!
          const result = await completeSessionService(profile.userId, session.id);
          console.log(`   ✓ SUKSES: Sesi berhasil diselesaikan! Detail: ${result.message}`);

          // Opsional: Double check apakah weeklyHours sudah terisi
          const updatedProfile = await prisma.userProfile.findUnique({
            where: { userId: profile.userId }
          });
          console.log(`   ✓ Hasil Profil Baru: weeklyHours = ${updatedProfile?.weeklyHours} jam`);
        } catch (err: any) {
          console.error(`   ❌ GAGAL menyelesaikan sesi:`, err.message || err);
        }
      } else {
        console.log(`   ⚠️ Jawaban FASE3_4 belum diisi. Pengguna harus menyelesaikan kuesioner terlebih dahulu.`);
      }
    } else {
      console.log(`   ⚠️ Sesi kuesioner tidak ditemukan sama sekali untuk userId: ${profile.userId}`);
    }
  }

  console.log('\n🏁 Proses pemulihan selesai.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
