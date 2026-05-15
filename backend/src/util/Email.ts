import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST!,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export interface SendEmailParams {
  to:      string;
  subject: string;
  html:    string;
}

export const sendEmail = async (params: SendEmailParams): Promise<void> => {
  await transporter.sendMail({
    from:    `"StepWise" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to:      params.to,
    subject: params.subject,
    html:    params.html,
  });
};

// ── Template: evaluasi reminder ──────────────────────────────
export const buildEvaluationReminderEmail = (params: {
  name:           string;
  professionTitle: string;
  completedCount: number;
  totalCount:     number;
  percent:        number;
}): string => `
<div style="font-family: sans-serif; max-width: 560px; margin: auto; color: #1a1a1a;">
  <h2 style="color: #6366f1;">Halo, ${params.name}! 👋</h2>
  <p>Sudah waktunya evaluasi progres belajarmu menuju <strong>${params.professionTitle}</strong>.</p>

  <div style="background: #f4f4f8; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px;">Progress saat ini</p>
    <p style="margin: 4px 0; font-size: 28px; font-weight: bold; color: #6366f1;">
      ${params.percent}%
    </p>
    <p style="margin: 0; font-size: 13px; color: #666;">
      ${params.completedCount} dari ${params.totalCount} materi selesai
    </p>
  </div>

  <p>Luangkan 2–3 menit untuk mengisi refleksi singkat agar roadmap-mu tetap relevan.</p>

  <a href="${process.env.FRONTEND_URL}/evaluation"
     style="display:inline-block; background:#6366f1; color:#fff;
            padding: 12px 24px; border-radius: 8px; text-decoration: none;
            font-weight: bold; margin-top: 8px;">
    Isi Evaluasi Sekarang →
  </a>

  <p style="margin-top: 24px; font-size: 12px; color: #999;">
    Email ini dikirim otomatis oleh StepWise. Kamu bisa abaikan jika sudah mengisi evaluasi.
  </p>
</div>
`;