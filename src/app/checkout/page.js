"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CheckoutCouponForm from "@/components/CheckoutCouponForm";
import ShippingMethodSelector from "@/components/ShippingMethodSelector";

export default function CheckoutPage() {
  const { items, subtotalInCents, clearCart } = useCart();

  const [appliedCoupon, setAppliedCoupon] =
  useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] =
  useState(null);

  const discountInCents =
  appliedCoupon?.discountInCents || 0;
  const shippingInCents =
  selectedShippingMethod?.calculatedPriceInCents || 0;


const totalInCents = Math.max(
  subtotalInCents -
    discountInCents +
    shippingInCents,
  0,
);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

const [isSubmitting, setIsSubmitting] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [completedOrder, setCompletedOrder] = useState(null);
async function handleSubmit(event) {
  event.preventDefault();

  if (!selectedShippingMethod) {
  setErrorMessage("Please select a shipping method.");
  return;
}

  setIsSubmitting(true);
  setErrorMessage("");

  try {
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        addressLine1: formData.get("address"),
        city: formData.get("city"),
        state: formData.get("state"),
        postalCode: formData.get("postalCode"),
        country: formData.get("country"),
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon?.code || null,
        shippingMethodCode:
        selectedShippingMethod?.code || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to create your order.");
    }

    const stripeResponse = await fetch("/api/checkout-session", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    orderId: data.order.id,
  }),
});

const stripeData = await stripeResponse.json();

if (!stripeResponse.ok) {
  throw new Error(
    stripeData.error || "Unable to start Stripe Checkout.",
  );
}

if (!stripeData.url) {
  throw new Error("Stripe did not return a payment URL.");
}

window.location.href = stripeData.url;
  } catch (error) {
    console.error("Checkout failed:", error);

    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong while creating your order.",
    );
  } finally {
    setIsSubmitting(false);
  }
}
if (!isHydrated) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <p className="text-gray-400">Loading checkout...</p>
    </section>
  );
}
if (completedOrder) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        Order received
      </p>

      <h1 className="mt-3 text-4xl font-bold">
        Thank you for your order
      </h1>

      <p className="mt-5 text-gray-400">
        Your order has been successfully saved.
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 text-left">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Order number</span>
          <span className="font-semibold">
            {completedOrder.orderNumber}
          </span>
        </div>

        <div className="mt-4 flex justify-between gap-4">
          <span className="text-gray-400">Status</span>
          <span className="font-semibold">
            {completedOrder.status}
          </span>
        </div>

        <div className="mt-4 flex justify-between gap-4">
          <span className="text-gray-400">Total</span>
          <span className="font-semibold">
            ${(completedOrder.totalInCents / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <Link
        href="/products"
        className="mt-8 inline-block rounded-md bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
      >
        Continue shopping
      </Link>
    </section>
  );
}
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
        <form onSubmit={handleSubmit} className="space-y-8">
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
                {errorMessage ? (
                <div
                    role="alert"
                    className="rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300"
                >
                     {errorMessage}
                </div>
                ) : null}
         <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {isSubmitting ? "Redirecting to payment..." : "Continue to payment"}
        </button>

          <p className="text-center text-sm text-gray-500">
             Payment is securely processed by Stripe.
          </p>
        </form>

        <aside className="h-fit space-y-6 lg:sticky lg:top-6">

            <ShippingMethodSelector
            subtotalInCents={subtotalInCents}
            selectedShippingMethod={selectedShippingMethod}
            onShippingMethodChange={setSelectedShippingMethod}
            />
            <CheckoutCouponForm
            subtotalInCents={subtotalInCents}
            appliedCoupon={appliedCoupon}
            onCouponApplied={setAppliedCoupon}
            onCouponRemoved={() => setAppliedCoupon(null)}
           />

        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
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
            {discountInCents > 0 ? (
            <div className="flex justify-between text-green-400">
              <span>
              Discount
              {appliedCoupon?.code
              ? ` (${appliedCoupon.code})`
              : ""}
            </span>

            <span>
            -${(discountInCents / 100).toFixed(2)}
            </span>
            </div>
            ) : null}

            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span>
            {shippingInCents === 0
              ? "Free"
              : `$${(shippingInCents / 100).toFixed(2)}`}
            </span>
            </div>

            <div className="flex justify-between border-t border-gray-800 pt-4 text-xl font-semibold">
              <span>Total</span>
              <span>${(totalInCents / 100).toFixed(2)}</span>
            </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}