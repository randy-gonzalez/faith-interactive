/**
 * Work Detail / Case Study Page
 *
 * Purpose: Show the work and tell the story.
 * Answer: "What did you actually do for this church?"
 *
 * Intentionally excluded:
 * - Quote icons
 * - Gradient text
 * - Marketing CTAs throughout
 */

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await prisma.caseStudy.findUnique({
    where: { slug, status: "PUBLISHED" },
  });

  if (!caseStudy) {
    return { title: "Project Not Found" };
  }

  return {
    title: caseStudy.churchName,
    description: caseStudy.description || `${caseStudy.churchName} — a Faith Interactive project.`,
  };
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const caseStudy = await prisma.caseStudy.findUnique({
    where: { slug, status: "PUBLISHED" },
  });

  if (!caseStudy) {
    notFound();
  }

  const images = Array.isArray(caseStudy.images) ? (caseStudy.images as string[]) : [];
  const heroImage = caseStudy.afterImage || images[0] || null;

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="max-w-4xl">
            <Link
              href="/work"
              className="text-micro text-[#737373] hover:text-[#171717] transition-colors mb-6 inline-block"
            >
              &larr; Work
            </Link>

            <h1 className="text-display mb-6">{caseStudy.churchName}</h1>

            {caseStudy.description && (
              <p className="text-large text-[#525252] max-w-2xl mb-8">
                {caseStudy.description}
              </p>
            )}

            {caseStudy.liveSiteUrl && (
              <a
                href={caseStudy.liveSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-arrow"
              >
                Visit their website
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Hero Image */}
      {heroImage && (
        <section className="container mb-16">
          <img
            src={heroImage}
            alt={caseStudy.churchName}
            className="w-full"
          />
        </section>
      )}

      {/* Challenge & Solution */}
      {(caseStudy.challenge || caseStudy.solution) && (
        <section className="section">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-16 max-w-4xl">
              {caseStudy.challenge && (
                <div>
                  <p className="text-micro text-[#737373] mb-4">The challenge</p>
                  <p className="text-large text-[#525252]">{caseStudy.challenge}</p>
                </div>
              )}
              {caseStudy.solution && (
                <div>
                  <p className="text-micro text-[#737373] mb-4">What we did</p>
                  <p className="text-large text-[#525252]">{caseStudy.solution}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Before/After */}
      {(caseStudy.beforeImage || caseStudy.afterImage) && (
        <section className="section bg-[#fafafa]">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
              {caseStudy.beforeImage && (
                <div>
                  <p className="text-micro text-[#737373] mb-4">Before</p>
                  <img
                    src={caseStudy.beforeImage}
                    alt="Before"
                    className="w-full border border-[#e5e5e5]"
                  />
                </div>
              )}
              {caseStudy.afterImage && (
                <div>
                  <p className="text-micro text-[#737373] mb-4">After</p>
                  <img
                    src={caseStudy.afterImage}
                    alt="After"
                    className="w-full border border-[#e5e5e5]"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {images && images.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${caseStudy.churchName} screenshot ${index + 1}`}
                  className="w-full border border-[#e5e5e5]"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      {caseStudy.testimonialQuote && (
        <section className="section bg-[#fafafa]">
          <div className="container">
            <div className="max-w-3xl">
              <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
                &ldquo;{caseStudy.testimonialQuote}&rdquo;
              </blockquote>
              {(caseStudy.testimonialName || caseStudy.testimonialTitle) && (
                <div className="text-[#737373]">
                  {caseStudy.testimonialName && (
                    <span className="font-medium text-[#171717]">
                      {caseStudy.testimonialName}
                    </span>
                  )}
                  {caseStudy.testimonialTitle && (
                    <span className="ml-2">{caseStudy.testimonialTitle}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-lg">
        <div className="container">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            <Link href="/work" className="link-arrow">
              See more work
            </Link>
            <Link href="/contact" className="link-arrow">
              Start a project
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
