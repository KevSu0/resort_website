import { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white transform [mask-image:linear-gradient(180deg,white,transparent)]"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-primary-100/20 to-transparent transform [mask-image:linear-gradient(270deg,white,transparent)]"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-4 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Wayanad Nature Resorts. All rights reserved.
        </p>
      </div>
    </div>
  );
};