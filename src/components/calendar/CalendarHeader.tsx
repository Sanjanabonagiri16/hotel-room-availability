import { format } from "date-fns";

interface CalendarHeaderProps {
  dates: Date[];
}

export function CalendarHeader({ dates }: CalendarHeaderProps) {
  const today = new Date();
  
  return (
    <div className="flex bg-calendar-header text-primary-foreground">
      {/* Room type header */}
      <div className="w-48 px-4 py-3 font-semibold border-r border-border/20 bg-primary">
        Room Types
      </div>
      
      {/* Date headers */}
      <div className="flex flex-1">
        {dates.map((date, index) => {
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          return (
            <div 
              key={index}
              className={`flex-1 min-w-[80px] px-2 py-3 text-center border-r border-border/20 last:border-r-0 text-xs font-medium ${
                isToday ? 'bg-calendar-today text-primary' : 'bg-primary'
              } ${isWeekend ? 'bg-primary/90' : ''}`}
            >
              <div className="font-semibold">
                {format(date, 'EEE')}
              </div>
              <div className="text-xs opacity-90 mt-1">
                {format(date, 'MMM d')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}