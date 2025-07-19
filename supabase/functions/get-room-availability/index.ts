import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface RoomAvailabilityRequest {
  hotelCode: string
  fromDate: string
  toDate: string
  roomTypeId?: string
  roomId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { hotelCode, fromDate, toDate, roomTypeId, roomId }: RoomAvailabilityRequest = await req.json()

    // Validate required fields
    if (!hotelCode || !fromDate || !toDate) {
      return new Response(
        JSON.stringify({ error: 'hotelCode, fromDate and toDate are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Credentials
    const authCode = Deno.env.get('HOTEL_AUTH_CODE') || '964565257540601c7c-ed65-11ec-9'

    // Construct JSON payload
    const requestPayload: any = {
      "RES_Request": {
        "Request_Type": "RoomAvailability",
        "Authentication": {
          "HotelCode": hotelCode,
          "AuthCode": authCode
        },
        "RoomData": {
          "from_date": fromDate,
          "to_date": toDate
        }
      }
    }

    // Add optional filters
    if (roomTypeId) {
      requestPayload.RES_Request.RoomData.RoomtypeID = roomTypeId
    }
    if (roomId) {
      requestPayload.RES_Request.RoomData.RoomID = roomId
    }

    console.log('Sending RoomAvailability request:', JSON.stringify(requestPayload, null, 2))

    // Make request to kiosk connectivity API endpoint
    const response = await fetch('https://live.ipms247.com/index.php/page/service.kioskconnectivity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    })

    if (!response.ok) {
      throw new Error(`External API returned ${response.status}: ${response.statusText}`)
    }

    const jsonResponse = await response.json()
    console.log('RoomAvailability API response:', JSON.stringify(jsonResponse, null, 2))

    // Check for API errors
    if (jsonResponse.Error) {
      const errors = Array.isArray(jsonResponse.Error) ? jsonResponse.Error : [jsonResponse.Error]
      const errorMessages = errors.map((err: any) => `${err.ErrorCode}: ${err.ErrorMessage}`).join(', ')
      throw new Error(`API Error - ${errorMessages}`)
    }

    if (jsonResponse.Errors && jsonResponse.Errors.ErrorCode !== "0") {
      throw new Error(`API Error ${jsonResponse.Errors.ErrorCode}: ${jsonResponse.Errors.ErrorMessage}`)
    }

    // Transform the response to a cleaner format
    const availableRooms = transformRoomAvailabilityResponse(jsonResponse)

    return new Response(
      JSON.stringify(availableRooms),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-room-availability function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function transformRoomAvailabilityResponse(apiResponse: any) {
  const result = {
    availableRooms: [],
    totalRoomTypes: 0,
    totalRooms: 0
  }

  try {
    if (apiResponse.Success?.RoomList) {
      const roomList = Array.isArray(apiResponse.Success.RoomList) 
        ? apiResponse.Success.RoomList 
        : [apiResponse.Success.RoomList]
      
      result.availableRooms = roomList.map((roomType: any) => ({
        roomTypeId: roomType.RoomtypeID,
        roomTypeName: roomType.RoomtypeName,
        rooms: roomType.RoomData ? roomType.RoomData.map((room: any) => ({
          roomId: room.RoomID,
          roomName: room.RoomName
        })) : [],
        availableCount: roomType.RoomData ? roomType.RoomData.length : 0
      }))

      result.totalRoomTypes = result.availableRooms.length
      result.totalRooms = result.availableRooms.reduce((sum: number, rt: any) => sum + rt.availableCount, 0)
    }

    return result
  } catch (error) {
    console.error('Error transforming room availability response:', error)
    return result
  }
}