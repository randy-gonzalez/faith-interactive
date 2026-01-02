/**
 * Public Page Detail
 *
 * Displays a single published page by URL path or ID.
 * This is a catch-all route for custom pages at the root level.
 */

import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { prisma } from "@/lib/db/prisma";
import { BlockRenderer } from "@/components/blocks/block-renderer";
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
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    keywords: page.metaKeywords || undefined,
    openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
    robots: page.noIndex ? { index: false } : undefined,
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
    <>
      {page.featuredImageUrl && (
        <img
          src={page.featuredImageUrl}
          alt={page.title}
          className="w-full h-64 sm:h-96 object-cover"
        />
      )}

      <BlockRenderer blocks={page.blocks} />
    </>
  );
}
