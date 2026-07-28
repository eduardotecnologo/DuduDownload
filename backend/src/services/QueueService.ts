import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket.js';
import type { DownloadJob, DownloadProgress, DownloadRequest, VideoMetadata } from '../types/download.js';
import type { DownloadService } from './DownloadService.js';
import type { HistoryService } from './HistoryService.js';
import type { SettingsService } from './SettingsService.js';

interface QueueItem {
  job: DownloadJob;
  running?: ReturnType<DownloadService['startDownload']>;
  metadata?: VideoMetadata | null;
}

export class QueueService {
  private readonly jobs = new Map<string, QueueItem>();
  private socket?: Server<ClientToServerEvents, ServerToClientEvents>;
  private maxConcurrentDownloads: number;

  constructor(
    private readonly downloadService: DownloadService,
    private readonly historyService: HistoryService,
    private readonly settingsService: SettingsService
  ) {
    this.maxConcurrentDownloads = this.settingsService.getSettings().maxConcurrentDownloads;
  }

  attachSocket(socket: Server<ClientToServerEvents, ServerToClientEvents>): void {
    this.socket = socket;
  }

  setConcurrency(limit: number): void {
    this.maxConcurrentDownloads = Math.max(1, limit);
    this.emitQueueState();
    this.pump();
  }

  getJobs(): DownloadJob[] {
    return Array.from(this.jobs.values()).map((item) => item.job);
  }

  getJob(jobId: string): DownloadJob | undefined {
    return this.jobs.get(jobId)?.job;
  }

  enqueue(request: DownloadRequest, metadata?: VideoMetadata | null): DownloadJob {
    const id = randomUUID();
    const job: DownloadJob = {
      id,
      request,
      metadata: metadata ?? null,
      status: 'queued',
      progress: {
        percent: 0,
        speed: 'N/A',
        eta: 'N/A',
        downloadedBytes: null,
        totalBytes: null,
        size: 'N/A',
        status: 'queued'
      },
      createdAt: new Date().toISOString()
    };

    this.jobs.set(id, { job, metadata: metadata ?? null });
    this.emit('download:queued', job);
    this.emitQueueState();
    this.pump();
    return job;
  }

  cancel(jobId: string): DownloadJob {
    const item = this.jobs.get(jobId);
    if (!item) {
      throw new Error('Download não encontrado.');
    }

    if (item.running) {
      this.downloadService.cancel(item.running);
    }
    item.job.status = 'cancelled';
    item.job.endedAt = new Date().toISOString();
    item.job.progress = { ...item.job.progress, status: 'cancelled' };
    this.emit('download:cancelled', item.job);
    this.emitQueueState();
    this.pump();
    return item.job;
  }

  pause(jobId: string): DownloadJob {
    const item = this.jobs.get(jobId);
    if (!item) {
      throw new Error('Download não encontrado.');
    }

    if (item.running && this.downloadService.pause(item.running)) {
      item.job.status = 'paused';
      item.job.progress = { ...item.job.progress, status: 'paused' };
      this.emitQueueState();
    }

    return item.job;
  }

  resume(jobId: string): DownloadJob {
    const item = this.jobs.get(jobId);
    if (!item) {
      throw new Error('Download não encontrado.');
    }

    if (item.running && this.downloadService.resume(item.running)) {
      item.job.status = 'downloading';
      item.job.progress = { ...item.job.progress, status: 'downloading' };
      this.emitQueueState();
    }

    return item.job;
  }

  private getRunningCount(): number {
    return Array.from(this.jobs.values()).filter((item) => item.job.status === 'starting' || item.job.status === 'downloading' || item.job.status === 'paused').length;
  }

  private pump(): void {
    const runningCount = this.getRunningCount();
    if (runningCount >= this.maxConcurrentDownloads) {
      return;
    }

    const nextItem = Array.from(this.jobs.values()).find((item) => item.job.status === 'queued');
    if (!nextItem) {
      return;
    }

    nextItem.job.status = 'starting';
    nextItem.job.startedAt = new Date().toISOString();
    this.emit('download:started', nextItem.job);
    this.emitQueueState();

    const settings = this.settingsService.getSettings();
    nextItem.running = this.downloadService.startDownload(nextItem.job, settings, {
      onProgress: (progress) => this.updateProgress(nextItem.job.id, progress),
      onComplete: (payload) => this.completeJob(nextItem.job.id, payload.outputFile, payload.sizeBytes, payload.durationMs),
      onError: (errorMessage) => this.failJob(nextItem.job.id, errorMessage)
    });

    nextItem.job.status = 'downloading';
    this.emitQueueState();
    this.pump();
  }

  private updateProgress(jobId: string, progress: DownloadProgress): void {
    const item = this.jobs.get(jobId);
    if (!item) {
      return;
    }

    item.job.progress = progress;
    item.job.status = progress.status === 'paused' ? 'paused' : 'downloading';
    this.emit('download:progress', { jobId, progress });
  }

  private completeJob(jobId: string, outputFile: string | null, sizeBytes: number | null, durationMs: number): void {
    const item = this.jobs.get(jobId);
    if (!item) {
      return;
    }

    const finalOutput = outputFile ?? this.deriveFallbackOutput(item.job);
    item.job.status = 'completed';
    item.job.endedAt = new Date().toISOString();
    item.job.outputFile = finalOutput;
    item.job.progress = { ...item.job.progress, percent: 100, status: 'completed' };

    const title = item.metadata?.title ?? item.job.metadata?.title ?? path.basename(finalOutput);
    const requestTitle = item.job.request.title?.trim();
    this.historyService.create({
      title: requestTitle || title,
      url: item.job.request.url,
      format: item.job.request.format,
      downloadedAt: item.job.endedAt,
      downloadTimeMs: durationMs,
      sizeBytes,
      outputPath: finalOutput
    });

    this.emit('download:completed', item.job);
    this.emitQueueState();
    this.jobs.delete(jobId);
    this.pump();
  }

  private failJob(jobId: string, errorMessage: string): void {
    const item = this.jobs.get(jobId);
    if (!item) {
      return;
    }

    item.job.status = item.job.status === 'cancelled' ? 'cancelled' : 'error';
    item.job.endedAt = new Date().toISOString();
    item.job.error = errorMessage;
    item.job.progress = { ...item.job.progress, status: item.job.status };

    if (item.job.status === 'error') {
      this.emit('download:error', { jobId, error: errorMessage });
    }

    this.emitQueueState();
    this.jobs.delete(jobId);
    this.pump();
  }

  private deriveFallbackOutput(job: DownloadJob): string {
    const baseDirectory = job.request.outputPath?.trim() || this.settingsService.getSettings().defaultDownloadPath;
    return path.join(baseDirectory, job.request.title?.trim() || 'yt-dlp-output');
  }

  private emit<K extends keyof ServerToClientEvents>(event: K, ...args: Parameters<ServerToClientEvents[K]>): void {
    this.socket?.emit(event, ...args);
  }

  private emitQueueState(): void {
    this.socket?.emit('queue:changed', this.getJobs());
  }
}
