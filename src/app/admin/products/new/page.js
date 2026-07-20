"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const emptyVariant = {
  sku: "",
  size: "",
  color: "",
  stock: 0,
};

export default function NewProductPage() {
  const router = useRouter();

  const [variants, setVariants] = useState([{ ...emptyVariant }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState(""); 

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

  function removeVariant(index) {
    setVariants((currentVariants) =>
      currentVariants.filter((_, variantIndex) => variantIndex !== index),
    );
  }
  async function handleImageUpload(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  setIsUploading(true);
  setErrorMessage("");

  try {
    const formData = new FormData();
    formData.append("file", file);
console.log({
  category: formData.get("category"),
  variants,
});
    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to upload image.");
    }

    setImageUrl(data.image.url);
  } catch (error) {
    console.error("Failed to upload image:", error);

    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Unable to upload image.",
    );
  } finally {
    setIsUploading(false);
  }
}

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData(event.currentTarget);

      const price = Number(formData.get("price"));
      const selectedCategory = formData.get("category");

      const submittedVariants = variants.map((variant) => ({
        ...variant,
        size:
          selectedCategory === "ACCESSORIES"
            ? "ONE SIZE"
            : variant.size,
      }));

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          slug: formData.get("slug"),
          description: formData.get("description"),
          category: selectedCategory,
          imageUrl,
          imageAlt: formData.get("imageAlt"),
          priceInCents: Math.round(price * 100),
          isActive: formData.get("isActive") === "on",
          variants: submittedVariants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create product.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Failed to create product:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create product.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>

          <h1 className="mt-3 text-4xl font-bold">Add product</h1>

          <p className="mt-4 text-gray-400">
            Create a product with its first image and inventory variants.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="text-sm font-semibold underline"
        >
          Back to products
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-8"
      >
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
                placeholder="leave blank to generate automatically"
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
              required
              value={category}
              onChange={(event) => {
              const nextCategory = event.target.value;

              setCategory(nextCategory);

                if (nextCategory === "ACCESSORIES") {
                  setVariants((currentVariants) =>
                currentVariants.map((variant) => ({
                ...variant,
                size: "ONE SIZE",
                })),
                );
            }
  }       }
  className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
>
  <option value="" disabled>
    Select category
  </option>
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
              required
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm text-gray-300">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked
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
    htmlFor="imageFile"
    className="block text-sm font-medium text-gray-300"
  >
    Product image
  </label>

  <input
    id="imageFile"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={handleImageUpload}
    required={!imageUrl}
    className="mt-2 block w-full text-sm text-gray-300"
  />

  {isUploading ? (
    <p className="mt-2 text-sm text-gray-400">
      Uploading image...
    </p>
  ) : null}

  {imageUrl ? (
    <div className="mt-4">
     <div className="relative h-64 w-full overflow-hidden rounded-xl">
      <Image
        src={imageUrl}
        alt="Product preview"
        fill
        className="object-cover"
      />
</div>

      <p className="mt-2 break-all text-xs text-gray-500">
        {imageUrl}
      </p>
    </div>
  ) : null}
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
                Add sizes, colors, SKUs, and starting stock.
              </p>
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="rounded-md border border-gray-700 px-4 py-2 text-sm font-semibold hover:border-gray-500"
            >
              Add variant
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {variants.map((variant, index) => (
              <div
                key={index}
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
                  value={
                  category === "ACCESSORIES"
                  ? "ONE SIZE"
                  : variant.size
                }
                  onChange={(event) =>
                  updateVariant(index, "size", event.target.value)
                }
                placeholder={
                  category === "ACCESSORIES"
                  ? "One size"
                  : "Size"
                }
                  required
                  readOnly={category === "ACCESSORIES"}
                  className="rounded-md border border-gray-700 bg-black px-4 py-3 text-white read-only:text-gray-400"
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
                  onClick={() => removeVariant(index)}
                  className="text-sm font-semibold text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
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

        <button
          type="submit"
          disabled={isSubmitting || isUploading || !imageUrl}
          className="w-full rounded-md bg-white px-6 py-4 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading
            ? "Uploading image..."
            : isSubmitting
            ? "Creating product..."
            : "Create product"}
        </button>
      </form>
    </section>
  );
}