// app/api/rundowns/route.ts - Itinerary rundown per trip (management)
import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/apiGuard";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const tripId = request.nextUrl.searchParams.get("trip_id");
  if (!tripId)
    return NextResponse.json({ error: "trip_id required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("trip_rundowns")
    .select("*")
    .eq("trip_id", tripId)
    .order("activity_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { trip_id, items } = await request.json();

  // Ganti seluruh rundown trip: hapus lama lalu insert baru
  const { error: delError } = await supabaseServer
    .from("trip_rundowns")
    .delete()
    .eq("trip_id", trip_id);
  if (delError)
    return NextResponse.json({ error: delError.message }, { status: 500 });

  if (items && items.length > 0) {
    const { error: insError } = await supabaseServer
      .from("trip_rundowns")
      .insert(items);
    if (insError)
      return NextResponse.json({ error: insError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
