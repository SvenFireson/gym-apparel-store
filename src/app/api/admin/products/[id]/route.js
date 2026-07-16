import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

const validCategories = [
  "TOPS",
  "BOTTOMS",
  "OUTERWEAR",
  "ACCESSORIES",
];

function createSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        images: {
          orderBy: {
            position: "asc",
          },
        },
        variants: true,
      },
    });

    if (!existingProduct) {
      return Response.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    const name = body.name?.trim();
    const description = body.description?.trim();
    const category = body.category;
    const priceInCents = Number(body.priceInCents);
    const imageUrl = body.imageUrl?.trim();
    const imageAlt = body.imageAlt?.trim() || name;
    const isActive = body.isActive !== false;
    const variants = body.variants;

    if (!name || !description || !category) {
      return Response.json(
        {
          error:
            "Name, description, and category are required.",
        },
        { status: 400 },
      );
    }

    if (!validCategories.includes(category)) {
      return Response.json(
        { error: "The selected category is invalid." },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(priceInCents) ||
      priceInCents < 1
    ) {
      return Response.json(
        { error: "Enter a valid product price." },
        { status: 400 },
      );
    }

    if (!imageUrl) {
      return Response.json(
        { error: "A product image URL is required." },
        { status: 400 },
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return Response.json(
        { error: "The product must have at least one variant." },
        { status: 400 },
      );
    }

    const requestedSlug =
      body.slug?.trim() || createSlug(name);

    const slug = createSlug(requestedSlug);

    if (!slug) {
      return Response.json(
        { error: "Unable to generate a valid product slug." },
        { status: 400 },
      );
    }

    const cleanedVariants = variants.map((variant) => ({
      id:
        typeof variant.id === "string" && variant.id.trim()
          ? variant.id.trim()
          : null,
      sku: variant.sku?.trim().toUpperCase(),
      size: variant.size?.trim().toUpperCase(),
      color: variant.color?.trim(),
      stock: Number(variant.stock),
    }));

    const invalidVariant = cleanedVariants.some(
      (variant) =>
        !variant.sku ||
        !variant.size ||
        !variant.color ||
        !Number.isInteger(variant.stock) ||
        variant.stock < 0,
    );

    if (invalidVariant) {
      return Response.json(
        {
          error:
            "Every variant requires a SKU, size, color, and valid stock quantity.",
        },
        { status: 400 },
      );
    }

    const submittedSkus = new Set();

    for (const variant of cleanedVariants) {
      if (submittedSkus.has(variant.sku)) {
        return Response.json(
          { error: `Duplicate SKU: ${variant.sku}` },
          { status: 400 },
        );
      }

      submittedSkus.add(variant.sku);
    }

    const duplicateProduct = await prisma.product.findFirst({
      where: {
        id: {
          not: id,
        },
        OR: [
          {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
          {
            slug,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (duplicateProduct) {
      return Response.json(
        {
          error:
            "Another product already uses this name or URL slug.",
        },
        { status: 409 },
      );
    }

    const existingVariantIds = new Set(
      existingProduct.variants.map((variant) => variant.id),
    );

    const invalidVariantId = cleanedVariants.find(
      (variant) =>
        variant.id && !existingVariantIds.has(variant.id),
    );

    if (invalidVariantId) {
      return Response.json(
        {
          error:
            "One of the submitted variants does not belong to this product.",
        },
        { status: 400 },
      );
    }

    const conflictingSku =
      await prisma.productVariant.findFirst({
        where: {
          sku: {
            in: cleanedVariants.map((variant) => variant.sku),
          },
          productId: {
            not: id,
          },
        },
        select: {
          sku: true,
        },
      });

    if (conflictingSku) {
      return Response.json(
        {
          error: `The SKU ${conflictingSku.sku} is already in use.`,
        },
        { status: 409 },
      );
    }

    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: {
          id,
        },
        data: {
          name,
          slug,
          description,
          category,
          priceInCents,
          isActive,
        },
      });

      const primaryImage = existingProduct.images[0];

      if (primaryImage) {
        await tx.productImage.update({
          where: {
            id: primaryImage.id,
          },
          data: {
            url: imageUrl,
            altText: imageAlt,
            position: 0,
          },
        });
      } else {
        await tx.productImage.create({
          data: {
            productId: id,
            url: imageUrl,
            altText: imageAlt,
            position: 0,
          },
        });
      }

      for (const variant of cleanedVariants) {
        if (variant.id) {
          await tx.productVariant.update({
            where: {
              id: variant.id,
            },
            data: {
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: {
          id,
        },
        include: {
          images: {
            orderBy: {
              position: "asc",
            },
          },
          variants: {
            orderBy: [
              {
                color: "asc",
              },
              {
                size: "asc",
              },
            ],
          },
        },
      });
    });

    return Response.json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Failed to update admin product:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the product.",
      },
      { status: 500 },
    );
  }
}
export async function DELETE(request, { params }) {
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

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        variants: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!product) {
      return Response.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    const variantIds = product.variants.map((variant) => variant.id);

    const orderItemCount =
      variantIds.length === 0
        ? 0
        : await prisma.orderItem.count({
            where: {
              productVariantId: {
                in: variantIds,
              },
            },
          });

    if (orderItemCount > 0) {
      await prisma.product.update({
        where: {
          id,
        },
        data: {
          isActive: false,
        },
      });

      return Response.json({
        message:
          "This product has order history, so it was hidden instead of permanently deleted.",
        action: "hidden",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: {
          productId: id,
        },
      });

      await tx.productVariant.deleteMany({
        where: {
          productId: id,
        },
      });

      await tx.product.delete({
        where: {
          id,
        },
      });
    });

    return Response.json({
      message: "Product deleted successfully.",
      action: "deleted",
    });
  } catch (error) {
    console.error("Failed to delete admin product:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete the product.",
      },
      { status: 500 },
    );
  }
}