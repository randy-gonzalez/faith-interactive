/**
 * Admin Root Page
 *
 * Redirects to the dashboard when accessing the admin surface root.
 */

import { redirect } from "next/navigation";

export default function AdminRootPage() {
  redirect("/dashboard");
}
