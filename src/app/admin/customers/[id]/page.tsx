import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth/auth";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { prisma } from "@/lib/prisma";

type AdminCustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(amountInCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminCustomerDetailPage({
  params,
}: AdminCustomerDetailPageProps) {
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

  const customer = await prisma.user.findUnique({
  where: {
    id,
  },
  
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalInCents: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
            },
          },
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const totalSpentInCents = customer.orders.reduce(
    (total, order) => total + order.totalInCents,
    0,
  );

  const totalItemsPurchased = customer.orders.reduce(
    (orderTotal, order) =>
      orderTotal +
      order.items.reduce(
        (itemTotal, item) => itemTotal + item.quantity,
        0,
      ),
    0,
  );

  const averageOrderValueInCents = customer.orders.length
    ? Math.round(totalSpentInCents / customer.orders.length)
    : 0;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Admin customer
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            {customer.name || "Unnamed customer"}
          </h1>

          <p className="mt-3 break-all text-zinc-400">
            {customer.email}
          </p>
        </div>

        <Link
          href="/admin/customers"
          className="text-sm font-semibold text-zinc-300 underline transition hover:text-white"
        >
          Back to customers
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            Total orders
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {customer.orders.length}
          </p>
        </article>

        <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            Total spent
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {formatCurrency(totalSpentInCents)}
          </p>
        </article>

        <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            Average order
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {formatCurrency(averageOrderValueInCents)}
          </p>
        </article>

        <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            Items purchased
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {totalItemsPurchased}
          </p>
        </article>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-semibold text-white">
            Account details
          </h2>

          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="text-zinc-500">Name</dt>
              <dd className="mt-1 text-zinc-200">
                {customer.name || "Not provided"}
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="mt-1 break-all text-zinc-200">
                {customer.email}
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500">Joined</dt>
              <dd className="mt-1 text-zinc-200">
                {formatDate(customer.createdAt)}
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500">
                Last account update
              </dt>
              <dd className="mt-1 text-zinc-200">
                {formatDate(customer.updatedAt)}
              </dd>
            </div>
          </dl>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-6 py-5">
            <h2 className="text-xl font-semibold text-white">
              Order history
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Every order associated with this customer account.
            </p>
          </div>

          {customer.orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-medium text-white">
                No orders yet
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                This customer has not placed an order.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-zinc-800 bg-zinc-900/50">
                  <tr className="text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-6 py-4 font-medium">
                      Order
                    </th>
                    <th className="px-6 py-4 font-medium">
                      Date
                    </th>
                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>
                    <th className="px-6 py-4 font-medium">
                      Items
                    </th>
                    <th className="px-6 py-4 font-medium">
                      Total
                    </th>
                    <th className="px-6 py-4 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                  {customer.orders.map((order) => {
                    const itemCount = order.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    );

                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-zinc-900/60"
                      >
                        <td className="px-6 py-5 font-medium text-white">
                          {order.orderNumber}
                        </td>

                        <td className="px-6 py-5 text-sm text-zinc-300">
                          {formatDateTime(order.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <OrderStatusBadge
                            status={order.status}
                          />
                        </td>

                        <td className="px-6 py-5 text-sm text-zinc-300">
                          {itemCount}
                        </td>

                        <td className="px-6 py-5 font-medium text-white">
                          {formatCurrency(order.totalInCents)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-sm font-semibold text-white underline-offset-4 hover:underline"
                          >
                            View order
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}