import nodemailer from 'nodemailer';

// Create transporter using SendGrid SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendReminderEmail(email: string, name: string, reminderCount: number) {
  const subject = `Coding Practice Reminder - Get Back to Problem Solving! 🚀`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Coding Practice Reminder</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f8fafc; 
          line-height: 1.6;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .card { 
          background: white; 
          border-radius: 12px; 
          padding: 32px; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); 
        }
        .header { 
          color: #1e293b; 
          font-size: 24px; 
          font-weight: 700; 
          margin-bottom: 16px; 
        }
        .text { 
          color: #475569; 
          line-height: 1.6; 
          margin-bottom: 20px; 
        }
        .tips-box { 
          background: #f1f5f9; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 24px 0; 
          border-left: 4px solid #3b82f6;
        }
        .tips-title { 
          color: #1e293b; 
          font-size: 18px; 
          font-weight: 600; 
          margin-bottom: 12px; 
        }
        .tips-list { 
          color: #475569; 
          margin: 0; 
          padding-left: 20px; 
        }
        .tips-list li { 
          margin-bottom: 8px; 
        }
        .button { 
          display: inline-block; 
          background: #3b82f6; 
          color: white; 
          padding: 14px 28px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          margin: 24px 0; 
        }
        .footer { 
          color: #64748b; 
          font-size: 14px; 
          margin-top: 32px; 
          padding-top: 20px; 
          border-top: 1px solid #e2e8f0; 
        }
        .emoji { 
          font-size: 20px; 
        }
        .highlight {
          background: #fef3c7;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">Hi ${name}! <span class="emoji">👋</span></div>
          
          <div class="text">
            We noticed you haven't made any submissions on Codeforces in the last <span class="highlight">7 days</span>. 
            Consistent practice is the key to improving your programming skills and achieving your coding goals!
          </div>
          
          <div class="tips-box">
            <div class="tips-title"><span class="emoji">💡</span> Quick Tips to Get Back on Track:</div>
            <ul class="tips-list">
              <li><strong>Start Small:</strong> Begin with easier problems to build momentum and confidence</li>
              <li><strong>Daily Habit:</strong> Set aside just 30 minutes daily for focused practice</li>
              <li><strong>Learn Deeply:</strong> Focus on understanding solutions, not just solving quickly</li>
              <li><strong>Review & Reflect:</strong> Analyze your previous submissions to learn from mistakes</li>
              <li><strong>Join Contests:</strong> Participate in virtual contests to simulate real competition</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="https://codeforces.com/problemset" class="button">
              Start Solving Problems <span class="emoji">🎯</span>
            </a>
          </div>
          
          <div class="text" style="margin-top: 24px;">
            <strong>Remember:</strong> Every expert was once a beginner. Every professional was once an amateur. 
            The key is to <em>never stop learning and practicing</em>!
          </div>
          
          <div class="footer">
            This is reminder #${reminderCount}. Keep coding and keep growing! <span class="emoji">🚀</span>
            <br><br>
            <em>Sent with ❤️ from your Student Progress Management System</em>
            <br>
            <small style="color: #94a3b8;">
              Don't want to receive these emails? Contact your instructor to disable notifications.
            </small>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Plain text version for email clients that don't support HTML
  const text = `
Hi ${name}!

We noticed you haven't made any submissions on Codeforces in the last 7 days. 
Consistent practice is key to improving your programming skills!

Quick Tips:
• Start with easier problems to build momentum
• Set aside 30 minutes daily for practice
• Focus on understanding solutions, not just solving
• Review your previous submissions to learn from mistakes
• Join virtual contests to simulate real competition

Visit https://codeforces.com/problemset to start solving problems.

Remember: Every expert was once a beginner. The key is to never stop learning!

This is reminder #${reminderCount}. Keep coding and keep growing!

Sent from your Student Progress Management System
  `;

  try {
    await transporter.sendMail({
      from: {
        name: 'Student Progress Management',
        address: process.env.SMTP_FROM || 'noreply@yourapp.com'
      },
      to: email,
      subject,
      html,
      text,
    });
    
    console.log(`Reminder email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email with SMTP:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    
    return { success: false, error };
  }
}

// Test email function for development
export async function sendTestEmail(email: string) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Test</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .content { color: #374151; line-height: 1.6; }
        .success { background: #dcfce7; border: 1px solid #16a34a; color: #15803d; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">🎉 Email Configuration Test</div>
        <div class="content">
          <div class="success">
            <strong>✅ Success!</strong> Your SMTP configuration with SendGrid is working correctly.
          </div>
          <p>If you're receiving this email, it means:</p>
          <ul>
            <li>Your SendGrid SMTP credentials are properly configured</li>
            <li>Your Student Progress Management System can send emails</li>
            <li>Reminder emails will work for inactive students</li>
          </ul>
          <p>Your system is ready to help track student progress and send automated reminders!</p>
        </div>
        <div class="footer">
          <em>Sent from Student Progress Management System</em><br>
          <small>Test email sent at ${new Date().toLocaleString()}</small>
        </div>
      </div>
    </body>
  </html>
  `;

  const text = `
Email Configuration Test

✅ Success! Your SMTP configuration with SendGrid is working correctly.

If you're receiving this email, it means:
• Your SendGrid SMTP credentials are properly configured
• Your Student Progress Management System can send emails
• Reminder emails will work for inactive students

Your system is ready to help track student progress!

Sent from Student Progress Management System
Test email sent at ${new Date().toLocaleString()}
  `;

  try {
    await transporter.sendMail({
      from: {
        name: 'Student Progress Management',
        address: process.env.SMTP_FROM || 'noreply@yourapp.com'
      },
      to: email,
      subject: 'Test Email - Student Progress Management System ✅',
      html,
      text,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Test email failed:', error);
    return { success: false, error };
  }
}