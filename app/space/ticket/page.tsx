"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface TicketData {
  id: string;
  seat_number: string | null;
  pickup_point: string | null;
  barcode: string | null;
  check_in_keberangkatan: boolean | null;
  trip_id: {
    id: string;
    name: string;
    destination: string | null;
    trip_date: string | null;
    armada: string | null;
  };
  customer_id: { fullname: string | null; whatsapp_number: string | null };
}

interface RundownItem {
  activity_time: string | null;
  description: string | null;
  duration_minutes: number | null;
}

interface CrewItem {
  id: string;
  role: string;
  user_id: { nama: string | null; username: string; whatsapp_number: string | null };
}

const SEAT_LAYOUT: string[][] = [
  ["DOOR", "BLANK", "BLANK", "BLANK", "BLANK"],
  ["1", "2", "3", "4", "5"],
  ["6", "7", "8", "9", "10"],
  ["11", "12", "13", "14", "15"],
  ["16", "17", "18", "19", "20"],
  ["21", "22", "23", "24", "25"],
  ["26", "27", "28", "29", "30"],
  ["31", "32", "33", "34", "35"],
  ["36", "37", "38", "39", "40"],
  ["41", "42", "43", "44", "45"],
  ["46", "47", "48", "49", "50"],
  ["51", "52", "53", "54", "55"],
];
const BACK_ROW = ["56", "57", "58", "59", "60"];

