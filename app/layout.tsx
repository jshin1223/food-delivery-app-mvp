import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "../components/NavBar";

export const metadata: Metadata = {
  title: "Wyzly",
  description: "Food Ordering MVP with Supabase + Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground font-sans">
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
