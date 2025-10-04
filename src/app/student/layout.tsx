'use client';

import DashboardLayout from "@/components/shared/DashboardLayout";
import {
  MdHome,
  MdLibraryBooks,
  MdQuiz,
  MdPerson,
  MdShuffle,
  } from "react-icons/md";

const studentMenuItems = [
  { label: "Tableau de bord", href: "/student/dashboard", icon: MdHome },
  { label: "Mes cours", href: "/student/courses", icon: MdLibraryBooks },
  { label: "Quiz disponibles", href: "/student/quizzes", icon: MdQuiz },
  { label: "Quiz de révision", href: "/student/revision-quiz", icon: MdShuffle },
   { label: "Examens", href: "/student/exams", icon: MdQuiz },
  // { label: "Planning", href: "/student/schedule", icon: MdCalendarToday },
  { label: "Profil", href: "/student/profile", icon: MdPerson },
];

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <DashboardLayout
      title="Espace Étudiant"
      subtitle="Gérez vos examens et suivez vos performances"
      requiredRole="STUDENT"
      menuItems={studentMenuItems}
    >
      {children}
    </DashboardLayout>
  );
}
