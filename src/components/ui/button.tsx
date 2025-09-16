'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none relative overflow-hidden active:scale-[0.98] hover:cursor-pointer",
  {
    variants: {
      variant: {
        // Primary variant - solid blue background
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/20 shadow-sm hover:shadow-md disabled:bg-blue-300 disabled:hover:bg-blue-300",
        
        // Secondary variant - outlined style
        secondary: "border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500/20 disabled:border-blue-200 disabled:text-blue-300 disabled:hover:bg-transparent",
        
        // Ghost variant - minimal styling
        ghost: "text-gray-700 bg-transparent hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500/20 disabled:text-gray-400 disabled:hover:bg-transparent",
        
        // Destructive variant
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20 shadow-sm hover:shadow-md disabled:bg-red-300",
        
        // Success variant  
        success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/20 shadow-sm hover:shadow-md disabled:bg-green-300",
        
        // Warning variant
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500/20 shadow-sm hover:shadow-md disabled:bg-yellow-300",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 py-3 text-base rounded-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && "w-full",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Left Icon or Loading Spinner */}
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex items-center">{leftIcon}</span>
        ) : null}
        
        {/* Button Content */}
        {children}
        
        {/* Right Icon */}
        {rightIcon && !loading && (
          <span className="flex items-center">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
