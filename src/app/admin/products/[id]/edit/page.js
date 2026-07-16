import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({ params }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const admin = await prisma.user.findUnique({
    where: {
      email: session.user.email.trim().toLowerCase(),
    },
    select: {
      role: true,
    },
  });

  if (!admin || admin.role !== "ADMIN") {
    redirect("/account");
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
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

  if (!product) {
    notFound();
  }

  const initialProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    price: (product.priceInCents / 100).toFixed(2),
    isActive: product.isActive,
    imageUrl: product.images[0]?.url ?? "",
    imageAlt: product.images[0]?.altText ?? "",
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    })),
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>

          <h1 className="mt-3 text-4xl font-bold">Edit product</h1>

          <p className="mt-4 text-gray-400">
            Update product information, pricing, images, variants, and stock.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="text-sm font-semibold underline"
        >
          Back to products
        </Link>
      </div>

      <EditProductForm initialProduct={initialProduct} />
    </section>
  );
}