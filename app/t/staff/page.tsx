/**
 * Public Staff/Leadership Page
 *
 * Displays all published leadership profiles.
 */

import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team",
};

export default async function StaffPage() {
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const leaders = await prisma.leadershipProfile.findMany({
    where: {
      churchId: siteData.church.id,
      status: "PUBLISHED",
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Our Team
        </h1>
        <p className="mt-2 text-gray-600">
          Meet the people who lead and serve at {siteData.church.name}
        </p>
      </header>

      {leaders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            Team information coming soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {leaders.map((leader) => (
            <div
              key={leader.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Photo */}
              {leader.photoUrl ? (
                <img
                  src={leader.photoUrl}
                  alt={leader.name}
                  className="w-full h-64 object-cover object-top"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}

              {/* Info */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {leader.name}
                </h2>
                <p className="text-blue-600 font-medium mb-4">
                  {leader.title}
                </p>

                {leader.bio && (
                  <p className="text-gray-600 text-sm mb-4">
                    {leader.bio}
                  </p>
                )}

                {leader.email && (
                  <a
                    href={`mailto:${leader.email}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {leader.email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
