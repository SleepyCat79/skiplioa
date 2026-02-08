import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to, code) {
  const mailOptions = {
    from: `"Skipli Board" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #4f46e5; margin-bottom: 16px;">Skipli Board</h2>
        <p style="margin-bottom: 24px;">Here is your verification code:</p>
        <div style="background: #f0f0ff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${code}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendInvitationEmail(to, boardName, inviterEmail) {
  const mailOptions = {
    from: `"Skipli Board" <${process.env.SMTP_USER}>`,
    to,
    subject: `You've been invited to "${boardName}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #4f46e5; margin-bottom: 16px;">Board Invitation</h2>
        <p>${inviterEmail} has invited you to collaborate on <strong>"${boardName}"</strong>.</p>
        <p style="margin-top: 16px;">
          <a href="${process.env.CLIENT_URL}" style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Open Skipli Board
          </a>
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
