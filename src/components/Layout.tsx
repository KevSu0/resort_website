import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';

interface LayoutProps {
  children?: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function Layout({ 
  children, 
  showNavigation = true, 
  showFooter = true,
  className = ''
}: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${className}`}>
      {showNavigation && (
        <ErrorBoundary fallback={<div className="h-16 bg-white shadow-lg" />}>
          <Navigation />
        </ErrorBoundary>
      )}
      
      <main className="flex-1">
        <ErrorBoundary>
          {children || <Outlet />}
        </ErrorBoundary>
      </main>
      
      {showFooter && (
        <ErrorBoundary fallback={<div className="h-32 bg-gray-900" />}>
          <Footer />
        </ErrorBoundary>
      )}
    </div>
  );
}

// Page wrapper with consistent padding and max-width
export function PageContainer({ 
  children, 
  className = '',
  maxWidth = '7xl'
}: { 
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

// Section wrapper for consistent spacing
export function Section({ 
  children, 
  className = '',
  padding = 'default'
}: { 
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
}) {
  const paddingClasses = {
    none: '',
    sm: 'py-8',
    default: 'py-12',
    lg: 'py-16',
    xl: 'py-20'
  };

  return (
    <section className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </section>
  );
}

// Hero section layout
export function HeroSection({ 
  children, 
  backgroundImage,
  overlay = true,
  className = ''
}: { 
  children: React.ReactNode;
  backgroundImage?: string;
  overlay?: boolean;
  className?: string;
}) {
  return (
    <section className={`relative py-20 lg:py-32 ${className}`}>
      {backgroundImage && (
        <>
          <div className="absolute inset-0">
            <img
              src={backgroundImage}
              alt="Hero background"
              className="w-full h-full object-cover"
            />
          </div>
          {overlay && (
            <div className="absolute inset-0 bg-black/40" />
          )}
        </>
      )}
      
      <div className="relative">
        <PageContainer>
          {children}
        </PageContainer>
      </div>
    </section>
  );
}

// Card layout for content sections
export function Card({ 
  children, 
  className = '',
  padding = 'default',
  shadow = 'default'
}: { 
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'default' | 'lg';
  shadow?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  return (
    <div className={`bg-white rounded-lg ${shadowClasses[shadow]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

// Grid layout for responsive content
export function Grid({ 
  children, 
  cols = 'auto',
  gap = 'default',
  className = ''
}: { 
  children: React.ReactNode;
  cols?: 'auto' | '1' | '2' | '3' | '4' | '5' | '6';
  gap?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
}) {
  const colClasses = {
    auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    '5': 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    '6': 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-4',
    default: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

// Flex layout utilities
export function Flex({ 
  children, 
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'default',
  className = ''
}: { 
  children: React.ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
}) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    default: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div className={`flex ${directionClasses[direction]} ${alignClasses[align]} ${justifyClasses[justify]} ${wrap ? 'flex-wrap' : ''} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}