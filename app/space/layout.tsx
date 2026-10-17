export default function SpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Global Scanner Library (dipasang di sini agar hanya dimuat untuk space) */}
      <script src="https://unpkg.com/html5-qrcode" defer />
      <div className="bg-[#0a0a0a] text-neutral-100 font-sans antialiased selection:bg-[#00ffd0] selection:text-black min-h-screen flex flex-col">
        {children}
      </div>
    </>
  );
}
