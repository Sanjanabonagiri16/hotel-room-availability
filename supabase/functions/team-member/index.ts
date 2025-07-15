import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, role, active, hotelCodes } = await req.json();
    if (!firstName || !lastName || !email || !role || !Array.isArray(hotelCodes)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Supabase client
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Insert team member
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        active,
      })
      .select()
      .single();
    if (memberError) throw memberError;

    // Get hotel IDs by code
    const { data: hotels, error: hotelError } = await supabase
      .from('hotels')
      .select('id, code')
      .in('code', hotelCodes);
    if (hotelError) throw hotelError;

    // Insert into team_member_hotels
    if (hotels.length > 0) {
      const hotelLinks = hotels.map(h => ({ team_member_id: member.id, hotel_id: h.id }));
      const { error: linkError } = await supabase
        .from('team_member_hotels')
        .insert(hotelLinks);
      if (linkError) throw linkError;
    }

    // Return created member with hotels
    return new Response(
      JSON.stringify({
        ...member,
        hotels: hotels.map(h => ({ code: h.code, id: h.id }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});