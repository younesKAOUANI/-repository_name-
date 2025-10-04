'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface AlertDialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextType | null>(null);

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open = false, onOpenChange, children }: AlertDialogProps) {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

interface AlertDialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export function AlertDialogContent({ className, children }: AlertDialogContentProps) {
  const context = React.useContext(AlertDialogContext);
  
  if (!context) {
    throw new Error('AlertDialogContent must be used within an AlertDialog');
  }

  if (!context.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Dialog */}
      <div className={cn(
        "relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6",
        className
      )}>
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

export function AlertDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h2>
  );
}

export function AlertDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm text-gray-600 mt-2", className)}>
      {children}
    </p>
  );
}

export function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-2 justify-end mt-6", className)}>
      {children}
    </div>
  );
}

interface AlertDialogActionProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function AlertDialogAction({ onClick, disabled, className, children }: AlertDialogActionProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </Button>
  );
}

interface AlertDialogCancelProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function AlertDialogCancel({ onClick, disabled, children }: AlertDialogCancelProps) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}