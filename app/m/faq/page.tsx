/**
 * FAQ Page
 */

import type { Metadata } from "next";
import { FAQAccordion, FAQStructuredData } from "@/components/marketing/faq-accordion";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Common questions about Faith Interactive's church website services, pricing, process, and support.",
};

const FAQ_ITEMS = [
  {
    question: "Why is website design free for church plants?",
    answer:
      "We believe every new church deserves a professional online presence, regardless of budget. Church plants face enough financial challenges — your website shouldn't be one of them. You only pay the $25/month hosting fee, which covers server costs and ongoing support.",
  },
  {
    question: "What's the difference between the pricing tiers?",
    answer:
      "Church Plants receive a beautiful, functional website with all the essentials. Small Church packages include additional pages, advanced SEO, and priority support. Large Church packages offer unlimited pages, custom features, multi-campus support, and a dedicated account manager.",
  },
  {
    question: "How long does it take to build a website?",
    answer:
      "Most church websites are completed within 2-4 weeks, depending on the package and how quickly you provide content. During our initial consultation, we'll give you a more specific timeline based on your needs.",
  },
  {
    question: "Can I update the website myself?",
    answer:
      "Yes! Every website comes with an easy-to-use admin dashboard where you can update content, add events, upload sermons, and more. We also provide training and documentation to help you get started.",
  },
  {
    question: "What does the $100/month update service include?",
    answer:
      "This optional service is perfect for churches that prefer a hands-off approach. We handle ongoing content updates, new page creation, design tweaks, and keeping your site fresh. Just email us what you need, and we'll take care of it.",
  },
  {
    question: "Do you provide hosting?",
    answer:
      "Yes, all packages include VPS cloud hosting for $25/month. This includes a 99.9% uptime guarantee, SSL certificate, daily backups, security monitoring, and software updates. You don't need to worry about the technical stuff.",
  },
  {
    question: "What if I already have a website?",
    answer:
      "We can migrate your existing content to your new site. We'll work with you to preserve what's working and improve what isn't. If you have a custom domain, we'll help you transfer it seamlessly.",
  },
  {
    question: "Do you help with domain names?",
    answer:
      "Yes! We can help you purchase a new domain or transfer an existing one. We'll also set up your email if needed. Domain registration is typically $15-20/year depending on the extension.",
  },
  {
    question: "What about SEO?",
    answer:
      "All packages include basic SEO setup with proper meta tags, site structure, and Google indexing. Our Small and Large Church packages include advanced SEO with local optimization, Google Business Profile setup, and ongoing keyword optimization.",
  },
  {
    question: "Can you integrate with our church management software?",
    answer:
      "Absolutely! We can integrate with popular platforms like Planning Center, Subsplash, Church Community Builder, Tithe.ly, and many others. Let us know what tools you use during your consultation.",
  },
  {
    question: "What if I'm not happy with the design?",
    answer:
      "We work closely with you throughout the design process to ensure you love the result. Church Plants receive one round of revisions, Small Churches get two rounds, and Large Churches get unlimited revisions until you're completely satisfied.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Hosting is month-to-month with no long-term contracts. If you decide to leave, we'll help you export your content and provide a backup of your site. We hope you'll stay, but we won't lock you in.",
  },
];

export default function FAQPage() {
  return (
    <>
      <FAQStructuredData items={FAQ_ITEMS} />

      {/* Hero */}
      <section className="marketing-gradient-subtle py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about working with Faith Interactive.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <FAQAccordion items={FAQ_ITEMS} defaultOpen={0} />
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 marketing-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#000646] mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-8">
            We&apos;re here to help. Reach out and we&apos;ll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/contact" className="btn-marketing-primary">
              Contact Us
            </a>
            <a
              href="tel:+18333071917"
              className="text-[#000646] font-semibold hover:underline"
            >
              Or call (833) 307-1917
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Ready to Get Started?"
        description="Schedule a free consultation and let's discuss your church's website needs."
        primaryCta={{ text: "Get Your Free Consultation", href: "/contact" }}
        secondaryCta={{ text: "View Pricing", href: "/pricing" }}
      />
    </>
  );
}
