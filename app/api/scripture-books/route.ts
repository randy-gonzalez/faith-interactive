/**
 * Scripture Books API Routes
 *
 * GET /api/scripture-books - List all books of the Bible
 *
 * This is a read-only endpoint that returns the global reference data
 * for all 66 books of the Bible. This data is not tenant-scoped.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export async function GET() {
  try {
    const books = await prisma.scriptureBook.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ books });
  } catch (error) {
    logger.error("Failed to fetch scripture books", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch scripture books" },
      { status: 500 }
    );
  }
}
