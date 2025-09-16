/**
 * Animation Service using Framer Motion
 * Provides reusable animation variants and utilities for the Pharmapedia app
 */

import { Variants } from "framer-motion";

// ==========================================
// BASIC ANIMATION VARIANTS
// ==========================================

/**
 * Fade animations
 */
export const fadeVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.6
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.4
    }
  }
};

/**
 * Slide animations from different directions
 */
export const slideVariants = {
  fromLeft: {
    hidden: { 
      opacity: 0, 
      x: -100 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: {
        duration: 0.4
      }
    }
  },
  fromRight: {
    hidden: { 
      opacity: 0, 
      x: 100 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      x: 100,
      transition: {
        duration: 0.4
      }
    }
  },
  fromTop: {
    hidden: { 
      opacity: 0, 
      y: -100 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      y: -100,
      transition: {
        duration: 0.4
      }
    }
  },
  fromBottom: {
    hidden: { 
      opacity: 0, 
      y: 100 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      y: 100,
      transition: {
        duration: 0.4
      }
    }
  }
} satisfies Record<string, Variants>;

/**
 * Scale animations
 */
export const scaleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: {
      duration: 0.4
    }
  }
};

/**
 * Bounce animation for buttons and interactive elements
 */
export const bounceVariants: Variants = {
  rest: { 
    scale: 1 
  },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  },
  tap: { 
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

/**
 * Card hover animations
 */
export const cardVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.3
    }
  },
  hover: {
    scale: 1.02,
    y: -8,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      duration: 0.3
    }
  }
};

// ==========================================
// STAGGER ANIMATIONS
// ==========================================

/**
 * Container for stagger animations
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/**
 * Child items for stagger animations
 */
export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

// ==========================================
// PAGE TRANSITION ANIMATIONS
// ==========================================

/**
 * Page transition variants
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: -200,
    scale: 0.95
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6
    }
  },
  out: {
    opacity: 0,
    x: 200,
    scale: 0.95,
    transition: {
      duration: 0.4
    }
  }
};

// ==========================================
// QUIZ-SPECIFIC ANIMATIONS
// ==========================================

/**
 * Quiz question animations
 */
export const quizQuestionVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 100,
    rotateY: -90
  },
  visible: { 
    opacity: 1, 
    x: 0,
    rotateY: 0,
    transition: {
      duration: 0.8
    }
  },
  exit: { 
    opacity: 0, 
    x: -100,
    rotateY: 90,
    transition: {
      duration: 0.6
    }
  }
};

/**
 * Quiz answer option animations
 */
export const answerOptionVariants: Variants = {
  rest: {
    scale: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(156, 163, 175, 0.3)"
  },
  hover: {
    scale: 1.02,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.5)",
    transition: {
      duration: 0.2
    }
  },
  selected: {
    scale: 1.02,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.8)",
    transition: {
      duration: 0.3
    }
  },
  correct: {
    scale: 1.05,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: "rgba(34, 197, 94, 1)",
    transition: {
      duration: 0.4
    }
  },
  incorrect: {
    scale: 0.98,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.8)",
    transition: {
      duration: 0.4
    }
  }
};

// ==========================================
// LOADING ANIMATIONS
// ==========================================

/**
 * Loading spinner variants
 */
export const spinnerVariants: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

/**
 * Pulse animation for loading states
 */
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity
    }
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Creates stagger animation for lists
 */
export const createStaggerAnimation = (
  staggerDelay: number = 0.1,
  childDelay: number = 0
) => ({
  container: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay
      }
    }
  },
  item: {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }
});

// ==========================================
// ANIMATION PRESETS
// ==========================================

/**
 * Common animation presets for different UI elements
 */
export const animationPresets = {
  // Card animations
  card: cardVariants,
  
  // Button animations
  button: bounceVariants,
  
  // Page transitions
  page: pageVariants,
  
  // Quiz elements
  quiz: {
    question: quizQuestionVariants,
    option: answerOptionVariants
  },
  
  // Loading states
  loading: {
    spinner: spinnerVariants,
    pulse: pulseVariants
  },
  
  // Basic animations
  fade: fadeVariants,
  scale: scaleVariants,
  
  // Slide animations
  slide: slideVariants,
  
  // Stagger animations
  stagger: {
    container: staggerContainer,
    item: staggerItem
  }
};

export default animationPresets;
