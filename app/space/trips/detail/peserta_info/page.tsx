"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TripDetailLayout from "@/components/space/TripDetailLayout";
import { apiClient } from "@/lib/apiClient";
import { formatRupiah } from "@/lib/utils";

function PesertaInfoPageInner() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("id");
  const partId = searchParams.get("pid");

  useEffect(() => {
    if (!tripId || !partId) return;

    const btnBack = document.getElementById("btnBack") as HTMLAnchorElement;
    btnBack.href = `/trips/detail/peserta?id=${tripId}`;

    const infoName = document.getElementById("infoName") as HTMLElement;
    const infoWa = document.getElementById("infoWa") as HTMLElement;
    const editName = document.getElementById("editName") as HTMLInputElement;
    const editWa = document.getElementById("editWa") as HTMLInputElement;
    const editSeat = document.getElementById("editSeat") as HTMLInputElement;
    const editPickup = document.getElementById("editPickup") as HTMLSelectElement;
    const formEdit = document.getElementById("formEditInfo") as HTMLFormElement;
    const btnSendWa = document.getElementById("btnSendWa") as HTMLButtonElement;
    const btnHapus = document.getElementById("btnHapus") as HTMLButtonElement;
    const ledgerContainer = document.getElementById("ledgerContainer") as HTMLDivElement;

    let customerId = "";
    let tripName = "";
    let ticketBarcode = "";
    let custName = "";
    let custWa = "";

    (async () => {
      // 1. Fetch Pickup Points
      const { data: points } = await apiClient.get<any[]>(
        `/api/trips/${tripId}/pickup-points`
      );
      if (points) {
        points.forEach((mp: any) => {
          const opt = document.createElement("option");
          opt.value = mp.name;
          opt.textContent = mp.name;
          editPickup.appendChild(opt);
        });
      }

      async function loadData() {
        const { data: trip } = await apiClient.get<any>(`/api/trips/${tripId}`);
        if (trip) tripName = trip.name;

        let data: any = null;
        try {
          const res = await apiClient.get<any>(`/api/participants/${partId}`);
          data = res.data;
        } catch {
          data = null;
        }

        if (!data) {
          alert("Data peserta tidak ditemukan!");
          window.location.href = btnBack.href;
          return;
        }

        const cust = data.customer_id as any;
        customerId = cust.id;
        ticketBarcode = data.barcode;

        infoName.textContent = custName = cust.fullname;
        infoWa.textContent = custWa = cust.whatsapp_number;
        editName.value = cust.fullname;
        editWa.value = cust.whatsapp_number;
        editSeat.value = data.seat_number;
        editPickup.value = data.pickup_point;

        ledgerContainer.innerHTML = "";
        const ledgers = data.ledgers as any[];
        if (ledgers && ledgers.length > 0) {
          ledgers.forEach((l) => {
            const date = l.created_at ? new Date(l.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
            const badge = l.payment_status === "LUNAS" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
            ledgerContainer.innerHTML += `
              <div class="flex justify-between items-center bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
                <div>
                  <span class="text-[0.6rem] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${badge}">${l.payment_status}</span>
                  <p class="text-[0.65rem] text-neutral-500 font-mono mt-1">${date}</p>
                </div>
                <div class="text-right">
                  <p class="text-[0.65rem] text-neutral-500 uppercase tracking-widest mb-1">Nominal</p>
                  <p class="text-sm text-white font-mono">Rp ${formatRupiah(l.amount_paid)}</p>
                </div>
              </div>
            `;
          });
        } else {
          ledgerContainer.innerHTML = '<div class="p-4 text-center text-neutral-500 text-xs uppercase tracking-wider font-bold">Belum ada tagihan</div>';
        }
      }

      await loadData();

      // 2. Update Data
      formEdit.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btnSaveInfo") as HTMLButtonElement;
        btn.textContent = "Menyimpan...";
        btn.disabled = true;
        try {
          await apiClient.put(`/api/participants/${partId}`, {
            seat_number: editSeat.value.toUpperCase(),
            pickup_point: editPickup.value,
            customer_fullname: editName.value,
            customer_whatsapp: editWa.value,
          });
          alert("Data berhasil diupdate!");
          loadData();
        } catch (err: any) {
          alert(err.message);
        } finally {
          btn.textContent = "Simpan Perubahan";
          btn.disabled = false;
        }
      });

      // 3. Hapus Peserta
      btnHapus.addEventListener("click", async () => {
        if (confirm(`Yakin hapus ${custName} dari trip ini secara permanen?`)) {
          btnHapus.textContent = "...";
          btnHapus.disabled = true;
          await apiClient.del(`/api/participants/${partId}`);
          window.location.href = btnBack.href;
        }
      });

      // 4. Kirim Tiket WA
      btnSendWa.addEventListener("click", () => {
        let cleanNumber = custWa.replace(/\D/g, "");
        if (cleanNumber.startsWith("0")) {
          cleanNumber = "62" + cleanNumber.substring(1);
        } else if (cleanNumber.startsWith("8")) {
          cleanNumber = "62" + cleanNumber;
        }
        const linkCheckin = `${window.location.origin}/ticket?id=${ticketBarcode}`;
        const message = `Halo Kak *${custName}*,\n\nIni adalah tiket keberangkatan untuk trip *${tripName}*.\n\nSimpan dan tunjukkan Barcode pada link di bawah ini ke petugas kami saat penjemputan:\n  ${linkCheckin}\n\nTerima kasih!`;
        const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank");
      });
    })();
  }, [tripId, partId]);

  return (
    <TripDetailLayout>
      <div className="mb-4">
        <a href="#" id="btnBack" className="inline-flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500 hover:text-[#00ffd0] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Kembali ke Manifest
        </a>
      </div>

      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#1f1f1f] pb-6">
          <div>
            <h2 id="infoName" className="text-xl md:text-2xl font-black text-white uppercase tracking-widest mb-1">Memuat Data...</h2>
            <p id="infoWa" className="text-sm text-neutral-400 font-mono">-</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button id="btnHapus" className="flex-1 md:flex-none border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-colors">Hapus</button>
            <button id="btnSendWa" className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-400 text-[#0a0a0a] px-5 py-2.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/></svg>
              Kirim Tiket WA
            </button>
          </div>
        </div>

        <form id="formEditInfo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.6rem] text-neutral-400 uppercase tracking-wider mb-1">Nama Sesuai KTP</label>
              <input type="text" id="editName" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-[0.6rem] text-neutral-400 uppercase tracking-wider mb-1">Nomor WhatsApp</label>
              <input type="tel" id="editWa" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[0.6rem] text-neutral-400 uppercase tracking-wider mb-1">No Kursi (Seat)</label>
              <input type="text" id="editSeat" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ffd0] focus:outline-none uppercase transition-colors" />
            </div>
            <div>
              <label className="block text-[0.6rem] text-neutral-400 uppercase tracking-wider mb-1">Meeting Point</label>
              <select id="editPickup" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors appearance-none">
                <option value="">-- Pilih Titik --</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" id="btnSaveInfo" className="w-full md:w-auto bg-[#00ffd0] hover:bg-[#00ffd0] text-[#0a0a0a] px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 shadow-lg shadow-[#00ffd0]/20">Simpan Perubahan</button>
          </div>
        </form>
      </div>

      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6 border-b border-[#1f1f1f] pb-4">
          <h3 className="text-white text-xs font-bold tracking-[0.1em] uppercase text-[#00ffd0]">Record Pembayaran</h3>
        </div>
        <div id="ledgerContainer" className="space-y-3">
          <div className="p-4 text-center text-[#00ffd0] text-xs animate-pulse uppercase tracking-widest font-bold">Memuat Tagihan...</div>
        </div>
      </div>
    </TripDetailLayout>
  );
}


export default function PesertaInfoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse">Memuat...</div>}>
      <PesertaInfoPageInner />
    </Suspense>
  );
}
