/**
 * Edit Testimonial Page
 *
 * Platform admin page for editing an existing testimonial.
 */

import { prisma } from "@/lib/db/prisma";
import { requirePlatformUser } from "@/lib/auth/guards";
import { TestimonialEditor } from "@/components/platform/testimonial-editor";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({ params }: PageProps) {
  await requirePlatformUser();
  const { id } = await params;

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    notFound();
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Testimonial</h1>
        <p className="text-gray-600 mt-1">
          Update testimonial from {testimonial.name}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TestimonialEditor testimonial={testimonial} />
      </div>
    </div>
  );
}
