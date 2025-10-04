# Pharmapedia Design System - Color Scheme

## Overview
This document outlines the consistent color scheme implemented across the Pharmapedia landing page and application, designed to create a cohesive visual experience that aligns with medical and educational themes.

## Color Palette

### Primary Colors (Blue Family)
- **Primary Blue 500**: `#3b82f6` - Main brand color
- **Primary Blue 600**: `#2563eb` - Dark variant for hover states
- **Primary Blue 700**: `#1d4ed8` - Darker variant for emphasis
- **Primary Blue 50**: `#eff6ff` - Light backgrounds

**Usage:**
- Main navigation
- Primary buttons (CTA)
- Brand elements
- Links and interactive elements

### Secondary Colors (Sky Family)
- **Secondary Sky 500**: `#0ea5e9` - Supporting brand color
- **Secondary Sky 600**: `#0284c7` - Dark variant
- **Secondary Sky 100**: `#e0f2fe` - Light backgrounds
- **Secondary Sky 200**: `#bae6fd` - Subtle accents

**Usage:**
- Gradients (combined with primary)
- Supporting UI elements
- Secondary buttons
- Info states

### Accent Colors (Amber Family)
- **Accent Amber 500**: `#f59e0b` - Highlight color
- **Accent Amber 600**: `#d97706` - Main accent
- **Accent Amber 400**: `#fbbf24` - Light variant
- **Accent Amber 300**: `#fcd34d` - Very light variant

**Usage:**
- Call-to-action highlights
- Important notifications
- Success states
- Premium features
- Hover effects on buttons

### Neutral Colors (Gray Family)
- **Gray 50**: `#f9fafb` - Very light backgrounds
- **Gray 100**: `#f3f4f6` - Light backgrounds
- **Gray 600**: `#4b5563` - Body text
- **Gray 700**: `#374151` - Headings
- **Gray 800**: `#1f2937` - Dark text
- **Gray 900**: `#111827` - Very dark text/backgrounds

## Implementation Guidelines

### Component Colors
1. **Hero Section**: Primary blue gradients with amber accents
2. **Navigation**: Primary blue background with amber hover states
3. **Cards/Reviews**: White backgrounds with blue borders and amber stars
4. **CTA Sections**: Blue to sky gradients with amber highlights
5. **Footer**: Dark gray with blue and amber accents

### Consistency Rules
1. All buttons use primary blue with hover states
2. Links use primary blue with amber hover
3. Success indicators use green from status colors
4. Error states use red from status colors
5. Gradients combine blue and sky, never mix with amber in gradients

### Medical Theme Alignment
- **Blue**: Trust, professionalism, medical authority
- **Sky**: Clarity, knowledge, fresh learning
- **Amber**: Achievement, success, highlighting important content
- **Gray**: Readability, professional text, neutral backgrounds

## File Structure
- `/src/lib/colors.ts` - Central color definitions
- `/src/app/globals.css` - CSS custom properties
- Individual components use Tailwind classes based on this system

## Dashboard Compatibility
This color scheme is designed to be compatible with:
- Admin dashboard (uses primary blue consistently)
- Student dashboard (uses sky blue as secondary)
- Teacher dashboard (maintains professional blue theme)

The colors ensure visual continuity between the landing page and internal application interfaces while maintaining accessibility and professional appearance suitable for medical education.