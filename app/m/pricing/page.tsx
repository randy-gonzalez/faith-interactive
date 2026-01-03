/**
 * Pricing Page
 *
 * Full pricing details for Faith Interactive services.
 */

import type { Metadata } from "next";
import { PricingTable } from "@/components/marketing/pricing-table";
import { CTASectionDark } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for church website design. FREE for church plants, $500 for small churches, $1,500 for large churches. All include $25/mo hosting.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="marketing-gradient-subtle py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No hidden fees, no surprises. Choose the package that fits your church&apos;s
            needs and budget.
          </p>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <PricingTable showUpdateOption={true} />
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 marketing-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#000646] text-center mb-12">
            What&apos;s Included in Every Package
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="marketing-card p-6">
              <h3 className="font-bold text-[#000646] mb-4">Design & Development</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Custom design tailored to your church</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Mobile-responsive on all devices</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Easy-to-use content management</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Sermon library management</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Event calendar with registration</span>
                </li>
              </ul>
            </div>

            <div className="marketing-card p-6">
              <h3 className="font-bold text-[#000646] mb-4">Hosting & Support</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">VPS cloud hosting (99.9% uptime)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">SSL certificate included</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Daily automated backups</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Security monitoring & updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Email support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#000646] text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="marketing-card p-6">
              <h3 className="font-bold text-[#000646] mb-2">
                Why is it free for church plants?
              </h3>
              <p className="text-gray-600">
                We believe every new church deserves a professional online presence.
                Church plants have enough financial challenges - your website shouldn&apos;t
                be one of them. You just pay the monthly hosting fee.
              </p>
            </div>

            <div className="marketing-card p-6">
              <h3 className="font-bold text-[#000646] mb-2">
                What&apos;s the difference between packages?
              </h3>
              <p className="text-gray-600">
                The main differences are the level of customization and features.
                Church Plants get a beautiful, functional site. Small Churches get
                more pages and SEO optimization. Large Churches get unlimited pages,
                advanced features, and dedicated support.
              </p>
            </div>

            <div className="marketing-card p-6">
              <h3 className="font-bold text-[#000646] mb-2">
                What does the $100/month update service include?
              </h3>
              <p className="text-gray-600">
                This optional service covers ongoing content updates, new page creation,
                design tweaks, and keeping your site fresh. It&apos;s perfect for churches
                that want a hands-off approach to website maintenance.
              </p>
            </div>

            <div className="marketing-card p-6">
              <h3 className="font-bold text-[#000646] mb-2">
                How long does it take to build a website?
              </h3>
              <p className="text-gray-600">
                Most church websites are completed within 2-4 weeks, depending on the
                package and how quickly you provide content. We&apos;ll give you a more
                specific timeline during your consultation.
              </p>
            </div>

            <div className="marketing-card p-6">
              <h3 className="font-bold text-[#000646] mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes. The hosting is month-to-month with no long-term contracts.
                If you decide to leave, we&apos;ll help you export your content.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href="/faq" className="text-[#00d4aa] font-semibold hover:underline">
              View all FAQs →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASectionDark
        title="Ready to Get Started?"
        description="Schedule a free consultation to discuss your church's needs and get a custom quote."
        primaryCta={{ text: "Get Your Free Consultation", href: "/contact" }}
        secondaryCta={{ text: "Call (833) 307-1917", href: "tel:+18333071917" }}
      />
    </>
  );
}
