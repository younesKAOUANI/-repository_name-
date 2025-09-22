/**
 * Teacher Layout Component
 * Provides consistent layout and navigation for all teacher pages
 */

import DashboardLayout from '@/components/DashboardLayout';
import { 
  MdHome,
  MdMenuBook,
  MdAdd,
  MdQuiz,
  MdLibraryBooks,
  MdPeople,
  MdBarChart,
  MdPerson
} from "react-icons/md";

const teacherMenuItems = [
  { label: 'Tableau de bord', href: '/teacher/dashboard', icon: MdHome },
  { label: 'Modules', href: '/teacher/modules', icon: MdMenuBook },
  { label: 'Quiz', href: '/teacher/quizzes', icon: MdQuiz },
  { label: 'Mes cours', href: '/teacher/courses', icon: MdLibraryBooks },
  { label: 'Étudiants', href: '/teacher/students', icon: MdPeople },
  { label: 'Résultats', href: '/teacher/results', icon: MdBarChart },
  { label: 'Profil', href: '/teacher/profile', icon: MdPerson },
];

interface TeacherLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function TeacherLayout({ title, subtitle, children }: TeacherLayoutProps) {
  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      requiredRole="INSTRUCTOR"
      menuItems={teacherMenuItems}
    >
      {children}
    </DashboardLayout>
  );
}
