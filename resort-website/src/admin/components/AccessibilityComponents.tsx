import React from 'react';
import { ARIA_ROLES } from '../utils/accessibility';

/**
 * Skip links component for keyboard navigation accessibility
 */
export const SkipLinks: React.FC = () => {
  const links = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#search', text: 'Skip to search' },
  ];

  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="block px-4 py-2 bg-white text-blue-600 rounded shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {link.text}
        </a>
      ))}
    </div>
  );
};

/**
 * Landmark region component for semantic HTML structure
 */
export const LandmarkRegion: React.FC<{
  role: keyof typeof ARIA_ROLES;
  label: string;
  children: React.ReactNode;
}> = ({ role, label, children }) => {
  return (
    <div role={ARIA_ROLES[role]} aria-label={label}>
      {children}
    </div>
  );
};