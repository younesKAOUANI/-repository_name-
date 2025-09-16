/**
 * Animated UI Components using the Animation Service
 * Ready-to-use components with built-in animations
 */

'use client';

import { motion, MotionProps, Variants } from "framer-motion";
import { ReactNode } from "react";
import { 
  fadeVariants, 
  slideVariants, 
  scaleVariants, 
  bounceVariants,
  cardVariants,
  staggerContainer,
  staggerItem,
  animationPresets
} from "@/lib/animations";

// ==========================================
// BASIC ANIMATED CONTAINERS
// ==========================================

interface AnimatedContainerProps extends MotionProps {
  children: ReactNode;
  className?: string;
  animationType?: 'fade' | 'slideFromLeft' | 'slideFromRight' | 'slideFromTop' | 'slideFromBottom' | 'scale';
}

/**
 * Generic animated container with common animation types
 */
export const AnimatedContainer = ({ 
  children, 
  className = "", 
  animationType = 'fade',
  ...motionProps 
}: AnimatedContainerProps) => {
  const getVariants = (): Variants => {
    switch (animationType) {
      case 'fade':
        return fadeVariants;
      case 'slideFromLeft':
        return slideVariants.fromLeft;
      case 'slideFromRight':
        return slideVariants.fromRight;
      case 'slideFromTop':
        return slideVariants.fromTop;
      case 'slideFromBottom':
        return slideVariants.fromBottom;
      case 'scale':
        return scaleVariants;
      default:
        return fadeVariants;
    }
  };

  return (
    <motion.div
      className={className}
      variants={getVariants()}
      initial="hidden"
      animate="visible"
      exit="exit"
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// ANIMATED BUTTON
// ==========================================

interface AnimatedButtonProps extends MotionProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * Animated button with hover and tap effects
 */
export const AnimatedButton = ({ 
  children, 
  className = "", 
  onClick,
  disabled = false,
  variant = 'primary',
  ...motionProps 
}: AnimatedButtonProps) => {
  const baseClasses = "px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500"
  };

  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`}
      variants={bounceVariants}
      initial="rest"
      whileHover={!disabled ? "hover" : "rest"}
      whileTap={!disabled ? "tap" : "rest"}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
};

// ==========================================
// ANIMATED CARD
// ==========================================

interface AnimatedCardProps extends MotionProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

/**
 * Animated card with hover effects
 */
export const AnimatedCard = ({ 
  children, 
  className = "", 
  hoverable = true,
  ...motionProps 
}: AnimatedCardProps) => {
  const baseClasses = "bg-white rounded-lg border border-gray-200 p-6";

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      variants={hoverable ? cardVariants : fadeVariants}
      initial={hoverable ? "rest" : "hidden"}
      animate={hoverable ? "rest" : "visible"}
      whileHover={hoverable ? "hover" : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// STAGGER LIST
// ==========================================

interface StaggerListProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
}

/**
 * Animated list with stagger effect
 */
export const StaggerList = ({ 
  children, 
  className = "", 
  itemClassName = "",
  staggerDelay = 0.1 
}: StaggerListProps) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={staggerItem}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// ==========================================
// PAGE TRANSITION WRAPPER
// ==========================================

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Page transition wrapper for route changes
 */
export const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
  return (
    <motion.div
      className={className}
      variants={animationPresets.page}
      initial="initial"
      animate="in"
      exit="out"
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// QUIZ-SPECIFIC COMPONENTS
// ==========================================

interface QuizQuestionProps {
  children: ReactNode;
  className?: string;
  questionNumber?: number;
}

/**
 * Animated quiz question container
 */
export const QuizQuestion = ({ 
  children, 
  className = "",
  questionNumber 
}: QuizQuestionProps) => {
  return (
    <motion.div
      className={`${className}`}
      variants={animationPresets.quiz.question}
      initial="hidden"
      animate="visible"
      exit="exit"
      key={questionNumber} // Important for proper animations between questions
    >
      {children}
    </motion.div>
  );
};

interface QuizOptionProps {
  children: ReactNode;
  className?: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  onClick?: () => void;
}

/**
 * Animated quiz option
 */
export const QuizOption = ({ 
  children, 
  className = "",
  isSelected = false,
  isCorrect = false,
  isIncorrect = false,
  onClick
}: QuizOptionProps) => {
  const getAnimationState = () => {
    if (isCorrect) return "correct";
    if (isIncorrect) return "incorrect";
    if (isSelected) return "selected";
    return "rest";
  };

  return (
    <motion.div
      className={`cursor-pointer p-4 rounded-lg border-2 ${className}`}
      variants={animationPresets.quiz.option}
      initial="rest"
      animate={getAnimationState()}
      whileHover={!isCorrect && !isIncorrect ? "hover" : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// LOADING COMPONENTS
// ==========================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Animated loading spinner
 */
export const LoadingSpinner = ({ size = 'md', className = "" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`border-2 border-gray-300 border-t-blue-600 rounded-full ${sizeClasses[size]} ${className}`}
      variants={animationPresets.loading.spinner}
      animate="spin"
    />
  );
};

interface PulseLoaderProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Pulse loading animation
 */
export const PulseLoader = ({ className = "", children }: PulseLoaderProps) => {
  return (
    <motion.div
      className={className}
      variants={animationPresets.loading.pulse}
      animate="pulse"
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// UTILITY COMPONENTS
// ==========================================

interface FadeInWhenVisibleProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
}

/**
 * Fade in when element becomes visible in viewport
 */
export const FadeInWhenVisible = ({ 
  children, 
  className = "",
  threshold = 0.1 
}: FadeInWhenVisibleProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 75 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
