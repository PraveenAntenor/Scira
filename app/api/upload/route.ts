import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Optional: import your auth handler if needed
import { auth } from "@/lib/auth";

// ✅ File validation schema
const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine((file) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
      ];
      return validTypes.includes(file.type);
    }, {
      message: "File type should be JPEG, PNG, GIF or PDF",
    }),
});

// ✅ Upload handler
export async function POST(request: NextRequest) {
  // 🔐 Check for authentication (optional)
  let isAuthenticated = false;
  try {
    const sessionResponse = await auth(request);
    isAuthenticated = !!sessionResponse;
  } catch (error) {
    console.warn("Auth error, continuing unauthenticated:", error);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  // ✅ Validate file type
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Invalid file upload" }, { status: 400 });
  }

  const result = FileSchema.safeParse({ file });
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const validatedFile = result.data.file;

  // ✅ Upload to Vercel Blob
  try {
    const blob = await put(validatedFile.name, validatedFile, {
      access: "public",
    });

    return NextResponse.json({
      url: blob.url,
      authenticated: isAuthenticated,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

