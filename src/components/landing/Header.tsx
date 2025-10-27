'use client'

import React, { useState, useEffect } from 'react';
import { Menu, X, Mail, Phone, User, BookOpen, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeVariants, slideVariants, bounceVariants, staggerContainer, staggerItem } from '@/lib/animations';
import NavLink from './NavLink';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

interface HeaderProps {
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data: session, status } = useSession();

    // Navigation links array
    const navLinks = [
        { href: '/', label: 'Accueil', isActive: true },
        { href: '/about', label: 'À propos', isActive: false },
        { href: '/contact', label: 'Contact', isActive: false }
    ];

    // Get dashboard route and label based on user role
    const getDashboardInfo = () => {
        if (!session?.user?.role) return null;
        
        switch (session.user.role) {
            case 'STUDENT':
                return {
                    route: '/student/dashboard',
                    label: 'Tableau de bord Étudiant',
                    icon: <BookOpen className="h-4 w-4" />
                };
            case 'INSTRUCTOR':
                return {
                    route: '/teacher/dashboard',
                    label: 'Tableau de bord Enseignant',
                    icon: <User className="h-4 w-4" />
                };
            case 'ADMIN':
                return {
                    route: '/admin/dashboard',
                    label: 'Tableau de bord Admin',
                    icon: <Settings className="h-4 w-4" />
                };
            default:
                return null;
        }
    };

    const dashboardInfo = getDashboardInfo();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close mobile menu when clicking on a link
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Close dropdown when clicking outside (you can implement useEffect with document click later)

    return (
        <motion.header 
            className={`container mx-auto  ${className}`}
            variants={slideVariants.fromTop}
            initial="hidden"
            animate="visible"
        >
            {/* Top Part - Logo and Contact Info */}
            <motion.div 
                className=""
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
            >
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4 text-sm">
                        {/* Logo */}
                        <motion.div 
                            className="flex-shrink-0"
                            variants={fadeVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                        >
                            <Image
                                src="/pharmapedia-logo.png"
                                alt="Pharmapedia Logo"
                                width={180}
                                height={100}
                            />
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div 
                            className="hidden md:flex items-center space-x-6 text-gray-600"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div 
                                className="flex items-center space-x-2 text-lg"
                                variants={staggerItem}
                            >
                                <Mail className="h-6 w-6" />
                                <span>contact@pharmapedia-dz.com</span>
                            </motion.div>
                            <motion.div 
                                className="flex items-center space-x-2 text-lg"
                                variants={staggerItem}
                            >
                                <Phone className="h-6 w-6" />
                                <span>(+213) 555-666-777</span>
                            </motion.div>
                        </motion.div>

                        {/* Mobile Contact (simplified) */}
                        <motion.div 
                            className="md:hidden text-gray-600"
                            variants={fadeVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.3 }}
                        >
                            <span className="text-xs">📞 +33 1 23 45 67 89</span>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Part - Navigation and Login */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 bg-pharmapedia-primary-600 rounded-lg uppercase">
                <div className="flex justify-between items-center h-16">
                    {/* Desktop Navigation */}
                    <motion.nav 
                        className="hidden md:flex "
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {navLinks.map((link, index) => (
                            <NavLink 
                                key={index}
                                href={link.href}
                                isActive={link.isActive}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    
                    </motion.nav>

                    {/* Authentication/Dashboard Buttons */}
                    <motion.div 
                        className="hidden md:flex items-center space-x-4"
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.4 }}
                    >
                        {status === 'loading' ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span className="text-white text-sm">Chargement...</span>
                            </div>
                        ) : session && dashboardInfo ? (
                            // User is authenticated - show dashboard button
                            <Link href={dashboardInfo.route}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button 
                                        variant="primary"
                                        className="bg-white hover:bg-amber-500 text-black uppercase font-medium flex items-center gap-2"
                                    >
                                        {dashboardInfo.icon}
                                        {dashboardInfo.label}
                                    </Button>
                                </motion.div>
                            </Link>
                        ) : (
                            // User is not authenticated - show login/signup buttons
                            <>
                                <Link href="/auth/sign-in">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button 
                                            variant="secondary"
                                            className="text-white hover:text-amber-400 border border-white/20 bg-transparent uppercase font-medium"
                                        >
                                            Se connecter
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href="/auth/sign-up">
                                    <motion.div
                                        variants={bounceVariants}
                                        initial="rest"
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <Button 
                                            variant="primary"
                                            className="bg-white hover:bg-amber-500 text-black uppercase font-medium"
                                        >
                                            S'inscrire
                                        </Button>
                                    </motion.div>
                                </Link>
                            </>
                        )}
                    </motion.div>

                    {/* Mobile menu button */}
                    <motion.div 
                        className="md:hidden"
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                    >
                        <motion.button
                            onClick={toggleMobileMenu}
                            className="text-white hover:text-amber-400 p-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: 0 }}
                                        animate={{ rotate: 180 }}
                                        exit={{ rotate: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X className="h-6 w-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 180 }}
                                        animate={{ rotate: 0 }}
                                        exit={{ rotate: 180 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Menu className="h-6 w-6" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </motion.div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        className="md:hidden"
                        variants={slideVariants.fromTop}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div 
                            className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {navLinks.map((link, index) => (
                                <NavLink
                                    key={index}
                                    href={link.href}
                                    onClick={closeMobileMenu}
                                    className="text-gray-700 hover:text-pharmapedia-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                                    isActive={link.isActive}
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                            
                            {/* Mobile Formations Link */}
                            <NavLink
                                href="#"
                                onClick={closeMobileMenu}
                                className="text-gray-700 hover:text-pharmapedia-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Formations
                            </NavLink>
                            {/* Mobile Authentication/Dashboard Buttons */}
                            {status === 'loading' ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pharmapedia-primary-600"></div>
                                    <span className="ml-2 text-gray-600">Chargement...</span>
                                </div>
                            ) : session && dashboardInfo ? (
                                // User is authenticated - show dashboard button
                                <Link href={dashboardInfo.route} className="block mt-4">
                                    <motion.div
                                        variants={staggerItem}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button 
                                            variant="primary"
                                            fullWidth
                                            className="bg-pharmapedia-primary-600 hover:bg-pharmapedia-accent-500 text-white flex items-center justify-center gap-2"
                                        >
                                            {dashboardInfo.icon}
                                            {dashboardInfo.label}
                                        </Button>
                                    </motion.div>
                                </Link>
                            ) : (
                                // User is not authenticated - show login/signup buttons
                                <>
                                    <Link href="/auth/sign-in" className="block mt-4">
                                        <motion.div
                                            variants={staggerItem}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button 
                                                variant="secondary"
                                                fullWidth
                                                className="text-gray-700 hover:text-pharmapedia-primary-600 border border-gray-300"
                                            >
                                                Se connecter
                                            </Button>
                                        </motion.div>
                                    </Link>
                                    <Link href="/auth/sign-up" className="block mt-2">
                                        <motion.div
                                            variants={staggerItem}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button 
                                                variant="primary"
                                                fullWidth
                                                className="bg-pharmapedia-primary-600 hover:bg-pharmapedia-accent-500 text-white"
                                            >
                                                S'inscrire
                                            </Button>
                                        </motion.div>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;