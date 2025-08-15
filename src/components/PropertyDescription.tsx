import React from 'react';

interface PropertyDescriptionProps {
  description: string;
}

export function PropertyDescription({ description }: PropertyDescriptionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Property</h2>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
