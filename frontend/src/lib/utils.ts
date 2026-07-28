import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const formatBytes = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(Number.isInteger(size) ? 0 : 1)} ${units[unitIndex]}`;
};

export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds == null || Number.isNaN(seconds)) {
    return 'N/A';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
};

export const formatDurationMs = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) {
    return 'N/A';
  }

  const totalSeconds = Math.round(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

export const formatDateTime = (value: string): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
};

export const getParentDirectory = (targetPath: string): string => {
  const normalized = targetPath.replace(/\\/g, '/');
  const isAbsolute = normalized.startsWith('/');
  const segments = normalized.split('/').filter(Boolean);
  segments.pop();
  const result = `${isAbsolute ? '/' : ''}${segments.join('/')}`;
  return result || targetPath;
};
