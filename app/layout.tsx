// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // ✅ correct path
import Navbar from "../components/NavBar";

export const metadata: Metadata = {
  title: "Wyzly",
  description: "Food Ordering MVP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground font-sans">
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
