import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SyntheticEvent } from 'react';
import { IMAGE_PLACEHOLDER } from '@/constants/images';
import { logger } from '../lib/logger';

// Utility for combining CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Indian Rupees
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format phone number to E.164 format (Indian numbers)
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 91, remove it
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // If 10 digits, add +91
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // If already has +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }

  return phone; // Return original if can't format
}

// Validate Indian phone number
export function validateIndianPhone(phone: string): boolean {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Calculate number of nights between two dates
export function calculateNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate days in advance
export function calculateDaysInAdvance(checkinDate: string): number {
  const checkin = new Date(checkinDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  checkin.setHours(0, 0, 0, 0);
  const diffTime = checkin.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get day of week (0 = Sunday, 6 = Saturday)
export function getDayOfWeek(date: string): number {
  return new Date(date).getDay();
}

// Check if date is within range
export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const check = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return check >= start && check <= end;
}

// Check if date is in blackout dates
export function isDateBlacklisted(date: string, blackoutDates: string[]): boolean {
  return blackoutDates.some(blackout => isDateInRange(date, blackout, blackout));
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Get random item from array
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - 3) + '...';
}

// Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Get URL parameters as object
export function getUrlParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    logger.error('Failed to copy text to clipboard', {
      module: 'Utils',
      function: 'copyToClipboard',
      error: err instanceof Error ? err.message : String(err),
      textLength: text.length,
      category: 'utility'
    });
    return false;
  }
}

// Scroll to element
export function scrollToElement(elementId: string, offset = 0): void {
  const element = document.getElementById(elementId);
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

// Check if element is in viewport
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Lazy load images
export function lazyLoadImage(imageElement: HTMLImageElement, src: string): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        imageElement.src = src;
        observer.unobserve(imageElement);
      }
    });
  });

  observer.observe(imageElement);
}

// Provide a resilient image fallback handler
export function fallbackImageHandler(
  event: SyntheticEvent<HTMLImageElement>,
  fallbackSrc: string = IMAGE_PLACEHOLDER
): void {
  const target = event.currentTarget;
  if (target.src === fallbackSrc) {
    return;
  }

  // Prevent endless error loops
  target.onerror = null;
  target.src = fallbackSrc;
}

// Format bytes to human readable format
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}