import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
    },
  });

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
      },
      variants: {
        orderBy: [
          {
            color: "asc",
          },
          {
            size: "asc",
          },
        ],
      },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const totalStock = product.variants.reduce(
    (total, variant) => total + variant.stock,
    0,
  );

  const sizes = [...new Set(product.variants.map((variant) => variant.size))];
  const colors = [...new Set(product.variants.map((variant) => variant.color))];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/products"
        className="text-sm text-gray-400 transition hover:text-white"
      >
        ← Back to shop
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
  {product.images[0] ? (
    <Image
      src={product.images[0].url}
      alt={product.images[0].altText}
      fill
      priority
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="object-cover"
    />
  ) : (
    <div className="flex h-full items-center justify-center text-gray-500">
      Product image coming soon
    </div>
  )}
</div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            {product.category}
          </p>

          <h1 className="mt-3 text-4xl font-bold">{product.name}</h1>

          <p className="mt-4 text-2xl font-semibold">
            ${(product.priceInCents / 100).toFixed(2)}
          </p>

          <p className="mt-6 leading-7 text-gray-400">
            {product.description}
          </p>

          <div className="mt-8">
            <h2 className="font-semibold">Available sizes</h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="rounded-md border border-gray-700 px-4 py-2 text-sm"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-semibold">Available colors</h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {colors.map((color) => (
                <span
                  key={color}
                  className="rounded-md border border-gray-700 px-4 py-2 text-sm"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            {totalStock > 0
              ? `${totalStock} units available`
              : "Currently sold out"}
          </p>

          <button
            type="button"
            disabled
            className="mt-6 w-full rounded-md bg-white px-6 py-3 font-semibold text-black opacity-60"
          >
            Add to cart coming next
          </button>
        </div>
      </div>
    </section>
  );
}