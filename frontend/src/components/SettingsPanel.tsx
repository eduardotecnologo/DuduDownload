import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select } from './ui/select';
import { Button } from './ui/button';
import type { AppSettings } from '../types/download';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onSave: () => void;
  saving?: boolean;
}

export const SettingsPanel = ({ settings, onChange, onSave, saving }: SettingsPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
        <CardDescription>Defina o comportamento padrão do downloader local.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Field label="Pasta padrão dos downloads">
          <Input value={settings.defaultDownloadPath} onChange={(event) => onChange({ ...settings, defaultDownloadPath: event.target.value })} />
        </Field>
        <Field label="Tema">
          <Select
            value={settings.theme}
            onChange={(event) => onChange({ ...settings, theme: event.target.value as AppSettings['theme'] })}
            options={[
              { label: 'Sistema', value: 'system' },
              { label: 'Claro', value: 'light' },
              { label: 'Escuro', value: 'dark' }
            ]}
          />
        </Field>
        <Field label="Downloads simultâneos">
          <Input
            type="number"
            min={1}
            max={8}
            value={settings.maxConcurrentDownloads}
            onChange={(event) => onChange({ ...settings, maxConcurrentDownloads: Number(event.target.value) })}
          />
        </Field>
        <ToggleRow
          label="Atualizar automaticamente o yt-dlp"
          checked={settings.autoUpdateYtDlp}
          onCheckedChange={(checked) => onChange({ ...settings, autoUpdateYtDlp: checked })}
        />
        <ToggleRow
          label="Atualizar automaticamente o ffmpeg"
          checked={settings.autoUpdateFfmpeg}
          onCheckedChange={(checked) => onChange({ ...settings, autoUpdateFfmpeg: checked })}
        />
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            Salvar configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
  </div>
);

const ToggleRow = ({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
  <div className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4">
    <div className="space-y-1">
      <Label>{label}</Label>
      <p className="text-sm text-muted-foreground">Armazena a preferência no SQLite e aplica na UI.</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);
