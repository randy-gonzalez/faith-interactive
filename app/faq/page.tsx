/**
 * FAQ Page
 *
 * Purpose: Answer common questions honestly.
 * Answer: "What do I need to know before reaching out?"
 *
 * Intentionally excluded:
 * - Accordion UI (just show the answers)
 * - Gradient backgrounds
 * - Multiple CTAs
 */

import type { Metadata } from "next";
import Link from "next/link";
import { FAQStructuredData } from "@/components/marketing/faq-accordion";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about working with Faith Interactive on your church website.",
};

const FAQ_ITEMS = [
  {
    question: "Why is it free for church plants?",
    answer:
      "We believe every new church deserves a solid online presence. You have enough financial challenges, and your website shouldn't be one of them. You just cover the monthly platform cost.",
  },
  {
    question: "How long does a project take?",
    answer:
      "Most church websites are ready in 2-4 weeks. It depends on how quickly you can provide content and feedback. We'll give you a real timeline after we talk.",
  },
  {
    question: "Can I update the site myself?",
    answer:
      "Yes. Every site comes with an admin dashboard where you can update content, add events, and upload sermons. We'll show you how it works.",
  },
  {
    question: "What's included in the Fi Platform?",
    answer:
      "The Fi Platform is your church admin: manage sermons, events, pages, and more. It includes daily backups, security updates, SSL certificate, and real support when you need it. $25/month, everything included.",
  },
  {
    question: "Do you work with existing sites?",
    answer:
      "Yes. We can migrate your content, preserve what's working, and improve what isn't. If you have a domain, we'll help you transfer it.",
  },
  {
    question: "What about integrations?",
    answer:
      "We work with Planning Center, Subsplash, Tithe.ly, and most other church tools. Tell us what you use and we'll make it work.",
  },
  {
    question: "What if I don't like the design?",
    answer:
      "We work with you throughout the process, so this rarely happens. But we include revisions to make sure you're happy with the result.",
  },
  {
    question: "Any contracts or commitments?",
    answer:
      "The Fi Platform is month-to-month. No long-term contracts. If you ever want to leave, we'll help you transition.",
  },
];

export default function FAQPage() {
  return (
    <>
      <FAQStructuredData items={FAQ_ITEMS} />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">FAQ</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display hero-headline mb-8">
              Common questions
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ List */}
      <section className="section">
        <div className="container container-narrow">
          <div className="space-y-16">
            {FAQ_ITEMS.map((item, index) => (
              <ScrollReveal key={item.question} delay={0.05 * index}>
                <div>
                  <h2 className="h3 mb-4">{item.question}</h2>
                  <p className="text-[#525252] text-large">{item.answer}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-lg bg-[#fafafa]">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="h2 mb-4">Still have questions?</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-[#525252] mb-8">
              We&apos;re happy to talk through anything.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <Link href="/contact" className="btn-primary">
              Get in touch
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
