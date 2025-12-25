import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
  animate?: boolean;
}

export const GlassCard = ({ 
  children, 
  className, 
  variant = 'light',
  animate = true 
}: GlassCardProps) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        variant === 'light' ? 'glass-card' : 'glass-card-dark',
        animate && 'animate-fade-in',
        className
      )}
    >
      {children}
    </div>
  );
};
