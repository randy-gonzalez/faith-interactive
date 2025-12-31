/**
 * Domains API Routes
 *
 * GET /api/domains - List all custom domains for the church (Admin only)
 * POST /api/domains - Add a new custom domain (Admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";
import { formatZodError } from "@/lib/validation/schemas";
import { generateVerificationToken } from "@/lib/domains/verification";

// Validation schema for adding a domain
const addDomainSchema = z.object({
  hostname: z
    .string()
    .min(4, "Hostname must be at least 4 characters")
    .max(253, "Hostname too long")
    .transform((h) => h.toLowerCase().trim().replace(/\.$/, ""))
    .refine(
      (h) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(h),
      "Invalid hostname format"
    )
    .refine(
      (h) => !h.endsWith(".faithinteractive.com") && !h.endsWith(".faithinteractive.test"),
      "Cannot add Faith Interactive subdomains as custom domains"
    ),
  notes: z.string().max(500).optional(),
});

/**
 * GET /api/domains
 * List all custom domains for the church.
 * Admin only.
 */
export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require admin role
    if (context.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const domains = await prisma.customDomain.findMany({
      where: { churchId: context.church.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ domains });
  } catch (error) {
    logger.error("Failed to list domains", error as Error);
    return NextResponse.json(
      { error: "Failed to list domains" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/domains
 * Add a new custom domain.
 * Admin only.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const result = addDomainSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const { hostname, notes } = result.data;

    // Check if domain already exists (globally unique)
    const existing = await prisma.customDomain.findUnique({
      where: { hostname },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This domain is already registered" },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create the domain
    const domain = await prisma.customDomain.create({
      data: {
        churchId: user.churchId,
        hostname,
        verificationToken,
        notes: notes || null,
        status: "PENDING",
      },
    });

    logger.info("Custom domain added", {
      churchId: user.churchId,
      hostname,
      domainId: domain.id,
    });

    return NextResponse.json({
      domain,
      verificationInstructions: {
        recordType: "TXT",
        recordName: `_fi-verify.${hostname}`,
        recordValue: `fi-verify=${verificationToken}`,
        instructions: `Add a TXT record to your DNS with name "_fi-verify" and value "fi-verify=${verificationToken}". DNS changes may take up to 48 hours to propagate.`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    logger.error("Failed to add domain", error as Error);
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
}
