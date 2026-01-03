/**
 * Contact Page
 *
 * Consultation request form for Faith Interactive.
 */

import type { Metadata } from "next";
import { ConsultationForm } from "@/components/marketing/consultation-form";
import { PhoneCTA } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Schedule a free consultation for your church website. We'll discuss your needs and provide a custom quote. Call (833) 307-1917 or fill out our contact form.",
};

interface PageProps {
  searchParams: Promise<{ package?: string }>;
}

export default async function ContactPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const preselectedPackage = params.package;

  return (
    <>
      {/* Hero */}
      <section className="marketing-gradient py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            Let&apos;s Build Your Church&apos;s Website
          </h1>
          <p className="text-xl text-[#000646]/80 max-w-2xl mx-auto">
            Schedule a free consultation and we&apos;ll discuss how to create the
            perfect online presence for your church.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="marketing-card p-8">
                <h2 className="text-2xl font-bold text-[#000646] mb-6">
                  Request Your Free Consultation
                </h2>
                <ConsultationForm preselectedPackage={preselectedPackage} />
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#000646] mb-6">
                  Other Ways to Reach Us
                </h2>

                <div className="space-y-6">
                  <div>
                    <PhoneCTA />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#000646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email us</p>
                      <a
                        href="mailto:hello@faith-interactive.com"
                        className="text-lg font-semibold text-[#000646] hover:text-[#00d4aa] transition-colors"
                      >
                        hello@faith-interactive.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="marketing-card p-6">
                <h3 className="font-bold text-[#000646] mb-4">What Happens Next?</h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center text-[#000646] font-bold flex-shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-[#000646]">We&apos;ll reach out</p>
                      <p className="text-sm text-gray-600">
                        Within 24 hours, we&apos;ll contact you to schedule a call.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center text-[#000646] font-bold flex-shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-[#000646]">Discovery call</p>
                      <p className="text-sm text-gray-600">
                        We&apos;ll learn about your church and website needs.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center text-[#000646] font-bold flex-shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-[#000646]">Custom proposal</p>
                      <p className="text-sm text-gray-600">
                        You&apos;ll receive a detailed proposal with timeline and pricing.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="p-6 bg-gradient-to-br from-[#77f2a1]/10 to-[#00ffce]/10 rounded-xl">
                <p className="text-[#000646] font-medium">
                  &ldquo;Working with Faith Interactive was a blessing. They understood
                  our vision and brought it to life.&rdquo;
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  — Pastor Mike, Community Church
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
