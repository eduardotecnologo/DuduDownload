import type { DownloadJob, DownloadProgress } from './download';

export interface ServerToClientEvents {
  'download:queued': (job: DownloadJob) => void;
  'download:started': (job: DownloadJob) => void;
  'download:progress': (payload: { jobId: string; progress: DownloadProgress }) => void;
  'download:completed': (job: DownloadJob) => void;
  'download:cancelled': (job: DownloadJob) => void;
  'download:error': (payload: { jobId: string; error: string }) => void;
  'queue:changed': (jobs: DownloadJob[]) => void;
}

export interface ClientToServerEvents {
  'download:subscribe': (jobId: string) => void;
  'download:unsubscribe': (jobId: string) => void;
}
