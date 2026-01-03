/**
 * CRM Layout
 *
 * Enforces RBAC for all /platform/crm/* routes.
 * Only PLATFORM_ADMIN and SALES_REP roles can access CRM features.
 * Returns 403 Forbidden (not redirect) if unauthorized.
 */

import { getAuthUser } from "@/lib/auth/guards";
import { hasCrmAccess } from "@/lib/crm/guards";

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  // Check CRM access
  if (!user || !hasCrmAccess(user.platformRole)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">403</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500 max-w-md">
            You do not have permission to access the CRM.
            This area is restricted to Platform Admin and Sales Rep roles.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
