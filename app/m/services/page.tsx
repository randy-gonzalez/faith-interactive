/**
 * Services Page
 *
 * Purpose: Explain what we do simply and confidently.
 * Answer: "What exactly does working with you look like?"
 *
 * Intentionally excluded:
 * - Feature checklists
 * - Comparison tables
 * - Technical jargon
 * - "Why choose us" sections
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Brand identity, website design, and ongoing support for churches. We handle the design so you can focus on ministry.",
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">Services</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display hero-headline mb-8">
              We handle the design.
              <br />
              You focus on ministry.
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* Services List */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl">
            {/* Church Identity */}
            <ScrollReveal>
              <div className="py-16 border-b border-[#e5e5e5]">
                <p className="text-micro text-[#737373] mb-4">01</p>
                <h2 className="h2 mb-6">Church Identity</h2>
                <p className="text-large text-[#525252] max-w-2xl mb-8">
                  A clear visual identity helps people recognize and remember
                  your church. We create logos, color systems, and typography
                  that feel like you.
                </p>
                <div className="flex flex-wrap gap-6 text-[#737373]">
                  <span>Logo design</span>
                  <span>Color palette</span>
                  <span>Typography</span>
                  <span>Brand guidelines</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Website Design */}
            <ScrollReveal>
              <div className="py-16 border-b border-[#e5e5e5]">
                <p className="text-micro text-[#737373] mb-4">02</p>
                <h2 className="h2 mb-6">Website Design</h2>
                <p className="text-large text-[#525252] max-w-2xl mb-8">
                  Custom websites that invite people in and point them to Jesus.
                  Not templates. Not themes. Designed specifically for your church
                  and how people actually use it.
                </p>
                <div className="flex flex-wrap gap-6 text-[#737373]">
                  <span>Custom design</span>
                  <span>Content strategy</span>
                  <span>Mobile-first</span>
                  <span>Easy updates</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Ongoing Support */}
            <ScrollReveal>
              <div className="py-16">
                <p className="text-micro text-[#737373] mb-4">03</p>
                <h2 className="h2 mb-6">Ongoing Support</h2>
                <p className="text-large text-[#525252] max-w-2xl mb-8">
                  We don&apos;t disappear after launch. Hosting, updates, and a
                  real person to call when you need help. We&apos;re here for the
                  long haul.
                </p>
                <div className="flex flex-wrap gap-6 text-[#737373]">
                  <span>Reliable hosting</span>
                  <span>Security updates</span>
                  <span>Content changes</span>
                  <span>Real support</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-[#fafafa]">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-8">How it works</p>
          </ScrollReveal>

          <div className="services-list">
            <ScrollReveal delay={0.1}>
              <div className="services-item">
                <span>1. We meet</span>
                <span className="text-[#737373] text-sm hidden sm:block">
                  About your church, your people, your goals
                </span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="services-item">
                <span>2. We design</span>
                <span className="text-[#737373] text-sm hidden sm:block">
                  A custom concept for your review
                </span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="services-item">
                <span>3. We build</span>
                <span className="text-[#737373] text-sm hidden sm:block">
                  And test everything thoroughly
                </span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div className="services-item">
                <span>4. We launch</span>
                <span className="text-[#737373] text-sm hidden sm:block">
                  And stay available after
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-lg">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="h2 mb-6">Ready to get started?</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link href="/contact" className="btn-primary">
                Get in touch
              </Link>
              <Link href="/work" className="btn-ghost">
                See the work
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
