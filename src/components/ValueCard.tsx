import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Layout';

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export default function ValueCard({ 
  icon: IconComponent, 
  title, 
  description, 
  className = '',
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600'
}: ValueCardProps) {
  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-start">
        <div className={`p-3 ${iconBgColor} rounded-lg mr-4 flex-shrink-0`}>
          <IconComponent className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}