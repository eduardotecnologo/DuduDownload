import fs from 'node:fs';
import path from 'node:path';

export const ensureDirectory = (directoryPath: string): void => {
  fs.mkdirSync(directoryPath, { recursive: true });
};

export const safeBasename = (inputPath: string): string => {
  return path.basename(inputPath).replace(/[^a-zA-Z0-9._-]+/g, '_');
};

export const pathExists = (inputPath: string): boolean => {
  try {
    fs.accessSync(inputPath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};