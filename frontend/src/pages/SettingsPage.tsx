import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../services/settingsApi';
import { useToast } from '../contexts/ToastContext';
import { SettingsPanel } from '../components/SettingsPanel';
import type { AppSettings } from '../types/download';
import type { ThemeMode } from '../hooks/useTheme';

interface SettingsPageProps {
  onError: (error: string) => void;
  themeController: {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
  };
}

export const SettingsPage = ({ onError, themeController }: SettingsPageProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get
  });

  const [draft, setDraft] = React.useState<AppSettings | null>(null);

  React.useEffect(() => {
    if (settingsQuery.data) {
      setDraft(settingsQuery.data);
      themeController.setTheme(settingsQuery.data.theme);
    }
  }, [settingsQuery.data, themeController]);

  const saveMutation = useMutation({
    mutationFn: settingsApi.save,
    onSuccess: (settings) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      themeController.setTheme(settings.theme);
      toast({ title: 'Configurações salvas', variant: 'success' });
    },
    onError: (error: Error) => onError(error.message)
  });

  return (
    <div className="space-y-6">
      {draft ? (
        <SettingsPanel
          settings={draft}
          onChange={(next) => setDraft(next)}
          onSave={() => saveMutation.mutate(draft)}
          saving={saveMutation.isPending}
        />
      ) : null}
    </div>
  );
};
