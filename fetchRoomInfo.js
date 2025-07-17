// fetchRoomInfo.js

// If using Node 18+, fetch is built-in. For Node 16 or lower, run: npm install node-fetch
let fetchFn;
try {
  fetchFn = fetch;
} catch {
  fetchFn = require('node-fetch');
}

// Fetch Room Information from PMS API
const fetchRoomInformation = async () => {
  const url = 'https://live.ipms247.com/pmsinterface/pms_connectivity.php';
  const requestPayload = {
    "RES_Request": {
      "Request_Type": "RoomInfo",
      "NeedPhysicalRooms": 1,
      "Authentication": {
        "HotelCode": "102",
        "AuthCode": "964565257540601c7c-ed65-11ec-9"
      }
    }
  };

  try {
    console.log('Sending request to:', url);
    console.log('Request payload:', JSON.stringify(requestPayload, null, 2));
    const response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    console.log('Response status:', response.status);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log('Raw API Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching room information:', error);
    throw error;
  }
};

const processRoomData = (roomInfoResponse) => {
  console.log('\n=== PROCESSING ROOM INFORMATION ===');
  if (!roomInfoResponse) {
    console.log('No room information received');
    return null;
  }
  // Log the complete response structure
  console.log('Complete Response Structure:');
  console.log(JSON.stringify(roomInfoResponse, null, 2));

  // Extract and display room types
  if (roomInfoResponse.RoomTypes && Array.isArray(roomInfoResponse.RoomTypes)) {
    console.log('\n--- ROOM TYPES ---');
    roomInfoResponse.RoomTypes.forEach(roomType => {
      console.log(`Room Type: ${roomType.Name} (ID: ${roomType.ID})`);
      if (roomType.Rooms && Array.isArray(roomType.Rooms)) {
        roomType.Rooms.forEach(room => {
          console.log(`  - Room: ${room.RoomName} (ID: ${room.RoomID})`);
        });
      }
    });
  }

  // Extract and display rate types
  if (roomInfoResponse.RateTypes && Array.isArray(roomInfoResponse.RateTypes)) {
    console.log('\n--- RATE TYPES ---');
    roomInfoResponse.RateTypes.forEach(rateType => {
      console.log(`Rate Type: ${rateType.Name} (ID: ${rateType.ID})`);
    });
  }

  // Extract and display rate plans
  if (roomInfoResponse.RatePlans && Array.isArray(roomInfoResponse.RatePlans)) {
    console.log('\n--- RATE PLANS ---');
    roomInfoResponse.RatePlans.forEach(ratePlan => {
      console.log(`Rate Plan: ${ratePlan.Name} (ID: ${ratePlan.RatePlanID})`);
    });
  }

  return roomInfoResponse;
};

const getRoomInformation = async () => {
  try {
    console.log('Starting room information fetch...');
    const roomInfo = await fetchRoomInformation();
    const processedData = processRoomData(roomInfo);
    console.log('\n=== ROOM INFORMATION FETCH COMPLETE ===');
    return processedData;
  } catch (error) {
    console.error('Failed to retrieve room information:', error);
    return null;
  }
};

getRoomInformation(); 