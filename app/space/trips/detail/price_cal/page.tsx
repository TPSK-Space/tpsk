"use client";

import TripDetailLayout from "@/components/space/TripDetailLayout";

export default function PlaceholderPage() {
  return (
    <TripDetailLayout>
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-10 text-center shadow-xl">
        <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-2">Modul dalam pengembangan</h3>
        <p className="text-neutral-500 text-xs uppercase tracking-widest">Segera hadir</p>
      </div>
    </TripDetailLayout>
  );
}
