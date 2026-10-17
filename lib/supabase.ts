// lib/supabase.ts - Supabase client (browser) untuk operasi client-side

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Placeholder dipakai saat build (env belum diisi) supaya import tidak crash.
// Saat runtime (dev/prod), env harus diisi via .env.local.
// Pakai `||` (bukan ??) karena .env.local yang kosong = string kosong.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

