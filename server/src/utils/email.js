const isProduction = process.env.NODE_ENV === 'production';

const sendOtpEmail = async ({ email, code }) => {
  // We will now look for BREVO_API_KEY instead of SMTP credentials!
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS; // Fallback to SMTP_PASS in case they put it there
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!apiKey || !senderEmail) {
    if (isProduction) {
      console.log('No Brevo API configuration on Production. Returning preview code for portfolio testing.');
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
    // This uses the native Fetch API (no nodemailer, no SMTP port firewalls!)
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: {
          name: 'Mind Haven Support',
          email: senderEmail
        },
        to: [
          { email: email }
        ],
        subject: 'Your Mind Haven login code',
        htmlContent: `<p>Your Mind Haven login code is <strong style="font-size: 1.2em;">${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
        textContent: `Your Mind Haven login code is ${code}. It expires in 10 minutes.`
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Brevo HTTP Error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    return {
      delivered: true,
      preview: null,
    };
  } catch (error) {
    console.error('OTP HTTP email delivery failed:', error.message);

    // Fallback: Show onscreen preview code on failure
    return {
      delivered: false,
      preview: code,
    };
  }
};

module.exports = {
  sendOtpEmail,
};
