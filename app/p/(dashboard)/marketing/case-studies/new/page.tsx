/**
 * New Case Study Page
 *
 * Platform admin page for creating a new case study.
 */

import { requirePlatformUser } from "@/lib/auth/guards";
import { CaseStudyEditor } from "@/components/platform/case-study-editor";
import Link from "next/link";

export default async function NewCaseStudyPage() {
  await requirePlatformUser();

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
        <h1 className="text-2xl font-bold text-gray-900">Add Case Study</h1>
        <p className="text-gray-600 mt-1">
          Showcase a church website transformation success story.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CaseStudyEditor />
      </div>
    </div>
  );
}
