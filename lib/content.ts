// lib/content.ts — semua konten statis landing page Tapak Swaka.
// Semua teks di sini bisa diedit manual tanpa nyentuh komponen.

// ============================================================
// TYPES
// ============================================================
export interface TeamMember {
  name: string;
  nickname: string;
  role: string;
  division: string;
  description: string;
  icon: "clock" | "calc" | "video" | "photo";
}

export interface WhyUsItem {
  title: string;
  description: string;
  icon: "compass" | "shield" | "sun" | "friends";
}

export interface Testimonial {
  quote: string;
  name: string;
  trip: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface MediaItem {
  type: "photo" | "video";
  label: string;
  trip: string;
}

export interface ContactInfo {
  whatsapp: string;
  instagram: string;
  email: string;
  address: string;
  hours: string;
}

export interface Tip {
  title: string;
  description: string;
  icon: "bag" | "health" | "doc" | "energy";
}

// ============================================================
// TEAM — teks asli dari owner
// ============================================================
export function getTeams(): TeamMember[] {
  return [
    {
      name: "M. Arif Agus Sugiono",
      nickname: "The Timekeeper",
      role: "Tour Leader",
      division: "Operations",
      icon: "clock",
      description:
        "Kalau di itinerary tertulis kumpul jam 5:00, jam 4:45 dia udah mondar-mandir di lobi bawa aura sersan militer. Bareng dia, kelewatan sunrise itu secara matematis mustahil. Superpower anehnya? Dia bisa bikin peserta yang paling mager mendadak rajin bangun pagi tanpa sadar. Niat mau tidur siang di mobil? Good luck—siap-siap aja dibangunin paksa cuma buat ngelihat batu yang katanya estetik.",
    },
    {
      name: "M. Ilyas Habiburrochman",
      nickname: "The Human Spreadsheet",
      role: "Tour Leader",
      division: "Finance",
      icon: "calc",
      description:
        "Kalkulator berjalan Tapakswaka. Dia ini orang yang bakal ngirim \"pengingat ramah\" pas kamu pura-pura lupa transfer invoice. Meski aura debt collector-nya nggak kenal ampun soal budgeting, dia punya satu kelemahan fatal: sogok aja pakai kopi hitam yang enak, mode galaknya langsung luntur berubah jadi senyum paling lebar sepanjang perjalanan.",
    },
    {
      name: "Bayu Agus Nurrudin",
      nickname: "The Rogue Director",
      role: "Documentation",
      division: "Video",
      icon: "video",
      description:
        "Ngejagain kamera sama drone udah kayak ngerawat anak pertama. Nggak usah repot latihan pose estetik, karena dia justru lebih semangat nangkep momen pas kamu lagi ngakak lepas atau ngos-ngosan kehabisan napas di tanjakan. Ajaibnya? Sekucel dan secapek apa pun muka kamu di lapangan, hasil editannya bakal tetep keluar sekelas film cinematic jutaan dolar.",
    },
    {
      name: "Ilham Yusuf Fihriansyah",
      nickname: "The Stealth Shooter",
      role: "Documentation",
      division: "Photo",
      icon: "photo",
      description:
        "Kamu nggak bakal pernah denger dia teriak \"Satu, dua, tiga, senyum!\" karena dia murni beroperasi di jalur ghost mode. Sniper spesialis candid ini tau-tau udah dapet aja momen paling natural dan jujur pas kamu lagi nggak sadar kamera. Hasilnya? Foto-foto estetik level tinggi tanpa perlu repot mati-matian nahan gaya kaku.",
    },
  ];
}

// ============================================================
// WHY US
// ============================================================
export function getWhyUs(): WhyUsItem[] {
  return [
    {
      title: "Itinerary Matang",
      description:
        "Setiap rute disusun detail dari sunrise sampai sunset, jadi kamu tinggal nikmatin tanpa mikir.",
      icon: "compass",
    },
    {
      title: "Dokumentasi Sinematik",
      description:
        "Foto & video candid level film, dijamin feed kamu naik kelas sepulang trip.",
      icon: "sun",
    },
    {
      title: "Crew Profesional",
      description:
        "Tour leader disiplin & kalkulatif, dokumentasi sniper candid — tim yang saling lengkapi.",
      icon: "friends",
    },
    {
      title: "Aman & Terjaga",
      description:
        "Keberangkatan tepat waktu, budget transparan, dan pendampingan dari titik kumpul sampai pulang.",
      icon: "shield",
    },
  ];
}

// ============================================================
// TESTIMONIALS
// ============================================================
export function getTestimonials(): Testimonial[] {
  return [
    {
      quote:
        "Baru kali ini trip yang fotonya nggak perlu diedit lagi. Candid-nya keren banget, kayak foto majalah.",
      name: "Peserta Open Trip Bromo",
      trip: "Bromo Sunrise",
    },
    {
      quote:
        "Bang Arif gila sih disiplinnya, tapi justru karena itu kita nggak pernah kelewatan sunrise. Worth it.",
      name: "Peserta Open Trip Ijen",
      trip: "Ijen Blue Fire",
    },
    {
      quote:
        "Budget-nya transparan banget, dicatat rapi kayak laporan keuangan. Tenang dan nggak ada biaya siluman.",
      name: "Peserta Open Trip Dieng",
      trip: "Dieng Golden Sunrise",
    },
  ];
}

// ============================================================
// FAQ
// ============================================================
export function getFaqs(): Faq[] {
  return [
    {
      question: "Gimana cara daftar open trip?",
      answer:
        "Cukup hubungi kontak WhatsApp kami, pilih jadwal trip yang tersedia, lalu transfer DP untuk mengunci kursi. Admin bakal bantu proses selanjutnya.",
    },
    {
      question: "Apa yang sudah termasuk dalam harga?",
      answer:
        "Harga sudah termasuk transportasi, akomodasi, tiket masuk destinasi, dan dokumentasi. Rincian lengkap tercantum di detail tiap trip.",
    },
    {
      question: "Boleh ikut sendirian?",
      answer:
        "Boleh banget. Mayoritas peserta datang solo, dan kami pastikan kamu bakal pulang bawa teman baru.",
    },
    {
      question: "Gimana kalau hujan saat keberangkatan?",
      answer:
        "Cuaca tidak bisa diprediksi, tapi itinerary kami fleksibel dan ada rencana cadangan untuk tiap destinasi.",
    },
  ];
}

// ============================================================
// MEDIA GALLERY (placeholder — isi dengan momen dokumentasi)
// ============================================================
export function getMediaGallery(): MediaItem[] {
  return [
    { type: "photo", label: "Golden Sunrise", trip: "Bromo" },
    { type: "video", label: "Cinematic Reel", trip: "Ijen" },
    { type: "photo", label: "Camp Malam", trip: "Dieng" },
    { type: "video", label: "Aftermovie", trip: "Semeru" },
    { type: "photo", label: "Summit Moment", trip: "Rinjani" },
    { type: "photo", label: "Candid Squad", trip: "Papandayan" },
  ];
}

// ============================================================
// CONTACT (placeholder — ganti dengan kontak asli)
// ============================================================
export function getContactInfo(): ContactInfo {
  return {
    whatsapp: "+62 812-3456-7890",
    instagram: "@tapakswaka",
    email: "halo@tapakswaka.id",
    address: "Indonesia",
    hours: "Senin – Minggu, 08.00 – 21.00 WIB",
  };
}

// ============================================================
// TIPS
// ============================================================
export function getTips(): Tip[] {
  return [
    {
      title: "Siapkan Fisik",
      description:
        "Mulai biasakan jalan kaki atau jogging ringan seminggu sebelum trip biar tanjakan nggak kerasa berat.",
      icon: "energy",
    },
    {
      title: "Bawa Obat Pribadi",
      description:
        "Obat masuk angin, anti mabuk, dan plester itu wajib. Lebih baik bawa walau nggak kepake.",
      icon: "health",
    },
    {
      title: "Dokumen & Identitas",
      description:
        "Simpan KTP dan bukti pembayaran di tempat yang gampang diakses, jangan di dalam koper.",
      icon: "doc",
    },
    {
      title: "Pack Ringkas",
      description:
        "Bawa pakaian sesuai suhu destinasi, tapi jangan overpacking — ruang bagasi terbatas.",
      icon: "bag",
    },
  ];
}
