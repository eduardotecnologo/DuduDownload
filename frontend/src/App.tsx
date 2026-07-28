import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ErrorDialog } from './components/ErrorDialog';
import type { ThemeMode } from './hooks/useTheme';

interface AppProps {
  themeController: {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
  };
}

const App = ({ themeController }: AppProps) => {
  const [error, setError] = React.useState<string | null>(null);

  return (
    <AppLayout theme={themeController.theme} onThemeChange={themeController.setTheme}>
      <Routes>
        <Route path="/" element={<DashboardPage onError={setError} />} />
        <Route path="/history" element={<HistoryPage onError={setError} />} />
        <Route path="/settings" element={<SettingsPage onError={setError} themeController={themeController} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ErrorDialog open={Boolean(error)} error={error} onOpenChange={(open) => !open && setError(null)} />
    </AppLayout>
  );
};

export default App;
