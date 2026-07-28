import type { DownloadFormat, DownloadQuality } from '../types/download.js';

export const DEFAULT_SETTINGS = {
  defaultDownloadPath: process.cwd(),
  theme: 'system',
  maxConcurrentDownloads: 2,
  autoUpdateYtDlp: false,
  autoUpdateFfmpeg: false
} as const;

export const SUPPORTED_FORMATS: DownloadFormat[] = ['mp3', 'm4a', 'mp4', 'mkv', 'webm'];
export const SUPPORTED_QUALITIES: DownloadQuality[] = ['best', '1080p', '720p', '480p', '360p'];
export const SUPPORTED_MP3_BITRATES = [128, 192, 256, 320] as const;