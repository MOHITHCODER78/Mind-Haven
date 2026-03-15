const isProduction = process.env.NODE_ENV === 'production';

const sendOtpEmail = async ({ email, code }) => {
  // Now explicitly looking for RESEND_API_KEY
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (isProduction) {
      console.log('No Resend API configuration on Production. Returning preview code for portfolio testing.');
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
    // Using Resend HTTP API (Bypasses all Server/SMTP Firewalls completely)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Mind Haven Recovery <onboarding@resend.dev>', // Resend demands this exact sender for free tier
        to: email,
        subject: 'Your Mind Haven login code',
        html: `<p>Your Mind Haven login code is <strong style="font-size: 1.2em;">${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Resend HTTP Error ${response.status}: ${JSON.stringify(errorData)}`);
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
