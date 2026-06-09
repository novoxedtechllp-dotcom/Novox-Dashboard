import nodemailer from 'nodemailer';
import { ApiError } from './ApiError.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `Novox Dashboard <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    // We log the error but don't necessarily throw an ApiError so that the main transaction doesn't fail just because email failed.
    // However, if we strictly need to throw:
    // throw new ApiError(500, "Failed to send email notification");
  }
};
