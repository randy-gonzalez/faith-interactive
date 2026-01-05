/**
 * Work/Portfolio Page
 *
 * Purpose: Let the work speak for itself.
 * Answer: "What have you actually built?"
 *
 * Intentionally excluded:
 * - Statistics and metrics on the listing page
 * - Testimonials on the listing page (save for detail)
 * - Feature callouts
 */

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Church websites we've designed. Real projects for real churches.",
};

interface CaseStudy {
  id: string;
  churchName: string;
  slug: string;
  description: string;
  images: unknown;
  afterImage: string | null;
  logo: string | null;
  liveSiteUrl: string | null;
  featured: boolean;
}

export default async function WorkPage() {
  const caseStudies = await prisma.caseStudy.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">Work</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display hero-headline mb-8">
              Selected projects
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-large text-[#525252] max-w-xl">
              Custom websites for churches of all sizes.
              Each one designed to invite people in and point them to Jesus.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Work Grid */}
      {caseStudies.length > 0 ? (
        <section>
          <div className="work-grid">
            {caseStudies.map((study, index) => (
              <WorkItem
                key={study.id}
                study={study as CaseStudy}
                index={index}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="section">
          <div className="container text-center">
            <p className="text-[#737373] mb-8">
              We&apos;re currently updating our portfolio.
            </p>
            <Link href="/contact" className="btn-primary">
              Get in touch
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-lg">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="h2 mb-6">Ready to start your project?</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Link href="/contact" className="btn-primary">
              Get in touch
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function WorkItem({ study, index }: { study: CaseStudy; index: number }) {
  // Get hero image from afterImage or first image in gallery
  const images = Array.isArray(study.images) ? (study.images as string[]) : [];
  const heroImage = study.afterImage || images[0] || null;

  return (
    <Link
      href={`/work/${study.slug}`}
      className="work-item group"
    >
      {/* Background image or gradient placeholder */}
      {heroImage ? (
        <img
          src={heroImage}
          alt={study.churchName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
          style={{
            background: `linear-gradient(${135 + index * 45}deg, #4f76f6, #77f2a1)`,
          }}
        />
      )}

      {/* Title overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6 md:p-8">
        <span className="text-white text-xl md:text-2xl font-medium">
          {study.churchName}
        </span>
      </div>
    </Link>
  );
}
