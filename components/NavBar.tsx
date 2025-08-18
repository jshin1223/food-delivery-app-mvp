// components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-blue-600 text-white px-6 py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo / Brand */}
        <Link href="/" className="text-xl font-bold">
          Wyzly
        </Link>

        {/* Navigation links */}
        <div className="flex gap-4">
          <Link href="/(public)/login" className="hover:underline">
            Login
          </Link>
          <Link href="/(restaurant)/dashboard" className="hover:underline">
            Restaurant Dashboard
          </Link>
          <Link href="/(admin)/orders" className="hover:underline">
            Admin Orders
          </Link>
        </div>
      </div>
    </nav>
  );
}
