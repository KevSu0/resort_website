import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoadingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'dots' | 'pulse' | 'shimmer';
  color?: 'primary' | 'secondary' | 'luxury' | 'success';
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className = '',
  fullScreen = false,
  variant = 'default',
  color = 'primary'
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    luxury: 'text-purple-600',
    success: 'text-green-600'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4';

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full animate-bounce',
                  colorClasses[color],
                  `animation-delay-${i * 150}ms`
                )}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1.4s'
                }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <div className={cn('relative', sizeClasses[size])}>
            <div
              className={cn(
                'absolute inset-0 rounded-full animate-ping',
                colorClasses[color],
                'opacity-20'
              )}
            />
            <div
              className={cn(
                'relative rounded-full animate-pulse',
                colorClasses[color]
              )}
              style={{
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        );
      case 'shimmer':
        return (
          <div className={cn('relative overflow-hidden rounded-lg', sizeClasses[size])}>
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 animate-pulse',
                colorClasses[color]
              )}
              style={{
                width: '200%',
                height: '100%'
              }}
            />
          </div>
        );
      default:
        return (
          <Loader2 className={cn('animate-spin', sizeClasses[size], colorClasses[color])} />
        );
    }
  };

  return (
    <div className={cn(containerClasses, className)} role="status" aria-label={text || 'Loading'}>
      <div className="flex flex-col items-center space-y-3">
        {renderSpinner()}
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
};

// Page level loading component
export const PageLoading: React.FC<{ text?: string; variant?: LoadingProps['variant'] }> = ({
  text = 'Loading...',
  variant = 'default'
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Loading size="xl" text={text} variant={variant} fullScreen={false} />
  </div>
);

// Enhanced skeleton loading components with shimmer effect
export const Skeleton: React.FC<{
  className?: string;
  variant?: 'default' | 'shimmer' | 'pulse';
  width?: string;
  height?: string;
}> = ({
  className = '',
  variant = 'shimmer',
  width,
  height
}) => {
  const baseClasses = 'rounded bg-gray-200';
  const animationClasses = {
    default: 'animate-pulse',
    shimmer: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    pulse: 'animate-pulse'
  };

  const style = {
    width: width || undefined,
    height: height || undefined
  };

  return (
    <div
      className={cn(baseClasses, animationClasses[variant], className)}
      style={style}
    />
  );
};

// Property Card Skeleton
export const PropertyCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    {/* Image skeleton */}
    <div className="relative h-64">
      <Skeleton className="h-full w-full" variant="shimmer" />
      {/* Featured badge skeleton */}
      <div className="absolute top-4 left-4">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      {/* Price tag skeleton */}
      <div className="absolute bottom-4 left-4">
        <Skeleton className="h-16 w-24 rounded-lg opacity-90" />
      </div>
    </div>

    {/* Content skeleton */}
    <div className="p-6 space-y-4">
      {/* Title and rating */}
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Tagline */}
      <Skeleton className="h-4 w-full" />

      {/* Location */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Amenities */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-md" />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

// Image Gallery Skeleton
export const ImageGallerySkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* Main image */}
    <div className="relative aspect-video overflow-hidden rounded-xl">
      <Skeleton className="h-full w-full" variant="shimmer" />
      {/* Navigation buttons skeleton */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <Skeleton className="h-10 w-10 rounded-full opacity-90" />
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <Skeleton className="h-10 w-10 rounded-full opacity-90" />
      </div>
      {/* Image counter skeleton */}
      <div className="absolute bottom-4 right-4">
        <Skeleton className="h-8 w-16 rounded-full opacity-90" />
      </div>
    </div>

    {/* Thumbnail strip skeleton */}
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="flex-shrink-0 w-20 h-20 rounded-lg" />
      ))}
    </div>
  </div>
);

// Hero Section Skeleton
export const HeroSkeleton: React.FC = () => (
  <div className="relative h-screen min-h-[600px]">
    {/* Background image skeleton */}
    <Skeleton className="h-full w-full" variant="shimmer" />

    {/* Overlay content skeleton */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 flex items-center justify-center">
      <div className="text-center text-white space-y-6 animate-pulse">
        <Skeleton className="h-16 w-96 mx-auto bg-white/20" />
        <Skeleton className="h-6 w-64 mx-auto bg-white/20" />
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-12 w-32 rounded-xl bg-white/20" />
          <Skeleton className="h-12 w-32 rounded-xl bg-white/20" />
        </div>
      </div>
    </div>
  </div>
);

// Form Skeleton with enhanced styling
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="space-y-6 animate-pulse">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" variant="shimmer" />
      </div>
    ))}

    {/* Form actions */}
    <div className="flex gap-3 pt-4">
      <Skeleton className="h-10 w-24 rounded-lg" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  </div>
);

// Table Skeleton with enhanced styling
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean
}> = ({
  rows = 5,
  columns = 4,
  showHeader = true
}) => (
  <div className="space-y-3 animate-pulse">
    {/* Header */}
    {showHeader && (
      <div className="flex items-center space-x-4 p-4 border-b bg-gray-50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 w-24" />
        ))}
      </div>
    )}

    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border-b hover:bg-gray-50 transition-colors">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={`cell-${i}-${j}`} className="h-4 w-32" variant="shimmer" />
        ))}
      </div>
    ))}
  </div>
);

// Review/Rating Skeleton
export const ReviewSkeleton: React.FC = () => (
  <div className="space-y-4 p-6 bg-white rounded-xl border animate-pulse">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-20" />
    </div>

    {/* Content */}
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-4 w-4 rounded" />
        ))}
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

// Contact Form Skeleton
export const ContactFormSkeleton: React.FC = () => (
  <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
    {/* Form header */}
    <div className="text-center space-y-4">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-4 w-96 mx-auto" />
    </div>

    {/* Form fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" variant="shimmer" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" variant="shimmer" />
      </div>
    </div>

    {/* Message field */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-32 w-full" variant="shimmer" />
    </div>

    {/* Submit button */}
    <div className="flex justify-center">
      <Skeleton className="h-12 w-32 rounded-xl" />
    </div>
  </div>
);

// Loading Overlay for specific sections
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ isLoading, text, children, className = '' }) => (
  <div className={cn('relative', className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
        <Loading text={text} size="md" />
      </div>
    )}
  </div>
);

// Inline Loading for buttons
export const InlineLoading: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ isLoading, children, className = '' }) => (
  <div className={cn('flex items-center gap-2', className)}>
    {isLoading && <Loading size="sm" variant="dots" />}
    <span className={cn(isLoading && 'opacity-50')}>{children}</span>
  </div>
);