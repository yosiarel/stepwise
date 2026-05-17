import { prisma } from '../src/lib/prisma.js';

async function main() {
  console.log('🔧 Memulai proses perbaikan profil pengguna...');

  // Ambil semua profil pengguna yang weeklyHours-nya null
  const profiles = await prisma.userProfile.findMany({
    where: {
      weeklyHours: null,
    },
  });

  console.log(`Menemukan ${profiles.length} profil yang memerlukan perbaikan...`);

  for (const profile of profiles) {
    // Cari sesi kuesioner terakhir yang selesai
    const session = await prisma.assessmentSession.findFirst({
      where: {
        userId: profile.userId,
        status: 'COMPLETED',
      },
      include: {
        answers: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (session) {
      const answer = session.answers.find((a) => a.questionKey === 'FASE3_4');
      if (answer) {
        const weeklyHoursMap: Record<string, number> = {
          '<5':   3,
          '5-10':  7,
          '10-20': 15,
          '>20':  25,
        };
        const weeklyHours = weeklyHoursMap[answer.answerValue] ?? null;
        if (weeklyHours) {
          await prisma.userProfile.update({
            where: { id: profile.id },
            data: { weeklyHours },
          });
          console.log(`✓ Sukses memperbaiki profil untuk userId ${profile.userId} menjadi ${weeklyHours} jam.`);
        } else {
          console.log(`⚠️ Jawaban FASE3_4 ditemukan (${answer.answerValue}) tapi tidak terpetakan.`);
        }
      } else {
        console.log(`⚠️ Jawaban FASE3_4 tidak ditemukan pada sesi untuk userId ${profile.userId}.`);
      }
    } else {
      console.log(`⚠️ Sesi kuesioner selesai tidak ditemukan untuk userId ${profile.userId}.`);
    }
  }

  console.log('🏁 Proses perbaikan profil selesai.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
