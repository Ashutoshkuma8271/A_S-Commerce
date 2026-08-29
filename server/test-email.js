import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Using SMTP credentials:');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
console.log('From:', process.env.SMTP_FROM_EMAIL);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function main() {
  try {
    await transporter.verify();
    console.log('✅ Brevo SMTP Connected Successfully!');

    const res = await transporter.sendMail({
      from: `"A_S Commerce" <${process.env.SMTP_FROM_EMAIL}>`,
      to: 'ashukumarfbg8271@gmail.com',
      subject: '749201 is your A_S Commerce verification code',
      html: `
        <div style="background:#030B11; padding:40px 16px; font-family:sans-serif; text-align:center; color:#fff;">
          <h1 style="color:#F5B83D; letter-spacing:3px;">A_S COMMERCE</h1>
          <h2 style="color:#fff;">Verify Your Email Address</h2>
          <div style="background:#092032; border:1px solid #F5B83D; border-radius:14px; padding:20px; display:inline-block; margin:20px 0;">
            <span style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#F5B83D; font-family:monospace;">749201</span>
          </div>
          <p style="color:#9FB3C8; font-size:12px;">Valid for 15 minutes.</p>
        </div>
      `,
    });

    console.log('✅ Email Delivered! Response:', res.response);
    console.log('Message ID:', res.messageId);
  } catch (err) {
    console.error('❌ Error sending email:', err);
  }
}

main();
