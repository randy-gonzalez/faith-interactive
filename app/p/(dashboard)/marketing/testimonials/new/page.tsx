/**
 * New Testimonial Page
 *
 * Platform admin page for creating a new testimonial.
 */

import { requirePlatformUser } from "@/lib/auth/guards";
import { TestimonialEditor } from "@/components/platform/testimonial-editor";
import Link from "next/link";

export default async function NewTestimonialPage() {
  await requirePlatformUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/marketing/testimonials"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Testimonials
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Testimonial</h1>
        <p className="text-gray-600 mt-1">
          Add a new customer testimonial to display on the marketing site.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TestimonialEditor />
      </div>
    </div>
  );
}
