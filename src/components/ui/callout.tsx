import { AlertCircle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CalloutProps {
  children: ReactNode;
  type?: 'info' | 'warning' | 'success' | 'error';
  className?: string;
}

const iconMap = {
  info: Info,
  warning: AlertCircle,
  success: CheckCircle2,
  error: XCircle,
};

const colorMap = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
  success: 'border-green-200 bg-green-50 text-green-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

export function Callout({ children, type = 'info', className }: CalloutProps) {
  const Icon = iconMap[type];

  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', colorMap[type], className)}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}
