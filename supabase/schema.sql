-- ============================================================
-- TAPAK SWAKA SPACE - DATABASE SCHEMA (Supabase / PostgreSQL)
-- Migrasi dari Astro (Supabase) ke Next.js
-- ============================================================

-- Ekstensi yang dibutuhkan
create extension if not exists "pgcrypto"; -- untuk bcrypt hash password

-- ============================================================
-- 1. ROLES
-- ============================================================
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Seed 5 role
insert into public.roles (name) values
  ('Owner'),
  ('Admin'),
  ('Finance'),
  ('Staff'),
  ('Developer')
on conflict (name) do nothing;

-- ============================================================
-- 2. USERS
-- ============================================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  passcode text not null, -- disimpan sebagai bcrypt hash (crypt() + gen_salt('bf'))
  nama text,
  role_id uuid references public.roles(id) on delete set null,
  whatsapp_number text,
  created_at timestamptz not null default now()
);

-- Seed users (passcode di-hash bcrypt via crypt() + gen_salt('bf'))
insert into public.users (username, passcode, nama, role_id)
select u.username, crypt(u.passcode, gen_salt('bf')), u.nama, r.id
from (values
  ('sugiono',  '123456', 'M Arif Agus Sugiono',      'Owner'),
  ('ilyas',    '654321', 'M Ilyas Habiburrohman',    'Finance'),
  ('bae',      '151199', 'Bayu Agus Nurrudin',       'Developer'),
  ('nailong',  '123321', 'Ilham Yusuf Fihriansyah',  'Admin')
) as u(username, passcode, nama, role_name)
join public.roles r on r.name = u.role_name
on conflict (username) do nothing;

-- ============================================================
-- 3. TRIPS
-- ============================================================
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text,
  trip_date date,
  kapasitas_max integer not null default 50,
  kapasitas_terisi integer not null default 0,
  tipe_trip text default 'Open Trip',
  status text default 'Draft',
  is_lengkap boolean not null default false,
  harga_jual_min numeric,
  base_price numeric,
  armada text,
  tour_leader_id uuid references public.users(id) on delete set null,
  dokumentasi_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. PICKUP POINTS
-- ============================================================
create table if not exists public.pickup_points (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  maps_url text
);

-- ============================================================
-- 5. CUSTOMERS
-- ============================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  fullname text not null,
  whatsapp_number text not null unique,
  address text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. TRIP PARTICIPANTS (Manifest)
-- ============================================================
create table if not exists public.trip_participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  pickup_point text,
  seat_number text not null default 'TBA',
  slug text not null unique,
  barcode text not null unique,
  check_in_keberangkatan boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. LEDGERS
-- ============================================================
create table if not exists public.ledgers (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.trip_participants(id) on delete cascade,
  amount_paid numeric not null default 0,
  payment_status text not null default 'UNPAID',
  created_at timestamptz not null default now()
);

-- ============================================================
-- 8. TRIP CREWS
-- ============================================================
create table if not exists public.trip_crews (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  role text not null,
  user_id uuid not null references public.users(id) on delete cascade
);

-- Satu user tidak boleh double di role yang sama pada trip yang sama
create unique index if not exists idx_trip_crews_unique
  on public.trip_crews(trip_id, user_id, role);

