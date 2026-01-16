/**
 * Structured Data Components
 *
 * JSON-LD structured data for SEO.
 */

// Organization/LocalBusiness schema for site-wide use
export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Faith Interactive",
    description:
      "Church website design and development company specializing in creating beautiful, effective digital experiences for churches.",
    url: "https://faith-interactive.com",
    telephone: "+1-949-805-4031",
    email: "hello@faith-interactive.com",
    logo: "https://faith-interactive.com/faith-interactive-logo.png",
    image: "https://faith-interactive.com/og-image.jpg",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    sameAs: [
      "https://facebook.com/faithinteractive",
      "https://twitter.com/faithinteractive",
      "https://linkedin.com/company/faith-interactive",
    ],
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Blog posting schema
interface BlogPostSchemaProps {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  image?: string;
  url: string;
}

export function BlogPostSchema({
  title,
  description,
  datePublished,
  dateModified,
  authorName,
  image,
  url,
}: BlogPostSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Faith Interactive",
      logo: {
        "@type": "ImageObject",
        url: "https://faith-interactive.com/faith-interactive-logo.png",
      },
    },
    image: image || "https://faith-interactive.com/og-image.jpg",
    url: url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Service schema
interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
}

export function ServiceSchema({ name, description, url }: ServiceSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: name,
    description: description,
    provider: {
      "@type": "Organization",
      name: "Faith Interactive",
      url: "https://faith-interactive.com",
    },
    url: url,
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Review/Testimonial schema
interface ReviewSchemaProps {
  reviews: Array<{
    author: string;
    reviewBody: string;
    ratingValue?: number;
  }>;
}

export function ReviewSchema({ reviews }: ReviewSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Faith Interactive",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: reviews.length.toString(),
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewBody: review.reviewBody,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.ratingValue?.toString() || "5",
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Breadcrumb schema
interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// WebPage schema
interface WebPageSchemaProps {
  title: string;
  description: string;
  url: string;
}

export function WebPageSchema({ title, description, url }: WebPageSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description,
    url: url,
    isPartOf: {
      "@type": "WebSite",
      name: "Faith Interactive",
      url: "https://faith-interactive.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
