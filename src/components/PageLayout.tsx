import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import ErrorBoundary from './ErrorBoundary';
import { Section } from './Layout';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  containerized?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full'
};

export default function PageLayout({
  children,
  title,
  description,
  keywords,
  className = '',
  showHeader = true,
  showFooter = true,
  containerized = true,
  maxWidth = 'full'
}: PageLayoutProps) {
  const pageTitle = title ? `${title} | Resort Group` : 'Resort Group - Luxury Resort Experiences';
  const pageDescription = description || 'Discover luxury resorts and unforgettable experiences with Resort Group. Book your perfect getaway today.';

  return (
    <ErrorBoundary>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <div className={`min-h-screen flex flex-col ${className}`}>
        {showHeader && (
          <header className="sticky top-0 z-50 bg-white shadow-sm">
            {/* Header content will be injected by the routing system */}
          </header>
        )}

        <main className="flex-1">
          {containerized ? (
            <Section className={`${maxWidthClasses[maxWidth]} mx-auto`}>
              {children}
            </Section>
          ) : (
            children
          )}
        </main>

        {showFooter && (
          <footer className="bg-gray-900 text-white">
            {/* Footer content will be injected by the routing system */}
          </footer>
        )}
      </div>
    </ErrorBoundary>
  );
}

// Specialized layout components for different page types
export function AdminPageLayout({ children, title, ...props }: Omit<PageLayoutProps, 'showHeader' | 'showFooter'>) {
  return (
    <PageLayout
      title={title ? `Admin - ${title}` : 'Admin Dashboard'}
      showHeader={false}
      showFooter={false}
      containerized={false}
      {...props}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Admin sidebar and header will be handled separately */}
        {children}
      </div>
    </PageLayout>
  );
}

export function AuthPageLayout({ children, title, ...props }: Omit<PageLayoutProps, 'containerized'>) {
  return (
    <PageLayout
      title={title}
      containerized={false}
      className="bg-gray-50"
      {...props}
    >
      {children}
    </PageLayout>
  );
}

export function FullWidthPageLayout({ children, title, ...props }: Omit<PageLayoutProps, 'containerized' | 'maxWidth'>) {
  return (
    <PageLayout
      title={title}
      containerized={false}
      maxWidth="full"
      {...props}
    >
      {children}
    </PageLayout>
  );
}