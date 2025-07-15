import { Button } from "@/components/ui/button";

interface ViewSelectorProps {
  currentView: '7' | '15' | '30';
  onViewChange: (view: '7' | '15' | '30') => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  const views = [
    { key: '7' as const, label: '7 Days' },
    { key: '15' as const, label: '15 Days' },
    { key: '30' as const, label: '30 Days' }
  ];

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {views.map((view) => (
        <Button
          key={view.key}
          variant={currentView === view.key ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(view.key)}
          className={`px-4 py-2 text-xs font-medium transition-all duration-200 ${
            currentView === view.key 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {view.label}
        </Button>
      ))}
    </div>
  );
}