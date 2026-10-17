// app/api/send-wa/route.ts
// POST: enqueue pengiriman tiket WhatsApp (single atau bulk queue)
// GET:  ambil status antrian (untuk polling progress bar)
//
// Mekanisme anti-spam: pesan tidak langsung dikirim, melainkan dimasukkan ke
// tabel wa_message_queue lalu diproses asinkron (delay 4-6 detik antar pesan)
// oleh worker di /api/send-wa/process.

import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

function buildTicketMessage(params: {
  custName: string;
  tripName: string;
  ticketBarcode: string;
  origin: string;
}): string {
  const { custName, tripName, ticketBarcode, origin } = params;
  const linkCheckin = `${origin}/ticket?id=${ticketBarcode}`;
  return [
    `Halo Kak *${custName}*,`,
    ``,
    `Ini adalah tiket keberangkatan untuk trip *${tripName}*.`,
    ``,
    `Simpan dan tunjukkan Barcode pada link di bawah ini ke petugas kami saat penjemputan:`,
    `  ${linkCheckin}`,
    ``,
    `Terima kasih!`,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  // Auth guard
  const token = request.cookies.get("tapak_session")?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.mode) {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const origin = request.nextUrl.origin;

  if (body.mode === "single") {
    const { participant_id } = body;
    if (!participant_id) {
      return NextResponse.json({ error: "participant_id wajib" }, { status: 400 });
    }

    // Ambil data peserta + customer + trip
    const { data: part, error: partErr } = await supabaseServer
      .from("trip_participants")
      .select("id, barcode, customer_id, trip_id")
      .eq("id", participant_id)
      .single();

    if (partErr || !part) {
      return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
    }

    const { data: cust } = await supabaseServer
      .from("customers")
      .select("fullname, whatsapp_number")
      .eq("id", part.customer_id)
      .single();

    const { data: trip } = await supabaseServer
      .from("trips")
      .select("name")
      .eq("id", part.trip_id)
      .single();

    if (!cust || !cust.whatsapp_number) {
      return NextResponse.json(
        { error: "Nomor WhatsApp peserta belum diisi" },
        { status: 400 }
      );
    }

    const message = buildTicketMessage({
      custName: cust.fullname,
      tripName: trip?.name || "Trip",
      ticketBarcode: part.barcode,
      origin,
    });

    const { data: inserted, error: insErr } = await supabaseServer
      .from("wa_message_queue")
      .insert({
        participant_id: part.id,
        whatsapp_number: cust.whatsapp_number,
        message,
        status: "PENDING",
      })
      .select()
      .single();

    if (insErr) {
      return NextResponse.json({ error: "Gagal enqueue" }, { status: 500 });
    }

    return NextResponse.json({ queued: 1, first_id: inserted.id });
  }

  if (body.mode === "bulk") {
    const { trip_id } = body;
    if (!trip_id) {
      return NextResponse.json({ error: "trip_id wajib" }, { status: 400 });
    }

    // Ambil semua peserta trip + customer + trip name
    const { data: parts, error } = await supabaseServer
      .from("trip_participants")
      .select(
        "id, barcode, customer_id(fullname, whatsapp_number)"
      )
      .eq("trip_id", trip_id);

    if (error) {
      return NextResponse.json({ error: "Gagal ambil peserta" }, { status: 500 });
    }

    const { data: trip } = await supabaseServer
      .from("trips")
      .select("name")
      .eq("id", trip_id)
      .single();

    const rows = (parts || [])
      .filter((p: any) => p.customer_id?.whatsapp_number)
      .map((p: any) => ({
        participant_id: p.id,
        whatsapp_number: p.customer_id.whatsapp_number,
        message: buildTicketMessage({
          custName: p.customer_id.fullname,
          tripName: trip?.name || "Trip",
          ticketBarcode: p.barcode,
          origin,
        }),
        status: "PENDING",
      }));

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada peserta dengan nomor WA valid" },
        { status: 400 }
      );
    }

    const { data: inserted, error: insErr } = await supabaseServer
      .from("wa_message_queue")
      .insert(rows)
      .select("id");

    if (insErr) {
      return NextResponse.json({ error: "Gagal enqueue" }, { status: 500 });
    }

    return NextResponse.json({ queued: inserted.length });
  }

  return NextResponse.json({ error: "Mode tidak dikenal" }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("tapak_session")?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ambil statistik antrian (untuk progress)
  const { data: stats, error } = await supabaseServer
    .from("wa_message_queue")
    .select("status");

  if (error) {
    return NextResponse.json({ error: "Gagal ambil status" }, { status: 500 });
  }

  const total = (stats || []).length;
  const sent = (stats || []).filter((s: any) => s.status === "SENT").length;
  const failed = (stats || []).filter((s: any) => s.status === "FAILED").length;
  const pending = (stats || []).filter((s: any) => s.status === "PENDING").length;

  return NextResponse.json({
    total,
    sent,
    failed,
    pending,
    progress: total === 0 ? 0 : Math.round(((sent + failed) / total) * 100),
  });
}
