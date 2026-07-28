export type DownloadFormat = 'mp3' | 'm4a' | 'mp4' | 'mkv' | 'webm';
export type DownloadQuality = 'best' | '1080p' | '720p' | '480p' | '360p';
export type Mp3Bitrate = 128 | 192 | 256 | 320;
export type DownloadStatus = 'queued' | 'starting' | 'downloading' | 'paused' | 'completed' | 'cancelled' | 'error';

export interface DownloadRequest {
  url: string;
  outputPath?: string | undefined;
  title?: string | undefined;
  format: DownloadFormat;
  quality: DownloadQuality;
  mp3Bitrate?: Mp3Bitrate | undefined;
  playlist?: boolean | undefined;
  subtitles?: boolean | undefined;
  thumbnail?: boolean | undefined;
  metadata?: boolean | undefined;
}

export interface VideoMetadata {
  title: string;
  channel: string;
  thumbnail: string;
  duration: number | null;
  views: number | null;
  description: string;
  uploader?: string | undefined;
  webpageUrl?: string | undefined;
  isPlaylist?: boolean | undefined;
  playlistCount?: number | null | undefined;
}

export interface DownloadProgress {
  percent: number;
  speed: string;
  eta: string;
  downloadedBytes: number | null;
  totalBytes: number | null;
  size: string;
  status: DownloadStatus;
}

export interface DownloadRecord {
  id: number;
  title: string;
  url: string;
  format: DownloadFormat;
  downloadedAt: string;
  downloadTimeMs: number;
  sizeBytes: number | null;
  outputPath: string;
}

export interface AppSettings {
  defaultDownloadPath: string;
  theme: 'light' | 'dark' | 'system';
  maxConcurrentDownloads: number;
  autoUpdateYtDlp: boolean;
  autoUpdateFfmpeg: boolean;
}

export interface DownloadJob {
  id: string;
  request: DownloadRequest;
  metadata?: VideoMetadata | null;
  status: DownloadStatus;
  progress: DownloadProgress;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  outputFile?: string;
  error?: string;
}
