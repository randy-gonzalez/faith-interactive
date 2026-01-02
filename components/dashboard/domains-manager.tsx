"use client";

/**
 * Domains Manager Component
 *
 * Client component for managing custom domains.
 * Handles add, verify, and remove operations.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DomainStatus } from "@prisma/client";

interface Domain {
  id: string;
  hostname: string;
  status: DomainStatus;
  verificationToken: string;
  verifiedAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

interface DomainsManagerProps {
  initialDomains: Domain[];
  churchSlug: string;
}

export function DomainsManager({ initialDomains, churchSlug }: DomainsManagerProps) {
  const [domains, setDomains] = useState(initialDomains);
  const [newHostname, setNewHostname] = useState("");
  const [adding, setAdding] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<string | null>(null);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);

    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: newHostname }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add domain");
        return;
      }

      setDomains([data.domain, ...domains]);
      setNewHostname("");
      setShowInstructions(data.domain.id);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    setVerifying(domainId);
    setError(null);

    try {
      const response = await fetch(`/api/domains/${domainId}/verify`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      // Update domain in list
      setDomains(domains.map((d) =>
        d.id === domainId ? data.domain : d
      ));

      if (!data.verified) {
        setError(data.message);
        setShowInstructions(domainId);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setVerifying(null);
    }
  };

  const handleDelete = async (domainId: string) => {
    if (!confirm("Are you sure you want to remove this domain?")) {
      return;
    }

    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDomains(domains.filter((d) => d.id !== domainId));
      } else {
        const data = await response.json();
        setError(data.error || "Failed to remove domain");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const getStatusBadge = (status: DomainStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Verification
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            Verification Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Domain Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Add Custom Domain
        </h2>
        <form onSubmit={handleAddDomain} className="flex gap-3">
          <Input
            type="text"
            placeholder="www.yourchurch.org"
            value={newHostname}
            onChange={(e) => setNewHostname(e.target.value)}
            className="flex-1"
            disabled={adding}
          />
          <Button type="submit" disabled={adding || !newHostname.trim()}>
            {adding ? "Adding..." : "Add Domain"}
          </Button>
        </form>
        <p className="mt-2 text-sm text-gray-500">
          Enter the full domain including www if needed (e.g., www.example.com or example.com)
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Existing Domains */}
      {domains.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {domains.map((domain) => (
                <tr key={domain.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {domain.hostname}
                    </div>
                    {domain.verifiedAt && (
                      <div className="text-xs text-gray-500">
                        Verified {new Date(domain.verifiedAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(domain.status)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {domain.status !== "ACTIVE" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerify(domain.id)}
                        disabled={verifying === domain.id}
                      >
                        {verifying === domain.id ? "Verifying..." : "Verify"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowInstructions(
                        showInstructions === domain.id ? null : domain.id
                      )}
                    >
                      {showInstructions === domain.id ? "Hide" : "Setup"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(domain.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Instructions Panel */}
          {showInstructions && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              {(() => {
                const domain = domains.find((d) => d.id === showInstructions);
                if (!domain) return null;

                return (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Setup Instructions for {domain.hostname}
                    </h3>

                    {/* Step 1: Verification */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Step 1: Verify Domain Ownership
                      </h4>
                      <p className="text-sm text-gray-500">
                        Add a TXT record to your DNS settings:
                      </p>
                      <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-500">Name: </span>
                            <span className="text-gray-900">_fi-verify</span>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText("_fi-verify")}
                            className="text-blue-600 hover:text-blue-700 text-xs"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div>
                            <span className="text-gray-500">Type: </span>
                            <span className="text-gray-900">TXT</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div>
                            <span className="text-gray-500">Value: </span>
                            <span className="text-gray-900 break-all">
                              fi-verify={domain.verificationToken}
                            </span>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(
                              `fi-verify=${domain.verificationToken}`
                            )}
                            className="text-blue-600 hover:text-blue-700 text-xs"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Point domain */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Step 2: Point Your Domain
                      </h4>
                      <p className="text-sm text-gray-500">
                        Add a CNAME record pointing to your Faith Interactive subdomain:
                      </p>
                      <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-500">Name: </span>
                            <span className="text-gray-900">
                              {domain.hostname.startsWith("www.") ? "www" : "@"}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div>
                            <span className="text-gray-500">Type: </span>
                            <span className="text-gray-900">CNAME</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div>
                            <span className="text-gray-500">Value: </span>
                            <span className="text-gray-900">
                              {churchSlug}.faithinteractive.com
                            </span>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(
                              `${churchSlug}.faithinteractive.com`
                            )}
                            className="text-blue-600 hover:text-blue-700 text-xs"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500">
                      DNS changes can take up to 48 hours to propagate. After adding the records,
                      click &quot;Verify&quot; to check if your domain is ready.
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            No custom domains configured yet. Add your first domain above.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Your site is currently available at: {churchSlug}.faithinteractive.com
          </p>
        </div>
      )}
    </div>
  );
}
