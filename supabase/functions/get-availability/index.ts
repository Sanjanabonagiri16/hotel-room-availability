import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface AvailabilityRequest {
  fromDate: string
  toDate: string
  roomTypeId?: string
}

interface RoomInventory {
  roomTypeId: string
  fromDate: string
  toDate: string
  availability: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fromDate, toDate, roomTypeId }: AvailabilityRequest = await req.json()

    // Validate required fields
    if (!fromDate || !toDate) {
      return new Response(
        JSON.stringify({ error: 'fromDate and toDate are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Credentials
    const hotelCode = '102'
    const authCode = Deno.env.get('HOTEL_AUTH_CODE') || '964565257540601c7c-ed65-11ec-9'

    // Construct XML payload
    const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<RES_Request>
  <Request_Type>Inventory</Request_Type>
  <Authentication>
    <HotelCode>${hotelCode}</HotelCode>
    <AuthCode>${authCode}</AuthCode>
  </Authentication>
  <FromDate>${fromDate}</FromDate>
  <ToDate>${toDate}</ToDate>
</RES_Request>`

    // Make request to XML API endpoint
    const response = await fetch('https://live.ipms247.com/pmsinterface/getdataAPI.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      body: xmlPayload,
    })

    if (!response.ok) {
      throw new Error(`External API returned ${response.status}: ${response.statusText}`)
    }

    const xmlResponse = await response.text()

    // Parse XML response
    const roomInventories = parseXmlToInventory(xmlResponse, roomTypeId)

    return new Response(
      JSON.stringify(roomInventories),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-availability function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function parseXmlToInventory(xmlString: string, roomTypeFilter?: string): RoomInventory[] {
  const results: RoomInventory[] = [];
  try {
    // Extract the <Source name="Front">...</Source> block
    const frontSourceMatch = xmlString.match(/<Source name="Front">([\s\S]*?)<\/Source>/);
    if (!frontSourceMatch) {
      console.log('No <Source name="Front"> found in XML');
      return [];
    }
    const frontSourceXml = frontSourceMatch[1];

    // Extract RoomType blocks from the Front source
    const roomTypeRegex = /<RoomType>([\s\S]*?)<\/RoomType>/g;
    let match;
    while ((match = roomTypeRegex.exec(frontSourceXml)) !== null) {
      const roomTypeXml = match[1];
      // FIX: Use correct case for all tags
      const roomTypeIdMatch = roomTypeXml.match(/<RoomTypeID>([^<]+)<\/RoomTypeID>/);
      const fromDateMatch = roomTypeXml.match(/<FromDate>([^<]+)<\/FromDate>/);
      const toDateMatch = roomTypeXml.match(/<ToDate>([^<]+)<\/ToDate>/);
      const availabilityMatch = roomTypeXml.match(/<Availability>([^<]+)<\/Availability>/);
      if (!roomTypeIdMatch || !fromDateMatch || !toDateMatch || !availabilityMatch) continue;
      const roomTypeId = roomTypeIdMatch[1];
      if (roomTypeFilter && roomTypeId !== roomTypeFilter) continue;
      results.push({
        roomTypeId,
        fromDate: fromDateMatch[1],
        toDate: toDateMatch[1],
        availability: parseInt(availabilityMatch[1])
      });
    }
    return results;
  } catch (error) {
    console.error('Error parsing XML:', error);
    return [];
  }
}