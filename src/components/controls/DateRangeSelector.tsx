import { useState } from "react";
import { format } from "date-fns";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  fromDate: Date;
  toDate: Date;
  onDateRangeChange: (from: Date, to: Date) => void;
}

const presets = [
  { label: "Next 7 days", days: 7 },
  { label: "Next 14 days", days: 14 },
  { label: "Next 30 days", days: 30 },
  { label: "This month", days: null },
];

function getThisMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from, to };
}

export function DateRangeSelector({ fromDate, toDate, onDateRangeChange }: DateRangeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from: Date; to: Date }>({ from: fromDate, to: toDate });

  const handlePreset = (days: number | null) => {
    if (days === null) {
      const { from, to } = getThisMonthRange();
      setTempRange({ from, to });
    } else {
      const from = new Date();
      const to = new Date();
      to.setDate(from.getDate() + days - 1);
      setTempRange({ from, to });
    }
  };

  const handleToday = () => {
    const today = new Date();
    setTempRange({ from: today, to: today });
  };

  const handleApply = () => {
    onDateRangeChange(tempRange.from, tempRange.to);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempRange({ from: fromDate, to: toDate });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "min-w-[220px] justify-start text-left font-normal px-4 py-2 border rounded-lg shadow-sm bg-card hover:bg-muted transition text-foreground border-border",
            !fromDate && "text-muted-foreground"
          )}
        >
          <Calendar className="mr-2 h-4 w-4 text-primary" />
          {fromDate && toDate ? (
            <span>
              {format(fromDate, "MMM d, yyyy")} - {format(toDate, "MMM d, yyyy")}
            </span>
          ) : (
            <span>Select date range</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 mt-2 rounded-xl shadow-2xl bg-card border border-border" align="end">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          {/* Presets */}
          <div className="flex flex-col gap-2 mb-2 md:mb-0">
            <span className="font-semibold text-sm mb-1">Select date range</span>
            <div className="flex flex-wrap gap-2">
              {presets.map(preset => (
                <Button
                  key={preset.label}
                  size="sm"
                  variant="ghost"
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium hover:bg-primary/10"
                  onClick={() => handlePreset(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 rounded-full text-xs font-medium"
              onClick={handleToday}
            >
              Today
            </Button>
          </div>
          {/* Calendar */}
          <div className="flex flex-col items-center">
            <CalendarComponent
              mode="range"
              selected={{ from: tempRange.from, to: tempRange.to }}
              onSelect={range => {
                if (range && range.from && range.to) {
                  setTempRange({ from: range.from, to: range.to });
                }
              }}
              className="p-2 pointer-events-auto rounded-lg border"
              numberOfMonths={2}
              showOutsideDays
            />
            <div className="flex gap-2 mt-4 w-full">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 rounded-lg"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="default"
                className="flex-1 rounded-lg"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}