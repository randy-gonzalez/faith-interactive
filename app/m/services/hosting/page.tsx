/**
 * Hosting Services Page
 */

import type { Metadata } from "next";
import { CTASection } from "@/components/marketing/cta-section";
import { ServiceSchema } from "@/components/marketing/structured-data";

export const metadata: Metadata = {
  title: "VPS Cloud Hosting & Support",
  description:
    "Reliable VPS cloud hosting for church websites. 99.9% uptime, SSL included, daily backups, and dedicated support.",
};

export default function HostingPage() {
  return (
    <>
      <ServiceSchema
        name="Church VPS Cloud Hosting & Support"
        description="Reliable VPS cloud hosting for church websites with 99.9% uptime, SSL certificates, daily backups, and dedicated support."
        url="https://faith-interactive.com/services/hosting"
      />

      {/* Hero */}
      <section className="marketing-gradient py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            VPS Cloud Hosting & Support
          </h1>
          <p className="text-xl text-[#000646]/80 max-w-2xl mx-auto">
            Fast, secure, and reliable hosting with dedicated support.
            Your church website is always online and always protected.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "99.9% Uptime",
                description: "Your website is available when your congregation needs it. We guarantee reliable uptime.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                ),
              },
              {
                title: "SSL Certificate",
                description: "Free SSL certificate included. The padlock icon shows visitors your site is secure.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ),
              },
              {
                title: "Daily Backups",
                description: "Automatic daily backups mean your content is always safe. We can restore quickly if needed.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                ),
              },
              {
                title: "Security Monitoring",
                description: "We monitor for threats 24/7 and keep your software updated to prevent vulnerabilities.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
              },
              {
                title: "Fast Performance",
                description: "VPS hosting means dedicated resources. Your site loads fast, every time.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                ),
              },
              {
                title: "Dedicated Support",
                description: "Real people ready to help. Email or call us when you need assistance.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                ),
              },
            ].map((feature) => (
              <div key={feature.title} className="marketing-card p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#000646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="font-bold text-[#000646] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 marketing-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#000646] mb-4">
            Simple Hosting Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            All hosting plans include the same great features.
          </p>

          <div className="marketing-card p-8 max-w-md mx-auto">
            <p className="text-4xl font-bold text-[#000646] mb-2">
              $25<span className="text-lg font-normal text-gray-500">/month</span>
            </p>
            <p className="text-gray-600 mb-6">Everything included. No surprises.</p>
            <ul className="space-y-3 text-left mb-8">
              {[
                "VPS cloud hosting",
                "SSL certificate",
                "Daily backups",
                "Security monitoring",
                "Software updates",
                "Email support",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <a href="/contact" className="btn-marketing-primary w-full block text-center">
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Ready for Reliable Hosting?"
        description="Get your church website on fast, secure hosting with dedicated support."
        primaryCta={{ text: "Get Your Free Consultation", href: "/contact" }}
        secondaryCta={{ text: "View All Services", href: "/services" }}
      />
    </>
  );
}
