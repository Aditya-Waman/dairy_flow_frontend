import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  emoji?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  emoji,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      {emoji && <div className="text-6xl mb-4 animate-bounce-subtle">{emoji}</div>}
      {Icon && (
        <div className="p-4 rounded-full bg-muted mb-4 animate-scale-in">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="animate-slide-up">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}



