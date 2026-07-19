"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCartForm({ product }) {
  const { addItem } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? "",
  );
  const [message, setMessage] = useState("");

  const selectedVariant = useMemo(
    () =>
      product.variants.find(
        (variant) => variant.id === selectedVariantId,
      ),
    [product.variants, selectedVariantId],
  );

  function handleAddToCart() {
    if (!selectedVariant || selectedVariant.stock < 1) {
      setMessage("This option is currently unavailable.");
      return;
    }

    addItem(product, selectedVariant, 1);
    setMessage("Added to cart.");
  }

  return (
    <div className="mt-8">
      <h2 className="font-semibold">Choose an option</h2>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {product.variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          const isOutOfStock = variant.stock < 1;

          return (
            <button
              key={variant.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                setSelectedVariantId(variant.id);
                setMessage("");
              }}
              className={`rounded-md border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-white bg-white text-black"
                  : "border-gray-700 hover:border-gray-500"
              } ${
                isOutOfStock
                  ? "cursor-not-allowed opacity-40"
                  : ""
              }`}
            >
              <span className="block font-medium">
                {variant.size} · {variant.color}
              </span>

              <span className="mt-1 block text-sm opacity-70">
                {isOutOfStock
                  ? "Out of stock"
                  : variant.stock <= 5
                  ? `Only ${variant.stock} left`
                  : `${variant.stock} available`}
              </span>
            </button>
          );
        })}
      </div>

        <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock < 1}
            className="mt-6 w-full rounded-md bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
            {!selectedVariant || selectedVariant.stock < 1
            ? "Out of stock"
            : "Add to cart"}
        </button>

      {message ? (
        <p className="mt-3 text-sm text-gray-400">{message}</p>
      ) : null}
    </div>
  );
}