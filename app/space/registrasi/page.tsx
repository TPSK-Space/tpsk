"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { generateUniqueCode } from "@/lib/utils";

function RegistrasiPageInner() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("trip");

  useEffect(() => {
    if (!tripId) {
      document.body.innerHTML = '<div class="text-center p-10 text-red-500 font-bold uppercase">Akses Ditolak: Link Pendaftaran Tidak Valid.</div>';
      return;
    }

    const btnTypeSingle = document.getElementById("btnTypeSingle") as HTMLButtonElement;
    const btnTypeGroup = document.getElementById("btnTypeGroup") as HTMLButtonElement;
    const labelLeader = document.getElementById("labelLeader") as HTMLElement;
    const groupArea = document.getElementById("groupArea") as HTMLDivElement;
    const membersContainer = document.getElementById("membersContainer") as HTMLDivElement;
    const btnAddMember = document.getElementById("btnAddMember") as HTMLButtonElement;
    const regPickup = document.getElementById("regPickup") as HTMLSelectElement;
    const linkMaps = document.getElementById("linkMaps") as HTMLAnchorElement;
    const formPublicReg = document.getElementById("formPublicReg") as HTMLFormElement;

    let isGroup = false;
    let memberCount = 0;

    (async () => {
      const { data: trip } = await supabase.from("trips").select("name, trip_date").eq("id", tripId).single();
      if (trip) {
        (document.getElementById("publicTripName") as HTMLElement).textContent = trip.name;
        (document.getElementById("publicTripDate") as HTMLElement).textContent = new Date(trip.trip_date).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
      }

      const fetchPickupPoints = async () => {
        const { data: points, error } = await supabase
          .from("trip_pickup_points")
          .select("*")
          .eq("trip_id", tripId)
          .order("created_at", { ascending: true });
        regPickup.innerHTML = '<option value="">-- Pilih Titik Kumpul --</option>';
        if (error || !points || points.length === 0) {
          regPickup.innerHTML = '<option value="">-- Titik Kumpul Belum Diatur Admin --</option>';
          return;
        }
        points.forEach((mp: any) => {
          const opt = document.createElement("option");
          opt.value = mp.name;
          opt.setAttribute("data-maps", mp.maps_url || "");
          opt.textContent = mp.name;
          regPickup.appendChild(opt);
        });
      };
      await fetchPickupPoints();

      regPickup.addEventListener("change", () => {
        const selectedOpt = regPickup.options[regPickup.selectedIndex];
        const mapsUrl = selectedOpt.getAttribute("data-maps");
        if (mapsUrl && mapsUrl.trim() !== "") {
          linkMaps.href = mapsUrl;
          linkMaps.style.display = "inline-flex";
        } else {
          linkMaps.style.display = "none";
        }
      });

      btnTypeSingle.addEventListener("click", () => {
        isGroup = false;
        btnTypeSingle.className = "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#00ffd0] text-[#0a0a0a] shadow-md transition-all";
        btnTypeGroup.className = "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-neutral-500 hover:text-white transition-all";
        labelLeader.textContent = "Data Pemesan";
        groupArea.classList.add("hidden");
        membersContainer.innerHTML = "";
        memberCount = 0;
      });

      btnTypeGroup.addEventListener("click", () => {
        isGroup = true;
        btnTypeGroup.className = "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#00ffd0] text-[#0a0a0a] shadow-md transition-all";
        btnTypeSingle.className = "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-neutral-500 hover:text-white transition-all";
        labelLeader.textContent = "Data Koordinator (Ketua Rombongan)";
        groupArea.classList.remove("hidden");
        if (memberCount === 0) addMemberRow();
      });

      function addMemberRow() {
        memberCount++;
        const div = document.createElement("div");
        div.className = "member-row grid grid-cols-1 md:grid-cols-[1fr_1fr_40px] gap-3 bg-[#0a0a0a] p-3 rounded-lg border border-[#262626]";
        div.innerHTML = `
          <div>
            <label class="block text-[0.55rem] text-neutral-400 uppercase tracking-wider mb-1">Nama Anggota</label>
            <input type="text" required class="mem-name w-full bg-transparent border-b border-[#3f3f46] focus:border-[#00ffd0] text-white text-sm py-1.5 focus:outline-none" placeholder="Nama">
          </div>
          <div>
            <label class="block text-[0.55rem] text-neutral-400 uppercase tracking-wider mb-1">WhatsApp</label>
            <input type="tel" required class="mem-wa w-full bg-transparent border-b border-[#3f3f46] focus:border-[#00ffd0] text-white text-sm py-1.5 focus:outline-none" placeholder="0812...">
          </div>
          <div class="flex items-center justify-center pt-4">
            <button type="button" class="btn-remove-mem text-neutral-500 hover:text-red-400 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        `;
        const rem = div.querySelector(".btn-remove-mem");
        if (rem) rem.addEventListener("click", () => {
          div.remove();
          if (membersContainer.querySelectorAll(".member-row").length === 0) btnTypeSingle.click();
        });
        membersContainer.appendChild(div);
      }
      btnAddMember.addEventListener("click", addMemberRow);

      formPublicReg.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btnSubmit = document.getElementById("btnSubmitReg") as HTMLButtonElement;

        const leaderName = (document.getElementById("regName") as HTMLInputElement).value;
        const leaderWa = (document.getElementById("regWa") as HTMLInputElement).value;
        const leaderAddress = (document.getElementById("regAddress") as HTMLTextAreaElement).value;
        const pickupPoint = regPickup.value;

        let allRegistrants = [{ name: leaderName, wa: leaderWa, isLeader: true }];
        if (isGroup) {
          const memRows = document.querySelectorAll(".member-row");
          memRows.forEach((row) => {
            const mName = (row.querySelector(".mem-name") as HTMLInputElement).value;
            const mWa = (row.querySelector(".mem-wa") as HTMLInputElement).value;
            allRegistrants.push({ name: mName, wa: mWa, isLeader: false });
          });
        }

        const waSet = new Set(allRegistrants.map((r) => r.wa));
        if (waSet.size !== allRegistrants.length) {
          alert("Gagal: Terdapat nomor WhatsApp duplikat di dalam form. Gunakan nomor unik untuk tiap peserta.");
          return;
        }

        btnSubmit.textContent = "MEMPROSES DATA...";
        btnSubmit.disabled = true;

        try {
          for (const person of allRegistrants) {
            let customerId;
            const { data: existingCust } = await supabase.from("customers").select("id").eq("whatsapp_number", person.wa).single();

            if (existingCust) {
              customerId = existingCust.id;
              if (person.isLeader) {
                await supabase.from("customers").update({ address: leaderAddress }).eq("id", customerId);
              }
            } else {
              const custPayload = { fullname: person.name, whatsapp_number: person.wa, address: leaderAddress };
              const { data: newCust, error: errCust } = await supabase.from("customers").insert([custPayload]).select("id").single();
              if (errCust) throw errCust;
              customerId = newCust.id;
            }

            const uniqueSlug = generateUniqueCode("TRIP");
            const uniqueBarcode = generateUniqueCode("QR");

            const { data: newPart, error: errPart } = await supabase.from("trip_participants").insert([{
              trip_id: tripId,
              customer_id: customerId,
              pickup_point: pickupPoint,
              seat_number: "TBA",
              slug: uniqueSlug,
              barcode: uniqueBarcode,
            }]).select("id").single();

            if (errPart) throw errPart;

            await supabase.from("ledgers").insert([{
              participant_id: newPart.id,
              amount_paid: 0,
              payment_status: "UNPAID",
            }]);
          }

          formPublicReg.innerHTML = `
            <div class="text-center py-10 space-y-4">
              <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 class="text-xl font-bold text-white uppercase tracking-widest">Pendaftaran Berhasil!</h3>
              <p class="text-neutral-400 text-sm">Terima kasih. Admin kami akan segera menghubungi nomor WhatsApp Anda untuk konfirmasi pembayaran dan pemilihan kursi.</p>
            </div>
          `;
        } catch (error: any) {
          alert("Terjadi kesalahan jaringan: " + error.message);
          btnSubmit.textContent = "DAFTAR SEKARANG";
          btnSubmit.disabled = false;
        }
      });
    })();
  }, [tripId]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 pt-8 pb-16 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* HEADER TRIP */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-6 shadow-xl text-center">
          <h2 className="text-[0.65rem] tracking-[0.4em] text-[#00ffd0] font-bold uppercase mb-2">Formulir Pendaftaran</h2>
          <h1 id="publicTripName" className="text-2xl md:text-3xl font-serif text-white font-bold leading-tight mb-2">Memuat Data...</h1>
          <p id="publicTripDate" className="text-xs text-neutral-400 uppercase tracking-widest font-semibold">-</p>
        </div>

        {/* FORM PENDAFTARAN */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl">
          <div className="flex bg-[#0a0a0a] p-1 rounded-xl mb-6 border border-[#1f1f1f]">
            <button id="btnTypeSingle" className="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#00ffd0] text-[#0a0a0a] shadow-md transition-all">Pribadi</button>
            <button id="btnTypeGroup" className="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-neutral-500 hover:text-white transition-all">Rombongan</button>
          </div>

          <form id="formPublicReg" className="space-y-6">
            <div className="space-y-4">
              <div className="border-b border-[#1f1f1f] pb-2 mb-2">
                <h3 id="labelLeader" className="text-[#00ffd0] text-xs font-bold uppercase tracking-widest">Data Pemesan</h3>
              </div>

              <div>
                <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Nama Lengkap Sesuai KTP</label>
                <input type="text" id="regName" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors" placeholder="Masukkan nama lengkap" />
              </div>

              <div>
                <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Nomor WhatsApp Aktif</label>
                <input type="tel" id="regWa" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors" placeholder="081234567890" />
              </div>

              <div>
                <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1">Alamat Domisili</label>
                <textarea id="regAddress" required rows={2} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors resize-none" placeholder="Masukkan alamat lengkap" />
              </div>

              <div>
                <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-1 flex justify-between">
                  <span>Pilih Meeting Point</span>
                  <a href="#" id="linkMaps" target="_blank" className="text-[#00ffd0] hover:text-[#4dffdf] hidden items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Lihat di Maps
                  </a>
                </label>
                <select id="regPickup" required className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors appearance-none">
                  <option value="">-- Memuat Titik Kumpul --</option>
                </select>
              </div>
            </div>

            {/* AREA ROMBONGAN */}
            <div id="groupArea" className="hidden space-y-4 pt-4 border-t border-[#1f1f1f]">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest">Data Anggota Rombongan</h3>
                  <p className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mt-0.5">Alamat & Titik Kumpul mengikuti Pemesan</p>
                </div>
              </div>
              <div id="membersContainer" className="space-y-3"></div>
              <button type="button" id="btnAddMember" className="w-full bg-[#0a0a0a] border border-[#262626] hover:border-[#00ffd0] text-[#00ffd0] py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border-dashed">
                + Tambah Anggota Lain
              </button>
            </div>

            {/* SUBMIT */}
            <div className="pt-6 border-t border-[#1f1f1f]">
              <button type="submit" id="btnSubmitReg" className="w-full bg-[#00ffd0] hover:bg-[#00ffd0] text-[#0a0a0a] py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-colors active:scale-95 shadow-xl shadow-[#00ffd0]/20">
                Daftar Sekarang
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


export default function RegistrasiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse">Memuat...</div>}>
      <RegistrasiPageInner />
    </Suspense>
  );
}
