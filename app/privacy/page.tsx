/**
 * Privacy & Terms Page
 *
 * Legal policies for Faith Interactive / Shift Agency, LLC
 * Covers: Terms of Service, Privacy Policy, SMS/Email Policy
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description:
    "Privacy policy, terms of service, and SMS/email policies for Faith Interactive and Shift Agency, LLC.",
};

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">Legal</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display hero-headline mb-8">
              Privacy & Terms
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-[#525252] text-large max-w-2xl">
              We keep things simple and transparent. Here&apos;s how we handle your data
              and what you can expect when working with us.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <p className="text-[#737373] text-sm mt-6 max-w-2xl">
              Faith Interactive is the church design ministry of Shift Agency, LLC.
              References to &quot;we,&quot; &quot;us,&quot; or &quot;our&quot; in these policies
              refer to Shift Agency, LLC and its Faith Interactive ministry.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Navigation */}
      <section className="section-sm border-b border-[#e5e5e5]">
        <div className="container container-narrow">
          <ScrollReveal>
            <div className="flex flex-wrap gap-4">
              <a href="#terms" className="text-sm text-[#525252] hover:text-[#0a0a0a] transition-colors">
                Terms of Service
              </a>
              <span className="text-[#d4d4d4]">·</span>
              <a href="#privacy" className="text-sm text-[#525252] hover:text-[#0a0a0a] transition-colors">
                Privacy Policy
              </a>
              <span className="text-[#d4d4d4]">·</span>
              <a href="#sms" className="text-sm text-[#525252] hover:text-[#0a0a0a] transition-colors">
                SMS & Email Policy
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Terms of Service */}
      <section id="terms" className="section">
        <div className="container container-narrow">
          <ScrollReveal>
            <h2 className="h2 mb-8">Terms of Service</h2>
          </ScrollReveal>

          <div className="space-y-8">
            <ScrollReveal delay={0.05}>
              <div>
                <h3 className="h3 mb-3">Agreement to Terms</h3>
                <p className="text-[#525252] text-large">
                  By engaging Faith Interactive (a ministry of Shift Agency, LLC) for website design,
                  development, or related services, you agree to these terms. We&apos;ll work together
                  in good faith to deliver a website that serves your church well.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div>
                <h3 className="h3 mb-3">Our Services</h3>
                <p className="text-[#525252] text-large">
                  We design and build websites for churches. This includes custom design, development,
                  content migration, and ongoing hosting through the Fi Platform. Project scope,
                  timeline, and deliverables are defined in your project agreement.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div>
                <h3 className="h3 mb-3">Fi Platform</h3>
                <p className="text-[#525252] text-large">
                  The Fi Platform is our month-to-month hosting and management service. It includes
                  hosting, SSL, daily backups, security updates, and support. You can cancel anytime
                  with 30 days notice, and we&apos;ll help you transition your site if needed.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div>
                <h3 className="h3 mb-3">Payment Terms</h3>
                <p className="text-[#525252] text-large">
                  Project payments are outlined in your agreement. Platform fees are billed monthly
                  and due upon receipt. We accept major credit cards and ACH transfers.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div>
                <h3 className="h3 mb-3">Intellectual Property</h3>
                <p className="text-[#525252] text-large">
                  Upon full payment, you own your website design and content. We retain the right
                  to showcase our work in our portfolio. Third-party assets (fonts, stock images)
                  are subject to their respective licenses.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div>
                <h3 className="h3 mb-3">Limitation of Liability</h3>
                <p className="text-[#525252] text-large">
                  Shift Agency, LLC provides services &quot;as is&quot; and makes no guarantees about
                  specific outcomes. Our liability is limited to the amount paid for services.
                  We&apos;re not liable for indirect, incidental, or consequential damages.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Privacy Policy */}
      <section id="privacy" className="section bg-[#fafafa]">
        <div className="container container-narrow">
          <ScrollReveal>
            <h2 className="h2 mb-8">Privacy Policy</h2>
          </ScrollReveal>

          <div className="space-y-8">
            <ScrollReveal delay={0.05}>
              <div>
                <h3 className="h3 mb-3">Information We Collect</h3>
                <p className="text-[#525252] text-large">
                  When you contact us or become a client, we collect basic information like your
                  name, email, phone number, and church details. We use this to communicate with
                  you and deliver our services.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div>
                <h3 className="h3 mb-3">How We Use Your Information</h3>
                <p className="text-[#525252] text-large">
                  We use your information to provide services, communicate about your project,
                  send invoices, and occasionally share updates about our work. We won&apos;t spam
                  you or sell your information.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div>
                <h3 className="h3 mb-3">Data Sharing</h3>
                <p className="text-[#525252] text-large">
                  Shift Agency, LLC does not share mobile numbers, text messaging originator opt-in
                  data, or consent with any third parties or affiliates for marketing or promotional
                  purposes.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div>
                <h3 className="h3 mb-3">Third-Party Service Providers</h3>
                <p className="text-[#525252] text-large">
                  We may share information with service providers who help us deliver our services,
                  such as payment processors, email providers, and hosting platforms. These providers
                  are bound by confidentiality agreements and may only use your information to
                  provide their services to us.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div>
                <h3 className="h3 mb-3">Data Security</h3>
                <p className="text-[#525252] text-large">
                  We take reasonable measures to protect your information. All websites on the Fi
                  Platform use SSL encryption. We don&apos;t store sensitive payment information on
                  our servers.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div>
                <h3 className="h3 mb-3">Your Rights</h3>
                <p className="text-[#525252] text-large">
                  You can request access to, correction of, or deletion of your personal information
                  at any time. Contact us at hello@faith-interactive.com and we&apos;ll respond
                  promptly.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SMS & Email Policy */}
      <section id="sms" className="section">
        <div className="container container-narrow">
          <ScrollReveal>
            <h2 className="h2 mb-8">SMS & Email Policy</h2>
          </ScrollReveal>

          <div className="space-y-8">
            <ScrollReveal delay={0.05}>
              <div>
                <h3 className="h3 mb-3">Opting In</h3>
                <p className="text-[#525252] text-large">
                  By providing your phone number and opting in to SMS messages from Shift Agency, LLC,
                  you agree to receive text messages for customer support, service updates, project
                  communications, and other information related to your account.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div>
                <h3 className="h3 mb-3">Message Frequency</h3>
                <p className="text-[#525252] text-large">
                  Message frequency varies based on your project status and communication needs.
                  You&apos;ll typically receive messages related to project milestones, support
                  responses, and important updates. We don&apos;t send marketing messages via SMS.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div>
                <h3 className="h3 mb-3">Opting Out</h3>
                <p className="text-[#525252] text-large">
                  You can cancel SMS service at any time by texting <strong>STOP</strong>. After
                  you send STOP, we&apos;ll confirm your unsubscription. You won&apos;t receive any
                  more SMS messages from us unless you opt in again.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div>
                <h3 className="h3 mb-3">Getting Help</h3>
                <p className="text-[#525252] text-large">
                  If you&apos;re experiencing issues with our messaging program, reply with
                  <strong> HELP</strong> for assistance, or contact us directly at
                  hello@faith-interactive.com.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div>
                <h3 className="h3 mb-3">Rates & Carrier Liability</h3>
                <p className="text-[#525252] text-large">
                  Standard message and data rates may apply. Contact your wireless provider for
                  details about your text and data plan. Carriers are not liable for delayed or
                  undelivered messages.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div>
                <h3 className="h3 mb-3">SMS Data Privacy</h3>
                <p className="text-[#525252] text-large">
                  Mobile information may be shared only with subcontractors and service providers
                  that support SMS delivery, such as messaging platforms, telecommunications
                  providers, or customer support vendors. This information is used solely to
                  provide and operate the messaging service. All other uses exclude text messaging
                  opt-in data and consent—this information will not be shared with any third parties.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Last Updated & Contact */}
      <section className="section-sm border-t border-[#e5e5e5]">
        <div className="container container-narrow">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-sm text-[#a3a3a3]">
                Last updated: January 2025
              </p>
              <Link href="/contact" className="text-sm text-[#525252] hover:text-[#0a0a0a] transition-colors">
                Questions? Get in touch →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
