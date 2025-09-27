import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  isRunning: boolean;
  progress?: number;
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  error?: string;
  steps?: string[];
  currentStep?: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  isRunning,
  progress = 0,
  status,
  message,
  error,
  steps = [],
  currentStep = 0
}) => {
  if (status === 'idle' && !isRunning) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center gap-3">
        {status === 'running' && isRunning && (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
        {status === 'error' && (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
        <h3 className="text-lg font-semibold">
          {message || (status === 'running' ? 'Processing...' : status === 'success' ? 'Completed' : 'Error')}
        </h3>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Steps:</h4>
          <div className="space-y-1">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 text-sm ${
                  index < currentStep ? 'text-green-600' : index === currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : index === currentStep ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                )}
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {status === 'success' && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            Operation completed successfully!
          </p>
        </div>
      )}
    </div>
  );
};