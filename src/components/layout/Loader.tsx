import { cn } from '@/lib/utils';
import { PawPrint } from 'lucide-react';

interface LoaderProps {
  fullScreen?: boolean;
  className?: string;
  text?: string;
}

export default function Loader({ fullScreen = true, className, text }: LoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="relative">
        <PawPrint className="h-12 w-12 animate-bounce text-primary" />
        <div className="absolute -inset-4 animate-ping rounded-full bg-primary/20" />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}
