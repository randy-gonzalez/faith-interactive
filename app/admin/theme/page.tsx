/**
 * Theme Overview Page
 *
 * Landing page for the Theme section. Redirects to Header settings.
 */

import { redirect } from "next/navigation";

export default function ThemePage() {
  redirect("/admin/theme/header");
}
