"use client";

import { useEffect, useRef } from "react";
import BaseLayout from "@/components/space/BaseLayout";
import { apiClient } from "@/lib/apiClient";
import { formatRupiah } from "@/lib/utils";

export default function TripsPage() {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formTripRef = useRef<HTMLFormElement>(null);
  const btnTambahRef = useRef<HTMLButtonElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const tripListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const formContainer = formContainerRef.current;
    const formTrip = formTripRef.current;
    const btnTambah = btnTambahRef.current;
    const loading = loadingRef.current;
    const tripList = tripListRef.current;
    if (!formContainer || !formTrip || !btnTambah || !loading || !tripList) return;

    const fetchTrips = async () => {
      loading.classList.remove("hidden");
      tripList.classList.add("hidden");

      const { data: trips } = await apiClient.get<any[]>("/api/trips");

      tripList.innerHTML = "";

      if (!trips || trips.length === 0) {
        tripList.innerHTML = '<p class="text-center text-neutral-500 text-xs uppercase tracking-widest py-8">Belum ada trip</p>';
      } else {
        trips.forEach((trip: any) => {
          const tlName = trip.tour_leader_id?.nama ?? "-";
          const dokName = trip.dokumentasi_id?.nama ?? "-";
          const dateStr = trip.trip_date ? new Date(trip.trip_date).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-";

          const card = document.createElement("div");
          card.className = "bg-[#121212] rounded-2xl border border-[#262626] p-5 shadow-xl cursor-pointer hover:border-[#00ffd0] hover:-translate-y-1 transition-all group";
          card.innerHTML = `<div class="flex items-start justify-between gap-4"><div class="flex-1 min-w-0 pr-4"><h2 class="text-[#00ffd0] text-2xl md:text-3xl font-black uppercase tracking-widest leading-none mb-1 group-hover:text-[#4dffdf] transition-colors">${trip.name}</h2><p class="text-white text-sm md:text-base font-bold tracking-wider uppercase">${trip.destination}</p></div><div class="flex-shrink-0 text-right pl-2"><span class="text-white text-2xl md:text-3xl font-bold tracking-widest">${trip.kapasitas_terisi || 0}/${trip.kapasitas_max}</span></div></div><div class="text-right mb-6">${!trip.is_lengkap ? '<p class="text-[#00ffd0] font-bold uppercase tracking-widest text-sm animate-pulse">Selesaikan Registrasi Trip</p>' : `<p class="text-[#00ffd0] font-bold uppercase tracking-widest text-xs mb-1">Harga Jual Minimal</p><p class="text-[#00ffd0] font-black text-2xl tracking-widest">Rp ${formatRupiah(trip.harga_jual_min)}</p>`}</div><div class="border-t border-[#3f3f46] pt-3 flex justify-between items-end mt-2"><div><p class="text-[0.65rem] text-white uppercase tracking-widest mb-1 font-bold">${dateStr}</p><p class="text-[0.55rem] text-neutral-400 uppercase tracking-widest">Tour Leader: <span class="text-neutral-200 font-semibold">${tlName}</span></p></div><div class="text-right"><p class="text-[0.55rem] text-neutral-400 uppercase tracking-widest">Dokumentasi: <span class="text-neutral-200 font-semibold">${dokName}</span></p></div></div>`;
          card.addEventListener("click", () => { window.location.href = `/trips/detail/dashboard?id=${trip.id}`; });
          tripList.appendChild(card);
        });
      }

      loading.classList.add("hidden");
      tripList.classList.remove("hidden");
    };

    btnTambah.addEventListener("click", () => {
      formContainer.classList.remove("hidden");
      btnTambah.classList.add("hidden");
    });

    const btnBatal = document.getElementById("btnBatal");
    if (btnBatal) {
      btnBatal.addEventListener("click", () => {
        formContainer.classList.add("hidden");
        btnTambah.classList.remove("hidden");
      });
    }

    formTrip.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btnSimpan = document.getElementById("btnSimpan") as HTMLButtonElement;
      const originalText = btnSimpan.textContent;
      btnSimpan.textContent = "PROSES...";
      btnSimpan.disabled = true;

      const inputName = (document.getElementById("tripName") as HTMLInputElement).value;
      const inputDest = (document.getElementById("tripDestination") as HTMLInputElement).value;
      const inputDate = (document.getElementById("tripDate") as HTMLInputElement).value;
      const inputKap = parseInt((document.getElementById("tripKapasitas") as HTMLInputElement).value);
      const inputTipe = (document.getElementById("tripTipe") as HTMLSelectElement).value;

      const payload = {
        name: inputName,
        destination: inputDest,
        trip_date: inputDate,
        kapasitas_max: inputKap,
        tipe_trip: inputTipe,
        status: "Draft",
        kapasitas_terisi: 0,
        is_lengkap: false,
      };

      await apiClient.post("/api/trips", payload);

      btnSimpan.textContent = originalText;
      btnSimpan.disabled = false;
      

      formTrip.reset();
      formContainer.classList.add("hidden");
      btnTambah.classList.remove("hidden");
      await fetchTrips();
    });

    fetchTrips();
  }, []);

  return (
    <BaseLayout>
      <div className="flex items-center justify-between mb-6 mt-2">
        <div>
          <h1 className="text-2xl font-serif text-white">Trips Data</h1>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">Master Manajemen</p>
        </div>
        <button ref={btnTambahRef} id="btnTambah" className="bg-[#00ffd0] hover:bg-[#00ffd0] text-[#0a0a0a] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#00ffd0]/20 active:scale-95">+ Tambah</button>
      </div>

      <div ref={formContainerRef} id="formContainer" className="hidden bg-[#121212] rounded-2xl border border-[#262626] p-5 mb-6 shadow-xl relative">
        <h3 className="text-white text-xs font-bold tracking-[0.1em] uppercase mb-4">Buat Trip Baru</h3>
        <form ref={formTripRef} id="formTrip" className="space-y-4">
          <div>
            <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Nama Trip</label>
            <input type="text" id="tripName" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors" placeholder="Contoh: Bromo Midnight" />
          </div>
          <div>
            <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Tujuan Trip</label>
            <input type="text" id="tripDestination" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors" placeholder="Contoh: Gunung Bromo, Jawa Timur" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Tanggal Berangkat</label>
              <input type="date" id="tripDate" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Kapasitas Penumpang</label>
              <input type="number" id="tripKapasitas" required min="1" className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors" placeholder="Contoh: 50" />
            </div>
          </div>
          <div>
            <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Tipe Trip</label>
            <select id="tripTipe" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors appearance-none">
              <option value="Open Trip">Open Trip</option>
              <option value="Private Trip">Private Trip</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" id="btnBatal" className="text-neutral-400 text-xs font-semibold hover:text-white transition-colors">BATAL</button>
            <button type="submit" id="btnSimpan" className="bg-[#00ffd0] hover:bg-[#00ffd0] text-[#0a0a0a] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors active:scale-95">SIMPAN</button>
          </div>
        </form>
      </div>

      <div ref={loadingRef} id="loading" className="text-center text-[#00ffd0] text-xs py-8 animate-pulse uppercase tracking-widest font-bold">Sinkronisasi Database...</div>
      <div ref={tripListRef} id="tripList" className="space-y-4 hidden pb-10"></div>
    </BaseLayout>
  );
}


