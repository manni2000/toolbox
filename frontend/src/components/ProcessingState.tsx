import { useState, useEffect } from 'react';
import { Loader2, Clock } from 'lucide-react';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

interface ProcessingStateProps {
  isProcessing: boolean;
  progress?: number;
  message?: string;
  showTimer?: boolean;
  className?: string;
}

export const ProcessingState = ({
  isProcessing,
  progress,
  message = 'Processing...',
  showTimer = false,
  className
}: ProcessingStateProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setElapsedTime(0);
      return;
    }

    if (showTimer) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isProcessing, showTimer]);

  if (!isProcessing) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-8', className)}>
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{Math.round(progress)}%</span>
          </div>
        )}
      </div>

      <div className="text-center space-y-2 max-w-md">
        <p className="text-sm font-medium">{message}</p>
        
        {progress !== undefined && (
          <Progress value={progress} className="w-full max-w-xs mx-auto" />
        )}

        {showTimer && elapsedTime > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(elapsedTime)} elapsed</span>
          </div>
        )}

        {elapsedTime > 30 && (
          <p className="text-xs text-muted-foreground">
            This is taking longer than expected. Please wait...
          </p>
        )}
      </div>
    </div>
  );
};

interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const InlineLoading = ({ message, size = 'md' }: InlineLoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  );
};