-- ============================================================
-- 9. TRIP RUNDOWNS (Itinerary)
-- ============================================================
create table if not exists public.trip_rundowns (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  activity_time timestamptz,
  description text,
  duration_minutes integer,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 10. WA MESSAGE QUEUE (pengiriman tiket via Fonnte, anti-spam)
-- ============================================================
create table if not exists public.wa_message_queue (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.trip_participants(id) on delete cascade,
  whatsapp_number text not null,
  message text not null,
  status text not null default 'PENDING', -- PENDING | SENT | FAILED
  error text,
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

-- ============================================================
-- INDEX
-- ============================================================
create index if not exists idx_trip_participants_trip on public.trip_participants(trip_id);
create index if not exists idx_trip_participants_customer on public.trip_participants(customer_id);
create index if not exists idx_ledgers_participant on public.ledgers(participant_id);
create index if not exists idx_trip_crews_trip on public.trip_crews(trip_id);
create index if not exists idx_trip_rundowns_trip on public.trip_rundowns(trip_id);
create index if not exists idx_wa_queue_status on public.wa_message_queue(status);

-- ============================================================
-- TRIGGER: auto-update kapasitas_terisi berdasarkan jumlah peserta
-- ============================================================
create or replace function public.update_trip_kapasitas()
returns trigger
language plpgsql
as $$
declare
  v_trip_id uuid;
begin
  v_trip_id := coalesce(new.trip_id, old.trip_id);

  update public.trips
  set kapasitas_terisi = (
    select count(*) from public.trip_participants where trip_id = v_trip_id
  )
  where id = v_trip_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_update_kapasitas on public.trip_participants;
create trigger trg_update_kapasitas
after insert or delete or update of trip_id
on public.trip_participants
for each row
execute function public.update_trip_kapasitas();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.trips enable row level security;
alter table public.pickup_points enable row level security;
alter table public.customers enable row level security;
alter table public.trip_participants enable row level security;
alter table public.ledgers enable row level security;
alter table public.trip_crews enable row level security;
alter table public.trip_rundowns enable row level security;
alter table public.wa_message_queue enable row level security;

-- Kebijakan default: MANAGEMENT (roles, users, trips, pickup_points, customers, ledgers, trip_crews, trip_rundowns) hanya service role (server). Public/anon hanya e-ticket (lihat bawah).
create policy "service full access roles" on public.roles for all using (true) with check (true);
create policy "service full access users" on public.users for all using (true) with check (true);
create policy "service full access trips" on public.trips for all using (true) with check (true);
create policy "service full access pickup_points" on public.pickup_points for all using (true) with check (true);
create policy "service full access customers" on public.customers for all using (true) with check (true);
create policy "service full access trip_participants" on public.trip_participants for all using (true) with check (true);
create policy "service full access ledgers" on public.ledgers for all using (true) with check (true);
create policy "service full access trip_crews" on public.trip_crews for all using (true) with check (true);
create policy "service full access trip_rundowns" on public.trip_rundowns for all using (true) with check (true);
create policy "service full access wa_message_queue" on public.wa_message_queue for all using (true) with check (true);

-- Public (anon): hanya untuk e-ticket halaman /ticket
-- * trip_participants: SELECT (baca) semua baris. UPDATE check-in TIDAK diizinkan anon (via API server).
create policy "anon read trip_participants" on public.trip_participants
  for select using (true);
create policy "anon read trips for ticket" on public.trips
  for select using (true);
create policy "anon read customers for ticket" on public.customers
  for select using (true);
-- Boarding view (/ticket pasca check-in): kursi, rundown, crew + kontak WA
create policy "anon read trip_rundowns for ticket" on public.trip_rundowns
  for select using (true);
create policy "anon read trip_crews for ticket" on public.trip_crews
  for select using (true);
create policy "anon read users for ticket (crew)" on public.users
  for select using (true);

-- Public (anon) INSERT untuk form pendaftaran publik (/registrasi).
-- Hanya izinkan INSERT (bukan UPDATE/DELETE) ke 3 tabel ini.
create policy "anon insert customers (registrasi)" on public.customers for insert with check (true);
create policy "anon insert trip_participants (registrasi)" on public.trip_participants for insert with check (true);
create policy "anon insert ledgers (registrasi)" on public.ledgers for insert with check (true);

-- ============================================================
-- HELPER: verifikasi login (RPC) - dipanggil API auth/login
-- ============================================================
create or replace function public.verify_login(p_username text, p_passcode text)
returns table (id uuid, username text, nama text, role_id uuid)
language plpgsql
security definer
as $$
begin
  return query
  select u.id, u.username, u.nama, u.role_id
  from public.users u
  where u.username = p_username
    and u.passcode = crypt(p_passcode, u.passcode);
end;
$$;

-- ============================================================
-- HELPER: hash passcode untuk insert/update user
-- ============================================================
create or replace function public.hash_passcode(p_passcode text)
returns text
language sql
immutable
as $$
  select crypt(p_passcode, gen_salt('bf'));
$$;
