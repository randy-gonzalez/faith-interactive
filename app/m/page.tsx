/**
 * Marketing Homepage
 *
 * Landing page for faith-interactive.com.
 * Showcases services, pricing, testimonials, and drives consultations.
 */

import { prisma } from "@/lib/db/prisma";
import { PricingTableCompact } from "@/components/marketing/pricing-table";
import { TestimonialCarousel } from "@/components/marketing/testimonial-carousel";
import { CaseStudyCard } from "@/components/marketing/case-study-card";
import { PhoneCTA } from "@/components/marketing/cta-section";

export default async function MarketingHomePage() {
  // Fetch featured content
  const [testimonials, caseStudies] = await Promise.all([
    prisma.testimonial.findMany({
      where: { isActive: true, featured: true },
      orderBy: { sortOrder: "asc" },
      take: 5,
    }),
    prisma.caseStudy.findMany({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="marketing-gradient-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-[#00d4aa] font-semibold mb-4">
                FREE WEBSITES FOR CHURCH PLANTS
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-[#000646] mb-6 leading-tight">
                Beautiful Church Websites{" "}
                <span className="text-gradient">Made Simple</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Launch a stunning website for your church with professional design,
                SEO optimization, and reliable cloud hosting. Starting at{" "}
                <strong>FREE for church plants</strong>.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <a
                  href="/contact"
                  className="btn-marketing-primary text-lg px-8 py-4 w-full sm:w-auto"
                >
                  Get Your Free Consultation
                </a>
                <a
                  href="/case-studies"
                  className="btn-marketing-secondary text-lg px-8 py-4 w-full sm:w-auto"
                >
                  View Our Work
                </a>
              </div>
              <div className="flex justify-center">
                <PhoneCTA />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#000646] mb-4">
              Everything Your Church Needs Online
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From design to hosting, we handle everything so you can focus on ministry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Website Design */}
            <a
              href="/services/website-design"
              className="marketing-card p-8 group"
            >
              <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-[#77f2a1]/20 to-[#00ffce]/20 flex items-center justify-center group-hover:from-[#77f2a1] group-hover:to-[#00ffce] transition-all">
                <svg
                  className="w-7 h-7 text-[#00d4aa] group-hover:text-[#000646] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#000646] mb-3 group-hover:text-[#00d4aa] transition-colors">
                Website Design & Development
              </h3>
              <p className="text-gray-600 mb-4">
                Custom-designed, mobile-responsive websites that showcase your church&apos;s
                unique identity and help visitors find what they need.
              </p>
              <span className="text-[#00d4aa] font-semibold">
                Learn more →
              </span>
            </a>

            {/* SEO Services */}
            <a
              href="/services/seo"
              className="marketing-card p-8 group"
            >
              <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-[#77f2a1]/20 to-[#00ffce]/20 flex items-center justify-center group-hover:from-[#77f2a1] group-hover:to-[#00ffce] transition-all">
                <svg
                  className="w-7 h-7 text-[#00d4aa] group-hover:text-[#000646] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#000646] mb-3 group-hover:text-[#00d4aa] transition-colors">
                SEO Services
              </h3>
              <p className="text-gray-600 mb-4">
                Help your community find you online with search engine optimization
                that puts your church at the top of local search results.
              </p>
              <span className="text-[#00d4aa] font-semibold">
                Learn more →
              </span>
            </a>

            {/* Cloud Hosting */}
            <a
              href="/services/hosting"
              className="marketing-card p-8 group"
            >
              <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-[#77f2a1]/20 to-[#00ffce]/20 flex items-center justify-center group-hover:from-[#77f2a1] group-hover:to-[#00ffce] transition-all">
                <svg
                  className="w-7 h-7 text-[#00d4aa] group-hover:text-[#000646] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#000646] mb-3 group-hover:text-[#00d4aa] transition-colors">
                VPS Cloud Hosting & Support
              </h3>
              <p className="text-gray-600 mb-4">
                Fast, secure, and reliable hosting with SSL certificates, daily backups,
                and dedicated support when you need it.
              </p>
              <span className="text-[#00d4aa] font-semibold">
                Learn more →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 marketing-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#000646] mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No hidden fees. No surprises. Just great websites at fair prices.
            </p>
          </div>

          <PricingTableCompact />

          <div className="text-center mt-10">
            <a href="/pricing" className="btn-marketing-primary">
              See Full Pricing Details
            </a>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      {caseStudies.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#000646] mb-4">
                Churches We&apos;ve Helped
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                See how we&apos;ve transformed church websites and helped communities grow online.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {caseStudies.map((caseStudy) => (
                <CaseStudyCard
                  key={caseStudy.id}
                  caseStudy={{
                    ...caseStudy,
                    metrics: caseStudy.metrics as Record<string, string> | null,
                  }}
                />
              ))}
            </div>

            <div className="text-center mt-10">
              <a href="/case-studies" className="btn-marketing-secondary">
                View All Case Studies
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 marketing-gradient-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#000646] mb-4">
                What Churches Say About Us
              </h2>
            </div>

            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="marketing-gradient py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#000646] mb-4">
            Ready to Transform Your Church&apos;s Online Presence?
          </h2>
          <p className="text-lg text-[#000646]/80 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation and let&apos;s discuss how we can help your
            church reach more people online.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/contact" className="btn-marketing-white text-lg px-8 py-4">
              Get Your Free Consultation
            </a>
            <a
              href="tel:+18333071917"
              className="text-[#000646] font-semibold hover:underline"
            >
              Or call (833) 307-1917 →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
