const nodemailer = require('nodemailer');

const isProduction = process.env.NODE_ENV === 'production';

const sendOtpEmail = async ({ email, code }) => {
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@mindhaven.app';
  
  // LOG OTP TO TERMINAL FOR IMMEDIATE TESTING
  console.log(`[AUTH DEBUG] OTP for ${email}: ${code}`);

  // ── SMTP (Nodemailer) - High Priority ──
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; border: 1px solid #eef2f0; border-radius: 16px;">
          <h2 style="color: #2f7c71; margin: 0 0 8px;">Mind Haven</h2>
          <p style="color: #555; margin: 0 0 24px;">Use this verification code to sign in to your wellness dashboard:</p>
          <div style="background: #f4f8f6; border-radius: 12px; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 0.2em; color: #1a3d36;">
            ${code}
          </div>
          <p style="color: #666; margin: 24px 0 0; font-size: 14px; line-height: 1.5;">
            This code expires in 10 minutes.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: `"Mind Haven" <${senderEmail}>`,
        to: email,
        subject: `${code} is your Mind Haven login code`,
        text: `Your Mind Haven login code is ${code}. It expires in 10 minutes.`,
        html: htmlContent,
      });

      console.log(`OTP email sent to ${email} via SMTP relay`);
      return { delivered: true, preview: null };
    } catch (error) {
      console.error('SMTP relay failed:', error.message);
    }
  }

  // ── Brevo HTTP API (Fallback) ──
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoKey,
        },
        body: JSON.stringify({
          sender: { name: 'Mind Haven', email: senderEmail },
          to: [{ email }],
          subject: `${code} is your Mind Haven login code`,
          htmlContent: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;"><h2 style="color:#2f7c71;margin:0 0 8px;">Mind Haven</h2><p style="color:#555;margin:0 0 24px;">Use this code to sign in:</p><div style="background:#f4f8f6;border-radius:12px;padding:20px;text-align:center;font-size:32px;font-weight:800;letter-spacing:0.2em;color:#1a3d36;">${code}</div><p style="color:#999;margin:16px 0 0;font-size:13px;">This code expires in 10 minutes.</p></div>`,
        }),
      });

      if (response.ok) {
        console.log(`OTP email sent to ${email} via Brevo API`);
        return { delivered: true, preview: null };
      }
    } catch (error) {
      console.error('Brevo API failed:', error.message);
    }
  }

  return { delivered: false, preview: code };
};

module.exports = { sendOtpEmail };
