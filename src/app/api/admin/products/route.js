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

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        { error: "You must be signed in." },
        { status: 401 },
      );
    }

    const admin = await prisma.user.findUnique({
      where: {
        email: session.user.email.trim().toLowerCase(),
      },
      select: {
        role: true,
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return Response.json(
        { error: "Administrator access is required." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const description = body.description?.trim();
    const category = body.category;
    const imageUrl = body.imageUrl?.trim();
    const imagePublicId = body.imagePublicId?.trim() || null;
    const imageAlt = body.imageAlt?.trim() || name;
    const priceInCents = Number(body.priceInCents);
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
        { error: "Add at least one product variant." },
        { status: 400 },
      );
    }

    const cleanedVariants = variants.map((variant) => ({
      sku: variant.sku?.trim().toUpperCase(),
      size:
  category === "ACCESSORIES"
    ? "ONE SIZE"
    : variant.size?.trim().toUpperCase(),
      color: variant.color?.trim(),
      stock: Number(variant.stock),
    }));

    const hasInvalidVariant = cleanedVariants.some(
      (variant) =>
        !variant.sku ||
        !variant.size ||
        !variant.color ||
        !Number.isInteger(variant.stock) ||
        variant.stock < 0,
    );

    if (hasInvalidVariant) {
      return Response.json(
        {
          error:
            "Every variant requires a SKU, size, color, and valid stock quantity.",
        },
        { status: 400 },
      );
    }

    const duplicateSkus = new Set();

    for (const variant of cleanedVariants) {
      if (duplicateSkus.has(variant.sku)) {
        return Response.json(
          { error: `Duplicate SKU: ${variant.sku}` },
          { status: 400 },
        );
      }

      duplicateSkus.add(variant.sku);
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

    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { name }],
      },
      select: {
        id: true,
      },
    });

    if (existingProduct) {
      return Response.json(
        {
          error:
            "A product with this name or URL slug already exists.",
        },
        { status: 409 },
      );
    }

    const existingSku = await prisma.productVariant.findFirst({
      where: {
        sku: {
          in: cleanedVariants.map((variant) => variant.sku),
        },
      },
      select: {
        sku: true,
      },
    });

    if (existingSku) {
      return Response.json(
        {
          error: `The SKU ${existingSku.sku} is already in use.`,
        },
        { status: 409 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        priceInCents,
        isActive: body.isActive !== false,

            images: {
      create: {
        url: imageUrl,
        publicId: imagePublicId,
        altText: imageAlt,
        position: 0,
      },
    },

        variants: {
          create: cleanedVariants,
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    return Response.json(
      {
        message: "Product created successfully.",
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create admin product:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the product.",
      },
      { status: 500 },
    );
  }
}