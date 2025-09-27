import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
  color?: 'blue' | 'green' | 'purple' | 'red';
}

const formatValue = (value: string | number, format?: string) => {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    case 'percentage':
      return `${value}%`;
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
};

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  format = 'number',
  color = 'blue'
}) => {
  const colorClass = colorClasses[color];

  return (
    <div className={`rounded-lg border p-6 ${colorClass.bg} ${colorClass.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {formatValue(value, format)}
          </p>
          {change && (
            <div className="mt-2 flex items-center text-sm">
              {change.type === 'increase' && (
                <TrendingUp className="h-4 w-4 text-green-500" />
              )}
              {change.type === 'decrease' && (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              {change.type === 'neutral' && (
                <Minus className="h-4 w-4 text-gray-500" />
              )}
              <span
                className={`ml-1 ${
                  change.type === 'increase'
                    ? 'text-green-600 dark:text-green-400'
                    : change.type === 'decrease'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {Math.abs(change.value)}%
              </span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                from last period
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`rounded-lg p-3 ${colorClass.bg}`}>
            <div className={colorClass.text}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
};