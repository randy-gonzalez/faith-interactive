/**
 * Services Overview Page
 *
 * Overview of all Faith Interactive services.
 */

import type { Metadata } from "next";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Church website design, SEO services, and VPS cloud hosting. Everything your church needs for a professional online presence.",
};

const SERVICES = [
  {
    title: "Website Design & Development",
    description:
      "Custom-designed, mobile-responsive websites that showcase your church's unique identity and help visitors connect with your community.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    ),
    href: "/services/website-design",
    features: [
      "Custom design tailored to your church",
      "Mobile-responsive on all devices",
      "Easy-to-use content management",
      "Sermon library & event calendar",
      "Contact forms & prayer requests",
    ],
  },
  {
    title: "SEO Services",
    description:
      "Help your community find you online with search engine optimization that puts your church at the top of local search results.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    ),
    href: "/services/seo",
    features: [
      "Local SEO optimization",
      "Google Business Profile setup",
      "Keyword research & optimization",
      "Meta tags & structured data",
      "Performance optimization",
    ],
  },
  {
    title: "VPS Cloud Hosting & Support",
    description:
      "Fast, secure, and reliable hosting with SSL certificates, daily backups, and dedicated support when you need it.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    ),
    href: "/services/hosting",
    features: [
      "99.9% uptime guarantee",
      "SSL certificate included",
      "Daily automated backups",
      "Security monitoring & updates",
      "Email & phone support",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="marketing-gradient-subtle py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            Everything Your Church Needs Online
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From beautiful design to reliable hosting, we provide complete solutions
            so you can focus on what matters most — your ministry.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="space-y-16">
            {SERVICES.map((service, index) => (
              <div
                key={service.title}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-[#000646]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {service.icon}
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-[#000646] mb-4">
                    {service.title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-[#00d4aa] flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={service.href}
                    className="btn-marketing-primary inline-block"
                  >
                    Learn More →
                  </a>
                </div>
                <div
                  className={`aspect-video rounded-2xl bg-gradient-to-br from-[#77f2a1]/20 to-[#00ffce]/20 flex items-center justify-center ${
                    index % 2 === 1 ? "md:order-1" : ""
                  }`}
                >
                  <svg
                    className="w-24 h-24 text-[#00d4aa]/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {service.icon}
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 marketing-gradient-subtle">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#000646] text-center mb-12">
            Why Churches Choose Faith Interactive
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-gradient">10+</span>
              </div>
              <h3 className="font-bold text-[#000646] mb-2">Years Experience</h3>
              <p className="text-gray-600">
                Helping churches build their online presence since 2014.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-gradient">100+</span>
              </div>
              <h3 className="font-bold text-[#000646] mb-2">Churches Served</h3>
              <p className="text-gray-600">
                From small church plants to megachurches.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-gradient">99.9%</span>
              </div>
              <h3 className="font-bold text-[#000646] mb-2">Uptime</h3>
              <p className="text-gray-600">
                Reliable hosting you can count on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Ready to Get Started?"
        description="Schedule a free consultation and let's discuss how we can help your church reach more people online."
        primaryCta={{ text: "Get Your Free Consultation", href: "/contact" }}
        secondaryCta={{ text: "View Pricing", href: "/pricing" }}
      />
    </>
  );
}
