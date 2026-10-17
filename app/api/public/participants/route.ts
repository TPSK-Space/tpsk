// app/api/public/participants/route.ts - Self-service "Lengkapi Data" peserta (publik)
// Peserta cari nama sendiri lalu isi/revisi nama, alamat, dan nomor WhatsApp.
// "Belum lengkap" ditandai dengan data_completed_at IS NULL (bukan dari nomor WA).
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function normalizeWa(raw: string): string {
  let w = (raw || "").trim().replace(/[^0-9]/g, "");
  if (w.startsWith("0")) w = "62" + w.slice(1);
  return w;
}

function isValidWa(raw: string): boolean {
  const w = normalizeWa(raw);
  return /^62[0-9]{8,14}$/.test(w); // 62 + 8..14 digit
}

// GET: daftar peserta (per trip) yang datanya belum lengkap
//      -> hanya kembalikan fullname (tanpa nomor WA).
export async function GET(request: NextRequest) {
  const tripId = request.nextUrl.searchParams.get("trip_id");
  if (!tripId) {
    return NextResponse.json({ error: "trip_id wajib diisi." }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("trip_participants")
    .select("id, customer_id(fullname, data_completed_at)")
    .eq("trip_id", tripId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const incomplete = (data || [])
    .filter((p: any) => p.customer_id?.data_completed_at == null)
    .map((p: any) => ({
      participant_id: p.id,
      fullname: p.customer_id?.fullname || "",
    }))
    .sort((a: any, b: any) => a.fullname.localeCompare(b.fullname));

  return NextResponse.json({ data: incomplete });
}

// POST /complete: simpan kelengkapan data peserta
// body: { participant_id, fullname, address, whatsapp_number }
export async function POST(request: NextRequest) {
  const { participant_id, fullname, address, whatsapp_number } = await request.json();

  if (!participant_id) {
    return NextResponse.json({ error: "Participant id wajib diisi." }, { status: 400 });
  }
  const name = (fullname || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
  }
  if (!isValidWa(whatsapp_number)) {
    return NextResponse.json(
      { error: "Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx atau 628xxxxxxxxxx." },
      { status: 400 }
    );
  }

  const wa = normalizeWa(whatsapp_number);

  // Ambil participant + customer terkait
  const { data: part, error: partErr } = await supabaseServer
    .from("trip_participants")
    .select("id, customer_id(id, data_completed_at)")
    .eq("id", participant_id)
    .single();

  if (partErr || !part) {
    return NextResponse.json({ error: "Peserta tidak ditemukan." }, { status: 404 });
  }

  const customer = part.customer_id as any;
  if (!customer) {
    return NextResponse.json({ error: "Data peserta tidak valid." }, { status: 400 });
  }

  // Guard: tolak jika sudah dilengkapi
  if (customer.data_completed_at != null) {
    return NextResponse.json(
      { error: "Data peserta ini sudah dilengkapi." },
      { status: 409 }
    );
  }

  // Cek duplikat WA di customer lain
  const { data: dup } = await supabaseServer
    .from("customers")
    .select("id")
    .eq("whatsapp_number", wa)
    .neq("id", customer.id)
    .limit(1);
  if (dup && dup.length > 0) {
    return NextResponse.json(
      { error: "Nomor WhatsApp sudah terdaftar untuk peserta lain." },
      { status: 409 }
    );
  }

  const { error: updErr } = await supabaseServer
    .from("customers")
    .update({
      fullname: name,
      whatsapp_number: wa,
      address: (address || "").trim() || null,
      data_completed_at: new Date().toISOString(),
    })
    .eq("id", customer.id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}