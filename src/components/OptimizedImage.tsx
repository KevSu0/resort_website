import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  getOptimizedImageUrl, 
  generateResponsiveSrcSet, 
  getBestImageFormat,
  imageCache,
  type ImageOptimizationOptions 
} from '../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  quality = 80,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  onLoad,
  onError 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized URLs
  const optimizationOptions: ImageOptimizationOptions = {
    width,
    height,
    quality,
    format: getBestImageFormat()
  };

  const optimizedSrc = getOptimizedImageUrl(src, optimizationOptions);
  const srcSet = generateResponsiveSrcSet(src);

  useEffect(() => {
    // Check cache first
    const cacheKey = `${src}-${width}-${height}-${quality}`;
    if (imageCache.has(cacheKey)) {
      setCurrentSrc(imageCache.get(cacheKey)!);
      setIsLoaded(true);
      return;
    }

    if (priority) {
      setCurrentSrc(optimizedSrc);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setCurrentSrc(optimizedSrc);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, optimizedSrc, priority, width, height, quality]);

  const handleLoad = () => {
    setIsLoaded(true);
    
    // Cache the loaded image
    const cacheKey = `${src}-${width}-${height}-${quality}`;
    imageCache.set(cacheKey, currentSrc);
    
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-200 ${className}`}
    >
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-300 rounded mx-auto mb-2"></div>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}
      
      {currentSrc && (
        <img
          src={currentSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
}