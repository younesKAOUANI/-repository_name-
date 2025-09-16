'use client'

import React, { useState } from 'react';
import { Menu, X, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeVariants, slideVariants, bounceVariants, staggerContainer, staggerItem } from '@/lib/animations';
import NavLink from './NavLink';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeaderProps {
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Navigation links array
    const navLinks = [
        { href: '#', label: 'Accueil', isActive: true },
        { href: '#', label: 'Présentation', isActive: false },
        { href: '#', label: 'Cours', isActive: false },
        { href: '#', label: 'Quiz', isActive: false },
        { href: '#', label: 'À propos', isActive: false },
        { href: '#', label: 'Contact', isActive: false }
    ];

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
            className={`max-w-7xl mx-auto  ${className}`}
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
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center my-4 text-sm">
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
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 bg-pharmapedia-secondary rounded-lg uppercase">
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

                    {/* Se connecter Button */}
                    <motion.div 
                        className="hidden md:flex items-center space-x-4"
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.4 }}
                    >
                        <Link href="/auth/sign-in">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button 
                                    variant="secondary"
                                    className="text-white hover:text-pharmapedia-accent border border-white/20 bg-transparent uppercase font-medium"
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
                                    className="bg-white hover:bg-pharmapedia-accent text-black uppercase font-medium"
                                >
                                    S'inscrire
                                </Button>
                            </motion.div>
                        </Link>
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
                            className="text-white hover:text-pharmapedia-accent p-2"
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
                                    className="text-gray-700 hover:text-pharmapedia-primary block px-3 py-2 rounded-md text-base font-medium"
                                    isActive={link.isActive}
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                            
                            {/* Mobile Formations Link */}
                            <NavLink
                                href="#"
                                onClick={closeMobileMenu}
                                className="text-gray-700 hover:text-pharmapedia-primary block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Formations
                            </NavLink>
                            <Link href="/auth/sign-in" className="block mt-4">
                                <motion.div
                                    variants={staggerItem}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button 
                                        variant="secondary"
                                        fullWidth
                                        className="text-gray-700 hover:text-pharmapedia-primary border border-gray-300"
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
                                        className="bg-pharmapedia-primary hover:bg-pharmapedia-accent text-white"
                                    >
                                        S'inscrire
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;