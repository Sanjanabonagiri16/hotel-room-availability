import React, { useState } from 'react';
import { Info, Eye, EyeOff } from 'lucide-react';

interface RoomType {
  id: string;
  name: string;
  description?: string;
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
  onCellClick?: (date: Date, roomTypeId: string) => void;
  lastUpdated?: string;
}

// Helper to map roomTypeId or name to a friendly label
const friendlyRoomTypeName = (roomType: RoomType, idx: number) => {
  if (roomType.name && !/^\d+$/.test(roomType.name)) return roomType.name;
  const fallbackNames = ["Single", "Double", "Standard", "Premium"];
  return fallbackNames[idx % fallbackNames.length];
};

export function CalendarGrid({ dates, roomTypes, availabilityData, onCellClick, lastUpdated }: CalendarGridProps) {
  const [visibleRoomTypes, setVisibleRoomTypes] = useState(roomTypes.map(rt => rt.id));
  const [roomTypeCounts, setRoomTypeCounts] = useState(
    Object.fromEntries(roomTypes.map(rt => [rt.id, 1])) as Record<string, number>
  );

  const toggleRoomType = (id: string) => {
    setVisibleRoomTypes(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const changeRoomTypeCount = (id: string, delta: number) => {
    setRoomTypeCounts(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  // Debug: Log roomTypes and availabilityData before rendering
  console.log('Room Types (for rendering):', roomTypes);
  console.log('Availability Data (for rendering):', availabilityData);

  return (
    <div className="border rounded-2xl overflow-x-auto bg-card shadow-2xl font-sans relative">
      {/* Sticky top legend and last updated */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b px-4 py-2 shadow-md">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" /> Room Categories
          </span>
          <div className="flex items-center gap-2 ml-4">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold shadow"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> 4+</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold shadow"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span> 1-3</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold shadow"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> 0</span>
          </div>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">Data last updated: {lastUpdated}</span>
        )}
      </div>
      {/* Sticky date+availability header using grid */}
      <div
        className="sticky top-[48px] z-10 bg-card/80 backdrop-blur-md border-b shadow-sm"
        style={{
          display: 'grid',
          gridTemplateColumns: `minmax(180px, 1fr) repeat(${dates.length}, minmax(80px, 1fr))`,
          alignItems: 'center',
        }}
      >
        <div className="font-bold p-2 border-r bg-muted text-sm text-foreground text-center">Room Categories</div>
        {dates.map(date => {
          const totalAvailable = roomTypes
            .filter(rt => visibleRoomTypes.includes(rt.id))
            .reduce((sum, rt) => {
              const cell = availabilityData.find(a => a.roomTypeId === rt.id && a.date.toDateString() === date.toDateString());
              return sum + (cell ? cell.availableRooms : 0);
            }, 0);
          let color = "text-gray-700";
          if (totalAvailable >= 4) color = "text-green-800";
          else if (totalAvailable >= 1) color = "text-yellow-800";
          else color = "text-red-800";
          return (
            <div key={date.toISOString()} className="flex flex-col items-center justify-center border-r min-w-[80px] px-2 py-2 text-xs text-foreground text-center">
              <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}</span>
              <span className={`mt-1 text-lg font-bold ${color}`}>{totalAvailable}</span>
            </div>
          );
        })}
      </div>
      {/* Grid rows for room types */}
      <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
        {roomTypes.filter(rt => visibleRoomTypes.includes(rt.id)).map((roomType, rowIdx) => (
          [...Array(roomTypeCounts[roomType.id] || 1)].map((_, idx) => (
            <div
              key={roomType.id + '-' + idx}
              className={`transition-all group hover:bg-primary/5`}
              style={{
                display: 'grid',
                gridTemplateColumns: `minmax(180px, 1fr) repeat(${dates.length}, minmax(80px, 1fr))`,
                alignItems: 'center',
              }}
            >
              <div className="p-2 border-r flex items-center gap-2 bg-card text-foreground min-w-[180px]">
                <button onClick={() => toggleRoomType(roomType.id)} className="text-gray-400 hover:text-gray-700 transition" aria-label="Toggle room type visibility">
                  {visibleRoomTypes.includes(roomType.id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {/* Render roomType.name instead of id */}
                <span className="truncate font-medium" title={roomType.name}>{roomType.name}</span>
                <button onClick={() => changeRoomTypeCount(roomType.id, -1)} className="ml-auto px-2 rounded hover:bg-gray-200 transition text-lg font-bold" aria-label="Decrease visible rows">-</button>
                <span className="w-6 text-center font-mono">{roomTypeCounts[roomType.id]}</span>
                <button onClick={() => changeRoomTypeCount(roomType.id, 1)} className="px-2 rounded hover:bg-gray-200 transition text-lg font-bold" aria-label="Increase visible rows">+</button>
              </div>
              {dates.map(date => {
                // Use ISO date string for robust comparison
                const gridDateString = date.toISOString().slice(0, 10);
                const cell = availabilityData.find(
                  a => a.roomTypeId === roomType.id && a.date.toISOString().slice(0, 10) === gridDateString
                );
                // Debug: Log all relevant info for this cell
                const inventoryForRoom = availabilityData
                  .filter(a => a.roomTypeId === roomType.id)
                  .map(a => ({
                    date: a.date,
                    dateString: a.date.toISOString().slice(0, 10),
                    availableRooms: a.availableRooms
                  }));
                console.log('Grid cell:', {
                  roomTypeId: roomType.id,
                  gridDate: date,
                  gridDateString,
                  inventory: inventoryForRoom,
                  foundCell: cell
                });
                if (!cell) {
                  console.warn(`No availability data for roomTypeId=${roomType.id} on date=${date}`);
                } else if (cell.availableRooms === 0) {
                  console.warn(`Zero availability for roomTypeId=${roomType.id} on date=${date}`);
                }
                let color = "bg-gray-200 text-gray-700";
                let badge = "";
                let isUnknown = false;
                if (cell) {
                  if (cell.availableRooms >= 4) { color = "bg-green-100 text-green-800"; badge = "bg-green-500"; }
                  else if (cell.availableRooms >= 1) { color = "bg-yellow-100 text-yellow-800"; badge = "bg-yellow-500"; }
                  else { color = "bg-red-100 text-red-800"; badge = "bg-red-500"; }
                } else {
                  // Unknown/missing data styling
                  color = "bg-available-unknown border-available-unknown/40 text-muted-foreground";
                  isUnknown = true;
                }
                return (
                  <div
                    key={date.toISOString()}
                    className={`text-center border-r min-w-[80px] p-2 ${color} transition-all duration-200 hover:scale-105 hover:shadow-lg rounded-lg mx-0.5 my-1 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary animate-fade-in`}
                    onClick={() => onCellClick && onCellClick(date, roomType.id)}
                    tabIndex={0}
                    aria-label={`${roomType.name} on ${date.toLocaleDateString()}: ${cell ? cell.availableRooms : '—'} rooms`}
                  >
                    <span className="relative group">
                      <span className={`w-8 h-8 rounded-full font-bold flex items-center justify-center shadow transition-colors duration-300 ${badge} ${isUnknown ? 'text-lg text-gray-800 font-extrabold bg-available-unknown border border-available-unknown/60' : 'text-white text-base'}`}>{cell ? cell.availableRooms : "—"}</span>
                      <span className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                        <span className="font-semibold">{roomType.name}</span><br />
                        {date.toLocaleDateString()}: <span className="font-mono">{cell ? cell.availableRooms : '—'}</span> rooms<br />
                        {isUnknown && <span className="text-yellow-300 font-semibold">No data available</span>}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        ))}
      </div>
    </div>
  );
}