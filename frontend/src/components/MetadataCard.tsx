import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatDuration } from '../lib/utils';
import type { VideoMetadata } from '../types/download';

interface MetadataCardProps {
  metadata: VideoMetadata | null;
}

export const MetadataCard = ({ metadata }: MetadataCardProps) => {
  if (!metadata) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
        <div className="relative min-h-52 bg-muted">
          {metadata.thumbnail ? <img src={metadata.thumbnail} alt={metadata.title} className="h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        </div>
        <div>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Metadados carregados</Badge>
              {metadata.isPlaylist ? <Badge variant="outline">Playlist</Badge> : null}
            </div>
            <CardTitle>{metadata.title}</CardTitle>
            <CardDescription>{metadata.channel}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Info label="Duração" value={formatDuration(metadata.duration)} />
              <Info label="Visualizações" value={metadata.views?.toLocaleString('pt-BR') ?? 'N/A'} />
              <Info label="Itens" value={metadata.playlistCount?.toString() ?? 'N/A'} />
            </div>
            {metadata.description ? <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">{metadata.description}</p> : null}
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-background/60 p-3">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
  </div>
);
