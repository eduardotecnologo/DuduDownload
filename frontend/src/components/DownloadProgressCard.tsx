import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { formatBytes, formatDurationMs } from '../lib/utils';
import type { DownloadJob } from '../types/download';

interface DownloadProgressCardProps {
  job: DownloadJob;
  onPause: (jobId: string) => void;
  onResume: (jobId: string) => void;
  onCancel: (jobId: string) => void;
}

export const DownloadProgressCard = ({ job, onPause, onResume, onCancel }: DownloadProgressCardProps) => {
  const isPaused = job.status === 'paused';
  const isRunning = job.status === 'downloading' || job.status === 'starting';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{job.metadata?.title ?? job.request.title ?? 'Download em andamento'}</CardTitle>
            <CardDescription>{job.request.url}</CardDescription>
          </div>
          <Badge variant={job.status === 'error' ? 'destructive' : job.status === 'paused' ? 'warning' : 'secondary'}>{job.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={job.progress.percent} />
        <div className="grid gap-3 sm:grid-cols-4">
          <Metric label="Progresso" value={`${job.progress.percent.toFixed(1)}%`} />
          <Metric label="Velocidade" value={job.progress.speed} />
          <Metric label="ETA" value={job.progress.eta} />
          <Metric label="Tamanho" value={job.progress.size === 'N/A' ? formatBytes(job.progress.totalBytes) : job.progress.size} />
        </div>
        <div className="flex flex-wrap gap-2">
          {isRunning && !isPaused ? (
            <Button variant="outline" onClick={() => onPause(job.id)}>
              Pausar
            </Button>
          ) : null}
          {isPaused ? (
            <Button variant="outline" onClick={() => onResume(job.id)}>
              Retomar
            </Button>
          ) : null}
          <Button variant="destructive" onClick={() => onCancel(job.id)}>
            Cancelar
          </Button>
        </div>
        {job.outputFile ? (
          <p className="text-sm text-muted-foreground">
            Concluído em {formatDurationMs(job.endedAt ? new Date(job.endedAt).getTime() - new Date(job.startedAt ?? job.createdAt).getTime() : 0)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-background/50 p-3">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-medium">{value}</p>
  </div>
);
