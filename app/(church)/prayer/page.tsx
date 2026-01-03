/**
 * Public Prayer Request Page
 *
 * Allows visitors to submit prayer requests.
 */

import { notFound } from "next/navigation";
import { getSiteData, getFormByType } from "@/lib/public/get-site-data";
import { DynamicForm } from "@/components/public/dynamic-form";
import type { FormField, FormSettings } from "@/types/forms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prayer Request",
  description: "Submit a prayer request and let us pray for you.",
};

export default async function PrayerRequestPage() {
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const { church } = siteData;

  // Get the prayer request form
  const form = await getFormByType(church.id, "PRAYER_REQUEST");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Prayer Request
        </h1>
        <p className="mt-2 text-gray-600">
          We believe in the power of prayer and would be honored to pray for you
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        {form && form.isActive ? (
          <>
            {form.description && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">{form.description}</p>
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
            Prayer request form is currently unavailable.
          </p>
        )}
      </div>
    </div>
  );
}
