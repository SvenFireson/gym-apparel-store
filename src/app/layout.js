import Link from "next/link";
import "./globals.css";
import HeaderNav from "@/components/HeaderNav";
import { auth } from "@/auth/auth";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Gym Apparel Store",
  description: "Performance gym and fitness apparel.",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-gray-900">
        <CartProvider>
          <Header user={session?.user ?? null} />

          <main className="flex-1">{children}</main>

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
function Header({ user }) {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          IRONWEAR
        </Link>

        <HeaderNav user={user} />
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