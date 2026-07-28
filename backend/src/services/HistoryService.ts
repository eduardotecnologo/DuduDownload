import { database } from '../db/database.js';
import type { DownloadRecord, DownloadFormat } from '../types/download.js';

export class HistoryService {
  create(record: Omit<DownloadRecord, 'id'>): DownloadRecord {
    const result = database
      .prepare(
        `
          INSERT INTO history (title, url, format, downloadedAt, downloadTimeMs, sizeBytes, outputPath)
          VALUES (@title, @url, @format, @downloadedAt, @downloadTimeMs, @sizeBytes, @outputPath)
        `
      )
      .run(record);

    return {
      id: Number(result.lastInsertRowid),
      ...record
    };
  }

  list(filters: { search?: string; format?: DownloadFormat; limit?: number; offset?: number }): { items: DownloadRecord[]; total: number } {
    const clauses: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters.search) {
      clauses.push('(title LIKE @search OR url LIKE @search)');
      params.search = `%${filters.search}%`;
    }

    if (filters.format) {
      clauses.push('format = @format');
      params.format = filters.format;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const total = database.prepare(`SELECT COUNT(*) as count FROM history ${whereClause}`).get(params) as { count: number };
    const items = database
      .prepare(
        `
          SELECT id, title, url, format, downloadedAt, downloadTimeMs, sizeBytes, outputPath
          FROM history
          ${whereClause}
          ORDER BY datetime(downloadedAt) DESC, id DESC
          LIMIT @limit OFFSET @offset
        `
      )
      .all({ ...params, limit: filters.limit ?? 50, offset: filters.offset ?? 0 }) as DownloadRecord[];

    return {
      items,
      total: total.count
    };
  }

  delete(id: number): void {
    database.prepare('DELETE FROM history WHERE id = ?').run(id);
  }

  clear(): void {
    database.prepare('DELETE FROM history').run();
  }
}
