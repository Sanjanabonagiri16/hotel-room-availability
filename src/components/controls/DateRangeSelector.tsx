import { useState } from "react";
import { format } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  fromDate: Date;
  toDate: Date;
  onDateRangeChange: (from: Date, to: Date) => void;
}

export function DateRangeSelector({ 
  fromDate, 
  toDate, 
  onDateRangeChange 
}: DateRangeSelectorProps) {
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Date Range:</span>
      
      {/* From Date */}
      <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !fromDate && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {fromDate ? format(fromDate, "MMM dd") : "From"}
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={fromDate}
            onSelect={(date) => {
              if (date) {
                onDateRangeChange(date, toDate);
                setIsFromOpen(false);
              }
            }}
            className="p-3 pointer-events-auto"
            disabled={(date) => date > toDate}
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground">to</span>

      {/* To Date */}
      <Popover open={isToOpen} onOpenChange={setIsToOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !toDate && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {toDate ? format(toDate, "MMM dd") : "To"}
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={toDate}
            onSelect={(date) => {
              if (date) {
                onDateRangeChange(fromDate, date);
                setIsToOpen(false);
              }
            }}
            className="p-3 pointer-events-auto"
            disabled={(date) => date < fromDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}