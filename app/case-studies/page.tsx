/**
 * Case Studies Page
 *
 * List of all published case studies.
 * Redirects to /work since that's now the main portfolio page.
 */

import { redirect } from "next/navigation";

export default function CaseStudiesPage() {
  redirect("/work");
}
