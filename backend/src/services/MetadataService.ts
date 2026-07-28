import type { VideoMetadata } from '../types/download.js';
import { env } from '../config/env.js';
import { runSpawn } from '../utils/process.js';

export class MetadataService {
  async fetch(url: string): Promise<VideoMetadata> {
    const result = await runSpawn(env.ytDlpPath, ['--dump-single-json', '--no-playlist', url]);

    if (result.code !== 0) {
      throw new Error(result.stderr.trim() || 'Falha ao consultar metadados do yt-dlp.');
    }

    const raw = JSON.parse(result.stdout) as Record<string, unknown>;
    const channel = (raw.channel ?? raw.uploader ?? raw.channel_id ?? 'Desconhecido') as string;

    return {
      title: String(raw.title ?? 'Sem título'),
      channel,
      thumbnail: String(raw.thumbnail ?? ''),
      duration: typeof raw.duration === 'number' ? raw.duration : null,
      views: typeof raw.view_count === 'number' ? raw.view_count : null,
      description: String(raw.description ?? ''),
      uploader: typeof raw.uploader === 'string' ? raw.uploader : undefined,
      webpageUrl: typeof raw.webpage_url === 'string' ? raw.webpage_url : url,
      isPlaylist: Boolean(raw._type === 'playlist'),
      playlistCount: typeof raw.playlist_count === 'number' ? raw.playlist_count : null
    };
  }
}
