"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Target, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface ProblemStats {
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

interface ProblemAnalyticsProps {
  studentId: string;
}

export function ProblemAnalytics({ studentId }: ProblemAnalyticsProps) {
  const [stats, setStats] = useState<ProblemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterDays, setFilterDays] = useState('30');

  useEffect(() => {
    fetchStats();
  }, [studentId, filterDays]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/students/${studentId}/problems?days=${filterDays}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch problem stats:', response.status);
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching problem stats:', error);
      setStats(null);
      toast.error('Failed to fetch problem statistics');
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats ? Object.entries(stats.ratingDistribution).map(([range, count]) => ({
    range,
    count,
  })) : [];

  // Generate heatmap data for the last 49 days (7x7 grid)
  const generateHeatmapData = () => {
    if (!stats) return [];
    
    const heatmapData = [];
    const today = new Date();
    
    for (let i = 48; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const submissions = stats.submissionHeatmap[dateString] || 0;
      
      heatmapData.push({
        date: dateString,
        day: date.getDay(),
        week: Math.floor(i / 7),
        submissions,
        intensity: Math.min(submissions / 3, 1), // Normalize intensity
      });
    }
    
    return heatmapData;
  };

  const heatmapData = generateHeatmapData();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Problem Solving Analytics</CardTitle>
              <CardDescription>
                Detailed insights into problem solving patterns and progress
              </CardDescription>
            </div>
            <Select value={filterDays} onValueChange={setFilterDays}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProblems}</div>
              <p className="text-xs text-muted-foreground">
                Unique problems solved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                Of solved problems
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProblemsPerDay}</div>
              <p className="text-xs text-muted-foreground">
                Problems per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hardest Problem</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.mostDifficultProblem?.rating || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {stats.mostDifficultProblem?.name || 'No rated problems'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution Chart */}
      {stats && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Problems by Rating</CardTitle>
            <CardDescription>
              Distribution of problems solved across different rating ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Heatmap */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Submission Activity</CardTitle>
            <CardDescription>
              Daily submission activity over the last 7 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="grid grid-cols-7 gap-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-xs text-center text-muted-foreground h-4">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {heatmapData.map((cell, index) => (
                  <div
                    key={index}
                    className={`h-3 w-full rounded-sm border ${
                      cell.submissions === 0
                        ? 'bg-muted'
                        : cell.submissions === 1
                        ? 'bg-green-100 dark:bg-green-900'
                        : cell.submissions === 2
                        ? 'bg-green-200 dark:bg-green-800'
                        : 'bg-green-300 dark:bg-green-700'
                    }`}
                    title={`${cell.date}: ${cell.submissions} submissions`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="h-3 w-3 rounded-sm bg-muted border"></div>
                  <div className="h-3 w-3 rounded-sm bg-green-100 dark:bg-green-900 border"></div>
                  <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-800 border"></div>
                  <div className="h-3 w-3 rounded-sm bg-green-300 dark:bg-green-700 border"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!stats && (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            No problem solving data available for the selected time period.
          </CardContent>
        </Card>
      )}
    </div>
  );
}