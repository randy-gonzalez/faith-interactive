/**
 * CTA Section Components
 *
 * Reusable call-to-action sections for marketing pages.
 */

interface CTASectionProps {
  title: string;
  description: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
}

export function CTASection({ title, description, primaryCta, secondaryCta }: CTASectionProps) {
  return (
    <section className="marketing-gradient py-20">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#000646] mb-4">
          {title}
        </h2>
        <p className="text-lg text-[#000646]/80 mb-8 max-w-2xl mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={primaryCta.href} className="btn-marketing-white text-lg px-8 py-4">
            {primaryCta.text}
          </a>
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="text-[#000646] font-semibold hover:underline"
            >
              {secondaryCta.text} →
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export function CTASectionDark({ title, description, primaryCta, secondaryCta }: CTASectionProps) {
  return (
    <section className="marketing-gradient-dark py-20">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={primaryCta.href} className="btn-marketing-primary text-lg px-8 py-4">
            {primaryCta.text}
          </a>
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="text-white font-semibold hover:text-[#00ffce] transition-colors"
            >
              {secondaryCta.text} →
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export function CTAInline() {
  return (
    <div className="marketing-card p-8 text-center">
      <h3 className="text-2xl font-bold text-[#000646] mb-2">
        Ready to get started?
      </h3>
      <p className="text-gray-600 mb-6">
        Schedule a free consultation and let&apos;s discuss your church&apos;s needs.
      </p>
      <a href="/contact" className="btn-marketing-primary">
        Schedule Free Consultation
      </a>
    </div>
  );
}

export function PhoneCTA() {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center">
        <svg className="w-6 h-6 text-[#000646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm text-gray-500">Call us today</p>
        <a
          href="tel:+18333071917"
          className="text-xl font-bold text-[#000646] hover:text-[#00d4aa] transition-colors"
        >
          (833) 307-1917
        </a>
      </div>
    </div>
  );
}
