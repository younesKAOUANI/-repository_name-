'use client';

/**
 * Admin Layout Component
 * Provides consistent layout and navigation for all admin pages
 */

import DashboardLayout from '@/components/shared/DashboardLayout';
import {
  MdSpaceDashboard,
  MdPeople,
  MdSchool,
  MdMenuBook,
  MdQuiz,
  MdCardMembership,
  MdBarChart,
  MdSettings,
  MdContactSupport
} from "react-icons/md";

const adminMenuItems = [
  { label: 'Tableau de bord', href: '/admin/dashboard', icon: MdSpaceDashboard },
  { label: 'Utilisateurs', href: '/admin/users', icon: MdPeople },
  { label: 'Universités / Cours', href: '/admin/universities', icon: MdSchool },
  { label: 'Modules', href: '/admin/modules', icon: MdMenuBook },
  { label: 'Examens', href: '/admin/quizzes', icon: MdQuiz },
  { label: 'Licences', href: '/admin/licenses', icon: MdCardMembership },
  { label: 'Contact', href: '/admin/contact', icon: MdContactSupport },
  { label: 'Paramètres', href: '/admin/settings', icon: MdSettings },
];

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      requiredRole="ADMIN"
      menuItems={adminMenuItems}
    >
      {children}
    </DashboardLayout>
  );
}
