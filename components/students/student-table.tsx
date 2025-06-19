"use client"

import { useState, useEffect } from 'react';
import { Plus, Download, Edit, Trash2, Eye, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentDialog } from './student-dialog';
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
}

interface StudentTableProps {
  onViewStudent: (studentId: string) => void;
}

export function StudentTable({ onViewStudent }: StudentTableProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setConnectionError(null);
      const response = await fetch('/api/students');
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        const errorData = await response.json();
        if (response.status === 503) {
          setConnectionError(errorData.error);
          toast.error('Database connection failed');
        } else {
          toast.error(errorData.error || 'Failed to fetch students');
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setConnectionError('Failed to connect to the server. Please check if the application is running properly.');
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStudents(students.filter(s => s._id !== id));
        toast.success('Student deleted successfully');
      } else {
        toast.error('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleRefreshData = async (studentId: string, handle: string) => {
    setRefreshing(studentId);
    try {
      const response = await fetch('/api/sync/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, handle }),
      });

      if (response.ok) {
        toast.success('Data refreshed successfully');
        fetchStudents();
      } else {
        toast.error('Failed to refresh data');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(null);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Codeforces Handle', 'Current Rating', 'Max Rating', 'Last Update', 'Reminder Count'],
      ...students.map(student => [
        student.name,
        student.email,
        student.phone,
        student.codeforcesHandle,
        student.currentRating.toString(),
        student.maxRating.toString(),
        new Date(student.lastDataUpdate).toLocaleDateString(),
        student.reminderCount.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStudentUpdated = () => {
    fetchStudents();
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (connectionError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Error</CardTitle>
          <CardDescription>
            Unable to connect to the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{connectionError}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">To resolve this issue:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Ensure MongoDB is running on localhost:27017</li>
              <li>• Check your MONGODB_URI in .env.local</li>
              <li>• Verify your database connection settings</li>
            </ul>
          </div>
          <Button onClick={fetchStudents} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Manage student information and track their Codeforces progress
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleAddStudent} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>CF Handle</TableHead>
                  <TableHead className="hidden lg:table-cell">Current Rating</TableHead>
                  <TableHead className="hidden lg:table-cell">Max Rating</TableHead>
                  <TableHead className="hidden xl:table-cell">Last Update</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{student.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.codeforcesHandle}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={student.currentRating >= 1200 ? 'default' : 'secondary'}>
                        {student.currentRating}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={student.maxRating >= 1400 ? 'default' : 'secondary'}>
                        {student.maxRating}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {student.lastDataUpdate ? formatDistanceToNow(new Date(student.lastDataUpdate), { addSuffix: true }) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewStudent(student._id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRefreshData(student._id, student.codeforcesHandle)}
                            disabled={refreshing === student._id}
                          >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing === student._id ? 'animate-spin' : ''}`} />
                            Refresh Data
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteStudent(student._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {students.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No students found. Add your first student to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={editingStudent}
        onStudentUpdated={handleStudentUpdated}
      />
    </div>
  );
}