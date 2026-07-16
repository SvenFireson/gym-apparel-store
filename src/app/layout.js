import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Gym Apparel Store",
  description: "Performance gym and fitness apparel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-gray-900">
        <CartProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          IRONWEAR
        </Link>

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-gray-500">
            Home
          </Link>

          <Link href="/products" className="hover:text-gray-500">
            Shop
          </Link>

          <Link href="/cart" className="hover:text-gray-500">
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-gray-500">
        © {new Date().getFullYear()} Ironwear. Portfolio project — not a real
        store.
      </div>
    </footer>
  );
}