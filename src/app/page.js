import Link from "next/link";
export const metadata = {
  title: "Shop | Ironwear",
  description: "Browse Ironwear gym apparel.",
};

export default function ProductsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <p className="mt-2 text-gray-600">
          Browse performance apparel built for training.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-600">Products are being added.</p>
      </div>
    </section>
  );
}