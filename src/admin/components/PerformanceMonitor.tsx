import React, { useState, useEffect } from 'react';
import { performanceMonitor, perf, type PerformanceMetric } from '../utils/performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Clock,
  Database,
  MemoryStick
} from 'lucide-react';

interface PerformanceMonitorProps {
  showInDevOnly?: boolean;
}

export function PerformanceMonitor({ showInDevOnly = true }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [vitals, setVitals] = useState<any>(null);

  useEffect(() => {
    if (showInDevOnly && process.env.NODE_ENV !== 'development') {
      return;
    }

    const interval = setInterval(() => {
      const recentMetrics = performanceMonitor.getMetrics({ limit: 20 });
      setMetrics(recentMetrics);
      setVitals(perf.getWebVitals());
    }, 1000);

    // Listen for performance alerts
    const handleAlert = (event: CustomEvent) => {
      const { metric, threshold } = event.detail;
      console.warn('Performance alert:', metric, threshold);
    };

    window.addEventListener('performanceAlert', handleAlert as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('performanceAlert', handleAlert as EventListener);
    };
  }, [showInDevOnly]);

  if (showInDevOnly && process.env.NODE_ENV !== 'development') {
    return null;
  }

  const formatValue = (value: number, unit: string): string => {
    switch (unit) {
      case 'ms':
        return `${Math.round(value)}ms`;
      case 'bytes':
        return formatBytes(value);
      case 'percent':
        return `${Math.round(value)}%`;
      default:
        return value.toString();
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMetricIcon = (name: string) => {
    if (name.includes('memory') || name.includes('heap')) return <MemoryStick className="h-4 w-4" />;
    if (name.includes('load') || name.includes('page')) return <Activity className="h-4 w-4" />;
    if (name.includes('paint') || name.includes('render')) return <Zap className="h-4 w-4" />;
    return <BarChart3 className="h-4 w-4" />;
  };

  const getMetricStatus = (name: string, value: number): 'good' | 'warning' | 'poor' => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      firstPaint: { good: 1000, poor: 3000 },
      firstContentfulPaint: { good: 1500, poor: 4000 },
      largestContentfulPaint: { good: 2500, poor: 6000 },
      cumulativeLayoutShift: { good: 0.1, poor: 0.25 },
      timeToInteractive: { good: 3500, poor: 7000 },
      memoryUsage: { good: 50, poor: 80 },
      pageLoad: { good: 2000, poor: 5000 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'warning';
    return 'poor';
  };

  const getStatusColor = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
    }
  };

  const getStatusVariant = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good': return 'default' as const;
      case 'warning': return 'secondary' as const;
      case 'poor': return 'destructive' as const;
    }
  };

  const getMetricTrend = (name: string): 'up' | 'down' | 'stable' => {
    const metricHistory = metrics.filter(m => m.name === name).slice(-2);
    if (metricHistory.length < 2) return 'stable';

    const [prev, curr] = metricHistory;
    const diff = curr.value - prev.value;

    if (Math.abs(diff) < 0.01 * prev.value) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const recentMetrics = metrics.slice(0, 10);

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
              {metrics.some(m => getMetricStatus(m.name, m.value) === 'poor') && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => performanceMonitor.clearMetrics()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {showDetails && (
          <CardContent className="space-y-4">
            {/* Core Web Vitals */}
            {vitals && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Core Web Vitals</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(vitals).map(([key, value]) => {
                    if (!value) return null;
                    const status = getMetricStatus(key, value as number);
                    const trend = getMetricTrend(key);
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs ${getStatusColor(status)}`}>
                            {formatValue(value as number, key.includes('LayoutShift') ? 'count' : 'ms')}
                          </span>
                          {trend === 'up' && key !== 'cumulativeLayoutShift' && (
                            <TrendingUp className="h-3 w-3 text-red-500" />
                          )}
                          {trend === 'down' && key !== 'cumulativeLayoutShift' && (
                            <TrendingDown className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Metrics */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground">Recent Metrics</h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {recentMetrics.map((metric, index) => {
                  const status = getMetricStatus(metric.name, metric.value);
                  return (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {getMetricIcon(metric.name)}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{metric.name}</span>
                          <span className={getStatusColor(status)}>
                            {formatValue(metric.value, metric.unit)}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(status)} className="text-xs">
                        {status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Memory Usage */}
            {metrics.find(m => m.name === 'memoryUsage') && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Memory Usage</h4>
                <div className="space-y-1">
                  {metrics
                    .filter(m => m.name.startsWith('memory') || m.name.includes('Heap'))
                    .slice(0, 3)
                    .map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs capitalize">
                          {metric.name.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={metric.unit === 'percent' ? metric.value : undefined}
                            max={100}
                            className="w-16 h-2"
                          />
                          <span className="text-xs w-12 text-right">
                            {formatValue(metric.value, metric.unit)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Performance Score */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Performance Score</span>
                <Badge variant="outline" className="text-sm">
                  {Math.round(
                    metrics.reduce((score, metric) => {
                      const status = getMetricStatus(metric.name, metric.value);
                      return score + (status === 'good' ? 100 : status === 'warning' ? 70 : 40);
                    }, 0) / (metrics.length || 1)
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Hook for performance optimization
export function usePerformanceOptimization() {
  useEffect(() => {
    // Enable passive event listeners for better scroll performance
    const supportsPassive = () => {
      let supports = false;
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get: () => {
            supports = true;
            return true;
          }
        });
        window.addEventListener('test', null as any, opts);
        window.removeEventListener('test', null as any, opts);
      } catch (e) {
        supports = false;
      }
      return supports;
    };

    if (supportsPassive()) {
      // Apply passive event listeners to scroll events
      const scrollHandler = (event: Event) => {
        event.preventDefault();
      };

      document.addEventListener('touchstart', scrollHandler, { passive: true });
      document.addEventListener('touchmove', scrollHandler, { passive: true });

      return () => {
        document.removeEventListener('touchstart', scrollHandler);
        document.removeEventListener('touchmove', scrollHandler);
      };
    }
  }, []);

  return {
    // Defer non-critical operations
    defer: (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback);
      } else {
        setTimeout(callback, 0);
      }
    },

    // Schedule task for next frame
    schedule: (callback: () => void) => {
      if ('requestAnimationFrame' in window) {
        window.requestAnimationFrame(callback);
      } else {
        setTimeout(callback, 16); // ~60fps
      }
    }
  };
}