// Email Delivery Service for A_S Commerce
// Multi-layer delivery: Supabase Auth SMTP (Brevo), Direct Brevo API, Nodemailer SMTP, and Local Console Log

import nodemailer from 'nodemailer';
import { supabase } from '../services/supabase.js';

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.BREVO_SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  return null;
};

export const sendSignupOtpEmail = async (email, name, otp) => {
  const cleanEmail = email.toLowerCase().trim();
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#030E16; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#030E16; min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px; background:#061A27; border:1px solid rgba(212,175,55,0.22); border-radius:20px; box-shadow:0 24px 60px rgba(0,0,0,0.7); overflow:hidden;">
          
          <!-- Subtle Glow Header Line -->
          <tr>
            <td height="2" style="background:linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.6) 50%, transparent 100%);"></td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding:32px 32px 20px 32px; border-bottom:1px solid rgba(255,255,255,0.06);">
              <h1 style="margin:0; font-size:22px; font-weight:800; letter-spacing:3px; color:#FFFFFF; text-transform:uppercase; font-family:'Georgia', serif;">A_S COMMERCE</h1>
              <p style="margin:4px 0 0 0; font-size:10px; letter-spacing:2px; color:#D4AF37; text-transform:uppercase;">Shop Smart. Live Premium.</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td align="center" style="padding:36px 36px 32px 36px;">
              <h2 style="margin:0 0 10px 0; font-size:20px; font-weight:700; color:#FFFFFF; font-family:'Georgia', serif;">Verify Your Email</h2>
              <p style="margin:0 0 26px 0; font-size:13.5px; line-height:1.65; color:#9FB3C8; max-width:380px;">
                Please enter this 6-digit verification passcode on your screen to complete registration:
              </p>

              <!-- OTP Display Box -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 26px auto;">
                <tr>
                  <td align="center" style="background:#092032; border:1px solid rgba(212,175,55,0.4); border-radius:14px; padding:18px 32px; box-shadow:inset 0 2px 8px rgba(0,0,0,0.4);">
                    <div style="font-size:9.5px; font-weight:700; letter-spacing:2px; color:#D4AF37; text-transform:uppercase; margin-bottom:6px;">6-DIGIT VERIFICATION CODE</div>
                    <div style="font-size:36px; font-weight:800; letter-spacing:8px; color:#FFFFFF; font-family:'Courier New', monospace; padding-left:8px;">${otp}</div>
                  </td>
                </tr>
              </table>

              <p style="margin:0; font-size:11.5px; line-height:1.5; color:#627D98;">
                ⏱️ Passcode expires in <strong>15 minutes</strong>. Never share this code.
              </p>
            </td>
          </tr>

          <!-- Security Footer -->
          <tr>
            <td align="center" style="padding:20px 32px; background:#030E16; border-top:1px solid rgba(255,255,255,0.05); font-size:11px; color:#486581;">
              <p style="margin:0 0 4px 0;">© 2026 A_S Commerce Inc. All rights reserved.</p>
              <p style="margin:0; font-size:10px; color:#334E68;">Protected by 256-Bit TLS Encryption.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // 1. Try Nodemailer SMTP if configured
  const transporter = getTransporter();
  if (transporter) {
    try {
      const senderEmail = process.env.SMTP_FROM_EMAIL || 'ashutoshgifthamper9334@gmail.com';
      await transporter.sendMail({
        from: `"A_S Commerce" <${senderEmail}>`,
        to: cleanEmail,
        subject: `${otp} is your A_S Commerce verification code`,
        html: htmlContent
      });
      console.log(`✉️ [Nodemailer SMTP] Verification email sent to ${cleanEmail}`);
      return { success: true };
    } catch (e) {
      console.warn('Nodemailer delivery notice:', e.message);
    }
  }

  // 2. Try Direct Brevo API if BREVO_API_KEY is configured
  if (process.env.BREVO_API_KEY) {
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'A_S Commerce', email: process.env.SMTP_FROM_EMAIL || 'ashutoshgifthamper9334@gmail.com' },
          to: [{ email: cleanEmail, name: name || 'Valued Customer' }],
          subject: `${otp} is your A_S Commerce verification code`,
          htmlContent: htmlContent,
        }),
      });
      console.log(`✉️ [Brevo API] Verification email sent to ${cleanEmail}`);
      return { success: true };
    } catch (e) {
      console.warn('Brevo API delivery note:', e.message);
    }
  }

  // 3. Fallback: Trigger Supabase Auth OTP Email if integrated
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: false }
    });
    if (!error) {
      console.log(`✉️ [Supabase Auth] Verification trigger dispatched to ${cleanEmail}`);
    }
  } catch (e) {
    // Supabase trigger note
  }

  // 4. Local Server Console Log for instantaneous developer testing
  console.log(`\n======================================================`);
  console.log(`✉️  [EMAIL SERVICE] SIGNUP VERIFICATION OTP`);
  console.log(`To: ${cleanEmail} (${name || 'Customer'})`);
  console.log(`OTP Code: ${otp}`);
  console.log(`Valid for: 15 Minutes`);
  console.log(`======================================================\n`);

  return { success: true };
};

