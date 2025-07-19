import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface RoomInfoRequest {
  hotelCode: string
  needPhysicalRooms?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { hotelCode, needPhysicalRooms = 1 }: RoomInfoRequest = await req.json()

    // Validate required fields
    if (!hotelCode) {
      return new Response(
        JSON.stringify({ error: 'hotelCode is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Credentials
    const authCode = Deno.env.get('HOTEL_AUTH_CODE') || '964565257540601c7c-ed65-11ec-9'

    // Construct JSON payload
    const requestPayload = {
      "RES_Request": {
        "Request_Type": "RoomInfo",
        "NeedPhysicalRooms": needPhysicalRooms,
        "Authentication": {
          "HotelCode": hotelCode,
          "AuthCode": authCode
        }
      }
    }

    console.log('Sending RoomInfo request:', JSON.stringify(requestPayload, null, 2))

    // Make request to JSON API endpoint
    const response = await fetch('https://live.ipms247.com/pmsinterface/pms_connectivity.php', {
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
    console.log('RoomInfo API response:', JSON.stringify(jsonResponse, null, 2))

    // Check for API errors
    if (jsonResponse.Errors && jsonResponse.Errors.ErrorCode !== "0") {
      throw new Error(`API Error ${jsonResponse.Errors.ErrorCode}: ${jsonResponse.Errors.ErrorMessage}`)
    }

    // Transform the response to a cleaner format
    const roomInfo = transformRoomInfoResponse(jsonResponse)

    return new Response(
      JSON.stringify(roomInfo),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-room-info function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function transformRoomInfoResponse(apiResponse: any) {
  const result = {
    roomTypes: [],
    rateTypes: [],
    ratePlans: []
  }

  try {
    // Extract room types
    if (apiResponse.RoomInfo?.RoomTypes?.RoomType) {
      const roomTypes = Array.isArray(apiResponse.RoomInfo.RoomTypes.RoomType) 
        ? apiResponse.RoomInfo.RoomTypes.RoomType 
        : [apiResponse.RoomInfo.RoomTypes.RoomType]
      
      result.roomTypes = roomTypes.map((rt: any) => ({
        id: rt.ID,
        name: rt.Name,
        rooms: rt.Rooms ? rt.Rooms.map((room: any) => ({
          roomId: room.RoomID,
          roomName: room.RoomName
        })) : []
      }))
    }

    // Extract rate types
    if (apiResponse.RoomInfo?.RateTypes?.RateType) {
      const rateTypes = Array.isArray(apiResponse.RoomInfo.RateTypes.RateType)
        ? apiResponse.RoomInfo.RateTypes.RateType
        : [apiResponse.RoomInfo.RateTypes.RateType]
      
      result.rateTypes = rateTypes.map((rt: any) => ({
        id: rt.ID,
        name: rt.Name
      }))
    }

    // Extract rate plans
    if (apiResponse.RoomInfo?.RatePlans?.RatePlan) {
      const ratePlans = Array.isArray(apiResponse.RoomInfo.RatePlans.RatePlan)
        ? apiResponse.RoomInfo.RatePlans.RatePlan
        : [apiResponse.RoomInfo.RatePlans.RatePlan]
      
      result.ratePlans = ratePlans.map((rp: any) => ({
        ratePlanId: rp.RatePlanID,
        name: rp.Name,
        roomTypeId: rp.RoomTypeID,
        roomType: rp.RoomType,
        rateTypeId: rp.RateTypeID,
        rateType: rp.RateType,
        ratePlanType: rp.RatePlanType
      }))
    }

    return result
  } catch (error) {
    console.error('Error transforming room info response:', error)
    return result
  }
}