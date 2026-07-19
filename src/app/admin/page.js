import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

function formatMoney(amountInCents) {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      email: session.user.email.trim().toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/account");
  }

  

  const revenueInCents = paidOrderTotals._sum.totalInCents ?? 0;

  const dashboardCards = [
    {
      label: "Products",
      value: productCount,
      description: "Manage products, variants, images, and stock.",
      href: "/admin/products",
      linkText: "Manage products",
    },
    {
      label: "Orders",
      value: orderCount,
      description: "Review payments and customer purchases.",
      href: "/admin/orders",
      linkText: "Manage orders",
    },
    {
      label: "Customers",
      value: customerCount,
      description: "View registered customer accounts.",
      href: "/admin/customers",
      linkText: "View customers",
    },
    {
      label: "Revenue",
      value: formatMoney(revenueInCents),
      description: "Total revenue from paid orders.",
      href: "/admin/orders",
      linkText: "View sales",
    },
    {
      label: "Low stock",
      value: lowStockVariants.length,
      description: "Active variants with five or fewer units remaining.",
      href: "/admin/products",
      linkText: "Review inventory",
    },
  ];
  const [
  productCount,
  orderCount,
  customerCount,
  paidOrderTotals,
  recentOrders,
  lowStockVariants,
] = await Promise.all([
  prisma.product.count(),

  prisma.order.count(),

  prisma.user.count({
    where: {
      role: "CUSTOMER",
    },
  }),

  prisma.order.aggregate({
    where: {
      status: "PAID",
    },
    _sum: {
      totalInCents: true,
    },
  }),

  prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    select: {
      id: true,
      orderNumber: true,
      firstName: true,
      lastName: true,
      status: true,
      totalInCents: true,
      createdAt: true,
    },
  }),

  prisma.productVariant.findMany({
    where: {
      stock: {
        lte: 5,
      },
      product: {
        isActive: true,
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      stock: "asc",
    },
    take: 10,
  }),
]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            IRONWEAR administration
          </p>

          <h1 className="mt-3 text-4xl font-bold">Admin dashboard</h1>

          <p className="mt-4 text-gray-400">
            Welcome, {currentUser.name || "Administrator"}. Manage the store
            from one place.
          </p>
        </div>

        <Link
          href="/"
          className="text-sm font-semibold text-gray-300 underline transition hover:text-white"
        >
          View storefront
        </Link>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardCards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-gray-800 bg-gray-950 p-6"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">
              {card.label}
            </p>

            <p className="mt-4 text-4xl font-bold">{card.value}</p>

            <p className="mt-4 min-h-12 text-sm leading-6 text-gray-400">
              {card.description}
            </p>

            <Link
              href={card.href}
              className="mt-6 inline-block text-sm font-semibold underline"
            >
              {card.linkText}
            </Link>
          </article>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-gray-800 bg-gray-950 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Recent orders</h2>

            <p className="mt-2 text-gray-400">
              The five most recently created orders.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-sm font-semibold underline"
          >
            View all
          </Link>
        </div>
        
        <section className="mt-10 rounded-2xl border border-gray-800 bg-gray-950 p-6">
  <div className="flex items-center justify-between gap-4">
    <div>
      <h2 className="text-2xl font-semibold">Low-stock inventory</h2>

      <p className="mt-2 text-gray-400">
        Active product variants with five or fewer units remaining.
      </p>
    </div>

    <Link
      href="/admin/products"
      className="text-sm font-semibold underline"
    >
      Manage products
    </Link>
  </div>

  {lowStockVariants.length === 0 ? (
    <p className="mt-8 text-gray-400">
      All active products have healthy stock levels.
    </p>
  ) : (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
        <thead>
          <tr className="border-b border-gray-800 text-sm text-gray-500">
            <th className="pb-4 pr-6 font-medium">Product</th>
            <th className="pb-4 pr-6 font-medium">SKU</th>
            <th className="pb-4 pr-6 font-medium">Variant</th>
            <th className="pb-4 pr-6 font-medium">Stock</th>
            <th className="pb-4 font-medium">Action</th>
          </tr>
        </thead>

        <tbody>
          {lowStockVariants.map((variant) => (
            <tr
              key={variant.id}
              className="border-b border-gray-900 last:border-0"
            >
              <td className="py-5 pr-6 font-semibold">
                {variant.product.name}
              </td>

              <td className="py-5 pr-6 text-gray-400">
                {variant.sku}
              </td>

              <td className="py-5 pr-6 text-gray-300">
                {variant.size} / {variant.color}
              </td>

              <td className="py-5 pr-6">
                <span
                  className={
                    variant.stock === 0
                      ? "font-semibold text-red-400"
                      : "font-semibold text-yellow-300"
                  }
                >
                  {variant.stock}
                </span>
              </td>

              <td className="py-5">
                <Link
                  href={`/admin/products/${variant.product.id}/edit`}
                  className="font-semibold underline"
                >
                  Update stock
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>

        {recentOrders.length === 0 ? (
          <p className="mt-8 text-gray-400">No orders have been placed yet.</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-3xl text-left">
              <thead>
                <tr className="border-b border-gray-800 text-sm text-gray-500">
                  <th className="pb-4 pr-6 font-medium">Order</th>
                  <th className="pb-4 pr-6 font-medium">Customer</th>
                  <th className="pb-4 pr-6 font-medium">Status</th>
                  <th className="pb-4 pr-6 font-medium">Total</th>
                  <th className="pb-4 font-medium">Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-900 last:border-0"
                  >
                    <td className="py-5 pr-6 font-semibold">
                      {order.orderNumber}
                    </td>

                    <td className="py-5 pr-6 text-gray-300">
                      {order.firstName} {order.lastName}
                    </td>

                    <td className="py-5 pr-6">
                      <span className="rounded-full border border-gray-700 px-3 py-1 text-xs font-semibold">
                        {order.status}
                      </span>
                    </td>

                    <td className="py-5 pr-6 font-medium">
                      {formatMoney(order.totalInCents)}
                    </td>

                    <td className="py-5 text-gray-400">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}