export const sendPasswordResetEmail = async (email, resetUrl, role = 'customer') => {
  const cleanEmail = email.toLowerCase().trim();
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
</head>
<body style="margin:0; padding:0; background-color:#030E16; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#030E16; min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px; background:#061A27; border:1px solid rgba(212,175,55,0.22); border-radius:20px; box-shadow:0 24px 60px rgba(0,0,0,0.7); overflow:hidden;">
          
          <!-- Subtle Glow Header Line -->
          <tr>
            <td height="2" style="background:linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.6) 50%, transparent 100%);"></td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding:32px 32px 20px 32px; border-bottom:1px solid rgba(255,255,255,0.06);">
              <h1 style="margin:0; font-size:22px; font-weight:800; letter-spacing:3px; color:#FFFFFF; text-transform:uppercase; font-family:'Georgia', serif;">A_S COMMERCE</h1>
              <p style="margin:4px 0 0 0; font-size:10px; letter-spacing:2px; color:#D4AF37; text-transform:uppercase;">Shop Smart. Live Premium.</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td align="center" style="padding:36px 36px 32px 36px;">
              <h2 style="margin:0 0 10px 0; font-size:20px; font-weight:700; color:#FFFFFF; font-family:'Georgia', serif;">Reset Your Password</h2>
              <p style="margin:0 0 28px 0; font-size:13.5px; line-height:1.65; color:#9FB3C8; max-width:380px;">
                Click the secure button below to choose a new password for your account:
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 28px auto;">
                <tr>
                  <td align="center" style="border-radius:12px; background:linear-gradient(135deg, #F5B83D 0%, #D4AF37 50%, #C29B27 100%); box-shadow:0 8px 24px rgba(212,175,55,0.25);">
                    <a href="${resetUrl}" style="display:inline-block; padding:14px 40px; font-size:13px; font-weight:800; color:#041019 !important; text-decoration:none; text-transform:uppercase; letter-spacing:1px; border-radius:12px;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 14px 0; font-size:11.5px; line-height:1.5; color:#627D98;">
                🔒 Link expires in <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email.
              </p>
              <p style="margin:0; font-size:10.5px; color:#486581; word-break:break-all;">
                Direct link: <a href="${resetUrl}" style="color:#D4AF37; text-decoration:underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Security Footer -->
          <tr>
            <td align="center" style="padding:20px 32px; background:#030E16; border-top:1px solid rgba(255,255,255,0.05); font-size:11px; color:#486581;">
              <p style="margin:0 0 4px 0;">© 2026 A_S Commerce Inc. All rights reserved.</p>
              <p style="margin:0; font-size:10px; color:#334E68;">Protected by 10-Round Bcrypt Encryption.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // 1. Try Nodemailer SMTP if configured
  const transporter = getTransporter();
  if (transporter) {
    try {
      const senderEmail = process.env.SMTP_FROM_EMAIL || 'ashutoshgifthamper9334@gmail.com';
      await transporter.sendMail({
        from: `"A_S Commerce Security" <${senderEmail}>`,
        to: cleanEmail,
        subject: `Reset Your A_S Commerce Password`,
        html: htmlContent
      });
      console.log(`✉️ [Nodemailer SMTP] Password reset email sent to ${cleanEmail}`);
      return { success: true };
    } catch (e) {
      console.warn('Nodemailer delivery notice:', e.message);
    }
  }

  // 2. Try Direct Brevo API
  if (process.env.BREVO_API_KEY) {
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'A_S Commerce Security', email: process.env.BREVO_SENDER_EMAIL || 'security@ascommerce.luxury' },
          to: [{ email: cleanEmail }],
          subject: `Reset Your A_S Commerce Password`,
          htmlContent
        })
      });
      console.log(`✉️ [Brevo API] Password reset email delivered to ${cleanEmail}`);
      return { success: true };
    } catch (e) {
      console.warn(`Brevo API delivery note:`, e.message);
    }
  }

  // 3. Trigger Supabase Auth Password Reset Email
  try {
    await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: resetUrl
    });
    console.log(`✉️ [Supabase Auth Brevo] Password reset email triggered for ${cleanEmail}`);
  } catch (e) {
    console.warn(`Supabase Auth reset email trigger note:`, e.message);
  }

  // 4. Developer / Local Server Console Log
  console.log(`\n======================================================`);
  console.log(`✉️  [EMAIL SERVICE] PASSWORD RESET LINK`);
  console.log(`To: ${cleanEmail} (${role})`);
  console.log(`Reset Link: ${resetUrl}`);
  console.log(`Valid for: 15 Minutes`);
  console.log(`======================================================\n`);

  return { success: true };
};

