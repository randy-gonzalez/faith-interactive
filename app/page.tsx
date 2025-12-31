import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/guards";

/**
 * Home Page
 *
 * Redirects to dashboard if authenticated, login if not.
 */

export default async function HomePage() {
  const user = await getAuthUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
