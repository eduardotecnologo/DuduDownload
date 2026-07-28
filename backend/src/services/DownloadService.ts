import { spawn, type ChildProcess } from 'node:child_process';
import { env } from '../config/env.js';
import type { DownloadJob, DownloadProgress, AppSettings } from '../types/download.js';
import { ProgressParserService } from './ProgressParserService.js';
import { buildOutputTemplate, buildYtDlpArgs } from './ytdlpPreset.js';
import { ensureDirectory } from '../utils/fs.js';
import { formatBytes, formatDurationMs } from '../utils/format.js';

interface RunningDownload {
  process: ChildProcess;
  startedAt: number;
  outputFile: string | null;
  cancelled: boolean;
  paused: boolean;
}

export interface DownloadLifecycleHandlers {
  onStdout?: (line: string) => void;
  onStderr?: (line: string) => void;
  onProgress?: (progress: DownloadProgress) => void;
  onComplete?: (payload: { outputFile: string | null; sizeBytes: number | null; durationMs: number }) => void;
  onError?: (errorMessage: string) => void;
}

const splitLines = (buffer: string): { lines: string[]; remainder: string } => {
  const chunks = buffer.split(/\r?\n/);
  const remainder = chunks.pop() ?? '';
  return { lines: chunks.filter(Boolean), remainder };
};

const buildYtDlpFailureMessage = (code: number | null, stderrLines: string[]): string => {
  const relevant = stderrLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => /error|unable|failed|unsupported|ffmpeg|forbidden|private|not available/i.test(line));

  const candidates = (relevant.length > 0 ? relevant : stderrLines.map((line) => line.trim()).filter(Boolean)).slice(-3);
  const detail = candidates.join(' | ');
  const exitCode = code ?? -1;

  return detail ? `yt-dlp finalizou com código ${exitCode}: ${detail}` : `yt-dlp finalizou com código ${exitCode}.`;
};

export class DownloadService {
  private readonly parser = new ProgressParserService();

  async fetchMetadata(url: string): Promise<unknown> {
    const child = spawn(env.ytDlpPath, ['--dump-single-json', '--no-playlist', url], { shell: false });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });

    const code = await new Promise<number>((resolve, reject) => {
      child.on('error', reject);
      child.on('close', (exitCode) => resolve(exitCode ?? 0));
    });

    if (code !== 0) {
      throw new Error(stderr.trim() || 'Falha ao obter metadados do yt-dlp.');
    }

    return JSON.parse(stdout || '{}') as unknown;
  }

  startDownload(job: DownloadJob, settings: AppSettings, handlers: DownloadLifecycleHandlers): RunningDownload {
    const outputDirectory = job.request.outputPath?.trim() || settings.defaultDownloadPath;
    ensureDirectory(outputDirectory);

    const outputTemplate = buildOutputTemplate(outputDirectory);
    const args = buildYtDlpArgs(job.request, outputTemplate);
    const child = spawn(env.ytDlpPath, args, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const running: RunningDownload = {
      process: child,
      startedAt: Date.now(),
      outputFile: null,
      cancelled: false,
      paused: false
    };

    let stdoutBuffer = '';
    let stderrBuffer = '';
    const stderrLines: string[] = [];
    let lastProgress = this.parser.createInitial();

    child.stdout.on('data', (chunk: Buffer) => {
      stdoutBuffer += chunk.toString('utf8');
      const result = splitLines(stdoutBuffer);
      stdoutBuffer = result.remainder;

      for (const line of result.lines) {
        handlers.onStdout?.(line);
        if (line.trim()) {
          running.outputFile = line.trim();
        }
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderrBuffer += chunk.toString('utf8');
      const result = splitLines(stderrBuffer);
      stderrBuffer = result.remainder;

      for (const line of result.lines) {
        stderrLines.push(line);
        handlers.onStderr?.(line);
        const progress = this.parser.parseLine(line);
        if (progress) {
          lastProgress = progress;
          handlers.onProgress?.(progress);
        }
      }
    });

    child.on('error', (error) => {
      handlers.onError?.(error.message);
    });

    child.on('close', (code) => {
      const durationMs = Date.now() - running.startedAt;
      if (running.cancelled) {
        handlers.onError?.('Download cancelado pelo usuário.');
        return;
      }

      if (code !== 0) {
        const trailing = stderrBuffer.trim();
        if (trailing) {
          stderrLines.push(trailing);
        }

        handlers.onError?.(buildYtDlpFailureMessage(code, stderrLines));
        return;
      }

      handlers.onProgress?.(this.parser.complete(lastProgress.size));
      handlers.onComplete?.({
        outputFile: running.outputFile,
        sizeBytes: lastProgress.totalBytes,
        durationMs
      });
    });

    return running;
  }

  cancel(running: RunningDownload): void {
    running.cancelled = true;
    running.process.kill('SIGTERM');
  }

  pause(running: RunningDownload): boolean {
    if (process.platform === 'win32') {
      return false;
    }

    if (!running.process.pid) {
      return false;
    }

    running.paused = true;
    process.kill(running.process.pid, 'SIGSTOP');
    return true;
  }

  resume(running: RunningDownload): boolean {
    if (process.platform === 'win32') {
      return false;
    }

    if (!running.process.pid) {
      return false;
    }

    running.paused = false;
    process.kill(running.process.pid, 'SIGCONT');
    return true;
  }

  formatJobSummary(job: DownloadJob, settings: AppSettings): string {
    const target = job.request.outputPath?.trim() || settings.defaultDownloadPath;
    return `${job.request.format.toUpperCase()} -> ${target}`;
  }

  getDisplaySize(bytes: number | null): string {
    return formatBytes(bytes);
  }

  getDisplayDuration(durationMs: number): string {
    return formatDurationMs(durationMs);
  }
}