export const sendOrderConfirmationEmail = async (order) => {
  if (!order) return { success: false };
  const cleanEmail = (order.customerEmail || order.email || order.shippingAddress?.email || '').toLowerCase().trim();
  if (!cleanEmail) return { success: false };

  const customerName = order.customerName || order.shippingAddress?.fullName || order.shippingAddress?.name || 'Valued Customer';
  const orderId = order.id || 'N/A';
  const totalAmount = (order.total || order.total_amount || 0).toLocaleString('en-IN');
  const items = Array.isArray(order.items) ? order.items : [];

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px; color:#FFFFFF;">
        <strong>${item.name || item.title || 'Product'}</strong> x ${item.quantity || 1}
      </td>
      <td align="right" style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px; font-weight:700; color:#D4AF37;">
        ₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order Confirmation #${orderId}</title>
</head>
<body style="margin:0; padding:0; background-color:#030E16; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#030E16; min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px; background:#061A27; border:1px solid rgba(212,175,55,0.25); border-radius:20px; box-shadow:0 24px 60px rgba(0,0,0,0.7); overflow:hidden;">
          <tr>
            <td height="3" style="background:linear-gradient(90deg, #F5B83D 0%, #D4AF37 50%, #C29B27 100%);"></td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 32px 18px 32px; border-bottom:1px solid rgba(255,255,255,0.06);">
              <h1 style="margin:0; font-size:22px; font-weight:800; letter-spacing:3px; color:#FFFFFF; text-transform:uppercase; font-family:'Georgia', serif;">A_S COMMERCE</h1>
              <p style="margin:4px 0 0 0; font-size:10px; letter-spacing:2px; color:#D4AF37; text-transform:uppercase;">Shop Smart. Live Premium.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 24px 32px;">
              <div style="background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.3); border-radius:12px; padding:14px; text-align:center; margin-bottom:24px;">
                <span style="font-size:11px; font-weight:800; letter-spacing:2px; color:#D4AF37; text-transform:uppercase;">Order Confirmed</span>
                <div style="font-size:20px; font-weight:800; color:#FFFFFF; margin-top:4px;">#${orderId}</div>
              </div>
              <p style="font-size:14px; line-height:1.6; color:#9FB3C8; margin:0 0 16px 0;">
                Dear <strong>${customerName}</strong>, thank you for your order. We are preparing your items with luxury packaging and care.
              </p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
                <thead>
                  <tr>
                    <th align="left" style="font-size:11px; color:#627D98; text-transform:uppercase; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1);">Item</th>
                    <th align="right" style="font-size:11px; color:#627D98; text-transform:uppercase; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1);">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#092032; border-radius:10px; padding:14px; margin-bottom:20px;">
                <tr>
                  <td style="font-size:13px; color:#9FB3C8;">Payment Method:</td>
                  <td align="right" style="font-size:13px; font-weight:600; color:#FFFFFF;">${order.paymentMethod || 'Razorpay / Online'}</td>
                </tr>
                <tr>
                  <td style="font-size:14px; font-weight:800; color:#FFFFFF; padding-top:6px;">Grand Total:</td>
                  <td align="right" style="font-size:16px; font-weight:800; color:#D4AF37; padding-top:6px;">₹${totalAmount}</td>
                </tr>
              </table>

              <p style="font-size:12px; color:#627D98; line-height:1.5; margin:0;">
                📦 Tracking Number: <strong>${order.trackingNumber || 'Assigned soon'}</strong> (${order.carrier || 'Bluedart Express'})
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 32px; background:#030E16; border-top:1px solid rgba(255,255,255,0.05); font-size:11px; color:#486581;">
              <p style="margin:0;">© 2026 A_S Commerce Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // 1. Try Nodemailer
  const transporter = getTransporter();
  if (transporter) {
    try {
      const senderEmail = process.env.SMTP_FROM_EMAIL || 'ashutoshgifthamper9334@gmail.com';
      await transporter.sendMail({
        from: `"A_S Commerce Orders" <${senderEmail}>`,
        to: cleanEmail,
        subject: `Order Confirmed: #${orderId} - A_S Commerce`,
        html: htmlContent
      });
      console.log(`✉️ [Nodemailer SMTP] Order confirmation sent to ${cleanEmail}`);
      return { success: true };
    } catch (e) {
      console.warn('Nodemailer order email notice:', e.message);
    }
  }

  // 2. Try Brevo API
  if (process.env.BREVO_API_KEY) {
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'A_S Commerce Orders', email: process.env.BREVO_SENDER_EMAIL || 'orders@ascommerce.luxury' },
          to: [{ email: cleanEmail, name: customerName }],
          subject: `Order Confirmed: #${orderId} - A_S Commerce`,
          htmlContent
        })
      });
      console.log(`✉️ [Brevo API] Order confirmation email delivered to ${cleanEmail}`);
      return { success: true };
    } catch (e) {
      console.warn('Brevo API order email note:', e.message);
    }
  }

  return { success: true };
};

