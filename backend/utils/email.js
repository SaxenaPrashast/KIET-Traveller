const nodemailer = require('nodemailer');

// Send a transactional email. Priority order:
// 1. Mailjet API (if MAILJET_API_KEY and MAILJET_SECRET present) - free tier: 200 emails/day
// 2. SMTP via env (EMAIL_HOST/SMTP_HOST)
// 3. Fallback: log to console (development)
async function sendEmail({ to, subject, html, text }) {
  const { MAILJET_API_KEY, MAILJET_SECRET, FROM_EMAIL } = process.env;

  // 1) Mailjet API if credentials present
  if (MAILJET_API_KEY && MAILJET_SECRET) {
    try {
      const mailjet = require('node-mailjet').connect(MAILJET_API_KEY, MAILJET_SECRET);
      const fromEmail = FROM_EMAIL || 'no-reply@kiet-traveller.local';
      const fromName = 'KIET Traveller';

      const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: { Email: fromEmail, Name: fromName },
            To: [{ Email: to }],
            Subject: subject,
            TextPart: text || '',
            HTMLPart: html || ''
          }
        ]
      });

      const result = await request;
      console.log('Mailjet API response:', JSON.stringify(result.body, null, 2));
      if (result.body && result.body.Messages && result.body.Messages[0]) {
        const msgStatus = result.body.Messages[0].Status;
        console.log('Mailjet message status:', msgStatus);
        if (msgStatus === 'success') {
          console.log('✅ Mailjet email sent successfully to:', to);
          return result;
        } else {
          console.warn('⚠️ Mailjet response status not "success":', msgStatus);
          throw new Error('Mailjet status: ' + msgStatus);
        }
      } else {
        throw new Error('Mailjet response missing Messages array: ' + JSON.stringify(result.body));
      }
    } catch (err) {
      console.error('❌ Mailjet API error:', {
        statusCode: err.statusCode || 'N/A',
        message: err.message,
        body: err.body ? JSON.stringify(err.body, null, 2) : 'no body'
      });
      console.error('Mailjet send failed, falling back to SMTP/console:', err?.message || err);
    }
  }

  // 2) SMTP via nodemailer; support both EMAIL_* and SMTP_* env var naming
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = process.env.EMAIL_PORT || process.env.SMTP_PORT;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const from = FROM_EMAIL || process.env.EMAIL_FROM || `KIET Traveller <no-reply@kiet-traveller.local>`;

  if (host && port) {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: user && pass ? { user, pass } : undefined
    });

    const msg = { from, to, subject, text, html };

    try {
      const info = await transporter.sendMail(msg);
      console.log('SMTP email sent:', info.messageId);
      return info;
    } catch (err) {
      console.error('Failed to send SMTP email:', err);
      throw err;
    }
  }

  // 3) Fallback: log the email contents (useful for local development)
  console.log('--- Email (fallback) ---');
  console.log('To:', to);
  console.log('Subject:', subject);
  if (text) console.log('Text:', text);
  if (html) console.log('HTML:', html);
  console.log('------------------------');

  return null;
}

module.exports = { sendEmail };
