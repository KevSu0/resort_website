import { type ReactNode } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({
  children,
  showFooter = true
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};