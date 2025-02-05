"use client";

import { useState } from "react";

import { ValidationRules } from "@/types/validation-rules";

interface FieldRules {
  [key: string]: ValidationRules;
}

interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = <T extends object>(
  initialState: T,
  validationRules: FieldRules
) => {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name: keyof T, value: any): string => {
    const rules = validationRules[name as string];
    if (!rules) return "";

    const stringValue = String(value);
    const fieldName = String(name);

    if (rules.required && !value) return `${fieldName} es requerido`;
    if (rules.minLength && stringValue.length < rules.minLength) return `${fieldName} mínimo ${rules.minLength} caracteres`;
    if (rules.maxLength && stringValue.length > rules.maxLength) return `${fieldName} máximo ${rules.maxLength} caracteres`;
    if (rules.pattern && !rules.pattern.test(stringValue)) return `Formato de ${fieldName} inválido`;
    if (rules.matches && value !== formData[rules.matches as keyof T]) return `${fieldName} no coincide`;

    if (rules.custom) {
      const customResult = rules.custom(value);

      if (typeof customResult === "string") return customResult;
      if (!customResult) return `${fieldName} es inválido`;
    }

    return "";
  };

  const handleChange = (name: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setErrors(prev => (prev[name as string]
      ? { ...prev, [name]: "" }
      : prev));
  };

  const validateForm = (): boolean => {
    const newErrors = Object.entries(validationRules).reduce((acc, [fieldName]) => {
      const error = validateField(fieldName as keyof T, formData[fieldName as keyof T]);
      return error ? { ...acc, [fieldName]: error } : acc;
    }, {} as ValidationErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    formData,
    errors,
    isLoading,
    setIsLoading,
    handleChange,
    validateForm,
    setFormData,
    setErrors,
  };
}
