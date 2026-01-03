/**
 * About Page
 *
 * Mission, story, and values.
 */

import type { Metadata } from "next";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Faith Interactive helps churches build beautiful, effective websites. Learn about our mission, story, and values.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="marketing-gradient py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            About Faith Interactive
          </h1>
          <p className="text-xl text-[#000646]/80 max-w-2xl mx-auto">
            Helping churches reach more people through beautiful, effective websites.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#000646] mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600">
              To empower churches of all sizes with professional digital presence,
              so they can focus on what matters most — ministry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Accessibility",
                description:
                  "We believe every church deserves a great website, regardless of size or budget. That's why we offer free websites for church plants.",
              },
              {
                title: "Excellence",
                description:
                  "Your church deserves more than a template. We create custom designs that reflect your unique identity and values.",
              },
              {
                title: "Partnership",
                description:
                  "We're not just vendors — we're partners in your ministry. We're here to support you for the long haul.",
              },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <h3 className="font-bold text-[#000646] text-lg mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 marketing-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#000646] text-center mb-8">
            Our Story
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              Faith Interactive was born from a simple observation: too many churches
              were struggling with outdated, ineffective websites that didn&apos;t serve
              their congregations or communities well.
            </p>
            <p>
              We saw churches paying thousands of dollars for generic templates that
              didn&apos;t represent who they were. We saw church plants trying to establish
              themselves online with no budget for professional help. We saw pastors
              spending hours fighting with website builders when they should have been
              focusing on ministry.
            </p>
            <p>
              So we decided to do something about it. We created Faith Interactive to
              be the partner churches need — one that understands the unique challenges
              of church ministry, offers fair and transparent pricing, and delivers
              websites that actually work.
            </p>
            <p>
              Today, we&apos;ve helped over 100 churches transform their online presence.
              From small church plants meeting in living rooms to established churches
              with multiple campuses, we&apos;ve seen firsthand how a great website can
              help churches connect with their communities and grow their ministry.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#000646] text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Ministry First",
                description:
                  "Your website should serve your ministry, not the other way around. We design with your mission in mind.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                ),
              },
              {
                title: "Transparency",
                description:
                  "No hidden fees, no surprises. We believe in honest pricing and clear communication every step of the way.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                ),
              },
              {
                title: "Quality",
                description:
                  "We don't cut corners. Every website we build is designed with care, optimized for performance, and built to last.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                ),
              },
              {
                title: "Support",
                description:
                  "We're here when you need us. Real people, ready to help you succeed with your website.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                ),
              },
            ].map((value) => (
              <div key={value.title} className="marketing-card p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-[#000646]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {value.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#000646] mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Ready to Work Together?"
        description="Schedule a free consultation and let's discuss how we can help your church."
        primaryCta={{ text: "Get Your Free Consultation", href: "/contact" }}
        secondaryCta={{ text: "View Our Work", href: "/case-studies" }}
      />
    </>
  );
}
