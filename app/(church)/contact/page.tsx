/**
 * Public Contact Page
 *
 * Displays contact information, map embed, and contact form.
 */

import { notFound } from "next/navigation";
import { getSiteData, getFormByType } from "@/lib/public/get-site-data";
import { DynamicForm } from "@/components/public/dynamic-form";
import type { FormField, FormSettings } from "@/types/forms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default async function ContactPage() {
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const { church, settings } = siteData;

  // Get the contact form
  const form = await getFormByType(church.id, "CONTACT");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Contact Us
        </h1>
        <p className="mt-2 text-gray-600">
          We'd love to hear from you
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Get in Touch
          </h2>

          <div className="space-y-6">
            {/* Service Times */}
            {settings.serviceTimes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Service Times
                </h3>
                <p className="text-gray-900 whitespace-pre-line">
                  {settings.serviceTimes}
                </p>
              </div>
            )}

            {/* Address */}
            {settings.address && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Address
                </h3>
                <p className="text-gray-900">
                  {settings.address}
                </p>
              </div>
            )}

            {/* Phone */}
            {settings.phone && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Phone
                </h3>
                <a
                  href={`tel:${settings.phone.replace(/\D/g, "")}`}
                  className="text-blue-600 hover:underline"
                >
                  {settings.phone}
                </a>
              </div>
            )}

            {/* Email */}
            {settings.contactEmail && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Email
                </h3>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {settings.contactEmail}
                </a>
              </div>
            )}
          </div>

          {/* Google Maps Embed */}
          {settings.mapEmbedUrl && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Find Us
              </h3>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={settings.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map to ${church.name}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Send Us a Message
          </h2>
          {form && form.isActive ? (
            <DynamicForm
              formId={form.id}
              fields={form.fields as unknown as FormField[]}
              settings={form.settings as unknown as FormSettings}
            />
          ) : (
            <p className="text-gray-500">
              Contact form is currently unavailable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
