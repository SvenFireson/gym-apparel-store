import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

function formatOrderDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMoney(amountInCents) {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

export default async function OrderDetailsPage({ params }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id } = await params;

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

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Order details
          </p>

          <h1 className="mt-3 break-all text-3xl font-bold sm:text-4xl">
            {order.orderNumber}
          </h1>

          <p className="mt-4 text-gray-400">
            Placed on {formatOrderDate(order.createdAt)}
          </p>
        </div>

        <Link
          href="/account/orders"
          className="text-sm font-semibold text-gray-300 underline transition hover:text-white"
        >
          Back to orders
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Items</h2>

              <span className="rounded-full border border-gray-700 px-3 py-1 text-xs font-semibold">
                {order.status}
              </span>
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
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="font-semibold">
                      {formatMoney(
                        item.unitPriceInCents * item.quantity,
                      )}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatMoney(item.unitPriceInCents)} each
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
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
            <p className="text-sm text-gray-500">Contact email</p>
            <p className="mt-1 break-all font-medium">{order.email}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}