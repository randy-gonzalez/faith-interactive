/**
 * SEO Services Page
 */

import type { Metadata } from "next";
import { CTASection } from "@/components/marketing/cta-section";
import { ServiceSchema } from "@/components/marketing/structured-data";

export const metadata: Metadata = {
  title: "SEO Services",
  description:
    "Church SEO services to help your community find you online. Local SEO, Google Business Profile optimization, and more.",
};

export default function SEOPage() {
  return (
    <>
      <ServiceSchema
        name="Church SEO Services"
        description="Search engine optimization services for churches. Help your community find you online with local SEO and Google optimization."
        url="https://faith-interactive.com/services/seo"
      />

      {/* Hero */}
      <section className="marketing-gradient py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            SEO Services
          </h1>
          <p className="text-xl text-[#000646]/80 max-w-2xl mx-auto">
            Help your community find you online. We optimize your church website
            so you show up when people search for churches in your area.
          </p>
        </div>
      </section>

      {/* Why SEO Matters */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#000646] mb-6">
                Why SEO Matters for Churches
              </h2>
              <p className="text-gray-600 mb-6">
                When someone new moves to your area and searches &ldquo;churches near me,&rdquo;
                will they find you? SEO ensures your church appears in those
                critical search results.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-[#77f2a1]/10 to-[#00ffce]/10 rounded-lg">
                  <p className="text-2xl font-bold text-gradient">46%</p>
                  <p className="text-sm text-gray-600">
                    of all Google searches are looking for local information
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-[#77f2a1]/10 to-[#00ffce]/10 rounded-lg">
                  <p className="text-2xl font-bold text-gradient">88%</p>
                  <p className="text-sm text-gray-600">
                    of local mobile searches result in a visit within 24 hours
                  </p>
                </div>
              </div>
            </div>
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#77f2a1]/20 to-[#00ffce]/20 flex items-center justify-center">
              <svg className="w-24 h-24 text-[#00d4aa]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 marketing-gradient-subtle">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#000646] text-center mb-12">
            What&apos;s Included in Our SEO Services
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Local SEO Optimization",
                description: "We optimize your site for local searches so people in your area can find you easily.",
                features: [
                  "NAP (Name, Address, Phone) consistency",
                  "Local keyword optimization",
                  "Location pages for multi-campus churches",
                ],
              },
              {
                title: "Google Business Profile",
                description: "We set up and optimize your Google Business Profile for maximum visibility.",
                features: [
                  "Profile setup and verification",
                  "Regular posts and updates",
                  "Review management strategy",
                ],
              },
              {
                title: "On-Page SEO",
                description: "We optimize every page of your site for search engines.",
                features: [
                  "Title tags and meta descriptions",
                  "Header tag optimization",
                  "Internal linking structure",
                ],
              },
              {
                title: "Technical SEO",
                description: "We ensure your site meets all technical requirements for ranking.",
                features: [
                  "Site speed optimization",
                  "Mobile-friendliness",
                  "Schema markup/structured data",
                ],
              },
            ].map((service) => (
              <div key={service.title} className="marketing-card p-6">
                <h3 className="font-bold text-[#000646] text-lg mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Ready to Be Found?"
        description="Schedule a free consultation and let's discuss how SEO can help your church grow."
        primaryCta={{ text: "Get Your Free Consultation", href: "/contact" }}
        secondaryCta={{ text: "View Pricing", href: "/pricing" }}
      />
    </>
  );
}
