export const metadata = {
  title: "Shop",
};

export default function ProductsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-bold">Shop</h1>

      <p className="mt-3 text-gray-400">
        Browse our collection of premium gym apparel.
      </p>

      <div className="mt-10 rounded-lg border border-dashed border-gray-700 p-12 text-center text-gray-400">
        Products coming soon...
      </div>
    </section>
  );
}
