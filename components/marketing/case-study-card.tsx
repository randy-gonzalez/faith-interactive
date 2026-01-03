/**
 * Case Study Card Component
 *
 * Card for displaying case studies in a grid.
 */

interface CaseStudy {
  id: string;
  churchName: string;
  slug: string;
  logo: string | null;
  description: string | null;
  beforeImage: string | null;
  afterImage: string | null;
  metrics: Record<string, string> | null;
  liveSiteUrl: string | null;
  featured: boolean;
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  return (
    <a
      href={`/case-studies/${caseStudy.slug}`}
      className="group marketing-card overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {caseStudy.afterImage ? (
          <img
            src={caseStudy.afterImage}
            alt={`${caseStudy.churchName} website`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#77f2a1]/20 to-[#00ffce]/20">
            {caseStudy.logo ? (
              <img
                src={caseStudy.logo}
                alt={caseStudy.churchName}
                className="w-24 h-24 object-contain"
              />
            ) : (
              <span className="text-4xl font-bold text-[#000646]/20">
                {caseStudy.churchName.charAt(0)}
              </span>
            )}
          </div>
        )}
        {caseStudy.featured && (
          <div className="absolute top-3 right-3">
            <span className="marketing-gradient text-[#000646] text-xs font-semibold px-3 py-1 rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start gap-3 mb-3">
          {caseStudy.logo && (
            <img
              src={caseStudy.logo}
              alt=""
              className="w-10 h-10 object-contain flex-shrink-0"
            />
          )}
          <div>
            <h3 className="font-bold text-[#000646] group-hover:text-[#00d4aa] transition-colors">
              {caseStudy.churchName}
            </h3>
            {caseStudy.liveSiteUrl && (
              <p className="text-sm text-gray-500 truncate">
                {caseStudy.liveSiteUrl.replace(/^https?:\/\//, "")}
              </p>
            )}
          </div>
        </div>

        {caseStudy.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {caseStudy.description}
          </p>
        )}

        {/* Metrics */}
        {caseStudy.metrics && Object.keys(caseStudy.metrics).length > 0 && (
          <div className="flex flex-wrap gap-3">
            {Object.entries(caseStudy.metrics).slice(0, 3).map(([label, value]) => (
              <div
                key={label}
                className="px-3 py-1 bg-gradient-to-r from-[#77f2a1]/10 to-[#00ffce]/10 rounded-full"
              >
                <span className="text-xs font-medium text-[#000646]">
                  {label}: <span className="text-gradient font-bold">{value}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

export function CaseStudyFeatured({ caseStudy }: CaseStudyCardProps) {
  return (
    <div className="marketing-card overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Images */}
        <div className="relative">
          {caseStudy.beforeImage && caseStudy.afterImage ? (
            <div className="grid grid-cols-2 h-full">
              <div className="relative">
                <img
                  src={caseStudy.beforeImage}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Before
                </span>
              </div>
              <div className="relative">
                <img
                  src={caseStudy.afterImage}
                  alt="After"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 marketing-gradient text-[#000646] text-xs px-2 py-1 rounded">
                  After
                </span>
              </div>
            </div>
          ) : caseStudy.afterImage ? (
            <img
              src={caseStudy.afterImage}
              alt={`${caseStudy.churchName} website`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gradient-to-br from-[#77f2a1]/20 to-[#00ffce]/20">
              {caseStudy.logo ? (
                <img
                  src={caseStudy.logo}
                  alt={caseStudy.churchName}
                  className="w-32 h-32 object-contain"
                />
              ) : (
                <span className="text-6xl font-bold text-[#000646]/20">
                  {caseStudy.churchName.charAt(0)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            {caseStudy.logo && (
              <img
                src={caseStudy.logo}
                alt=""
                className="w-12 h-12 object-contain"
              />
            )}
            <div>
              <h3 className="text-2xl font-bold text-[#000646]">
                {caseStudy.churchName}
              </h3>
              {caseStudy.liveSiteUrl && (
                <a
                  href={caseStudy.liveSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#00d4aa] hover:underline"
                >
                  Visit site ↗
                </a>
              )}
            </div>
          </div>

          {caseStudy.description && (
            <p className="text-gray-600 mb-6">{caseStudy.description}</p>
          )}

          {/* Metrics */}
          {caseStudy.metrics && Object.keys(caseStudy.metrics).length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {Object.entries(caseStudy.metrics).map(([label, value]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-gradient">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          <a
            href={`/case-studies/${caseStudy.slug}`}
            className="btn-marketing-primary self-start"
          >
            Read Case Study
          </a>
        </div>
      </div>
    </div>
  );
}
