import type { DownloadJob, DownloadRequest, VideoMetadata } from '../types/download';
import type { ApiResponse, JobsResponse, MetadataResponse, JobResponse, SelectFolderResponse } from '../types/api';
import { api } from './api';

export const downloadApi = {
  searchMetadata: async (url: string): Promise<VideoMetadata> => {
    const response = await api.post<ApiResponse<MetadataResponse>>('/downloads/metadata', { url });
    return response.data.data.metadata;
  },
  startDownload: async (payload: DownloadRequest): Promise<DownloadJob> => {
    const response = await api.post<ApiResponse<JobResponse>>('/downloads', payload);
    return response.data.data.job;
  },
  listActiveDownloads: async (): Promise<DownloadJob[]> => {
    const response = await api.get<ApiResponse<JobsResponse>>('/downloads');
    return response.data.data.jobs;
  },
  pauseDownload: async (jobId: string): Promise<DownloadJob> => {
    const response = await api.patch<ApiResponse<JobResponse>>(`/downloads/${jobId}/pause`);
    return response.data.data.job;
  },
  resumeDownload: async (jobId: string): Promise<DownloadJob> => {
    const response = await api.patch<ApiResponse<JobResponse>>(`/downloads/${jobId}/resume`);
    return response.data.data.job;
  },
  cancelDownload: async (jobId: string): Promise<DownloadJob> => {
    const response = await api.delete<ApiResponse<JobResponse>>(`/downloads/${jobId}`);
    return response.data.data.job;
  },
  chooseFolder: async (): Promise<string | null> => {
    const response = await api.post<ApiResponse<SelectFolderResponse>>('/downloads/select-folder');
    return response.data.data.folderPath;
  }
};
