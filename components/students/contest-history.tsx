"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Contest {
  _id: string;
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  participationType: string;
  problemsSolved: number;
  totalProblems: number;
  contestTime: string;
}

interface ContestHistoryProps {
  studentId: string;
}

export function ContestHistory({ studentId }: ContestHistoryProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [filteredContests, setFilteredContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDays, setFilterDays] = useState('365');

  useEffect(() => {
    fetchContests();
  }, [studentId]);

  useEffect(() => {
    filterContests();
  }, [contests, filterDays]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/${studentId}/contests`);
      if (response.ok) {
        const data = await response.json();
        setContests(data || []);
      } else {
        console.error('Failed to fetch contests:', response.status);
        setContests([]);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
      setContests([]);
      toast.error('Failed to fetch contest history');
    } finally {
      setLoading(false);
    }
  };

  const filterContests = () => {
    const days = parseInt(filterDays);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered = contests.filter(contest => 
      new Date(contest.contestTime) >= cutoffDate
    );

    setFilteredContests(filtered.sort((a, b) => 
      new Date(b.contestTime).getTime() - new Date(a.contestTime).getTime()
    ));
  };

  const chartData = filteredContests
    .slice()
    .reverse()
    .map(contest => ({
      date: format(new Date(contest.contestTime), 'MMM dd'),
      rating: contest.newRating,
      change: contest.ratingChange,
    }));

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
              <CardTitle>Contest History</CardTitle>
              <CardDescription>
                Track rating changes and contest performance over time
              </CardDescription>
            </div>
            <Select value={filterDays} onValueChange={setFilterDays}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last 365 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Rating Chart */}
      {filteredContests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `Rating: ${value}`,
                      name === 'rating' ? 'Rating' : 'Change'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contest List */}
      <Card>
        <CardHeader>
          <CardTitle>Contest Results</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContests.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contest</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContests.map((contest) => (
                    <TableRow key={contest._id}>
                      <TableCell className="max-w-[200px] truncate">
                        {contest.contestName}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {format(new Date(contest.contestTime), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">#{contest.rank}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{contest.newRating}</span>
                          <span className="text-xs text-muted-foreground">
                            from {contest.oldRating}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={contest.ratingChange >= 0 ? 'default' : 'destructive'}
                        >
                          {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No contests found for the selected time period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}