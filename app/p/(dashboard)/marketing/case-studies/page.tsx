/**
 * Case Studies List Page
 *
 * Platform admin page for managing case studies.
 */

import { prisma } from "@/lib/db/prisma";
import { requirePlatformUser } from "@/lib/auth/guards";
import Link from "next/link";

export default async function CaseStudiesPage() {
  await requirePlatformUser();

  const caseStudies = await prisma.caseStudy.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Studies</h1>
          <p className="text-gray-600 mt-1">
            Showcase church website transformations and success stories.
          </p>
        </div>
        <Link
          href="/marketing/case-studies/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Case Study
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{caseStudies.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {caseStudies.filter((c) => c.status === "PUBLISHED").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Featured</p>
          <p className="text-2xl font-bold text-indigo-600">
            {caseStudies.filter((c) => c.featured).length}
          </p>
        </div>
      </div>

      {/* Case Studies List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {caseStudies.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No case studies yet.</p>
            <Link
              href="/marketing/case-studies/new"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Add your first case study →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {caseStudies.map((caseStudy) => (
              <div
                key={caseStudy.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Logo */}
                {caseStudy.logo ? (
                  <img
                    src={caseStudy.logo}
                    alt={caseStudy.churchName}
                    className="w-12 h-12 object-contain rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-lg">
                      {caseStudy.churchName.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/marketing/case-studies/${caseStudy.id}`}
                      className="font-medium text-gray-900 truncate hover:text-indigo-600"
                    >
                      {caseStudy.churchName}
                    </Link>
                    {caseStudy.featured && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {caseStudy.description || "No description"}
                  </p>
                </div>

                {/* Status */}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    caseStudy.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {caseStudy.status}
                </span>

                {/* Live Site Link */}
                {caseStudy.liveSiteUrl && (
                  <a
                    href={caseStudy.liveSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View Site ↗
                  </a>
                )}

                {/* Edit Link */}
                <Link
                  href={`/marketing/case-studies/${caseStudy.id}`}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Edit →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
