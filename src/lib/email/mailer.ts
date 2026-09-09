import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

const USER_NAME = process.env.USER_NAME || 'noreply.atilla@gmail.com';
const PASSWORD = process.env.PASSWORD || '';
const APP_URL = process.env.APP_URL || 'https://demo.atila.in';
const COMPANY_NAME = process.env.COMPANY_NAME || 'ATILA';
const CUSTOMER_ID = process.env.CUSTOMER_ID || 'atila';
const FOOTER1 = process.env.FOOTER1 || 'Sincerely';
const FOOTER2 = process.env.FOOTER2 || 'Atila Team';

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
  const raw = fs.readFileSync(path.resolve(process.cwd(), templatePath), 'utf8');
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
