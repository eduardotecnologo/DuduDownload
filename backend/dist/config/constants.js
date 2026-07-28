export const DEFAULT_SETTINGS = {
    defaultDownloadPath: process.cwd(),
    theme: 'system',
    maxConcurrentDownloads: 2,
    autoUpdateYtDlp: false,
    autoUpdateFfmpeg: false
};
export const SUPPORTED_FORMATS = ['mp3', 'm4a', 'mp4', 'mkv', 'webm'];
export const SUPPORTED_QUALITIES = ['best', '1080p', '720p', '480p', '360p'];
export const SUPPORTED_MP3_BITRATES = [128, 192, 256, 320];
