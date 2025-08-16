import React from 'react';
import { Section } from './Layout';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  backgroundClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function PageHeader({
  title,
  subtitle,
  children,
  className = "",
  backgroundClassName = "bg-gray-50",
  titleClassName = "text-3xl md:text-4xl font-bold text-gray-900 mb-4",
  subtitleClassName = "text-lg text-gray-600 max-w-2xl mx-auto"
}: PageHeaderProps) {
  return (
    <Section className={`${backgroundClassName} ${className}`}>
      <div className="text-center mb-8">
        <h1 className={titleClassName}>
          {title}
        </h1>
        {subtitle && (
          <p className={subtitleClassName}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </Section>
  );
}

// Specialized variants for common use cases
export function ListingPageHeader({
  title,
  subtitle,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      backgroundClassName="bg-gray-50"
      {...props}
    >
      {children}
    </PageHeader>
  );
}

export function DetailPageHeader({
  title,
  subtitle,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      backgroundClassName="bg-white border-b border-gray-200"
      titleClassName="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
      subtitleClassName="text-base text-gray-600 max-w-3xl mx-auto"
      {...props}
    >
      {children}
    </PageHeader>
  );
}