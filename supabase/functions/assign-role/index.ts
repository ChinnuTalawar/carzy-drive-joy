// deno-lint-ignore-file no-explicit-any
// Edge Function: assign-role
// Securely assigns a non-admin role to the authenticated user using the service role key.
// - Authenticated user is derived from the Authorization header (JWT)
// - Only allows roles: 'user' and 'car-owner'
// - Uses service-role client to bypass RLS safely

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AppRole = 'user' | 'car-owner';

interface RequestBody {
  role: AppRole;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // Client for reading auth user from JWT
    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !user) {
      return json({ error: 'Invalid token' }, 401);
    }

    const body: RequestBody = await req.json();
    const role = body?.role;

    if (!role || !['user', 'car-owner'].includes(role)) {
      return json({ error: 'Invalid role' }, 400);
    }

    // Service role client for DB write bypassing RLS
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Upsert role (ignore if already present)
    const { error: insertErr } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: user.id, role })
      .select('id')
      .single();

    if (insertErr && !String(insertErr.message).includes('duplicate key')) {
      return json({ error: 'Failed to assign role', details: insertErr.message }, 500);
    }

    return json({ success: true, user_id: user.id, role });
  } catch (e: any) {
    return json({ error: 'Unexpected error', details: String(e?.message || e) }, 500);
  }
}, { onListen: () => {} });

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
