// app/api/trips/route.ts - List & create trip (management, service role)
import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/apiGuard";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { data, error } = await supabaseServer
    .from("trips")
    .select("*, tour_leader_id(nama), dokumentasi_id(nama)")
    .order("trip_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const payload = await request.json();
  const { data, error } = await supabaseServer.from("trips").insert([payload]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
