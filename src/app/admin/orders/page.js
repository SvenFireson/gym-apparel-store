import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const admin = await prisma.user.findUnique({
    where: {
      email: session.user.email.toLowerCase(),
    },
    select: {
      role: true,
    },
  });

  if (!admin || admin.role !== "ADMIN") {
    redirect("/account");
  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: true,
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Orders
          </h1>
        </div>

        <Link
          href="/admin/products"
          className="underline"
        >
          Products
        </Link>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border border-gray-800">
        <table className="w-full min-w-[900px]">
  <thead className="bg-gray-950">
    <tr>
      <th className="p-4 text-left">Order</th>
      <th className="p-4 text-left">Customer</th>
      <th className="p-4 text-left">Status</th>
      <th className="p-4 text-left">Items</th>
      <th className="p-4 text-left">Total</th>
      <th className="p-4 text-left">Date</th>
      <th className="p-4 text-left">Actions</th>
    </tr>
  </thead>

  <tbody>
    {orders.map((order) => (
      <tr
        key={order.id}
        className="border-t border-gray-800"
      >
        <td className="p-4 font-medium">
          {order.orderNumber}
        </td>

        <td className="p-4">
          <div>
            {order.firstName} {order.lastName}
          </div>

          <div className="text-sm text-gray-500">
            {order.email}
          </div>
        </td>

        <td className="p-4">
          {order.status}
        </td>

        <td className="p-4">
          {order.items.length}
        </td>

        <td className="p-4">
          ${(order.totalInCents / 100).toFixed(2)}
        </td>

        <td className="p-4">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(order.createdAt)}
        </td>

        <td className="p-4">
          <Link
            href={`/admin/orders/${order.id}`}
            className="font-semibold underline"
          >
            View
          </Link>
        </td>
      </tr>
    ))}
  </tbody>
</table>
      </div>
    </section>
  );
}