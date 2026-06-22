import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getImageUrl(path: string | undefined | null): string {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL || ''}/${path}`;
}

export function generateSKU(category: string, brand: string): string {
  const cat = category.slice(0, 3).toUpperCase();
  const br = brand.slice(0, 3).toUpperCase();
  const num = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${cat}-${br}-${num}`;
}
