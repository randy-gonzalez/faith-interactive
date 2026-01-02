"use client";

/**
 * Dashboard Navigation
 *
 * Side navigation for the dashboard.
 * Uses church-friendly labels (not CMS jargon).
 * Shows/hides team management based on role.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { UserRole } from "@prisma/client";

interface NavItem {
  label: string;
  href: string;
  // If set, only show this item to users with this role
  requiredRole?: UserRole;
  // Sub-items for accordion navigation
  children?: NavItem[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin/dashboard" },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Pages", href: "/admin/pages" },
      {
        label: "Sermons",
        href: "/admin/sermons",
        children: [
          { label: "Series", href: "/admin/sermon-series" },
          { label: "Speakers", href: "/admin/speakers" },
          { label: "Topics", href: "/admin/sermon-topics" },
        ],
      },
      { label: "Events", href: "/admin/events" },
      { label: "Announcements", href: "/admin/announcements" },
      { label: "Leadership", href: "/admin/leadership" },
    ],
  },
  {
    title: "Forms",
    items: [
      { label: "Prayer Requests", href: "/admin/prayer-requests" },
      { label: "Volunteer Signups", href: "/admin/volunteer-signups" },
    ],
  },
  {
    title: "Media",
    items: [
      { label: "Media Library", href: "/admin/media" },
    ],
  },
  {
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        children: [
          { label: "General", href: "/admin/settings" },
          { label: "Branding", href: "/admin/settings/branding" },
          { label: "Custom Domains", href: "/admin/settings/domains", requiredRole: "ADMIN" },
          { label: "Team", href: "/admin/settings/team", requiredRole: "ADMIN" },
          { label: "Redirects", href: "/admin/settings/redirects", requiredRole: "ADMIN" },
          { label: "Launch Checklist", href: "/admin/settings/launch", requiredRole: "ADMIN" },
        ],
      },
    ],
  },
];

interface DashboardNavProps {
  userRole: UserRole;
  churchName: string;
}

// Chevron icon component
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function DashboardNav({ userRole, churchName }: DashboardNavProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Filter sections and items based on user role
  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items
      .filter((item) => {
        if (!item.requiredRole) return true;
        return item.requiredRole === userRole;
      })
      .map((item) => ({
        ...item,
        // Also filter children based on role
        children: item.children?.filter((child) => {
          if (!child.requiredRole) return true;
          return child.requiredRole === userRole;
        }),
      })),
  })).filter((section) => section.items.length > 0);

  // Auto-expand accordions when a child route is active
  useEffect(() => {
    const newExpanded = new Set<string>();
    visibleSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some((child) =>
            pathname.startsWith(child.href)
          );
          if (hasActiveChild) {
            newExpanded.add(item.href);
          }
        }
      });
    });
    if (newExpanded.size > 0) {
      setExpandedItems((prev) => new Set([...prev, ...newExpanded]));
    }
  }, [pathname]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  return (
    <nav className="w-64 bg-blue-950 min-h-screen p-4">
      {/* Church name */}
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-white truncate">
          {churchName}
        </h1>
        <p className="text-sm text-blue-300">Dashboard</p>
      </div>

      {/* Navigation sections */}
      <div className="space-y-6">
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.title || sectionIndex}>
            {section.title && (
              <h2 className="px-3 mb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                {section.title}
              </h2>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/admin/dashboard"
                    ? pathname === "/admin/dashboard" || pathname === "/admin"
                    : pathname === item.href || (pathname.startsWith(item.href + "/") && !item.children);
                const isExpanded = expandedItems.has(item.href);
                const hasActiveChild = item.children?.some((child) =>
                  pathname.startsWith(child.href)
                );

                // Accordion item with children
                if (item.children) {
                  return (
                    <li key={item.href}>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className={`
                            flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                            ${
                              isActive || hasActiveChild
                                ? "bg-blue-800 text-white"
                                : "text-blue-200 hover:bg-blue-900 hover:text-white"
                            }
                          `}
                        >
                          {item.label}
                        </Link>
                        <button
                          onClick={() => toggleExpanded(item.href)}
                          className="p-2 text-blue-300 hover:text-white"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          <ChevronIcon expanded={isExpanded} />
                        </button>
                      </div>
                      {isExpanded && (
                        <ul className="mt-1 ml-6 space-y-1">
                          {item.children.map((child) => {
                            // For exact match routes like /admin/settings, only match exactly
                            // For routes with potential children, use startsWith
                            const isChildActive = pathname === child.href ||
                              (pathname.startsWith(child.href + "/") && child.href !== "/admin/settings");
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={`
                                    block px-3 py-2 rounded-md text-sm font-medium transition-colors
                                    ${
                                      isChildActive
                                        ? "bg-blue-800 text-white"
                                        : "text-blue-200 hover:bg-blue-900 hover:text-white"
                                    }
                                  `}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                // Regular nav item (no children)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        block px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          isActive
                            ? "bg-blue-800 text-white"
                            : "text-blue-200 hover:bg-blue-900 hover:text-white"
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
