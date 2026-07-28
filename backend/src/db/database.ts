import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { env } from '../config/env.js';
import { DEFAULT_SETTINGS } from '../config/constants.js';

const dataDirectory = path.dirname(env.databasePath);
fs.mkdirSync(dataDirectory, { recursive: true });

export const database = new Database(env.databasePath);
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');

export const initDatabase = (): void => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      defaultDownloadPath TEXT NOT NULL,
      theme TEXT NOT NULL,
      maxConcurrentDownloads INTEGER NOT NULL,
      autoUpdateYtDlp INTEGER NOT NULL,
      autoUpdateFfmpeg INTEGER NOT NULL,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      format TEXT NOT NULL,
      downloadedAt TEXT NOT NULL,
      downloadTimeMs INTEGER NOT NULL,
      sizeBytes INTEGER,
      outputPath TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_history_format ON history(format);
    CREATE INDEX IF NOT EXISTS idx_history_title ON history(title);
    CREATE INDEX IF NOT EXISTS idx_history_downloadedAt ON history(downloadedAt);
  `);

  const existing = database.prepare('SELECT id FROM settings WHERE id = 1').get() as { id?: number } | undefined;

  if (!existing) {
    database
      .prepare(
        `
          INSERT INTO settings (
            id,
            defaultDownloadPath,
            theme,
            maxConcurrentDownloads,
            autoUpdateYtDlp,
            autoUpdateFfmpeg
          ) VALUES (1, @defaultDownloadPath, @theme, @maxConcurrentDownloads, @autoUpdateYtDlp, @autoUpdateFfmpeg)
        `
      )
      .run({
        defaultDownloadPath: DEFAULT_SETTINGS.defaultDownloadPath,
        theme: DEFAULT_SETTINGS.theme,
        maxConcurrentDownloads: DEFAULT_SETTINGS.maxConcurrentDownloads,
        autoUpdateYtDlp: Number(DEFAULT_SETTINGS.autoUpdateYtDlp),
        autoUpdateFfmpeg: Number(DEFAULT_SETTINGS.autoUpdateFfmpeg)
      });
  }
};