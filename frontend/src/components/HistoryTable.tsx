import { Download, FolderOpen, SearchX, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { formatBytes, formatDateTime, formatDurationMs } from '../lib/utils';
import type { DownloadRecord } from '../types/download';

interface HistoryTableProps {
  items: DownloadRecord[];
  total: number;
  loading?: boolean;
  onDelete: (id: number) => void;
  onClear: () => void;
  onOpenFolder: (outputPath: string) => void;
  onOpenFile: (outputPath: string) => void;
}

export const HistoryTable = ({ items, total, loading, onDelete, onClear, onOpenFolder, onOpenFile }: HistoryTableProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>{total} downloads registrados</CardDescription>
          </div>
          <Button variant="outline" onClick={onClear} disabled={items.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir histórico
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Carregando histórico...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <SearchX className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum item encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{item.title}</h3>
                      <Badge variant="secondary">{item.format.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.url}</p>
                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                      <span>Data: {formatDateTime(item.downloadedAt)}</span>
                      <span>Tempo: {formatDurationMs(item.downloadTimeMs)}</span>
                      <span>Tamanho: {formatBytes(item.sizeBytes)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => onOpenFolder(item.outputPath)}>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Abrir Pasta
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onOpenFile(item.outputPath)}>
                      <Download className="mr-2 h-4 w-4" />
                      Abrir Arquivo
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
