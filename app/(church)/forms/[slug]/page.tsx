/**
 * Public Custom Form Page
 *
 * Dynamic route for custom forms created in the admin.
 * Loads form by slug and renders using DynamicForm.
 */

import { notFound } from "next/navigation";
import { getSiteData, getFormBySlug } from "@/lib/public/get-site-data";
import { DynamicForm } from "@/components/public/dynamic-form";
import type { FormField, FormSettings } from "@/types/forms";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteData = await getSiteData();

  if (!siteData) {
    return { title: "Form" };
  }

  const form = await getFormBySlug(siteData.church.id, slug);

  return {
    title: form?.name || "Form",
    description: form?.description || undefined,
  };
}

export default async function CustomFormPage({ params }: PageProps) {
  const { slug } = await params;
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const { church } = siteData;

  // Get the form by slug
  const form = await getFormBySlug(church.id, slug);

  if (!form || !form.isActive) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {form.name}
        </h1>
        {form.description && (
          <p className="mt-2 text-gray-600">
            {form.description}
          </p>
        )}
      </header>

      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <DynamicForm
          formId={form.id}
          fields={form.fields as unknown as FormField[]}
          settings={form.settings as unknown as FormSettings}
        />
      </div>
    </div>
  );
}
