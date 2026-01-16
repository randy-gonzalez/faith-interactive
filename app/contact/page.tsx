/**
 * Contact Page
 *
 * Purpose: Make it easy to start a conversation.
 * Answer: "How do I get in touch?"
 *
 * Intentionally excluded:
 * - "What happens next" steps (overly procedural)
 * - Testimonial quotes (save for case studies)
 * - Gradient backgrounds
 * - Marketing language
 */

import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch about your church website. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">Contact</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display hero-headline mb-8">
              Let&apos;s talk.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-large text-[#525252] max-w-xl">
              Tell us about your church. We&apos;ll get back to you
              within a day or two.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl">
            {/* Form */}
            <div>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div className="lg:pt-4">
              <ScrollReveal>
                <p className="text-micro text-[#737373] mb-8">Or reach out directly</p>
              </ScrollReveal>

              <div className="space-y-8">
                <ScrollReveal delay={0.1}>
                  <div>
                    <p className="text-[#737373] text-sm mb-1">Email</p>
                    <a
                      href="mailto:hello@faith-interactive.com"
                      className="text-xl font-medium hover:text-[#4f76f6] transition-colors"
                    >
                      hello@faith-interactive.com
                    </a>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={0.15}>
                  <div>
                    <p className="text-[#737373] text-sm mb-1">Phone</p>
                    <a
                      href="tel:+19498054031"
                      className="text-xl font-medium hover:text-[#4f76f6] transition-colors"
                    >
                      (949) 805-4031
                    </a>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                  <div>
                    <p className="text-[#737373] text-sm mb-1">Location</p>
                    <p className="text-xl font-medium">Orange County, California</p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
