/**
 * Public Prayer Request Page
 *
 * Allows visitors to submit prayer requests.
 */

import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { PrayerRequestForm } from "@/components/public/prayer-request-form";
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Prayer Request
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          We believe in the power of prayer and would be honored to pray for you
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <PrayerRequestForm />
      </div>
    </div>
  );
}
