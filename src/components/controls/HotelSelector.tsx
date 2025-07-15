import { useState } from "react";
import { Check, ChevronDown, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Hotel {
  id: string;
  name: string;
  code: string;
  location: string;
}

interface HotelSelectorProps {
  hotels: Hotel[];
  selectedHotel: string;
  onHotelChange: (hotelId: string) => void;
}

export function HotelSelector({ hotels, selectedHotel, onHotelChange }: HotelSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const currentHotel = hotels.find(hotel => hotel.id === selectedHotel);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">
                {currentHotel?.name || "Select hotel..."}
              </div>
              {currentHotel && (
                <div className="text-xs text-muted-foreground">
                  {currentHotel.location} • Code: {currentHotel.code}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search hotels..." />
          <CommandList>
            <CommandEmpty>No hotel found.</CommandEmpty>
            <CommandGroup>
              {hotels.map((hotel) => (
                <CommandItem
                  key={hotel.id}
                  value={hotel.id}
                  onSelect={() => {
                    onHotelChange(hotel.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedHotel === hotel.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{hotel.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {hotel.location} • Code: {hotel.code}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}