'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'outlined' | 'filled';
  error?: string;
  success?: boolean;
  label?: string;
  hint?: string;
  showPasswordToggle?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onValueChange?: (value: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      type = 'text',
      error,
      success,
      label,
      hint,
      showPasswordToggle = false,
      leftIcon,
      rightIcon,
      onValueChange,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type;

    // Base styles
    const baseStyles = "w-full transition-all duration-200 focus:outline-none";
    
    // Variant styles
    const variants = {
      default: cn(
        "px-3 py-2 border rounded-md bg-white",
        "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        success && "border-green-500 focus:border-green-500 focus:ring-green-500/20",
        disabled && "bg-gray-50 text-gray-500 cursor-not-allowed"
      ),
      outlined: cn(
        "px-3 py-3 border-2 rounded-lg bg-transparent",
        "border-gray-200 focus:border-blue-600",
        isFocused && "border-blue-600",
        error && "border-red-500 focus:border-red-500",
        success && "border-green-500 focus:border-green-500",
        disabled && "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
      ),
      filled: cn(
        "px-3 py-3 rounded-lg border-0",
        "bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20",
        error && "bg-red-50 focus:bg-red-50 focus:ring-red-500/20",
        success && "bg-green-50 focus:bg-green-50 focus:ring-green-500/20",
        disabled && "bg-gray-50 text-gray-400 cursor-not-allowed"
      ),
    };

    // Icon positioning styles
    const iconPadding = {
      left: leftIcon ? "pl-10" : "",
      right: (rightIcon || showPasswordToggle || error || success) ? "pr-10" : "",
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            type={inputType}
            className={cn(
              baseStyles,
              variants[variant],
              iconPadding.left,
              iconPadding.right,
              className
            )}
            ref={ref}
            disabled={disabled}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {/* Success Icon */}
            {success && !error && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            
            {/* Error Icon */}
            {error && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            
            {/* Password Toggle */}
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={disabled}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            
            {/* Custom Right Icon */}
            {rightIcon && !error && !success && (
              <div className="text-gray-400">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </p>
        )}

        {/* Hint Text */}
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
