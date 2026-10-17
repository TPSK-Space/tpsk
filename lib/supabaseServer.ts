// lib/supabaseServer.ts - Supabase client (server) dengan service role key
// HANYA dipakai di server (route handler / server component). Jangan di-export ke client.

import { createClient } from "@supabase/supabase-js";

// Placeholder dipakai saat build (env belum diisi) supaya import tidak crash.
// Pakai `||` (bukan ??) karena .env.local yang kosong = string kosong.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder.supabase.co";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
