import { MoonStar, SunMedium } from 'lucide-react';
import { Button } from './ui/button';
import type { ThemeMode } from '../hooks/useTheme';

interface ThemeToggleProps {
  theme: ThemeMode;
  onChange: (theme: ThemeMode) => void;
}

export const ThemeToggle = ({ theme, onChange }: ThemeToggleProps) => {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <Button variant="outline" size="icon" onClick={() => onChange(nextTheme)} aria-label="Alternar tema">
      {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </Button>
  );
};
