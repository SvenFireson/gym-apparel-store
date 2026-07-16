"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function HeaderNav() {
  const { itemCount } = useCart();

  return (
    <nav className="flex gap-6 text-sm font-medium">
      <Link href="/" className="hover:text-gray-500">
        Home
      </Link>

      <Link href="/products" className="hover:text-gray-500">
        Shop
      </Link>

      <Link href="/cart" className="hover:text-gray-500">
        Cart{itemCount > 0 ? ` (${itemCount})` : ""}
      </Link>
    </nav>
  );
}