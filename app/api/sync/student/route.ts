import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import Contest from '@/models/Contest';
import Submission from '@/models/Submission';
import { CodeforcesAPI } from '@/lib/codeforces';

export async function POST(request: NextRequest) {
  try {
    const { studentId, handle } = await request.json();

    await connectToDatabase();

    // Fetch student
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fetch Codeforces data
    const [userInfo, contests, submissions] = await Promise.all([
      CodeforcesAPI.getUserInfo(handle),
      CodeforcesAPI.getUserRating(handle),
      CodeforcesAPI.getUserSubmissions(handle),
    ]);

    // Update student ratings
    if (userInfo) {
      await Student.findByIdAndUpdate(studentId, {
        currentRating: userInfo.rating || 0,
        maxRating: userInfo.maxRating || 0,
        lastDataUpdate: new Date(),
      });
    }

    // Sync contests
    if (contests.length > 0) {
      for (const contest of contests) {
        await Contest.findOneAndUpdate(
          { studentId, contestId: contest.contestId },
          {
            contestName: contest.contestName,
            rank: contest.rank,
            oldRating: contest.oldRating,
            newRating: contest.newRating,
            ratingChange: contest.ratingChange,
            participationType: contest.participationType,
            contestTime: new Date(contest.ratingUpdateTimeSeconds * 1000),
          },
          { upsert: true }
        );
      }
    }

    // Sync submissions
    if (submissions.length > 0) {
      const lastSubmissionDate = Math.max(...submissions.map(s => s.creationTimeSeconds));
      
      for (const submission of submissions) {
        await Submission.findOneAndUpdate(
          { submissionId: submission.id },
          {
            studentId,
            contestId: submission.contestId,
            problemName: submission.problem.name,
            problemRating: submission.problem.rating,
            verdict: submission.verdict,
            programmingLanguage: submission.programmingLanguage,
            submissionTime: new Date(submission.creationTimeSeconds * 1000),
          },
          { upsert: true }
        );
      }

      // Update last submission date
      await Student.findByIdAndUpdate(studentId, {
        lastSubmissionDate: new Date(lastSubmissionDate * 1000),
      });
    }

    return NextResponse.json({ message: 'Sync completed successfully' });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}