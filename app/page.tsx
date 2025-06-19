"use client"

import { useState } from 'react';
import { Header } from '@/components/header';
import { StudentTable } from '@/components/students/student-table';
import { StudentProfile } from '@/components/students/student-profile';

export default function Home() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const handleViewStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleBackToList = () => {
    setSelectedStudentId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedStudentId ? (
          <StudentProfile 
            studentId={selectedStudentId} 
            onBack={handleBackToList}
          />
        ) : (
          <StudentTable onViewStudent={handleViewStudent} />
        )}
      </main>
    </div>
  );
}