/**
 * Testimonials List Page
 *
 * Platform admin page for managing testimonials.
 */

import { prisma } from "@/lib/db/prisma";
import { requirePlatformUser } from "@/lib/auth/guards";
import Link from "next/link";

export default async function TestimonialsPage() {
  await requirePlatformUser();

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600 mt-1">
            Manage customer testimonials displayed on the marketing site.
          </p>
        </div>
        <Link
          href="/marketing/testimonials/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Testimonial
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {testimonials.filter((t) => t.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Featured</p>
          <p className="text-2xl font-bold text-indigo-600">
            {testimonials.filter((t) => t.featured).length}
          </p>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {testimonials.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No testimonials yet.</p>
            <Link
              href="/marketing/testimonials/new"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Add your first testimonial →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {testimonials.map((testimonial) => (
              <Link
                key={testimonial.id}
                href={`/marketing/testimonials/${testimonial.id}`}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-lg font-medium">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {testimonial.name}
                    </h3>
                    {testimonial.featured && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Featured
                      </span>
                    )}
                    {!testimonial.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  {(testimonial.title || testimonial.company) && (
                    <p className="text-sm text-gray-500 mb-2">
                      {[testimonial.title, testimonial.company].filter(Boolean).join(" at ")}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>

                {/* Sort Order */}
                <span className="text-sm text-gray-400">
                  #{testimonial.sortOrder}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
