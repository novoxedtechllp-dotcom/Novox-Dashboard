import nodemailer from 'nodemailer';
import { ApiError } from './ApiError.js';

let transporter = null;

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('[Email] SMTP_EMAIL or SMTP_PASSWORD not configured. Skipping email to', to);
    return null;
  }

  try {
    if (!transporter) {
      console.log('[Email] Creating new SMTP transporter...');
      transporter = createTransporter();

      // Verify the transporter connection on first use
      try {
        await transporter.verify();
        console.log('[Email] SMTP transporter verified successfully');
      } catch (verifyError) {
        console.error('[Email] SMTP transporter verification failed:', verifyError.message);
        transporter = null; // Reset so next call tries again
        return null;
      }
    }

    const mailOptions = {
      from: `Novox Dashboard <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    };

    console.log(`[Email] Sending email to ${to} with subject: "${subject}"`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email] Failed to send email to ${to}:`, error.message);
    if (error.code) console.error(`[Email] Error code: ${error.code}`);
    if (error.response) console.error(`[Email] SMTP Response: ${error.response}`);
    // Reset transporter on auth/connection errors so it can retry fresh next time
    if (error.code === 'EAUTH' || error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      console.warn('[Email] Resetting transporter due to connection/auth error');
      transporter = null;
    }
    return null;
  }
};
