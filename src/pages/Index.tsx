import { useState, useEffect } from "react";
import { RefreshCcw, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DateRangeSelector } from "@/components/controls/DateRangeSelector";
import { ViewSelector } from "@/components/controls/ViewSelector";
import { HotelSelector } from "@/components/controls/HotelSelector";
import { AvailabilityLegend } from "@/components/legend/AvailabilityLegend";
import { useHotelData } from "@/hooks/useHotelData";
import { generateDateRange, getDateRangeFromDays, getDaysBetweenDates } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { hotels, roomTypes, availabilityData, loading, error, fetchAvailabilityData } = useHotelData();
  const { toast } = useToast();
  
  // State management
  const [selectedHotel, setSelectedHotel] = useState('hotel-102');
  const [currentView, setCurrentView] = useState<'7' | '15' | '30'>('15');
  const [dateRange, setDateRange] = useState(() => getDateRangeFromDays(15));
  
  // Generate dates for the calendar
  const dates = generateDateRange(dateRange.from, getDaysBetweenDates(dateRange.from, dateRange.to));
  
  // Load data when dependencies change
  useEffect(() => {
    const hotel = hotels.find(h => h.id === selectedHotel);
    if (hotel) {
      fetchAvailabilityData(hotel.code, hotel.authCode, dateRange.from, dateRange.to);
    }
  }, [selectedHotel, dateRange.from, dateRange.to]);

  // Handle view changes
  const handleViewChange = (view: '7' | '15' | '30') => {
    setCurrentView(view);
    const newRange = getDateRangeFromDays(parseInt(view));
    setDateRange(newRange);
  };

  // Handle date range changes
  const handleDateRangeChange = (from: Date, to: Date) => {
    setDateRange({ from, to });
    const days = getDaysBetweenDates(from, to);
    if (days <= 7) setCurrentView('7');
    else if (days <= 15) setCurrentView('15');
    else setCurrentView('30');
  };

  // Handle cell clicks
  const handleCellClick = (date: Date, roomType: string) => {
    const availability = availabilityData.find(
      item => item.roomTypeId === roomTypes.find(rt => rt.name === roomType)?.id && 
      item.date.toDateString() === date.toDateString()
    );
    
    toast({
      title: "Room Details",
      description: `${roomType} on ${date.toLocaleDateString()}: ${availability?.availableRooms ?? 0} rooms available`,
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    const hotel = hotels.find(h => h.id === selectedHotel);
    if (hotel) {
      fetchAvailabilityData(hotel.code, hotel.authCode, dateRange.from, dateRange.to);
      toast({
        title: "Data Refreshed",
        description: "Availability data has been updated",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hotel Availability Calendar</h1>
              <p className="text-muted-foreground">Manage room availability across your properties</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <HotelSelector 
              hotels={hotels}
              selectedHotel={selectedHotel}
              onHotelChange={setSelectedHotel}
            />
            
            <ViewSelector 
              currentView={currentView}
              onViewChange={handleViewChange}
            />
          </div>
          
          <DateRangeSelector 
            fromDate={dateRange.from}
            toDate={dateRange.to}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {/* Legend */}
        <AvailabilityLegend />

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-card rounded-lg border border-border">
              <div className="text-center">
                <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-muted-foreground">Loading availability data...</p>
              </div>
            </div>
          ) : (
            <CalendarGrid
              dates={dates}
              roomTypes={roomTypes}
              availabilityData={availabilityData}
              onCellClick={handleCellClick}
            />
          )}
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border shadow-card">
            <div className="text-2xl font-bold text-available-high">
              {availabilityData.filter(item => item.availableRooms >= 4).length}
            </div>
            <div className="text-sm text-muted-foreground">High availability slots</div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border border-border shadow-card">
            <div className="text-2xl font-bold text-available-medium">
              {availabilityData.filter(item => item.availableRooms >= 1 && item.availableRooms < 4).length}
            </div>
            <div className="text-sm text-muted-foreground">Limited availability slots</div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border border-border shadow-card">
            <div className="text-2xl font-bold text-available-none">
              {availabilityData.filter(item => item.availableRooms === 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Sold out slots</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
