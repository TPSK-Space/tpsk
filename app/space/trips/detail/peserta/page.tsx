"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TripDetailLayout from "@/components/space/TripDetailLayout";
import { apiClient } from "@/lib/apiClient";
import { formatRupiah, generateUniqueCode } from "@/lib/utils";

function PesertaTripPageInner() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("id");

  useEffect(() => {
    if (!tripId) return;

    // Load html5-qrcode library
    if (!document.getElementById("html5-qrcode-script")) {
      const s = document.createElement("script");
      s.id = "html5-qrcode-script";
      s.src = "https://unpkg.com/html5-qrcode";
      s.async = true;
      document.head.appendChild(s);
    }

    const container = document.getElementById("listPesertaContainer") as HTMLDivElement;
    const countPeserta = document.getElementById("countPeserta") as HTMLElement;
    const maxPeserta = document.getElementById("maxPeserta") as HTMLElement;

    const panelManual = document.getElementById("panelManualReg") as HTMLDivElement;
    const panelScanner = document.getElementById("panelScanner") as HTMLDivElement;
    const btnToggleManual = document.getElementById("btnToggleManual") as HTMLButtonElement;
    const btnCloseManual = document.getElementById("btnCloseManual") as HTMLButtonElement;
    const btnToggleScanner = document.getElementById("btnToggleScanner") as HTMLButtonElement;
    const btnCloseScanner = document.getElementById("btnCloseScanner") as HTMLButtonElement;
    const btnCopyLink = document.getElementById("btnCopyLink") as HTMLButtonElement;
    const form = document.getElementById("formAddPeserta") as HTMLFormElement;
    const inputPickup = document.getElementById("inputPickup") as HTMLSelectElement;
    const btnManualSingle = document.getElementById("btnManualSingle") as HTMLButtonElement;
    const btnManualGroup = document.getElementById("btnManualGroup") as HTMLButtonElement;
    const labelManualLeader = document.getElementById("labelManualLeader") as HTMLElement;
    const groupAreaManual = document.getElementById("groupAreaManual") as HTMLDivElement;
    const membersContainerManual = document.getElementById("membersContainerManual") as HTMLDivElement;
    const btnAddMemberManual = document.getElementById("btnAddMemberManual") as HTMLButtonElement;

    const btnViewList = document.getElementById("btnViewList") as HTMLButtonElement;
    const btnViewGrid = document.getElementById("btnViewGrid") as HTMLButtonElement;
    const wrapperList = document.getElementById("wrapperList") as HTMLDivElement;
    const wrapperGrid = document.getElementById("wrapperGrid") as HTMLDivElement;
    const busGridBody = document.getElementById("busGridBody") as HTMLDivElement;

    let currentAssignSeat = "";
    const modalAssignSeat = document.getElementById("modalAssignSeat") as HTMLDivElement;
    const btnCloseAssign = document.getElementById("btnCloseAssign") as HTMLButtonElement;
    const assignSeatLabel = document.getElementById("assignSeatLabel") as HTMLSpanElement;
    const listTBAContainer = document.getElementById("listTBAContainer") as HTMLDivElement;

    const btnSetCrew = document.getElementById("btnSetCrew") as HTMLButtonElement;

    let manifestData: any[] = [];
    let waStatusMap: Record<
      string,
      { status: string; sent_at: string | null; error: string | null }
    > = {};

    const fetchPickupPoints = async () => {
      const { data } = await apiClient.get<any[]>(
        `/api/trips/${tripId}/pickup-points`
      );
      if (data && data.length > 0) {
        data.forEach((mp: any) => {
          const opt = document.createElement("option");
          opt.value = mp.name;
          opt.textContent = mp.name;
          inputPickup.appendChild(opt);
        });
      }
    };

    // VIEW TOGGLER
    btnViewList.addEventListener("click", () => {
      wrapperList.classList.remove("hidden");
      wrapperGrid.classList.add("hidden");
      btnViewList.className = "px-5 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg bg-[#00ffd0] text-[#0a0a0a] shadow-md transition-all";
      btnViewGrid.className = "px-5 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg text-neutral-500 hover:text-white transition-all";
    });
    btnViewGrid.addEventListener("click", () => {
      wrapperGrid.classList.remove("hidden");
      wrapperList.classList.add("hidden");
      btnViewGrid.className = "px-5 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg bg-[#00ffd0] text-[#0a0a0a] shadow-md transition-all";
      btnViewList.className = "px-5 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg text-neutral-500 hover:text-white transition-all";
    });

    // PANEL TOGGLER LOGIC
    btnToggleManual.addEventListener("click", () => {
      panelScanner.classList.add("hidden");
      stopScanner();
      panelManual.classList.toggle("hidden");
    });

    btnCloseManual.addEventListener("click", () => {
      panelManual.classList.add("hidden");
      form.reset();
      btnManualSingle.click();
    });

    btnToggleScanner.addEventListener("click", () => {
      panelManual.classList.add("hidden");
      if (panelScanner.classList.contains("hidden")) {
        panelScanner.classList.remove("hidden");
        startScanner();
      } else {
        panelScanner.classList.add("hidden");
        stopScanner();
      }
    });

    btnCloseScanner.addEventListener("click", () => {
      panelScanner.classList.add("hidden");
      stopScanner();
    });

    // COPY LINK LOGIC (arahkan ke halaman lengkapi-data)
    btnCopyLink.addEventListener("click", () => {
      const publicLink = `${window.location.origin}/lengkapi-data?trip=${tripId}`;
      const ogText = btnCopyLink.innerHTML;
      const onSuccess = () => {
        btnCopyLink.innerHTML = "COPIED!";
        btnCopyLink.classList.replace("text-[#00ffd0]", "text-white");
        btnCopyLink.classList.replace("border-[#00ffd0]", "border-emerald-500");
        setTimeout(() => {
          btnCopyLink.innerHTML = ogText;
          btnCopyLink.classList.replace("text-white", "text-[#00ffd0]");
          btnCopyLink.classList.replace("border-emerald-500", "border-[#00ffd0]");
        }, 1500);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(publicLink).then(onSuccess);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = publicLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        try { document.execCommand("copy"); onSuccess(); } catch (err) { alert("Gagal copy. Link: " + publicLink); }
        textArea.remove();
      }
    });

    // GROUP/SINGLE LOGIC
    let isGroup = false;
    let memberCount = 0;
    btnManualSingle.addEventListener("click", () => {
      isGroup = false;
      btnManualSingle.className = "flex-1 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg bg-[#00ffd0] text-[#0a0a0a] shadow-md transition-all";
      btnManualGroup.className = "flex-1 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg text-neutral-500 hover:text-white transition-all";
      labelManualLeader.textContent = "Data Pemesan";
      groupAreaManual.classList.add("hidden");
      membersContainerManual.innerHTML = "";
      memberCount = 0;
    });

    btnManualGroup.addEventListener("click", () => {
      isGroup = true;
      btnManualGroup.className = "flex-1 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg bg-[#00ffd0] text-[#0a0a0a] shadow-md transition-all";
      btnManualSingle.className = "flex-1 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg text-neutral-500 hover:text-white transition-all";
      labelManualLeader.textContent = "Data Koordinator (Ketua)";
      groupAreaManual.classList.remove("hidden");
      if (memberCount === 0) addMemberRow();
    });

    function addMemberRow() {
      memberCount++;
      const div = document.createElement("div");
      div.className = "grid grid-cols-1 md:grid-cols-[1fr_1fr_60px_30px] gap-3 bg-[#0a0a0a] p-3 rounded-lg border border-[#262626] manual-member-row";
      div.innerHTML = `
        <div>
          <label class="block text-[0.55rem] text-neutral-400 uppercase tracking-wider mb-1">Nama Anggota</label>
          <input type="text" required class="mem-name w-full bg-transparent border-b border-[#3f3f46] focus:border-[#00ffd0] text-white text-sm py-1 focus:outline-none" placeholder="Nama">
        </div>
        <div>
          <label class="block text-[0.55rem] text-neutral-400 uppercase tracking-wider mb-1">WhatsApp</label>
          <input type="tel" required class="mem-wa w-full bg-transparent border-b border-[#3f3f46] focus:border-[#00ffd0] text-white text-sm py-1 focus:outline-none" placeholder="0812...">
        </div>
        <div>
          <label class="block text-[0.55rem] text-neutral-400 uppercase tracking-wider mb-1">Seat (Opsional)</label>
          <input type="text" class="mem-seat w-full bg-transparent border-b border-[#3f3f46] focus:border-[#00ffd0] text-white text-sm py-1 focus:outline-none uppercase" placeholder="-">
        </div>
        <div class="flex items-center justify-center pt-4 md:pt-3">
          <button type="button" class="btn-remove-mem text-neutral-500 hover:text-red-400 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      `;
      const rem = div.querySelector(".btn-remove-mem");
      if (rem) rem.addEventListener("click", () => {
        div.remove();
        if (membersContainerManual.querySelectorAll(".manual-member-row").length === 0) btnManualSingle.click();
      });
      membersContainerManual.appendChild(div);
    }

    btnAddMemberManual.addEventListener("click", addMemberRow);

    // SCANNER LOGIC
    let html5QrcodeScanner: any = null;
    const scanResultEl = document.getElementById("scanResult") as HTMLDivElement;
    function startScanner() {
      scanResultEl.classList.add("hidden");
      // @ts-ignore
      if (typeof (window as any).Html5QrcodeScanner !== "undefined") {
        // @ts-ignore
        html5QrcodeScanner = new (window as any).Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        html5QrcodeScanner.render(onScanSuccess, () => {});
      } else {
        scanResultEl.textContent = "Library Scanner gagal dimuat. Cek koneksi internet.";
        scanResultEl.classList.remove("hidden");
      }
    }
    function stopScanner() {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
        html5QrcodeScanner = null;
      }
    }
    async function onScanSuccess(decodedText: string) {
      stopScanner();
      scanResultEl.classList.remove("hidden");
      scanResultEl.textContent = "MENCARI DATA...";
      try {
        const { fullname } = await apiClient.post<{ fullname: string }>(
          "/api/participants/check-in",
          { barcode: decodedText, trip_id: tripId }
        );
        scanResultEl.className = "text-center mt-4 text-xs font-bold uppercase tracking-widest text-emerald-400";
        scanResultEl.textContent = `CHECK-IN BERHASIL: ${fullname || "Peserta"}`;
        fetchManifest();
      } catch (err: any) {
        scanResultEl.className = "text-center mt-4 text-xs font-bold uppercase tracking-widest text-red-400";
        scanResultEl.textContent = "TIKET TIDAK VALID";
      }
      setTimeout(() => { scanResultEl.classList.add("hidden"); if (!panelScanner.classList.contains("hidden")) startScanner(); }, 3000);
    }

    fetchPickupPoints();

    // MODAL ASSIGN LOGIC
    function closeAssignModal() {
      modalAssignSeat.classList.add("hidden");
      modalAssignSeat.classList.remove("flex");
    }
    btnCloseAssign.addEventListener("click", closeAssignModal);

    function openAssignModal(seatNumber: string) {
      currentAssignSeat = seatNumber;
      assignSeatLabel.textContent = seatNumber;
      const tbaList = manifestData.filter((p) => p.seat_number === "TBA" || !p.seat_number || p.seat_number.trim() === "");
      listTBAContainer.innerHTML = "";
      if (tbaList.length === 0) {
        listTBAContainer.innerHTML = '<p class="text-neutral-500 text-xs text-center uppercase tracking-widest py-4">Tidak ada peserta tanpa kursi</p>';
      } else {
        tbaList.forEach((p) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "w-full flex justify-between items-center bg-[#0a0a0a] border border-[#262626] hover:border-[#00ffd0] rounded-lg px-4 py-3 transition-colors";
          btn.innerHTML = `
            <span class="text-white text-sm font-bold">${p.customer_id?.fullname || "Unknown"}</span>
            <span class="text-[#00ffd0] text-xs font-black">ASSIGN &rarr;</span>
          `;
          btn.addEventListener("click", () => executeAssign(p.id, seatNumber));
          listTBAContainer.appendChild(btn);
        });
      }
      modalAssignSeat.classList.remove("hidden");
      modalAssignSeat.classList.add("flex");
    }

    async function executeAssign(participantId: string, seatNumber: string) {
      try {
        const { data: check } = await apiClient.get<any[]>(
          `/api/participants?trip_id=${tripId}&seat=${encodeURIComponent(seatNumber)}`
        );
        if (check && check.length > 0) {
          alert("Gagal: Kursi sudah didahului admin lain!");
          closeAssignModal();
          fetchManifest();
          return;
        }
        await apiClient.put(`/api/participants/${participantId}`, { seat_number: seatNumber });
        alert("Berhasil: Kursi sudah di-assign!");
        closeAssignModal();
        fetchManifest();
      } catch (err: any) {
        alert("Gagal sistem: " + err.message);
      }
    }

    btnSetCrew.addEventListener("click", async () => {
      btnSetCrew.textContent = "PROSES...";
      btnSetCrew.disabled = true;
      try {
        const { data: check } = await apiClient.get<any[]>(
          `/api/participants?trip_id=${tripId}&seat=${encodeURIComponent(currentAssignSeat)}`
        );
        if (check && check.length > 0) {
          alert("Gagal: Kursi sudah diisi!");
          return;
        }
        const { id: crewCustId } = await apiClient.post<{ id: string }>(
          "/api/customers",
          { fullname: "CREW", whatsapp_number: "0000000000" }
        );
        await apiClient.post("/api/participants", {
          trip_id: tripId,
          customer_id: crewCustId,
          seat_number: currentAssignSeat,
          pickup_point: "-",
          slug: generateUniqueCode("SLUG"),
          barcode: generateUniqueCode("QR"),
          check_in_keberangkatan: true,
        });
        alert("Berhasil: Kursi di-set sebagai CREW!");
        closeAssignModal();
        fetchManifest();
      } catch (err: any) {
        alert("Gagal set Crew: " + err.message);
      } finally {
        btnSetCrew.textContent = "Set sebagai Kursi CREW";
        btnSetCrew.disabled = false;
      }
    });

    function renderGridBus(data: any[]) {
      if (!busGridBody) return;
      busGridBody.innerHTML = "";

      const layout = [
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
      const backRowSeats = ["56", "57", "58", "59", "60"];

      layout.forEach((row) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "grid grid-cols-6 gap-1.5";
        row.forEach((seat, index) => {
          if (index === 2) rowDiv.appendChild(document.createElement("div"));
          const seatDiv = document.createElement("div");
          if (seat === "DOOR") {
            seatDiv.className = "col-span-1 flex items-center justify-center text-[0.45rem] font-bold text-neutral-500 border-2 border-dashed border-[#262626] rounded bg-[#121212]";
            seatDiv.innerHTML = '<span class="-rotate-90">PINTU</span>';
          } else if (seat === "BLANK") {
            seatDiv.className = "col-span-1";
          } else {
            const participant = data.find((p) => p.seat_number?.trim().toUpperCase() === seat);
            if (participant) {
              const isCheckedIn = participant.check_in_keberangkatan;
              const bgClass = isCheckedIn ? "bg-emerald-500/20 border-emerald-500" : "bg-[#00ffd0]/20 border-[#00ffd0]";
              const textClass = isCheckedIn ? "text-emerald-400" : "text-[#00ffd0]";
              seatDiv.className = `cursor-pointer col-span-1 border ${bgClass} rounded p-1 flex flex-col items-center justify-center h-11 hover:bg-[#00ffd0]/40 transition-colors shadow-sm`;
              seatDiv.innerHTML = `
                <span class="text-[0.65rem] ${textClass} font-black">${seat}</span>
                <span class="text-[0.4rem] text-white truncate w-full text-center mt-0.5">${participant.customer_id?.fullname?.split(" ")[0] || "TBA"}</span>
              `;
              seatDiv.addEventListener("click", () => { window.location.href = `/trips/detail/peserta_info?id=${tripId}&pid=${participant.id}`; });
            } else {
              seatDiv.className = "col-span-1 border border-[#262626] bg-[#161616]/40 hover:border-[#00ffd0] rounded p-1 flex flex-col items-center justify-center h-11 cursor-pointer transition-colors group";
              seatDiv.innerHTML = `
                <span class="text-[0.65rem] text-neutral-500 group-hover:text-[#00ffd0] font-bold">${seat}</span>
                <span class="text-[0.4rem] text-neutral-500 truncate w-full text-center mt-0.5 group-hover:text-[#00ffd0]">Kosong</span>
              `;
              seatDiv.addEventListener("click", () => openAssignModal(seat));
            }
          }
          rowDiv.appendChild(seatDiv);
        });
        busGridBody.appendChild(rowDiv);
      });

      const backRowDiv = document.createElement("div");
      backRowDiv.className = "grid grid-cols-5 gap-1 mt-3 pt-2 border-t border-[#1f1f1f]";
      backRowSeats.forEach((seat) => {
        const seatDiv = document.createElement("div");
        const participant = data.find((p) => p.seat_number?.trim().toUpperCase() === seat);
        if (participant) {
          const isCheckedIn = participant.check_in_keberangkatan;
          const bgClass = isCheckedIn ? "bg-emerald-500/20 border-emerald-500" : "bg-[#00ffd0]/20 border-[#00ffd0]";
          const textClass = isCheckedIn ? "text-emerald-400" : "text-[#00ffd0]";
          seatDiv.className = `cursor-pointer border ${bgClass} rounded p-0.5 flex flex-col items-center justify-center h-10 hover:bg-[#00ffd0]/40 transition-colors shadow-sm`;
          seatDiv.innerHTML = `
            <span class="text-[0.6rem] ${textClass} font-black">${seat}</span>
            <span class="text-[0.4rem] text-white truncate w-full text-center mt-0.5">${participant.customer_id?.fullname?.substring(0, 4) || "TBA"}</span>
          `;
          seatDiv.addEventListener("click", () => { window.location.href = `/trips/detail/peserta_info?id=${tripId}&pid=${participant.id}`; });
        } else {
          seatDiv.className = "border border-[#262626] bg-[#161616]/40 hover:border-[#00ffd0] rounded flex flex-col items-center justify-center h-10 cursor-pointer transition-colors group";
          seatDiv.innerHTML = `
            <span class="text-[0.6rem] text-neutral-500 group-hover:text-[#00ffd0] font-bold">${seat}</span>
            <span class="text-[0.4rem] text-neutral-500 truncate w-full text-center mt-0.5 group-hover:text-[#00ffd0]">Kosong</span>
          `;
          seatDiv.addEventListener("click", () => openAssignModal(seat));
        }
        backRowDiv.appendChild(seatDiv);
      });
      busGridBody.appendChild(backRowDiv);
    }

    async function fetchWaStatuses() {
      if (!tripId) return;
      try {
        const { data } = await apiClient.get<
          Record<
            string,
            { status: string; sent_at: string | null; error: string | null }
          >
        >(`/api/send-wa/status?trip_id=${tripId}`);
        waStatusMap = data || {};
      } catch {
        waStatusMap = {};
      }
    }

    async function fetchManifest() {
      const { data: trip } = await apiClient.get<any>(`/api/trips/${tripId}`);
      if (trip) maxPeserta.textContent = trip.kapasitas_max?.toString() || "0";
      const { data } = await apiClient.get<any[]>(
        `/api/participants?trip_id=${tripId}`
      );
      manifestData = data || [];
      countPeserta.textContent = manifestData.length.toString();
      await fetchWaStatuses();
      renderManifest();
    }

    // Buat tombol kirim WA + indikator status per peserta.
    function buildWaButton(
      pid: string,
      name: string,
      status: string | null,
      state: { sent_at: string | null; error: string | null } | undefined
    ) {
      const safeName = name.replace(/'/g, "\\'");
      const baseClick = `event.stopPropagation(); window.__sendSingleWa('${pid}','${safeName}')`;

      // Belum pernah dikirim
      if (!status) {
        return `<button onclick="${baseClick}" title="Kirim tiket via WhatsApp" class="shrink-0 inline-flex items-center gap-1 h-7 px-2 rounded-md bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span class="text-[0.6rem] font-bold uppercase tracking-wider">Kirim</span>
        </button>`;
      }

      // PENDING (antri / sedang dikirim)
      if (status === "PENDING") {
        return `<span title="Menunggu dikirim" class="shrink-0 inline-flex items-center gap-1 h-7 px-2 rounded-md bg-yellow-500/10 border border-yellow-500/40 text-yellow-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4M5.6 18.4l1.4-1.4m10-10l1.4-1.4"/></svg>
          <span class="text-[0.6rem] font-bold uppercase tracking-wider">Antri</span>
        </span>`;
      }

      // SENT (terkirim)
      if (status === "SENT") {
        const sentInfo = state?.sent_at
          ? new Date(state.sent_at).toLocaleString("id-ID")
          : "";
        return `<span title="Terkirim ${sentInfo}" class="shrink-0 inline-flex items-center gap-1 h-7 px-2 rounded-md bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
          <span class="text-[0.6rem] font-bold uppercase tracking-wider">Terkirim</span>
        </span>`;
      }

      // FAILED (gagal) — tetap bisa kirim ulang
      const errInfo = state?.error ? state.error : "Kirim ulang";
      return `<button onclick="${baseClick}" title="Gagal: ${errInfo.replace(/"/g, "&quot;")}. Klik untuk kirim ulang" class="shrink-0 inline-flex items-center gap-1 h-7 px-2 rounded-md bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        <span class="text-[0.6rem] font-bold uppercase tracking-wider">Gagal</span>
      </button>`;
    }

    function renderManifest() {
      container.innerHTML = "";
      if (manifestData.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-neutral-500 text-xs uppercase tracking-wider font-bold">Belum ada peserta terdaftar</div>';
        renderGridBus(manifestData);
        return;
      }
      manifestData.forEach((p) => {
        const custName = p.customer_id?.fullname || "Unknown";
        const custPhone = p.customer_id?.whatsapp_number || "-";
        const seat = p.seat_number || "-";
        const pickup = p.pickup_point || "-";
        const checkedIn = p.check_in_keberangkatan;

        // Status WA peserta ini (belum dikirim / antri / terkirim / gagal)
        const waState = waStatusMap[p.id];
        const waStatus = waState ? waState.status : null;
        const waBtn = buildWaButton(p.id, custName, waStatus, waState);

        const ledgerInfo = p.ledgers && p.ledgers.length > 0 ? p.ledgers[0] : {};
        const status = ledgerInfo.payment_status || "UNPAID";
        const amount = ledgerInfo.amount_paid || 0;
        const badgeColor = status.toUpperCase() === "LUNAS" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
        const statusHTML = checkedIn
          ? '<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[0.6rem] font-bold uppercase tracking-widest flex items-center justify-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg> HADIR</span>'
          : '<span class="text-neutral-500 text-[0.6rem] uppercase tracking-widest border border-[#262626] px-2 py-1 rounded">PENDING</span>';

        const row = document.createElement("div");
        row.className = "flex flex-col md:grid md:grid-cols-[1fr_80px_140px_140px_80px] gap-3 md:gap-2 p-4 md:p-3 items-start md:items-center hover:bg-[#2a2a2a] transition-colors cursor-pointer";
        row.innerHTML = `
          <div class="pl-0 md:pl-2 w-full flex justify-between items-start md:block border-b border-[#1f1f1f] md:border-0 pb-2 md:pb-0">
            <div>
              <div class="flex items-center gap-2">
                <p class="text-sm text-white font-bold tracking-wider">${custName}</p>
                ${waBtn}
              </div>
              <p class="text-[0.6rem] text-neutral-400 font-mono mt-0.5">${custPhone}</p>
            </div>
            <div class="md:hidden">
              <span class="text-xs text-[#00ffd0] font-black tracking-widest bg-[#0a0a0a] px-2 py-1 rounded border border-[#262626]">${seat.toUpperCase()}</span>
            </div>
          </div>
          <div class="hidden md:block">
            <span class="text-sm text-[#00ffd0] font-black tracking-widest bg-[#0a0a0a] px-2 py-1 rounded border border-[#262626]">${seat.toUpperCase()}</span>
          </div>
          <div class="w-full flex md:block justify-between items-center text-xs">
            <span class="md:hidden text-[0.6rem] text-neutral-500 uppercase tracking-widest">Titik Kumpul:</span>
            <p class="text-neutral-300 capitalize truncate">${pickup}</p>
          </div>
          <div class="w-full flex md:block justify-between items-center mt-1 md:mt-0">
            <span class="md:hidden text-[0.6rem] text-neutral-500 uppercase tracking-widest">Tagihan:</span>
            <div class="text-right md:text-left">
              <span class="text-[0.6rem] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${badgeColor}">${status}</span>
              <p class="text-[0.65rem] md:text-xs text-white font-mono mt-1">Rp ${formatRupiah(amount)}</p>
            </div>
          </div>
          <div class="w-full flex justify-between md:justify-center items-center mt-1 md:mt-0 pt-2 md:pt-0 border-t border-[#1f1f1f] md:border-0">
            <span class="md:hidden text-[0.6rem] text-neutral-500 uppercase tracking-widest">Status:</span>
            ${statusHTML}
          </div>
        `;
        row.addEventListener("click", () => { window.location.href = `/trips/detail/peserta_info?id=${tripId}&pid=${p.id}`; });
        container.appendChild(row);
      });
      renderGridBus(manifestData);
    }

    // ============ KIRIM TIKET WHATSAPP (Fonnte) ============
    const progressWrap = document.getElementById("waProgressWrap") as HTMLDivElement;
    const progressBar = document.getElementById("waProgressBar") as HTMLDivElement;
    const progressText = document.getElementById("waProgressText") as HTMLElement;

    function showProgress(msg: string, pct: number) {
      if (!progressWrap || !progressBar || !progressText) return;
      progressWrap.classList.remove("hidden");
      progressBar.style.width = `${pct}%`;
      progressText.textContent = msg;
    }

    async function pollQueueStatus() {
      try {
        const { data } = await apiClient.get<{
          total: number;
          sent: number;
          failed: number;
          pending: number;
          progress: number;
        }>("/api/send-wa");
        if (data && data.pending > 0) {
          showProgress(
            `Mengirim tiket... ${data.sent + data.failed}/${data.total} terkirim/gagal (${data.pending} antri)`,
            data.progress
          );
        } else if (data && data.total > 0) {
          showProgress(
            `Selesai: ${data.sent} terkirim, ${data.failed} gagal`,
            100
          );
        }

        // Refresh status per peserta agar indikator tombol ikut ter-update.
        await fetchWaStatuses();
        renderManifest();
      } catch {
        // ignore
      }
    }

    async function sendBulkWa() {
      if (!tripId) return;
      const confirmSend = window.confirm(
        "Kirim tiket ke SEMUA peserta (nomor WA yang valid)?\n\nPesan akan dikirim dengan jeda 4-6 detik antar peserta (anti-spam)."
      );
      if (!confirmSend) return;

      try {
        const res = await apiClient.post<{ queued: number }>("/api/send-wa", {
          mode: "bulk",
          trip_id: tripId,
        });
        showProgress(`Menambahkan ${res.queued} tiket ke antrian...`, 5);
        // Tandai semua tombol jadi "Antri" seketika.
        await fetchWaStatuses();
        renderManifest();
        // Mulai proses & polling
        await apiClient.post("/api/send-wa/process");
        pollQueueStatus();
        const interval = setInterval(async () => {
          const { data } = await apiClient.get<{ pending: number }>("/api/send-wa");
          if (data && data.pending === 0) {
            clearInterval(interval);
            pollQueueStatus();
          } else {
            await apiClient.post("/api/send-wa/process").catch(() => {});
            pollQueueStatus();
          }
        }, 5000);
      } catch (error: any) {
        alert(error.message);
      }
    }

    async function sendSingleWa(participantId: string, custName: string) {
      const confirmSend = window.confirm(
        `Kirim tiket ke ${custName} via WhatsApp?`
      );
      if (!confirmSend) return;
      try {
        await apiClient.post("/api/send-wa", {
          mode: "single",
          participant_id: participantId,
        });
        // Tandai tombol jadi "Antri" seketika lalu refresh status.
        await fetchWaStatuses();
        renderManifest();
        await apiClient.post("/api/send-wa/process");
        pollQueueStatus();
        setTimeout(pollQueueStatus, 4000);
      } catch (error: any) {
        alert(error.message);
      }
    }

    // Expose helpers ke window agar bisa dipanggil dari onclick inline
    (window as any).__sendSingleWa = sendSingleWa;
    (window as any).__sendBulkWa = sendBulkWa;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btnSave = document.getElementById("btnSaveManual") as HTMLButtonElement;
      const leaderName = (document.getElementById("inputName") as HTMLInputElement).value;
      const leaderWa = (document.getElementById("inputWa") as HTMLInputElement).value;
      const leaderSeatInput = (document.getElementById("inputSeat") as HTMLInputElement).value.trim().toUpperCase();
      const leaderSeat = leaderSeatInput === "" ? "TBA" : leaderSeatInput;
      const inputPickup = (document.getElementById("inputPickup") as HTMLSelectElement).value;
      const paymentStatus = (document.querySelector('input[name="paymentStatus"]:checked') as HTMLInputElement).value.toLowerCase();
      const inputAmount = parseInt((document.getElementById("inputAmount") as HTMLInputElement).value) || 0;

      let allRegistrants = [{ name: leaderName, wa: leaderWa, seat: leaderSeat, isLeader: true }];
      if (isGroup) {
        membersContainerManual.querySelectorAll(".manual-member-row").forEach((row) => {
          const mName = (row.querySelector(".mem-name") as HTMLInputElement).value;
          const mWa = (row.querySelector(".mem-wa") as HTMLInputElement).value;
          const mSeatInput = (row.querySelector(".mem-seat") as HTMLInputElement).value.trim().toUpperCase();
          const mSeat = mSeatInput === "" ? "TBA" : mSeatInput;
          allRegistrants.push({ name: mName, wa: mWa, seat: mSeat, isLeader: false });
        });
      }

      const waSet = new Set(allRegistrants.map((r) => r.wa));
      if (waSet.size !== allRegistrants.length) { alert("Gagal: Terdapat duplikat Nomor WA di dalam form ini."); return; }

      const assignedSeats = allRegistrants.map((r) => r.seat).filter((s) => s !== "TBA");
      const seatSet = new Set(assignedSeats);
      if (seatSet.size !== assignedSeats.length) { alert("Gagal: Terdapat duplikat Nomor Kursi di dalam form ini."); return; }

      for (const r of allRegistrants) {
        if (r.seat !== "TBA") {
          const { data: check } = await apiClient.get<any[]>(
            `/api/participants?trip_id=${tripId}&seat=${encodeURIComponent(r.seat)}`
          );
          if (check && check.length > 0) { alert(`Gagal: Kursi ${r.seat} sudah diisi!`); return; }
        }
      }

      btnSave.textContent = "MEMPROSES DATA...";
      btnSave.disabled = true;

      try {
        for (const person of allRegistrants) {
          const { id: customerId } = await apiClient.post<{ id: string }>(
            "/api/customers",
            { fullname: person.name, whatsapp_number: person.wa }
          );

          const uniqueSlug = generateUniqueCode("SLUG");
          const uniqueBarcode = generateUniqueCode("QR");

          const ledgerAmount = person.isLeader ? inputAmount : 0;
          await apiClient.post("/api/participants", {
            trip_id: tripId,
            customer_id: customerId,
            seat_number: person.seat,
            pickup_point: inputPickup,
            slug: uniqueSlug,
            barcode: uniqueBarcode,
            check_in_keberangkatan: false,
            ledger: {
              amount_paid: ledgerAmount,
              payment_status: paymentStatus,
            },
          });
        }

        panelManual.classList.add("hidden");
        form.reset();
        btnManualSingle.click();
        fetchManifest();
        alert("Pendaftaran berhasil disimpan!");
      } catch (error: any) {
        alert(error.message);
      } finally {
        btnSave.textContent = "Daftarkan Sekarang";
        btnSave.disabled = false;
      }
    });

    fetchManifest();
  }, [tripId]);

  return (
    <TripDetailLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase text-[#00ffd0] mb-1">Manifest Peserta</h3>
          <p className="text-[0.65rem] text-neutral-500 uppercase tracking-widest">Total Terdaftar: <span id="countPeserta" className="text-white font-bold">0</span> / <span id="maxPeserta" className="text-neutral-400">0</span> Pax</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => (window as any).__sendBulkWa()} className="flex-1 md:flex-none bg-[#00ffd0]/10 border border-[#00ffd0]/40 text-[#00ffd0] hover:bg-[#00ffd0]/20 px-4 py-2.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            Kirim Semua
          </button>
          <button id="btnToggleScanner" className="flex-1 md:flex-none bg-[#0a0a0a] border border-[#262626] hover:border-[#00ffd0] text-neutral-400 hover:text-[#00ffd0] px-4 py-2.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            Scan
          </button>
          <button id="btnCopyLink" className="flex-1 md:flex-none bg-[#0a0a0a] border border-[#00ffd0] text-[#00ffd0] hover:bg-[#00ffd0] hover:text-[#0a0a0a] px-4 py-2.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
            Copy Link Lengkapi Data
          </button>
          <button id="btnToggleManual" className="flex-1 md:flex-none bg-[#00ffd0] hover:bg-[#00ffd0] text-[#0a0a0a] px-5 py-2.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#00ffd0]/20 active:scale-95 flex items-center justify-center gap-1">
            <span className="text-lg leading-none">+</span> Manual
          </button>
        </div>
      </div>

      {/* PROGRESS KIRIM TIKET */}
      <div id="waProgressWrap" className="hidden mb-6 bg-[#121212] border border-[#00ffd0]/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#00ffd0]">Pengiriman Tiket</span>
          <span id="waProgressText" className="text-[0.65rem] text-neutral-400"></span>
        </div>
        <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
          <div id="waProgressBar" className="h-full bg-[#00ffd0] rounded-full transition-all duration-500" style={{ width: "0%" }}></div>
        </div>
      </div>

      {/* PANEL SCANNER */}
      <div id="panelScanner" className="hidden bg-[#0a0a0a] border border-[#00ffd0]/50 rounded-2xl p-4 shadow-xl mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase text-[#00ffd0]">Barcode Check-in</h3>
            <p className="text-[0.65rem] text-neutral-500 uppercase tracking-widest mt-0.5">Arahkan kamera ke tiket peserta</p>
          </div>
          <button id="btnCloseScanner" className="text-neutral-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase">Batal</button>
        </div>
        <div id="qr-reader" className="w-full max-w-sm mx-auto"></div>
        <div id="scanResult" className="text-center mt-4 text-xs font-bold uppercase tracking-widest text-[#00ffd0] hidden"></div>
      </div>

      {/* PANEL MANUAL REG */}
      <div id="panelManualReg" className="hidden bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase text-[#00ffd0]">Daftarkan Peserta</h3>
          <button id="btnCloseManual" className="text-neutral-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase">Batal</button>
        </div>
        <div className="flex bg-[#0a0a0a] p-1 rounded-xl mb-6 border border-[#1f1f1f] w-full md:w-1/2">
          <button id="btnManualSingle" className="flex-1 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg bg-[#00ffd0] text-[#0a0a0a] shadow-md transition-all">Pribadi</button>
          <button id="btnManualGroup" className="flex-1 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg text-neutral-500 hover:text-white transition-all">Rombongan</button>
        </div>

        <form id="formAddPeserta" className="space-y-4">
          <div className="space-y-4">
            <h3 id="labelManualLeader" className="text-[#00ffd0] text-[0.65rem] font-bold uppercase tracking-widest mb-2">Data Pemesan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.6rem] text-neutral-400 uppercase tracking-wider mb-1">Nama Sesuai KTP</label>
                <input type="text" id="inputName" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors" placeholder="Nama Lengkap" />
              </div>
              <div>
                <label className="block text-[0.6rem] text-neutral-400 uppercase tracking-wider mb-1">Nomor WhatsApp</label>
                <input type="tel" id="inputWa" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors" placeholder="0812xxxxxxxx" />
              </div>
              <div>
                <label className="block text-[0.6rem] text-neutral-400 uppercase tracking-wider mb-1">Seat (Opsional)</label>
                <input type="text" id="inputSeat" className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors uppercase" placeholder="Contoh: A1" />
              </div>
              <div>
                <label className="block text-[0.6rem] text-neutral-400 uppercase tracking-wider mb-1">Titik Kumpul</label>
                <select id="inputPickup" className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors appearance-none">
                  <option value="">-- Pilih Titik Kumpul --</option>
                </select>
              </div>
            </div>
          </div>

          <div id="groupAreaManual" className="hidden space-y-4 pt-4 border-t border-[#1f1f1f]">
            <h3 className="text-white text-[0.65rem] font-bold uppercase tracking-widest">Data Anggota Rombongan</h3>
            <div id="membersContainerManual" className="space-y-3"></div>
            <button type="button" id="btnAddMemberManual" className="w-full bg-[#0a0a0a] border border-[#262626] hover:border-[#00ffd0] text-[#00ffd0] py-2.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-colors border-dashed">+ Tambah Anggota</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#1f1f1f]">
            <div>
              <label className="block text-[0.6rem] text-neutral-400 uppercase tracking-wider mb-2">Status Pembayaran</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-neutral-300"><input type="radio" name="paymentStatus" value="LUNAS" className="accent-[#00ffd0]" defaultChecked /> Lunas</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-neutral-300"><input type="radio" name="paymentStatus" value="DP" className="accent-[#00ffd0]" /> DP</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-neutral-300"><input type="radio" name="paymentStatus" value="UNPAID" className="accent-[#00ffd0]" /> Belum Bayar</label>
              </div>
            </div>
            <div>
              <label className="block text-[0.6rem] text-neutral-400 uppercase tracking-wider mb-1">Jumlah Bayar (Rp)</label>
              <input type="number" id="inputAmount" className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors" placeholder="0" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" id="btnSaveManual" className="w-full md:w-auto bg-[#00ffd0] hover:bg-[#00ffd0] text-[#0a0a0a] px-8 py-3 rounded-lg text-[0.7rem] font-bold uppercase tracking-wider transition-colors active:scale-95 shadow-lg shadow-[#00ffd0]/20">Daftarkan Sekarang</button>
          </div>
        </form>
      </div>

      {/* TOGGLER VIEW */}
      <div className="flex gap-2 mb-4">
        <button id="btnViewList" className="px-5 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg bg-[#00ffd0] text-[#0a0a0a] shadow-md transition-all">List</button>
        <button id="btnViewGrid" className="px-5 py-2 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg text-neutral-500 hover:text-white transition-all">Grid Bus</button>
      </div>

      {/* WRAPPER LIST */}
      <div id="wrapperList" className="bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
        <div className="hidden md:grid grid-cols-[1fr_80px_140px_140px_80px] gap-2 p-3 bg-[#0a0a0a] border-b border-[#262626] text-[0.65rem] text-neutral-400 font-bold uppercase tracking-wider">
          <div className="pl-2">Peserta</div>
          <div>Seat</div>
          <div>Pickup Point</div>
          <div>Tagihan</div>
          <div className="text-center">Status</div>
        </div>
        <div id="listPesertaContainer" className="bg-[#121212] divide-y divide-[#1f1f1f]">
          <div className="p-8 text-center text-[#00ffd0] text-xs animate-pulse uppercase tracking-widest font-bold">Memuat Manifest...</div>
        </div>
      </div>

      {/* WRAPPER GRID (Visual Bus JB5) */}
      <div id="wrapperGrid" className="hidden w-full max-w-sm mx-auto mb-6 transition-all">
        <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 shadow-2xl">
          <div className="border-2 border-[#262626] rounded-t-3xl p-3 mb-2 bg-[#0a0a0a] flex justify-between items-end h-16 relative">
            <div className="text-[0.55rem] text-neutral-500 uppercase tracking-widest border border-[#262626] px-2 py-1 rounded bg-[#121212]">Pintu</div>
            <div className="text-[0.55rem] text-neutral-500 uppercase tracking-widest border border-[#262626] px-3 py-1 rounded rounded-br-2xl bg-[#121212]">Sopir</div>
          </div>
          <div id="busGridBody" className="border-x-2 border-[#262626] bg-[#0a0a0a] p-3 space-y-2"></div>
          <div className="border-2 border-[#262626] border-t-0 rounded-b-3xl h-8 bg-[#0a0a0a] mt-2"></div>
        </div>
      </div>

      {/* MODAL ASSIGN KURSI */}
      <div id="modalAssignSeat" className="fixed inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm hidden flex-col items-center justify-center p-4">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-[#1f1f1f] flex justify-between items-center bg-[#0a0a0a] rounded-t-2xl">
            <h3 className="text-white text-xs font-bold tracking-[0.1em] uppercase text-[#00ffd0]">Assign Kursi <span id="assignSeatLabel" className="text-white text-lg ml-1">--</span></h3>
            <button id="btnCloseAssign" className="text-neutral-500 hover:text-red-400 font-bold px-2 transition-colors">X</button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3" id="listTBAContainer"></div>
          <div className="p-4 border-t border-[#1f1f1f] bg-[#0a0a0a] rounded-b-2xl">
            <button id="btnSetCrew" className="w-full bg-[#161616] hover:bg-[#161616] text-[#00ffd0] border border-[#262626] py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">Set sebagai Kursi CREW</button>
          </div>
        </div>
      </div>
    </TripDetailLayout>
  );
}


export default function PesertaTripPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse">Memuat...</div>}>
      <PesertaTripPageInner />
    </Suspense>
  );
}
