import React from 'react';
import { Card } from './Layout';

interface TeamMemberCardProps {
  name: string;
  role: string;
  image: string;
  bio: string;
  className?: string;
}

export default function TeamMemberCard({ 
  name, 
  role, 
  image, 
  bio, 
  className = '' 
}: TeamMemberCardProps) {
  return (
    <Card className={`text-center p-6 hover:shadow-lg transition-shadow ${className}`}>
      <div className="mb-4">
        <img
          src={image}
          alt={name}
          className="w-24 h-24 rounded-full mx-auto object-cover"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {name}
      </h3>
      <p className="text-blue-600 font-medium mb-3">{role}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
    </Card>
  );
}