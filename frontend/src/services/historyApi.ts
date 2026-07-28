import type { DownloadRecord, DownloadFormat } from '../types/download';
import type { ApiResponse, HistoryResponse } from '../types/api';
import { api } from './api';

export interface HistoryQuery {
  search?: string;
  format?: DownloadFormat;
  limit?: number;
  offset?: number;
}

export const historyApi = {
  list: async (query: HistoryQuery = {}): Promise<{ items: DownloadRecord[]; total: number }> => {
    const response = await api.get<ApiResponse<HistoryResponse>>('/history', { params: query });
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/history/${id}`);
  },
  clear: async (): Promise<void> => {
    await api.delete('/history');
  },
  openPath: async (outputPath: string): Promise<void> => {
    await api.post('/history/open', { outputPath });
  }
};
