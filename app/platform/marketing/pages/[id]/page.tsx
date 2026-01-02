/**
 * Edit Marketing Page
 *
 * Form to edit an existing marketing page.
 */

import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { requirePlatformAdminOrRedirect } from "@/lib/auth/guards";
import { MarketingPageEditor } from "@/components/platform/marketing-page-editor";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditMarketingPagePage({ params }: PageProps) {
  await requirePlatformAdminOrRedirect();
  const { id } = await params;

  const page = await prisma.marketingPage.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Marketing Page</h1>
        <p className="text-gray-600">
          Editing: {page.title}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MarketingPageEditor page={page} />
      </div>
    </div>
  );
}
