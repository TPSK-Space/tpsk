// app/api/participants/[id]/route.ts - Update/delete/get participant detail (management)
import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/apiGuard";
import { supabaseServer } from "@/lib/supabaseServer";

// GET detail participant + ledgers (untuk halaman peserta_info)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id } = await params;
  const { data, error } = await supabaseServer
    .from("trip_participants")
    .select(
      "id, customer_id(id, fullname, whatsapp_number), seat_number, pickup_point, barcode, ledgers(id, payment_status, amount_paid, created_at)"
    )
    .eq("id", id)
    .single();

  if (error || !data)
    return NextResponse.json({ error: "Data peserta tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id } = await params;
  const { seat_number, pickup_point, customer_fullname, customer_whatsapp } =
    await request.json();

  const payload: Record<string, string> = {};
  if (seat_number !== undefined) payload.seat_number = seat_number;
  if (pickup_point !== undefined) payload.pickup_point = pickup_point;

  const { data: participant } = await supabaseServer
    .from("trip_participants")
    .select("customer_id")
    .eq("id", id)
    .single();

  if (participant && (customer_fullname !== undefined || customer_whatsapp !== undefined)) {
    const custPayload: Record<string, string> = {};
    if (customer_fullname !== undefined) custPayload.fullname = customer_fullname;
    if (customer_whatsapp !== undefined) custPayload.whatsapp_number = customer_whatsapp;
    await supabaseServer
      .from("customers")
      .update(custPayload)
      .eq("id", participant.customer_id);
  }

  const { error } = await supabaseServer
    .from("trip_participants")
    .update(payload)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id } = await params;

  // hapus ledger terkait dulu (cascade juga ada, tapi eksplisit aman)
  await supabaseServer.from("ledgers").delete().eq("participant_id", id);
  const { error } = await supabaseServer
    .from("trip_participants")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
