import * as React from 'react';
import type { DownloadJob, DownloadProgress } from '../types/download';
import { getSocket } from '../services/socket';

export const useDownloadSocket = () => {
  const [jobs, setJobs] = React.useState<DownloadJob[]>([]);
  const [latestError, setLatestError] = React.useState<string | null>(null);
  const [lastCompletedJob, setLastCompletedJob] = React.useState<DownloadJob | null>(null);

  React.useEffect(() => {
    const socket = getSocket();

    const handleQueueChanged = (nextJobs: DownloadJob[]) => setJobs(nextJobs);
    const handleQueued = (job: DownloadJob) => setJobs((current) => upsert(current, job));
    const handleStarted = (job: DownloadJob) => setJobs((current) => upsert(current, job));
    const handleProgress = ({ jobId, progress }: { jobId: string; progress: DownloadProgress }) => {
      setJobs((current) =>
        current.map((job) => {
          if (job.id !== jobId) {
            return job;
          }

          return { ...job, progress };
        })
      );
    };
    const handleCompleted = (job: DownloadJob) => {
      setLastCompletedJob(job);
      setJobs((current) => current.filter((item) => item.id !== job.id));
    };
    const handleCancelled = (job: DownloadJob) => setJobs((current) => current.filter((item) => item.id !== job.id));
    const handleError = (payload: { jobId: string; error: string }) => setLatestError(payload.error);

    socket.on('queue:changed', handleQueueChanged);
    socket.on('download:queued', handleQueued);
    socket.on('download:started', handleStarted);
    socket.on('download:progress', handleProgress);
    socket.on('download:completed', handleCompleted);
    socket.on('download:cancelled', handleCancelled);
    socket.on('download:error', handleError);

    return () => {
      socket.off('queue:changed', handleQueueChanged);
      socket.off('download:queued', handleQueued);
      socket.off('download:started', handleStarted);
      socket.off('download:progress', handleProgress);
      socket.off('download:completed', handleCompleted);
      socket.off('download:cancelled', handleCancelled);
      socket.off('download:error', handleError);
    };
  }, []);

  return { jobs, latestError, lastCompletedJob, clearLatestError: () => setLatestError(null) };
};

const upsert = (jobs: DownloadJob[], job: DownloadJob): DownloadJob[] => {
  const existingIndex = jobs.findIndex((item) => item.id === job.id);
  if (existingIndex === -1) {
    return [job, ...jobs];
  }

  const nextJobs = [...jobs];
  nextJobs[existingIndex] = job;
  return nextJobs;
};
