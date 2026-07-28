import { database } from '../db/database.js';
import { DEFAULT_SETTINGS } from '../config/constants.js';
import type { AppSettings } from '../types/download.js';

const normalizeSettings = (row: Record<string, unknown> | undefined): AppSettings => {
  if (!row) {
    return {
      defaultDownloadPath: DEFAULT_SETTINGS.defaultDownloadPath,
      theme: DEFAULT_SETTINGS.theme,
      maxConcurrentDownloads: DEFAULT_SETTINGS.maxConcurrentDownloads,
      autoUpdateYtDlp: DEFAULT_SETTINGS.autoUpdateYtDlp,
      autoUpdateFfmpeg: DEFAULT_SETTINGS.autoUpdateFfmpeg
    };
  }

  return {
    defaultDownloadPath: String(row.defaultDownloadPath ?? DEFAULT_SETTINGS.defaultDownloadPath),
    theme: (row.theme as AppSettings['theme']) ?? DEFAULT_SETTINGS.theme,
    maxConcurrentDownloads: Number(row.maxConcurrentDownloads ?? DEFAULT_SETTINGS.maxConcurrentDownloads),
    autoUpdateYtDlp: Boolean(row.autoUpdateYtDlp),
    autoUpdateFfmpeg: Boolean(row.autoUpdateFfmpeg)
  };
};

export class SettingsService {
  getSettings(): AppSettings {
    const row = database.prepare('SELECT * FROM settings WHERE id = 1').get() as Record<string, unknown> | undefined;
    return normalizeSettings(row);
  }

  updateSettings(nextSettings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const merged: AppSettings = {
      ...current,
      ...nextSettings
    };

    database
      .prepare(
        `
          UPDATE settings
          SET defaultDownloadPath = @defaultDownloadPath,
              theme = @theme,
              maxConcurrentDownloads = @maxConcurrentDownloads,
              autoUpdateYtDlp = @autoUpdateYtDlp,
              autoUpdateFfmpeg = @autoUpdateFfmpeg,
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = 1
        `
      )
      .run({
        defaultDownloadPath: merged.defaultDownloadPath,
        theme: merged.theme,
        maxConcurrentDownloads: merged.maxConcurrentDownloads,
        autoUpdateYtDlp: Number(merged.autoUpdateYtDlp),
        autoUpdateFfmpeg: Number(merged.autoUpdateFfmpeg)
      });

    return merged;
  }
}