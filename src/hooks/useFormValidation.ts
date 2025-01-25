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

    if (rules.required && !value) {
      return `${String(name)} es requerido`;
    }

    if (rules.minLength && String(value).length < rules.minLength) {
      return `${String(name)} mínimo ${rules.minLength} caracteres`;
    }

    if (rules.maxLength && String(value).length > rules.maxLength) {
      return `${String(name)} máximo ${rules.maxLength} caracteres`;
    }

    if (rules.pattern && !rules.pattern.test(String(value))) {
      return `Formato de ${String(name)} inválido`;
    }

    if (rules.matches && value !== formData[rules.matches as keyof T]) {
      return `${String(name)} no coincide`;
    }

    if (rules.custom) {
      const customResult = rules.custom(value);

      if (typeof customResult === "string") return customResult;
      if (!customResult) return `${String(name)} es inválido`;
    }

    return "";
  };

  const handleChange = (name: keyof T, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as string]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(
        fieldName as keyof T,
        formData[fieldName as keyof T]
      );

      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    return isValid;
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
