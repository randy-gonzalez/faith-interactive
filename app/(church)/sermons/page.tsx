/**
 * Public Sermons List
 *
 * Displays all published sermons.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sermons",
};

export default async function SermonsPage() {
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const sermons = await prisma.sermon.findMany({
    where: {
      churchId: siteData.church.id,
      status: "PUBLISHED",
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Sermons
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Watch and listen to our messages
        </p>
      </header>

      {sermons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No sermons available yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sermons.map((sermon) => (
            <Link
              key={sermon.id}
              href={`/sermons/${sermon.id}`}
              className="block bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {sermon.title}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>{sermon.speaker}</span>
                    <span>
                      {new Date(sermon.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {sermon.scripture && (
                      <span className="text-blue-600 dark:text-blue-400">
                        {sermon.scripture}
                      </span>
                    )}
                  </div>
                  {sermon.description && (
                    <p className="mt-3 text-gray-600 dark:text-gray-300 line-clamp-2">
                      {sermon.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {sermon.videoUrl && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                      Video
                    </span>
                  )}
                  {sermon.audioUrl && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                      Audio
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
