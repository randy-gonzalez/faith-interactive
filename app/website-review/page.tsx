/**
 * First-Time Visitor Website Review Landing Page
 *
 * Lead magnet offering a free website review from a first-time visitor's
 * perspective. Designed to be minimal, mission-forward, and supportive.
 *
 * Target audience: Pastors and church staff
 * Tone: Calm, warm, confident. Ministry support, not marketing.
 */

import type { Metadata } from "next";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { WebsiteReviewForm } from "@/components/marketing/website-review-form";
import { db } from "@/lib/db/neon";

// Force dynamic rendering - database queries at runtime
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Church Website Review for First-Time Visitors | Faith Interactive",
  description:
    "Get a free review of your church website from a first-time visitor's perspective. Receive a checklist and clear recommendations within 48 hours.",
};

export default async function WebsiteReviewPage() {
  // Fetch active church partners from database (with fallback for local dev)
  let churchPartners: { id: string; name: string; logoUrl: string }[] = [];
  try {
    churchPartners = await db.churchPartner.findMany({
      where: { isActive: true },
    });
  } catch {
    // Database unavailable (local dev) - use blob URLs
    churchPartners = [
      { id: "1", name: "Calvary Chapel Downey", logoUrl: "https://assets.faith-interactive.com/church-partners/calvary-chapel-downey.png" },
      { id: "2", name: "Harvest Crusades", logoUrl: "https://assets.faith-interactive.com/church-partners/harvest-crusades.png" },
      { id: "3", name: "CHEA", logoUrl: "https://assets.faith-interactive.com/church-partners/chea.png" },
      { id: "4", name: "Kerusso", logoUrl: "https://assets.faith-interactive.com/church-partners/kerusso.png" },
      { id: "5", name: "Redeemer City Church", logoUrl: "https://assets.faith-interactive.com/church-partners/redeemer-city-church.png" },
      { id: "6", name: "Calvary Chapel Golden Springs", logoUrl: "https://assets.faith-interactive.com/church-partners/calvary-chapel-golden-springs.png" },
      { id: "7", name: "Calvary Chapel Santa Fe Springs", logoUrl: "https://assets.faith-interactive.com/church-partners/calvary-chapel-santa-fe-springs.png" },
      { id: "8", name: "Coaches of Influence", logoUrl: "https://assets.faith-interactive.com/church-partners/coaches-of-influence.png" },
      { id: "9", name: "The Sending Church", logoUrl: "https://assets.faith-interactive.com/church-partners/the-sending-church.png" },
      { id: "10", name: "New Life Christian Fellowship", logoUrl: "https://assets.faith-interactive.com/church-partners/new-life-christian-fellowship.png" },
      { id: "11", name: "Calvary Chapel Ascend", logoUrl: "https://assets.faith-interactive.com/church-partners/calvary-chapel-ascend.png" },
      { id: "12", name: "Calvary Chapel Inglewood", logoUrl: "https://assets.faith-interactive.com/church-partners/calvary-chapel-inglewood.png" },
      { id: "13", name: "Calvary Chapel Signal Hill", logoUrl: "https://assets.faith-interactive.com/church-partners/calvary-chapel-signal-hill.png" },
      { id: "14", name: "Calvary Chapel Education Association", logoUrl: "https://assets.faith-interactive.com/church-partners/calvary-chapel-education-association.png" },
      { id: "15", name: "Calvary Chapel University", logoUrl: "https://assets.faith-interactive.com/church-partners/calvary-chapel-university.png" },
      { id: "16", name: "Calvary Boulder Valley", logoUrl: "https://assets.faith-interactive.com/church-partners/calvary-boulder-valley.png" },
      { id: "17", name: "Calvary Chapel Fellowship Foley", logoUrl: "https://assets.faith-interactive.com/church-partners/calvary-chapel-fellowship-foley.png" },
    ];
  }
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">Free Website Review</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="h1 max-w-[18ch] mb-8">
              Is your church website ready for first-time visitors?
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-large text-[#525252] max-w-xl mb-10">
              <strong>Get a FREE review</strong> of your church website from a visitor's perspective.
              We'll send you a simple checklist and a few clear next steps.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <a href="#request-review" className="btn-primary">
              Get Your Free Review
              <span className="btn-arrow">→</span>
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* What You'll Receive */}
      <section className="section bg-[#fafafa]">
        <div className="container">
          <div className="max-w-3xl">
            <ScrollReveal>
              <h2 className="h2 mb-10">What you&apos;ll receive</h2>
            </ScrollReveal>
            <div className="space-y-6">
              <ScrollReveal delay={0.1}>
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3a5fd4] mt-3 shrink-0" />
                  <p className="text-lg text-[#404040]">
                    A personalized review of your website through a first-time visitor&apos;s eyes
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3a5fd4] mt-3 shrink-0" />
                  <p className="text-lg text-[#404040]">
                    A checklist covering the essentials every church website needs
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3a5fd4] mt-3 shrink-0" />
                  <p className="text-lg text-[#404040]">
                    3 to 5 prioritized recommendations you can act on right away
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.25}>
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3a5fd4] mt-3 shrink-0" />
                  <p className="text-lg text-[#404040]">
                    Delivered to your inbox within 24 to 48 hours
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3a5fd4] mt-3 shrink-0" />
                  <p className="text-lg text-[#404040]">
                    No sales pitch. No obligation. Just helpful feedback.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <ScrollReveal>
            <h2 className="h2 mb-12">How it works</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl">
            <ScrollReveal delay={0.1}>
              <div>
                <p className="text-micro text-[#3a5fd4] mb-4">Step 1</p>
                <h3 className="h3 mb-3">Share your website</h3>
                <p className="text-[#525252]">
                  Fill out the short form below with your church&apos;s website address.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div>
                <p className="text-micro text-[#3a5fd4] mb-4">Step 2</p>
                <h3 className="h3 mb-3">We review it</h3>
                <p className="text-[#525252]">
                  Our team looks at your site the way a first-time visitor would. We note what&apos;s working and what might be getting in the way.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div>
                <p className="text-micro text-[#3a5fd4] mb-4">Step 3</p>
                <h3 className="h3 mb-3">You get clear feedback</h3>
                <p className="text-[#525252]">
                  Within 24 to 48 hours, you&apos;ll receive a checklist and a handful of specific suggestions by email.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="section bg-[#fafafa]">
        <div className="container">
          <ScrollReveal>
            <h2 className="h2 mb-12">Is this for you?</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl">
            <ScrollReveal delay={0.1}>
              <div>
                <h3 className="h3 mb-6">This is for you if:</h3>
                <ul className="space-y-4 text-[#404040]">
                  <li className="flex gap-3">
                    <span className="text-[#4de88a] shrink-0">✓</span>
                    You serve at a Christ-centered church and want honest outside feedback
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4de88a] shrink-0">✓</span>
                    You&apos;re not sure if your website helps or confuses new visitors
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4de88a] shrink-0">✓</span>
                    You want practical suggestions, not a sales presentation
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4de88a] shrink-0">✓</span>
                    You&apos;re open to making small improvements that could make a real difference
                  </li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div>
                <h3 className="h3 mb-6">This might not be for you if:</h3>
                <ul className="space-y-4 text-[#525252]">
                  <li className="flex gap-3">
                    <span className="text-[#737373] shrink-0">—</span>
                    You&apos;re looking for a full redesign proposal
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#737373] shrink-0">—</span>
                    You need help with advertising or social media
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#737373] shrink-0">—</span>
                    Your church doesn&apos;t currently have a website
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] text-center mb-8">
              Trusted by churches like yours
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {churchPartners.map((partner) => (
                <img
                  key={partner.id}
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="h-10 md:h-12 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Example Checklist Preview */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl">
            <ScrollReveal>
              <h2 className="h2 mb-4">A sample from the checklist</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-[#525252] mb-10">
                Here are a few of the items we look at during every review:
              </p>
            </ScrollReveal>
            <div className="bg-[#fafafa] border border-[#e5e5e5] p-8">
              <ol className="space-y-4 text-[#404040]">
                <ScrollReveal delay={0.15}>
                  <li className="flex gap-4">
                    <span className="text-[#737373] font-medium shrink-0">1.</span>
                    Can a visitor find your service times within 5 seconds?
                  </li>
                </ScrollReveal>
                <ScrollReveal delay={0.18}>
                  <li className="flex gap-4">
                    <span className="text-[#737373] font-medium shrink-0">2.</span>
                    Is your physical address easy to locate?
                  </li>
                </ScrollReveal>
                <ScrollReveal delay={0.21}>
                  <li className="flex gap-4">
                    <span className="text-[#737373] font-medium shrink-0">3.</span>
                    Does the homepage answer &quot;What can I expect when I visit?&quot;
                  </li>
                </ScrollReveal>
                <ScrollReveal delay={0.24}>
                  <li className="flex gap-4">
                    <span className="text-[#737373] font-medium shrink-0">4.</span>
                    Is there a clear way to get in touch or ask a question?
                  </li>
                </ScrollReveal>
              </ol>
            </div>
            <ScrollReveal delay={0.4}>
              <p className="text-sm text-[#737373] mt-6">
                Your review will include notes on each of these and a few others tailored to your site.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Trust + Reassurance */}
      <section className="section bg-[#fafafa]">
        <div className="container">
          <ScrollReveal>
            <h2 className="h2 mb-12">What to expect from us</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl">
            <ScrollReveal delay={0.1}>
              <div>
                <h3 className="h3 mb-3">No pressure.</h3>
                <p className="text-[#525252]">
                  This is a gift, not a sales tactic. You won&apos;t receive a follow-up pitch unless you ask for one.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div>
                <h3 className="h3 mb-3">Real feedback.</h3>
                <p className="text-[#525252]">
                  We&apos;ll be honest and kind. If something&apos;s working well, we&apos;ll tell you. If something needs attention, we&apos;ll explain why and how to fix it.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div>
                <h3 className="h3 mb-3">Made for churches.</h3>
                <p className="text-[#525252]">
                  We&apos;ve spent years helping churches communicate more clearly online. We understand your context.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div>
                <h3 className="h3 mb-3">Simple and useful.</h3>
                <p className="text-[#525252]">
                  You&apos;ll walk away with something you can actually use, even if you never hear from us again.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl">
            <ScrollReveal>
              <h2 className="h2 mb-12">Common questions</h2>
            </ScrollReveal>
            <div className="space-y-8">
              <ScrollReveal delay={0.1}>
                <div className="border-b border-[#e5e5e5] pb-8">
                  <h3 className="h3 mb-3">Is this really free?</h3>
                  <p className="text-[#525252]">
                    Yes. There&apos;s no catch and no obligation. We do this because we care about helping churches welcome people well.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <div className="border-b border-[#e5e5e5] pb-8">
                  <h3 className="h3 mb-3">What do you need from me?</h3>
                  <p className="text-[#525252]">
                    Just your name, email, church name, and website address. That&apos;s it.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="border-b border-[#e5e5e5] pb-8">
                  <h3 className="h3 mb-3">How long does it take to get my review?</h3>
                  <p className="text-[#525252]">
                    Most reviews are delivered within 24 to 48 hours.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.25}>
                <div className="border-b border-[#e5e5e5] pb-8">
                  <h3 className="h3 mb-3">Will you try to sell me something afterward?</h3>
                  <p className="text-[#525252]">
                    No. You&apos;ll receive your review and that&apos;s it. If you&apos;d ever like to work together in the future, that&apos;s up to you to initiate.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="border-b border-[#e5e5e5] pb-8">
                  <h3 className="h3 mb-3">What if our website is really outdated?</h3>
                  <p className="text-[#525252]">
                    That&apos;s okay. We&apos;ve seen it all. Our goal is to give you practical steps you can take now, no matter where you&apos;re starting from.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.35}>
                <div>
                  <h3 className="h3 mb-3">Who reviews the website?</h3>
                  <p className="text-[#525252]">
                    Our team at Faith Interactive. We&apos;ve helped Christ-centered churches across the country improve how they communicate online.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA + Form */}
      <section id="request-review" className="section-lg bg-[#fafafa]">
        <div className="container">
          <div className="max-w-xl mx-auto">
            <ScrollReveal>
              <h2 className="h2 mb-4 text-center">Ready for a fresh perspective?</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-[#525252] text-center mb-10">
                We&apos;d love to take a look at your website and share what we see. Fill out the form below and we&apos;ll send your review within 24 to 48 hours.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <WebsiteReviewForm />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
