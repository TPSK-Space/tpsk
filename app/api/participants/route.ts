// app/api/participants/route.ts - Buat participant (+ optional ledger) (management)
import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/apiGuard";
import { supabaseServer } from "@/lib/supabaseServer";

// List participants per trip (management manifest)
export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const tripId = request.nextUrl.searchParams.get("trip_id");
  const seat = request.nextUrl.searchParams.get("seat");
  if (!tripId)
    return NextResponse.json({ error: "trip_id required" }, { status: 400 });

  let q = supabaseServer
    .from("trip_participants")
    .select(
      "id, customer_id(fullname, whatsapp_number), seat_number, pickup_point, barcode, check_in_keberangkatan, created_at, ledgers(payment_status, amount_paid)"
    )
    .eq("trip_id", tripId);
  if (seat) q = q.eq("seat_number", seat);

  const { data, error } = await q.order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const body = await request.json();
  const {
    trip_id,
    customer_id,
    seat_number,
    pickup_point,
    slug,
    barcode,
    check_in_keberangkatan = false,
    ledger = null, // { amount_paid, payment_status }
  } = body;

  const { data: participant, error } = await supabaseServer
    .from("trip_participants")
    .insert([
      {
        trip_id,
        customer_id,
        seat_number,
        pickup_point,
        slug,
        barcode,
        check_in_keberangkatan,
      },
    ])
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (ledger) {
    await supabaseServer.from("ledgers").insert([
      {
        participant_id: participant.id,
        amount_paid: ledger.amount_paid ?? 0,
        payment_status: ledger.payment_status ?? "UNPAID",
      },
    ]);
  }

  return NextResponse.json({ id: participant.id });
}
