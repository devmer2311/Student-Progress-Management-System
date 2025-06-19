import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Submission from '@/models/Submission';
import { calculateProblemStats } from '@/lib/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    await connectToDatabase();
    const submissions = await Submission.find({ studentId: params.id });
    
    const stats = calculateProblemStats(submissions, days);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error calculating problem stats:', error);
    return NextResponse.json({ error: 'Failed to calculate problem stats' }, { status: 500 });
  }
}