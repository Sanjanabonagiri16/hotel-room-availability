import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { agentId, hotelCodes } = await req.json();
    if (!agentId || !Array.isArray(hotelCodes)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Supabase client
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Get hotel IDs by code
    const { data: hotels, error: hotelError } = await supabase
      .from('hotels')
      .select('id, code')
      .in('code', hotelCodes);
    if (hotelError) throw hotelError;

    // Remove existing agent_hotels for this agent
    const { error: deleteError } = await supabase
      .from('agent_hotels')
      .delete()
      .eq('agent_id', agentId);
    if (deleteError) throw deleteError;

    // Insert new agent_hotels
    if (hotels.length > 0) {
      const hotelLinks = hotels.map(h => ({ agent_id: agentId, hotel_id: h.id }));
      const { error: linkError } = await supabase
        .from('agent_hotels')
        .insert(hotelLinks);
      if (linkError) throw linkError;
    }

    // Return updated agent with hotels
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, email, status')
      .eq('id', agentId)
      .single();
    if (agentError) throw agentError;

    return new Response(
      JSON.stringify({
        ...agent,
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