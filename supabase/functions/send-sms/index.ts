import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Get secrets from Supabase environment variables
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER'); // The number sending the SMS

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the JSON body payload
    const data = await req.json();
    const { farmerPhone, buyerPhone, cropName } = data;

    // Validate inputs
    if (!farmerPhone) throw new Error('farmerPhone is missing from the payload');
    if (!cropName) throw new Error('cropName is missing from the payload');
    
    // Construct the SMS message text
    const messageBody = `AgriVision Alert: A buyer (${buyerPhone || 'Unknown Number'}) is interested in purchasing your crop: ${cropName}. Please check your AgriVision dashboard or contact them back.`;

    // Package the request for Twilio's REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', farmerPhone);
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('Body', messageBody);

    // Call Twilio using Basic Authentication
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      },
      body: formData.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio Error:', twilioData);
      throw new Error(`Failed to send SMS via Twilio: ${twilioData.message || 'Unknown error'}`);
    }

    // Success
    return new Response(JSON.stringify({ success: true, sid: twilioData.sid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Edge Function Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
