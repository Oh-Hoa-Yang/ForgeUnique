// Supabase Edge Function
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts"; 
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const env = config({ path: "./../../../.env" });
console.log('Loaded environment variables:', env);

const requiredEnvVars = [
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 
];

const missingVars = requiredEnvVars.filter((key) => !env[key]);

if (missingVars.length > 0) {
  console.error(`Missing environment variables: ${missingVars.join(', ')}`);
  Deno.exit(1);
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY')!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000', // Allow requests from any origin. Replace '*' with your domain in production.
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Specify allowed methods
  'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Specify allowed headers
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request');
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { email, hashedPasscode } = await req.json();
    console.log('Request received:', { email, hashedPasscode });

    if (!email || !hashedPasscode) {
      return new Response(
        JSON.stringify({ error: 'Email and passcode are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: users, error: userError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email')
      .eq('email', email);

    console.log('Users fetched:', users);

    if (userError || !users || users.length === 0) {
      console.error('Error fetching user:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    const user = users[0];
    const { data: userRecord, error: recordError } = await supabaseAdmin
      .from('Users')
      .select('passcode')
      .eq('user_id', user.id)
      .single();
      
    console.log('User record fetched:', userRecord);

    if (recordError || !userRecord) {
      console.error('Error fetching passcode:', recordError);
      return new Response(
        JSON.stringify({ error: 'Passcode not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    if (userRecord.passcode === hashedPasscode) {
      return new Response(
        JSON.stringify({ success: true, message: 'Identity verified' }),
        { status: 200, headers: corsHeaders }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Incorrect passcode' }),
        { status: 401, headers: corsHeaders }
      );
    }
  } catch (err) {
    console.error('Internal Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
