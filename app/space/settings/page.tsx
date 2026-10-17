"use client";

import { useEffect, useState } from "react";
import BaseLayout from "@/components/space/BaseLayout";
import { apiClient } from "@/lib/apiClient";

interface PickupPoint {
  id: string;
  name: string;
  maps_url: string | null;
}

export default function SettingsPage() {
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [name, setName] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");

  const [editing, setEditing] = useState<PickupPoint | null>(null);
  const [editName, setEditName] = useState("");
  const [editMapsUrl, setEditMapsUrl] = useState("");

  const load = async () => {
    try {
      const { data } = await apiClient.get<PickupPoint[]>("/api/pickup-points");
      setPoints(data || []);
    } catch (e) {
      setMsg({ type: "err", text: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addPoint = async () => {
    if (!name.trim()) {
      setMsg({ type: "err", text: "Nama titik kumpul wajib diisi." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await apiClient.post("/api/pickup-points", {
        name: name.trim(),
        maps_url: mapsUrl.trim(),
      });
      setName("");
      setMapsUrl("");
      await load();
      setMsg({ type: "ok", text: "Titik kumpul ditambahkan." });
    } catch (e) {
      setMsg({ type: "err", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: PickupPoint) => {
    setEditing(p);
    setEditName(p.name);
    setEditMapsUrl(p.maps_url || "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editName.trim()) {
      setMsg({ type: "err", text: "Nama titik kumpul wajib diisi." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await apiClient.put("/api/pickup-points", {
        id: editing.id,
        name: editName.trim(),
        maps_url: editMapsUrl.trim(),
      });
      setEditing(null);
      await load();
      setMsg({ type: "ok", text: "Titik kumpul diperbarui." });
    } catch (e) {
      setMsg({ type: "err", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const removePoint = async (p: PickupPoint) => {
    if (!confirm(`Hapus titik kumpul "${p.name}"?`)) return;
    setSaving(true);
    setMsg(null);
    try {
      await apiClient.del("/api/pickup-points", { id: p.id });
      await load();
      setMsg({ type: "ok", text: "Titik kumpul dihapus." });
    } catch (e) {
      setMsg({ type: "err", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const labelCls =
    "block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5";
  const inputCls =
    "w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#00ffd0] transition-colors";
  return (
    <BaseLayout>
      <div className="flex items-center justify-between mb-8 mt-2">
        <h1 className="text-2xl font-serif text-white">Settings</h1>
        <a
          href="/"
          className="text-sm text-[#00ffd0] hover:text-[#4dffdf] transition-colors font-medium"
        >
          &larr; Back
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
            <h2 className="text-white text-sm font-bold uppercase tracking-widest mb-4">
              Daftar Titik Kumpul ({points.length})
            </h2>

            {msg && (
              <div
                className={`mb-4 px-3 py-2 rounded-lg text-xs font-bold ${
                  msg.type === "ok"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {msg.text}
              </div>
            )}

            {loading ? (
              <p className="text-neutral-500 text-sm">Memuat...</p>
            ) : points.length === 0 ? (
              <p className="text-neutral-500 text-sm">
                Belum ada titik kumpul. Tambahkan di sebelah kiri.
              </p>
            ) : (
              <div className="space-y-2">
                {points.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2.5"
                  >
                    {editing?.id === p.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={inputCls}
                        />
                        <input
                          value={editMapsUrl}
                          onChange={(e) => setEditMapsUrl(e.target.value)}
                          placeholder="https://maps.app.goo.gl/..."
                          className={inputCls}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="bg-[#00ffd0] text-black text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-[#4dffdf] disabled:opacity-50"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="text-neutral-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:text-white"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                            onClick={() => startEdit(p)}
                            className="text-neutral-400 hover:text-[#00ffd0] transition-colors"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => removePoint(p)}
                            disabled={saving}
                            className="text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Hapus"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}



