"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TripDetailLayout from "@/components/space/TripDetailLayout";
import { apiClient } from "@/lib/apiClient";

interface UserItem {
  id: string;
  nama: string | null;
  username: string;
  whatsapp_number: string | null;
  role_id: { name: string } | null;
}

interface CrewItem {
  id: string;
  role: string;
  user_id: {
    id: string;
    nama: string | null;
    username: string;
    whatsapp_number: string | null;
  };
}

interface TripItem {
  id: string;
  name: string;
  destination: string | null;
  trip_date: string | null;
  armada: string | null;
}

interface PickupItem {
  id: string;
  name: string;
  maps_url: string | null;
}

function SettingTripPageInner() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("id");

  const [trip, setTrip] = useState<TripItem | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [crews, setCrews] = useState<CrewItem[]>([]);

  const [tripDate, setTripDate] = useState("");
  const [armada, setArmada] = useState("");
  const [tlUsers, setTlUsers] = useState<string[]>([]);
  const [docUsers, setDocUsers] = useState<string[]>([]);

  // Titik kumpul per-trip
  const [pickups, setPickups] = useState<PickupItem[]>([]);
  const [pickupName, setPickupName] = useState("");
  const [pickupMaps, setPickupMaps] = useState("");
  const [editPickup, setEditPickup] = useState<PickupItem | null>(null);
  const [editPickupName, setEditPickupName] = useState("");
  const [editPickupMaps, setEditPickupMaps] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!tripId) return;
    (async () => {
      try {
        const [tripRes, usersRes, crewsRes, pickupsRes] = await Promise.all([
          apiClient.get<TripItem>(`/api/trips/${tripId}`),
          apiClient.get<UserItem[]>("/api/users"),
          apiClient.get<CrewItem[]>(`/api/trips/${tripId}/crews`),
          apiClient.get<PickupItem[]>(`/api/trips/${tripId}/pickup-points`),
        ]);

        const t = tripRes.data;
        setTrip(t);
        setTripDate(t.trip_date || "");
        setArmada(t.armada || "");

        setUsers(usersRes.data || []);
        setPickups(pickupsRes.data || []);
        const cs = crewsRes.data || [];
        setCrews(cs);
        const tls = cs.filter((c) => c.role === "Tour Leader");
        setTlUsers(tls.length ? tls.map((c) => c.user_id.id) : []);
        const docs = cs.filter((c) => c.role === "Dokumentasi");
        setDocUsers(docs.length ? docs.map((c) => c.user_id.id) : []);
      } catch (e) {
        setMsg({ type: "err", text: (e as Error).message });
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId]);

  const saveTrip = async () => {
    if (!tripId) return;
    setSaving(true);
    setMsg(null);
    try {
      await apiClient.patch(`/api/trips/${tripId}`, {
        trip_date: tripDate || null,
        armada: armada || null,
      });
      setMsg({ type: "ok", text: "Info perjalanan tersimpan." });
    } catch (e) {
      setMsg({ type: "err", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const saveCrew = async () => {
    if (!tripId) return;

    const uniqueTls = Array.from(new Set(tlUsers.filter(Boolean)));
    if (uniqueTls.length < 1) {
      setMsg({ type: "err", text: "Minimal 1 Tour Leader." });
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      const toRemove = crews.filter(
        (c) => c.role === "Tour Leader" || c.role === "Dokumentasi"
      );
      for (const c of toRemove) {
        await apiClient.del(`/api/trips/${tripId}/crews`, { crew_id: c.id });
      }

      for (const uid of uniqueTls) {
        await apiClient.post(`/api/trips/${tripId}/crews`, {
          user_id: uid,
          role: "Tour Leader",
        });
      }
      const uniqueDocs = Array.from(new Set(docUsers.filter(Boolean)));
      for (const uid of uniqueDocs) {
        await apiClient.post(`/api/trips/${tripId}/crews`, {
          user_id: uid,
          role: "Dokumentasi",
        });
      }

      const { data } = await apiClient.get<CrewItem[]>(
        `/api/trips/${tripId}/crews`
      );
      setCrews(data || []);
      setMsg({ type: "ok", text: "Field crew tersimpan." });
    } catch (e) {
      setMsg({ type: "err", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const addPickup = async () => {
    if (!tripId) return;
    if (!pickupName.trim()) {
      setMsg({ type: "err", text: "Nama titik kumpul wajib diisi." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await apiClient.post(`/api/trips/${tripId}/pickup-points`, {
        name: pickupName.trim(),
        maps_url: pickupMaps.trim(),
      });
      setPickupName("");
      setPickupMaps("");
      const { data } = await apiClient.get<PickupItem[]>(
        `/api/trips/${tripId}/pickup-points`
      );
      setPickups(data || []);
      setMsg({ type: "ok", text: "Titik kumpul ditambahkan." });
    } catch (e) {
      setMsg({ type: "err", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const startEditPickup = (p: PickupItem) => {
    setEditPickup(p);
    setEditPickupName(p.name);
    setEditPickupMaps(p.maps_url || "");
  };

  const saveEditPickup = async () => {
    if (!tripId || !editPickup) return;
    if (!editPickupName.trim()) {
      setMsg({ type: "err", text: "Nama titik kumpul wajib diisi." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await apiClient.put("/api/trips/" + tripId + "/pickup-points", {
        id: editPickup.id,
        name: editPickupName.trim(),
        maps_url: editPickupMaps.trim(),
      });
      setEditPickup(null);
      const { data } = await apiClient.get<PickupItem[]>(
        `/api/trips/${tripId}/pickup-points`
      );
      setPickups(data || []);
      setMsg({ type: "ok", text: "Titik kumpul diperbarui." });
    } catch (e) {
      setMsg({ type: "err", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const removePickup = async (p: PickupItem) => {
    if (!tripId) return;
    if (!confirm(`Hapus titik kumpul "${p.name}"?`)) return;
    setSaving(true);
    setMsg(null);
    try {
      await apiClient.del("/api/trips/" + tripId + "/pickup-points", {
        id: p.id,
      });
      const { data } = await apiClient.get<PickupItem[]>(
        `/api/trips/${tripId}/pickup-points`
      );
      setPickups(data || []);
      setMsg({ type: "ok", text: "Titik kumpul dihapus." });
    } catch (e) {
      setMsg({ type: "err", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-[#0a0a0a] border border-[#262626] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ffd0] [color-scheme:dark]";
  const labelCls =
    "text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block";

  if (loading) {
    return (
      <TripDetailLayout>
        <div className="text-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse py-20">
          Memuat...
        </div>
      </TripDetailLayout>
    );
  }

  return (
    <TripDetailLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest">
            Setting Trip
          </h2>
          {trip && (
            <div className="text-[0.6rem] uppercase tracking-wider text-neutral-500">
              {trip.destination}
            </div>
          )}
        </div>

        {msg && (
          <div
            className={`rounded-lg px-4 py-3 text-xs font-bold uppercase tracking-wider ${
              msg.type === "ok"
                ? "bg-[#00ffd0]/10 border border-[#00ffd0]/30 text-[#00ffd0]"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Info perjalanan */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
            Info Perjalanan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tanggal Keberangkatan</label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Armada</label>
              <input
                type="text"
                value={armada}
                onChange={(e) => setArmada(e.target.value)}
                placeholder="Contoh: Bus 1"
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveTrip}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#00ffd0] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#00e0b8] disabled:opacity-50 transition-colors"
            >
              Simpan Info
            </button>
          </div>
        </div>

        {/* Field crew */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
            Field Crew
          </h3>

          <div className="mb-5">
            <label className={labelCls}>Tour Leader (min 1)</label>
            <div className="space-y-2">
              {tlUsers.map((uid, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={uid}
                    onChange={(e) => {
                      const next = [...tlUsers];
                      next[idx] = e.target.value;
                      setTlUsers(next);
                    }}
                    className={inputCls}
                  >
                    <option value="">-- Pilih Tour Leader --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama || u.username}
                      </option>
                    ))}
                  </select>
                  {tlUsers.length > 1 && (
                    <button
                      onClick={() =>
                        setTlUsers(tlUsers.filter((_, i) => i !== idx))
                      }
                      className="text-neutral-500 hover:text-red-400 shrink-0"
                      title="Hapus"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setTlUsers([...tlUsers, ""])}
                className="text-[#00ffd0] text-xs font-bold uppercase tracking-wider hover:underline"
              >
                + Tambah Tour Leader
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className={labelCls}>Dokumentasi (opsional)</label>
            <div className="space-y-2">
              {docUsers.map((uid, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={uid}
                    onChange={(e) => {
                      const next = [...docUsers];
                      next[idx] = e.target.value;
                      setDocUsers(next);
                    }}
                    className={inputCls}
                  >
                    <option value="">-- Pilih Dokumentasi --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama || u.username}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      setDocUsers(docUsers.filter((_, i) => i !== idx))
                    }
                    className="text-neutral-500 hover:text-red-400 shrink-0"
                    title="Hapus"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setDocUsers([...docUsers, ""])}
                className="text-[#00ffd0] text-xs font-bold uppercase tracking-wider hover:underline"
              >
                + Tambah Dokumentasi
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveCrew}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#00ffd0] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#00e0b8] disabled:opacity-50 transition-colors"
            >
              Simpan Crew
            </button>
          </div>
        </div>

        {/* Daftar crew terpasang */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
            Crew Terpasang
          </h3>
          <div className="space-y-2">
            {crews.length === 0 && (
              <div className="text-neutral-500 text-xs uppercase tracking-wider">
                Belum ada crew
              </div>
            )}
            {crews.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      c.role === "Tour Leader"
                        ? "bg-[#00ffd0]/10 text-[#00ffd0]"
                        : "bg-purple-500/10 text-purple-300"
                    }`}
                  >
                    {c.role}
                  </span>
                  <span className="text-white text-sm">
                    {c.user_id.nama || c.user_id.username}
                  </span>
                </div>
                {c.user_id.whatsapp_number && (
                  <span className="text-neutral-500 text-xs font-mono">
                    {c.user_id.whatsapp_number}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Titik kumpul (meeting point) per-trip */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
            Titik Kumpul
          </h3>

          <div className="space-y-2 mb-4">
            <input
              value={pickupName}
              onChange={(e) => setPickupName(e.target.value)}
              placeholder="Nama titik kumpul (contoh: SPBU Waru)"
              className={inputCls}
            />
            <input
              value={pickupMaps}
              onChange={(e) => setPickupMaps(e.target.value)}
              placeholder="Link Google Maps (opsional)"
              className={inputCls}
            />
            <button
              onClick={addPickup}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#00ffd0] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#00e0b8] disabled:opacity-50 transition-colors"
            >
              Tambah Titik Kumpul
            </button>
          </div>

          <div className="space-y-2">
            {pickups.length === 0 && (
              <div className="text-neutral-500 text-xs uppercase tracking-wider">
                Belum ada titik kumpul
              </div>
            )}
            {pickups.map((p) => (
              <div
                key={p.id}
                className="bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2"
              >
                {editPickup?.id === p.id ? (
                  <div className="space-y-2">
                    <input
                      value={editPickupName}
                      onChange={(e) => setEditPickupName(e.target.value)}
                      className={inputCls}
                    />
                    <input
                      value={editPickupMaps}
                      onChange={(e) => setEditPickupMaps(e.target.value)}
                      placeholder="Link Google Maps (opsional)"
                      className={inputCls}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditPickup}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-lg bg-[#00ffd0] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#00e0b8] disabled:opacity-50"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditPickup(null)}
                        className="px-3 py-1.5 rounded-lg text-neutral-400 text-xs font-bold uppercase tracking-wider hover:text-white"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">
                        {p.name}
                      </p>
                      {p.maps_url && (
                        <a
                          href={p.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00ffd0] text-xs hover:underline break-all"
                        >
                          {p.maps_url}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEditPickup(p)}
                        className="text-neutral-400 hover:text-[#00ffd0] transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => removePickup(p)}
                        disabled={saving}
                        className="text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Hapus"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TripDetailLayout>
  );
}

export default function SettingTripPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse">
          Memuat...
        </div>
      }
    >
      <SettingTripPageInner />
    </Suspense>
  );
}
