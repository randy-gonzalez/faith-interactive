/**
 * Website Design Service Page
 */

import type { Metadata } from "next";
import { CTASection } from "@/components/marketing/cta-section";
import { ServiceSchema } from "@/components/marketing/structured-data";

export const metadata: Metadata = {
  title: "Website Design & Development",
  description:
    "Custom church website design and development. Mobile-responsive, easy to manage, and built to help your congregation connect.",
};

export default function WebsiteDesignPage() {
  return (
    <>
      <ServiceSchema
        name="Church Website Design & Development"
        description="Custom church website design and development services. Mobile-responsive, easy to manage, and built to help your congregation connect."
        url="https://faith-interactive.com/services/website-design"
      />

      {/* Hero */}
      <section className="marketing-gradient py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            Website Design & Development
          </h1>
          <p className="text-xl text-[#000646]/80 max-w-2xl mx-auto">
            Beautiful, functional websites designed specifically for churches.
            Easy to manage, mobile-responsive, and built to grow with you.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-[#000646] mb-6">
                Designed for Churches
              </h2>
              <p className="text-gray-600 mb-6">
                We understand the unique needs of churches. Your website needs to
                welcome visitors, share your message, and help people get connected.
                That&apos;s exactly what we build.
              </p>
              <ul className="space-y-4">
                {[
                  "Custom design that reflects your church's identity",
                  "Mobile-responsive on phones, tablets, and desktops",
                  "Fast loading speeds for better user experience",
                  "Accessible design for all visitors",
                  "Integration with your existing tools",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#77f2a1]/20 to-[#00ffce]/20 flex items-center justify-center">
              <svg className="w-24 h-24 text-[#00d4aa]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 marketing-gradient-subtle">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#000646] text-center mb-12">
            Everything Your Church Website Needs
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Sermon Library",
                description: "Upload, organize, and share your sermons with video, audio, and notes all in one place.",
              },
              {
                title: "Event Calendar",
                description: "Create events, manage registrations, and keep your congregation informed.",
              },
              {
                title: "Staff Directory",
                description: "Showcase your leadership team with photos, bios, and contact information.",
              },
              {
                title: "Contact Forms",
                description: "Let visitors reach out easily with customizable contact and prayer request forms.",
              },
              {
                title: "Blog/Announcements",
                description: "Share updates, devotionals, and news with your community.",
              },
              {
                title: "Easy Content Management",
                description: "Update your site yourself with our intuitive admin dashboard.",
              },
            ].map((feature) => (
              <div key={feature.title} className="marketing-card p-6">
                <h3 className="font-bold text-[#000646] mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#000646] text-center mb-12">
            Our Design Process
          </h2>
          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Discovery",
                description: "We learn about your church, your congregation, and your goals for your website.",
              },
              {
                step: 2,
                title: "Design",
                description: "We create a custom design that reflects your church's identity and values.",
              },
              {
                step: 3,
                title: "Development",
                description: "We build your site with all the features you need, fully tested and optimized.",
              },
              {
                step: 4,
                title: "Launch",
                description: "We deploy your site and train you on how to manage it.",
              },
            ].map((step) => (
              <div key={step.step} className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#000646] font-bold text-lg">{step.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#000646] text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Ready for a New Website?"
        description="Schedule a free consultation and let's discuss your church's website needs."
        primaryCta={{ text: "Get Your Free Consultation", href: "/contact" }}
        secondaryCta={{ text: "View Pricing", href: "/pricing" }}
      />
    </>
  );
}
