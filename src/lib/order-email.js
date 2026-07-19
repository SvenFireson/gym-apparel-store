import { resend } from "@/lib/resend";

function formatCurrency(amountInCents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createItemsHtml(items) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 18px 0; border-bottom: 1px solid #27272a;">
            <p style="margin: 0; color: #ffffff; font-weight: 700;">
              ${escapeHtml(item.productName)}
            </p>

            <p style="margin: 6px 0 0; color: #a1a1aa; font-size: 14px;">
              ${escapeHtml(item.color)} / ${escapeHtml(item.size)}
            </p>

            <p style="margin: 6px 0 0; color: #a1a1aa; font-size: 14px;">
              Quantity: ${item.quantity}
            </p>
          </td>

          <td
            style="
              padding: 18px 0;
              border-bottom: 1px solid #27272a;
              text-align: right;
              color: #ffffff;
              font-weight: 700;
            "
          >
            ${formatCurrency(item.lineTotalInCents)}
          </td>
        </tr>
      `,
    )
    .join("");
}

export async function sendOrderConfirmationEmail(order) {
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

  const itemsHtml = createItemsHtml(order.items);

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
              max-width: 640px;
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
                Payment confirmed
              </p>

              <h1
                style="
                  margin: 12px 0 0;
                  color: #ffffff;
                  font-size: 30px;
                  line-height: 1.2;
                "
              >
                Thank you for your order
              </h1>

              <p
                style="
                  margin: 18px 0 0;
                  color: #d4d4d8;
                  font-size: 16px;
                  line-height: 1.7;
                "
              >
                Hi ${escapeHtml(customerName)}, your payment was successful.
                We’ve received your order and will begin preparing it.
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
                      PROCESSING
                    </td>
                  </tr>
                </table>
              </div>

              <h2
                style="
                  margin: 32px 0 8px;
                  color: #ffffff;
                  font-size: 20px;
                "
              >
                Order summary
              </h2>

              <table
                role="presentation"
                style="width: 100%; border-collapse: collapse;"
              >
                ${itemsHtml}
              </table>

              <table
                role="presentation"
                style="
                  width: 100%;
                  margin-top: 24px;
                  border-collapse: collapse;
                "
              >
                <tr>
                  <td style="padding: 6px 0; color: #a1a1aa;">
                    Subtotal
                  </td>

                  <td
                    style="
                      padding: 6px 0;
                      text-align: right;
                      color: #ffffff;
                    "
                  >
                    ${formatCurrency(order.subtotalInCents)}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 6px 0; color: #a1a1aa;">
                    Shipping
                  </td>

                  <td
                    style="
                      padding: 6px 0;
                      text-align: right;
                      color: #ffffff;
                    "
                  >
                    ${
                      order.shippingInCents === 0
                        ? "Free"
                        : formatCurrency(order.shippingInCents)
                    }
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding-top: 16px;
                      color: #ffffff;
                      font-size: 18px;
                      font-weight: 700;
                    "
                  >
                    Total
                  </td>

                  <td
                    style="
                      padding-top: 16px;
                      text-align: right;
                      color: #ffffff;
                      font-size: 18px;
                      font-weight: 700;
                    "
                  >
                    ${formatCurrency(order.totalInCents)}
                  </td>
                </tr>
              </table>

              <div
                style="
                  margin-top: 32px;
                  padding: 20px;
                  border: 1px solid #27272a;
                  border-radius: 12px;
                "
              >
                <h2
                  style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 18px;
                  "
                >
                  Shipping address
                </h2>

                <p
                  style="
                    margin: 12px 0 0;
                    color: #a1a1aa;
                    font-size: 15px;
                    line-height: 1.7;
                  "
                >
                  ${escapeHtml(order.firstName)}
                  ${escapeHtml(order.lastName)}<br>
                  ${escapeHtml(order.addressLine1)}<br>
                  ${
                    order.addressLine2
                      ? `${escapeHtml(order.addressLine2)}<br>`
                      : ""
                  }
                  ${escapeHtml(order.city)},
                  ${escapeHtml(order.state)}
                  ${escapeHtml(order.postalCode)}<br>
                  ${escapeHtml(order.country)}
                </p>
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
    subject: `Order confirmed — ${order.orderNumber}`,
    html,
  });

  if (error) {
  console.error("Resend order email error:", error);

  throw new Error(
    error.message ||
      JSON.stringify(error) ||
      "Order confirmation email could not be sent.",
  );
}

  return data;
}