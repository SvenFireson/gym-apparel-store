import "./globals.css";

export const metadata = {
  title: "Gym Apparel Store",
  description: "Performance gym and fitness apparel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-xl font-bold tracking-tight">
          IRONWEAR
        </a>
        <nav className="flex gap-6 text-sm font-medium">
          <a href="/" className="hover:text-gray-500">Home</a>
          <a href="/products" className="hover:text-gray-500">Shop</a>
          <a href="/cart" className="hover:text-gray-500">Cart</a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-gray-500">
        © {new Date().getFullYear()} Ironwear. Portfolio project — not a real store.
      </div>
    </footer>
  );
}
