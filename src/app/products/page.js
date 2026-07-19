import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Shop",
  description: "Browse Ironwear gym apparel.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
        take: 1,
      },
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div>
        <h1 className="text-4xl font-bold">Shop</h1>

        <p className="mt-3 text-gray-400">
          Browse our collection of premium gym apparel.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-gray-700 p-12 text-center text-gray-400">
          No products are currently available.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const totalStock = product.variants.reduce(
              (total, variant) => total + variant.stock,
              0,
            );

            return (
             <Link
                   key={product.id}
                    href={`/products/${product.slug}`}
                    className="group overflow-hidden rounded-lg border border-gray-800 bg-gray-950 transition hover:-translate-y-1 hover:border-gray-600"
              >
            <div className="relative aspect-[16/9] overflow-hidden bg-black">
            {totalStock === 0 ? (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Sold out
              </span>
                ) : totalStock <= 5 ? (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">
               Low stock
               </span>
              ) : null}
     {product.images[0] ? (
    <Image
      src={product.images[0].url}
      alt={product.images[0].altText}
      fill
      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
      className="object-contain transition duration-300 group-hover:scale-[1.02]"
    />
  ) : (
    <div className="flex h-full items-center justify-center text-sm text-gray-500">
      Product image coming soon
    </div>
  )}
</div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {product.category}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="font-semibold">
                      ${(product.priceInCents / 100).toFixed(2)}
                    </p>

                    <p className="text-sm text-gray-500">
                      {totalStock > 0 ? `${totalStock} in stock` : "Sold out"}
                    </p>
                  </div>
                </div>
              </Link    >
            );
          })}
        </div>
      )}
    </section>
  );
}