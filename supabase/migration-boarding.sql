-- ============================================================
-- MIGRATION (INCREMENTAL / DELTA)
-- Boarding view + Setting tab (departure date, armada, TL, Dokumentasi)
-- JANGAN jalankan schema.sql lagi. Jalankan HANYA file ini di Supabase
-- SQL Editor (karena schema.sql lama sudah pernah di-run).
-- Idempotent: aman dijalankan berulang kali.
-- ============================================================

-- 1. Kolom WhatsApp untuk user (Tour Leader / Dokumentasi / crew)
alter table public.users
  add column if not exists whatsapp_number text;

-- 2. Unique index: satu user tidak boleh double di role yang sama
--    pada trip yang sama (Tour Leader / Dokumentasi / crew lain).
create unique index if not exists idx_trip_crews_unique
  on public.trip_crews(trip_id, user_id, role);

-- 3. RLS: izinkan baca (anon) untuk boarding view di /ticket
--    pasca check-in: rundown, crew, dan user (kontak WhatsApp).
drop policy if exists "anon read trip_rundowns for ticket" on public.trip_rundowns;
create policy "anon read trip_rundowns for ticket" on public.trip_rundowns
  for select using (true);

drop policy if exists "anon read trip_crews for ticket" on public.trip_crews;
create policy "anon read trip_crews for ticket" on public.trip_crews
  for select using (true);

drop policy if exists "anon read users for ticket (crew)" on public.users;
create policy "anon read users for ticket (crew)" on public.users
  for select using (true);

-- 4. (Opsional) Isi WhatsApp untuk user management yang sudah ada.
--    Ganti nomor di bawah sesuai data asli, lalu uncomment.
-- update public.users set whatsapp_number = '6281234567890' where username = 'sugiono';
-- update public.users set whatsapp_number = '6281234567891' where username = 'ilyas';
-- update public.users set whatsapp_number = '6281234567892' where username = 'bae';
-- update public.users set whatsapp_number = '6281234567893' where username = 'nailong';
