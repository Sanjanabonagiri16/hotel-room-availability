import React from 'react';
import { useState, useEffect } from 'react';

interface Hotel {
  id: string;
  name: string;
  code: string;
  location: string;
  authCode: string;
}

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

// Add RoomInventory type for API response
interface RoomInventory {
  roomTypeId: string;
  fromDate: string;
  toDate: string;
  availability: number;
}

// Mock data for development
const mockHotels: Hotel[] = [
  {
    id: 'hotel-102',
    name: 'Grand Plaza Hotel',
    code: '102',
    location: 'Downtown',
    authCode: '964565257540601c7c-ed65-11ec-9'
  },
  {
    id: 'hotel-103',
    name: 'Seaside Resort',
    code: '103',
    location: 'Beachfront',
    authCode: 'mock-auth-code-103'
  },
  {
    id: 'hotel-104',
    name: 'Mountain Lodge',
    code: '104',
    location: 'Mountain View',
    authCode: 'mock-auth-code-104'
  }
];

const mockRoomTypes: RoomType[] = [
  { id: 'deluxe', name: 'Deluxe Room', description: 'Spacious room with city view' },
  { id: 'suite', name: 'Executive Suite', description: 'Luxury suite with balcony' },
  { id: 'standard', name: 'Standard Room', description: 'Comfortable standard accommodation' },
  { id: 'family', name: 'Family Room', description: 'Perfect for families, sleeps 4' },
  { id: 'presidential', name: 'Presidential Suite', description: 'Ultimate luxury experience' }
];

export function useHotelData() {
  const [hotels] = useState<Hotel[]>(mockHotels);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate mock availability data
  const generateMockData = (fromDate: Date, toDate: Date): AvailabilityData[] => {
    const data: AvailabilityData[] = [];
    const currentDate = new Date(fromDate);
    
    while (currentDate <= toDate) {
      roomTypes.forEach(roomType => {
        // Generate random availability with some patterns
        let rooms = Math.floor(Math.random() * 8);
        
        // Make weekends more scarce
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          rooms = Math.floor(rooms * 0.6);
        }
        
        // Presidential suites are always scarce
        if (roomType.id === 'presidential') {
          rooms = Math.floor(Math.random() * 2);
        }
        
        data.push({
          roomTypeId: roomType.id,
          date: new Date(currentDate),
          availableRooms: rooms
        });
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  // Transform API response to our internal format
  const transformApiDataToAvailability = (apiData: RoomInventory[]): AvailabilityData[] => {
    const result: AvailabilityData[] = [];
    apiData.forEach(roomData => {
      const start = new Date(roomData.fromDate);
      const end = new Date(roomData.toDate);
      for (
        let d = new Date(start);
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        result.push({
          roomTypeId: roomData.roomTypeId,
          date: new Date(d), // clone the date object
          availableRooms: Number(roomData.availability)
        });
      }
    });
    return result;
  };

  // New: Combined fetch for RoomInfo and Inventory
  const fetchHotelData = async (
    hotelCode: string, 
    authCode: string, 
    fromDate: Date, 
    toDate: Date
  ) => {
    console.log('=== FETCH HOTEL DATA STARTED ===');
    setLoading(true);
    setError(null);
    try {
      // API 1: RoomInfo (room types) - Use Supabase Edge Function
      console.log('[PMS API] Fetching room info for hotel:', hotelCode);
      const roomInfoRes = await fetch('/api/get-room-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelCode, needPhysicalRooms: 1 })
      });
      
      if (!roomInfoRes.ok) {
        throw new Error(`RoomInfo API call failed with status: ${roomInfoRes.status}`);
      }
      
      const roomInfoData = await roomInfoRes.json();
      console.log('[PMS API] RoomInfo Response:', roomInfoData);
      
      // Transform room types from API response
      const roomTypesArr: RoomType[] = roomInfoData.roomTypes.map((rt: any) => ({
        id: rt.id,
        name: rt.name,
        description: rt.description || ''
      }));
      // API 2: Inventory (availability, XML via backend proxy)
      const fromDateStr = fromDate.toISOString().split('T')[0];
      const toDateStr = toDate.toISOString().split('T')[0];
      console.log('[PMS API] Inventory Proxy Request:', { fromDate: fromDateStr, toDate: toDateStr });
      // Use Netlify function endpoint for inventory fetch
      const inventoryRes = await fetch('/.netlify/functions/pms-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDate: fromDateStr, toDate: toDateStr })
      });
      console.log('[PMS API] Inventory Proxy Response Status:', inventoryRes.status);
      const xmlText = await inventoryRes.text();
      console.log('[PMS API] Inventory Proxy Raw XML Response:', xmlText);
      if (inventoryRes.status !== 200) {
        console.error('[PMS API] Inventory API call failed with status:', inventoryRes.status);
        throw new Error('Inventory API call failed');
      }
      // Parse XML for inventory data (extract only <Source name="Front">)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
      // Check for errors
      const errorCode = xmlDoc.querySelector('ErrorCode')?.textContent;
      const errorMessage = xmlDoc.querySelector('ErrorMessage')?.textContent;
      if (errorCode) {
        throw new Error(`API Error ${errorCode}: ${errorMessage}`);
      }
      // Find the <Source name="Front"> node
      const sources = Array.from(xmlDoc.querySelectorAll('RoomInfo > Source'));
      const frontSource = sources.find(source => source.getAttribute('name') === 'Front');
      if (!frontSource) {
        console.error('Front source not found in XML response');
        setAvailabilityData([]);
        return;
      }
      // Use room types from API instead of hardcoded mapping
      // Make sure your grid's date range is set to 2025-07-17 to 2025-07-31 for testing
      const roomTypeNodes = frontSource.querySelectorAll('RoomType');
      const inventoryArr: AvailabilityData[] = [];
      roomTypeNodes.forEach(roomType => {
        const roomTypeId = roomType.querySelector('RoomTypeID')?.textContent?.trim();
        const availability = parseInt(roomType.querySelector('Availability')?.textContent?.trim() || '0', 10);
        const fromDate = roomType.querySelector('FromDate')?.textContent?.trim();
        const toDate = roomType.querySelector('ToDate')?.textContent?.trim();
        if (roomTypeId && fromDate && toDate) {
          for (
            let d = new Date(fromDate);
            d <= new Date(toDate);
            d.setDate(d.getDate() + 1)
          ) {
            const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            inventoryArr.push({
              roomTypeId,
              date: day,
              availableRooms: availability
            });
            // Log each parsed entry
            console.log('[Parsed Inventory Entry]', { roomTypeId, date: day, availableRooms: availability });
          }
        } else {
          console.warn('[PMS API] Skipped RoomType node due to missing data:', { roomTypeId, fromDate, toDate, availability });
        }
      });
      console.log('Final RoomTypes:', roomTypesArr);
      console.log('Final AvailabilityData:', inventoryArr);
      setAvailabilityData(inventoryArr);
      setRoomTypes(roomTypesArr);
    } catch (err: unknown) {
      console.error('=== FETCH HOTEL DATA ERROR ===', err);
      let errorMsg = 'Unknown error';
      if (err instanceof Error) errorMsg = err.message;
      else if (typeof err === 'string') errorMsg = err;
      setError(`PMS API error: ${errorMsg}`);
      setAvailabilityData([]);
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Replace fetchAvailabilityData with fetchHotelData in the hook's return and usage
  return {
    hotels,
    roomTypes,
    availabilityData,
    loading,
    error,
    fetchAvailabilityData: fetchHotelData
  };
}