import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Email request body:', body);

    const {
      to,
      subject,
      from_name,
      from_email,
      message
    } = body;

    // Validate input
    if (!to || !subject || !from_name || !from_email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Environment variables check:', {
      user: process.env.NM_EMAIL_USER ? 'Set' : 'Missing',
      pass: process.env.NM_EMAIL_PW ? 'Set' : 'Missing'
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NM_EMAIL_USER,
        pass: process.env.NM_EMAIL_PW,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return NextResponse.json(
        { error: 'SMTP configuration error', details: String(verifyError) },
        { status: 500 }
      );
    }

    // Email to company/admin (receiving the job application)
    const mailToCompany = {
      from: process.env.NM_EMAIL_USER,
      to: to, // Company email or the recipient
      subject: `New Job Application: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            New Job Application
          </h2>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Job Position:</strong> ${subject}</p>
            <p><strong>Applicant Name:</strong> ${from_name}</p>
            <p><strong>Applicant Email:</strong> <a href="mailto:${from_email}">${from_email}</a></p>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #374151; margin-top: 0;">Application Message:</h3>
            <p style="line-height: 1.6; color: #4b5563; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${from_email}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Reply to Applicant</a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f1f5f9; border-radius: 8px;">
            <p style="color: #64748b; font-size: 14px;">
              This application was submitted through your job portal.
            </p>
          </div>
        </div>
      `,
    };

    // Auto-reply to the applicant
    const autoReplyToApplicant = {
      from: process.env.NM_EMAIL_USER,
      to: from_email,
      replyTo: to, // Company email for replies
      subject: `Application Received: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
            Application Received Successfully!
          </h2>

          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Hi <strong>${from_name}</strong>,
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Thank you for applying for the <strong>${subject}</strong> position! We have received your application and our team will review it shortly.
          </p>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="color: #374151; margin-top: 0;">Your Application Summary:</h3>
            <p><strong>Position:</strong> ${subject}</p>
            <p><strong>Your Email:</strong> ${from_email}</p>
            <p><strong>Message Submitted:</strong></p>
            <p style="white-space: pre-wrap; color: #4b5563;">${message}</p>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;">
              <strong>What's Next?</strong> Our hiring team will review your application and contact you if your qualifications match our requirements.
            </p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Best regards,<br>
            <strong>The Hiring Team</strong>
          </p>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f1f5f9; border-radius: 8px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This is an automated confirmation email.
            </p>
          </div>
        </div>
      `,
    };

    // Send emails
    try {
      console.log('Sending email to company...');
      const sendResult1 = await transporter.sendMail(mailToCompany);
      console.log('Email to company sent successfully:', sendResult1.messageId);

      console.log('Sending auto-reply to applicant...');
      const sendResult2 = await transporter.sendMail(autoReplyToApplicant);
      console.log('Auto-reply sent successfully:', sendResult2.messageId);

      return NextResponse.json(
        { success: true, message: 'Application submitted successfully!' },
        { status: 200 }
      );
    } catch (sendErr) {
      console.error('Error during email sending:', sendErr);
      return NextResponse.json(
        { success: false, error: 'Failed to send email(s)', details: String(sendErr) },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('General error in apply API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}