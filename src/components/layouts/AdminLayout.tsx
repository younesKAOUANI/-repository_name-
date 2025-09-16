/**
 * Admin Layout Component
 * Provides consistent layout and navigation for all admin pages
 */

import DashboardLayout from '@/components/DashboardLayout';
import { 
  MdSpaceDashboard,
  MdPeople,
  MdSchool,
  MdPerson,
  MdMenuBook,
  MdCardMembership,
  MdBarChart,
  MdSettings
} from "react-icons/md";

const adminMenuItems = [
  { label: 'Tableau de bord', href: '/admin/dashboard', icon: MdSpaceDashboard },
  { label: 'Utilisateurs', href: '/admin/users', icon: MdPeople },
  { label: 'Enseignants', href: '/admin/teachers', icon: MdSchool },
  { label: 'Étudiants', href: '/admin/students', icon: MdPerson },
  { label: 'Modules', href: '/admin/modules', icon: MdMenuBook },
  { label: 'Licences', href: '/admin/licenses', icon: MdCardMembership },
  { label: 'Statistiques', href: '/admin/stats', icon: MdBarChart },
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
