import React from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from './button';
import { ErrorDisplay, DataError } from './error-display';
import { cn } from '@/lib/utils';

interface DataStatusProps {
  loading: boolean;
  error: DataError | null;
  lastUpdated: number | null;
  onRefresh?: () => void;
  onClearError?: () => void;
  className?: string;
  showLastUpdated?: boolean;
  refreshLabel?: string;
}

export function DataStatus({
  loading,
  error,
  lastUpdated,
  onRefresh,
  onClearError,
  className,
  showLastUpdated = true,
  refreshLabel = "Refresh"
}: DataStatusProps) {
  const formatLastUpdated = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          onClear={onClearError}
          onRetry={onRefresh}
        />
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading data...</span>
            </>
          ) : error ? (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>Data load failed</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Data loaded successfully</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showLastUpdated && lastUpdated && !loading && (
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              <span>Updated {formatLastUpdated(lastUpdated)}</span>
            </div>
          )}
          
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-7 px-2 text-xs"
            >
              <RefreshCw className={cn(
                "h-3 w-3 mr-1",
                loading && "animate-spin"
              )} />
              {refreshLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function DataStatusCompact({
  loading,
  error,
  lastUpdated,
  onRefresh,
  onClearError,
  className
}: Omit<DataStatusProps, 'showLastUpdated' | 'refreshLabel'>) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {loading ? (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span>Error</span>
          {onClearError && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearError}
              className="h-4 w-4 p-0"
            >
              ×
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span>Ready</span>
        </div>
      )}
      
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={cn(
            "h-3 w-3",
            loading && "animate-spin"
          )} />
        </Button>
      )}
    </div>
  );
}
