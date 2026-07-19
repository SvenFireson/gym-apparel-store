"use client";

import { useState } from "react";

function formatCurrency(amountInCents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}

export default function CheckoutCouponForm({
  subtotalInCents,
  appliedCoupon,
  onCouponApplied,
  onCouponRemoved,
}) {
  const [code, setCode] = useState(appliedCoupon?.code || "");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleApplyCoupon(event) {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setIsError(true);
      setMessage("Enter a coupon code.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: normalizedCode,
          subtotalInCents,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(
          data.message || "Coupon could not be applied.",
        );
      }

      const coupon = {
        ...data.coupon,
        discountInCents: data.discountInCents,
      };

      onCouponApplied(coupon);

      setCode(data.coupon.code);
      setIsError(false);
      setMessage(
        `${data.coupon.code} applied. You saved ${formatCurrency(
          data.discountInCents,
        )}.`,
      );
    } catch (error) {
      onCouponRemoved();
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Coupon could not be applied.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCode("");
    setMessage("");
    setIsError(false);
    onCouponRemoved();
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <h2 className="text-lg font-semibold text-white">
        Coupon code
      </h2>

      {appliedCoupon ? (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
          <div>
            <p className="font-semibold text-green-300">
              {appliedCoupon.code}
            </p>

            <p className="mt-1 text-sm text-green-200/70">
              You saved{" "}
              {formatCurrency(
                appliedCoupon.discountInCents,
              )}
              .
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="text-sm font-semibold text-zinc-300 transition hover:text-white"
          >
            Remove
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleApplyCoupon}
          className="mt-4 flex gap-3"
        >
          <input
            type="text"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.toUpperCase())
            }
            placeholder="Enter coupon code"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-400"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Applying..." : "Apply"}
          </button>
        </form>
      )}

      {message && !appliedCoupon ? (
        <p
          className={`mt-3 text-sm ${
            isError ? "text-red-400" : "text-green-400"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}