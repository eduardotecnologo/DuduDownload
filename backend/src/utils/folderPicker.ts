import { spawn } from 'node:child_process';

const runCommand = async (command: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> => {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: false });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });
};

const selectFolderMacOS = async (): Promise<string | null> => {
  const script = 'try\nPOSIX path of (choose folder with prompt "Selecione a pasta de destino")\non error number -128\n""\nend try';
  const result = await runCommand('osascript', ['-e', script]);
  if (result.code !== 0) {
    throw new Error(result.stderr.trim() || 'Falha ao abrir seletor de pasta no macOS.');
  }

  const path = result.stdout.trim();
  return path || null;
};

const selectFolderWindows = async (): Promise<string | null> => {
  const psScript = [
    'Add-Type -AssemblyName System.Windows.Forms',
    '$dialog = New-Object System.Windows.Forms.FolderBrowserDialog',
    '$dialog.Description = "Selecione a pasta de destino"',
    '$result = $dialog.ShowDialog()',
    'if ($result -eq [System.Windows.Forms.DialogResult]::OK) { Write-Output $dialog.SelectedPath }'
  ].join('; ');

  const result = await runCommand('powershell', ['-NoProfile', '-Command', psScript]);
  if (result.code !== 0) {
    throw new Error(result.stderr.trim() || 'Falha ao abrir seletor de pasta no Windows.');
  }

  const path = result.stdout.trim();
  return path || null;
};

const selectFolderLinux = async (): Promise<string | null> => {
  const result = await runCommand('sh', ['-c', 'zenity --file-selection --directory --title="Selecione a pasta de destino" 2>/dev/null || true']);
  if (result.code !== 0) {
    throw new Error(result.stderr.trim() || 'Falha ao abrir seletor de pasta no Linux.');
  }

  const path = result.stdout.trim();
  return path || null;
};

export const pickFolderFromSystem = async (): Promise<string | null> => {
  if (process.platform === 'darwin') {
    return await selectFolderMacOS();
  }

  if (process.platform === 'win32') {
    return await selectFolderWindows();
  }

  return await selectFolderLinux();
};
