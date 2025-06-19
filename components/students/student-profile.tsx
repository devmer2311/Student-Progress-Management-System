"use client"

import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Target, Calendar, TrendingUp, Activity, Mail, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContestHistory } from './contest-history';
import { ProblemAnalytics } from './problem-analytics';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  codeforcesHandle: string;
  currentRating: number;
  maxRating: number;
  lastDataUpdate: string;
  reminderCount: number;
  emailsEnabled: boolean;
  lastSubmissionDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

export function StudentProfile({ studentId, onBack }: StudentProfileProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/students/${studentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch student: ${response.status}`);
      }
      
      const data = await response.json();
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student:', error);
      setError('Failed to fetch student details');
      toast.error('Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    if (!student) return;

    setSendingReminder(true);
    try {
      const response = await fetch(`/api/students/${studentId}/send-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Reminder email sent successfully! 📧');
        
        // Update the student's reminder count in the UI
        setStudent(prev => prev ? {
          ...prev,
          reminderCount: data.reminderCount
        } : null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to send reminder email');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder email');
    } finally {
      setSendingReminder(false);
    }
  };

  const isInactive = student?.lastSubmissionDate 
    ? Date.now() - new Date(student.lastSubmissionDate).getTime() > 7 * 24 * 60 * 60 * 1000
    : true;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-muted-foreground">{error || 'Student not found'}</p>
              <Button variant="outline" onClick={fetchStudent} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground">{student.email}</p>
          </div>
        </div>
        
        {/* Manual Reminder Button */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSendReminder}
            disabled={sendingReminder || !student.emailsEnabled}
            variant={isInactive ? "default" : "outline"}
            size="sm"
          >
            <Send className={`h-4 w-4 mr-2 ${sendingReminder ? 'animate-pulse' : ''}`} />
            {sendingReminder ? 'Sending...' : 'Send Reminder'}
          </Button>
          {!student.emailsEnabled && (
            <Badge variant="secondary" className="text-xs">
              Emails Disabled
            </Badge>
          )}
        </div>
      </div>

      {/* Reminder Info Card */}
      {isInactive && student.emailsEnabled && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Student appears inactive
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  No submissions in the last 7+ days. Consider sending a reminder email to encourage practice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.currentRating}</div>
            <Badge variant={student.currentRating >= 1200 ? 'default' : 'secondary'} className="mt-2">
              {student.currentRating >= 1600 ? 'Expert' : 
               student.currentRating >= 1400 ? 'Specialist' :
               student.currentRating >= 1200 ? 'Pupil' : 'Newbie'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Rating</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.maxRating}</div>
            <Badge variant={student.maxRating >= 1400 ? 'default' : 'secondary'} className="mt-2">
              Peak Performance
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reminders Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.reminderCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Emails {student.emailsEnabled ? 'enabled' : 'disabled'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isInactive ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">
                {isInactive ? 'Inactive' : 'Active'}
              </span>
            </div>
            {isInactive && (
              <div className="flex items-center space-x-1 mt-2">
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                <p className="text-xs text-muted-foreground">No recent submissions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Update Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last data update: {student.lastDataUpdate ? formatDistanceToNow(new Date(student.lastDataUpdate), { addSuffix: true }) : 'Never'}
              </span>
            </div>
            <Badge variant="outline">
              Handle: {student.codeforcesHandle}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Contest History and Problem Analytics */}
      <Tabs defaultValue="contests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contests">Contest History</TabsTrigger>
          <TabsTrigger value="problems">Problem Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contests" className="space-y-4">
          <ContestHistory studentId={studentId} />
        </TabsContent>
        
        <TabsContent value="problems" className="space-y-4">
          <ProblemAnalytics studentId={studentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}