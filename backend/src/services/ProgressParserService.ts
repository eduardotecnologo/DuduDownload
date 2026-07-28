import type { DownloadProgress } from '../types/download.js';

const defaultProgress = (status: DownloadProgress['status'] = 'starting'): DownloadProgress => ({
  percent: 0,
  speed: 'N/A',
  eta: 'N/A',
  downloadedBytes: null,
  totalBytes: null,
  size: 'N/A',
  status
});

const parseHumanSize = (input: string | undefined): number | null => {
  if (!input || input === 'N/A') {
    return null;
  }

  const match = input.trim().match(/^([0-9]+(?:\.[0-9]+)?)\s*([KMGTP]?i?B)$/i);
  if (!match) {
    return null;
  }

  const value = Number.parseFloat(match[1] ?? '0');
  const unit = (match[2] ?? 'B').toUpperCase();
  const factors: Record<string, number> = {
    B: 1,
    KB: 1000,
    MB: 1000 ** 2,
    GB: 1000 ** 3,
    TB: 1000 ** 4,
    PB: 1000 ** 5,
    KIB: 1024,
    MIB: 1024 ** 2,
    GIB: 1024 ** 3,
    TIB: 1024 ** 4,
    PIB: 1024 ** 5
  };

  return Math.round(value * (factors[unit] ?? 1));
};

export class ProgressParserService {
  createInitial(): DownloadProgress {
    return defaultProgress('starting');
  }

  parseLine(line: string): DownloadProgress | null {
    const cleaned = line.trim();
    if (!cleaned.startsWith('[download]')) {
      return null;
    }

    const finishedMatch = cleaned.match(/\[download\]\s+100%.*?of\s+([0-9.,]+\s*[A-Za-z]+).*?in\s+([0-9:.]+).*$/);
    if (finishedMatch) {
      return {
        percent: 100,
        speed: 'N/A',
        eta: '00:00',
        downloadedBytes: parseHumanSize(finishedMatch[1]),
        totalBytes: parseHumanSize(finishedMatch[1]),
        size: finishedMatch[1] ?? 'N/A',
        status: 'downloading'
      };
    }

    const match = cleaned.match(
      /\[download\]\s+([0-9]{1,3}(?:\.[0-9]+)?)%.*?of\s+([0-9.,]+\s*[A-Za-z]+)?(?:.*?at\s+(.+?))?(?:\s+ETA\s+([^\s]+))?$/
    );

    if (!match) {
      return null;
    }

    const percent = Number.parseFloat(match[1] ?? '0');
    const size = match[2]?.trim() ?? 'N/A';
    const speed = match[3]?.trim() ?? 'N/A';
    const eta = match[4]?.trim() ?? 'N/A';
    const totalBytes = parseHumanSize(size);
    const downloadedBytes = totalBytes != null ? Math.round(totalBytes * (percent / 100)) : null;

    return {
      percent,
      speed,
      eta,
      downloadedBytes,
      totalBytes,
      size,
      status: percent >= 100 ? 'downloading' : 'downloading'
    };
  }

  complete(size?: string): DownloadProgress {
    const normalizedSize = size?.trim() || 'N/A';
    return {
      percent: 100,
      speed: 'N/A',
      eta: '00:00',
      downloadedBytes: parseHumanSize(normalizedSize),
      totalBytes: parseHumanSize(normalizedSize),
      size: normalizedSize,
      status: 'completed'
    };
  }

  fail(): DownloadProgress {
    return defaultProgress('error');
  }

  pause(current: DownloadProgress): DownloadProgress {
    return { ...current, status: 'paused' };
  }

  cancel(current: DownloadProgress): DownloadProgress {
    return { ...current, status: 'cancelled' };
  }
}
