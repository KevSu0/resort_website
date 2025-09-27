import { useEffect, useRef } from 'react';

/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

// ARIA role mappings
export const ARIA_ROLES = {
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  banner: 'banner',
  search: 'search',
  form: 'form',
  dialog: 'dialog',
  alert: 'alert',
  status: 'status',
  tooltip: 'tooltip',
} as const;

// ARIA properties
export const ARIA_PROPS = {
  labelledBy: 'aria-labelledby',
  describedBy: 'aria-describedby',
  required: 'aria-required',
  invalid: 'aria-invalid',
  busy: 'aria-busy',
  expanded: 'aria-expanded',
  selected: 'aria-selected',
  checked: 'aria-checked',
  pressed: 'aria-pressed',
  hidden: 'aria-hidden',
  live: 'aria-live',
  atomic: 'aria-atomic',
  relevant: 'aria-relevant',
} as const;

// Focus management utilities
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
};

// Keyboard navigation utilities
export const useKeyboardNavigation = (
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) => {
  const handleKeyDown = (e: any) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        onEnter?.();
        break;
      case ' ':
        e.preventDefault();
        onSpace?.();
        break;
      case 'Escape':
        e.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onArrowRight?.();
        break;
    }
  };

  return { handleKeyDown };
};

// Announcer for screen readers
export const useAnnouncer = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';

    document.body.appendChild(announcer);
    announcer.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  };

  return { announce };
};


// Color contrast checker
export const checkColorContrast = (color1: string, color2: string): boolean => {
  // Simple contrast checker implementation
  // In production, use a library like 'color-contrast'
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [lr, lg, lb] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05) >= 4.5;
};

// Form field accessibility utilities
export const getFormFieldProps = (
  id: string,
  label: string,
  error?: string,
  required?: boolean,
  description?: string
) => {
  const props: Record<string, any> = {
    id,
    'aria-labelledby': `${id}-label`,
    'aria-invalid': !!error,
    'aria-required': !!required,
  };

  if (error) {
    props['aria-describedby'] = `${id}-error`;
  }

  if (description) {
    props['aria-describedby'] = `${id}-description ${props['aria-describedby'] || ''}`.trim();
  }

  return props;
};

