import { useState, useCallback } from 'react';
import { InputSanitizer } from '../utils/sanitizer';

export interface SanitizedInputOptions<T = string> {
  type?: 'text' | 'html' | 'email' | 'phone' | 'number' | 'url' | 'json';
  enableThreatDetection?: boolean;
  onThreatDetected?: (threats: string[]) => void;
  validateOnChange?: boolean;
  validator?: (value: T) => string | null;
}

export interface SanitizedInputResult<T = string> {
  value: T;
  setValue: (value: T) => void;
  threats: string[];
  hasThreats: boolean;
  error: string | null;
  isValid: boolean;
  reset: () => void;
}

export function useSanitizedInput<T = string>(
  initialValue: T,
  options: SanitizedInputOptions<T> = {}
): SanitizedInputResult<T> {
  const {
    type = 'text',
    enableThreatDetection = true,
    onThreatDetected = (threats) => console.warn('Security threats detected:', threats),
    validateOnChange = true,
    validator
  } = options;

  const [value, setValueState] = useState<T>(initialValue);
  const [threats, setThreats] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sanitizeValue = useCallback((input: any): T => {
    if (typeof input !== 'string') {
      return input;
    }

    let sanitized: string;

    switch (type) {
      case 'html':
        sanitized = InputSanitizer.sanitizeHtml(input);
        break;
      case 'email':
        sanitized = InputSanitizer.sanitizeEmail(input);
        break;
      case 'phone':
        sanitized = InputSanitizer.sanitizePhone(input);
        break;
      case 'number':
        sanitized = String(InputSanitizer.sanitizeNumber(input));
        break;
      case 'url':
        sanitized = InputSanitizer.sanitizeUrl(input);
        break;
      case 'json':
        sanitized = JSON.stringify(InputSanitizer.sanitizeJson(input));
        break;
      default:
        sanitized = InputSanitizer.sanitizeText(input);
    }

    return sanitized as T;
  }, [type]);

  const validate = useCallback((value: T): string | null => {
    if (validator) {
      return validator(value);
    }
    return null;
  }, [validator]);

  const setValue = useCallback((input: T) => {
    const sanitized = sanitizeValue(input);
    setValueState(sanitized);

    // Check for threats if enabled
    if (enableThreatDetection && typeof sanitized === 'string') {
      const threatDetection = InputSanitizer.detectThreats(sanitized);
      setThreats(threatDetection.threats);

      if (threatDetection.threats.length > 0) {
        onThreatDetected(threatDetection.threats);
      }
    } else {
      setThreats([]);
    }

    // Validate if enabled
    if (validateOnChange) {
      const validationError = validate(sanitized);
      setError(validationError);
    }
  }, [sanitizeValue, enableThreatDetection, onThreatDetected, validateOnChange, validate]);

  const reset = useCallback(() => {
    setValueState(initialValue);
    setThreats([]);
    setError(null);
  }, [initialValue]);

  return {
    value,
    setValue,
    threats,
    hasThreats: threats.length > 0,
    error,
    isValid: !error && threats.length === 0,
    reset
  };
}

export function useSanitizedForm<T extends Record<string, any>>(
  initialValues: T,
  fieldOptions: Record<keyof T, SanitizedInputOptions> = {}
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [threats, setThreats] = useState<Partial<Record<keyof T, string[]>>>({});

  const sanitizeValue = useCallback((key: keyof T, value: any) => {
    const options = fieldOptions[key] || { type: 'text' };
    const { type = 'text' } = options;

    if (typeof value !== 'string') {
      return value;
    }

    switch (type) {
      case 'html':
        return InputSanitizer.sanitizeHtml(value);
      case 'email':
        return InputSanitizer.sanitizeEmail(value);
      case 'phone':
        return InputSanitizer.sanitizePhone(value);
      case 'number':
        return InputSanitizer.sanitizeNumber(value);
      case 'url':
        return InputSanitizer.sanitizeUrl(value);
      case 'json':
        return InputSanitizer.sanitizeJson(value);
      default:
        return InputSanitizer.sanitizeText(value);
    }
  }, [fieldOptions]);

  const setValue = useCallback((key: keyof T, value: any) => {
    const sanitized = sanitizeValue(key, value);

    setValues(prev => ({
      ...prev,
      [key]: sanitized
    }));

    // Check for threats
    if (typeof sanitized === 'string') {
      const threatDetection = InputSanitizer.detectThreats(sanitized);
      if (threatDetection.threats.length > 0) {
        setThreats(prev => ({
          ...prev,
          [key]: threatDetection.threats
        }));
      } else {
        setThreats(prev => {
          const newThreats = { ...prev };
          delete newThreats[key];
          return newThreats;
        });
      }
    }
  }, [sanitizeValue]);

  const setValuesBulk = useCallback((newValues: Partial<T>) => {
    const sanitizedValues: Partial<T> = {};
    const newThreats: Partial<Record<keyof T, string[]>> = {};

    for (const [key, value] of Object.entries(newValues)) {
      const sanitized = sanitizeValue(key as keyof T, value);
      sanitizedValues[key as keyof T] = sanitized;

      // Check for threats
      if (typeof sanitized === 'string') {
        const threatDetection = InputSanitizer.detectThreats(sanitized);
        if (threatDetection.threats.length > 0) {
          newThreats[key as keyof T] = threatDetection.threats;
        }
      }
    }

    setValues(prev => ({
      ...prev,
      ...sanitizedValues
    }));

    setThreats(prev => ({
      ...prev,
      ...newThreats
    }));
  }, [sanitizeValue]);

  const setError = useCallback((key: keyof T, error: string | null) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[key] = error;
      } else {
        delete newErrors[key];
      }
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setThreats({});
  }, [initialValues]);

  const hasThreats = Object.keys(threats).length > 0;
  const hasErrors = Object.keys(errors).length > 0;
  const isValid = !hasThreats && !hasErrors;

  return {
    values,
    setValue,
    setValues: setValuesBulk,
    errors,
    setError,
    clearErrors,
    threats,
    hasThreats,
    hasErrors,
    isValid,
    reset
  };
}