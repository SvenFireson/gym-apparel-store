"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useCart } from "@/context/CartContext";

const emptySubscribe = () => () => {};

export default function HeaderNav() {
  const { itemCount } = useCart();

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <nav className="flex gap-6 text-sm font-medium">
      <Link href="/" className="hover:text-gray-500">
        Home
      </Link>

      <Link href="/products" className="hover:text-gray-500">
        Shop
      </Link>

      <Link href="/cart" className="hover:text-gray-500">
        Cart{isHydrated && itemCount > 0 ? ` (${itemCount})` : ""}
      </Link>
    </nav>
  );
}