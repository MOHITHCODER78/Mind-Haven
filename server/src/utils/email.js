const isProduction = process.env.NODE_ENV === 'production';

const sendOtpEmail = async ({ email, code }) => {
  // Priority: BREVO_API_KEY > RESEND_API_KEY (fallback)
  const brevoKey = process.env.BREVO_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@mindhaven.app';

  // ── Brevo HTTP API (sends to ALL users for free) ──
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
          subject: 'Your Mind Haven login code',
          htmlContent: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;"><h2 style="color:#2f7c71;margin:0 0 8px;">Mind Haven</h2><p style="color:#555;margin:0 0 24px;">Use this code to sign in:</p><div style="background:#f4f8f6;border-radius:12px;padding:20px;text-align:center;font-size:32px;font-weight:800;letter-spacing:0.2em;color:#1a3d36;">${code}</div><p style="color:#999;margin:16px 0 0;font-size:13px;">This code expires in 10 minutes. If you didn't request this, just ignore it.</p></div>`,
          textContent: `Your Mind Haven login code is ${code}. It expires in 10 minutes.`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Brevo ${response.status}: ${JSON.stringify(errorData)}`);
      }

      console.log(`OTP email sent to ${email} via Brevo`);
      return { delivered: true, preview: null };
    } catch (error) {
      console.error('Brevo email failed:', error.message);
      return { delivered: false, preview: code };
    }
  }

  // ── Resend HTTP API (fallback, only sends to your own email) ──
  if (resendKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Mind Haven <onboarding@resend.dev>',
          to: email,
          subject: 'Your Mind Haven login code',
          html: `<p>Your Mind Haven login code is <strong style="font-size:1.2em;">${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Resend ${response.status}: ${JSON.stringify(errorData)}`);
      }

      console.log(`OTP email sent to ${email} via Resend`);
      return { delivered: true, preview: null };
    } catch (error) {
      console.error('Resend email failed:', error.message);
      return { delivered: false, preview: code };
    }
  }

  // ── No email provider configured ──
  if (isProduction) {
    console.log('No email API keys configured. Returning preview code.');
  } else {
    console.log(`[DEV OTP] ${email}: ${code}`);
  }

  return { delivered: false, preview: code };
};

module.exports = { sendOtpEmail };
