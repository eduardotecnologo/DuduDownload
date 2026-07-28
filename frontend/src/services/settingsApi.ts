import type { AppSettings } from '../types/download';
import type { ApiResponse, SettingsResponse } from '../types/api';
import { api } from './api';

export const settingsApi = {
  get: async (): Promise<AppSettings> => {
    const response = await api.get<ApiResponse<SettingsResponse>>('/settings');
    return response.data.data.settings;
  },
  save: async (settings: AppSettings): Promise<AppSettings> => {
    const response = await api.put<ApiResponse<SettingsResponse>>('/settings', settings);
    return response.data.data.settings;
  }
};
