// app/api/trips/[id]/route.ts - Single trip (management)
import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/apiGuard";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id } = await params;
  const { data, error } = await supabaseServer
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.trip_date !== undefined) updates.trip_date = body.trip_date;
  if (body.armada !== undefined) updates.armada = body.armada;

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "Tidak ada field yang diupdate" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("trips")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
