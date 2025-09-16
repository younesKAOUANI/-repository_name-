'use client';

import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  match?: string; // field name to match against
}

interface FormField {
  value: string;
  error: string;
  touched: boolean;
}

interface UseFormProps<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule>>;
  onSubmit?: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormProps<T>) {
  const [fields, setFields] = useState<Record<keyof T, FormField>>(() => {
    const initialFields: any = {};
    Object.keys(initialValues).forEach((key) => {
      initialFields[key] = {
        value: initialValues[key],
        error: '',
        touched: false,
      };
    });
    return initialFields;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: keyof T, value: string): string => {
    const rules = validationRules[name];
    if (!rules) return '';

    // Required validation
    if (rules.required && !value.trim()) {
      return `${String(name)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value.trim() && !rules.required) return '';

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `${String(name)} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${String(name)} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${String(name)} format is invalid`;
    }

    // Match validation (for password confirmation, etc.)
    if (rules.match) {
      const matchField = fields[rules.match as keyof T];
      if (matchField && value !== matchField.value) {
        return `${String(name)} must match ${String(rules.match)}`;
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) return customError;
    }

    return '';
  }, [fields, validationRules]);

  const setValue = useCallback((name: keyof T, value: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: validateField(name, value),
        touched: true,
      }
    }));
  }, [validateField]);

  const setError = useCallback((name: keyof T, error: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error,
      }
    }));
  }, []);

  const clearError = useCallback((name: keyof T) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error: '',
      }
    }));
  }, []);

  const validateAllFields = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    Object.keys(fields).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, fields[fieldName].value);
      newFields[fieldName] = {
        ...newFields[fieldName],
        error,
        touched: true,
      };
      if (error) isValid = false;
    });

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateAllFields()) return;
    
    setIsSubmitting(true);
    try {
      const values: any = {};
      Object.keys(fields).forEach((key) => {
        values[key] = fields[key as keyof T].value;
      });
      
      await onSubmit?.(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, validateAllFields, onSubmit]);

  const reset = useCallback(() => {
    setFields(() => {
      const resetFields: any = {};
      Object.keys(initialValues).forEach((key) => {
        resetFields[key] = {
          value: initialValues[key],
          error: '',
          touched: false,
        };
      });
      return resetFields;
    });
  }, [initialValues]);

  // Helper to get field props for Input component
  const getFieldProps = useCallback((name: keyof T) => ({
    value: fields[name].value,
    error: fields[name].touched ? fields[name].error : '',
    onValueChange: (value: string) => setValue(name, value),
  }), [fields, setValue]);

  // Computed values
  const values = Object.keys(fields).reduce((acc, key) => {
    acc[key as keyof T] = fields[key as keyof T].value as T[keyof T];
    return acc;
  }, {} as T);

  const errors = Object.keys(fields).reduce((acc, key) => {
    acc[key as keyof T] = fields[key as keyof T].error;
    return acc;
  }, {} as Record<keyof T, string>);

  const isValid = Object.values(fields).every(field => !field.error);
  const isDirty = Object.values(fields).some(field => field.touched);

  return {
    values,
    errors,
    fields,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setError,
    clearError,
    handleSubmit,
    reset,
    getFieldProps,
    validateField,
  };
}
