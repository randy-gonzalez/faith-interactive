/**
 * Public Website Footer
 *
 * Configurable footer with multiple template layouts:
 * - 4-Column: Info, Contact, Links, Social in separate columns
 * - 3-Column: Condensed layout with combined sections
 * - 2-Column: Logo/info left, links right
 * - Stacked: Single column with sections stacked vertically
 * - Minimal: Just navigation links and copyright
 */

import Link from "next/link";
import {
  FooterTemplate,
  FooterConfig,
  NavLinkExtended,
  DEFAULT_FOOTER_CONFIG,
} from "@/types/template";

interface PublicFooterProps {
  churchName: string;
  footerText?: string | null;
  navigation: NavLinkExtended[];
  serviceTimes?: string | null;
  address?: string | null;
  phone?: string | null;
  contactEmail?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  template?: FooterTemplate;
  config?: FooterConfig;
}

export function PublicFooter({
  churchName,
  footerText,
  navigation,
  serviceTimes,
  address,
  phone,
  contactEmail,
  facebookUrl,
  instagramUrl,
  youtubeUrl,
  template = "4-column",
  config,
}: PublicFooterProps) {
  const footerConfig = { ...DEFAULT_FOOTER_CONFIG, ...config };
  const hasSocial = facebookUrl || instagramUrl || youtubeUrl;

  // Get background style
  const getBackgroundStyle = () => {
    if (footerConfig.backgroundImage) {
      return {
        backgroundImage: `url(${footerConfig.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    if (footerConfig.backgroundColor) {
      return { backgroundColor: footerConfig.backgroundColor };
    }
    return { backgroundColor: "var(--color-secondary, #1f2937)" };
  };

  // Copyright text
  const copyrightText =
    footerConfig.customCopyrightText ||
    footerText ||
    `© ${new Date().getFullYear()} ${churchName}. All rights reserved.`;

  // Render Church Info Section
  const renderChurchInfo = () => {
    if (!footerConfig.showChurchInfo) return null;

    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">{churchName}</h3>
        {footerConfig.showServiceTimes && serviceTimes && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Service Times
            </h4>
            <div className="text-sm whitespace-pre-line">{serviceTimes}</div>
          </div>
        )}
      </div>
    );
  };

  // Render Contact Info Section
  const renderContactInfo = () => {
    if (!footerConfig.showContactInfo) return null;
    if (!address && !phone && !contactEmail) return null;

    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
        <div className="space-y-2 text-sm">
          {address && (
            <p>
              <span className="text-gray-400">Address:</span>
              <br />
              {address}
            </p>
          )}
          {phone && (
            <p>
              <span className="text-gray-400">Phone:</span>
              <br />
              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                className="hover:text-white transition-colors"
              >
                {phone}
              </a>
            </p>
          )}
          {contactEmail && (
            <p>
              <span className="text-gray-400">Email:</span>
              <br />
              <a
                href={`mailto:${contactEmail}`}
                className="hover:text-white transition-colors"
              >
                {contactEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render Quick Links Section
  const renderQuickLinks = () => {
    if (!footerConfig.showQuickLinks) return null;
    if (navigation.length === 0) return null;

    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
        <ul className="space-y-2 text-sm">
          {navigation.map((link) => (
            <li key={link.id}>
              {link.isExternal ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  {link.label}
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render Social Icons Section
  const renderSocialIcons = () => {
    if (!footerConfig.showSocialIcons || !hasSocial) return null;

    const getIconClass = () => {
      switch (footerConfig.socialIconStyle) {
        case "outline":
          return "text-gray-400 hover:text-white border border-gray-500 hover:border-white p-2 rounded-full";
        case "monochrome":
          return "text-white/60 hover:text-white";
        default: // filled
          return "text-gray-400 hover:text-white";
      }
    };

    const iconClass = getIconClass();
    const iconSize =
      footerConfig.socialIconStyle === "outline" ? "w-4 h-4" : "w-6 h-6";

    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
        <div className="flex gap-4">
          {facebookUrl && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${iconClass}`}
              aria-label="Facebook"
            >
              <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          )}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${iconClass}`}
              aria-label="Instagram"
            >
              <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          )}
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${iconClass}`}
              aria-label="YouTube"
            >
              <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    );
  };

  // Render Copyright Section
  const renderCopyright = () => (
    <div className="text-center text-sm text-gray-400">{copyrightText}</div>
  );

  // Render footer content based on template
  const renderContent = () => {
    switch (template) {
      case "minimal":
        return (
          <div className="py-8">
            {/* Horizontal Links */}
            {footerConfig.showQuickLinks && navigation.length > 0 && (
              <nav className="flex flex-wrap justify-center gap-6 mb-6">
                {navigation.map((link) => (
                  <span key={link.id}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>
            )}
            {renderCopyright()}
          </div>
        );

      case "stacked":
        return (
          <div className="py-12 space-y-12">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {churchName}
              </h2>
              {footerConfig.showServiceTimes && serviceTimes && (
                <div className="text-sm text-gray-400 whitespace-pre-line">
                  {serviceTimes}
                </div>
              )}
            </div>

            {footerConfig.showQuickLinks && navigation.length > 0 && (
              <nav className="flex flex-wrap justify-center gap-6">
                {navigation.map((link) => (
                  <span key={link.id}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>
            )}

            {footerConfig.showSocialIcons && hasSocial && (
              <div className="flex justify-center gap-6">
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="YouTube"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
              </div>
            )}

            <div className="pt-8 border-t border-white/20">{renderCopyright()}</div>
          </div>
        );

      case "2-column":
        return (
          <div className="py-12">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left: Church Info */}
              <div>
                {renderChurchInfo()}
                {footerConfig.showContactInfo && (
                  <div className="mt-6 space-y-2 text-sm">
                    {address && <p>{address}</p>}
                    {phone && (
                      <p>
                        <a
                          href={`tel:${phone.replace(/\D/g, "")}`}
                          className="hover:text-white transition-colors"
                        >
                          {phone}
                        </a>
                      </p>
                    )}
                    {contactEmail && (
                      <p>
                        <a
                          href={`mailto:${contactEmail}`}
                          className="hover:text-white transition-colors"
                        >
                          {contactEmail}
                        </a>
                      </p>
                    )}
                  </div>
                )}
                {footerConfig.showSocialIcons && hasSocial && (
                  <div className="mt-6 flex gap-4">
                    {facebookUrl && (
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Facebook"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    )}
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      </a>
                    )}
                    {youtubeUrl && (
                      <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="YouTube"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Links */}
              <div className="md:text-right">
                {renderQuickLinks()}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              {renderCopyright()}
            </div>
          </div>
        );

      case "3-column":
        return (
          <div className="py-12">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Column 1: Church Info + Service Times */}
              {renderChurchInfo()}

              {/* Column 2: Contact Info + Social */}
              <div>
                {renderContactInfo()}
                {footerConfig.showSocialIcons && hasSocial && (
                  <div className="mt-6">
                    {renderSocialIcons()}
                  </div>
                )}
              </div>

              {/* Column 3: Quick Links */}
              {renderQuickLinks()}
            </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              {renderCopyright()}
            </div>
          </div>
        );

      case "4-column":
      default:
        return (
          <div className="py-12">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {renderChurchInfo()}
              {renderContactInfo()}
              {renderQuickLinks()}
              {renderSocialIcons()}
            </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              {renderCopyright()}
            </div>
          </div>
        );
    }
  };

  return (
    <footer className="text-gray-300" style={getBackgroundStyle()}>
      <div className="w-full max-w-(--container-max) mx-auto px-4 sm:px-6">{renderContent()}</div>
    </footer>
  );
}
