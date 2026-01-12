"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FiLogo } from "@/components/ui/fi-logo";

const NAV_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trends", label: "Trends" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="site-header">
        <nav className="container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center z-110">
              <FiLogo variant="horizontal" colorMode={isMenuOpen ? "light" : "dark"} size={28} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive(link.href) ? "nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/contact" className="btn-primary">
                Get in touch
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative z-110 w-10 h-10 flex items-center justify-center"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <div className="relative w-6 h-4">
                <span
                  className={`absolute left-0 w-6 h-0.5 transition-all duration-300 ease-out ${
                    isMenuOpen
                      ? "top-1/2 -translate-y-1/2 rotate-45 bg-white"
                      : "top-0 bg-(--fi-black)"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 transition-all duration-300 ease-out ${
                    isMenuOpen ? "opacity-0 bg-white" : "opacity-100 bg-(--fi-black)"
                  }`}
                />
                <span
                  className={`absolute left-0 w-6 h-0.5 transition-all duration-300 ease-out ${
                    isMenuOpen
                      ? "top-1/2 -translate-y-1/2 -rotate-45 bg-white"
                      : "bottom-0 bg-(--fi-black)"
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-100 bg-(--fi-black) transition-all duration-500 ease-out md:hidden ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-full flex flex-col justify-center px-8">
          <nav className="space-y-2">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block text-4xl sm:text-5xl font-medium transition-all duration-500 ease-out ${
                  isMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                } ${
                  isActive(link.href) ? "text-white" : "text-(--fi-gray-500) hover:text-white"
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${150 + index * 50}ms` : "0ms",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div
            className={`mt-12 transition-all duration-500 ease-out ${
              isMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: isMenuOpen ? `${150 + NAV_LINKS.length * 50}ms` : "0ms",
            }}
          >
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="btn-primary text-lg"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
