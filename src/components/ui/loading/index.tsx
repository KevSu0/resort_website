// Simplified loading exports to avoid circular dependencies

// Basic loading components
export const Loading = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export const Skeleton = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse rounded-md bg-muted ${className}`}
    {...props}
  />
);

export const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  </div>
);

export const ImageGallerySkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <Skeleton key={i} className="h-32 w-full rounded-lg" />
    ))}
  </div>
);

export const HeroSkeleton = () => (
  <div className="relative h-96 bg-gray-200">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto mb-8" />
        <Skeleton className="h-12 w-32 mx-auto" />
      </div>
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i}>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <Skeleton className="h-12 w-32" />
  </div>
);

export const TableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr>
          {[...Array(4)].map((_, i) => (
            <th key={i} className="p-2">
              <Skeleton className="h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, i) => (
          <tr key={i}>
            {[...Array(4)].map((_, j) => (
              <td key={j} className="p-2">
                <Skeleton className="h-4 w-16" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ReviewSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center mb-2">
      <Skeleton className="h-10 w-10 rounded-full mr-3" />
      <div>
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

export const ContactFormSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-12 w-32" />
    </div>
  </div>
);

export const LoadingOverlay = ({ 
  children, 
  isLoading, 
  className = "" 
}: { 
  children: React.ReactNode; 
  isLoading: boolean; 
  className?: string; 
}) => (
  <div className={`relative ${className}`}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
        <Loading />
      </div>
    )}
  </div>
);

export const InlineLoading = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };
  
  return (
    <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}></div>
  );
};

// Progress indicators
export const Progress = ({ 
  value = 0, 
  className = "" 
}: { 
  value: number; 
  className?: string; 
}) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div 
      className="bg-primary h-2.5 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    ></div>
  </div>
);

export const StepProgress = ({ 
  currentStep = 1, 
  totalSteps = 3, 
  className = "" 
}: { 
  currentStep: number; 
  totalSteps: number; 
  className?: string; 
}) => (
  <div className={`flex items-center justify-between ${className}`}>
    {[...Array(totalSteps)].map((_, i) => (
      <div key={i} className="flex items-center">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            i + 1 <= currentStep 
              ? "bg-primary text-white" 
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {i + 1}
        </div>
        {i < totalSteps - 1 && (
          <div 
            className={`w-16 h-1 mx-2 ${
              i + 1 < currentStep ? "bg-primary" : "bg-gray-200"
            }`}
          ></div>
        )}
      </div>
    ))}
  </div>
);

export const CircularProgress = ({ 
  value = 0, 
  size = 40, 
  className = "" 
}: { 
  value: number; 
  size?: number; 
  className?: string; 
}) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium">{Math.round(value)}%</span>
      </div>
    </div>
  );
};

export const LoadingDots = ({ className = "" }: { className?: string }) => (
  <div className={`flex space-x-1 ${className}`}>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

// Types
export type LoadingProps = {
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export type StepProgressProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

export type CircularProgressProps = {
  value: number;
  size?: number;
  className?: string;
};