import { resend } from "@/lib/resend";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim();

    if (!email) {
      return Response.json(
        {
          error: "Email is required.",
        },
        {
          status: 400,
        },
      );
    }

    const from =
      process.env.RESEND_FROM_EMAIL ||
      "IRONWEAR <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject: "IRONWEAR email test",
      html: `
        <div style="font-family: Arial, sans-serif; background: #090909; color: #ffffff; padding: 40px;">
          <h1 style="margin: 0 0 16px;">IRONWEAR</h1>
          <p style="color: #d4d4d8;">
            Your email integration is working.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend test email failed:", error);

      return Response.json(
        {
          error: error.message || "Email could not be sent.",
        },
        {
          status: 500,
        },
      );
    }

    return Response.json({
      success: true,
      emailId: data?.id,
    });
  } catch (error) {
    console.error("Test email route failed:", error);

    return Response.json(
      {
        error: "Email could not be sent.",
      },
      {
        status: 500,
      },
    );
  }
}