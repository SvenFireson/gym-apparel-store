"use client";

import { useEffect, useState } from "react";

function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ShippingMethodSelector({
  subtotalInCents,
  selectedShippingMethod,
  onShippingMethodChange,
}) {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadShippingMethods() {
      try {
        setError("");

        const response = await fetch("/api/shipping-methods", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load shipping methods.");
        }

        const data = await response.json();

        const pricedMethods = data.map((method) => {
          const qualifiesForFreeShipping =
            method.freeAboveCents !== null &&
            subtotalInCents >= method.freeAboveCents;

          return {
            ...method,
            calculatedPriceInCents: qualifiesForFreeShipping
              ? 0
              : method.priceInCents,
          };
        });

        setMethods(pricedMethods);

        if (!selectedShippingMethod && pricedMethods.length > 0) {
          onShippingMethodChange(pricedMethods[0]);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load shipping methods.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadShippingMethods();
  }, [
    subtotalInCents,
    selectedShippingMethod,
    onShippingMethodChange,
  ]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
        <p className="text-sm text-gray-400">
          Loading shipping methods...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-900 bg-red-950/30 p-6">
        <p className="text-sm text-red-300">{error}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
      <h2 className="text-xl font-semibold">
        Shipping method
      </h2>

      <div className="mt-5 space-y-3">
        {methods.map((method) => {
          const isSelected =
            selectedShippingMethod?.id === method.id;

          return (
            <label
              key={method.id}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition ${
                isSelected
                  ? "border-white bg-white/5"
                  : "border-gray-800 bg-black hover:border-gray-600"
              }`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() =>
                    onShippingMethodChange(method)
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-white"
                />

                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {method.name}
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-400">
                    {method.description}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Estimated delivery:{" "}
                    {method.estimatedMinDays}–
                    {method.estimatedMaxDays} business days
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-right font-semibold text-white">
                {method.calculatedPriceInCents === 0
                  ? "Free"
                  : formatMoney(
                      method.calculatedPriceInCents,
                    )}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}