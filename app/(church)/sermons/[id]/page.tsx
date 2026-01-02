/**
 * Public Sermon Detail
 *
 * Displays a single published sermon with video/audio player.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getSermon(churchId: string, id: string) {
  return prisma.sermon.findFirst({
    where: {
      id,
      churchId,
      status: "PUBLISHED",
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const siteData = await getSiteData();

  if (!siteData) {
    return { title: "Sermon Not Found" };
  }

  const sermon = await getSermon(siteData.church.id, id);

  if (!sermon) {
    return { title: "Sermon Not Found" };
  }

  return {
    title: sermon.title,
    description: sermon.description || `${sermon.title} by ${sermon.speakerName || "Unknown Speaker"}`,
  };
}

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function getVimeoVideoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

export default async function SermonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const sermon = await getSermon(siteData.church.id, id);

  if (!sermon) {
    notFound();
  }

  // Determine video embed
  let videoEmbed: React.ReactNode = null;
  if (sermon.videoUrl) {
    const youtubeId = getYouTubeVideoId(sermon.videoUrl);
    const vimeoId = getVimeoVideoId(sermon.videoUrl);

    if (youtubeId) {
      videoEmbed = (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={sermon.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    } else if (vimeoId) {
      videoEmbed = (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={sermon.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    } else {
      // Generic video link
      videoEmbed = (
        <a
          href={sermon.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Watch Video
        </a>
      );
    }
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/sermons"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Sermons
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {sermon.title}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-600 dark:text-gray-400">
          <span className="font-medium">{sermon.speakerName || "Unknown Speaker"}</span>
          <span>
            {new Date(sermon.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {sermon.scripture && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {sermon.scripture}
            </span>
          )}
        </div>
      </header>

      {/* Video Player */}
      {videoEmbed && <div className="mb-8">{videoEmbed}</div>}

      {/* Audio Player */}
      {sermon.audioUrl && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Listen
          </h2>
          <audio controls className="w-full" preload="metadata">
            <source src={sermon.audioUrl} />
            <a href={sermon.audioUrl} className="text-blue-600 hover:underline">
              Download Audio
            </a>
          </audio>
        </div>
      )}

      {/* Description */}
      {sermon.description && (
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {sermon.description}
          </p>
        </div>
      )}
    </article>
  );
}
