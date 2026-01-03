/**
 * Platform Login Page
 *
 * Platform users need to authenticate through the admin surface first,
 * then they'll be redirected back here.
 *
 * This page checks if the user is already authenticated:
 * - If authenticated with platform role → redirect to platform dashboard
 * - If not authenticated → redirect to admin login with returnTo
 */

import { redirect } from "next/navigation";
import { getAuthUser, hasPlatformRole } from "@/lib/auth/guards";
import { buildSurfaceUrl } from "@/lib/hostname/parser";

export default async function PlatformLoginPage() {
  const user = await getAuthUser();

  if (user && hasPlatformRole(user)) {
    // Already authenticated as platform user, go to dashboard
    redirect("/");
  }

  // Redirect to admin login with returnTo pointing back to platform
  // After login, platform users will be redirected to platform surface
  const isLocal = process.env.NODE_ENV !== "production";
  const adminLoginUrl = buildSurfaceUrl("admin", "/login", {
    isLocal,
    useLocalhost: isLocal,
  });

  redirect(adminLoginUrl);
}
