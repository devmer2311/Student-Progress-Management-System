import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const result = await sendTestEmail(email);

    if (result.success) {
      return NextResponse.json({ 
        message: 'Test email sent successfully',
        details: 'Check your inbox (and spam folder) for the test email.'
      });
    } else {
      console.error('Test email failed:', result.error);
      return NextResponse.json({ 
        error: 'Failed to send test email',
        details: 'Check your SMTP configuration and SendGrid settings.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: 'Internal server error occurred.'
    }, { status: 500 });
  }
}