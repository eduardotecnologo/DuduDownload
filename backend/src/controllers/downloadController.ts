import type { Request, Response } from 'express';
import { z } from 'zod';
import type { DownloadFormat, DownloadQuality, Mp3Bitrate } from '../types/download.js';
import { HttpError } from '../utils/errors.js';
import { pickFolderFromSystem } from '../utils/folderPicker.js';
import type { MetadataService } from '../services/MetadataService.js';
import type { QueueService } from '../services/QueueService.js';
import { SUPPORTED_FORMATS, SUPPORTED_QUALITIES } from '../config/constants.js';

const downloadSchema = z.object({
  url: z.string().url(),
  outputPath: z.string().min(1).optional(),
  format: z.enum(SUPPORTED_FORMATS as [DownloadFormat, ...DownloadFormat[]]),
  quality: z.enum(SUPPORTED_QUALITIES as [DownloadQuality, ...DownloadQuality[]]),
  mp3Bitrate: z.union([z.literal(128), z.literal(192), z.literal(256), z.literal(320)]).optional(),
  playlist: z.boolean().optional(),
  subtitles: z.boolean().optional(),
  thumbnail: z.boolean().optional(),
  metadata: z.boolean().optional(),
  title: z.string().optional()
});

const metadataSchema = z.object({
  url: z.string().url()
});

export class DownloadController {
  constructor(
    private readonly queueService: QueueService,
    private readonly metadataService: MetadataService
  ) {}

  searchMetadata = async (request: Request, response: Response): Promise<void> => {
    const result = metadataSchema.safeParse(request.body);
    if (!result.success) {
      throw new HttpError('URL inválida.', 400, result.error.flatten());
    }

    const metadata = await this.metadataService.fetch(result.data.url);
    response.json({ success: true, data: { metadata } });
  };

  pickFolder = async (_request: Request, response: Response): Promise<void> => {
    const folderPath = await pickFolderFromSystem();

    response.json({
      success: true,
      data: {
        folderPath
      }
    });
  };

  createDownload = async (request: Request, response: Response): Promise<void> => {
    const result = downloadSchema.safeParse(request.body);
    if (!result.success) {
      throw new HttpError('Parâmetros inválidos para download.', 400, result.error.flatten());
    }

    const outputPath = result.data.outputPath ?? undefined;
    const title = result.data.title ?? undefined;

    const job = this.queueService.enqueue(
      {
        ...result.data,
        outputPath,
        title,
        mp3Bitrate: result.data.mp3Bitrate as Mp3Bitrate | undefined
      },
      null
    );

    response.status(201).json({ success: true, data: { job } });
  };

  listDownloads = (_request: Request, response: Response): void => {
    response.json({ success: true, data: { jobs: this.queueService.getJobs() } });
  };

  pauseDownload = (request: Request, response: Response): void => {
    const jobId = typeof request.params.jobId === 'string' ? request.params.jobId : '';
    if (!jobId) {
      throw new HttpError('ID inválido.', 400);
    }

    const job = this.queueService.pause(jobId);
    response.json({ success: true, data: { job } });
  };

  resumeDownload = (request: Request, response: Response): void => {
    const jobId = typeof request.params.jobId === 'string' ? request.params.jobId : '';
    if (!jobId) {
      throw new HttpError('ID inválido.', 400);
    }

    const job = this.queueService.resume(jobId);
    response.json({ success: true, data: { job } });
  };

  cancelDownload = (request: Request, response: Response): void => {
    const jobId = typeof request.params.jobId === 'string' ? request.params.jobId : '';
    if (!jobId) {
      throw new HttpError('ID inválido.', 400);
    }

    const job = this.queueService.cancel(jobId);
    response.json({ success: true, data: { job } });
  };
}
