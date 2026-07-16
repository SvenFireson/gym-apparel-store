"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const emptyVariant = {
  id: null,
  sku: "",
  size: "",
  color: "",
  stock: 0,
};

export default function EditProductForm({ initialProduct }) {
  const router = useRouter();

  const [variants, setVariants] = useState(
    initialProduct.variants.length > 0
      ? initialProduct.variants
      : [{ ...emptyVariant }],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function updateVariant(index, field, value) {
    setVariants((currentVariants) =>
      currentVariants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: field === "stock" ? Number(value) : value,
            }
          : variant,
      ),
    );
  }

  function addVariant() {
    setVariants((currentVariants) => [
      ...currentVariants,
      { ...emptyVariant },
    ]);
  }

  function removeUnsavedVariant(index) {
    const variant = variants[index];

    if (variant?.id) {
      setErrorMessage(
        "Existing variants cannot be removed yet. Set the stock to 0 instead.",
      );
      return;
    }

    setVariants((currentVariants) =>
      currentVariants.filter(
        (_, variantIndex) => variantIndex !== index,
      ),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const price = Number(formData.get("price"));

      const response = await fetch(
        `/api/admin/products/${initialProduct.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.get("name"),
            slug: formData.get("slug"),
            description: formData.get("description"),
            category: formData.get("category"),
            imageUrl: formData.get("imageUrl"),
            imageAlt: formData.get("imageAlt"),
            priceInCents: Math.round(price * 100),
            isActive: formData.get("isActive") === "on",
            variants,
          }),
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
        throw new Error(data.error || "Unable to update product.");
      }

      setSuccessMessage("Product updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("Failed to update product:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update product.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-8">
      <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
        <h2 className="text-xl font-semibold">Product details</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300"
            >
              Product name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              defaultValue={initialProduct.name}
              required
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-300"
            >
              URL slug
            </label>

            <input
              id="slug"
              name="slug"
              type="text"
              defaultValue={initialProduct.slug}
              required
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-300"
            >
              Category
            </label>

            <select
              id="category"
              name="category"
              defaultValue={initialProduct.category}
              required
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            >
              <option value="TOPS">Tops</option>
              <option value="BOTTOMS">Bottoms</option>
              <option value="OUTERWEAR">Outerwear</option>
              <option value="ACCESSORIES">Accessories</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-300"
            >
              Price
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={initialProduct.price}
              required
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={6}
            defaultValue={initialProduct.description}
            required
            className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <label className="mt-6 flex items-center gap-3 text-sm text-gray-300">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={initialProduct.isActive}
            className="h-4 w-4"
          />

          Product is active and visible in the store
        </label>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
        <h2 className="text-xl font-semibold">Product image</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-300"
            >
              Image URL
            </label>

            <input
            id="imageUrl"
            name="imageUrl"
            type="text"
              defaultValue={initialProduct.imageUrl}
              required
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="imageAlt"
              className="block text-sm font-medium text-gray-300"
            >
              Image alt text
            </label>

            <input
              id="imageAlt"
              name="imageAlt"
              type="text"
              defaultValue={initialProduct.imageAlt}
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Variants</h2>

            <p className="mt-2 text-sm text-gray-400">
              Update SKUs, sizes, colors, and stock levels.
            </p>
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm font-semibold transition hover:border-gray-500"
          >
            Add variant
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.id ?? `new-${index}`}
              className="grid gap-4 rounded-xl border border-gray-800 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_140px_auto]"
            >
              <input
                type="text"
                value={variant.sku}
                onChange={(event) =>
                  updateVariant(index, "sku", event.target.value)
                }
                placeholder="SKU"
                required
                className="rounded-md border border-gray-700 bg-black px-4 py-3 text-white"
              />

              <input
                type="text"
                value={variant.size}
                onChange={(event) =>
                  updateVariant(index, "size", event.target.value)
                }
                placeholder="Size"
                required
                className="rounded-md border border-gray-700 bg-black px-4 py-3 text-white"
              />

              <input
                type="text"
                value={variant.color}
                onChange={(event) =>
                  updateVariant(index, "color", event.target.value)
                }
                placeholder="Color"
                required
                className="rounded-md border border-gray-700 bg-black px-4 py-3 text-white"
              />

              <input
                type="number"
                min="0"
                step="1"
                value={variant.stock}
                onChange={(event) =>
                  updateVariant(index, "stock", event.target.value)
                }
                placeholder="Stock"
                required
                className="rounded-md border border-gray-700 bg-black px-4 py-3 text-white"
              />

              <button
                type="button"
                disabled={variants.length === 1}
                onClick={() => removeUnsavedVariant(index)}
                className="text-sm font-semibold text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {variant.id ? "Set stock to 0" : "Remove"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-red-300"
        >
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div
          role="status"
          className="rounded-md border border-green-900 bg-green-950/40 px-4 py-3 text-green-300"
        >
          {successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-white px-6 py-4 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving changes..." : "Save changes"}
      </button>
    </form>
  );
}