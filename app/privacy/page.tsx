/**
 * Privacy Policy Page
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Faith Interactive and Shift Agency, LLC SMS communications.",
};

export default function PrivacyPage() {
  return (
    <section className="section-padding bg-[#0a0a0a]">
      <div className="container max-w-3xl">
        <h1 className="text-display mb-8">Privacy Policy</h1>
        <p className="text-body-lg text-[#a3a3a3] mb-12">
          Shift Agency, LLC SMS Communications
        </p>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-h3 mb-4 mt-12">Data Sharing Restrictions</h2>
          <p className="text-body text-[#a3a3a3] mb-6">
            Shift Agency, LLC does not share mobile numbers, text messaging originator opt-in data,
            or consent with any third parties or affiliates for marketing or promotional purposes.
          </p>

          <h2 className="text-h3 mb-4 mt-12">Limited Third-Party Access</h2>
          <p className="text-body text-[#a3a3a3] mb-6">
            The company may share mobile information exclusively with supporting service providers,
            including messaging platforms, telecommunications carriers, and customer support vendors.
            This disclosure occurs solely to enable SMS delivery operations.
          </p>

          <h2 className="text-h3 mb-4 mt-12">Data Usage Limitations</h2>
          <p className="text-body text-[#a3a3a3] mb-6">
            All other applications of the collected information exclude text messaging opt-in data
            and consent records. The company commits that this information will not be distributed
            to external parties.
          </p>

          <div className="border-t border-[#262626] mt-12 pt-8">
            <p className="text-sm text-[#525252]">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
