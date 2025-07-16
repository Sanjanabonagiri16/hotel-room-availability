// @allow-unauthenticated
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { searchParams } = new URL(req.url);
  const hotelCode = searchParams.get('hotelCode');
  const apiKey = searchParams.get('apiKey');

  if (!hotelCode || !apiKey) {
    return new Response(JSON.stringify({ error: 'Missing hotelCode or apiKey' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = `https://live.ipms247.com/booking/reservation_api/listing.php?request_type=RoomTypeList&HotelCode=${hotelCode}&APIKey=${apiKey}&language=en&publishtoweb=1`;

  try {
    const apiRes = await fetch(url);
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch room type info', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 