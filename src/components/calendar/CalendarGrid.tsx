import { CalendarHeader } from "./CalendarHeader";
import { RoomTypeRow } from "./RoomTypeRow";

interface RoomType {
  id: string;
  name: string;
  description: string;
}

interface AvailabilityData {
  roomTypeId: string;
  date: Date;
  availableRooms: number;
}

interface CalendarGridProps {
  dates: Date[];
  roomTypes: RoomType[];
  availabilityData: AvailabilityData[];
  onCellClick?: (date: Date, roomType: string) => void;
}

export function CalendarGrid({ 
  dates, 
  roomTypes, 
  availabilityData, 
  onCellClick 
}: CalendarGridProps) {
  const getAvailabilityForRoom = (roomTypeId: string) => {
    return dates.map(date => {
      const availability = availabilityData.find(
        item => item.roomTypeId === roomTypeId && 
        item.date.toDateString() === date.toDateString()
      );
      
      return {
        date,
        availableRooms: availability?.availableRooms ?? -1
      };
    });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-card bg-card animate-fade-in">
      <CalendarHeader dates={dates} />
      
      <div className="max-h-[70vh] overflow-y-auto">
        {roomTypes.map((roomType) => (
          <RoomTypeRow
            key={roomType.id}
            roomType={roomType.name}
            description={roomType.description}
            availability={getAvailabilityForRoom(roomType.id)}
            onCellClick={onCellClick}
          />
        ))}
      </div>
    </div>
  );
}