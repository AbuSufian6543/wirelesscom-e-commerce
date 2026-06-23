import nodemailer, { type Transporter } from "nodemailer";
import { SITE_NAME, SITE_EMAIL } from "./constants";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;

  if (!host) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  return cachedTransporter;
}

function fromAddress() {
  return process.env.SMTP_FROM || `${SITE_NAME} <${SITE_EMAIL}>`;
}

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const transporter = getTransporter();

  if (!transporter) {
    console.info(
      `\n[email] SMTP not configured - logging email instead.\n` +
        `  To: ${to}\n  Subject: ${subject}\n  ${text}\n`,
    );
    return;
  }

  await transporter.sendMail({
    from: fromAddress(),
    to,
    subject,
    text,
    html,
  });
}

function otpEmailHtml(code: string) {
  return `
  <div style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="background:#1d4ed8;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">${SITE_NAME}</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Verify your email</h2>
          <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
            Use the verification code below to finish creating your account. This code expires in 10 minutes.
          </p>
          <div style="text-align:center;margin:0 0 24px;">
            <span style="display:inline-block;font-size:34px;font-weight:700;letter-spacing:10px;color:#1d4ed8;background:#eff6ff;border-radius:12px;padding:16px 24px;">
              ${code}
            </span>
          </div>
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
      <p style="text-align:center;margin:16px 0 0;color:#94a3b8;font-size:12px;">
        &copy; ${new Date().getFullYear()} ${SITE_NAME}
      </p>
    </div>
  </div>`;
}

export async function sendOtpEmail(to: string, code: string) {
  await sendEmail({
    to,
    subject: `${code} is your ${SITE_NAME} verification code`,
    text: `Your ${SITE_NAME} verification code is ${code}. It expires in 10 minutes.`,
    html: otpEmailHtml(code),
  });
}
