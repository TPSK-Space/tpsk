"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/apiClient";

interface ParticipantItem {
  participant_id: string;
  fullname: string;
}

function LengkapiDataInner() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("trip");

  const [tripName, setTripName] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ParticipantItem | null>(null);
  const [fullname, setFullname] = useState("");
  const [address, setAddress] = useState("");
  const [wa, setWa] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tripId) {
      setError("Akses Ditolak: Link tidak valid.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data: trip } = await supabase
          .from("trips")
          .select("name, trip_date")
          .eq("id", tripId)
          .single();
        if (trip) {
          setTripName(trip.name);
          if (trip.trip_date) {
            setTripDate(
              new Date(trip.trip_date).toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric",
              })
            );
          }
        }

        const { data } = await apiClient.get<ParticipantItem[]>(
          `/api/public/participants?trip_id=${tripId}`
        );
        setParticipants(data || []);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => p.fullname.toLowerCase().includes(q));
  }, [query, participants]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function choose(p: ParticipantItem) {
    setSelected(p);
    setFullname(p.fullname);
    setQuery(p.fullname);
    setOpen(false);
    setError(null);
  }

  function normalizeWa(raw: string): string {
    let w = raw.trim().replace(/[^0-9]/g, "");
    if (w.startsWith("0")) w = "62" + w.slice(1);
    return w;
  }

  async function submit() {
    if (!selected) {
      setError("Pilih nama Anda terlebih dahulu.");
      return;
    }
    if (!fullname.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    const w = normalizeWa(wa);
    if (!/^62[0-9]{8,14}$/.test(w)) {
      setError("Nomor WhatsApp tidak valid. Gunakan 08xxxxxxxxxx atau 628xxxxxxxxxx.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apiClient.post("/api/public/participants", {
        participant_id: selected.participant_id,
        fullname: fullname.trim(),
        address: address.trim(),
        whatsapp_number: wa.trim(),
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse">
        Memuat...
      </div>
    );
  }

  if (error && !tripId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center text-red-400 font-bold uppercase tracking-widest text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 pt-8 pb-16 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-6 shadow-xl text-center">
          <h2 className="text-[0.65rem] tracking-[0.4em] text-[#00ffd0] font-bold uppercase mb-2">
            Lengkapi Data Peserta
          </h2>
          <h1 className="text-2xl md:text-3xl font-serif text-white font-bold leading-tight mb-2">
            {tripName || "—"}
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold">
            {tripDate || ""}
          </p>
        </div>

        {done ? (
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-8 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Data Berhasil Disimpan!</h3>
            <p className="text-neutral-400 text-sm">Terima kasih, {fullname}. Data Anda sudah lengkap.</p>
          </div>
        ) : (
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl space-y-5">
            <div ref={boxRef} className="relative">
              <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">
                Cari Nama Anda
              </label>
              <input
                type="text"
                value={query}
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  setSelected(null);
                }}
                placeholder="Ketik nama Anda..."
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors"
              />
              {open && (
                <div className="absolute z-20 mt-1 w-full bg-[#0a0a0a] border border-[#262626] rounded-lg shadow-2xl max-h-56 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-3 text-neutral-500 text-xs">
                      Tidak ada nama yang cocok (atau data Anda sudah lengkap).
                    </div>
                  ) : (
                    filtered.map((p) => (
                      <button
                        key={p.participant_id}
                        type="button"
                        onClick={() => choose(p)}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#00ffd0] hover:text-[#0a0a0a] transition-colors"
                      >
                        {p.fullname}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Nama lengkap sesuai KTP"
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Alamat Domisili <span className="text-neutral-600">(opsional)</span></label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Masukkan alamat lengkap"
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Nomor WhatsApp Aktif</label>
              <input
                type="tel"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                placeholder="081234567890"
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="w-full bg-[#00ffd0] hover:bg-[#00ffd0] text-[#0a0a0a] py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-colors active:scale-95 shadow-xl shadow-[#00ffd0]/20 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LengkapiDataPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse">Memuat...</div>}>
      <LengkapiDataInner />
    </Suspense>
  );
}
