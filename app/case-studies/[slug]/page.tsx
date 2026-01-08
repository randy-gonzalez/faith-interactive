/**
 * Case Study Detail Page
 */

import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db/neon";
import { notFound } from "next/navigation";

// Force dynamic rendering - database not available at build time on Cloudflare
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await db.caseStudy.findUnique({
    where: { slug, status: "PUBLISHED" },
  });

  if (!caseStudy) {
    return { title: "Case Study Not Found" };
  }

  return {
    title: `${caseStudy.churchName} Case Study`,
    description: caseStudy.description || `See how Faith Interactive helped ${caseStudy.churchName} transform their online presence.`,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;

  const caseStudy = await db.caseStudy.findUnique({
    where: { slug, status: "PUBLISHED" },
  });

  if (!caseStudy) {
    notFound();
  }

  const metrics = caseStudy.metrics as Record<string, string> | null;
  const images = caseStudy.images as string[] | null;

  return (
    <>
      {/* Hero */}
      <section className="section-padding bg-[#0a0a0a]">
        <div className="container">
          <div className="max-w-4xl">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-[#737373] hover:text-white transition-colors mb-8"
            >
              &larr; Back to Work
            </Link>

            {caseStudy.logo && (
              <img
                src={caseStudy.logo}
                alt={caseStudy.churchName}
                className="w-16 h-16 object-contain mb-6"
              />
            )}

            <h1 className="text-display mb-6">{caseStudy.churchName}</h1>

            {caseStudy.description && (
              <p className="text-body text-[#a3a3a3] max-w-2xl mb-8">
                {caseStudy.description}
              </p>
            )}

            {caseStudy.liveSiteUrl && (
              <a
                href={caseStudy.liveSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                Visit their website &rarr;
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Metrics */}
      {metrics && Object.keys(metrics).length > 0 && (
        <section className="py-16 bg-[#111111]">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(metrics).map(([label, value]) => (
                <div key={label} className="text-center">
                  <p className="text-4xl font-semibold text-gradient mb-2">{value}</p>
                  <p className="text-micro text-[#737373] capitalize">
                    {label.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Challenge & Solution */}
      {(caseStudy.challenge || caseStudy.solution) && (
        <section className="section-padding bg-[#0a0a0a]">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl">
              {caseStudy.challenge && (
                <div>
                  <h2 className="text-h3 mb-4">
                    <span className="text-[#737373]">01.</span> The Challenge
                  </h2>
                  <p className="text-body text-[#a3a3a3]">{caseStudy.challenge}</p>
                </div>
              )}
              {caseStudy.solution && (
                <div>
                  <h2 className="text-h3 mb-4">
                    <span className="text-[#00d4aa]">02.</span> The Solution
                  </h2>
                  <p className="text-body text-[#a3a3a3]">{caseStudy.solution}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Before/After */}
      {(caseStudy.beforeImage || caseStudy.afterImage) && (
        <section className="section-padding bg-[#111111]">
          <div className="container">
            <h2 className="text-h2 text-center mb-12">The Transformation</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {caseStudy.beforeImage && (
                <div>
                  <p className="text-micro text-[#737373] mb-3">Before</p>
                  <img
                    src={caseStudy.beforeImage}
                    alt="Before"
                    className="w-full rounded-lg border border-[#262626]"
                  />
                </div>
              )}
              {caseStudy.afterImage && (
                <div>
                  <p className="text-micro text-[#00d4aa] mb-3">After</p>
                  <img
                    src={caseStudy.afterImage}
                    alt="After"
                    className="w-full rounded-lg border border-[#262626]"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {images && images.length > 0 && (
        <section className="section-padding bg-[#0a0a0a]">
          <div className="container">
            <h2 className="text-h2 text-center mb-12">Gallery</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${caseStudy.churchName} screenshot ${index + 1}`}
                  className="w-full rounded-lg border border-[#262626]"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      {caseStudy.testimonialQuote && (
        <section className="section-padding bg-[#111111]">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <svg
                className="w-12 h-12 mx-auto text-[#00d4aa] opacity-50 mb-8"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="text-2xl md:text-3xl text-white leading-relaxed mb-8">
                &ldquo;{caseStudy.testimonialQuote}&rdquo;
              </blockquote>
              {(caseStudy.testimonialName || caseStudy.testimonialTitle) && (
                <div>
                  {caseStudy.testimonialName && (
                    <p className="font-semibold text-white">
                      {caseStudy.testimonialName}
                    </p>
                  )}
                  {caseStudy.testimonialTitle && (
                    <p className="text-[#737373]">{caseStudy.testimonialTitle}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding bg-[#0a0a0a]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-h1 mb-6">Ready for your transformation?</h2>
            <p className="text-body text-[#a3a3a3] mb-8">
              Let&apos;s create something remarkable for your church.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                Start a project
              </Link>
              <Link
                href="/work"
                className="px-6 py-3 text-sm font-medium text-white border border-[#404040] rounded-lg hover:border-[#525252] transition-colors"
              >
                View more work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
