// Performance monitoring and optimization utilities

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: string;
  context?: Record<string, any>;
  tags?: string[];
}

export interface PerformanceReport {
  timestamp: string;
  metrics: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    averageValue: number;
    minValue: number;
    maxValue: number;
  };
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  enableProfiling: boolean;
  enableResourceTracking: boolean;
  enableInteractionTracking: boolean;
  sampleRate: number;
  maxMetrics: number;
  alertThresholds: Record<string, { value: number; operator: 'gt' | 'lt' }>;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableMetrics: true,
  enableProfiling: true,
  enableResourceTracking: true,
  enableInteractionTracking: true,
  sampleRate: 0.1, // 10% sampling
  maxMetrics: 1000,
  alertThresholds: {
    'pageLoad': { value: 3000, operator: 'gt' },
    'firstPaint': { value: 1000, operator: 'gt' },
    'firstContentfulPaint': { value: 1500, operator: 'gt' },
    'largestContentfulPaint': { value: 2500, operator: 'gt' },
    'cumulativeLayoutShift': { value: 0.1, operator: 'gt' },
    'timeToInteractive': { value: 3500, operator: 'gt' },
    'memoryUsage': { value: 50, operator: 'gt' }
  }
};

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private interactionCallback: ((event: Event) => void) | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initialize();
  }

  private initialize(): void {
    if (!this.config.enableMetrics || typeof window === 'undefined') return;

    // Initialize observers
    if (this.config.enableResourceTracking) {
      this.setupResourceObserver();
    }

    if (this.config.enableInteractionTracking) {
      this.setupInteractionTracking();
    }

    // Setup page load metrics
    this.setupPageLoadMetrics();

    // Setup memory monitoring if available
    if ('memory' in performance) {
      this.setupMemoryMonitoring();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  private setupResourceObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.recordMetric('resourceLoad', entry.duration, 'ms', {
              url: (entry as PerformanceResourceTiming).name,
              type: (entry as PerformanceResourceTiming).initiatorType,
              size: (entry as PerformanceResourceTiming).transferSize
            });
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Resource observer not supported');
    }
  }

  private setupInteractionTracking(): void {
    // Track interaction to next paint (INP)
    const handleInteraction = (event: Event) => {
      if (!('performance' in window) || !('InteractionCount' in window.PerformanceEntry)) {
        return;
      }

      // This is a simplified version - real INP tracking is more complex
      this.recordMetric('interaction', Date.now(), 'ms', {
        type: event.type,
        target: (event.target as Element)?.tagName
      });
    };

    this.interactionCallback = handleInteraction;
    ['click', 'keydown', 'pointerdown'].forEach(type => {
      document.addEventListener(type, handleInteraction, { passive: true });
    });
  }

  private setupPageLoadMetrics(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.recordMetric('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
        this.recordMetric('pageLoad', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
        this.recordMetric('firstByte', navigation.responseStart - navigation.requestStart, 'ms');
      }

      // Paint timing
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          this.recordMetric('firstPaint', entry.startTime, 'ms');
        }
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('firstContentfulPaint', entry.startTime, 'ms');
        }
      });

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('largestContentfulPaint', lastEntry.startTime, 'ms', {
            element: (lastEntry as any).element
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // Layout shifts
      let clsValue = 0;
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.recordMetric('cumulativeLayoutShift', clsValue, 'count');
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private setupMemoryMonitoring(): void {
    if (performance.memory) {
      setInterval(() => {
        const memory = performance.memory as any;
        this.recordMetric('jsHeapSizeLimit', memory.jsHeapSizeLimit, 'bytes');
        this.recordMetric('totalJSHeapSize', memory.totalJSHeapSize, 'bytes');
        this.recordMetric('usedJSHeapSize', memory.usedJSHeapSize, 'bytes');

        // Calculate memory usage percentage
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        this.recordMetric('memoryUsage', usagePercent, 'percent');
      }, 5000);
    }
  }

  recordMetric(
    name: string,
    value: number,
    unit: PerformanceMetric['unit'] = 'ms',
    context?: Record<string, any>,
    tags?: string[]
  ): void {
    if (!this.config.enableMetrics) return;

    // Apply sampling
    if (Math.random() > this.config.sampleRate) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      context,
      tags
    };

    this.metrics.push(metric);

    // Keep metrics under limit
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }

    // Check thresholds and alert
    this.checkThresholds(metric);

    // Store in localStorage for persistence
    this.persistMetrics();
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.config.alertThresholds[metric.name];
    if (!threshold) return;

    const { value: thresholdValue, operator } = threshold;
    const shouldAlert = operator === 'gt' ? metric.value > thresholdValue : metric.value < thresholdValue;

    if (shouldAlert) {
      console.warn(`Performance threshold exceeded: ${metric.name} = ${metric.value} ${metric.unit} (threshold: ${thresholdValue})`);

      // Dispatch custom event for UI to handle
      window.dispatchEvent(new CustomEvent('performanceAlert', {
        detail: { metric, threshold }
      }));
    }
  }

  private persistMetrics(): void {
    try {
      // Store only recent metrics to avoid localStorage limits
      const recentMetrics = this.metrics.slice(-100);
      localStorage.setItem('performance_metrics', JSON.stringify(recentMetrics));
    } catch (e) {
      console.warn('Failed to persist performance metrics');
    }
  }

  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem('performance_metrics');
      if (stored) {
        this.metrics = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load performance metrics');
    }
  }

  // Public API
  startMeasure(name: string, context?: Record<string, any>): () => void {
    const startTime = performance.now();
    const markName = `measure_${name}_${Date.now()}`;

    performance.mark(markName);

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      performance.mark(`${markName}_end`);
      performance.measure(name, markName, `${markName}_end`);

      this.recordMetric(name, duration, 'ms', context);

      // Clean up marks
      performance.clearMarks(markName);
      performance.clearMarks(`${markName}_end`);
    };
  }

  measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name: string = fn.name || 'anonymous'
  ): T {
    return ((...args: Parameters<T>) => {
      const endMeasure = this.startMeasure(name, { args: args.length });
      try {
        const result = fn.apply(this, args);
        if (result instanceof Promise) {
          return result.finally(endMeasure);
        }
        endMeasure();
        return result;
      } catch (error) {
        endMeasure();
        throw error;
      }
    }) as T;
  }

  getMetrics(options?: {
    name?: string;
    since?: Date;
    limit?: number;
  }): PerformanceMetric[] {
    let filtered = [...this.metrics];

    if (options) {
      if (options.name) {
        filtered = filtered.filter(m => m.name === options.name);
      }
      if (options.since) {
        filtered = filtered.filter(m => new Date(m.timestamp) >= options.since);
      }
      if (options.limit) {
        filtered = filtered.slice(-options.limit);
      }
    }

    return filtered.reverse();
  }

  getReport(): PerformanceReport {
    const summary = {
      totalMetrics: this.metrics.length,
      averageValue: 0,
      minValue: Infinity,
      maxValue: -Infinity
    };

    if (this.metrics.length > 0) {
      const values = this.metrics.map(m => m.value);
      summary.averageValue = values.reduce((a, b) => a + b, 0) / values.length;
      summary.minValue = Math.min(...values);
      summary.maxValue = Math.max(...values);
    }

    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary
    };
  }

  clearMetrics(): void {
    this.metrics = [];
    localStorage.removeItem('performance_metrics');
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    if (this.interactionCallback) {
      ['click', 'keydown', 'pointerdown'].forEach(type => {
        document.removeEventListener(type, this.interactionCallback!);
      });
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for performance monitoring
export function usePerformance() {
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics({ limit: 50 }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    startMeasure: performanceMonitor.startMeasure.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor)
  };
}

// Performance monitoring utilities
export const perf = {
  // Start a performance measurement
  start: (name: string, context?: Record<string, any>) => {
    return performanceMonitor.startMeasure(name, context);
  },

  // Wrap a function for automatic performance measurement
  measure: <T extends (...args: any[]) => any>(
    fn: T,
    name?: string
  ) => {
    return performanceMonitor.measureFunction(fn, name);
  },

  // Record a custom metric
  mark: (name: string, value: number, unit?: 'ms' | 'bytes' | 'count' | 'percent') => {
    performanceMonitor.recordMetric(name, value, unit);
  },

  // Get current performance metrics
  getMetrics: (options?: Parameters<typeof performanceMonitor.getMetrics>[0]) => {
    return performanceMonitor.getMetrics(options);
  },

  // Check if performance APIs are available
  supported: typeof window !== 'undefined' && 'performance' in window,

  // Get Web Vitals (simplified)
  getWebVitals: () => {
    if (!perf.supported) return null;

    const metrics = perf.getMetrics();
    return {
      firstPaint: metrics.find(m => m.name === 'firstPaint')?.value,
      firstContentfulPaint: metrics.find(m => m.name === 'firstContentfulPaint')?.value,
      largestContentfulPaint: metrics.find(m => m.name === 'largestContentfulPaint')?.value,
      cumulativeLayoutShift: metrics.find(m => m.name === 'cumulativeLayoutShift')?.value,
      timeToInteractive: metrics.find(m => m.name === 'timeToInteractive')?.value
    };
  }
};

// Lazy loading utilities
export class LazyLoadManager {
  private observers: Map<string, IntersectionObserver> = new Map();

  constructor() {
    this.setupDefaultObserver();
  }

  private setupDefaultObserver(): void {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          this.loadElement(element);
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: '50px 0px', // Load 50px before viewport
      threshold: 0.01
    });

    this.observers.set('default', observer);
  }

  private loadElement(element: HTMLElement): void {
    const loadType = element.dataset.lazyLoad;

    switch (loadType) {
      case 'image':
        this.loadImage(element);
        break;
      case 'component':
        this.loadComponent(element);
        break;
      case 'iframe':
        this.loadIframe(element);
        break;
      default:
        this.loadDefault(element);
    }
  }

  private loadImage(element: HTMLElement): void {
    const img = element as HTMLImageElement;
    const src = img.dataset.src;

    if (src) {
      img.src = src;
      img.classList.add('loaded');
    }
  }

  private loadComponent(element: HTMLElement): void {
    const componentName = element.dataset.component;
    if (componentName) {
      // Dispatch event for component loading
      element.dispatchEvent(new CustomEvent('lazyLoad', {
        detail: { component: componentName }
      }));
    }
  }

  private loadIframe(element: HTMLElement): void {
    const iframe = element as HTMLIFrameElement;
    const src = iframe.dataset.src;

    if (src) {
      iframe.src = src;
    }
  }

  private loadDefault(element: HTMLElement): void {
    element.classList.add('loaded');
  }

  observe(element: HTMLElement, options?: IntersectionObserverInit): void {
    const observer = this.observers.get('default');
    if (observer) {
      observer.observe(element);
    }
  }

  unobserve(element: HTMLElement): void {
    const observer = this.observers.get('default');
    if (observer) {
      observer.unobserve(element);
    }
  }
}