function TicketPageInner() {
  const searchParams = useSearchParams();
  const barcodeParam = searchParams.get("id");

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [tab, setTab] = useState<"seat" | "rundown" | "crew">("seat");
  const [rundowns, setRundowns] = useState<RundownItem[]>([]);
  const [crews, setCrews] = useState<CrewItem[]>([]);

  useEffect(() => {
    if (!barcodeParam) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data, error } = await supabase
        .from("trip_participants")
        .select(
          "id, seat_number, pickup_point, barcode, check_in_keberangkatan, trip_id(id, name, destination, trip_date, armada), customer_id(fullname, whatsapp_number)"
        )
        .eq("barcode", barcodeParam)
        .single();

      if (error || !data) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      setTicket(data as unknown as TicketData);
      setCheckedIn(!!data.check_in_keberangkatan);
      setLoading(false);

      if (data.check_in_keberangkatan) {
        const tripId = (data.trip_id as any).id as string;
        const [rRes, cRes] = await Promise.all([
          supabase
            .from("trip_rundowns")
            .select("activity_time, description, duration_minutes")
            .eq("trip_id", tripId)
            .order("activity_time", { ascending: true }),
          supabase
            .from("trip_crews")
            .select("id, role, user_id(nama, username, whatsapp_number)")
            .eq("trip_id", tripId),
        ]);
        if (!rRes.error) setRundowns(rRes.data as unknown as RundownItem[]);
        if (!cRes.error) setCrews(cRes.data as unknown as CrewItem[]);
      } else {
        channel = supabase
          .channel(`ticket-${data.id}`)
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "trip_participants", filter: `id=eq.${data.id}` },
            (payload: any) => {
              if (payload.new.check_in_keberangkatan === true) {
                setCheckedIn(true);
                setTicket((prev) =>
                  prev ? { ...prev, check_in_keberangkatan: true } : prev
                );
              }
            }
          )
          .subscribe();
      }
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [barcodeParam]);

  // load rundown + crew when check-in flips via realtime
  useEffect(() => {
    if (checkedIn && ticket) {
      const tripId = ticket.trip_id.id;
      (async () => {
        const [rRes, cRes] = await Promise.all([
          supabase
            .from("trip_rundowns")
            .select("activity_time, description, duration_minutes")
            .eq("trip_id", tripId)
            .order("activity_time", { ascending: true }),
          supabase
            .from("trip_crews")
            .select("id, role, user_id(nama, username, whatsapp_number)")
            .eq("trip_id", tripId),
        ]);
        if (!rRes.error) setRundowns(rRes.data as unknown as RundownItem[]);
        if (!cRes.error) setCrews(cRes.data as unknown as CrewItem[]);
      })();
    }
  }, [checkedIn, ticket]);

  // QR code effect
  useEffect(() => {
    if (!ticket || checkedIn) return;
    if (document.getElementById("qrcodejs-script")) {
      renderQr();
      return;
    }
    const s = document.createElement("script");
    s.id = "qrcodejs-script";
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.async = true;
    s.onload = renderQr;
    document.head.appendChild(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket, checkedIn]);

  function renderQr() {
    const box = document.getElementById("qrcodeBox");
    if (!box || !ticket?.barcode) return;
    box.innerHTML = "";
    const QRCode = (window as any).QRCode;
    if (QRCode) {
      new QRCode(box, {
        text: ticket.barcode,
        width: 180,
        height: 180,
        colorDark: "#0a0a0a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
  }

  const mySeat = useMemo(
    () => (ticket?.seat_number || "").trim().toUpperCase(),
    [ticket]
  );
  const tlCrew = crews.filter((c) => c.role === "Tour Leader");
  const docCrew = crews.filter((c) => c.role === "Dokumentasi");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 pt-6 pb-16 px-4 sm:px-6">
        <div className="w-full max-w-sm mx-auto px-4">
          <div className="text-center text-[#00ffd0] text-xs animate-pulse uppercase tracking-widest font-bold py-10">
            Memuat Data Tiket...
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !ticket) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 pt-6 pb-16 px-4 sm:px-6">
        <div className="w-full max-w-sm mx-auto px-4">
          <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-6 mt-10">
            <p className="text-red-400 text-sm font-bold uppercase tracking-widest">
              Tiket Tidak Valid
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              Data tidak ditemukan atau link salah. Silakan hubungi admin Tapakswaka.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tripInfo = ticket.trip_id;
  const custInfo = ticket.customer_id;
  const tripDate = tripInfo.trip_date
    ? new Date(tripInfo.trip_date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "--";

  // ===== POST CHECK-IN: boarding view with 3 sub-tabs =====
  if (checkedIn) {
    return (
      <div className="min-h-screen text-neutral-100 pt-8 pb-16 px-4 sm:px-6 ticket-bg">
        <div className="w-full max-w-md mx-auto">
          {/* Brand masthead */}
          <header className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-9 w-9" />
              <div className="leading-none">
                <p className="text-[0.55rem] font-black uppercase tracking-[0.35em] text-white">
                  Tapak&nbsp;Swaka
                </p>
                <p className="text-[0.5rem] uppercase tracking-[0.25em] text-[#00ffd0] font-bold mt-1">
                  On&nbsp;Board
                </p>
              </div>
            </div>
            <span className="badge badge-accent animate-pulse-glow">Boarded</span>
          </header>

          {/* Header card */}
          <div className="relative rounded-[1.4rem] overflow-hidden border border-white/10 shadow-2xl ticket-card mb-4">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ffd0]/70 to-transparent" />
            <div className="relative overflow-hidden bg-gradient-to-br from-[#00ffd0] via-[#00e0b8] to-[#00c8a4] px-6 pt-6 pb-5">
              <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
              <div className="absolute -bottom-14 -left-10 w-44 h-44 rounded-full bg-black/10 blur-2xl" />
              <div className="absolute inset-0 ticket-grain opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.28em] text-[#0a0a0a]/70">
                    Boarding Pass
                  </p>
                  <CheckGlyph className="h-4 w-4 text-[#0a0a0a]/80" />
                </div>
                <h2 className="font-serif text-[1.55rem] leading-none font-black text-[#0a0a0a] tracking-tight truncate mt-4">
                  {tripInfo.name}
                </h2>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mt-2.5">
                  {tripInfo.destination || "-"} &middot; {tripDate}
                  {tripInfo.armada ? ` · ${tripInfo.armada}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Segmented tabs */}
          <div className="flex gap-1 mb-4 bg-[#121214] border border-white/10 rounded-xl p-1">
            {(
              [
                ["seat", "Kursi"],
                ["rundown", "Rundown"],
                ["crew", "Crew"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-all ${
                  tab === key
                    ? "bg-[#00ffd0] text-[#0a0a0a] shadow-[0_0_18px_rgba(0,255,208,0.3)]"
                    : "text-neutral-500 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "seat" && <SeatMap seat={mySeat} />}
          {tab === "rundown" && <RundownList rundowns={rundowns} />}
          {tab === "crew" && <CrewInfo tlCrew={tlCrew} docCrew={docCrew} />}
        </div>
      </div>
    );
  }

  // ===== PRE CHECK-IN: normal ticket (premium boarding pass) =====
  return (
    <div className="min-h-screen text-neutral-100 pt-8 pb-16 px-4 sm:px-6 ticket-bg">
      <div className="w-full max-w-sm mx-auto">
        {/* Brand masthead */}
        <header className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-9 w-9" />
            <div className="leading-none">
              <p className="text-[0.55rem] font-black uppercase tracking-[0.35em] text-white">
                Tapak&nbsp;Swaka
              </p>
              <p className="text-[0.5rem] uppercase tracking-[0.25em] text-[#00ffd0] font-bold mt-1">
                E&middot;Ticket
              </p>
            </div>
          </div>
          <span className="badge badge-accent animate-pulse-glow">Aktif</span>
        </header>

        {/* Boarding pass */}
        <div className="relative rounded-[1.4rem] overflow-hidden border border-white/10 shadow-2xl ticket-card">
          {/* subtle top glow edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ffd0]/70 to-transparent" />

          {/* ===== HEADER BAND ===== */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#00ffd0] via-[#00e0b8] to-[#00c8a4] px-6 pt-7 pb-6">
            <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-14 -left-10 w-44 h-44 rounded-full bg-black/10 blur-2xl" />
            <div className="absolute inset-0 ticket-grain opacity-20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-[0.6rem] font-black uppercase tracking-[0.28em] text-[#0a0a0a]/70">
                  Boarding Pass
                </p>
                <p className="text-[0.6rem] font-black uppercase tracking-[0.28em] text-[#0a0a0a]/70">
                  {tripInfo.armada || "Tour"}
                </p>
              </div>

              <div className="mt-6 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/60 mb-1">
                    Destinasi
                  </p>
                  <h2 className="font-serif text-[1.7rem] leading-none font-black text-[#0a0a0a] tracking-tight truncate">
                    {tripInfo.name}
                  </h2>
                </div>
                <PlaneGlyph className="h-10 w-10 shrink-0 text-[#0a0a0a]/80" />
              </div>

              <div className="mt-4 flex items-center gap-2 text-[#0a0a0a]/70">
                <CalendarGlyph className="h-3.5 w-3.5" />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em]">
                  {tripDate}
                </p>
              </div>
            </div>
          </div>

          {/* ===== PERFORATED TEAR LINE ===== */}
          <div className="relative h-7 bg-[#101012]">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#2c2c31]" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#0a0a0a] border border-white/10" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-7 h-7 rounded-full bg-[#0a0a0a] border border-white/10" />
          </div>

          {/* ===== PASSENGER + DETAILS ===== */}
          <div className="bg-[#101012] px-6 pt-6 pb-7">
            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
              <div className="min-w-0">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-1.5">
                  Nama Penumpang
                </p>
                <h3 className="text-[1.35rem] font-black text-white uppercase tracking-wide leading-tight truncate">
                  {custInfo.fullname || "--"}
                </h3>
                <p className="text-[0.7rem] font-mono text-neutral-400 mt-1 tracking-wider">
                  {custInfo.whatsapp_number || "--"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-1.5">
                  No. Kursi
                </p>
                <p className="font-serif text-4xl font-black text-[#00ffd0] leading-none drop-shadow-[0_0_18px_rgba(0,255,208,0.35)]">
                  {mySeat || "TBA"}
                </p>
              </div>
            </div>

            {/* detail strip */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <DetailCell label="Titik Kumpul" value={ticket.pickup_point || "-"} />
              <DetailCell label="Armada" value={tripInfo.armada || "-"} />
              <DetailCell label="Kode" value={ticket.barcode || "-"} mono accent />
            </div>
          </div>

          {/* ===== DETACHABLE STUB: QR + BARCODE ===== */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-6 bg-[#0a0a0a] border-y border-white/5">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#2c2c31]" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#0a0a0a] border border-white/10" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-7 h-7 rounded-full bg-[#0a0a0a] border border-white/10" />
            </div>

            <div className="bg-[#101012] px-6 pt-9 pb-7">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0 bg-white p-3 rounded-2xl shadow-[0_0_0_1px_rgba(0,255,208,0.15),0_0_30px_rgba(0,255,208,0.12)]">
                  <div id="qrcodeBox" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">
                    Tunjukkan ke Crew
                  </p>
                  <p className="text-[0.95rem] font-mono font-bold tracking-[0.18em] text-[#00ffd0] break-all leading-snug">
                    {ticket.barcode}
                  </p>
                  <p className="text-[0.55rem] text-neutral-500 mt-2 leading-relaxed">
                    Scan kode QR saat boarding untuk validasi check-in.
                  </p>
                </div>
              </div>

              {/* fake barcode strip */}
              <div className="mt-6 select-none" aria-hidden="true">
                <div className="h-10 flex items-stretch gap-[2px] opacity-80">
                  {BARCODE_BARS.map((w, i) => (
                    <span
                      key={i}
                      className="inline-block bg-neutral-300"
                      style={{ width: w }}
                    />
                  ))}
                </div>
                <p className="text-center font-mono text-[0.55rem] tracking-[0.5em] text-neutral-500 mt-1.5">
                  {ticket.barcode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* footer note */}
        <footer className="text-center mt-5 px-2">
          <p className="text-[0.6rem] text-neutral-500 leading-relaxed">
            Simpan tiket ini dan tunjukkan kepada crew saat keberangkatan.
            <br />
            <span className="text-neutral-600">
              Powered by Tapak&nbsp;Swaka Holidays
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}

function SeatMap({ seat }: { seat: string }) {
  return (
    <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 shadow-2xl">
      <div className="border-2 border-[#262626] rounded-t-3xl p-3 mb-2 bg-[#0a0a0a] flex justify-between items-end h-16">
        <div className="text-[0.55rem] text-neutral-500 uppercase tracking-widest border border-[#262626] px-2 py-1 rounded bg-[#121212]">
          Pintu
        </div>
        <div className="text-[0.55rem] text-neutral-500 uppercase tracking-widest border border-[#262626] px-3 py-1 rounded rounded-br-2xl bg-[#121212]">
          Sopir
        </div>
      </div>

      <div className="border-x-2 border-[#262626] bg-[#0a0a0a] p-3 space-y-2">
        {SEAT_LAYOUT.map((row, ri) => (
          <div key={ri} className="grid grid-cols-6 gap-1.5">
            {row.map((s, ci) => {
              if (ci === 2) {
                return <div key={`sp-${ci}`} />;
              }
              if (s === "DOOR") {
                return (
                  <div
                    key={s}
                    className="col-span-1 flex items-center justify-center text-[0.45rem] font-bold text-neutral-500 border-2 border-dashed border-[#262626] rounded bg-[#121212]"
                  >
                    <span className="-rotate-90">PINTU</span>
                  </div>
                );
              }
              if (s === "BLANK") {
                return <div key={`b-${ci}`} className="col-span-1" />;
              }
              const isMine = s === seat;
              return (
                <div
                  key={s}
                  className={`col-span-1 border rounded p-1 flex flex-col items-center justify-center h-11 ${
                    isMine
                      ? "bg-emerald-500/30 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : "border-[#262626] bg-[#161616]/40"
                  }`}
                >
                  <span
                    className={`text-[0.65rem] font-black ${
                      isMine ? "text-emerald-300" : "text-neutral-500"
                    }`}
                  >
                    {s}
                  </span>
                  <span
                    className={`text-[0.4rem] w-full text-center mt-0.5 truncate ${
                      isMine ? "text-emerald-300" : "text-neutral-600"
                    }`}
                  >
                    {isMine ? "Kursi Saya" : "Kosong"}
                  </span>
                </div>
              );
            })}
          </div>
        ))}

        <div className="grid grid-cols-5 gap-1 mt-3 pt-2 border-t border-[#1f1f1f]">
          {BACK_ROW.map((s) => {
            const isMine = s === seat;
            return (
              <div
                key={s}
                className={`col-span-1 border rounded p-0.5 flex flex-col items-center justify-center h-10 ${
                  isMine
                    ? "bg-emerald-500/30 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : "border-[#262626] bg-[#161616]/40"
                }`}
              >
                <span
                  className={`text-[0.6rem] font-black ${
                    isMine ? "text-emerald-300" : "text-neutral-500"
                  }`}
                >
                  {s}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-2 border-[#262626] border-t-0 rounded-b-3xl h-8 bg-[#0a0a0a] mt-2"></div>

      <p className="text-center text-[0.6rem] text-neutral-500 uppercase tracking-wider mt-3">
        Kursi Anda:{" "}
        <span className="text-emerald-300 font-black text-sm">{seat}</span>
      </p>
    </div>
  );
}

function RundownList({ rundowns }: { rundowns: RundownItem[] }) {
  if (rundowns.length === 0) {
    return (
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-8 text-center">
        <p className="text-neutral-500 text-xs uppercase tracking-wider">
          Rundown belum tersedia
        </p>
      </div>
    );
  }
  return (
    <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
      <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
        Rundown Perjalanan
      </h3>
      <div className="space-y-3">
        {rundowns.map((r, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-[#00ffd0] mt-1.5" />
              {i < rundowns.length - 1 && (
                <div className="w-px flex-1 bg-[#262626]" />
              )}
            </div>
            <div className="flex-1 pb-1">
              <p className="text-[#00ffd0] text-xs font-black font-mono tracking-wider">
                {r.activity_time || "--:--"}
                {r.duration_minutes ? (
                  <span className="text-neutral-500 font-normal ml-2">
                    {r.duration_minutes} mnt
                  </span>
                ) : null}
              </p>
              <p className="text-white text-sm mt-0.5">{r.description || "-"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrewInfo({
  tlCrew,
  docCrew,
}: {
  tlCrew: CrewItem[];
  docCrew: CrewItem[];
}) {
  const waLink = (num?: string | null) => {
    if (!num) return null;
    const digits = num.replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  };

  const renderCard = (crew: CrewItem) => {
    const link = waLink(crew.user_id.whatsapp_number);
    return (
      <div
        key={crew.id}
        className="flex items-center justify-between bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2.5"
      >
        <div>
          <p className="text-white text-sm font-bold">
            {crew.user_id.nama || crew.user_id.username}
          </p>
          {crew.user_id.whatsapp_number && (
            <p className="text-neutral-500 text-xs font-mono">
              {crew.user_id.whatsapp_number}
            </p>
          )}
        </div>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-[0.6rem] font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat
          </a>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
        <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-3">
          Tour Leader
        </h3>
        <div className="space-y-2">
          {tlCrew.length === 0 ? (
            <p className="text-neutral-500 text-xs uppercase tracking-wider">
              Belum tersedia
            </p>
          ) : (
            tlCrew.map(renderCard)
          )}
        </div>
      </div>

      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
        <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-3">
          Dokumentasi
        </h3>
        <div className="space-y-2">
          {docCrew.length === 0 ? (
            <p className="text-neutral-500 text-xs uppercase tracking-wider">
              Belum tersedia
            </p>
          ) : (
            docCrew.map(renderCard)
          )}
        </div>
      </div>
    </div>
  );
}

// ===== decorative barcode bars (deterministic pattern) =====
const BARCODE_BARS: number[] = [
  2, 1, 3, 1, 1, 2, 4, 1, 1, 3, 2, 1, 1, 2, 1, 3, 2, 1, 4, 1, 1, 2, 3, 1, 2, 1,
  1, 3, 1, 2, 2, 1, 1, 4, 1, 2, 3, 1, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 4, 1, 1, 3,
];

// ===== brand monogram (Tapak Swaka) =====
function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ts-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00ffd0" />
          <stop offset="1" stopColor="#00c8a4" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#ts-grad)" />
      <path
        d="M11 12h18M20 12v16"
        stroke="#0a0a0a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="11" cy="28" r="3" fill="#0a0a0a" />
    </svg>
  );
}

function PlaneGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M21 15.5 3 6l1.5 6L21 15.5ZM21 15.5 15 13M3 6l4 9 1.5-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 12.5 9.5 18 20 6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DetailCell({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-[#0a0a0a]/60 border border-white/5 px-3 py-2.5">
      <p className="text-[0.5rem] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-1 truncate">
        {label}
      </p>
      <p
        className={`text-xs font-bold capitalize truncate ${
          accent ? "text-[#00ffd0]" : "text-white"
        } ${mono ? "font-mono tracking-wider" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function TicketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse">
          Memuat...
        </div>
      }
    >
      <TicketPageInner />
    </Suspense>
  );
}
