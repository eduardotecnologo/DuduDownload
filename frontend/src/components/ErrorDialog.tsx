import { Dialog } from './ui/dialog';
import { Badge } from './ui/badge';

interface ErrorDialogProps {
  open: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
}

export const ErrorDialog = ({ open, error, onOpenChange }: ErrorDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Erro inesperado" description="Confira a mensagem abaixo e tente novamente.">
      <div className="space-y-4">
        <Badge variant="destructive">Falha</Badge>
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error ?? 'Ocorreu um erro desconhecido.'}
        </div>
      </div>
    </Dialog>
  );
};
