// lib/trips.ts — data trip statis (hardcode).
// Lo bisa tambah/edit trip langsung di array bawah.

export interface Trip {
  id: string;
  name: string;
  destination: string;
  date: string;
  duration: string;
  price: string;
  priceNote?: string;
  capacity: string;
  facilities: string[];
  highlight?: string;
  status: "open" | "full" | "closed";
}

export function getAvailableTrips(): Trip[] {
  return [
    {
      id: "telaga-sarangan",
      name: "Tour Telaga Sarangan",
      destination: "Sarangan, Magetan",
      date: "2026-10-18",
      duration: "2 Hari 1 Malam",
      price: "Rp 450.000",
      priceNote: "per orang",
      capacity: "59/60 kursi terisi",
      facilities: ["Transportasi", "Akomodasi", "Dokumentasi", "Tiket Masuk"],
      highlight: "Sunrise di atas Telaga Sarangan",
      status: "open",
    },
  ];
}
