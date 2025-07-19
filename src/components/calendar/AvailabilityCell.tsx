import { cn } from "@/lib/utils";

interface AvailabilityCellProps {
  date: Date;
  roomType: string;
  availableRooms: number;
  isToday?: boolean;
  isWeekend?: boolean;
  onClick?: () => void;
}

export function AvailabilityCell({ 
  date, 
  roomType, 
  availableRooms, 
  isToday = false,
  isWeekend = false,
  onClick 
}: AvailabilityCellProps) {
  const getAvailabilityStyle = (rooms: number) => {
    if (rooms >= 4) return "bg-available-high/20 border-available-high/40 text-available-high";
    if (rooms >= 1) return "bg-available-medium/20 border-available-medium/40 text-available-medium";
    if (rooms === 0) return "bg-available-none/20 border-available-none/40 text-available-none";
    return "bg-available-unknown border-available-unknown/40 text-muted-foreground";
  };

  // Debug logging (can be removed in production)
  if (Math.random() < 0.01) { // Log only 1% of cells to avoid spam
    console.log(`Cell render: ${date.toDateString()} - ${roomType}: ${availableRooms} rooms`);
  }

  return (
    <div
      className={cn(
        "h-14 border border-border/40 transition-all duration-200 cursor-pointer flex items-center justify-center text-sm font-medium relative group",
        getAvailabilityStyle(availableRooms),
        isToday && "ring-2 ring-primary/50 ring-offset-1",
        isWeekend && "bg-calendar-weekend",
        "hover:scale-105 hover:shadow-hover hover:z-10"
      )}
      onClick={onClick}
    >
      <span className="relative z-10">
        {availableRooms >= 0 ? availableRooms : "—"}
      </span>
      
      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
        {date.toLocaleDateString()} - {roomType}: {availableRooms} rooms
      </div>
    </div>
  );
}