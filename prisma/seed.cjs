require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const products = [
  {
    name: "Core Performance Tee",
    slug: "core-performance-tee",
    description:
      "A lightweight training shirt designed for everyday strength and conditioning sessions.",
    category: "TOPS",
    priceInCents: 3499,
    images: {
      create: [
        {
          url: "/products/core-performance-tee-black.png",
          altText: "Black Core Performance Tee",
          position: 0,
        },
      ],
    },
    variants: {
      create: [
        { sku: "CPT-BLK-S", size: "S", color: "Black", stock: 12 },
        { sku: "CPT-BLK-M", size: "M", color: "Black", stock: 18 },
        { sku: "CPT-BLK-L", size: "L", color: "Black", stock: 15 },
        { sku: "CPT-BLK-XL", size: "XL", color: "Black", stock: 8 },
      ],
    },
  },
  {
    name: "Oversized Pump Cover",
    slug: "oversized-pump-cover",
    description:
      "A relaxed oversized tee made for warm-ups, heavy sessions, and casual wear.",
   category: "TOPS",
    priceInCents: 4299,
    images: {
      create: [
        {
          url: "/products/oversized-pump-cover-stone.png",
          altText: "Stone Oversized Pump Cover",


          position: 0,
        },
      ],
    },
    variants: {
      create: [
        { sku: "OPC-STN-S", size: "S", color: "Stone", stock: 10 },
        { sku: "OPC-STN-M", size: "M", color: "Stone", stock: 14 },
        { sku: "OPC-STN-L", size: "L", color: "Stone", stock: 13 },
        { sku: "OPC-STN-XL", size: "XL", color: "Stone", stock: 7 },
      ],
    },
  },
  {
    name: "Essential Training Shorts",
    slug: "essential-training-shorts",
    description:
      "Flexible training shorts with a secure waistband and unrestricted movement.",
    category: "BOTTOMS",
    priceInCents: 4499,
    images: {
      create: [
        {
          url: "/products/essential-training-shorts-black.png",
          altText: "Black Essential Training Shorts",
          position: 0,
        },
      ],
    },
    variants: {
      create: [
        { sku: "ETS-BLK-S", size: "S", color: "Black", stock: 11 },
        { sku: "ETS-BLK-M", size: "M", color: "Black", stock: 16 },
        { sku: "ETS-BLK-L", size: "L", color: "Black", stock: 14 },
        { sku: "ETS-BLK-XL", size: "XL", color: "Black", stock: 9 },
      ],
    },
  },
  {
    name: "Heavyweight Rest Day Hoodie",
    slug: "heavyweight-rest-day-hoodie",
    description:
      "A heavyweight cotton-blend hoodie for cool training days and recovery wear.",
    category: "OUTERWEAR",
    priceInCents: 7499,
    images: {
      create: [
        {
          url: "/products/heavyweight-hoodie-charcoal.png",
          altText: "Charcoal Heavyweight Rest Day Hoodie",
          position: 0,
        },
      ],
    },
    variants: {
      create: [
        { sku: "HRH-CHR-S", size: "S", color: "Charcoal", stock: 6 },
        { sku: "HRH-CHR-M", size: "M", color: "Charcoal", stock: 10 },
        { sku: "HRH-CHR-L", size: "L", color: "Charcoal", stock: 9 },
        { sku: "HRH-CHR-XL", size: "XL", color: "Charcoal", stock: 5 },
      ],
    },
  },
  {
    name: "Ironwear Training Cap",
    slug: "ironwear-training-cap",
    description:
      "A lightweight adjustable cap with a clean embroidered Ironwear logo.",
    category: "ACCESSORIES",
    priceInCents: 2999,
    images: {
      create: [
        {
          url: "/products/ironwear-training-cap-black.png",
          altText: "Black Ironwear Training Cap",
          position: 0,
        },
      ],
    },
    variants: {
      create: [
        {
          sku: "ITC-BLK-OS",
          size: "One Size",
          color: "Black",
          stock: 20,
        },
      ],
    },
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        images: {
        deleteMany: {},
        create: product.images.create,
      },
      },
      create: product,
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
