"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email.toLowerCase(),
    },
    select: {
      role: true,
    },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }
}

function parseMoneyToCents(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return Math.round(number * 100);
}

function parseOptionalMoneyToCents(value) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return null;
  }

  return parseMoneyToCents(value);
}

function parsePositiveInteger(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    return null;
  }

  return number;
}

function refreshShippingPages() {
  revalidatePath("/admin/shipping");
  revalidatePath("/checkout");
  revalidatePath("/api/shipping-methods");
}

export async function createShippingMethod(formData) {
  await requireAdmin();

  const name = formData.get("name")?.trim();
  const code = formData
    .get("code")
    ?.trim()
    .toUpperCase();

  const description =
    formData.get("description")?.trim() || null;

  const priceInCents = parseMoneyToCents(
    formData.get("price"),
  );

  const freeAboveCents = parseOptionalMoneyToCents(
    formData.get("freeAbove"),
  );

  const estimatedMinDays = parsePositiveInteger(
    formData.get("estimatedMinDays"),
  );

  const estimatedMaxDays = parsePositiveInteger(
    formData.get("estimatedMaxDays"),
  );

  const position = parsePositiveInteger(
    formData.get("position"),
  );

  if (!name || !code) {
    redirect(
      "/admin/shipping?error=Name and code are required.",
    );
  }

  if (priceInCents === null) {
    redirect(
      "/admin/shipping?error=Enter a valid shipping price.",
    );
  }

  if (
    estimatedMinDays === null ||
    estimatedMaxDays === null ||
    estimatedMaxDays < estimatedMinDays
  ) {
    redirect(
      "/admin/shipping?error=Enter a valid delivery range.",
    );
  }

  if (position === null) {
    redirect(
      "/admin/shipping?error=Enter a valid position.",
    );
  }

  const existingMethod =
    await prisma.shippingMethod.findUnique({
      where: {
        code,
      },
      select: {
        id: true,
      },
    });

  if (existingMethod) {
    redirect(
      "/admin/shipping?error=A shipping method with that code already exists.",
    );
  }

  await prisma.shippingMethod.create({
    data: {
      name,
      code,
      description,
      priceInCents,
      freeAboveCents,
      estimatedMinDays,
      estimatedMaxDays,
      position,
      isActive: true,
    },
  });

  refreshShippingPages();

  redirect(
    "/admin/shipping?success=Shipping method created.",
  );
}

export async function toggleShippingMethod(formData) {
  await requireAdmin();

  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    redirect(
      "/admin/shipping?error=Shipping method was not found.",
    );
  }

  const method =
    await prisma.shippingMethod.findUnique({
      where: {
        id,
      },
      select: {
        isActive: true,
      },
    });

  if (!method) {
    redirect(
      "/admin/shipping?error=Shipping method was not found.",
    );
  }

  await prisma.shippingMethod.update({
    where: {
      id,
    },
    data: {
      isActive: !method.isActive,
    },
  });

  refreshShippingPages();

  redirect(
    "/admin/shipping?success=Shipping method updated.",
  );
}

export async function updateShippingMethod(formData) {
  await requireAdmin();

  const id = formData.get("id");

  const name = formData.get("name")?.trim();
  const code = formData
    .get("code")
    ?.trim()
    .toUpperCase();

  const description =
    formData.get("description")?.trim() || null;

  const priceInCents = parseMoneyToCents(
    formData.get("price"),
  );

  const freeAboveCents = parseOptionalMoneyToCents(
    formData.get("freeAbove"),
  );

  const estimatedMinDays = parsePositiveInteger(
    formData.get("estimatedMinDays"),
  );

  const estimatedMaxDays = parsePositiveInteger(
    formData.get("estimatedMaxDays"),
  );

  const position = parsePositiveInteger(
    formData.get("position"),
  );

  if (typeof id !== "string" || !id) {
    redirect(
      "/admin/shipping?error=Shipping method was not found.",
    );
  }

  if (!name || !code) {
    redirect(
      "/admin/shipping?error=Name and code are required.",
    );
  }

  if (priceInCents === null) {
    redirect(
      "/admin/shipping?error=Enter a valid shipping price.",
    );
  }

  if (
    estimatedMinDays === null ||
    estimatedMaxDays === null ||
    estimatedMaxDays < estimatedMinDays
  ) {
    redirect(
      "/admin/shipping?error=Enter a valid delivery range.",
    );
  }

  if (position === null) {
    redirect(
      "/admin/shipping?error=Enter a valid position.",
    );
  }

  const method =
    await prisma.shippingMethod.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

  if (!method) {
    redirect(
      "/admin/shipping?error=Shipping method was not found.",
    );
  }

  const duplicateCode =
    await prisma.shippingMethod.findFirst({
      where: {
        code,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

  if (duplicateCode) {
    redirect(
      "/admin/shipping?error=Another shipping method already uses that code.",
    );
  }

  await prisma.shippingMethod.update({
    where: {
      id,
    },
    data: {
      name,
      code,
      description,
      priceInCents,
      freeAboveCents,
      estimatedMinDays,
      estimatedMaxDays,
      position,
    },
  });

  refreshShippingPages();

  redirect(
    "/admin/shipping?success=Shipping method updated.",
  );
}