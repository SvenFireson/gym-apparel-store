"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSyncExternalStore } from "react";
import { useCart } from "@/context/CartContext";

const emptySubscribe = () => () => {};

export default function HeaderNav({ user }) {
  const { itemCount } = useCart();

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  async function handleSignOut() {
    await signOut({
      callbackUrl: "/",
    });
  }

  return (
    <nav className="flex items-center gap-6 text-sm font-medium">
      <Link href="/" className="transition hover:text-gray-500">
        Home
      </Link>

      <Link href="/products" className="transition hover:text-gray-500">
        Shop
      </Link>

      <Link href="/cart" className="transition hover:text-gray-500">
        Cart{isHydrated && itemCount > 0 ? ` (${itemCount})` : ""}
      </Link>

      {user ? (
        <>
          <Link href="/account" className="transition hover:text-gray-500">
            Account
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="transition hover:text-gray-500"
          >
            Sign out
          </button>
        </>
      ) : (
        <Link href="/login" className="transition hover:text-gray-500">
          Sign in
        </Link>
      )}
    </nav>
  );
}