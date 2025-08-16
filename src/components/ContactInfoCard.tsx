import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Layout';

interface ContactInfoCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  className?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export default function ContactInfoCard({ 
  icon: IconComponent, 
  title, 
  subtitle, 
  content, 
  className = '',
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600'
}: ContactInfoCardProps) {
  return (
    <Card className={`text-center p-6 hover:shadow-lg transition-shadow ${className}`}>
      <div className={`p-3 ${iconBgColor} rounded-full w-fit mx-auto mb-4`}>
        <IconComponent className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-2">{subtitle}</p>
      <div className="text-blue-600 hover:text-blue-700 font-medium">
        {content}
      </div>
    </Card>
  );
}