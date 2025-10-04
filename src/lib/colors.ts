/**
 * Pharmapedia Color Scheme
 * Consistent colors across the entire application
 */

export const colors = {
  // Primary Colors - Main brand colors
  primary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',  // Light blue
    200: '#bfdbfe',  // Medium light blue
    300: '#93c5fd',  // Medium blue
    400: '#60a5fa',  // Medium-dark blue
    500: '#3b82f6',  // Primary blue (main)
    600: '#2563eb',  // Dark blue
    700: '#1d4ed8',  // Darker blue
    800: '#1e40af',  // Very dark blue
    900: '#1e3a8a',  // Darkest blue
  },

  // Secondary Colors - Supporting medical/health theme
  secondary: {
    50: '#f0f9ff',   // Very light sky
    100: '#e0f2fe',  // Light sky
    200: '#bae6fd',  // Medium light sky
    300: '#7dd3fc',  // Medium sky
    400: '#38bdf8',  // Medium-dark sky
    500: '#0ea5e9',  // Secondary sky blue (main)
    600: '#0284c7',  // Dark sky
    700: '#0369a1',  // Darker sky
    800: '#075985',  // Very dark sky
    900: '#0c4a6e',  // Darkest sky
  },

  // Accent Colors - For highlights and CTAs
  accent: {
    50: '#fef3c7',   // Very light amber
    100: '#fde68a',  // Light amber
    200: '#fcd34d',  // Medium light amber
    300: '#fbbf24',  // Medium amber
    400: '#f59e0b',  // Medium-dark amber
    500: '#d97706',  // Accent amber (main)
    600: '#b45309',  // Dark amber
    700: '#92400e',  // Darker amber
    800: '#78350f',  // Very dark amber
    900: '#451a03',  // Darkest amber
  },

  // Neutral Colors - For text and backgrounds
  neutral: {
    50: '#f9fafb',   // Very light gray
    100: '#f3f4f6',  // Light gray
    200: '#e5e7eb',  // Medium light gray
    300: '#d1d5db',  // Medium gray
    400: '#9ca3af',  // Medium-dark gray
    500: '#6b7280',  // Main gray
    600: '#4b5563',  // Dark gray
    700: '#374151',  // Darker gray
    800: '#1f2937',  // Very dark gray
    900: '#111827',  // Darkest gray
  },

  // Status Colors
  success: {
    50: '#ecfdf5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },

  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Medical/Health specific colors
  medical: {
    // Green for health/success
    health: '#10b981',
    healthLight: '#6ee7b7',
    healthDark: '#047857',
    
    // Red for urgent/error
    urgent: '#ef4444',
    urgentLight: '#fca5a5',
    urgentDark: '#b91c1c',
    
    // Purple for premium/advanced features
    premium: '#8b5cf6',
    premiumLight: '#c4b5fd',
    premiumDark: '#7c3aed',
  }
};

// CSS Variables for easy use
export const cssVariables = `
  :root {
    /* Primary Colors */
    --color-primary-50: ${colors.primary[50]};
    --color-primary-100: ${colors.primary[100]};
    --color-primary-200: ${colors.primary[200]};
    --color-primary-300: ${colors.primary[300]};
    --color-primary-400: ${colors.primary[400]};
    --color-primary-500: ${colors.primary[500]};
    --color-primary-600: ${colors.primary[600]};
    --color-primary-700: ${colors.primary[700]};
    --color-primary-800: ${colors.primary[800]};
    --color-primary-900: ${colors.primary[900]};

    /* Secondary Colors */
    --color-secondary-50: ${colors.secondary[50]};
    --color-secondary-100: ${colors.secondary[100]};
    --color-secondary-200: ${colors.secondary[200]};
    --color-secondary-300: ${colors.secondary[300]};
    --color-secondary-400: ${colors.secondary[400]};
    --color-secondary-500: ${colors.secondary[500]};
    --color-secondary-600: ${colors.secondary[600]};
    --color-secondary-700: ${colors.secondary[700]};
    --color-secondary-800: ${colors.secondary[800]};
    --color-secondary-900: ${colors.secondary[900]};

    /* Accent Colors */
    --color-accent-50: ${colors.accent[50]};
    --color-accent-100: ${colors.accent[100]};
    --color-accent-200: ${colors.accent[200]};
    --color-accent-300: ${colors.accent[300]};
    --color-accent-400: ${colors.accent[400]};
    --color-accent-500: ${colors.accent[500]};
    --color-accent-600: ${colors.accent[600]};
    --color-accent-700: ${colors.accent[700]};
    --color-accent-800: ${colors.accent[800]};
    --color-accent-900: ${colors.accent[900]};
  }
`;

export default colors;