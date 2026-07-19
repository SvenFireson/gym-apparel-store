import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import OrderStatusForm from "./OrderStatusForm";
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import OrderStatusBadge from "@/components/OrderStatusBadge";

function formatMoney(amountInCents) {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

function formatOrderDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminOrderDetailsPage({ params }) {
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

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Admin order
          </p>

          <h1 className="mt-3 break-all text-3xl font-bold sm:text-4xl">
            {order.orderNumber}
          </h1>

          <p className="mt-4 text-gray-400">
            Placed on {formatOrderDate(order.createdAt)}
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="text-sm font-semibold underline"
        >
          Back to orders
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Purchased items</h2>

              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-6 divide-y divide-gray-800">
              {order.items.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 py-6 first:pt-0 last:pb-0 sm:grid-cols-[96px_1fr_auto] sm:items-center"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-black">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-600">
                        No image
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold">{item.productName}</h3>

                    <p className="mt-2 text-sm text-gray-400">
                      {item.size} · {item.color}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      SKU: {item.sku}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="font-semibold">
                      {formatMoney(item.lineTotalInCents)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatMoney(item.unitPriceInCents)} each
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
              <h2 className="text-xl font-semibold">Customer</h2>

              <div className="mt-4 space-y-2 text-gray-400">
                <p className="text-white">
                  {order.firstName} {order.lastName}
                </p>

                <p className="break-all">{order.email}</p>

                {order.phone ? <p>{order.phone}</p> : null}

                <p>
                  Account: {order.user ? "Registered customer" : "Guest"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
              <h2 className="text-xl font-semibold">Shipping address</h2>

              <address className="mt-4 not-italic leading-7 text-gray-400">
                <p className="text-white">
                  {order.firstName} {order.lastName}
                </p>

                <p>{order.addressLine1}</p>

                {order.addressLine2 ? <p>{order.addressLine2}</p> : null}

                <p>
                  {order.city}, {order.state} {order.postalCode}
                </p>

                <p>{order.country}</p>
              </address>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-950 p-6 lg:sticky lg:top-6">
          <h2 className="text-xl font-semibold">Order summary</h2>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between gap-4 text-gray-400">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotalInCents)}</span>
            </div>

            <div className="flex justify-between gap-4 text-gray-400">
              <span>Shipping</span>
              <span>{formatMoney(order.shippingInCents)}</span>
            </div>

            <div className="flex justify-between gap-4 border-t border-gray-800 pt-4 text-xl font-semibold">
              <span>Total</span>
              <span>{formatMoney(order.totalInCents)}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-800 pt-6">
            <p className="text-sm text-gray-500">
              Stripe Checkout Session
            </p>

            <p className="mt-1 break-all text-sm">
              {order.stripeCheckoutSessionId || "Not created"}

            

            </p>
          </div>
          <OrderStatusForm
                orderId={order.id}
                currentStatus={order.status}
            />
        </aside>
      </div>
    </section>
  );
}