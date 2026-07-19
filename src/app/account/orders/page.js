import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

function formatOrderDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email.toLowerCase(),
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalInCents: true,
      createdAt: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            My account
          </p>

          <h1 className="mt-3 text-4xl font-bold">My orders</h1>

          <p className="mt-4 text-gray-400">
            Review your IRONWEAR purchases and payment status.
          </p>
        </div>

        <Link
          href="/account"
          className="text-sm font-semibold text-gray-300 underline transition hover:text-white"
        >
          Back to account
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-950 p-8 text-center">
          <h2 className="text-2xl font-semibold">No orders yet</h2>

          <p className="mt-3 text-gray-400">
            Orders placed while signed in will appear here.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-block rounded-md bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-gray-800 bg-gray-950 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-center">
                <div>
                  <p className="text-sm text-gray-500">Order number</p>
                  <p className="mt-1 font-semibold">{order.orderNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="mt-1 font-medium">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="mt-1 font-medium">{order._count.items}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="mt-1 font-medium">
                    ${(order.totalInCents / 100).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <OrderStatusBadge status={order.status} />

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-sm font-semibold underline"
                  >
                    View order
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}