/**
 * Platform Root Page
 *
 * Redirects to the churches list when accessing the platform surface root.
 */

import { redirect } from "next/navigation";

export default function PlatformRootPage() {
  redirect("/churches");
}
