/**
 * Public Volunteer Signup Page
 *
 * Allows visitors to sign up to volunteer.
 */

import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { VolunteerSignupForm } from "@/components/public/volunteer-signup-form";
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Volunteer
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Join us in serving our community at {church.name}
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            We have many opportunities for you to use your gifts and talents.
            Whether you have a little time or a lot, there's a place for you!
          </p>
        </div>
        <VolunteerSignupForm />
      </div>
    </div>
  );
}
