import { AvailabilityCell } from "./AvailabilityCell";

interface RoomAvailability {
  date: Date;
  availableRooms: number;
}

interface RoomTypeRowProps {
  roomType: string;
  description: string;
  availability: RoomAvailability[];
  onCellClick?: (date: Date, roomType: string) => void;
}

export function RoomTypeRow({ 
  roomType, 
  description, 
  availability, 
  onCellClick 
}: RoomTypeRowProps) {
  const today = new Date();
  
  return (
    <div className="flex border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors duration-200">
      {/* Room type info */}
      <div className="w-48 px-4 py-3 border-r border-border/40 bg-card">
        <div className="font-semibold text-sm text-foreground">
          {roomType}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {description}
        </div>
      </div>
      
      {/* Availability cells */}
      <div className="flex flex-1">
        {availability.map((item, index) => {
          const isToday = item.date.toDateString() === today.toDateString();
          const isWeekend = item.date.getDay() === 0 || item.date.getDay() === 6;
          
          return (
            <div key={index} className="flex-1 min-w-[80px]">
              <AvailabilityCell
                date={item.date}
                roomType={roomType}
                availableRooms={item.availableRooms}
                isToday={isToday}
                isWeekend={isWeekend}
                onClick={() => onCellClick?.(item.date, roomType)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}