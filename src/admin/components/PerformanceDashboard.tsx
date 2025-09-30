import { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, AlertTriangle, CheckCircle, Clock, Download, BarChart3, PieChart, LineChart } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface PerformanceMetrics {
  crashFreeSessions: number;
  criticalPathSuccess: number;
  p95PageLoad: number;
  saveFeedbackTime: number;
  importSuccessRate: number;
  timestamp: string;
}

interface StorageOptimization {
  totalSize: number;
  optimizedSize: number;
  savings: number;
  recommendations: string[];
}

interface BundleAnalysis {
  totalSize: number;
  chunks: {
    name: string;
    size: number;
    modules: number;
  }[];
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [storage, setStorage] = useState<StorageOptimization | null>(null);
  const [bundle, setBundle] = useState<BundleAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const { showToast } = useToast();

  useEffect(() => {
    fetchMetrics();
    fetchStorageData();
    fetchBundleAnalysis();

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      // Simulate API call
      const mockMetrics: PerformanceMetrics = {
        crashFreeSessions: 99.2,
        criticalPathSuccess: 97.8,
        p95PageLoad: 1200,
        saveFeedbackTime: 450,
        importSuccessRate: 98.5,
        timestamp: new Date().toISOString(),
      };
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchStorageData = async () => {
    try {
      // Simulate API call
      const mockStorage: StorageOptimization = {
        totalSize: 85600000,
        optimizedSize: 62400000,
        savings: 23200000,
        recommendations: [
          'Compress images larger than 2000px width',
          'Convert PNG images to WebP format',
          'Remove unused assets from bundle',
          'Enable lazy loading for below-the-fold images',
        ],
      };
      setStorage(mockStorage);
    } catch (error) {
      console.error('Failed to fetch storage data:', error);
    }
  };

  const fetchBundleAnalysis = async () => {
    try {
      // Simulate API call
      const mockBundle: BundleAnalysis = {
        totalSize: 1200000,
        chunks: [
          { name: 'main.js', size: 450000, modules: 120 },
          { name: 'vendor.js', size: 380000, modules: 85 },
          { name: 'admin.js', size: 220000, modules: 45 },
          { name: 'runtime.js', size: 150000, modules: 12 },
        ],
      };
      setBundle(mockBundle);
    } catch (error) {
      console.error('Failed to fetch bundle analysis:', error);
    }
    setLoading(false);
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getMetricColor = (value: number, type: string): string => {
    switch (type) {
      case 'percentage':
        return value >= 95 ? 'text-green-600' : value >= 90 ? 'text-yellow-600' : 'text-red-600';
      case 'time':
        return value <= 1000 ? 'text-green-600' : value <= 2000 ? 'text-yellow-600' : 'text-red-600';
      case 'size':
        return value <= 1000000 ? 'text-green-600' : value <= 2000000 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (value: number, type: string) => {
    const color = getMetricColor(value, type);
    if (color.includes('green')) return <CheckCircle className={`w-5 h-5 ${color}`} />;
    if (color.includes('yellow')) return <AlertTriangle className={`w-5 h-5 ${color}`} />;
    return <AlertTriangle className={`w-5 h-5 ${color}`} />;
  };

  const exportReport = async () => {
    try {
      const report = {
        metrics,
        storage,
        bundle,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Performance report exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Crash-Free Sessions</h3>
              {getStatusIcon(metrics.crashFreeSessions, 'percentage')}
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.crashFreeSessions, 'percentage')}`}>
              {metrics.crashFreeSessions.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Updated {new Date(metrics.timestamp).toLocaleTimeString()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Critical Path Success</h3>
              {getStatusIcon(metrics.criticalPathSuccess, 'percentage')}
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.criticalPathSuccess, 'percentage')}`}>
              {metrics.criticalPathSuccess.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Property, Media, Enquiry flows
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">P95 Page Load</h3>
              {getStatusIcon(metrics.p95PageLoad, 'time')}
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.p95PageLoad, 'time')}`}>
              {formatTime(metrics.p95PageLoad)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              95th percentile load time
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Save Feedback</h3>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(metrics.saveFeedbackTime)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Average save response time
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Import Success</h3>
              {getStatusIcon(metrics.importSuccessRate, 'percentage')}
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.importSuccessRate, 'percentage')}`}>
              {metrics.importSuccessRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Data import success rate
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <LineChart className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Performance Trends</h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Performance trend chart would be rendered here</p>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Resource Usage</h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Resource usage chart would be rendered here</p>
          </div>
        </div>
      </div>

      {/* Storage Optimization */}
      {storage && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Storage Optimization</h3>
            </div>
            <div className="text-sm text-green-600 font-medium">
              Saved: {formatBytes(storage.savings)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Storage Usage</span>
                  <span>{formatBytes(storage.totalSize)} → {formatBytes(storage.optimizedSize)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: `${(storage.optimizedSize / storage.totalSize) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Size:</span>
                  <span>{formatBytes(storage.totalSize)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Optimized Size:</span>
                  <span className="text-green-600">{formatBytes(storage.optimizedSize)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Space Saved:</span>
                  <span className="text-green-600">{formatBytes(storage.savings)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Optimization Recommendations</h4>
              <ul className="space-y-2">
                {storage.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Bundle Analysis */}
      {bundle && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Bundle Analysis</h3>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total Bundle Size</span>
              <span className={`text-lg font-bold ${getMetricColor(bundle.totalSize, 'size')}`}>
                {formatBytes(bundle.totalSize)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chunk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modules
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bundle.chunks.map((chunk, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {chunk.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatBytes(chunk.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {chunk.modules}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${(chunk.size / bundle.totalSize) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {((chunk.size / bundle.totalSize) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};