import { randomUUID } from 'node:crypto';
import path from 'node:path';
export class QueueService {
    downloadService;
    historyService;
    settingsService;
    jobs = new Map();
    socket;
    maxConcurrentDownloads;
    constructor(downloadService, historyService, settingsService) {
        this.downloadService = downloadService;
        this.historyService = historyService;
        this.settingsService = settingsService;
        this.maxConcurrentDownloads = this.settingsService.getSettings().maxConcurrentDownloads;
    }
    attachSocket(socket) {
        this.socket = socket;
    }
    setConcurrency(limit) {
        this.maxConcurrentDownloads = Math.max(1, limit);
        this.emitQueueState();
        this.pump();
    }
    getJobs() {
        return Array.from(this.jobs.values()).map((item) => item.job);
    }
    getJob(jobId) {
        return this.jobs.get(jobId)?.job;
    }
    enqueue(request, metadata) {
        const id = randomUUID();
        const job = {
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
    cancel(jobId) {
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
    pause(jobId) {
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
    resume(jobId) {
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
    getRunningCount() {
        return Array.from(this.jobs.values()).filter((item) => item.job.status === 'starting' || item.job.status === 'downloading' || item.job.status === 'paused').length;
    }
    pump() {
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
    updateProgress(jobId, progress) {
        const item = this.jobs.get(jobId);
        if (!item) {
            return;
        }
        item.job.progress = progress;
        item.job.status = progress.status === 'paused' ? 'paused' : 'downloading';
        this.emit('download:progress', { jobId, progress });
    }
    completeJob(jobId, outputFile, sizeBytes, durationMs) {
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
    failJob(jobId, errorMessage) {
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
    deriveFallbackOutput(job) {
        const baseDirectory = job.request.outputPath?.trim() || this.settingsService.getSettings().defaultDownloadPath;
        return path.join(baseDirectory, job.request.title?.trim() || 'yt-dlp-output');
    }
    emit(event, ...args) {
        this.socket?.emit(event, ...args);
    }
    emitQueueState() {
        this.socket?.emit('queue:changed', this.getJobs());
    }
}
