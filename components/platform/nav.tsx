"use client";

/**
 * Platform Navigation
 *
 * Side navigation for the Fi Staff Platform panel.
 * Completely separate from church dashboard navigation.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PlatformRole } from "@prisma/client";

interface NavItem {
  label: string;
  href: string;
  // If true, only platform admins can see this item
  requireAdmin?: boolean;
  // If true, only CRM users (PLATFORM_ADMIN, SALES_REP) can see this item
  requireCrm?: boolean;
  // If true, only PLATFORM_ADMIN can see this item
  requirePlatformAdmin?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
  // If true, only CRM users can see this section
  requireCrm?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: "Overview", href: "/platform" }],
  },
  {
    title: "CRM",
    requireCrm: true,
    items: [
      { label: "My Tasks", href: "/platform/crm", requireCrm: true },
      { label: "Leads", href: "/platform/crm/leads", requireCrm: true },
      { label: "Kanban", href: "/platform/crm/kanban", requireCrm: true },
      { label: "Stages", href: "/platform/crm/settings/stages", requirePlatformAdmin: true },
    ],
  },
  {
    title: "Churches",
    items: [
      { label: "All Churches", href: "/platform/churches" },
      { label: "Create Church", href: "/platform/churches/new", requireAdmin: true },
    ],
  },
  {
    title: "Marketing Site",
    items: [
      { label: "Pages", href: "/platform/marketing/pages" },
      { label: "Site Settings", href: "/platform/marketing/settings", requireAdmin: true },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Audit Log", href: "/platform/audit-log" },
    ],
  },
];

interface PlatformNavProps {
  platformRole: PlatformRole;
  userName: string | null;
}

export function PlatformNav({ platformRole, userName }: PlatformNavProps) {
  const pathname = usePathname();
  const isPlatformAdmin = platformRole === "PLATFORM_ADMIN";
  // PLATFORM_ADMIN and SALES_REP have CRM access
  const isCrmUser = platformRole === "PLATFORM_ADMIN" || platformRole === "SALES_REP";

  // Filter sections and items based on role
  const visibleSections = NAV_SECTIONS
    .filter((section) => {
      // Filter out CRM section if not a CRM user
      if (section.requireCrm && !isCrmUser) return false;
      return true;
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Platform admin check
        if (item.requireAdmin && !isPlatformAdmin) return false;
        // CRM user check
        if (item.requireCrm && !isCrmUser) return false;
        // PLATFORM_ADMIN check
        if (item.requirePlatformAdmin && !isPlatformAdmin) return false;
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <nav className="w-64 bg-indigo-950 min-h-screen p-4">
      {/* Platform branding */}
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-white">
          Faith Interactive
        </h1>
        <p className="text-sm text-indigo-300">Staff Admin</p>
      </div>

      {/* Navigation sections */}
      <div className="space-y-6">
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.title || sectionIndex}>
            {section.title && (
              <h2 className="px-3 mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                {section.title}
              </h2>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/platform" || item.href === "/platform/crm"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        block px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          isActive
                            ? "bg-indigo-800 text-white"
                            : "text-indigo-200 hover:bg-indigo-900 hover:text-white"
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

      {/* User info at bottom */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="px-3 py-2 text-sm text-indigo-300">
          <p className="truncate">{userName || "Staff User"}</p>
          <p className="text-xs text-indigo-400">
            {getRoleLabel(platformRole)}
          </p>
        </div>
      </div>
    </nav>
  );
}

function getRoleLabel(role: PlatformRole): string {
  switch (role) {
    case "PLATFORM_ADMIN":
      return "Platform Admin";
    case "PLATFORM_STAFF":
      return "Platform Staff";
    case "SALES_REP":
      return "Sales Rep";
    default:
      return "Staff";
  }
}