export const lazyLoadManager = new LazyLoadManager();

// Caching utilities
export class CacheManager<K extends string | number, V> {
  private cache: Map<K, { value: V; expires: number; accessTime: number }> = new Map();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: K, value: V, ttl: number = this.defaultTTL): void {
    const now = Date.now();

    // Evict if necessary
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      expires: now + ttl,
      accessTime: now
    });
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    const now = Date.now();

    if (!item) return undefined;

    // Check expiration
    if (now > item.expires) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access time
    item.accessTime = now;
    return item.value;
  }

  has(key: K): boolean {
    return this.cache.has(key) && this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evict(): void {
    // LRU eviction
    let oldestKey: K | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache) {
      if (item.accessTime < oldestTime) {
        oldestTime = item.accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey !== null) {
      this.cache.delete(oldestKey);
    }
  }

  getStats(): {
    size: number;
    hitRate: number;
    hits: number;
    misses: number;
  } {
    // Note: This is a simplified version - in a real implementation,
    // you'd track hits and misses separately
    return {
      size: this.cache.size,
      hitRate: 0,
      hits: 0,
      misses: 0
    };
  }
}

// Image optimization utilities
export const imageUtils = {
  // Generate responsive image srcset
  generateSrcset(baseUrl: string, widths: number[]): string {
    return widths
      .map(width => `${baseUrl}?width=${width} ${width}w`)
      .join(', ');
  },

  // Calculate appropriate image size based on container
  calculateSize(containerWidth: number, devicePixelRatio = 1): number {
    return Math.round(containerWidth * devicePixelRatio);
  },

  // Check if image format is supported
  supportsFormat(format: 'webp' | 'avif'): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
  }
};