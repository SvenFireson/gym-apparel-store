"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrderStatusForm({
  orderId,
  currentStatus,
}) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const responseText = await response.text();

      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            "The server returned an invalid response.",
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update order status.",
        );
      }

      setSuccessMessage("Order status updated.");
      router.refresh();
    } catch (error) {
      console.error("Order status update failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update order status.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 border-t border-gray-800 pt-6"
    >
      <label
        htmlFor="orderStatus"
        className="block text-sm font-medium text-gray-300"
      >
        Order status
      </label>

      <select
        id="orderStatus"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
      >
        {statuses.map((statusOption) => (
          <option key={statusOption} value={statusOption}>
            {statusOption}
          </option>
        ))}
      </select>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-3 text-sm text-green-400">
          {successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={
          isSubmitting || status === currentStatus
        }
        className="mt-4 w-full rounded-md bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Updating..." : "Update status"}
      </button>
    </form>
  );
}