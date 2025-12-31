/**
 * Public Page Detail
 *
 * Displays a single published page by URL path or ID.
 */

import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPage(churchId: string, slug: string) {
  // Try to find by urlPath first, then by ID
  let page = await prisma.page.findFirst({
    where: {
      churchId,
      urlPath: slug,
      status: "PUBLISHED",
    },
  });

  if (!page) {
    page = await prisma.page.findFirst({
      where: {
        id: slug,
        churchId,
        status: "PUBLISHED",
      },
    });
  }

  return page;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteData = await getSiteData();

  if (!siteData) {
    return { title: "Page Not Found" };
  }

  const page = await getPage(siteData.church.id, slug);

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: page.title,
  };
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params;
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const page = await getPage(siteData.church.id, slug);

  if (!page) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {page.title}
        </h1>
      </header>

      {page.featuredImageUrl && (
        <img
          src={page.featuredImageUrl}
          alt={page.title}
          className="w-full h-64 sm:h-96 object-cover rounded-lg mb-8"
        />
      )}

      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </article>
  );
}
