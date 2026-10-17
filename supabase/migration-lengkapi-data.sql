-- ============================================================
-- MIGRATION (DELTA): Self-service "Lengkapi Data" peserta (publik)
-- Peserta cari nama sendiri (combobox search) lalu isi/revisi
-- nama, alamat, dan nomor WhatsApp.
-- "Belum lengkap" ditandai dengan data_completed_at IS NULL.
-- Idempotent: aman dijalankan berulang kali.
-- ============================================================

-- 1. Kolom audit: kapan data peserta dilengkapi
--    (NULL = belum dilengkapi -> muncul di daftar lengkapi-data)
alter table public.customers
  add column if not exists data_completed_at timestamptz;

-- 2. RLS baca (anon) untuk halaman lengkapi-data:
--    hanya boleh baca customer yang BELUM dilengkapi (data_completed_at IS NULL).
--    Customer yang sudah lengkap tidak boleh dibaca anon.
drop policy if exists "anon read incomplete customers (lengkapi-data)" on public.customers;
create policy "anon read incomplete customers (lengkapi-data)" on public.customers
  for select using (
    data_completed_at is null
  );

-- Catatan: penulisan (update) tetap lewat API server (service role),
-- tidak lewat anon, demi keamanan & validasi format WhatsApp.