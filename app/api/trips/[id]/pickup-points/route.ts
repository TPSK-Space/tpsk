// app/api/trips/[id]/pickup-points/route.ts - Titik kumpul per-trip (management)
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
    .from("trip_pickup_points")
    .select("*")
    .eq("trip_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id } = await params;
  const { name, maps_url } = await request.json();
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return NextResponse.json(
      { error: "Nama titik kumpul wajib diisi." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("trip_pickup_points")
    .insert({ trip_id: id, name: trimmed, maps_url: maps_url?.trim() || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id, name, maps_url } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
  }
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return NextResponse.json(
      { error: "Nama titik kumpul wajib diisi." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("trip_pickup_points")
    .update({ name: trimmed, maps_url: maps_url?.trim() || null })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("trip_pickup_points")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
