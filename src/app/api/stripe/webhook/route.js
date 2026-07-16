import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return Response.json(
      { error: "Stripe signature is missing." },
      { status: 400 },
    );
  }

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not defined.");

    return Response.json(
      { error: "Webhook secret is not configured." },
      { status: 500 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return Response.json(
      { error: "Invalid webhook signature." },
      { status: 400 },
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error(
          "Stripe Checkout Session does not contain an orderId.",
          session.id,
        );

        return Response.json(
          { error: "Order metadata is missing." },
          { status: 400 },
        );
      }

      if (session.payment_status === "paid") {
        await prisma.order.updateMany({
          where: {
            id: orderId,
            status: "PENDING",
          },
          data: {
            status: "PAID",
            stripeCheckoutSessionId: session.id,
          },
        });
      }
    }
    if (event.type === "checkout.session.expired") {
  const session = event.data.object;
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error(
      "Expired Stripe session does not contain an orderId.",
      session.id,
    );

    return Response.json(
      { error: "Order metadata is missing." },
      { status: 400 },
    );
  }

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        status: "PENDING",
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return;
    }

    for (const item of order.items) {
      if (!item.productVariantId) {
        continue;
      }

      await tx.productVariant.update({
        where: {
          id: item.productVariantId,
        },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "CANCELLED",
      },
    });
  });
}

    return Response.json({ received: true });
  } catch (error) {
    console.error("Failed to process Stripe webhook:", error);

    return Response.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
