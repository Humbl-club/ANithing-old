/// <reference path="../_shared/deno.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceKey = Deno.env.get('SERVICE_ROLE_KEY')
  || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  || Deno.env.get('SUPABASE_ANON_KEY')
  || ''

const supabase = createClient(supabaseUrl, serviceKey)

Deno.serve(async (req) => {
  const correlationId = req.headers.get('x-correlation-id') ?? crypto.randomUUID();
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Simple DB check
    const { data, error } = await supabase.from('titles').select('id', { count: 'exact', head: true }).limit(1)
    const healthy = !error

    const payload = {
      success: true,
      data: {
        status: healthy ? 'ok' : 'degraded',
        db: healthy ? 'ok' : 'error',
        countSample: data?.length ?? 0
      },
      error: null,
      meta: { correlationId, at: new Date().toISOString() }
    }

    return new Response(JSON.stringify(payload), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId } })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, data: null, error: (e as any).message, meta: { correlationId } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId } })
  }
})
