import path from 'node:path';
import { existsSync } from 'node:fs';
import { SUPPORTED_QUALITIES } from '../config/constants.js';
import { env } from '../config/env.js';
import type { DownloadFormat, DownloadQuality, DownloadRequest } from '../types/download.js';

const qualitySelector = (quality: DownloadQuality): string => {
  if (quality === 'best') {
    return 'bv*+ba/b';
  }

  const height = quality.replace('p', '');
  return `bv*[height<=${height}]+ba/b[height<=${height}]`;
};

export const buildOutputTemplate = (directoryPath: string): string => {
  return path.join(directoryPath, '%(title).200s [%(id)s].%(ext)s');
};

export const buildYtDlpArgs = (request: DownloadRequest, outputTemplate: string): string[] => {
  const args: string[] = [
    '--newline',
    '--no-color',
    '--progress',
    '--restrict-filenames',
    '-o',
    outputTemplate,
    '--print',
    'after_move:filepath'
  ];

  if (env.ffmpegPath && env.ffmpegPath !== 'ffmpeg' && existsSync(env.ffmpegPath)) {
    args.unshift(env.ffmpegPath);
    args.unshift('--ffmpeg-location');
  }

  if (request.playlist) {
    args.push('--yes-playlist');
  } else {
    args.push('--no-playlist');
  }

  if (request.subtitles) {
    args.push('--write-subs', '--sub-langs', 'all', '--convert-subs', 'srt');
  }

  if (request.thumbnail) {
    args.push('--write-thumbnail', '--convert-thumbnails', 'jpg');
  }

  if (request.metadata !== false) {
    args.push('--add-metadata');
  }

  const format: DownloadFormat = request.format;

  if (format === 'mp3') {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', String(request.mp3Bitrate ?? 192));
  } else if (format === 'm4a') {
    args.push('-x', '--audio-format', 'm4a');
  } else {
    args.push('-f', qualitySelector(request.quality));
    args.push('--merge-output-format', format);
  }

  args.push(request.url);
  return args;
};

export const validateQuality = (quality: string): DownloadQuality => {
  if (SUPPORTED_QUALITIES.includes(quality as DownloadQuality)) {
    return quality as DownloadQuality;
  }

  return 'best';
};
