import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import { sendReminderEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const student = await Student.findById(params.id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!student.emailsEnabled) {
      return NextResponse.json({ 
        error: 'Email notifications are disabled for this student' 
      }, { status: 400 });
    }

    // Send reminder email
    const emailResult = await sendReminderEmail(
      student.email,
      student.name,
      student.reminderCount + 1
    );

    if (emailResult.success) {
      // Increment reminder count
      await Student.findByIdAndUpdate(params.id, {
        $inc: { reminderCount: 1 }
      });

      return NextResponse.json({
        message: 'Reminder email sent successfully',
        reminderCount: student.reminderCount + 1
      });
    } else {
      console.error('Failed to send reminder email:', emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send reminder email',
        details: 'Please check your SMTP configuration'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending manual reminder:', error);
    
    // Check if it's a MongoDB connection error
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        error: 'Database connection failed. Please ensure MongoDB is running.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to send reminder email' 
    }, { status: 500 });
  }
}