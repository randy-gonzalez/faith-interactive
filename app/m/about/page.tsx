/**
 * About Page
 *
 * Purpose: Establish trust through conviction, not credentials.
 * Answer: "Who are these people, and why do they care about churches?"
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "A design studio for churches. We believe the local church matters, and its digital presence should reflect that.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">About</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display hero-headline mb-8">
              We believe the local church matters.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-large text-[#525252] max-w-2xl">
              So we build websites that reflect that: clear, thoughtful,
              and designed to help people take the next step toward Jesus.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section bg-[#fafafa]">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="manifesto">
              We&apos;re not a marketing agency. We&apos;re not a
              church software company. We&apos;re designers who
              happen to love the church.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Convictions */}
      <section className="section-lg">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-12">What we believe</p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-16 max-w-4xl">
            <ScrollReveal delay={0.1}>
              <div>
                <h3 className="h3 mb-4">Clarity over cleverness</h3>
                <p className="text-[#525252]">
                  Your website exists to help people find your church and
                  take a next step. Everything else is noise.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div>
                <h3 className="h3 mb-4">Design is stewardship</h3>
                <p className="text-[#525252]">
                  A thoughtful digital presence honors the work God is doing
                  in your community. It deserves real attention.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div>
                <h3 className="h3 mb-4">Pastors deserve partners</h3>
                <p className="text-[#525252]">
                  You have enough vendors. We want to understand your ministry
                  and serve it well over time.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div>
                <h3 className="h3 mb-4">Less is almost always more</h3>
                <p className="text-[#525252]">
                  We strip away the unnecessary so what matters can breathe.
                  Restraint is a discipline.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="section bg-[#fafafa]">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-8">How we work</p>
          </ScrollReveal>

          <div className="services-list">
            <ScrollReveal delay={0.1}>
              <div className="services-item">
                <span>We listen first</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="services-item">
                <span>We design with intention</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="services-item">
                <span>We build to last</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div className="services-item">
                <span>We stay available</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-lg">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="h2 mb-6">Let&apos;s talk about your church.</h2>
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
