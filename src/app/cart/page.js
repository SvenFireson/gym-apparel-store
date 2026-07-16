"use client";

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
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-bold">Shopping Cart</h1>

        <div className="mt-10 rounded-lg border border-gray-800 p-12 text-center text-gray-400">
          Your cart is currently empty.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold">Shopping Cart</h1>

      <div className="mt-10 space-y-6">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center justify-between rounded-lg border border-gray-800 p-5"
          >
            <div>
              <h2 className="text-xl font-semibold">{item.name}</h2>

              <p className="mt-1 text-sm text-gray-400">
                {item.size} • {item.color}
              </p>

              <p className="mt-3 font-semibold">
                ${(item.priceInCents / 100).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  updateQuantity(item.variantId, item.quantity - 1)
                }
                className="rounded border border-gray-700 px-3 py-1"
              >
                −
              </button>

              <span>{item.quantity}</span>

              <button
                onClick={() =>
                  updateQuantity(item.variantId, item.quantity + 1)
                }
                className="rounded border border-gray-700 px-3 py-1"
              >
                +
              </button>

              <button
                onClick={() => removeItem(item.variantId)}
                className="ml-4 text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between text-xl font-semibold">
          <span>Subtotal</span>

          <span>${(subtotalInCents / 100).toFixed(2)}</span>
        </div>

        <button
          onClick={clearCart}
          className="mt-6 rounded bg-red-600 px-4 py-2 hover:bg-red-700"
        >
          Clear Cart
        </button>
      </div>
    </section>
  );
}