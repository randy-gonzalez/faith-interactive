"use client";

/**
 * Public Website Header
 *
 * Configurable header with multiple template layouts:
 * - Classic: Logo left, nav right, CTA button
 * - Centered: Logo centered above, nav centered below
 * - Minimal: Logo only, hamburger menu for all screens
 * - Split: Logo left, nav center, CTA right
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HeaderTemplate,
  HeaderConfig,
  NavLinkExtended,
  DEFAULT_HEADER_CONFIG,
} from "@/types/template";

interface PublicHeaderProps {
  churchName: string;
  logoUrl?: string | null;
  navigation: NavLinkExtended[];
  template?: HeaderTemplate;
  config?: HeaderConfig;
}

export function PublicHeader({
  churchName,
  logoUrl,
  navigation,
  template = "classic",
  config,
}: PublicHeaderProps) {
  const headerConfig = { ...DEFAULT_HEADER_CONFIG, ...config };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < headerConfig.mobileBreakpoint);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [headerConfig.mobileBreakpoint]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Get background styles
  const getBackgroundStyle = () => {
    switch (headerConfig.background) {
      case "transparent":
        return "bg-transparent";
      case "blur":
        return "bg-white/80 backdrop-blur-md";
      default:
        return headerConfig.backgroundColor
          ? ""
          : "bg-white";
    }
  };

  // Get CTA button styles
  const getCtaStyles = () => {
    const baseStyles = "text-sm font-medium px-4 py-2 transition-opacity hover:opacity-90";
    switch (headerConfig.ctaButton.style) {
      case "secondary":
        return {
          className: baseStyles,
          style: {
            backgroundColor: "var(--btn-secondary-bg, #64748b)",
            color: "var(--btn-secondary-text, #ffffff)",
            borderRadius: "var(--btn-radius, 6px)",
          },
        };
      case "outline":
        return {
          className: `${baseStyles} bg-transparent`,
          style: {
            border: "2px solid var(--btn-outline-border, #2563eb)",
            color: "var(--btn-outline-text, #2563eb)",
            borderRadius: "var(--btn-radius, 6px)",
          },
        };
      default:
        return {
          className: baseStyles,
          style: {
            backgroundColor: "var(--btn-primary-bg, #2563eb)",
            color: "var(--btn-primary-text, #ffffff)",
            borderRadius: "var(--btn-radius, 6px)",
          },
        };
    }
  };

  const ctaStyles = getCtaStyles();
  const effectiveLogoUrl = isMobile && headerConfig.mobileLogoUrl
    ? headerConfig.mobileLogoUrl
    : logoUrl;

  // Render CTA Button
  const renderCtaButton = (additionalClasses = "") => {
    if (!headerConfig.ctaButton.show) return null;
    if (isMobile && !headerConfig.showCtaOnMobile) return null;

    const href = headerConfig.ctaButton.href;
    const isExternal = headerConfig.ctaButton.isExternal;

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${ctaStyles.className} ${additionalClasses}`}
          style={ctaStyles.style}
        >
          {headerConfig.ctaButton.label}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={`${ctaStyles.className} ${additionalClasses}`}
        style={ctaStyles.style}
      >
        {headerConfig.ctaButton.label}
      </Link>
    );
  };

  // Render Logo
  const renderLogo = (className = "") => (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      {effectiveLogoUrl ? (
        <img
          src={effectiveLogoUrl}
          alt={churchName}
          className="h-10 w-auto object-contain"
        />
      ) : (
        <span className="text-xl font-semibold text-gray-900">{churchName}</span>
      )}
    </Link>
  );

  // Render Nav Links (Desktop)
  const renderNavLinks = (className = "") => {
    if (!headerConfig.showNavigation) return null;

    return (
      <nav className={`flex items-center gap-6 ${className}`}>
        {navigation.map((link) => (
          <NavItem key={link.id} link={link} />
        ))}
      </nav>
    );
  };

  // Desktop Header by Template
  const renderDesktopHeader = () => {
    if (isMobile) return null;

    switch (template) {
      case "centered":
        return (
          <div className="flex flex-col items-center py-4">
            {renderLogo("mb-4")}
            <div className="flex items-center gap-6">
              {renderNavLinks()}
              {renderCtaButton("ml-4")}
            </div>
          </div>
        );

      case "minimal":
        // Minimal always shows hamburger menu
        return null;

      case "split":
        return (
          <div className="flex items-center justify-between h-16">
            {renderLogo()}
            {renderNavLinks("flex-1 justify-center")}
            {renderCtaButton()}
          </div>
        );

      case "transparent":
        // Transparent header - designed to overlay hero content
        // The actual transparency is handled by the background setting
        return (
          <div className="flex items-center justify-between h-16">
            {renderLogo()}
            <div className="flex items-center gap-6">
              {renderNavLinks()}
              {renderCtaButton("ml-4")}
            </div>
          </div>
        );

      case "boxed":
        // Boxed header with centered container, rounded corners, shadow
        return (
          <div className="py-3">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg px-6">
              <div className="flex items-center justify-between h-14">
                {renderLogo()}
                <div className="flex items-center gap-6">
                  {renderNavLinks()}
                  {renderCtaButton("ml-4")}
                </div>
              </div>
            </div>
          </div>
        );

      case "full-width":
        // Logo and CTA on edges, navigation centered
        return (
          <div className="flex items-center justify-between h-16">
            {renderLogo()}
            {renderNavLinks("absolute left-1/2 -translate-x-1/2")}
            {renderCtaButton()}
          </div>
        );

      case "double-row":
        return (
          <div className="flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-end gap-4 py-2 text-sm text-gray-500 border-b border-gray-100">
              <span>Welcome to {churchName}</span>
              {renderCtaButton()}
            </div>
            {/* Main header row */}
            <div className="flex items-center justify-between h-14">
              {renderLogo()}
              {renderNavLinks()}
            </div>
          </div>
        );

      case "classic":
      default:
        return (
          <div className="flex items-center justify-between h-16">
            {renderLogo()}
            <div className="flex items-center gap-6">
              {renderNavLinks()}
              {renderCtaButton("ml-4")}
            </div>
          </div>
        );
    }
  };

  // Mobile Header
  const renderMobileHeader = () => {
    if (!isMobile && template !== "minimal") return null;

    return (
      <div className="flex items-center justify-between h-16">
        {renderLogo()}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-gray-900"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
    );
  };

  // Mobile Menu Overlay
  const renderMobileMenu = () => {
    if (!isMobileMenuOpen) return null;

    const menuBg = headerConfig.mobileMenuBgColor || "white";

    switch (headerConfig.mobileMenuStyle) {
      case "fullscreen":
        return (
          <div
            className="fixed inset-0 z-40 flex flex-col"
            style={{ backgroundColor: menuBg }}
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              {renderLogo()}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              {navigation.map((link) => (
                <MobileNavItem
                  key={link.id}
                  link={link}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              ))}
              {headerConfig.ctaButton.show && headerConfig.showCtaOnMobile && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {renderCtaButton("block text-center w-full")}
                </div>
              )}
            </nav>
          </div>
        );

      case "dropdown":
        return (
          <nav
            className="absolute left-0 right-0 top-16 border-b border-gray-200 shadow-lg z-40"
            style={{ backgroundColor: menuBg }}
          >
            <div className="w-full max-w-(--container-max) mx-auto px-4 py-4 space-y-2">
              {navigation.map((link) => (
                <MobileNavItem
                  key={link.id}
                  link={link}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              ))}
              {headerConfig.ctaButton.show && headerConfig.showCtaOnMobile && (
                <div className="pt-2">
                  {renderCtaButton("block text-center w-full")}
                </div>
              )}
            </div>
          </nav>
        );

      case "slide":
      default:
        return (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Slide-out Panel */}
            <nav
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 shadow-xl overflow-y-auto"
              style={{ backgroundColor: menuBg }}
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-4 py-4 space-y-2">
                {navigation.map((link) => (
                  <MobileNavItem
                    key={link.id}
                    link={link}
                    onClose={() => setIsMobileMenuOpen(false)}
                  />
                ))}
                {headerConfig.ctaButton.show && headerConfig.showCtaOnMobile && (
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    {renderCtaButton("block text-center w-full")}
                  </div>
                )}
              </div>
            </nav>
          </>
        );
    }
  };

  return (
    <header
      className={`${getBackgroundStyle()} border-b border-gray-200 ${
        headerConfig.sticky ? "sticky top-0" : ""
      } z-50`}
      style={
        headerConfig.backgroundColor
          ? { backgroundColor: headerConfig.backgroundColor }
          : undefined
      }
    >
      <div className="w-full max-w-(--container-max) mx-auto px-4 sm:px-6">
        {renderDesktopHeader()}
        {renderMobileHeader()}
      </div>
      {renderMobileMenu()}
    </header>
  );
}

