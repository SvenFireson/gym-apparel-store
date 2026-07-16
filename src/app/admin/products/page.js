import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteProductButton from "./DeleteProductButton";
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

function formatMoney(amountInCents) {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

export default async function AdminProductsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email.trim().toLowerCase(),
    },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/account");
  }

  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Products
          </h1>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-md bg-white px-5 py-3 font-semibold text-black"
        >
          + Add Product
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-500">
              <th className="pb-4">Product</th>
              <th className="pb-4">Price</th>
              <th className="pb-4">Variants</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-gray-900"
              >
                <td className="py-5 font-semibold">
                  {product.name}
                </td>

                <td>
                  {formatMoney(product.priceInCents)}
                </td>

                <td>
                  {product.variants.length}
                </td>

                <td>
                  {product.isActive ? "Active" : "Hidden"}
                </td>

                <td className="space-x-4">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="underline"
                  >
                    Edit
                  </Link>

                  <DeleteProductButton
                    productId={product.id}
                    productName={product.name}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}