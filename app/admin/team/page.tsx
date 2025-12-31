/**
 * Team Management Page
 *
 * Admin-only page for managing team members and invites.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  expiresAt: string;
  createdAt: string;
}

const roleLabels = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

const roleColors = {
  ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  EDITOR: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  VIEWER: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function TeamPage() {
  const router = useRouter();
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("EDITOR");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    try {
      const response = await fetch("/api/team");
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.status === 403) {
          router.push("/dashboard");
          return;
        }
        setError(data.error || "Failed to load team");
        return;
      }

      setUsers(data.users);
      setInvites(data.invites);
    } catch {
      setError("Failed to load team");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");
    setInviteUrl("");
    setInviteLoading(true);

    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        setInviteError(data.error || "Failed to create invite");
        setInviteLoading(false);
        return;
      }

      setInviteUrl(data.inviteUrl);
      setInviteEmail("");
      fetchTeam();
    } catch {
      setInviteError("An unexpected error occurred");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: "ADMIN" | "EDITOR" | "VIEWER") {
    try {
      const response = await fetch(`/api/team/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to update role");
        return;
      }

      fetchTeam();
    } catch {
      alert("Failed to update role");
    }
  }

  async function handleRemove(id: string, type: "user" | "invite") {
    const confirmMessage =
      type === "user"
        ? "Are you sure you want to remove this team member? They will lose access immediately."
        : "Are you sure you want to cancel this invite?";

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/team/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to remove");
        return;
      }

      fetchTeam();
    } catch {
      alert("Failed to remove");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Team
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage team members and invites
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)}>
          {showInviteForm ? "Cancel" : "Invite Member"}
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Invite New Team Member</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            {inviteError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                {inviteError}
              </div>
            )}

            {inviteUrl && (
              <div className="p-3 text-sm bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="text-green-800 dark:text-green-300 mb-2">
                  Invite created! Share this link:
                </p>
                <code className="block p-2 bg-white dark:bg-gray-900 rounded text-xs break-all">
                  {window.location.origin}{inviteUrl}
                </code>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                placeholder="colleague@example.com"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "EDITOR" | "VIEWER")}
                  className="block w-full px-3 py-2 border rounded-md shadow-sm text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="VIEWER">Viewer - Can view content</option>
                  <option value="EDITOR">Editor - Can create and edit content</option>
                  <option value="ADMIN">Admin - Full access</option>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={inviteLoading}>
              {inviteLoading ? "Sending..." : "Send Invite"}
            </Button>
          </form>
        </div>
      )}

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Pending Invites
          </h2>
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {invites.map((invite) => (
                  <tr key={invite.id} className="bg-yellow-50 dark:bg-yellow-900/10">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {invite.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[invite.role]}`}>
                        {roleLabels[invite.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemove(invite.id, "invite")}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Team Members */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Team Members
        </h2>
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name || "—"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as "ADMIN" | "EDITOR" | "VIEWER")}
                      className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${roleColors[user.role]}`}
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemove(user.id, "user")}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
