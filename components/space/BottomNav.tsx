"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

export default function BottomNav() {
  const pathname = usePathname();

  useEffect(() => {
    // UI routing state - active nav link
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      const path = link.getAttribute("data-path");
      const icon = link.querySelector(".nav-icon");
      const text = link.querySelector(".nav-text");
      if (icon && text && path) {
        if (pathname.startsWith(path)) {
          icon.classList.remove("text-neutral-500");
          icon.classList.add("text-[#00ffd0]");
          text.classList.remove("text-neutral-500");
          text.classList.add("text-[#00ffd0]");
        } else {
          icon.classList.remove("text-[#00ffd0]");
          icon.classList.add("text-neutral-500");
          text.classList.remove("text-[#00ffd0]");
          text.classList.add("text-neutral-500");
        }
      }
    });
  }, [pathname]);

  useEffect(() => {
    // Global scanner logic
    const btnOpen = document.getElementById("btnGlobalScan");
    const btnClose = document.getElementById("btnCloseGlobalScan");
    const modal = document.getElementById("globalScanModal");
    const resultEl = document.getElementById("globalScanResult");

    let html5QrcodeScanner: any = null;
    let isScanning = false;

    if (!btnOpen || !btnClose || !modal || !resultEl) return;

    const stopScanner = () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
        html5QrcodeScanner = null;
      }
      isScanning = false;
    };

    const startScanner = () => {
      resultEl.classList.add("hidden");
      if (typeof (window as any).Html5QrcodeScanner !== "undefined") {
        html5QrcodeScanner = new (window as any).Html5QrcodeScanner(
          "global-qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          false
        );
        html5QrcodeScanner.render(onScanSuccess, () => {});
        isScanning = true;
      } else {
        resultEl.textContent =
          "Library Scanner gagal dimuat. Cek koneksi internet.";
        resultEl.className =
          "text-center mt-6 text-xs font-bold uppercase tracking-widest w-full max-w-sm p-4 rounded-xl border border-red-500/50 bg-red-500/10 text-red-400";
        resultEl.classList.remove("hidden");
      }
    };

    const onScanSuccess = async (decodedText: string) => {
      if (!isScanning) return;
      stopScanner();

      resultEl.classList.remove("hidden");
      resultEl.className =
        "text-center mt-6 text-xs font-bold uppercase tracking-widest w-full max-w-sm p-4 rounded-xl border border-[#00ffd0]/50 bg-[#00ffd0]/10 text-[#00ffd0] animate-pulse";
      resultEl.textContent = "MEMPROSES DATA...";

      try {
        const { fullname } = await apiClient.post<{ fullname: string }>(
          "/api/participants/check-in",
          { barcode: decodedText }
        );

        resultEl.className =
          "text-center mt-6 text-xs font-bold uppercase tracking-widest w-full max-w-sm p-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
        resultEl.textContent = `CHECK-IN BERHASIL: ${fullname}`;
      } catch (err) {
        resultEl.className =
          "text-center mt-6 text-xs font-bold uppercase tracking-widest w-full max-w-sm p-4 rounded-xl border border-red-500/50 bg-red-500/10 text-red-400";
        resultEl.textContent = "BARCODE TIDAK VALID!";
      }

      setTimeout(() => {
        if (!modal.classList.contains("hidden")) {
          startScanner();
        }
      }, 3000);
    };

    btnOpen.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      startScanner();
    });

    btnClose.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      stopScanner();
    });
  }, []);

  return (
    <>
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        suppressHydrationWarning
      >
        <div className="w-full relative pointer-events-auto">
          <div className="bg-[#121212] border-t border-[#1f1f1f] h-16 flex items-center justify-around px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
            <a
              href="/dashboard"
              className="nav-link flex flex-col items-center gap-0.5 transition-transform active:scale-95"
              data-path="/dashboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="nav-icon h-5 w-5 transition-colors text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span className="nav-text text-[0.55rem] font-bold tracking-widest uppercase text-neutral-500">
                Dash
              </span>
            </a>

            <a
              href="/trips"
              className="nav-link flex flex-col items-center gap-0.5 transition-transform active:scale-95"
              data-path="/trips"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="nav-icon h-5 w-5 transition-colors text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 21v-4m22 4v-4m-3-1l-3.172-3.172a4 4 0 00-5.656 0L2.828 16.172a4 4 0 000 5.656h18.344a4 4 0 005.656-0L22 16l-3 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="nav-text text-[0.55rem] font-bold tracking-widest uppercase text-neutral-500">
                Trips
              </span>
            </a>

            <button
              id="btnGlobalScan"
              className="flex flex-col items-center justify-center -mt-8 h-14 w-14 rounded-full bg-[#00ffd0] text-[#0a0a0a] shadow-glow animate-pulse-glow transition-transform active:scale-95"
              aria-label="Scanner check-in"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2m-10 0H5a2 2 0 01-2-2v-2M7 7h10v10H7V7z"
                />
              </svg>
            </button>

            <a
              href="/registrasi"
              className="nav-link flex flex-col items-center gap-0.5 transition-transform active:scale-95"
              data-path="/registrasi"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="nav-icon h-5 w-5 transition-colors text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span className="nav-text text-[0.55rem] font-bold tracking-widest uppercase text-neutral-500">
                Daftar
              </span>
            </a>

            <a
              href="/settings"
              className="nav-link flex flex-col items-center gap-0.5 transition-transform active:scale-95"
              data-path="/settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="nav-icon h-5 w-5 transition-colors text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="nav-text text-[0.55rem] font-bold tracking-widest uppercase text-neutral-500">
                Set
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Global Scanner Modal */}
      <div
        id="globalScanModal"
        className="fixed inset-0 z-[60] bg-[#0a0a0a] flex-col hidden pointer-events-auto"
      >
        <div className="flex justify-between items-center p-6 border-b border-[#1f1f1f] bg-[#121212]">
          <div>
            <h3 className="text-white text-sm font-bold tracking-[0.15em] uppercase text-[#00ffd0]">
              Scanner Check-In
            </h3>
            <p className="text-[0.65rem] text-neutral-500 uppercase tracking-widest mt-0.5">
              Arahkan kamera ke tiket peserta
            </p>
          </div>
          <button
            id="btnCloseGlobalScan"
            className="text-neutral-500 hover:text-red-400 transition-colors bg-[#161616] border border-[#262626] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md"
          >
            Tutup
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
          <div
            id="global-qr-reader"
            className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-[#00ffd0]/30 shadow-2xl bg-black"
          ></div>
          <div
            id="globalScanResult"
            className="text-center mt-6 text-sm font-bold uppercase tracking-widest hidden w-full max-w-sm p-4 rounded-xl border shadow-lg"
          ></div>
        </div>
      </div>
    </>
  );
}

