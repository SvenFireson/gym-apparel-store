import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  try {
    const body = await request.json();
    const orderId = body.orderId;

    if (!orderId || typeof orderId !== "string") {
      return Response.json(
        { error: "A valid order ID is required." },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return Response.json(
        { error: "Order not found." },
        { status: 404 },
      );
    }

    if (order.status !== "PENDING") {
      return Response.json(
        { error: "This order is no longer awaiting payment." },
        { status: 400 },
      );
    }

    if (order.stripeCheckoutSessionId) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        order.stripeCheckoutSessionId,
      );

      if (existingSession.url && existingSession.status === "open") {
        return Response.json({
          url: existingSession.url,
        });
      }
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,

      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: item.unitPriceInCents,
          product_data: {
            name: item.productName,
            description: `${item.size} · ${item.color}`,
            images: item.imageUrl
              ? [`${appUrl}${item.imageUrl}`]
              : undefined,
          },
        },
      })),

      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },

      success_url:
        `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?cancelled=true`,
    });

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        stripeCheckoutSessionId: session.id,
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return Response.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Failed to create Stripe Checkout Session:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start payment.",
      },
      { status: 500 },
    );
  }
}
