import React from 'react';
import { Plus } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onActionClick?: () => void;
  children?: React.ReactNode;
}

export default function AdminHeader({
  title,
  description,
  actionLabel,
  onActionClick,
  children
}: AdminHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
            <div className="flex items-center space-x-3">
              {children}
              {actionLabel && onActionClick && (
                <button 
                  onClick={onActionClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}