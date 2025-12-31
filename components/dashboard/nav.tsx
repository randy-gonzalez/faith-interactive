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
import type { UserRole } from "@prisma/client";

interface NavItem {
  label: string;
  href: string;
  // If set, only show this item to users with this role
  requiredRole?: UserRole;
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
      { label: "Sermons", href: "/admin/sermons" },
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
    title: "Launch",
    items: [
      { label: "Launch Checklist", href: "/admin/launch", requiredRole: "ADMIN" },
      { label: "Custom Domains", href: "/admin/domains", requiredRole: "ADMIN" },
      { label: "Redirects", href: "/admin/redirects", requiredRole: "ADMIN" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Site Settings", href: "/admin/settings" },
      { label: "Team", href: "/admin/team", requiredRole: "ADMIN" },
    ],
  },
];

interface DashboardNavProps {
  userRole: UserRole;
  churchName: string;
}

export function DashboardNav({ userRole, churchName }: DashboardNavProps) {
  const pathname = usePathname();

  // Filter sections and items based on user role
  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!item.requiredRole) return true;
      return item.requiredRole === userRole;
    }),
  })).filter((section) => section.items.length > 0);

  return (
    <nav className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen p-4">
      {/* Church name */}
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {churchName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard</p>
      </div>

      {/* Navigation sections */}
      <div className="space-y-6">
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.title || sectionIndex}>
            {section.title && (
              <h2 className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {section.title}
              </h2>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/admin/dashboard"
                    ? pathname === "/admin/dashboard" || pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        block px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          isActive
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
