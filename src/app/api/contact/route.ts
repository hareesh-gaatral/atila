import { NextResponse } from 'next/server';
import { sendMail, renderTemplate } from '@/lib/email/mailer';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Gather env vars
    const CC_EMAIL_ID = process.env.CC_EMAIL_ID || '';
    const adminEmails = CC_EMAIL_ID
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean);

    // ---- 1. Send notification to admin + CCs ----
    const notifyHtml = renderTemplate('mail/contact-notify.html', {
      name,
      email,
      phone,
      message,
      appUrl: process.env.APP_URL || 'https://demo.atila.in',
      companyName: process.env.COMPANY_NAME || 'ATILA',
      customerId: process.env.CUSTOMER_ID || 'atila',
      footer1: process.env.FOOTER1 || 'Sincerely',
      footer2: process.env.FOOTER2 || 'Atila Team',
    });

    const primaryAdmin = adminEmails[0] || process.env.USER_NAME || '';
    const otherAdmins = adminEmails.slice(1);

    await sendMail({
      to: primaryAdmin,
      cc: otherAdmins.length > 0 ? otherAdmins : undefined,
      subject: `New contact message from ${name}`,
      html: notifyHtml,
    });

    // ---- 2. Send auto-reply to the user ----
    const thankyouHtml = renderTemplate('mail/contact-thankyou.html', {
      name,
      appUrl: process.env.APP_URL || 'https://demo.atila.in',
      companyName: process.env.COMPANY_NAME || 'ATILA',
      customerId: process.env.CUSTOMER_ID || 'atila',
      footer1: process.env.FOOTER1 || 'Sincerely',
      footer2: process.env.FOOTER2 || 'Atila Team',
    });

    await sendMail({
      to: email,
      subject: 'We will contact you soon — ATILA',
      html: thankyouHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent and auto-reply dispatched',
    });
  } catch (err: any) {
    console.error('Contact API error:', err);
    const isLimitExceeded = err?.responseCode === 550 || err?.message?.includes('550-5.4.5');
    const userMessage = isLimitExceeded
      ? 'Gmail daily sending limit exceeded (550-5.4.5). Please update email credentials or wait for the 24-hour quota reset.'
      : (err.message || 'Failed to send message');

    return NextResponse.json(
      { success: false, error: userMessage },
      { status: 500 }
    );
  }
}