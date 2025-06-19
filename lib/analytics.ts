import { ISubmission } from '@/models/Submission';
import { subDays, startOfDay, format } from 'date-fns';

export interface ProblemStats {
  totalProblems: number;
  averageRating: number;
  averageProblemsPerDay: number;
  mostDifficultProblem: {
    name: string;
    rating: number;
  } | null;
  ratingDistribution: { [key: string]: number };
  submissionHeatmap: { [key: string]: number };
}

export function calculateProblemStats(submissions: ISubmission[], days: number): ProblemStats {
  const startDate = startOfDay(subDays(new Date(), days));
  const filteredSubmissions = submissions.filter(sub => 
    new Date(sub.submissionTime) >= startDate && sub.verdict === 'OK'
  );

  // Get unique solved problems
  const solvedProblems = new Map();
  filteredSubmissions.forEach(sub => {
    const key = `${sub.contestId || ''}-${sub.problemName}`;
    if (!solvedProblems.has(key) || (sub.problemRating && sub.problemRating > (solvedProblems.get(key)?.rating || 0))) {
      solvedProblems.set(key, {
        name: sub.problemName,
        rating: sub.problemRating || 0,
        date: sub.submissionTime
      });
    }
  });

  const uniqueProblems = Array.from(solvedProblems.values());
  const totalProblems = uniqueProblems.length;
  
  // Calculate average rating
  const ratedProblems = uniqueProblems.filter(p => p.rating > 0);
  const averageRating = ratedProblems.length > 0 
    ? Math.round(ratedProblems.reduce((sum, p) => sum + p.rating, 0) / ratedProblems.length)
    : 0;

  // Calculate average problems per day
  const averageProblemsPerDay = totalProblems / days;

  // Find most difficult problem
  const mostDifficultProblem = ratedProblems.length > 0
    ? ratedProblems.reduce((max, p) => p.rating > max.rating ? p : max)
    : null;

  // Rating distribution
  const ratingBuckets = ['0-999', '1000-1199', '1200-1399', '1400-1599', '1600-1799', '1800-1999', '2000+'];
  const ratingDistribution: { [key: string]: number } = {};
  
  ratingBuckets.forEach(bucket => ratingDistribution[bucket] = 0);
  
  ratedProblems.forEach(problem => {
    const rating = problem.rating;
    if (rating < 1000) ratingDistribution['0-999']++;
    else if (rating < 1200) ratingDistribution['1000-1199']++;
    else if (rating < 1400) ratingDistribution['1200-1399']++;
    else if (rating < 1600) ratingDistribution['1400-1599']++;
    else if (rating < 1800) ratingDistribution['1600-1799']++;
    else if (rating < 2000) ratingDistribution['1800-1999']++;
    else ratingDistribution['2000+']++;
  });

  // Submission heatmap
  const submissionHeatmap: { [key: string]: number } = {};
  uniqueProblems.forEach(problem => {
    const date = format(new Date(problem.date), 'yyyy-MM-dd');
    submissionHeatmap[date] = (submissionHeatmap[date] || 0) + 1;
  });

  return {
    totalProblems,
    averageRating,
    averageProblemsPerDay: Math.round(averageProblemsPerDay * 100) / 100,
    mostDifficultProblem,
    ratingDistribution,
    submissionHeatmap
  };
}