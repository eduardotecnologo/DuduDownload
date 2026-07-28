import type { DownloadJob, DownloadRecord, AppSettings, VideoMetadata } from './download.js';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface MetadataResponse {
  metadata: VideoMetadata;
}

export interface QueueResponse {
  job: DownloadJob;
}

export interface HistoryResponse {
  items: DownloadRecord[];
  total: number;
}

export interface SettingsResponse {
  settings: AppSettings;
}
