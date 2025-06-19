import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import { sendReminderEmail } from '@/lib/email';

export async function POST() {
  try {
    await connectToDatabase();
    const students = await Student.find({});

    let syncedCount = 0;
    let emailsSent = 0;

    for (const student of students) {
      try {
        // Sync student data
        const syncResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/sync/student`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            studentId: student._id, 
            handle: student.codeforcesHandle 
          }),
        });

        if (syncResponse.ok) {
          syncedCount++;
        }

        // Check for inactivity and send emails
        const updatedStudent = await Student.findById(student._id);
        if (updatedStudent && updatedStudent.emailsEnabled) {
          const lastSubmission = updatedStudent.lastSubmissionDate;
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          if (!lastSubmission || lastSubmission < sevenDaysAgo) {
            const emailResult = await sendReminderEmail(
              updatedStudent.email,
              updatedStudent.name,
              updatedStudent.reminderCount + 1
            );

            if (emailResult.success) {
              await Student.findByIdAndUpdate(updatedStudent._id, {
                $inc: { reminderCount: 1 }
              });
              emailsSent++;
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing student ${student._id}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Batch sync completed',
      syncedCount,
      emailsSent,
      totalStudents: students.length,
    });
  } catch (error) {
    console.error('Batch sync error:', error);
    return NextResponse.json({ error: 'Batch sync failed' }, { status: 500 });
  }
}