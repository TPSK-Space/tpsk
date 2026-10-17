// app/api/participants/check-in/route.ts - Update check-in by barcode (management)
import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/apiGuard";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { barcode, trip_id } = await request.json();
  if (!barcode) return NextResponse.json({ error: "barcode required" }, { status: 400 });

  let q = supabaseServer
    .from("trip_participants")
    .update({ check_in_keberangkatan: true })
    .eq("barcode", barcode);
  if (trip_id) q = q.eq("trip_id", trip_id);

  const { data, error } = await q.select("customer_id(fullname)").single();

  if (error || !data)
    return NextResponse.json({ error: "TIKET TIDAK VALID" }, { status: 404 });

  const cust = (data as any).customer_id;
  return NextResponse.json({
    fullname: cust?.fullname || "Peserta",
  });
}
