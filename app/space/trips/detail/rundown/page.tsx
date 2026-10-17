"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TripDetailLayout from "@/components/space/TripDetailLayout";
import { apiClient } from "@/lib/apiClient";

interface RundownItem {
  id: string;
  durationMinutes: number;
  title: string;
  startObj?: Date;
  endObj?: Date;
}

function RundownTripPageInner() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("id");

  useEffect(() => {
    if (!tripId) return;

    const container = document.getElementById("rundownContainer") as HTMLDivElement | null;
    const btnAppend = document.getElementById("btnAppendRundown") as HTMLButtonElement | null;
    const btnSave = document.getElementById("btnSaveRundown") as HTMLButtonElement | null;
    if (!container || !btnAppend || !btnSave) return;

    let tripDate = "2026-08-25";
    let baseStartTimeStr = "06:00";
    let rundownState: RundownItem[] = [];

    function generateId(): string {
      return Math.random().toString(36).substr(2, 9);
    }

    function generateDurationOptions(selectedMinutes: number): string {
      const options = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 480, 720];
      let html = "";
      let found = false;
      for (const min of options) {
        const label = min >= 60 ? (min % 60 === 0 ? `${min / 60} Jam` : `${Math.floor(min / 60)}j ${min % 60}m`) : `${min} Menit`;
        const isSelected = min === selectedMinutes ? "selected" : "";
        if (isSelected) found = true;
        html += `<option value="${min}" ${isSelected}>${label}</option>`;
      }
      if (!found) {
        const label = selectedMinutes >= 60 ? `${Math.floor(selectedMinutes / 60)}j ${selectedMinutes % 60}m` : `${selectedMinutes} Menit`;
        html += `<option value="${selectedMinutes}" selected>${label} (Custom)</option>`;
      }
      return html;
    }

    function formatTimeStr(date: Date): string {
      return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":");
    }

    function recalculateTimes() {
      const currentDateTime = new Date(`${tripDate}T${baseStartTimeStr}:00`);
      rundownState.forEach((item) => {
        item.startObj = new Date(currentDateTime.getTime());
        currentDateTime.setMinutes(currentDateTime.getMinutes() + item.durationMinutes);
        item.endObj = new Date(currentDateTime.getTime());
      });
    }

    function renderRundown() {
      if (!container) return;
      recalculateTimes();
      container.innerHTML = "";
      if (rundownState.length === 0) {
        container.innerHTML = '<div class="p-5 text-center text-neutral-500 text-xs uppercase tracking-wider font-bold">Belum ada baris itinerary</div>';
        return;
      }

      const baseDateInt = rundownState[0].startObj!.getDate();

      rundownState.forEach((item, index) => {
        const isDifferentDay = item.endObj!.getDate() !== baseDateInt;
        const badgeHari = isDifferentDay ? '<span class="text-[0.55rem] text-[#00ffd0] block mt-0.5">+1H</span>' : "";
        const row = document.createElement("div");
        row.className = "excel-grid p-2 md:p-3 hover:bg-[#2a2a2a] transition-colors group";

        let colMulai = "";
        if (index === 0) {
          colMulai = `<input type="time" value="${baseStartTimeStr}" class="input-start-time tiny-input w-full bg-[#0a0a0a] border border-[#262626] text-[#00ffd0] rounded focus:outline-none focus:border-[#00ffd0] [color-scheme:dark]">`;
        } else {
          colMulai = `<div class="tiny-input w-full bg-[#0a0a0a] md:bg-transparent text-neutral-400 font-mono border border-[#262626] md:border-transparent rounded flex items-center">${formatTimeStr(item.startObj!)}</div>`;
        }

        row.innerHTML = `
          <div>${colMulai}</div>
          <div>
            <div class="flex flex-col">
              <input type="time" value="${formatTimeStr(item.endObj!)}" class="input-end-time tiny-input w-full bg-[#0a0a0a] border border-[#262626] text-white rounded focus:outline-none focus:border-[#00ffd0] [color-scheme:dark]">
              ${badgeHari}
            </div>
          </div>
          <div>
            <select class="input-duration tiny-input w-full bg-[#0a0a0a] border border-[#262626] text-white rounded focus:outline-none focus:border-[#00ffd0] appearance-none">
              ${generateDurationOptions(item.durationMinutes)}
            </select>
          </div>
          <div class="h-full flex relative">
            <textarea rows="1" class="input-title w-full h-auto min-h-[28px] md:min-h-[34px] bg-transparent text-white text-[0.65rem] md:text-sm p-1 md:p-1.5 resize-none overflow-hidden outline-none border-b border-transparent focus:border-[#00ffd0] transition-colors whitespace-pre-wrap break-words" placeholder="Tulis aktivitas...">${item.title}</textarea>
          </div>
          <div class="flex items-start justify-center pt-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" class="btn-remove text-neutral-500 hover:text-red-400" title="Hapus">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        `;

        const inputStart = row.querySelector(".input-start-time") as HTMLInputElement | null;
        const inputEnd = row.querySelector(".input-end-time") as HTMLInputElement | null;
        const inputDuration = row.querySelector(".input-duration") as HTMLSelectElement | null;
        const inputTitle = row.querySelector(".input-title") as HTMLTextAreaElement | null;
        const btnRemove = row.querySelector(".btn-remove") as HTMLButtonElement | null;

        const adjustHeight = (el: HTMLTextAreaElement) => {
          el.style.height = "auto";
          el.style.height = el.scrollHeight + "px";
        };

        if (inputTitle) {
          setTimeout(() => adjustHeight(inputTitle), 0);
          inputTitle.addEventListener("input", (e) => {
            const target = e.target as HTMLTextAreaElement;
            rundownState[index].title = target.value;
            adjustHeight(target);
          });
        }
        if (inputStart) {
          inputStart.addEventListener("change", (e) => {
            baseStartTimeStr = (e.target as HTMLInputElement).value;
            renderRundown();
          });
        }
        if (inputDuration) {
          inputDuration.addEventListener("change", (e) => {
            rundownState[index].durationMinutes = parseInt((e.target as HTMLSelectElement).value) || 0;
            renderRundown();
          });
        }
        if (inputEnd) {
          inputEnd.addEventListener("change", (e) => {
            const valStr = (e.target as HTMLInputElement).value;
            const endParts = valStr.split(":");
            const newEndObj = new Date(item.startObj!.getTime());
            newEndObj.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0);
            if (newEndObj < item.startObj!) newEndObj.setDate(newEndObj.getDate() + 1);
            let diffMins = Math.round((newEndObj.getTime() - item.startObj!.getTime()) / 60000);
            if (diffMins < 0) diffMins = 0;
            rundownState[index].durationMinutes = diffMins;
            renderRundown();
          });
        }
        if (btnRemove) {
          btnRemove.addEventListener("click", () => {
            rundownState.splice(index, 1);
            renderRundown();
          });
        }
        container.appendChild(row);
      });
    }

    const fetchRundownData = async () => {
      const { data: trip } = await apiClient.get<any>(`/api/trips/${tripId}`);
      if (trip && trip.trip_date) tripDate = trip.trip_date;

      const { data } = await apiClient.get<any[]>(
        `/api/rundowns?trip_id=${tripId}`
      );

      if (data && data.length > 0) {
        const firstActivity = new Date(data[0].activity_time);
        baseStartTimeStr = formatTimeStr(firstActivity);
        rundownState = data.map((item: any) => ({
          id: generateId(),
          durationMinutes: item.duration_minutes || 60,
          title: item.description || "",
        }));
      } else {
        rundownState = [{ id: generateId(), durationMinutes: 60, title: "" }];
      }
      renderRundown();
    };

    btnAppend.addEventListener("click", () => {
      rundownState.push({ id: generateId(), durationMinutes: 60, title: "" });
      renderRundown();
    });

    fetchRundownData();

    btnSave.addEventListener("click", async () => {
      btnSave.textContent = "Proses...";
      btnSave.disabled = true;

      const payload = rundownState.map((item) => ({
        trip_id: tripId,
        activity_time: item.startObj!.toISOString(),
        description: item.title,
        duration_minutes: item.durationMinutes,
      }));

      try {
        await apiClient.post("/api/rundowns", { trip_id: tripId, items: payload });
        alert("Itinerary berhasil disimpan!");
      } catch (err: any) {
        alert("Gagal menyimpan itinerary: " + err.message);
      }
      btnSave.textContent = "Simpan";
      btnSave.disabled = false;
    });
  }, [tripId]);

  return (
    <TripDetailLayout>
      <style jsx global>{`
        .excel-grid { display: grid; grid-template-columns: 60px 60px 70px 1fr 24px; gap: 0.25rem; align-items: flex-start; }
        @media (min-width: 768px) { .excel-grid { grid-template-columns: 80px 100px 120px 1fr 30px; gap: 0.5rem; } }
        .tiny-input { padding: 4px 2px !important; font-size: 0.65rem !important; }
        @media (min-width: 768px) { .tiny-input { padding: 6px !important; font-size: 0.875rem !important; } }
        .tiny-input::-webkit-calendar-picker-indicator { margin: 0; padding: 0; width: 12px; height: 12px; cursor: pointer; }
      `}</style>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase text-[#00ffd0] mb-1">Itinerary (Excel Mode)</h3>
          <p className="text-[0.65rem] text-neutral-500 uppercase tracking-widest">Warp text otomatis. Tanpa scroll horizontal.</p>
        </div>
        <button id="btnSaveRundown" className="bg-[#00ffd0] hover:bg-[#00ffd0] text-[#0a0a0a] px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 shadow-lg shadow-[#00ffd0]/20">Simpan</button>
      </div>

      <div className="w-full border border-[#262626] rounded-lg overflow-hidden bg-[#121212]">
        <div className="excel-grid p-2 md:p-3 bg-[#0a0a0a] border-b border-[#262626] text-[0.55rem] md:text-[0.65rem] text-neutral-400 font-bold uppercase tracking-wider items-center">
          <div>Mulai</div>
          <div>Akhir</div>
          <div>Durasi</div>
          <div>Keterangan</div>
          <div className="text-center"></div>
        </div>
        <div id="rundownContainer" className="divide-y divide-[#1f1f1f]"></div>
      </div>

      <div className="mt-4">
        <button id="btnAppendRundown" className="text-[#00ffd0] hover:text-[#4dffdf] text-[0.65rem] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
          <span className="text-lg leading-none">+</span> Tambah Baris Baru
        </button>
      </div>
    </TripDetailLayout>
  );
}


export default function RundownTripPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse">Memuat...</div>}>
      <RundownTripPageInner />
    </Suspense>
  );
}
