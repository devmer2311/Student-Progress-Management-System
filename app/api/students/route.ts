import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import { CodeforcesAPI } from '@/lib/codeforces';

export async function GET() {
  try {
    await connectToDatabase();
    const students = await Student.find({}).sort({ createdAt: -1 });
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    
    // Check if it's a MongoDB connection error
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        error: 'Database connection failed. Please ensure MongoDB is running on localhost:27017 or check your MONGODB_URI environment variable.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, codeforcesHandle, emailsEnabled } = body;

    // Validate required fields
    if (!name || !email || !phone || !codeforcesHandle) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if email or handle already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { codeforcesHandle }]
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this email or Codeforces handle already exists' }, 
        { status: 400 }
      );
    }

    // Fetch initial Codeforces data
    const userInfo = await CodeforcesAPI.getUserInfo(codeforcesHandle);
    
    const student = new Student({
      name,
      email,
      phone,
      codeforcesHandle,
      currentRating: userInfo?.rating || 0,
      maxRating: userInfo?.maxRating || 0,
      emailsEnabled: emailsEnabled ?? true,
    });

    await student.save();

    // Trigger initial data sync
    fetch(`${process.env.NEXTAUTH_URL}/api/sync/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student._id, handle: codeforcesHandle }),
    }).catch(err => console.error('Initial sync failed:', err));

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    
    // Check if it's a MongoDB connection error
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        error: 'Database connection failed. Please ensure MongoDB is running on localhost:27017 or check your MONGODB_URI environment variable.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}