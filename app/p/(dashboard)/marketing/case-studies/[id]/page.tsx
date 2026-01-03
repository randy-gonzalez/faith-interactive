/**
 * Edit Case Study Page
 *
 * Platform admin page for editing an existing case study.
 */

import { prisma } from "@/lib/db/prisma";
import { requirePlatformUser } from "@/lib/auth/guards";
import { CaseStudyEditor } from "@/components/platform/case-study-editor";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCaseStudyPage({ params }: PageProps) {
  await requirePlatformUser();
  const { id } = await params;

  const caseStudy = await prisma.caseStudy.findUnique({
    where: { id },
  });

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/marketing/case-studies"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Case Studies
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Case Study</h1>
        <p className="text-gray-600 mt-1">
          Update &ldquo;{caseStudy.churchName}&rdquo;
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CaseStudyEditor caseStudy={caseStudy} />
      </div>
    </div>
  );
}
