/**
 * Public Volunteer Signup Page
 *
 * Allows visitors to sign up to volunteer.
 */

import { notFound } from "next/navigation";
import { getSiteData, getFormByType } from "@/lib/public/get-site-data";
import { DynamicForm } from "@/components/public/dynamic-form";
import type { FormField, FormSettings } from "@/types/forms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer",
  description: "Sign up to serve and make a difference in our community.",
};

export default async function VolunteerPage() {
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const { church } = siteData;

  // Get the volunteer form
  const form = await getFormByType(church.id, "VOLUNTEER");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Volunteer
        </h1>
        <p className="mt-2 text-gray-600">
          Join us in serving our community at {church.name}
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        {form && form.isActive ? (
          <>
            {form.description && (
              <div className="mb-8 text-center">
                <p className="text-gray-600">{form.description}</p>
              </div>
            )}
            <DynamicForm
              formId={form.id}
              fields={form.fields as unknown as FormField[]}
              settings={form.settings as unknown as FormSettings}
            />
          </>
        ) : (
          <p className="text-gray-500 text-center">
            Volunteer signup form is currently unavailable.
          </p>
        )}
      </div>
    </div>
  );
}
