"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    subtotalInCents,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Your bag
          </p>

          <h1 className="mt-3 text-4xl font-bold">Shopping Cart</h1>

          <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-950 p-12">
            <p className="text-lg text-gray-400">
              Your cart is currently empty.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-md bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Your bag
          </p>

          <h1 className="mt-2 text-4xl font-bold">Shopping Cart</h1>
        </div>

        <Link
          href="/products"
          className="text-sm text-gray-400 transition hover:text-white"
        >
          Continue shopping →
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {items.map((item) => {
            const lineTotal = item.priceInCents * item.quantity;
            const isAtMaximum = item.quantity >= item.stock;

            return (
              <article
                key={item.variantId}
                className="grid gap-5 rounded-2xl border border-gray-800 bg-gray-950 p-5 sm:grid-cols-[140px_1fr]"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative aspect-square overflow-hidden rounded-xl bg-black"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      fill
                      sizes="140px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
                      Product image unavailable
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-col justify-between gap-5">
                  <div className="flex gap-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-xl font-semibold transition hover:text-gray-300"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-2 text-sm text-gray-400">
                        Size: {item.size}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Color: {item.color}
                      </p>

                      <p className="mt-3 text-sm text-gray-500">
                        {item.stock} units available
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="self-start text-sm text-red-400 transition hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quantity
                      </p>

                      <div className="inline-flex items-center rounded-md border border-gray-700">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              item.quantity - 1,
                            )
                          }
                          className="px-4 py-2 text-lg transition hover:bg-gray-800"
                        >
                          −
                        </button>

                        <span className="min-w-12 border-x border-gray-700 px-3 py-2 text-center">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          disabled={isAtMaximum}
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              item.quantity + 1,
                            )
                          }
                          className="px-4 py-2 text-lg transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {isAtMaximum ? (
                        <p className="mt-2 text-xs text-amber-400">
                          Maximum available quantity reached.
                        </p>
                      ) : null}
                    </div>

                    <div className="sm:text-right">
                      <p className="text-sm text-gray-500">
                        ${(item.priceInCents / 100).toFixed(2)} each
                      </p>

                      <p className="mt-1 text-xl font-semibold">
                        ${(lineTotal / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-950 p-6 lg:sticky lg:top-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>

          <div className="mt-6 space-y-4 border-b border-gray-800 pb-6">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>${(subtotalInCents / 100).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-400">
              <span>Estimated shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xl font-semibold">
            <span>Total</span>
            <span>${(subtotalInCents / 100).toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
             className="mt-6 block w-full rounded-md bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-gray-200"
          >
            Proceed to checkout
          </Link>

          <button
            type="button"
            onClick={clearCart}
            className="mt-3 w-full rounded-md border border-gray-700 px-6 py-3 text-sm font-semibold transition hover:border-gray-500 hover:bg-gray-900"
          >
            Clear cart
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-gray-500">
            Taxes and delivery costs are calculated during checkout.
          </p>
        </aside>
      </div>
    </section>
  );
}