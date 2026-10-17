-- ============================================================
-- MIGRATION (DELTA): Titik Kumpul per-trip (meeting point)
-- Jalankan di Supabase SQL Editor. Idempotent (aman diulang).
-- ============================================================

-- Tabel titik kumpul per-trip (name + maps_url)
create table if not exists public.trip_pickup_points (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  maps_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_trip_pickup_points_trip
  on public.trip_pickup_points(trip_id);

alter table public.trip_pickup_points enable row level security;

-- Baca (anon) untuk registrasi & tiket: ambil titik kumpul per trip
drop policy if exists "anon read trip_pickup_points" on public.trip_pickup_points;
create policy "anon read trip_pickup_points" on public.trip_pickup_points
  for select using (true);
