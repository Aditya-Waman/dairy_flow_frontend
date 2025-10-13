import React from 'react';
import { AlertCircle, Wifi, WifiOff, Shield, AlertTriangle, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface DataError {
  message: string;
  type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
  timestamp: number;
}

interface ErrorDisplayProps {
  error: DataError | null;
  onClear?: () => void;
  onRetry?: () => void;
  className?: string;
  showTimestamp?: boolean;
}

const getErrorIcon = (type: DataError['type']) => {
  switch (type) {
    case 'network':
      return <WifiOff className="h-5 w-5" />;
    case 'auth':
      return <Shield className="h-5 w-5" />;
    case 'validation':
      return <AlertTriangle className="h-5 w-5" />;
    case 'server':
      return <AlertCircle className="h-5 w-5" />;
    default:
      return <AlertCircle className="h-5 w-5" />;
  }
};

const getErrorColor = (type: DataError['type']) => {
  switch (type) {
    case 'network':
      return 'border-orange-200 bg-orange-50 text-orange-800';
    case 'auth':
      return 'border-red-200 bg-red-50 text-red-800';
    case 'validation':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    case 'server':
      return 'border-red-200 bg-red-50 text-red-800';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-800';
  }
};

const getErrorTitle = (type: DataError['type']) => {
  switch (type) {
    case 'network':
      return 'Connection Error';
    case 'auth':
      return 'Authentication Error';
    case 'validation':
      return 'Validation Error';
    case 'server':
      return 'Server Error';
    default:
      return 'Error';
  }
};

export function ErrorDisplay({ 
  error, 
  onClear, 
  onRetry, 
  className,
  showTimestamp = true 
}: ErrorDisplayProps) {
  if (!error) return null;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className={cn(
      'border rounded-lg p-4 flex items-start gap-3',
      getErrorColor(error.type),
      className
    )}>
      <div className="flex-shrink-0 mt-0.5">
        {getErrorIcon(error.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">
            {getErrorTitle(error.type)}
          </h3>
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-6 w-6 p-0 hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <p className="text-sm mt-1 break-words">
          {error.message}
        </p>
        
        {showTimestamp && (
          <p className="text-xs opacity-75 mt-2">
            {formatTimestamp(error.timestamp)}
          </p>
        )}
        
        {onRetry && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="text-xs"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for inline display
export function ErrorInline({ 
  error, 
  onClear, 
  className 
}: { 
  error: DataError | null; 
  onClear?: () => void;
  className?: string;
}) {
  if (!error) return null;

  return (
    <div className={cn(
      'flex items-center gap-2 text-sm px-3 py-2 rounded-md',
      getErrorColor(error.type),
      className
    )}>
      {getErrorIcon(error.type)}
      <span className="flex-1">{error.message}</span>
      {onClear && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-5 w-5 p-0 hover:bg-black/10"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Loading state component
export function LoadingState({ 
  message = "Loading...", 
  className 
}: { 
  message?: string; 
  className?: string;
}) {
  return (
    <div className={cn(
      'flex items-center justify-center p-8',
      className
    )}>
      <div className="flex items-center gap-3 text-gray-600">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-600"></div>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  action,
  className 
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      {Icon && (
        <div className="mb-4 p-3 rounded-full bg-gray-100">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
