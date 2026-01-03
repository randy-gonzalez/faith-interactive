/**
 * Theme Global Blocks Page
 *
 * Redirect to the existing global blocks management page.
 */

import { redirect } from "next/navigation";

export default function ThemeGlobalBlocksPage() {
  redirect("/admin/global-blocks");
}
