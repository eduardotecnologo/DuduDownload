import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FolderOpen, Loader2, Search, Sparkles } from 'lucide-react';
import { downloadApi } from '../services/downloadApi';
import { settingsApi } from '../services/settingsApi';
import { historyApi } from '../services/historyApi';
import { useDownloadSocket } from '../hooks/useDownloadSocket';
import { useToast } from '../contexts/ToastContext';
import type { DownloadFormat, DownloadJob, DownloadQuality, Mp3Bitrate, VideoMetadata } from '../types/download';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { MetadataCard } from '../components/MetadataCard';
import { DownloadProgressCard } from '../components/DownloadProgressCard';
import { Progress } from '../components/ui/progress';
import { getParentDirectory, formatBytes, formatDuration } from '../lib/utils';

const formats: Array<{ label: string; value: DownloadFormat }> = [
  { label: 'MP3', value: 'mp3' },
  { label: 'M4A', value: 'm4a' },
  { label: 'MP4', value: 'mp4' },
  { label: 'MKV', value: 'mkv' },
  { label: 'WEBM', value: 'webm' }
];

const qualities: Array<{ label: string; value: DownloadQuality }> = [
  { label: 'Melhor', value: 'best' },
  { label: '1080p', value: '1080p' },
  { label: '720p', value: '720p' },
  { label: '480p', value: '480p' },
  { label: '360p', value: '360p' }
];

const bitrates: Array<{ label: string; value: Mp3Bitrate }> = [
  { label: '128 kbps', value: 128 },
  { label: '192 kbps', value: 192 },
  { label: '256 kbps', value: 256 },
  { label: '320 kbps', value: 320 }
];

interface DashboardPageProps {
  onError: (error: string) => void;
}

