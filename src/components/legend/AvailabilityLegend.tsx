interface LegendItemProps {
  color: string;
  label: string;
  count?: string;
}

function LegendItem({ color, label, count }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded ${color} border border-opacity-40`} />
      <span className="text-sm text-foreground">{label}</span>
      {count && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}

export function AvailabilityLegend() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card">
      <h3 className="font-semibold text-sm text-foreground mb-3">Room Availability</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <LegendItem 
          color="bg-available-high/20 border-available-high/40" 
          label="4+ Rooms" 
        />
        <LegendItem 
          color="bg-available-medium/20 border-available-medium/40" 
          label="1-3 Rooms" 
        />
        <LegendItem 
          color="bg-available-none/20 border-available-none/40" 
          label="No Rooms" 
        />
        <LegendItem 
          color="bg-available-unknown border-available-unknown/40" 
          label="Unknown" 
        />
      </div>
    </div>
  );
}