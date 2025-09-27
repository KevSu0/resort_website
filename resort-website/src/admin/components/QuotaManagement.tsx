import { useState, useEffect } from 'react';
import { Cloud, HardDrive, AlertTriangle, XCircle, Info, TrendingUp, FileImage, Video } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface StorageQuota {
  used: number;
  total: number;
  warningThreshold: number;
  criticalThreshold: number;
  lastUpdated: Date;
}

interface FileBreakdown {
  images: number;
  videos: number;
  documents: number;
  other: number;
}

interface OptimizationSuggestion {
  id: string;
  type: 'resize' | 'compress' | 'convert' | 'delete';
  description: string;
  potentialSavings: number;
  priority: 'low' | 'medium' | 'high';
}

export const QuotaManagement: React.FC = () => {
  const [quota, setQuota] = useState<StorageQuota>({
    used: 0,
    total: 100 * 1024 * 1024 * 1024, // 100GB default
    warningThreshold: 0.8,
    criticalThreshold: 0.95,
    lastUpdated: new Date(),
  });

  const [fileBreakdown, setFileBreakdown] = useState<FileBreakdown>({
    images: 0,
    videos: 0,
    documents: 0,
    other: 0,
  });

  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Simulate fetching quota data
  useEffect(() => {
    const fetchQuotaData = async () => {
      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        const used = 75.5 * 1024 * 1024 * 1024; // 75.5GB used
        setQuota(prev => ({
          ...prev,
          used,
          lastUpdated: new Date(),
        }));

        setFileBreakdown({
          images: 45.2 * 1024 * 1024 * 1024,
          videos: 28.1 * 1024 * 1024 * 1024,
          documents: 1.8 * 1024 * 1024 * 1024,
          other: 0.4 * 1024 * 1024 * 1024,
        });

        // Generate optimization suggestions
        const newSuggestions: OptimizationSuggestion[] = [
          {
            id: '1',
            type: 'resize',
            description: 'Resize images larger than 2000px',
            potentialSavings: 5.2 * 1024 * 1024 * 1024,
            priority: 'high',
          },
          {
            id: '2',
            type: 'compress',
            description: 'Compress PNG images to WebP format',
            potentialSavings: 3.1 * 1024 * 1024 * 1024,
            priority: 'medium',
          },
          {
            id: '3',
            type: 'delete',
            description: 'Remove duplicate media files',
            potentialSavings: 2.8 * 1024 * 1024 * 1024,
            priority: 'medium',
          },
          {
            id: '4',
            type: 'convert',
            description: 'Convert videos to H.265 codec',
            potentialSavings: 8.4 * 1024 * 1024 * 1024,
            priority: 'high',
          },
        ];

        setSuggestions(newSuggestions);
        setLoading(false);
      }, 1000);
    };

    fetchQuotaData();
  }, []);

  const usagePercentage = (quota.used / quota.total) * 100;
  const isWarning = usagePercentage >= quota.warningThreshold * 100;
  const isCritical = usagePercentage >= quota.criticalThreshold * 100;

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${size.toFixed(1)} ${sizes[i]}`;
  };

  const getUsageColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (isCritical) return <XCircle className="w-5 h-5 text-red-600" />;
    if (isWarning) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <Cloud className="w-5 h-5 text-green-600" />;
  };

  const getStatusMessage = () => {
    if (isCritical) {
      return {
        title: 'Storage Critical',
        message: 'Your storage is nearly full. Please optimize immediately.',
        action: 'Optimize Now',
      };
    }
    if (isWarning) {
      return {
        title: 'Storage Warning',
        message: 'Your storage is running low. Consider optimizing files.',
        action: 'Optimize Files',
      };
    }
    return {
      title: 'Storage Healthy',
      message: 'You have plenty of storage space available.',
      action: 'View Suggestions',
    };
  };

  const status = getStatusMessage();

  const handleOptimize = (suggestionId: string) => {
    showToast(`Started optimization: ${suggestionId}`, 'success');
    // In a real app, this would trigger the optimization process
  };

  const handleOptimizeAll = () => {
    showToast('Started optimization for all suggestions', 'success');
    // In a real app, this would trigger bulk optimization
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="Storage quota management">
      {/* Storage Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Storage Quota</h2>
            {getStatusIcon()}
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {quota.lastUpdated.toLocaleString()}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {formatBytes(quota.used)} of {formatBytes(quota.total)} used
            </span>
            <span className="text-sm font-medium text-gray-700">
              {usagePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getUsageColor()}`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              role="progressbar"
              aria-valuenow={usagePercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Storage usage"
            />
          </div>
        </div>

        {/* Status Message */}
        <div className={`p-4 rounded-lg ${isCritical ? 'bg-red-50 border border-red-200' : isWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-start">
            <Info className={`w-5 h-5 mt-0.5 ${isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'}`} />
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${isCritical ? 'text-red-800' : isWarning ? 'text-yellow-800' : 'text-green-800'}`}>
                {status.title}
              </h3>
              <p className={`text-sm ${isCritical ? 'text-red-700' : isWarning ? 'text-yellow-700' : 'text-green-700'}`}>
                {status.message}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* File Type Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileImage className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Images</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(fileBreakdown.images)}
            </div>
            <div className="text-sm text-gray-500">
              {((fileBreakdown.images / quota.used) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Videos</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(fileBreakdown.videos)}
            </div>
            <div className="text-sm text-gray-500">
              {((fileBreakdown.videos / quota.used) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">DOC</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Documents</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(fileBreakdown.documents)}
            </div>
            <div className="text-sm text-gray-500">
              {((fileBreakdown.documents / quota.used) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">OTH</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Other</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(fileBreakdown.other)}
            </div>
            <div className="text-sm text-gray-500">
              {((fileBreakdown.other / quota.used) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Optimization Suggestions</h3>
          </div>
          <button
            onClick={handleOptimizeAll}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Optimize All
          </button>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`border rounded-lg p-4 flex items-center justify-between ${
                suggestion.priority === 'high'
                  ? 'border-red-200 bg-red-50'
                  : suggestion.priority === 'medium'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      suggestion.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : suggestion.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {suggestion.priority.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {suggestion.description}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Potential savings: {formatBytes(suggestion.potentialSavings)}
                </div>
              </div>
              <button
                onClick={() => handleOptimize(suggestion.id)}
                className="ml-4 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Optimize
              </button>
            </div>
          ))}
        </div>

        {/* Total Savings */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total potential savings:</span>
            <span className="text-lg font-semibold text-primary-600">
              {formatBytes(suggestions.reduce((acc, s) => acc + s.potentialSavings, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};