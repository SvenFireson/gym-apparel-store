"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({
  productId,
  productName,
}) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${productName}"?\n\nProducts with order history will be hidden instead of permanently deleted.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "DELETE",
        },
      );

      const responseText = await response.text();

      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error("The server returned an invalid response.");
        }
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete product.");
      }

      window.alert(data.message || "Product removed.");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete product:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete product.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? "Removing..." : "Delete"}
      </button>

      {errorMessage ? (
        <p className="mt-2 max-w-xs text-xs text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}