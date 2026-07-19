import { validateCoupon } from "@/lib/coupons";

export async function POST(request) {
  try {
    const body = await request.json();

    const code = body?.code;
    const subtotalInCents = Number(
      body?.subtotalInCents,
    );

    const result = await validateCoupon({
      code,
      subtotalInCents,
    });

    if (!result.valid) {
      return Response.json(result, {
        status: 400,
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error("Coupon validation failed:", error);

    return Response.json(
      {
        valid: false,
        message: "Coupon could not be validated.",
      },
      {
        status: 500,
      },
    );
  }
}