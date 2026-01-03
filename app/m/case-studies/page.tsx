/**
 * Case Studies Page
 *
 * List of all published case studies.
 */

import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { CaseStudyCard, CaseStudyFeatured } from "@/components/marketing/case-study-card";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "See how Faith Interactive has helped churches transform their online presence. Real results from real churches.",
};

export default async function CaseStudiesPage() {
  const caseStudies = await prisma.caseStudy.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const featured = caseStudies.find((cs) => cs.featured);
  const others = caseStudies.filter((cs) => !cs.featured || cs.id !== featured?.id);

  return (
    <>
      {/* Hero */}
      <section className="marketing-gradient-subtle py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            Case Studies
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how we&apos;ve helped churches transform their online presence and
            reach more people in their communities.
          </p>
        </div>
      </section>

      {/* Featured Case Study */}
      {featured && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-sm font-semibold text-[#00d4aa] uppercase tracking-wide mb-6">
              Featured
            </h2>
            <CaseStudyFeatured
              caseStudy={{
                ...featured,
                metrics: featured.metrics as Record<string, string> | null,
              }}
            />
          </div>
        </section>
      )}

      {/* Other Case Studies */}
      {others.length > 0 && (
        <section className="py-16 marketing-gradient-subtle">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#000646] mb-8">
              More Success Stories
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {others.map((caseStudy) => (
                <CaseStudyCard
                  key={caseStudy.id}
                  caseStudy={{
                    ...caseStudy,
                    metrics: caseStudy.metrics as Record<string, string> | null,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {caseStudies.length === 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-gray-600 mb-8">
              We&apos;re currently preparing our case studies. Check back soon!
            </p>
            <a href="/contact" className="btn-marketing-primary">
              Get Your Free Consultation
            </a>
          </div>
        </section>
      )}

      {/* CTA */}
      <CTASection
        title="Ready to Be Our Next Success Story?"
        description="Schedule a free consultation and let's discuss how we can transform your church's online presence."
        primaryCta={{ text: "Get Your Free Consultation", href: "/contact" }}
        secondaryCta={{ text: "View Pricing", href: "/pricing" }}
      />
    </>
  );
}
