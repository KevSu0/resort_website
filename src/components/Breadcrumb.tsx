import React from 'react';
import { Link } from 'react-router-dom';
import { Section } from './Layout';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  sectionClassName?: string;
}

export function Breadcrumb({ 
  items, 
  className = "", 
  sectionClassName = "bg-gray-50 py-4" 
}: BreadcrumbProps) {
  return (
    <Section className={sectionClassName}>
      <div className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span>/</span>}
            {item.href && !item.isActive ? (
              <Link to={item.href} className="hover:text-blue-600">
                {item.label}
              </Link>
            ) : (
              <span className={item.isActive ? "text-gray-900" : "text-gray-600"}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </Section>
  );
}