// Desktop Navigation Item with Dropdown Support
function NavItem({ link }: { link: NavLinkExtended }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = link.children && link.children.length > 0;

  const linkElement = link.isExternal ? (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
    >
      {link.label}
      {hasChildren && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </a>
  ) : (
    <Link
      href={link.href}
      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
    >
      {link.label}
      {hasChildren && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </Link>
  );

  if (!hasChildren) {
    return linkElement;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
      >
        {link.label}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 pt-1 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-45">
            {link.children!.map((child) =>
              child.isExternal ? (
                <a
                  key={child.id}
                  href={child.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  {child.label}
                </a>
              ) : (
                <Link
                  key={child.id}
                  href={child.href}
                  className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  {child.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile Navigation Item with Collapsible Children
function MobileNavItem({
  link,
  onClose,
}: {
  link: NavLinkExtended;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = link.children && link.children.length > 0;

  const handleClick = () => {
    if (!hasChildren) {
      onClose();
    }
  };

  return (
    <div>
      <div className="flex items-center">
        {link.isExternal ? (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="flex-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center justify-between"
          >
            {link.label}
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <Link
            href={link.href}
            onClick={handleClick}
            className="flex-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            {link.label}
          </Link>
        )}

        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
          {link.children!.map((child) =>
            child.isExternal ? (
              <a
                key={child.id}
                href={child.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md items-center justify-between"
              >
                {child.label}
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <Link
                key={child.id}
                href={child.href}
                onClick={onClose}
                className="block px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md"
              >
                {child.label}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
