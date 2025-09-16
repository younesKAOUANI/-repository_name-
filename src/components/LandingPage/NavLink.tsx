'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { staggerItem } from '@/lib/animations';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ 
    href, 
    children, 
    onClick, 
    className = "text-white hover:text-pharmapedia-accent px-3 py-2 rounded-md text-md font-medium transition-colors",
    isActive = false 
}) => {
    return (
        <motion.a
            href={href}
            className={`${className} ${isActive ? 'text-pharmapedia-accent' : ''}`}
            variants={staggerItem}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={onClick}
        >
            {children}
        </motion.a>
    );
};

export default NavLink;
