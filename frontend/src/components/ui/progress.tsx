import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress = ({ className, value = 0, ...props }: ProgressProps) => {
  return (
    <div className={cn('relative h-3 w-full overflow-hidden rounded-full bg-muted', className)} {...props}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};
