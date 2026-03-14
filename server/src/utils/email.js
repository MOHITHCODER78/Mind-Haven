const nodemailer = require('nodemailer');

const isProduction = process.env.NODE_ENV === 'production';

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendOtpEmail = async ({ email, code }) => {
  const transporter = getTransporter();

  if (!transporter) {
    if (isProduction) {
      return {
        delivered: false,
        preview: null,
        error: 'Email delivery is not configured on the server.',
      };
    }

    console.log(`[DEV OTP] ${email}: ${code}`);
    return {
      delivered: false,
      preview: code,
    };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your Mind Haven login code',
      text: `Your Mind Haven login code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your Mind Haven login code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });
  } catch (error) {
    console.error('OTP email delivery failed:', error.message);

    // Add extra context for common Resend free-tier error
    if (error.message && error.message.includes('domain')) {
      console.error('Note: If you are using Resend on a free tier, you can only send emails to the email address you registered with, unless you verify a custom domain.');
    }

    return {
      delivered: false,
      preview: null,
      error: 'Unable to send OTP email right now. Please try again later. (Check console for details)',
    };
  }

  return {
    delivered: true,
    preview: null,
  };
};

module.exports = {
  sendOtpEmail,
};
