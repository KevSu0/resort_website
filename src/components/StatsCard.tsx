import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Layout';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
  className?: string;
}

export default function StatsCard({ 
  icon: IconComponent, 
  label, 
  value, 
  description, 
  className = '' 
}: StatsCardProps) {
  return (
    <Card className={`text-center p-6 hover:shadow-lg transition-shadow ${className}`}>
      <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
        <IconComponent className="w-6 h-6 text-blue-600" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="font-semibold text-gray-900 mb-1">{label}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </Card>
  );
}