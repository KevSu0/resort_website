import { type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
};