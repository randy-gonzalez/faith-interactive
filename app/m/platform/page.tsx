/**
 * Fi Platform Page
 *
 * Purpose: Showcase the Fi Platform admin capabilities.
 * Answer: "What tools do I get to manage my church website?"
 *
 * Highlights:
 * - Sermon management
 * - Event organization
 * - Donation platform integrations
 * - Easy content management
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "Fi Platform",
  description:
    "The Fi Platform gives churches a simple, powerful way to manage sermons, events, and content, all in one place. Works with every donation platform.",
};

export default function PlatformPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">Fi Platform</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display hero-headline mb-8">
              Your website.
              <br />
              Your control.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-large text-[#525252] max-w-2xl">
              The Fi Platform is a simple admin built for churches, not developers.
              Manage sermons, events, and content without calling us every time.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section bg-[#fafafa]">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="manifesto">
              Church staff have better things to do than fight with their website.
              We built the Fi Platform so you can update what you need and get back
              to ministry.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Core Features */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl">
            {/* Sermons */}
            <ScrollReveal>
              <div className="py-16 border-b border-[#e5e5e5]">
                <p className="text-micro text-[#737373] mb-4">01</p>
                <h2 className="h2 mb-6">Sermon Management</h2>
                <p className="text-large text-[#525252] max-w-2xl mb-8">
                  Add new sermons in seconds. Upload audio, embed video, attach notes,
                  and organize by series or speaker. Your congregation can find any
                  message, anytime.
                </p>
                <div className="flex flex-wrap gap-6 text-[#737373]">
                  <span>Video & audio</span>
                  <span>Series organization</span>
                  <span>Scripture references</span>
                  <span>Speaker profiles</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Events */}
            <ScrollReveal>
              <div className="py-16 border-b border-[#e5e5e5]">
                <p className="text-micro text-[#737373] mb-4">02</p>
                <h2 className="h2 mb-6">Event Organization</h2>
                <p className="text-large text-[#525252] max-w-2xl mb-8">
                  From weekly gatherings to special events, you can create, schedule, and
                  promote everything in one place. Visitors see what&apos;s happening
                  and how to join.
                </p>
                <div className="flex flex-wrap gap-6 text-[#737373]">
                  <span>Calendar view</span>
                  <span>Registration links</span>
                  <span>Recurring events</span>
                  <span>Location details</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Content */}
            <ScrollReveal>
              <div className="py-16 border-b border-[#e5e5e5]">
                <p className="text-micro text-[#737373] mb-4">03</p>
                <h2 className="h2 mb-6">Simple Content Editing</h2>
                <p className="text-large text-[#525252] max-w-2xl mb-8">
                  Update pages, add announcements, and change service times yourself.
                  No technical knowledge required. If you can write an email, you can
                  update your website.
                </p>
                <div className="flex flex-wrap gap-6 text-[#737373]">
                  <span>Visual editor</span>
                  <span>Page management</span>
                  <span>Announcements</span>
                  <span>Staff profiles</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Donations */}
            <ScrollReveal>
              <div className="py-16">
                <p className="text-micro text-[#737373] mb-4">04</p>
                <h2 className="h2 mb-6">Works With Your Giving Platform</h2>
                <p className="text-large text-[#525252] max-w-2xl mb-8">
                  Already using Tithe.ly, Planning Center Giving, Pushpay, or another
                  donation platform? Good. We integrate with all of them. No switching
                  required.
                </p>
                <div className="flex flex-wrap gap-6 text-[#737373]">
                  <span>Tithe.ly</span>
                  <span>Pushpay</span>
                  <span>Planning Center</span>
                  <span>Subsplash</span>
                  <span>+ more</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-[#fafafa]">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-8">Built for churches</p>
          </ScrollReveal>

          <div className="services-list">
            <ScrollReveal delay={0.1}>
              <div className="services-item">
                <span>No technical skills needed</span>
                <span className="text-[#737373] text-sm hidden sm:block">
                  Anyone on staff can use it
                </span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="services-item">
                <span>Update from anywhere</span>
                <span className="text-[#737373] text-sm hidden sm:block">
                  Desktop, tablet, or phone
                </span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="services-item">
                <span>Changes go live instantly</span>
                <span className="text-[#737373] text-sm hidden sm:block">
                  No waiting, no approval queues
                </span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div className="services-item">
                <span>We&apos;re still here to help</span>
                <span className="text-[#737373] text-sm hidden sm:block">
                  Support when you need it
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="section">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-12">
              Works with what you already use
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <ScrollReveal delay={0.1}>
              <div className="text-center">
                <p className="font-medium mb-1">Tithe.ly</p>
                <p className="text-sm text-[#737373]">Giving</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <div className="text-center">
                <p className="font-medium mb-1">Pushpay</p>
                <p className="text-sm text-[#737373]">Giving</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.14}>
              <div className="text-center">
                <p className="font-medium mb-1">Planning Center</p>
                <p className="text-sm text-[#737373]">ChMS</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.16}>
              <div className="text-center">
                <p className="font-medium mb-1">Subsplash</p>
                <p className="text-sm text-[#737373]">Giving & App</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.18}>
              <div className="text-center">
                <p className="font-medium mb-1">YouTube</p>
                <p className="text-sm text-[#737373]">Video</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="text-center">
                <p className="font-medium mb-1">Vimeo</p>
                <p className="text-sm text-[#737373]">Video</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.22}>
              <div className="text-center">
                <p className="font-medium mb-1">Mailchimp</p>
                <p className="text-sm text-[#737373]">Email</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.24}>
              <div className="text-center">
                <p className="font-medium mb-1">+ More</p>
                <p className="text-sm text-[#737373]">Just ask</p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <div className="p-6 bg-[#fafafa] border border-[#e5e5e5] rounded-sm">
              <p className="text-[#525252]">
                <span className="font-medium text-[#171717]">
                  Don&apos;t see your platform?
                </span>{" "}
                We can integrate with most church management and giving tools.
                Let us know what you use.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section-lg bg-[#fafafa]">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="h2 mb-4">Ready to take control of your website?</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-[#525252] mb-8">
              See how the Fi Platform makes managing your church website simple.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link href="/contact" className="btn-primary">
                Get a demo
              </Link>
              <Link href="/pricing" className="btn-ghost">
                View pricing
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
