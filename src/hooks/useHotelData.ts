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

  const fetchAvailabilityData = async (
    hotelCode: string, 
    authCode: string, 
    fromDate: Date, 
    toDate: Date
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call our Supabase Edge Function
      const response = await fetch(`https://gpnzoprxtdsymatngkbr.supabase.co/functions/v1/get-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbnpvcHJ4dGRzeW1hdG5na2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjE4OTksImV4cCI6MjA2ODEzNzg5OX0.9LXIy39UcD15CDvuSafjjmllC-Z5LY0ORWh9c0iumJE`,
        },
        body: JSON.stringify({
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const apiData: RoomInventory[] = await response.json();
      // Transform API data to our internal format
      const transformedData = transformApiDataToAvailability(apiData);
      setAvailabilityData(transformedData);

      // Dynamically extract unique room types from API response
      const uniqueRoomTypes = Array.from(
        new Map(
          apiData.map((room: RoomInventory) => [room.roomTypeId, { id: room.roomTypeId, name: room.roomTypeId, description: "" }])
        ).values()
      ) as RoomType[];
      setRoomTypes(uniqueRoomTypes);

    } catch (err) {
      console.error('API fetch error:', err);
      // Fallback to mock data if API fails
      const mockData = generateMockData(fromDate, toDate);
      setAvailabilityData(mockData);
      setRoomTypes(mockRoomTypes); // fallback to mock room types
      setError('Using mock data - API unavailable');
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
    fetchAvailabilityData
  };
}