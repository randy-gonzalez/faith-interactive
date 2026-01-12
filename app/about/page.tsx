/**
 * About Page
 *
 * Purpose: Establish trust through conviction, not credentials.
 * Answer: "Who are these people, and why do they care about churches?"
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "A design studio for churches. We believe the local church matters, and its digital presence should reflect that.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">About</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display hero-headline mb-8">
              We believe the local church matters.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-large text-[#525252] max-w-2xl">
              So we build websites that reflect that: clear, thoughtful,
              and designed to help people take the next step toward Jesus.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section bg-[#fafafa]">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="manifesto">
              We&apos;re not a marketing agency. We&apos;re not a
              church software company. We&apos;re designers who
              happen to love the church.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Convictions */}
      <section className="section-lg">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-12">What we believe</p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-16 max-w-4xl">
            <ScrollReveal delay={0.1}>
              <div>
                <h3 className="h3 mb-4">Clarity over cleverness</h3>
                <p className="text-[#525252]">
                  Your website exists to help people find your church and
                  take a next step. Everything else is noise.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div>
                <h3 className="h3 mb-4">Design is stewardship</h3>
                <p className="text-[#525252]">
                  A thoughtful digital presence honors the work God is doing
                  in your community. It deserves real attention.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div>
                <h3 className="h3 mb-4">Pastors deserve partners</h3>
                <p className="text-[#525252]">
                  You have enough vendors. We want to understand your ministry
                  and serve it well over time.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div>
                <h3 className="h3 mb-4">Less is almost always more</h3>
                <p className="text-[#525252]">
                  We strip away the unnecessary so what matters can breathe.
                  Restraint is a discipline.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="section bg-[#fafafa]">
        <div className="container container-narrow">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-8">How we work</p>
          </ScrollReveal>

          <div className="services-list">
            <ScrollReveal delay={0.1}>
              <div className="services-item">
                <span>We listen first</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="services-item">
                <span>We design with intention</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="services-item">
                <span>We build to last</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div className="services-item">
                <span>We stay available</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-lg">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-4">Our team</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="h2 mb-16 max-w-xl">The people behind the pixels.</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 max-w-4xl mx-auto">
            <ScrollReveal delay={0.15}>
              <div className="group">
                <div className="overflow-hidden mb-6">
                  <img
                    src="https://assets.faith-interactive.com/platform/media/randy-gonzalez-58ma.jpg"
                    alt="Randy Gonzalez"
                    className="w-full aspect-square object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="h3 mb-1">Randy Gonzalez</h3>
                <p className="text-small text-[#737373] mb-3">Senior Developer</p>
                <p className="text-[#525252] text-[0.9375rem] leading-relaxed">
                  Randy is the founder and senior developer @ Fi! With over 20 years
                  of experience, Randy has had the opportunity of serving on staff
                  at Calvary Chapel Downey as lead developer and built several
                  ministry platforms and church websites. Over the last few years
                  he has focused his skillset on the latest programming languages
                  and web development tools. Randy currently lives in Mission Viejo,
                  CA with his wife and 2 boys! When he is not writing code,
                  you&apos;ll probably find him shooting hoops with the boys or
                  working on his honey-do list!
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="group">
                <div className="overflow-hidden mb-6">
                  <img
                    src="https://assets.faith-interactive.com/platform/media/jason-klein-9uoh.png"
                    alt="Jason Klein"
                    className="w-full aspect-square object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="h3 mb-1">Jason Klein</h3>
                <p className="text-small text-[#737373] mb-3">Content Developer</p>
                <p className="text-[#525252] text-[0.9375rem] leading-relaxed">
                  In view of the beautiful Colorado Front Range, Jason lives with
                  his wife of 22 years and three children. With a blended background
                  in audio production, IT, pastoral ministry, and communication,
                  Jason brings a dynamic and concise voice to each project. Born
                  and raised in Southern California, Jason loves spending time with
                  his family, drinking coffee, watching movies and sports, and
                  leading worship at his church.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div className="group">
                <div className="overflow-hidden mb-6">
                  <img
                    src="https://assets.faith-interactive.com/platform/media/rodney-bowen-raaj.png"
                    alt="Rodney Bowen"
                    className="w-full aspect-square object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="h3 mb-1">Rodney Bowen</h3>
                <p className="text-small text-[#737373] mb-3">SEO &amp; PPC Strategist</p>
                <p className="text-[#525252] text-[0.9375rem] leading-relaxed">
                  Rodney brings over 30 years of marketing expertise and a decade
                  of specialization in SEO and PPC. His deep understanding of
                  digital strategies enables him to enhance client visibility and
                  conversion rates effectively. Outside of work, Rodney cherishes
                  family time, indulges in a good book, stays active with running,
                  and enjoys playing the piano.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="group">
                <div className="overflow-hidden mb-6">
                  <img
                    src="https://assets.faith-interactive.com/platform/media/john-ko-vrfv.png"
                    alt="John Ko"
                    className="w-full aspect-square object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="h3 mb-1">John Ko</h3>
                <p className="text-small text-[#737373] mb-3">Developer</p>
                <p className="text-[#525252] text-[0.9375rem] leading-relaxed">
                  John Ko was born in Mississippi and raised in Southern California.
                  He enjoys problem-solving and coding, improving his skills daily.
                  On his spare time, he enjoys reading books or playing fighting
                  games. Each day, he looks forward to what new challenges may
                  appear before him.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <div className="max-w-md mx-auto mt-12 lg:mt-16">
            <ScrollReveal delay={0.35}>
              <div className="group">
                <div className="overflow-hidden mb-6">
                  <img
                    src="https://assets.faith-interactive.com/platform/media/audimar-escalona-br1h.jpg"
                    alt="Audimar Escalona"
                    className="w-full aspect-square object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="h3 mb-1">Audimar Escalona</h3>
                <p className="text-small text-[#737373] mb-3">Account Manager</p>
                <p className="text-[#525252] text-[0.9375rem] leading-relaxed">
                  Audi was born in Punto Fijo, Venezuela, she boasts a strong
                  foundation in Human Resources, but her skills extend far beyond.
                  With 10 years of experience managing teams and projects, when
                  she isn&apos;t exceeding client expectations, you might find her
                  curled up with a good book, watching a movie, or enjoying her
                  creativity through art. She also finds joy in spending time with
                  her pet and office partner, Sky.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-lg bg-[#fafafa]">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="h2 mb-6">Let&apos;s talk about your church.</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Link href="/contact" className="btn-primary">
              Get in touch
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
