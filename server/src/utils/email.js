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
      console.log('No SMTP config on Production. Returning preview code for portfolio testing.');
      return {
        delivered: false,
        preview: code,
      };
    }

    console.log(`[DEV OTP] ${email}: ${code}`);
    return {
      delivered: false,
      preview: code,
    };
  }

  try {
    const sendPromise = transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your Mind Haven login code',
      text: `Your Mind Haven login code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your Mind Haven login code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    }).catch(err => {
      throw err; // Force catch below to handle this
    });

    // Add a 5 second timeout so Render doesn't hang forever
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMTP timeout')), 5000)
    );

    await Promise.race([sendPromise, timeoutPromise]);

  } catch (error) {
    console.error('OTP email delivery failed:', error.message);

    // Fallback: If it's a portfolio project and Render blocks SMTP, return the code to the frontend!
    return {
      delivered: false,
      preview: code, // Return code so frontend shows it on screen
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
