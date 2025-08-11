// Simple CORS configuration
const isDev = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;

export const corsHeaders = {
  'Access-Control-Allow-Origin': isDev ? '*' : 'https://your-production-domain.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};