"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email.trim().toLowerCase(),
    },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/account");
  }
}

function dollarsToCents(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

export async function createCoupon(formData) {
  await requireAdmin();

  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase();

  const description =
    String(formData.get("description") || "").trim() || null;

  const discountType = String(
    formData.get("discountType") || "",
  );

  const rawDiscountValue = Number(
    formData.get("discountValue"),
  );

  const minimumSpendCents = dollarsToCents(
    formData.get("minimumSpend"),
  );

  const rawMaximumUses = String(
    formData.get("maximumUses") || "",
  ).trim();

  const startsAtValue = String(
    formData.get("startsAt") || "",
  ).trim();

  const expiresAtValue = String(
    formData.get("expiresAt") || "",
  ).trim();

  if (!code) {
    redirect("/admin/coupons?error=Coupon+code+is+required");
  }

  if (
    discountType !== "PERCENTAGE" &&
    discountType !== "FIXED_AMOUNT"
  ) {
    redirect("/admin/coupons?error=Invalid+discount+type");
  }

  if (
    !Number.isFinite(rawDiscountValue) ||
    rawDiscountValue <= 0
  ) {
    redirect(
      "/admin/coupons?error=Discount+value+must+be+greater+than+zero",
    );
  }

  if (
    discountType === "PERCENTAGE" &&
    rawDiscountValue > 100
  ) {
    redirect(
      "/admin/coupons?error=Percentage+discount+cannot+exceed+100",
    );
  }

  if (minimumSpendCents === null) {
    redirect(
      "/admin/coupons?error=Minimum+spend+must+be+a+valid+amount",
    );
  }

  let maximumUses = null;

  if (rawMaximumUses) {
    maximumUses = Number(rawMaximumUses);

    if (
      !Number.isInteger(maximumUses) ||
      maximumUses < 1
    ) {
      redirect(
        "/admin/coupons?error=Maximum+uses+must+be+a+positive+whole+number",
      );
    }
  }

  const startsAt = startsAtValue
    ? new Date(startsAtValue)
    : null;

  const expiresAt = expiresAtValue
    ? new Date(expiresAtValue)
    : null;

  if (startsAt && Number.isNaN(startsAt.getTime())) {
    redirect("/admin/coupons?error=Invalid+start+date");
  }

  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    redirect("/admin/coupons?error=Invalid+expiry+date");
  }

  if (
    startsAt &&
    expiresAt &&
    expiresAt <= startsAt
  ) {
    redirect(
      "/admin/coupons?error=Expiry+date+must+be+after+the+start+date",
    );
  }

  const discountValue =
    discountType === "FIXED_AMOUNT"
      ? Math.round(rawDiscountValue * 100)
      : Math.round(rawDiscountValue);

  try {
    await prisma.coupon.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        minimumSpendCents,
        maximumUses,
        startsAt,
        expiresAt,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      redirect(
        "/admin/coupons?error=A+coupon+with+that+code+already+exists",
      );
    }

    console.error("Coupon creation failed:", error);

    redirect(
      "/admin/coupons?error=Coupon+could+not+be+created",
    );
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?success=Coupon+created");
}

export async function toggleCoupon(formData) {
  await requireAdmin();

  const couponId = String(formData.get("couponId") || "");

  if (!couponId) {
    redirect("/admin/coupons?error=Coupon+ID+is+missing");
  }

  const coupon = await prisma.coupon.findUnique({
    where: {
      id: couponId,
    },
    select: {
      isActive: true,
    },
  });

  if (!coupon) {
    redirect("/admin/coupons?error=Coupon+not+found");
  }

  await prisma.coupon.update({
    where: {
      id: couponId,
    },
    data: {
      isActive: !coupon.isActive,
    },
  });

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?success=Coupon+updated");
}
