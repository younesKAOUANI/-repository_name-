/**
 * Student Layout Component
 * Provides consistent layout and navigation for all student pages
 */

import DashboardLayout from '@/components/DashboardLayout';
import { 
  MdHome,
  MdLibraryBooks,
  MdQuiz,
  MdBarChart,
  MdCalendarToday,
  MdPerson
} from "react-icons/md";

const studentMenuItems = [
  { label: 'Tableau de bord', href: '/student/dashboard', icon: MdHome },
  { label: 'Mes cours', href: '/student/courses', icon: MdLibraryBooks },
  { label: 'Quiz disponibles', href: '/student/quizzes', icon: MdQuiz },
  { label: 'Mes résultats', href: '/student/results', icon: MdBarChart },
  { label: 'Planning', href: '/student/schedule', icon: MdCalendarToday },
  { label: 'Profil', href: '/student/profile', icon: MdPerson },
];

interface StudentLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function StudentLayout({ title, subtitle, children }: StudentLayoutProps) {
  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      requiredRole="STUDENT"
      menuItems={studentMenuItems}
    >
      {children}
    </DashboardLayout>
  );
}
