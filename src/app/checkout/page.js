"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, subtotalInCents } = useCart();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-4xl font-bold">Checkout</h1>

        <p className="mt-5 text-gray-400">
          Your cart is empty, so there is nothing to check out yet.
        </p>

        <Link
          href="/products"
          className="mt-8 inline-block rounded-md bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
        >
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Secure checkout
        </p>

        <h1 className="mt-2 text-4xl font-bold">Checkout</h1>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]">
        <form className="space-y-8">
          <fieldset className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
            <legend className="px-2 text-xl font-semibold">
              Contact information
            </legend>

            <div className="mt-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
              />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
            <legend className="px-2 text-xl font-semibold">
              Shipping address
            </legend>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-300"
                >
                  First name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Last name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-300"
                >
                  Street address
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  required
                  className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-300"
                >
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  required
                  className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-300"
                >
                  State / Province
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  autoComplete="address-level1"
                  required
                  className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                />
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-gray-300"
                >
                  Postal code
                </label>

                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  required
                  className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-300"
                >
                  Country
                </label>

                <input
                  id="country"
                  name="country"
                  type="text"
                  autoComplete="country-name"
                  required
                  className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                />
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            className="w-full rounded-md bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
          >
            Continue to payment
          </button>

          <p className="text-center text-sm text-gray-500">
            Payment processing will be connected in the next milestone.
          </p>
        </form>

        <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-950 p-6 lg:sticky lg:top-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>

          <div className="mt-6 space-y-5">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="grid grid-cols-[72px_1fr_auto] items-center gap-4"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-black">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      fill
                      sizes="72px"
                      className="object-contain"
                    />
                  ) : null}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.size} · {item.color} · Qty {item.quantity}
                  </p>
                </div>

                <p className="font-medium">
                  $
                  {(
                    (item.priceInCents * item.quantity) /
                    100
                  ).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 border-t border-gray-800 pt-6">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>${(subtotalInCents / 100).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span>Calculated later</span>
            </div>

            <div className="flex justify-between border-t border-gray-800 pt-4 text-xl font-semibold">
              <span>Total</span>
              <span>${(subtotalInCents / 100).toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}