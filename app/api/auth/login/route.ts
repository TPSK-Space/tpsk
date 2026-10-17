// app/api/auth/login/route.ts
// Login endpoint - verifikasi username + passcode (bcrypt hash) di server.

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = body?.username?.trim();
    const passcode = body?.passcode;

    if (!username || !passcode) {
      return NextResponse.json(
        { error: "Username dan passcode wajib diisi" },
        { status: 400 }
      );
    }

    // Verifikasi lewat RPC (bcrypt hash di database)
    const { data, error } = await supabaseServer.rpc("verify_login", {
      p_username: username,
      p_passcode: passcode,
    });

    if (error) {
      console.error("verify_login error:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan server" },
        { status: 500 }
      );
    }

    // RPC mengembalikan array (bisa kosong jika tidak cocok)
    const user = Array.isArray(data) ? data[0] : data;

    if (!user) {
      return NextResponse.json(
        { error: "Kredensial tidak valid!" },
        { status: 401 }
      );
    }

    // Buat session token
    const token = await createSessionToken({
      id: user.id,
      username: user.username,
      nama: user.nama ?? null,
      role_id: user.role_id ?? null,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role_id: user.role_id,
      },
    });

    // Simpan token di httpOnly cookie (lebih aman dari localStorage)
    response.cookies.set("tapak_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
