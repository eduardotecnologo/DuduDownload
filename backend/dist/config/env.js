import dotenv from 'dotenv';
dotenv.config();
const toInt = (value, fallback) => {
    if (!value) {
        return fallback;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};
export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: toInt(process.env.PORT, 4000),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    databasePath: process.env.DATABASE_PATH ?? './data/downloads.sqlite',
    ytDlpPath: process.env.YT_DLP_PATH ?? 'yt-dlp',
    ffmpegPath: process.env.FFMPEG_PATH ?? 'ffmpeg'
};
