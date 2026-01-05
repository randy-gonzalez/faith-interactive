/**
 * Website Design Service Page
 *
 * Redirects to main services page.
 * Design agencies don't need separate feature pages.
 */

import { redirect } from "next/navigation";

export default function WebsiteDesignPage() {
  redirect("/services");
}
