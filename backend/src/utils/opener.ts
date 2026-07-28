import { spawn } from 'node:child_process';

export const openPath = async (targetPath: string): Promise<void> => {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', targetPath] : [targetPath];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { shell: process.platform === 'win32' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Falha ao abrir o caminho ${targetPath}.`));
    });
  });
};
