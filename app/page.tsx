/**
 * Marketing Homepage
 *
 * Faith Interactive: Design agency for churches.
 * Portfolio-led. Minimal copy. Maximum impact.
 */

import { db } from "@/lib/db/neon";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

// Featured work items with placeholder images until real assets exist
const FEATURED_WORK = [
  { name: "The Sanctuary", slug: "the-sanctuary" },
  { name: "Redeemer City Church", slug: "redeemer-city-church" },
  { name: "The Sending Church", slug: "the-sending-church" },
  { name: "Calvary Chapel Boulder", slug: "calvary-chapel-boulder" },
];

// Force dynamic rendering - database not available at build time on Cloudflare
export const dynamic = "force-dynamic";

export default async function MarketingHomePage() {
  // Fetch featured case studies from database
  let workItems = FEATURED_WORK;

  try {
    const caseStudies = await db.caseStudy.findMany({
      where: { status: "PUBLISHED", featured: true },
      orderBy: [{ sortOrder: "asc" }],
      take: 4,
    });

    if (caseStudies.length > 0) {
      workItems = caseStudies.map((s) => ({ name: s.churchName, slug: s.slug }));
    }
  } catch {
    // Database unavailable (e.g., during build) - use static fallback
  }

  return (
    <>
      {/* Hero: Full viewport, typographic statement */}
      <section className="hero-full">
        <div className="container">
          <ScrollReveal>
            <h1 className="text-display hero-headline mb-8">
              Church sites that invite and point people to Jesus.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <a href="/work" className="btn-primary">
                See our work
              </a>
              <a href="/contact" className="btn-ghost">
                Get in touch
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Work Grid: Portfolio-first, full bleed */}
      <section>
        <div className="work-grid">
          {workItems.map((item, index) => (
            <a
              key={item.slug}
              href={`/work/${item.slug}`}
              className="work-item group"
            >
              {/* Gradient background - will be replaced with images */}
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                style={{
                  background: `linear-gradient(${135 + index * 45}deg, #4f76f6, #77f2a1)`,
                }}
              />
              {/* Always-visible title overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6 md:p-8">
                <span className="text-white text-xl md:text-2xl font-medium">
                  {item.name}
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="container py-8">
          <a href="/work" className="link-arrow text-sm">
            View all projects
          </a>
        </div>
      </section>

      {/* Manifesto: Short, confident positioning */}
      <section className="section-lg">
        <div className="container">
          <ScrollReveal>
            <p className="manifesto">
              We&apos;re a web design &amp; development studio.<br/>
              We work with churches. We serve Jesus &amp; want to make Him known.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <a href="/about" className="link-arrow mt-8 inline-flex">
              Our Story
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Services: Minimal list */}
      <section className="section bg-[#fafafa]">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-8">What we do</p>
          </ScrollReveal>
          <div className="services-list">
            <ScrollReveal delay={0.1}>
              <div className="services-item">
                <span>Church Identity</span>
                <span className="text-[#737373]">&rarr;</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="services-item">
                <span>Church Website Design</span>
                <span className="text-[#737373]">&rarr;</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="services-item">
                <span>Ongoing Support</span>
                <span className="text-[#737373]">&rarr;</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA: Direct ask */}
      <section className="section-lg">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="h2 mb-6">Ready to get started?</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <a href="/contact" className="btn-primary">
              Let&apos;s talk
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
