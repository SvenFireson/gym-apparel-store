import { prisma } from "@/lib/prisma";

export function calculateCouponDiscount({
  coupon,
  subtotalInCents,
}) {
  if (coupon.discountType === "PERCENTAGE") {
    const discount = Math.round(
      subtotalInCents * (coupon.discountValue / 100),
    );

    return Math.min(discount, subtotalInCents);
  }

  if (coupon.discountType === "FIXED_AMOUNT") {
    return Math.min(
      coupon.discountValue,
      subtotalInCents,
    );
  }

  return 0;
}

export async function validateCoupon({
  code,
  subtotalInCents,
}) {
  const normalizedCode = String(code || "")
    .trim()
    .toUpperCase();

  if (!normalizedCode) {
    return {
      valid: false,
      message: "Enter a coupon code.",
    };
  }

  if (
    !Number.isInteger(subtotalInCents) ||
    subtotalInCents < 0
  ) {
    return {
      valid: false,
      message: "Invalid order subtotal.",
    };
  }

  const coupon = await prisma.coupon.findUnique({
    where: {
      code: normalizedCode,
    },
  });

  if (!coupon) {
    return {
      valid: false,
      message: "Coupon code was not found.",
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      message: "This coupon is inactive.",
    };
  }

  const now = new Date();

  if (coupon.startsAt && coupon.startsAt > now) {
    return {
      valid: false,
      message: "This coupon is not active yet.",
    };
  }

  if (coupon.expiresAt && coupon.expiresAt <= now) {
    return {
      valid: false,
      message: "This coupon has expired.",
    };
  }

  if (
    coupon.maximumUses !== null &&
    coupon.timesUsed >= coupon.maximumUses
  ) {
    return {
      valid: false,
      message: "This coupon has reached its usage limit.",
    };
  }

  if (subtotalInCents < coupon.minimumSpendCents) {
    return {
      valid: false,
      message: `This coupon requires a minimum spend of ${formatCurrency(
        coupon.minimumSpendCents,
      )}.`,
    };
  }

  const discountInCents = calculateCouponDiscount({
    coupon,
    subtotalInCents,
  });

  if (discountInCents <= 0) {
    return {
      valid: false,
      message: "This coupon does not apply a valid discount.",
    };
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    discountInCents,
    message: `${coupon.code} applied successfully.`,
  };
}

function formatCurrency(amountInCents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}