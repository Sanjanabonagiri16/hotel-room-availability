import { useState, useEffect, useRef } from "react";
import { RefreshCcw, Download, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DateRangeSelector } from "@/components/controls/DateRangeSelector";
import { ViewSelector } from "@/components/controls/ViewSelector";
import { HotelSelector } from "@/components/controls/HotelSelector";
import { AvailabilityLegend } from "@/components/legend/AvailabilityLegend";
import { useHotelData } from "@/hooks/useHotelData";
import { generateDateRange, getDateRangeFromDays, getDaysBetweenDates } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { EditRoomTypeDialog } from '@/components/hotels/EditRoomTypeDialog';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';

const Index = () => {
  const { hotels, roomTypes, availabilityData, loading, error, fetchAvailabilityData } = useHotelData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Always define allHotels before use, fallback to [] if hotels is empty
  const allHotels = hotels && hotels.length > 0 ? hotels.map(h => h.name) : [];
  
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

  // Dialog states and mock data
  const [roomTypeDialogOpen, setRoomTypeDialogOpen] = useState(false);
  const roomType = roomTypes[0] ? {
    name: roomTypes[0].name,
    id: roomTypes[0].id,
    active: true,
    ruleType: '',
    ruleValue: '',
    minThreshold: ''
  } : {
    name: 'Deluxe Double Room with Balcony and Island View',
    id: '9200000000000001',
    active: true,
    ruleType: '',
    ruleValue: '',
    minThreshold: ''
  };

  const [settingsOpen, setSettingsOpen] = useState(false);
  const exportRef = useRef<HTMLAnchorElement>(null);

  const handleExport = () => {
    // Generate CSV from availabilityData
    const csvRows = [
      ["Room Type", "Date", "Available Rooms"],
      ...availabilityData.map(item => [
        roomTypes.find(rt => rt.id === item.roomTypeId)?.name || item.roomTypeId,
        item.date.toLocaleDateString(),
        item.availableRooms
      ])
    ];
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    if (exportRef.current) {
      exportRef.current.href = url;
      exportRef.current.download = "room-availability.csv";
      exportRef.current.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  // Settings state
  const [showTooltips, setShowTooltips] = useState(() => {
    const stored = localStorage.getItem('showTooltips');
    return stored === null ? true : stored === 'true';
  });
  const [defaultView, setDefaultView] = useState(() => {
    return localStorage.getItem('defaultView') || '15';
  });

  useEffect(() => {
    localStorage.setItem('showTooltips', String(showTooltips));
  }, [showTooltips]);
  useEffect(() => {
    localStorage.setItem('defaultView', defaultView);
  }, [defaultView]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
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
              <a ref={exportRef} style={{ display: 'none' }} />
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Dialog triggers */}
        <div className="flex gap-4 mb-4">
          <Button
            onClick={() => setRoomTypeDialogOpen(true)}
            variant="outline"
            className="transition duration-200 ease-in-out hover:bg-gray-100 active:scale-95 focus:ring-2 focus:ring-primary"
          >
            Edit Room Type
          </Button>
        </div>
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
      {/* Dialogs */}
      <EditRoomTypeDialog
        open={roomTypeDialogOpen && Array.isArray(roomTypes)}
        onOpenChange={setRoomTypeDialogOpen}
        roomTypes={Array.isArray(roomTypes) && roomTypes.length > 0 ? roomTypes.map(rt => ({
          ...rt,
          active: true,
          ruleType: '',
          ruleValue: '',
          minThreshold: ''
        })) : []}
        onSave={(updated) => { setRoomTypeDialogOpen(false); }}
      />
      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-2xl shadow-2xl p-8 max-w-md w-full bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogClose asChild>
              <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
            </DialogClose>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Theme</label>
              <div className="flex items-center gap-4">
                {['light', 'dark', 'system'].map(opt => (
                  <button
                    key={opt}
                    className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${theme === opt ? 'bg-blue-100 border-blue-400 font-bold text-blue-900' : 'bg-white border-gray-300'}`}
                    onClick={() => setTheme(opt)}
                  >
                    {theme === opt && <span className="text-green-600">✔</span>}
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Show Tooltips</label>
              <Switch checked={showTooltips} onCheckedChange={setShowTooltips} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Default Calendar View</label>
              <select
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-base font-medium"
                value={defaultView}
                onChange={e => setDefaultView(e.target.value)}
              >
                <option value="7">7 days</option>
                <option value="15">15 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

