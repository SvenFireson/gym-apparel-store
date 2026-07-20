import { auth } from "@/auth/auth";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxFileSize = 5 * 1024 * 1024;

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ironwear/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Select an image to upload." },
        { status: 400 },
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        {
          error:
            "Only JPG, PNG, and WebP images are supported.",
        },
        { status: 400 },
      );
    }

    if (file.size > maxFileSize) {
      return Response.json(
        { error: "The image must be smaller than 5 MB." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadBuffer(buffer);

    if (!result?.secure_url || !result?.public_id) {
      throw new Error("Cloudinary did not return an image URL.");
    }

    return Response.json(
      {
        message: "Image uploaded successfully.",
        image: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to upload product image:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload the image.",
      },
      { status: 500 },
    );
  }
}