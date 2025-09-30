import React from 'react';
import { validatePassword } from '../utils/security';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  userInfo?: {
    name?: string;
    email?: string;
  };
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  userInfo,
  className = ''
}: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password, userInfo);

  const getStrengthColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthLabel = (score: number): string => {
    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Weak';
    return 'Very Weak';
  };

  const getStrengthVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 60) return 'default';
    if (score >= 40) return 'secondary';
    return 'destructive';
  };

  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Password Strength</span>
        <Badge variant={getStrengthVariant(validation.score)}>
          {getStrengthLabel(validation.score)}
        </Badge>
      </div>

      <Progress
        value={validation.score}
        className={`h-2 ${getStrengthColor(validation.score)}`}
      />

      {validation.errors.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            Password requirements:
          </p>
          <ul className="space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <X className="h-3 w-3 flex-shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.errors.length === 0 && validation.score < 80 && (
        <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          Consider adding more complexity for a stronger password
        </div>
      )}

      {validation.errors.length === 0 && validation.score >= 80 && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <Check className="h-3 w-3 flex-shrink-0" />
          Password meets all security requirements
        </div>
      )}
    </div>
  );
}