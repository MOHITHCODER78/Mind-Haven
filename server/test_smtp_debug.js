require('dotenv').config();
const nodemailer = require('nodemailer');

const testSMTP = async () => {
    console.log('Testing SMTP connection with:');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass configured:', !!process.env.SMTP_PASS);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        logger: true, // Enable built-in nodemailer logging
        debug: true
    });

    try {
        console.log('\nVerifying transport...');
        await transporter.verify();
        console.log('✅ Connection verified successfully!');

        console.log('\nSending test email...');
        const result = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Mind Haven Debug Test',
            text: 'If you see this, SMTP is working.'
        });
        console.log('✅ Email sent!', result.messageId);
    } catch (err) {
        console.error('❌ SMTP Error Occurred:');
        console.error(err);
    }
};

testSMTP();