export const DashboardPage = ({ onError }: DashboardPageProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { jobs, lastCompletedJob, latestError, clearLatestError } = useDownloadSocket();

  const [url, setUrl] = React.useState('');
  const [outputPath, setOutputPath] = React.useState('');
  const [format, setFormat] = React.useState<DownloadFormat>('mp4');
  const [quality, setQuality] = React.useState<DownloadQuality>('best');
  const [mp3Bitrate, setMp3Bitrate] = React.useState<Mp3Bitrate>(192);
  const [playlist, setPlaylist] = React.useState(false);
  const [subtitles, setSubtitles] = React.useState(false);
  const [thumbnail, setThumbnail] = React.useState(true);
  const [metadata, setMetadata] = React.useState(true);
  const [videoMetadata, setVideoMetadata] = React.useState<VideoMetadata | null>(null);
  const [activeJob, setActiveJob] = React.useState<DownloadJob | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get
  });

  React.useEffect(() => {
    if (settingsQuery.data && !outputPath) {
      setOutputPath(settingsQuery.data.defaultDownloadPath);
    }
  }, [settingsQuery.data, outputPath]);

  const searchMutation = useMutation({
    mutationFn: downloadApi.searchMetadata,
    onSuccess: (result) => {
      setVideoMetadata(result);
      toast({ title: 'Metadata encontrada', description: result.title, variant: 'success' });
    },
    onError: (error: Error) => {
      onError(error.message);
      toast({ title: 'Falha na busca', description: error.message, variant: 'error' });
    }
  });

  const downloadMutation = useMutation({
    mutationFn: downloadApi.startDownload,
    onSuccess: (job) => {
      setActiveJob(job);
      queryClient.invalidateQueries({ queryKey: ['active-downloads'] });
      toast({ title: 'Download adicionado à fila', description: job.request.title ?? job.request.url, variant: 'success' });
    },
    onError: (error: Error) => {
      onError(error.message);
      toast({ title: 'Falha no download', description: error.message, variant: 'error' });
    }
  });

  const chooseFolderMutation = useMutation({
    mutationFn: downloadApi.chooseFolder,
    onSuccess: (folderPath) => {
      if (folderPath) {
        setOutputPath(folderPath);
        toast({ title: 'Pasta selecionada', description: folderPath, variant: 'success' });
      }
    },
    onError: (error: Error) => {
      onError(error.message);
      toast({ title: 'Falha ao selecionar pasta', description: error.message, variant: 'error' });
    }
  });

  React.useEffect(() => {
    if (jobs.length > 0) {
      const nextJob = jobs[0];
      if (nextJob) {
        setActiveJob(nextJob);
      }
    }
  }, [jobs]);

  React.useEffect(() => {
    if (latestError) {
      onError(latestError);
      toast({ title: 'Erro no download', description: latestError, variant: 'error' });
      clearLatestError();
    }
  }, [clearLatestError, latestError, onError, toast]);

  const handleSearch = () => {
    if (!url.trim()) {
      const message = 'Informe uma URL válida.';
      onError(message);
      return;
    }

    searchMutation.mutate(url.trim());
  };

  const handleDownload = () => {
    if (!url.trim()) {
      const message = 'Informe uma URL antes de iniciar o download.';
      onError(message);
      return;
    }

    const payload = {
      url: url.trim(),
      ...(outputPath.trim() ? { outputPath: outputPath.trim() } : settingsQuery.data?.defaultDownloadPath ? { outputPath: settingsQuery.data.defaultDownloadPath } : {}),
      ...(videoMetadata?.title ? { title: videoMetadata.title } : {}),
      format,
      quality,
      ...(format === 'mp3' ? { mp3Bitrate } : {}),
      ...(playlist ? { playlist } : {}),
      ...(subtitles ? { subtitles } : {}),
      ...(thumbnail ? { thumbnail } : {}),
      ...(metadata ? { metadata } : {})
    };

    downloadMutation.mutate(payload);
  };

  const handlePause = async (jobId: string) => {
    await downloadApi.pauseDownload(jobId);
    toast({ title: 'Download pausado', variant: 'warning' });
  };

  const handleResume = async (jobId: string) => {
    await downloadApi.resumeDownload(jobId);
    toast({ title: 'Download retomado', variant: 'success' });
  };

  const handleCancel = async (jobId: string) => {
    await downloadApi.cancelDownload(jobId);
    toast({ title: 'Download cancelado', variant: 'warning' });
  };

  const openOutput = async (targetPath: string, openFolderOnly = false) => {
    const nextPath = openFolderOnly ? getParentDirectory(targetPath) : targetPath;
    await historyApi.openPath(nextPath);
  };

  const completedJob = lastCompletedJob ?? (activeJob?.status === 'completed' ? activeJob : null);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">yt-dlp local</Badge>
              <Badge variant="outline">Socket.IO</Badge>
            </div>
            <CardTitle>Baixar vídeos, áudios e playlists</CardTitle>
            <CardDescription>Busque os metadados antes de enviar para a fila e acompanhe tudo em tempo real.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Cole a URL do YouTube" />
              <Button onClick={handleSearch} disabled={searchMutation.isPending}>
                {searchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Buscar
              </Button>
            </div>
            <MetadataCard metadata={videoMetadata} />
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Formato">
                <Select
                  value={format}
                  onChange={(event) => setFormat(event.target.value as DownloadFormat)}
                  options={formats.map((item) => ({ label: item.label, value: item.value }))}
                />
              </Field>
              <Field label="Qualidade">
                <Select
                  value={quality}
                  onChange={(event) => setQuality(event.target.value as DownloadQuality)}
                  options={qualities.map((item) => ({ label: item.label, value: item.value }))}
                />
              </Field>
              <Field label="Bitrate do MP3">
                <Select
                  value={mp3Bitrate}
                  onChange={(event) => setMp3Bitrate(Number(event.target.value) as Mp3Bitrate)}
                  options={bitrates.map((item) => ({ label: item.label, value: String(item.value) }))}
                />
              </Field>
              <Field label="Pasta de destino">
                <div className="flex gap-2">
                  <Input value={outputPath} onChange={(event) => setOutputPath(event.target.value)} placeholder="/Users/seu-usuario/Downloads" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => chooseFolderMutation.mutate()}
                    disabled={chooseFolderMutation.isPending}
                  >
                    {chooseFolderMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />}
                    Escolher pasta
                  </Button>
                </div>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ToggleField label="Playlist" checked={playlist} onChange={setPlaylist} />
              <ToggleField label="Legendas" checked={subtitles} onChange={setSubtitles} />
              <ToggleField label="Thumbnail" checked={thumbnail} onChange={setThumbnail} />
              <ToggleField label="Metadados" checked={metadata} onChange={setMetadata} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={handleDownload} disabled={downloadMutation.isPending}>
                <Download className="h-4 w-4" />
                Iniciar download
              </Button>
              <Button variant="outline" onClick={() => setOutputPath(settingsQuery.data?.defaultDownloadPath ?? '')}>
                Usar pasta padrão
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeJob ? (
          <DownloadProgressCard job={activeJob} onPause={handlePause} onResume={handleResume} onCancel={handleCancel} />
        ) : null}

        {completedJob?.outputFile ? (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-lg">Download finalizado</CardTitle>
              </div>
              <CardDescription>{completedJob.outputFile}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => openOutput(completedJob.outputFile ?? '', true)}>
                Abrir Pasta
              </Button>
              <Button onClick={() => openOutput(completedJob.outputFile ?? '', false)}>
                Abrir Arquivo
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Fila ativa</CardTitle>
            <CardDescription>{jobs.length} itens aguardando ou baixando</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum download em fila no momento.</div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{job.metadata?.title ?? job.request.title ?? 'Arquivo em processamento'}</p>
                      <p className="text-xs text-muted-foreground">{job.status}</p>
                    </div>
                    <Badge variant="secondary">{job.request.format.toUpperCase()}</Badge>
                  </div>
                  <Progress value={job.progress.percent} className="mt-3" />
                  <p className="mt-2 text-xs text-muted-foreground">{job.progress.percent.toFixed(1)}% · {job.progress.speed} · ETA {job.progress.eta}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo rápido</CardTitle>
            <CardDescription>Informações carregadas da última busca.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <Summary label="Título" value={videoMetadata?.title ?? 'N/A'} />
            <Summary label="Canal" value={videoMetadata?.channel ?? 'N/A'} />
            <Summary label="Duração" value={formatDuration(videoMetadata?.duration)} />
            <Summary label="Visualizações" value={videoMetadata?.views?.toLocaleString('pt-BR') ?? 'N/A'} />
            <Summary label="Tamanho estimado" value={activeJob?.progress.size ?? formatBytes(activeJob?.progress.totalBytes)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
  </div>
);

const ToggleField = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <div className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4">
    <div>
      <Label>{label}</Label>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border bg-background/60 p-4">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    <p className="mt-2 text-sm font-medium leading-6">{value}</p>
  </div>
);
