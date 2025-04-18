// /app/api/send-email/route.ts <-- Ensure file is placed here!
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { recipients, subject, message } = await request.json();

    // --- Verification Logs (Remove after debugging) ---
    console.log('API Route: Received request');
    console.log('API Route: Attempting to read environment variables...');
    console.log('API Route: EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('API Route: EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('API Route: EMAIL_USER:', process.env.EMAIL_USER);
    console.log('API Route: EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD); // Avoid logging password
    console.log('API Route: EMAIL_FROM:', process.env.EMAIL_FROM);
    // --- End Verification Logs ---

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.EMAIL_FROM) {
        console.error('API Route Error: Missing required email environment variables.');
        return NextResponse.json(
          { error: 'Server configuration error: Missing email credentials.' },
          { status: 500 }
        );
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      // FIX APPLIED: Explicitly set 'secure' based on port 465 (required for SSL/TLS)
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        // IMPORTANT: Ensure EMAIL_PASSWORD is the Gmail App Password if using Gmail w/ 2FA
        pass: process.env.EMAIL_PASSWORD,
      },
      // Optional: Add connection timeout if needed
      // connectionTimeout: 10000 // 10 seconds
    });

    // Optional: Verify connection configuration (logs success/error to console)
    // await transporter.verify();
    // console.log("API Route: Transporter connection verified.");

    console.log(`API Route: Preparing to send email to ${recipients.length} recipients.`);

    // Send emails to all recipients
    const emailPromises = recipients.map(async (recipient: string) => {
      console.log(`API Route: Sending email to ${recipient}...`);
      try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM, // e.g., "Your App Name <yourapp@gmail.com>" or just "yourapp@gmail.com"
            to: recipient,
            subject: subject,
            html: message,
        });
        console.log(`API Route: Email sent successfully to ${recipient}: ${info.messageId}`);
        return { success: true, recipient: recipient, messageId: info.messageId };
      } catch (sendError) {
          console.error(`API Route: Failed to send email to ${recipient}:`, sendError);
          // Return an error object for Promise.allSettled if you want detailed results
          return { success: false, recipient: recipient, error: sendError instanceof Error ? sendError.message : String(sendError) };
      }
    });

    // Wait for all emails to settle (either sent or failed)
    const results = await Promise.allSettled(emailPromises);
    console.log("API Route: Email sending process completed. Results:", results);

    // Filter for successful sends (optional, depending on desired response)
    const successfulSends = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    return NextResponse.json({ success: true, message: `Attempted to send ${recipients.length} emails. ${successfulSends} succeeded.`, details: results });

  } catch (error) {
    console.error('API Route: General error in POST function:', error);
    // Ensure sensitive details aren't leaked in the response
    let errorMessage = 'Failed to process email request.';
    if (error instanceof Error) {
        // Avoid exposing potentially sensitive details from Nodemailer errors directly to client
        if (error.message.includes('credentials') || error.message.includes('auth')) {
             errorMessage = 'Authentication failed. Please check server configuration.';
        } else if (error.message.includes('connect') || error.message.includes('ETIMEDOUT')) {
             errorMessage = 'Connection failed. Could not reach email server.';
        }
        // Log the full error on the server only
        console.error('API Route Error Details:', error.message);
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}