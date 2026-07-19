import { resend } from "@/lib/resend";

const statusContent = {
  PROCESSING: {
    label: "Order processing",
    heading: "We’re preparing your order",
    message:
      "Your payment has been confirmed and the IRONWEAR team is preparing your order.",
  },
  SHIPPED: {
    label: "Order shipped",
    heading: "Your order is on its way",
    message:
      "Your IRONWEAR order has been shipped and is now on its way to you.",
  },
  DELIVERED: {
    label: "Order delivered",
    heading: "Your order has been delivered",
    message:
      "Your IRONWEAR order has been marked as delivered. We hope you enjoy it.",
  },
  CANCELLED: {
    label: "Order cancelled",
    heading: "Your order has been cancelled",
    message:
      "Your IRONWEAR order has been cancelled. Contact us if you believe this was a mistake.",
  },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(amountInCents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}

export async function sendOrderStatusEmail(order) {
  const content = statusContent[order.status];

  if (!content) {
    return null;
  }

  const from =
    process.env.RESEND_FROM_EMAIL ||
    "IRONWEAR <onboarding@resend.dev>";

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const orderUrl = order.userId
    ? `${siteUrl}/account/orders/${order.id}`
    : siteUrl;

  const customerName =
    order.firstName?.trim() || "IRONWEAR customer";

  const html = `
    <!doctype html>
    <html>
      <body
        style="
          margin: 0;
          padding: 0;
          background: #090909;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <div style="padding: 32px 16px;">
          <div
            style="
              max-width: 620px;
              margin: 0 auto;
              overflow: hidden;
              border: 1px solid #27272a;
              border-radius: 16px;
              background: #111111;
            "
          >
            <div
              style="
                padding: 32px;
                border-bottom: 1px solid #27272a;
                background: #050505;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #ffffff;
                  font-size: 26px;
                  font-weight: 800;
                  letter-spacing: -1px;
                "
              >
                IRONWEAR
              </p>

              <p
                style="
                  margin: 10px 0 0;
                  color: #71717a;
                  font-size: 12px;
                  letter-spacing: 3px;
                  text-transform: uppercase;
                "
              >
                Focus. Discipline. Progress.
              </p>
            </div>

            <div style="padding: 32px;">
              <p
                style="
                  margin: 0;
                  color: #94a3b8;
                  font-size: 12px;
                  font-weight: 700;
                  letter-spacing: 3px;
                  text-transform: uppercase;
                "
              >
                ${escapeHtml(content.label)}
              </p>

              <h1
                style="
                  margin: 12px 0 0;
                  color: #ffffff;
                  font-size: 30px;
                  line-height: 1.2;
                "
              >
                ${escapeHtml(content.heading)}
              </h1>

              <p
                style="
                  margin: 18px 0 0;
                  color: #d4d4d8;
                  font-size: 16px;
                  line-height: 1.7;
                "
              >
                Hi ${escapeHtml(customerName)}, ${escapeHtml(content.message)}
              </p>

              <div
                style="
                  margin-top: 28px;
                  padding: 20px;
                  border: 1px solid #27272a;
                  border-radius: 12px;
                  background: #09090b;
                "
              >
                <table
                  role="presentation"
                  style="width: 100%; border-collapse: collapse;"
                >
                  <tr>
                    <td style="color: #71717a; font-size: 14px;">
                      Order number
                    </td>

                    <td
                      style="
                        text-align: right;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 700;
                      "
                    >
                      ${escapeHtml(order.orderNumber)}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding-top: 12px;
                        color: #71717a;
                        font-size: 14px;
                      "
                    >
                      Status
                    </td>

                    <td
                      style="
                        padding-top: 12px;
                        text-align: right;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 700;
                      "
                    >
                      ${escapeHtml(order.status)}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding-top: 12px;
                        color: #71717a;
                        font-size: 14px;
                      "
                    >
                      Total
                    </td>

                    <td
                      style="
                        padding-top: 12px;
                        text-align: right;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 700;
                      "
                    >
                      ${formatCurrency(order.totalInCents)}
                    </td>
                  </tr>
                </table>
              </div>

              ${
                order.userId
                  ? `
                    <div style="margin-top: 32px; text-align: center;">
                      <a
                        href="${orderUrl}"
                        style="
                          display: inline-block;
                          padding: 14px 24px;
                          border-radius: 8px;
                          background: #ffffff;
                          color: #000000;
                          font-size: 14px;
                          font-weight: 700;
                          text-decoration: none;
                        "
                      >
                        View your order
                      </a>
                    </div>
                  `
                  : ""
              }
            </div>

            <div
              style="
                padding: 24px 32px;
                border-top: 1px solid #27272a;
                background: #090909;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #71717a;
                  font-size: 13px;
                  line-height: 1.6;
                  text-align: center;
                "
              >
                Thank you for choosing IRONWEAR.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const { data, error } = await resend.emails.send({
    from,
    to: order.email,
    subject: `${content.heading} — ${order.orderNumber}`,
    html,
  });

  if (error) {
    console.error("Resend status email error:", error);

    throw new Error(
      error.message ||
        JSON.stringify(error) ||
        "Order status email could not be sent.",
    );
  }

  return data;
}
