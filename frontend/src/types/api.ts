import type { AppSettings, DownloadJob, DownloadRecord, DownloadRequest, VideoMetadata } from './download.js';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface MetadataResponse {
  metadata: VideoMetadata;
}

export interface JobResponse {
  job: DownloadJob;
}

export interface SelectFolderResponse {
  folderPath: string | null;
}

export interface JobsResponse {
  jobs: DownloadJob[];
}

export interface HistoryResponse {
  items: DownloadRecord[];
  total: number;
}

export interface SettingsResponse {
  settings: AppSettings;
}

export type StartDownloadPayload = DownloadRequest;
