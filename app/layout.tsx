import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tapak Swaka Holidays",
    template: "%s | Tapak Swaka",
  },
  description:
    "Open trip & dokumentasi perjalanan. Jelajah alam, bawa pulang cerita.",
};

/**
 * Root layout — netral, dipakai oleh landing & space.
 * Layout spesifik (Navbar/Footer utk landing, script scanner utk space)
 * ditaruh di sub-layout masing-masing route group/subfolder.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
