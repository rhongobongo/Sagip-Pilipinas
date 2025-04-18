import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { recipients, subject, message } = await request.json();
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // Send emails to all recipients
    const emailPromises = recipients.map(async (recipient: string) => {
      return transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: recipient,
        subject: subject,
        html: message,
      });
    });
    
    await Promise.all(emailPromises);
    
    return NextResponse.json({ success: true, emailsSent: recipients.length });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json(
      { error: 'Failed to send emails', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}