import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { historyApi } from '../services/historyApi';
import { useToast } from '../contexts/ToastContext';
import type { DownloadFormat } from '../types/download';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { HistoryTable } from '../components/HistoryTable';
import { getParentDirectory } from '../lib/utils';

const formatOptions = [
  { label: 'Todos os formatos', value: '' },
  { label: 'MP3', value: 'mp3' },
  { label: 'M4A', value: 'm4a' },
  { label: 'MP4', value: 'mp4' },
  { label: 'MKV', value: 'mkv' },
  { label: 'WEBM', value: 'webm' }
];

interface HistoryPageProps {
  onError: (error: string) => void;
}

export const HistoryPage = ({ onError }: HistoryPageProps) => {
  const [search, setSearch] = React.useState('');
  const [format, setFormat] = React.useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const historyQuery = useQuery({
    queryKey: ['history', search, format],
    queryFn: () => {
      const query: { search?: string; format?: DownloadFormat; limit: number } = { limit: 100 };
      if (search.trim()) {
        query.search = search.trim();
      }
      if (format) {
        query.format = format as DownloadFormat;
      }

      return historyApi.list(query);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: historyApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast({ title: 'Item removido do histórico', variant: 'success' });
    },
    onError: (error: Error) => onError(error.message)
  });

  const clearMutation = useMutation({
    mutationFn: historyApi.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast({ title: 'Histórico limpo', variant: 'success' });
    },
    onError: (error: Error) => onError(error.message)
  });

  const openMutation = useMutation({
    mutationFn: historyApi.openPath,
    onError: (error: Error) => onError(error.message)
  });

  const items = historyQuery.data?.items ?? [];
  const total = historyQuery.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pesquisar histórico</CardTitle>
          <CardDescription>Filtre por título, URL ou formato e revise os downloads já concluídos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar histórico" />
          <Select
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            options={formatOptions}
          />
          <Button variant="outline" onClick={() => historyQuery.refetch()}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </CardContent>
      </Card>

      <HistoryTable
        items={items}
        total={total}
        loading={historyQuery.isLoading}
        onDelete={(id) => deleteMutation.mutate(id)}
        onClear={() => {
          if (window.confirm('Excluir todo o histórico?')) {
            clearMutation.mutate();
          }
        }}
        onOpenFolder={(outputPath) => openMutation.mutate(getParentDirectory(outputPath))}
        onOpenFile={(outputPath) => openMutation.mutate(outputPath)}
      />
    </div>
  );
};
