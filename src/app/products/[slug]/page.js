import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import AddToCartForm from "@/components/AddToCartForm";

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
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-800 bg-black">
  {product.images[0] ? (
    <Image
      src={product.images[0].url}
      alt={product.images[0].altText}
      fill
      priority
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="object-contain"
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

          

         

          <p className="mt-8 text-sm text-gray-400">
            {totalStock > 0
              ? `${totalStock} units available`
              : "Currently sold out"}
          </p>

          <AddToCartForm
  product={{
    id: product.id,
    slug: product.slug,
    name: product.name,
    priceInCents: product.priceInCents,
    imageUrl: product.images[0]?.url ?? null,
    imageAlt: product.images[0]?.altText ?? product.name,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    })),
  }}
/>
        </div>
      </div>
    </section>
  );
}