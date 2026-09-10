import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

const USER_NAME = process.env.USER_NAME || 'noreply.atilla@gmail.com';
const PASSWORD = process.env.PASSWORD || '';
const APP_URL = process.env.APP_URL || 'https://demo.atila.in';
const COMPANY_NAME = process.env.COMPANY_NAME || 'ATILA';
const CUSTOMER_ID = process.env.CUSTOMER_ID || 'atila';
const FOOTER1 = process.env.FOOTER1 || 'Sincerely';
const FOOTER2 = process.env.FOOTER2 || 'Atila Team';

const templates: Record<string, string> = {
  'mail/contact-notify.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Message</title>
</head>
<body style="font-family: Arial, sans-serif; color:#1e293b; background:#f8fafc; padding:32px; margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
    <tr>
      <td style="padding:40px 32px 28px; background:#0f172a;">
        <h2 style="color:#fff; margin:0; font-size:22px; letter-spacing:-0.5px;">New Contact Message</h2>
        <p style="color:#94a3b8; margin:8px 0 0; font-size:13px;">Submitted via the ATILA website contact form</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <table cellpadding="6" cellspacing="0" border="0" width="100%" style="font-size:15px; line-height:1.6;">
          <tr><td style="padding:4px 0;"><strong>Name:</strong></td><td style="padding:4px 0;">{{name}}</td></tr>
          <tr><td style="padding:4px 0;"><strong>Email:</strong></td><td style="padding:4px 0;"><a href="mailto:{{email}}" style="color:#0d9488;">{{email}}</a></td></tr>
          <tr><td style="padding:4px 0;"><strong>Phone:</strong></td><td style="padding:4px 0;">{{phone}}</td></tr>
          <tr><td style="padding:4px 0; vertical-align:top;"><strong>Message:</strong></td><td style="padding:4px 0; background:#f8fafc; border-radius:8px; padding:12px; color:#334155;">{{message}}</td></tr>
        </table>
        <hr style="border:none; border-top:1px solid #e2e8f0; margin:28px 0 20px;" />
        <a href="mailto:{{email}}" style="display:inline-block; padding:12px 24px; background:#0d9488; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">Reply to {{name}}</a>
        <p style="margin-top:16px; color:#64748b; font-size:13px;">App URL: <a href="{{appUrl}}" style="color:#0d9488;">{{appUrl}}</a></p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px; background:#f1f5f9; font-size:12px; color:#64748b; text-align:center;">
        {{companyName}} / {{customerId}} — {{footer1}} — {{footer2}}
      </td>
    </tr>
  </table>
</body>
</html>`,
  'mail/contact-thankyou.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>We will Contact You Soon</title>
</head>
<body style="font-family: Arial, sans-serif; color:#1e293b; background:#f8fafc; padding:32px; margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
    <tr>
      <td style="padding:40px 32px 28px; background:#0f172a;">
        <h2 style="color:#fff; margin:0; font-size:22px;">Thank you for contacting us!</h2>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px; color:#334155; font-size:15px; line-height:1.6;">
          Hi {{name}},
        </p>
        <p style="margin:0 0 16px; color:#334155; font-size:15px; line-height:1.6;">
          Thank you for reaching out to <strong>{{companyName}}</strong>. We have received your message and our team will review your inquiry shortly.
        </p>
        <p style="margin:0 0 16px; color:#334155; font-size:15px; line-height:1.6;">
          One of our procurement specialists will be in touch within the next 24 hours to discuss how we can help you transform your purchasing workflows.
        </p>
        <p style="margin:0; color:#64748b; font-size:13px;">
          This is an automated confirmation - you do not need to reply.
        </p>
        <a href="{{appUrl}}" style="display:inline-block; margin-top:24px; padding:10px 20px; background:#0d9488; color:#fff; text-decoration:none; border-radius:8px; font-size:14px; font-weight:500;">Visit {{companyName}} Website</a>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px; background:#f1f5f9; font-size:12px; color:#64748b; text-align:center;">
        {{companyName}} / {{customerId}} — {{footer1}} — {{footer2}}
      </td>
    </tr>
  </table>
</body>
</html>`,
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: USER_NAME, pass: PASSWORD },
  tls: { rejectUnauthorized: false },
});

export async function sendMail({
  to,
  cc = [],
  subject,
  html,
  from = `noreply <${USER_NAME}>`,
  attachments = [],
}: {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  from?: string;
  attachments?: any[];
}) {
  const info = await transporter.sendMail({
    from,
    to,
    cc,
    subject,
    html,
    attachments,
  });
  return info;
}

export function renderTemplate(templatePath: string, values: Record<string, any>) {
  const raw = templates[templatePath];
  if (!raw) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  const template = handlebars.compile(raw);
  return template({
    appUrl: APP_URL,
    companyName: COMPANY_NAME,
    customerId: CUSTOMER_ID,
    footer1: FOOTER1,
    footer2: FOOTER2,
    ...values,
  });
}
