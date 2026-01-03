/**
 * Pricing Table Component
 *
 * Displays the three pricing tiers for Faith Interactive services.
 * - FREE (Church Plants): $0 setup + $25/mo hosting
 * - Small Church: $500 setup + $25/mo hosting
 * - Large Church: $1,500 setup + $25/mo hosting
 * - Optional: $100/mo for updates
 */

interface PricingTier {
  name: string;
  description: string;
  setupPrice: string;
  monthlyPrice: string;
  popular?: boolean;
  features: string[];
  cta: string;
  ctaHref: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Church Plants",
    description: "Perfect for new churches just getting started",
    setupPrice: "FREE",
    monthlyPrice: "$25",
    features: [
      "Custom website design",
      "Mobile responsive",
      "Sermon management",
      "Event calendar",
      "Contact forms",
      "Basic SEO setup",
      "VPS cloud hosting",
      "SSL certificate",
      "Email support",
    ],
    cta: "Get Started Free",
    ctaHref: "/contact?package=free",
  },
  {
    name: "Small Church",
    description: "Ideal for established churches under 200 members",
    setupPrice: "$500",
    monthlyPrice: "$25",
    popular: true,
    features: [
      "Everything in Church Plants",
      "Premium design templates",
      "Advanced SEO optimization",
      "Blog integration",
      "Social media integration",
      "Google Analytics setup",
      "Staff/leadership pages",
      "Priority support",
      "2 rounds of revisions",
    ],
    cta: "Schedule Consultation",
    ctaHref: "/contact?package=small",
  },
  {
    name: "Large Church",
    description: "For growing churches with complex needs",
    setupPrice: "$1,500",
    monthlyPrice: "$25",
    features: [
      "Everything in Small Church",
      "Fully custom design",
      "Unlimited pages",
      "Podcast integration",
      "Event registration system",
      "Volunteer signup forms",
      "Prayer request system",
      "Multi-campus support",
      "Unlimited revisions",
      "Dedicated support",
    ],
    cta: "Schedule Consultation",
    ctaHref: "/contact?package=large",
  },
];

interface PricingTableProps {
  showUpdateOption?: boolean;
}

export function PricingTable({ showUpdateOption = true }: PricingTableProps) {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl p-8 ${
              tier.popular
                ? "pricing-card-popular bg-white shadow-xl"
                : "marketing-card"
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="marketing-gradient text-[#000646] text-sm font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[#000646] mb-2">{tier.name}</h3>
              <p className="text-gray-600 text-sm">{tier.description}</p>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-[#000646]">{tier.setupPrice}</span>
                {tier.setupPrice !== "FREE" && (
                  <span className="text-gray-500">one-time</span>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                + {tier.monthlyPrice}/mo hosting
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-[#00d4aa] flex-shrink-0 mt-0.5"
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
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href={tier.ctaHref}
              className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                tier.popular
                  ? "btn-marketing-primary"
                  : "btn-marketing-secondary"
              }`}
            >
              {tier.cta}
            </a>
          </div>
        ))}
      </div>

      {showUpdateOption && (
        <div className="text-center p-6 bg-gray-50 rounded-xl">
          <p className="text-gray-600">
            <span className="font-semibold text-[#000646]">Need ongoing updates?</span>
            {" "}Add our monthly update service for{" "}
            <span className="font-semibold text-[#000646]">$100/month</span>.
            We&apos;ll make content changes, add new pages, and keep your site fresh.
          </p>
        </div>
      )}
    </div>
  );
}

export function PricingTableCompact() {
  return (
    <div className="grid md:grid-cols-3 gap-6 text-center">
      <div className="p-6 rounded-xl bg-white border border-gray-200">
        <h3 className="font-bold text-[#000646] mb-1">Church Plants</h3>
        <p className="text-2xl font-bold text-gradient mb-1">FREE</p>
        <p className="text-sm text-gray-500">+ $25/mo hosting</p>
      </div>
      <div className="p-6 rounded-xl marketing-gradient text-[#000646]">
        <h3 className="font-bold mb-1">Small Church</h3>
        <p className="text-2xl font-bold mb-1">$500</p>
        <p className="text-sm opacity-80">+ $25/mo hosting</p>
      </div>
      <div className="p-6 rounded-xl bg-white border border-gray-200">
        <h3 className="font-bold text-[#000646] mb-1">Large Church</h3>
        <p className="text-2xl font-bold text-gradient mb-1">$1,500</p>
        <p className="text-sm text-gray-500">+ $25/mo hosting</p>
      </div>
    </div>
  );
}
