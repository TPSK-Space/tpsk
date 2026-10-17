"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TripDetailLayout from "@/components/space/TripDetailLayout";
import { apiClient } from "@/lib/apiClient";
import { formatRupiah } from "@/lib/utils";

function TripDashboardPageInner() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("id");

  const goToMenu = (menuName: string) => {
    if (tripId) {
      window.location.href = `/trips/detail/${menuName}?id=${tripId}`;
    }
  };

  useEffect(() => {
    if (!tripId) return;

    (async () => {
      const { data: trip } = await apiClient.get<any>(`/api/trips/${tripId}`);

      if (!trip) return;

      const set = (id: string, text: string, cls?: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (cls) el.className = cls;
        el.textContent = text;
      };

      // 1. Info Dasar
      set("dashDest", trip.destination || "Belum diatur",
        "text-sm text-white font-bold");
      set("dashArmada", `Armada: ${trip.armada || "-"}`, "text-xs text-neutral-400 mt-1 uppercase tracking-widest");
      set("dashDate", new Date(trip.trip_date).toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric",
      }), "text-sm text-white font-bold");
      set("dashKap", `${trip.kapasitas_max || 0} Seat`, "text-sm text-[#00ffd0] font-bold");

      // 2. Pricing Dasar
      const harga = trip.harga_jual_min || 0;
      const hpp = trip.base_price || 0;
      const margin = harga - hpp;
      set("dashHarga", `Rp ${formatRupiah(harga)}`, "text-sm text-white font-bold tracking-wider");
      set("dashHpp", `Rp ${formatRupiah(hpp)}`, "text-sm text-red-400 font-bold tracking-wider");
      set("dashMargin", `Rp ${formatRupiah(margin)}`, "text-xl text-[#00ffd0] font-black tracking-wider");

      // 3. Peserta Summary & Progress
      const terisi = trip.kapasitas_terisi || 0;
      const max = trip.kapasitas_max || 1;
      const persen = Math.min((terisi / max) * 100, 100);
      set("dashPesertaTotal", terisi.toString(), "text-4xl text-[#00ffd0] font-black");
      set("dashSisaKursi", `${max - terisi} Sisa`, "text-sm text-neutral-400 font-bold");
      const bar = document.getElementById("dashProgressBar");
      if (bar) bar.style.width = `${persen}%`;

      // 4. Financial Overview
      const uangAktual = 0;
      const uangTerpakai = 0;
      const totalUangPlan = harga * max;
      const totalHppPlan = hpp * max;
      const totalLabaPlan = totalUangPlan - totalHppPlan;
      const variance = uangAktual - totalHppPlan;
      set("dashUangAktual", `Rp ${formatRupiah(uangAktual)}`,
        "text-2xl md:text-3xl text-white font-black tracking-widest");
      set("dashTotalPlan", `/ Plan: Rp ${formatRupiah(totalUangPlan)}`);
      set("dashUangTerpakai", `Rp ${formatRupiah(uangTerpakai)}`,
        "text-lg text-white font-bold tracking-wider");
      set("dashLabaPlan", `Rp ${formatRupiah(totalLabaPlan)}`,
        "text-lg text-[#00ffd0] font-bold tracking-wider");
      set("dashVariance",
        `${variance < 0 ? "-" : "+"} Rp ${formatRupiah(Math.abs(variance))}`,
        `text-lg font-bold tracking-wider ${variance < 0 ? "text-red-400" : "text-purple-400"}`);

      // 5. Crew
      const { data: crews } = await apiClient.get<any[]>(
        `/api/trips/${tripId}/crews`
      );

      const elListTL = document.getElementById("dashListTL");
      const elListDok = document.getElementById("dashListDok");
      const countTL = document.getElementById("countTL");
      const countDok = document.getElementById("countDok");
      if (elListTL) elListTL.innerHTML = "";
      if (elListDok) elListDok.innerHTML = "";

      let totalTL = 0;
      let totalDok = 0;
      if (crews && crews.length > 0) {
        crews.forEach((c: any) => {
          const userName = c.user_id?.nama || c.user_id?.username || "Unknown";
          const badge = `<span class="bg-[#0a0a0a] border border-[#262626] text-[#00ffd0] text-[0.6rem] px-3 py-1.5 rounded font-semibold uppercase tracking-wider">${userName}</span>`;
          if (c.role === "Tour Leader") { if (elListTL) elListTL.innerHTML += badge; totalTL++; }
          else if (c.role === "Dokumentasi") { if (elListDok) elListDok.innerHTML += badge; totalDok++; }
        });
      }
      if (totalTL === 0 && elListTL) elListTL.innerHTML = '<span class="text-[0.65rem] text-neutral-500 uppercase tracking-widest italic">- Kosong -</span>';
      if (totalDok === 0 && elListDok) elListDok.innerHTML = '<span class="text-[0.65rem] text-neutral-500 uppercase tracking-widest italic">- Kosong -</span>';
      if (countTL) countTL.textContent = totalTL.toString();
      if (countDok) countDok.textContent = totalDok.toString();
    })();
  }, [tripId]);

  return (
    <TripDetailLayout>
      <div className="space-y-4">
        {/* FINANCIAL OVERVIEW */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl md:col-span-2">
          <div className="flex justify-between items-start mb-5 border-b border-[#1f1f1f] pb-5">
            <div>
              <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase">Financial Overview</h3>
              <div className="flex items-end gap-3 mt-3">
                <p id="dashUangAktual" className="text-2xl md:text-3xl text-white font-black tracking-widest animate-pulse bg-[#161616] h-8 w-40 rounded"></p>
                <p id="dashTotalPlan" className="text-[0.65rem] text-neutral-500 uppercase tracking-widest mb-1"></p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] rounded-xl border border-[#1f1f1f] p-4">
              <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mb-2">Uang Terpakai</p>
              <p id="dashUangTerpakai" className="text-lg text-white font-bold tracking-wider animate-pulse bg-[#161616] h-5 w-32 rounded"></p>
            </div>
            <div className="bg-[#0a0a0a] rounded-xl border border-[#1f1f1f] p-4">
              <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mb-2">Laba Plan</p>
              <p id="dashLabaPlan" className="text-lg text-[#00ffd0] font-bold tracking-wider animate-pulse bg-[#161616] h-5 w-32 rounded"></p>
            </div>
            <div className="bg-[#0a0a0a] rounded-xl border border-[#1f1f1f] p-4">
              <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mb-2">Cashflow Variance</p>
              <p id="dashVariance" className="text-lg font-bold tracking-wider animate-pulse bg-[#161616] h-5 w-32 rounded"></p>
            </div>
          </div>
        </div>

        {/* INFO DASAR + PRICING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl group">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase group-hover:text-[#00ffd0] transition-colors">Informasi Trip</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mb-1">Tujuan</p>
                  <p id="dashDest" className="text-sm text-white font-bold animate-pulse bg-[#161616] h-4 w-full rounded"></p>
                </div>
                <div>
                  <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mb-1">Armada</p>
                  <p id="dashArmada" className="text-xs text-neutral-400 mt-1 uppercase tracking-widest animate-pulse bg-[#161616] h-4 w-full rounded"></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mb-1">Tanggal Berangkat</p>
                  <p id="dashDate" className="text-sm text-white font-bold animate-pulse bg-[#161616] h-4 w-full rounded"></p>
                </div>
                <div>
                  <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mb-1">Kapasitas</p>
                  <p id="dashKap" className="text-sm text-[#00ffd0] font-bold animate-pulse bg-[#161616] h-4 w-full rounded"></p>
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => goToMenu("price_cal")}
            className="bg-[#121212] border border-[#262626] hover:border-[#00ffd0] cursor-pointer transition-all active:scale-[0.98] rounded-2xl p-6 shadow-xl group"
          >
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase group-hover:text-[#00ffd0] transition-colors">Pricing & Margin Dasar</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mb-1">Harga Jual /Pax</p>
                  <p id="dashHarga" className="text-sm text-white font-bold animate-pulse bg-[#161616] h-4 w-full rounded"></p>
                </div>
                <div>
                  <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mb-1">HPP Modal /Pax</p>
                  <p id="dashHpp" className="text-sm text-red-400 font-bold animate-pulse bg-[#161616] h-4 w-full rounded"></p>
                </div>
              </div>
              <div className="pt-4 border-t border-[#1f1f1f]">
                <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mb-1">Proyeksi Margin /Pax</p>
                <p id="dashMargin" className="text-xl text-[#00ffd0] font-black animate-pulse bg-[#161616] h-6 w-1/2 rounded"></p>
              </div>
            </div>
          </div>
        </div>
        {/* PESERTA SUMMARY + CREW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => goToMenu("peserta")}
            className="bg-[#121212] border border-[#262626] hover:border-[#00ffd0] cursor-pointer transition-all active:scale-[0.98] rounded-2xl p-6 shadow-xl group"
          >
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase group-hover:text-[#00ffd0] transition-colors">Progress Peserta</h3>
            </div>
            <div className="flex items-end gap-3 mb-4">
              <p id="dashPesertaTotal" className="text-4xl text-[#00ffd0] font-black animate-pulse bg-[#161616] h-8 w-16 rounded"></p>
              <p id="dashSisaKursi" className="text-sm text-neutral-400 font-bold mb-1"></p>
            </div>
            <div className="w-full bg-[#161616] h-2 rounded-full overflow-hidden">
              <div id="dashProgressBar" className="bg-[#00ffd0] h-full rounded-full transition-all duration-500" style={{ width: "0%" }}></div>
            </div>
          </div>

          <div
            onClick={() => goToMenu("crew")}
            className="bg-[#121212] border border-[#262626] hover:border-[#00ffd0] cursor-pointer transition-all active:scale-[0.98] rounded-2xl p-6 shadow-xl group"
          >
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase group-hover:text-[#00ffd0] transition-colors">Crew Trip</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest">Tour Leader</p>
                  <span id="countTL" className="text-[0.6rem] text-[#00ffd0] font-bold">0</span>
                </div>
                <div id="dashListTL" className="flex flex-wrap gap-2">
                  <span className="bg-[#161616] h-4 w-24 animate-pulse rounded"></span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest">Dokumentasi</p>
                  <span id="countDok" className="text-[0.6rem] text-[#00ffd0] font-bold">0</span>
                </div>
                <div id="dashListDok" className="flex flex-wrap gap-2">
                  <span className="bg-[#161616] h-4 w-24 animate-pulse rounded"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RUNDOWN + LEDGER NAV */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => goToMenu("rundown")}
            className="bg-[#121212] border border-[#262626] hover:border-[#00ffd0] cursor-pointer transition-all active:scale-[0.98] rounded-2xl p-6 shadow-xl group"
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase group-hover:text-[#00ffd0] transition-colors">Itinerary Rundown</h3>
              <span className="text-neutral-500 group-hover:text-[#00ffd0] transition-colors">&rarr;</span>
            </div>
          </div>
          <div
            onClick={() => goToMenu("ledger")}
            className="bg-[#121212] border border-[#262626] hover:border-[#00ffd0] cursor-pointer transition-all active:scale-[0.98] rounded-2xl p-6 shadow-xl group"
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase group-hover:text-[#00ffd0] transition-colors">Buku Ledger (Mutasi)</h3>
              <span className="text-neutral-500 group-hover:text-[#00ffd0] transition-colors">&rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </TripDetailLayout>
  );
}


export default function TripDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse">Memuat...</div>}>
      <TripDashboardPageInner />
    </Suspense>
  );
}
