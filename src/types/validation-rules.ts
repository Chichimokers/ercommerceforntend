export type ValidationRules = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  matches?: string;
  custom?: (value: any) => boolean | string;
};
