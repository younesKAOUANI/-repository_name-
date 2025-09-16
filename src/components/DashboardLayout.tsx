'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { IconType } from 'react-icons';

interface MenuItem {
  label: string;
  href: string;
  icon: IconType;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  requiredRole: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  menuItems: MenuItem[];
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  requiredRole,
  menuItems
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/sign-in');
      return;
    }

    if (session.user.role !== requiredRole) {
      router.push('/auth/sign-in');
      return;
    }
  }, [session, status, router, requiredRole]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/pharmapedia-logo.png"
                  alt="Pharmapedia Logo"
                  width={120}
                  height={60}
                  className="object-contain"
                />
              </Link>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {session.user.email}
                </p>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/auth/sign-in' })}
              >
                Se déconnecter
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="py-4 border-t">
            <div className="flex space-x-1 overflow-x-auto">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium  hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500">
                © 2025 Pharmapedia. Tous droits réservés.
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <Link href="/support" className="hover:text-blue-600">
                Support
              </Link>
              <Link href="/privacy" className="hover:text-blue-600">
                Confidentialité
              </Link>
              <Link href="/terms" className="hover:text-blue-600">
                Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
