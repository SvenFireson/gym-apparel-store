import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import ClearCartOnSuccess from "./ClearCartOnSuccess";

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  if (!sessionId) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-4xl font-bold">Payment not found</h1>

        <p className="mt-5 text-gray-400">
          This page requires a valid Stripe Checkout Session.
        </p>

        <Link
          href="/products"
          className="mt-8 inline-block rounded-md bg-white px-6 py-3 font-semibold text-black"
        >
          Return to shop
        </Link>
      </section>
    );
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const order = await prisma.order.findUnique({
    where: {
      stripeCheckoutSessionId: session.id,
    },
  });

  if (!order) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-4xl font-bold">Order not found</h1>

        <p className="mt-5 text-gray-400">
          Your payment was received, but the related order could not be found.
        </p>
      </section>
    );
  }

  const paymentSucceeded = session.payment_status === "paid";

  if (paymentSucceeded && order.status === "PENDING") {
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "PAID",
      },
    });
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
      {paymentSucceeded ? <ClearCartOnSuccess /> : null}

      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        Payment successful
      </p>

      <h1 className="mt-3 text-4xl font-bold">
        Thank you for your order
      </h1>

      <p className="mt-5 text-gray-400">
        Your payment was processed successfully.
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 text-left">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Order number</span>
          <span className="font-semibold">{order.orderNumber}</span>
        </div>

        <div className="mt-4 flex justify-between gap-4">
          <span className="text-gray-400">Status</span>
          <span className="font-semibold">
            {paymentSucceeded ? "PAID" : order.status}
          </span>
        </div>

        <div className="mt-4 flex justify-between gap-4">
          <span className="text-gray-400">Total</span>
          <span className="font-semibold">
            ${(order.totalInCents / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <Link
        href="/products"
        className="mt-8 inline-block rounded-md bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
      >
        Continue shopping
      </Link>
    </section>
  );
}