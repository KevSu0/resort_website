import React from 'react';
import { Link } from 'react-router-dom';
import { Section } from './Layout';

interface Breadcrumb {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Section className="py-4 border-b">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <React.Fragment key={item.path}>
            {index > 0 && <span>/</span>}
            {index === items.length - 1 ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <Link to={item.path} className="hover:text-blue-600 transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    </Section>
  );
}
