
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

export function useHotelData() {
  const [hotels] = useState<Hotel[]>(mockHotels);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate mock availability data based on room types with proper date handling
  const generateMockAvailabilityData = (roomTypes: RoomType[], fromDate: Date, toDate: Date): AvailabilityData[] => {
    const data: AvailabilityData[] = [];
    // Create proper date objects to avoid timezone issues
    const currentDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const endDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
    
    while (currentDate <= endDate) {
      roomTypes.forEach(roomType => {
        // Generate realistic availability with some patterns
        let rooms = Math.floor(Math.random() * 8) + 1; // 1-8 rooms available
        
        // Make weekends more scarce
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          rooms = Math.floor(rooms * 0.6);
        }
        
        // Some room types are always scarce
        if (roomType.name.toLowerCase().includes('presidential') || 
            roomType.name.toLowerCase().includes('ultra') ||
            roomType.name.toLowerCase().includes('suite')) {
          rooms = Math.floor(rooms * 0.5) + 1; // At least 1 room
        }
        
        data.push({
          roomTypeId: roomType.id,
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
          availableRooms: rooms
        });
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Generated availability data from ${fromDate.toDateString()} to ${toDate.toDateString()}`);
    return data;
  };

  // Fetch real availability data from room availability API
  const fetchRealAvailabilityData = async (
    hotelCode: string, 
    authCode: string,
    roomTypes: RoomType[], 
    fromDate: Date, 
    toDate: Date
  ): Promise<AvailabilityData[]> => {
    const fromDateStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(fromDate.getDate()).padStart(2, '0')}`;
    const toDateStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;
    
    console.log(`[Real Availability API] Fetching for all room types from ${fromDateStr} to ${toDateStr}`);
    
    const response = await fetch(`https://gpnzoprxtdsymatngkbr.supabase.co/functions/v1/get-room-availability`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbnpvcHJ4dGRzeW1hdG5na2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjE4OTksImV4cCI6MjA2ODEzNzg5OX0.9LXIy39UcD15CDvuSafjjmllC-Z5LY0ORWh9c0iumJE`
      },
      body: JSON.stringify({ 
        hotelCode, 
        fromDate: fromDateStr, 
        toDate: toDateStr
      })
    });

    if (!response.ok) {
      throw new Error(`Real availability API failed with status: ${response.status}`);
    }

    const availabilityResponse = await response.json();
    console.log('[Real Availability API] Response:', availabilityResponse);
    
    // Convert real availability data to our format
    const realAvailabilityData: AvailabilityData[] = [];
    const currentDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const endDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
    
    while (currentDate <= endDate) {
      if (availabilityResponse.availableRooms && Array.isArray(availabilityResponse.availableRooms)) {
        availabilityResponse.availableRooms.forEach((roomTypeData: any) => {
          realAvailabilityData.push({
            roomTypeId: roomTypeData.roomTypeId,
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
            availableRooms: roomTypeData.availableCount || 0
          });
        });
      } else {
        // If no availability data returned, generate based on room types we know exist
        roomTypes.forEach(roomType => {
          realAvailabilityData.push({
            roomTypeId: roomType.id,
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
            availableRooms: 0 // No rooms available
          });
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return realAvailabilityData;
  };

  // Fetch hotel data using RoomInfo API only
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
      // API: RoomInfo (room types) - Use Supabase Edge Function
      console.log('[PMS API] Fetching room info for hotel:', hotelCode);
      const roomInfoRes = await fetch(`https://gpnzoprxtdsymatngkbr.supabase.co/functions/v1/get-room-info`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbnpvcHJ4dGRzeW1hdG5na2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjE4OTksImV4cCI6MjA2ODEzNzg5OX0.9LXIy39UcD15CDvuSafjjmllC-Z5LY0ORWh9c0iumJE`
        },
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

      console.log('Real room types from API:', roomTypesArr.length, 'room types found');

      // Try to get real availability data first, fall back to mock if API fails
      try {
        const realAvailabilityData = await fetchRealAvailabilityData(hotelCode, authCode, roomTypesArr, fromDate, toDate);
        setAvailabilityData(realAvailabilityData);
        console.log('Using real availability data:', realAvailabilityData.length, 'records');
      } catch (availabilityError) {
        console.warn('Real availability API failed, using mock data:', availabilityError);
        const mockAvailabilityData = generateMockAvailabilityData(roomTypesArr, fromDate, toDate);
        setAvailabilityData(mockAvailabilityData);
        console.log('Using mock availability data:', mockAvailabilityData.length, 'records');
      }
      
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

  // Function to fetch available rooms for booking
  const fetchAvailableRooms = async (
    hotelCode: string,
    fromDate: Date,
    toDate: Date,
    roomTypeId?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Format dates properly for API (YYYY-MM-DD format)
      const fromDateStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(fromDate.getDate()).padStart(2, '0')}`;
      const toDateStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;
      
      console.log(`[Room Availability API] Fetching data for ${fromDateStr} to ${toDateStr}`);
      
      const response = await fetch(`https://gpnzoprxtdsymatngkbr.supabase.co/functions/v1/get-room-availability`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbnpvcHJ4dGRzeW1hdG5na2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjE4OTksImV4cCI6MjA2ODEzNzg5OX0.9LXIy39UcD15CDvuSafjjmllC-Z5LY0ORWh9c0iumJE`
        },
        body: JSON.stringify({ 
          hotelCode, 
          fromDate: fromDateStr, 
          toDate: toDateStr,
          roomTypeId
        })
      });

      if (!response.ok) {
        throw new Error(`Room availability API call failed with status: ${response.status}`);
      }

      const roomData = await response.json();
      console.log('[Room Availability API] Response:', roomData);
      return roomData;
    } catch (err: unknown) {
      console.error('=== FETCH AVAILABLE ROOMS ERROR ===', err);
      let errorMsg = 'Unknown error';
      if (err instanceof Error) errorMsg = err.message;
      else if (typeof err === 'string') errorMsg = err;
      setError(`Room availability API error: ${errorMsg}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    hotels,
    roomTypes,
    availabilityData,
    loading,
    error,
    fetchAvailabilityData: fetchHotelData,
    fetchAvailableRooms
  };
}
