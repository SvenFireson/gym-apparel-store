export const metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold">Shopping Cart</h1>

      <div className="mt-8 rounded-lg border border-gray-700 p-10 text-center text-gray-400">
        Your cart is currently empty.
      </div>
    </section>
  );
}
