import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Card } from './Layout';

interface FilterOption {
  value: string;
  label: string;
}

interface AdminSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  }[];
  children?: React.ReactNode;
}

export default function AdminSearchFilter({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  children
}: AdminSearchFilterProps) {
  return (
    <Card className="p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {(filters.length > 0 || children) && (
          <div className="flex items-center space-x-4">
            {filters.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                {filters.map((filter, index) => (
                  <select
                    key={index}
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label={filter.label}
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            )}
            {children}
          </div>
        )}
      </div>
    </Card>
  );
}