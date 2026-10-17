import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

/**
 * Landing page layout — wraps every landing route with Navbar + Footer.
 */
export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}


