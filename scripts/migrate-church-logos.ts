/**
 * Church Partner Logo Migration Script
 *
 * Downloads logos from external URLs and uploads to Vercel Blob,
 * then creates ChurchPartner records in the database.
 *
 * USAGE:
 * pnpm tsx scripts/migrate-church-logos.ts
 *
 * OPTIONS:
 * --dry-run    Preview what would be migrated without making changes
 */

import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { createId } from "@paralleldrive/cuid2";

// Create Neon SQL client
const connectionString = process.env.DATABASE_URL!;
const sql = neon(connectionString);

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");

// Source data from website-review/page.tsx
const CHURCH_LOGOS = [
  { name: "Calvary Chapel Downey", logo: "https://images.squarespace-cdn.com/content/v1/626c40d44b4c18110b6280cf/a6af2318-02d1-45c6-bf9a-956b98b76fc9/Logo+05.png?format=1500w" },
  { name: "Harvest Crusades", logo: "https://harvest.org/wp-content/uploads/48a975fe-cropped-b86f1ce4-newlogoperiod.png" },
  { name: "CHEA", logo: "https://cheaofca.org/assets/logo/logo.png" },
  { name: "Kerusso", logo: "https://www.kerusso.com/cdn/shop/files/Kerusso-BLK-Logo_280x.png?v=1726047496" },
  { name: "Redeemer City Church", logo: "https://www.redeemerdc.org/wp-content/uploads/2024/01/redeemer-city-church-logo.png" },
  { name: "Calvary Chapel Golden Springs", logo: "https://calvarygs.org/wp-content/themes/ccgs-parallax/images/ccgs_logo.png" },
  { name: "Calvary Chapel Santa Fe Springs", logo: "https://images.squarespace-cdn.com/content/v1/6124066b0d462533e1aef022/748a4530-a2bd-4406-ab3f-ac9273187796/CCSFS-Dove-Word+-Logo-Cultured.png?format=1500w" },
  { name: "Coaches of Influence", logo: "https://i0.wp.com/coincoach.org/wp-content/uploads/2022/01/logo-200px-with-white-background.png?fit=268%2C224&ssl=1" },
  { name: "The Sending Church", logo: "https://sendingchurchnation.com/wp-content/uploads/2024/04/sending-church-logo.png" },
  { name: "New Life Christian Fellowship", logo: "https://www.nlot.org/wp-content/uploads/2024/08/new-life-christian-fellowship-logo.png" },
  { name: "Calvary Chapel Ascend", logo: "https://images.squarespace-cdn.com/content/v1/637d1156aa591532dec557f2/f6124ed7-3baa-468c-8d1d-760f3e09dd9f/CCA-LOGO_02.png?format=1500w" },
  { name: "Calvary Chapel Inglewood", logo: "https://calvaryinglewood.org/images/LogoFiles/symbol.png" },
  { name: "Calvary Chapel Signal Hill", logo: "https://calvarychapelsignalhill.com/wp-content/uploads/2024/10/CCSH-Round-Logo-BW-2024-300x248.png" },
  { name: "Calvary Chapel Education Association", logo: "https://cceaonline.org/images/logo.png" },
  { name: "Calvary Chapel University", logo: "https://calvarychapeluniversity.edu/wp-content/uploads/2021/01/ccu_horiz_logo.png" },
  { name: "Calvary Boulder Valley", logo: "https://files.snappages.site/P3VKQR/assets/images/1770050_464x88_500.png" },
  { name: "Calvary Chapel Fellowship Foley", logo: "https://images.squarespace-cdn.com/content/v1/6166ef513402b45cdd423ea6/cab12347-d842-41c5-9c35-677ddd4ab850/IMG_0302+3.png?format=1500w" },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function downloadImage(
  url: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download: ${url} (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "image/png";

  return { buffer, contentType };
}

function getExtensionFromContentType(contentType: string): string {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("svg")) return "svg";
  return "png";
}

async function main() {
  console.log("Church Partner Logo Migration");
  console.log("=============================");
  if (DRY_RUN) {
    console.log("DRY RUN MODE - No changes will be made\n");
  }

  // Check for required environment variable
  if (!process.env.BLOB_READ_WRITE_TOKEN && !DRY_RUN) {
    console.error("ERROR: BLOB_READ_WRITE_TOKEN environment variable is not set");
    console.error("Set up Vercel Blob storage and add the token to .env.local");
    process.exit(1);
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < CHURCH_LOGOS.length; i++) {
    const { name, logo } = CHURCH_LOGOS[i];
    const slug = slugify(name);

    console.log(`\n[${i + 1}/${CHURCH_LOGOS.length}] ${name}`);
    console.log(`  Slug: ${slug}`);

    // Check if already exists
    const existing = await sql`
      SELECT id FROM "ChurchPartner" WHERE slug = ${slug} LIMIT 1
    `;

    if (existing.length > 0) {
      console.log("  Status: Already exists, skipping");
      skipCount++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  Would download: ${logo}`);
      console.log(`  Would upload to: church-partners/${slug}.*`);
      console.log(`  Would create database record`);
      successCount++;
      continue;
    }

    try {
      // Download image
      console.log("  Downloading...");
      const { buffer, contentType } = await downloadImage(logo);
      console.log(`  Downloaded: ${buffer.length} bytes (${contentType})`);

      // Determine file extension
      const ext = getExtensionFromContentType(contentType);

      // Upload to Vercel Blob
      console.log("  Uploading to Blob...");
      const { url: rawBlobUrl } = await put(
        `church-partners/${slug}.${ext}`,
        buffer,
        { access: "public", contentType, addRandomSuffix: false, allowOverwrite: true }
      );

      // Use custom domain if configured
      const customDomain = process.env.BLOB_CUSTOM_DOMAIN;
      let blobUrl = rawBlobUrl;
      if (customDomain) {
        const urlObj = new URL(rawBlobUrl);
        blobUrl = `https://${customDomain}${urlObj.pathname}`;
      }
      console.log(`  Uploaded: ${blobUrl}`);

      // Create database record
      console.log("  Creating database record...");
      const id = createId();
      const now = new Date().toISOString();
      await sql`
        INSERT INTO "ChurchPartner" (id, name, slug, "logoUrl", "websiteUrl", "isActive", "sortOrder", "createdAt", "updatedAt")
        VALUES (${id}, ${name}, ${slug}, ${blobUrl}, ${null}, ${true}, ${i}, ${now}, ${now})
      `;

      console.log("  Status: Success");
      successCount++;
    } catch (error) {
      console.error(`  Status: ERROR - ${error}`);
      errorCount++;
    }

    // Small delay to avoid rate limiting
    if (!DRY_RUN) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  console.log("\n=============================");
  console.log("Migration Complete");
  console.log(`  Success: ${successCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log(`  Errors: ${errorCount}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
