import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusEmail } from "@/lib/order-status-email";

const allowedStatuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

async function getAdminUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      email: session.user.email.trim().toLowerCase(),
    },
    select: {
      id: true,
      role: true,
    },
  });
}

export async function PATCH(request, { params }) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return Response.json(
        { error: "You must be signed in." },
        { status: 401 },
      );
    }

    if (admin.role !== "ADMIN") {
      return Response.json(
        { error: "Administrator access is required." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const status = body.status;

    if (!allowedStatuses.includes(status)) {
      return Response.json(
        { error: "Invalid order status." },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingOrder) {
      return Response.json(
        { error: "Order not found." },
        { status: 404 },
      );
    }

    if (
      existingOrder.status === "PAID" &&
      status === "PENDING"
    ) {
      return Response.json(
        {
          error:
            "A paid order cannot be changed back to pending.",
        },
        { status: 400 },
      );
    }

    const order = await prisma.order.update({
  where: {
    id,
  },
  data: {
    status,
  },
  select: {
    id: true,
    orderNumber: true,
    status: true,
    userId: true,
    email: true,
    firstName: true,
    totalInCents: true,
  },
});
const emailStatuses = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusActuallyChanged =
  existingOrder.status !== order.status;

if (
  statusActuallyChanged &&
  emailStatuses.includes(order.status)
) {
  try {
    await sendOrderStatusEmail(order);

    console.log(
      `Order status email sent for ${order.orderNumber}: ${order.status}`,
    );
  } catch (emailError) {
    console.error(
      "Order status email failed:",
      emailError,
    );
  }
}

    return Response.json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Failed to update order status:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the order status.",
      },
      { status: 500 },
    );
  }
}