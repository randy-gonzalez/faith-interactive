/**
 * Domain Verification API
 *
 * POST /api/domains/[id]/verify - Verify domain ownership via DNS TXT record (Admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import { verifyDomainDNS } from "@/lib/domains/verification";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/domains/[id]/verify
 * Verify domain ownership via DNS TXT record lookup.
 * Admin only.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    // Get the domain
    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // If already verified, return success
    if (domain.status === "ACTIVE") {
      return NextResponse.json({
        verified: true,
        message: "Domain is already verified",
        domain,
      });
    }

    // Perform DNS verification
    logger.info("Attempting domain verification", {
      churchId: user.churchId,
      hostname: domain.hostname,
      domainId: id,
    });

    const verificationResult = await verifyDomainDNS(
      domain.hostname,
      domain.verificationToken
    );

    if (verificationResult.verified) {
      // Update domain status to active
      const updatedDomain = await prisma.customDomain.update({
        where: { id },
        data: {
          status: "ACTIVE",
          verifiedAt: new Date(),
        },
      });

      logger.info("Domain verified successfully", {
        churchId: user.churchId,
        hostname: domain.hostname,
        domainId: id,
      });

      return NextResponse.json({
        verified: true,
        message: "Domain verified successfully!",
        domain: updatedDomain,
      });
    } else {
      // Update status to ERROR if verification failed
      const updatedDomain = await prisma.customDomain.update({
        where: { id },
        data: {
          status: "ERROR",
        },
      });

      logger.warn("Domain verification failed", {
        churchId: user.churchId,
        hostname: domain.hostname,
        domainId: id,
        reason: verificationResult.reason,
      });

      return NextResponse.json({
        verified: false,
        message: verificationResult.reason || "DNS verification failed. Please check your TXT record.",
        domain: updatedDomain,
        instructions: {
          recordType: "TXT",
          recordName: `_fi-verify.${domain.hostname}`,
          recordValue: `fi-verify=${domain.verificationToken}`,
          tip: "DNS changes can take up to 48 hours to propagate. Please wait and try again.",
        },
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    logger.error("Domain verification error", error as Error);
    return NextResponse.json(
      { error: "Verification failed. Please try again later." },
      { status: 500 }
    );
  }
}
