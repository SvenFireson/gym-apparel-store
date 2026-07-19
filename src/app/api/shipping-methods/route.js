import { prisma } from "@/lib/prisma";

export async function GET() {
  const methods = await prisma.shippingMethod.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  const shippingMethods = methods.map((method) => ({
    id: method.id,
    name: method.name,
    code: method.code,
    description: method.description,
    estimatedMinDays: method.estimatedMinDays,
    estimatedMaxDays: method.estimatedMaxDays,
    priceInCents: method.priceInCents,
    freeAboveCents: method.freeAboveCents,
  }));

  return Response.json(shippingMethods);
}