/**
 * Case Study Detail Page
 */

import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/marketing/cta-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await prisma.caseStudy.findUnique({
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

  const caseStudy = await prisma.caseStudy.findUnique({
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
      <section className="marketing-gradient py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          {caseStudy.logo && (
            <img
              src={caseStudy.logo}
              alt={caseStudy.churchName}
              className="w-20 h-20 object-contain mx-auto mb-6"
            />
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            {caseStudy.churchName}
          </h1>
          {caseStudy.description && (
            <p className="text-xl text-[#000646]/80 max-w-2xl mx-auto">
              {caseStudy.description}
            </p>
          )}
          {caseStudy.liveSiteUrl && (
            <a
              href={caseStudy.liveSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-[#000646] font-semibold hover:underline"
            >
              Visit their website ↗
            </a>
          )}
        </div>
      </section>

      {/* Metrics */}
      {metrics && Object.keys(metrics).length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(metrics).map(([label, value]) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-bold text-gradient">{value}</p>
                  <p className="text-sm text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Before/After */}
      {(caseStudy.beforeImage || caseStudy.afterImage) && (
        <section className="py-16 marketing-gradient-subtle">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#000646] text-center mb-8">
              The Transformation
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {caseStudy.beforeImage && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Before</p>
                  <img
                    src={caseStudy.beforeImage}
                    alt="Before"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              )}
              {caseStudy.afterImage && (
                <div>
                  <p className="text-sm font-semibold text-[#00d4aa] mb-2">After</p>
                  <img
                    src={caseStudy.afterImage}
                    alt="After"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {images && images.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#000646] text-center mb-8">
              Gallery
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${caseStudy.churchName} screenshot ${index + 1}`}
                  className="w-full rounded-lg shadow-lg"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      {caseStudy.testimonialQuote && (
        <section className="py-16 marketing-gradient-subtle">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <svg
              className="w-12 h-12 mx-auto text-[#00d4aa] opacity-50 mb-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="text-2xl text-[#000646] leading-relaxed mb-6">
              &ldquo;{caseStudy.testimonialQuote}&rdquo;
            </blockquote>
            {(caseStudy.testimonialName || caseStudy.testimonialTitle) && (
              <div>
                {caseStudy.testimonialName && (
                  <p className="font-semibold text-[#000646]">
                    {caseStudy.testimonialName}
                  </p>
                )}
                {caseStudy.testimonialTitle && (
                  <p className="text-gray-600">{caseStudy.testimonialTitle}</p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <CTASection
        title="Ready for Your Transformation?"
        description="Schedule a free consultation and let's discuss how we can help your church."
        primaryCta={{ text: "Get Your Free Consultation", href: "/contact" }}
        secondaryCta={{ text: "View All Case Studies", href: "/case-studies" }}
      />
    </>
  );
}
