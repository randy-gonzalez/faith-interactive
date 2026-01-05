/**
 * Pricing Page
 *
 * Purpose: Be honest and clear about cost.
 * Answer: "What will this cost my church?"
 *
 * Intentionally excluded:
 * - Feature comparison tables
 * - "Most Popular" badges
 * - Feature checklists per tier
 * - Pressure tactics
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Honest pricing for church website design. Free for church plants. Simple monthly hosting. No surprises.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">Pricing</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display hero-headline mb-8">
              Honest pricing.
              <br />
              No surprises.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-large text-[#525252] max-w-xl">
              Every project is different, but here&apos;s what to expect.
              We&apos;ll give you a real quote after we talk.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
            {/* Church Plants */}
            <ScrollReveal delay={0.1}>
              <div className="p-8 border border-[#e5e5e5] rounded-sm">
                <p className="text-micro text-[#737373] mb-4">Church Plants</p>
                <p className="text-4xl font-medium mb-2">Free</p>
                <p className="text-[#737373] mb-6">+ $25/mo hosting</p>
                <p className="text-[#525252]">
                  New churches have enough to worry about.
                  Your website shouldn&apos;t be one of them.
                </p>
              </div>
            </ScrollReveal>

            {/* Established Churches */}
            <ScrollReveal delay={0.15}>
              <div className="p-8 border border-[#e5e5e5] rounded-sm">
                <p className="text-micro text-[#737373] mb-4">Established Churches</p>
                <p className="text-4xl font-medium mb-2">$500–$1,500</p>
                <p className="text-[#737373] mb-6">+ $25/mo hosting</p>
                <p className="text-[#525252]">
                  Depends on complexity. Most churches land
                  somewhere in this range.
                </p>
              </div>
            </ScrollReveal>

            {/* Large / Multi-Site */}
            <ScrollReveal delay={0.2}>
              <div className="p-8 border border-[#e5e5e5] rounded-sm">
                <p className="text-micro text-[#737373] mb-4">Large / Multi-Site</p>
                <p className="text-4xl font-medium mb-2">Custom</p>
                <p className="text-[#737373] mb-6">Let&apos;s talk</p>
                <p className="text-[#525252]">
                  Multiple campuses, complex needs, or major rebrand?
                  We&apos;ll scope it together.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section bg-[#fafafa]">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-8">What&apos;s included</p>
          </ScrollReveal>

          <div className="services-list mb-12">
            <ScrollReveal delay={0.1}>
              <div className="services-item">
                <span>Custom design</span>
                <span className="text-[#737373]">Not a template</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <div className="services-item">
                <span>Mobile-responsive</span>
                <span className="text-[#737373]">Works on all devices</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.14}>
              <div className="services-item">
                <span>Easy content updates</span>
                <span className="text-[#737373]">You control it</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.16}>
              <div className="services-item">
                <span>Sermons & events</span>
                <span className="text-[#737373]">Built in</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.18}>
              <div className="services-item">
                <span>Hosting & security</span>
                <span className="text-[#737373]">We handle it</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="services-item">
                <span>Real support</span>
                <span className="text-[#737373]">Actual humans</span>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.25}>
            <div className="p-6 bg-white border border-[#e5e5e5] rounded-sm">
              <p className="text-[#525252]">
                <span className="font-medium text-[#171717]">Need ongoing help?</span>
                {" "}We offer a $100/month service where we handle content updates,
                new pages, and keeping your site fresh.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Common Questions */}
      <section className="section">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-12">Common questions</p>
          </ScrollReveal>

          <div className="space-y-12">
            <ScrollReveal delay={0.1}>
              <div>
                <h3 className="h3 mb-3">Why free for church plants?</h3>
                <p className="text-[#525252]">
                  We believe every new church deserves a solid digital presence.
                  You have enough financial challenges — your website shouldn&apos;t
                  be one of them. You just cover the hosting.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div>
                <h3 className="h3 mb-3">What determines the price?</h3>
                <p className="text-[#525252]">
                  Number of pages, level of customization, and any special features
                  you need. We&apos;ll give you an honest quote after understanding
                  your situation.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div>
                <h3 className="h3 mb-3">Any long-term contracts?</h3>
                <p className="text-[#525252]">
                  No. Hosting is month-to-month. If you ever want to leave,
                  we&apos;ll help you transition.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.25}>
            <div className="mt-12">
              <Link href="/faq" className="link-arrow">
                More questions
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section-lg bg-[#fafafa]">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="h2 mb-4">Let&apos;s talk about your church.</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-[#525252] mb-8">
              We&apos;ll give you a real quote — no pressure, no sales pitch.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <Link href="/contact" className="btn-primary">
              Get in touch
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
