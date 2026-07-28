import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { DownloadCloud, History, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { ThemeToggle } from '../components/ThemeToggle';
import type { ThemeMode } from '../hooks/useTheme';

interface AppLayoutProps {
  children: ReactNode;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const AppLayout = ({ children, theme, onThemeChange }: AppLayoutProps) => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.20),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_25%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)] text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-border/70 bg-card/70 px-5 py-4 shadow-glow backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">DownloadMP3</p>
              <h1 className="mt-1 text-2xl font-semibold">Dudu MP3/MP4 Download</h1>
              <p className="mt-1 text-sm text-muted-foreground">Fila, progresso em tempo real, histórico e configurações salvas no SQLite.</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle theme={theme} onChange={onThemeChange} />
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2">
            <NavLink to="/" className={navClass} end>
              <DownloadCloud className="h-4 w-4" />
              Downloader
            </NavLink>
            <NavLink to="/history" className={navClass}>
              <History className="h-4 w-4" />
              Histórico
            </NavLink>
            <NavLink to="/settings" className={navClass}>
              <Settings className="h-4 w-4" />
              Configurações
            </NavLink>
          </nav>
        </header>
        <main className="flex-1 animate-fadeUp">{children}</main>
      </div>
    </div>
  );
};
