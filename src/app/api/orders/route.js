import { prisma } from "@/lib/prisma";
import { auth } from "@/auth/auth";
import { validateCoupon } from "@/lib/coupons";

function createOrderNumber() {
  const timestamp = Date.now().toString();
  const randomPart = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `IW-${timestamp}-${randomPart}`;
}

export async function POST(request) {
  try {
   const body = await request.json();
   const couponCode =
  typeof body.couponCode === "string"
    ? body.couponCode.trim().toUpperCase()
    : null;

    const email = body.email?.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const addressLine1 = body.addressLine1?.trim();
    const city = body.city?.trim();
    const state = body.state?.trim();
    const postalCode = body.postalCode?.trim();
    const country = body.country?.trim();
        const session = await auth();

console.log("ORDER SESSION:", session);

let userId = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email.toLowerCase(),
        },
        select: {
          id: true,
        },
      });

      userId = user?.id ?? null;
    }

    if (
      !email ||
      !firstName ||
      !lastName ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return Response.json(
        { error: "Please complete all required checkout fields." },
        { status: 400 },
      );
    }
    if (!emailPattern.test(email)) {
  return Response.json(
    { error: "Please enter a valid email address." },
    { status: 400 },
  );
}

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return Response.json(
        { error: "Your cart is empty." },
        { status: 400 },
      );
    }

    const invalidItem = body.items.some(
      (item) =>
        !item ||
        typeof item.variantId !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1,
    );

    if (invalidItem) {
      return Response.json(
        { error: "One or more cart items are invalid." },
        { status: 400 },
      );
    }

    const requestedItems = body.items;
    const variantIds = [...new Set(requestedItems.map((item) => item.variantId))];

    const variants = await prisma.productVariant.findMany({
      where: {
        id: {
          in: variantIds,
        },
        product: {
          isActive: true,
        },
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: {
                position: "asc",
              },
              take: 1,
            },
          },
        },
      },
    });

    if (variants.length !== variantIds.length) {
      return Response.json(
        { error: "One or more products are no longer available." },
        { status: 400 },
      );
    }

    const variantMap = new Map(
      variants.map((variant) => [variant.id, variant]),
    );

    const orderItems = requestedItems.map((item) => {
      const variant = variantMap.get(item.variantId);

      if (!variant) {
        throw new Error(`Variant ${item.variantId} was not found.`);
      }

      if (item.quantity > variant.stock) {
        throw new Error(
          `${variant.product.name} only has ${variant.stock} item(s) available.`,
        );
      }

      const lineTotalInCents =
        variant.product.priceInCents * item.quantity;

      return {
        productVariantId: variant.id,
        productName: variant.product.name,
        productSlug: variant.product.slug,
        imageUrl: variant.product.images[0]?.url ?? null,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        unitPriceInCents: variant.product.priceInCents,
        quantity: item.quantity,
        lineTotalInCents,
      };
    });

    const subtotalInCents = orderItems.reduce(
      (total, item) => total + item.lineTotalInCents,
      0,
    );

    let appliedCoupon = null;
let discountInCents = 0;

if (couponCode) {
  const couponResult = await validateCoupon({
    code: couponCode,
    subtotalInCents,
  });

  if (!couponResult.valid) {
    return Response.json(
      {
        error:
          couponResult.message ||
          "This coupon could not be applied.",
      },
      {
        status: 400,
      },
    );
  }

  appliedCoupon = couponResult.coupon;
  discountInCents = couponResult.discountInCents;
}

const shippingInCents = 0;

const totalInCents = Math.max(
  subtotalInCents -
    discountInCents +
    shippingInCents,
  0,
);

    const order = await prisma.$transaction(async (tx) => {
  for (const item of requestedItems) {
    const variant = variantMap.get(item.variantId);

    if (!variant) {
      throw new Error(`Variant ${item.variantId} was not found.`);
    }

    const updatedVariant = await tx.productVariant.updateMany({
      where: {
        id: variant.id,
        stock: {
          gte: item.quantity,
        },
      },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });

    if (updatedVariant.count !== 1) {
      throw new Error(
        `${variant.product.name} no longer has enough stock available.`,
      );
    }
  }
console.log("ORDER USER ID:", userId);
  return tx.order.create({
    data: {
      orderNumber: createOrderNumber(),
      userId,
      email,
      firstName,
      lastName,
      phone: body.phone?.trim() || null,
      addressLine1,
      addressLine2: body.addressLine2?.trim() || null,
      city,
      state,
      postalCode,
      country,
     subtotalInCents,
      discountInCents,
      shippingInCents,
      totalInCents,
      couponId: appliedCoupon?.id || null,
      couponCode: appliedCoupon?.code || null,
      items: {
        create: orderItems,
      },
    },
    select: {
  id: true,
  orderNumber: true,
  status: true,
  subtotalInCents: true,
  discountInCents: true,
  totalInCents: true,
  couponCode: true,
},
  });
});

    return Response.json(
      {
        message: "Order created successfully.",
        order,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create order:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create the order.";

    return Response.json({ error: message }, { status: 500 });
  }
}