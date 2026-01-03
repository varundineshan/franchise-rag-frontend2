"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  action: string;
  resource_id: string | null;
  resource_type: string | null;
  status: string;
  metadata: any;
  ip_address: string | null;
}

interface AuditSummary {
  period_days: number;
  total_actions: number;
  actions_by_type: Record<string, number>;
  status_summary: {
    success: number;
    failure: number;
    denied: number;
  };
  success_rate: number;
  top_users: Array<{ user_id: string; action_count: number }>;
  recent_failures: Array<{
    timestamp: string;
    user_id: string;
    action: string;
    status: string;
    resource_id: string | null;
    metadata: any;
  }>;
}

export default function AnalyticsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [days, setDays] = useState(7);
  const [actionFilter, setActionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (isLoaded && (!isSignedIn || user?.publicMetadata?.role !== "admin")) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, user, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.publicMetadata?.role === "admin") {
      fetchSummary();
      fetchLogs();
    }
  }, [isLoaded, isSignedIn, user, days, actionFilter, statusFilter]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/audit-logs/summary?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch summary");
      }

      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        days: days.toString(),
        limit: "50",
      });
      if (actionFilter) params.append("action", actionFilter);
      if (statusFilter) params.append("status", statusFilter);

      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/audit-logs/export?days=90`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to export logs");
      }

      const data = await res.json();
      const blob = new Blob([data.content], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="bg-[#0f172a] border-b border-[#334155] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">Admin Analytics</h1>
            <nav className="flex gap-4">
              <a href="/" className="text-[#94a3b8] hover:text-white transition">
                Chat
              </a>
              <a href="/admin" className="text-[#94a3b8] hover:text-white transition">
                Upload
              </a>
              <a href="/admin/analytics" className="text-white font-semibold">
                Analytics
              </a>
            </nav>
          </div>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#334155]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 -mb-px ${
              activeTab === "overview"
                ? "border-b-2 border-[#3b82f6] text-white font-semibold"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 -mb-px ${
              activeTab === "logs"
                ? "border-b-2 border-[#3b82f6] text-white font-semibold"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            Audit Logs
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#0f172a] rounded-lg p-4 mb-6 flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <span className="text-[#94a3b8]">Time Period:</span>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-[#1e293b] text-white px-3 py-2 rounded border border-[#334155] focus:border-[#3b82f6] outline-none"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>

          {activeTab === "logs" && (
            <>
              <label className="flex items-center gap-2">
                <span className="text-[#94a3b8]">Action:</span>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="bg-[#1e293b] text-white px-3 py-2 rounded border border-[#334155] focus:border-[#3b82f6] outline-none"
                >
                  <option value="">All</option>
                  <option value="upload">Upload</option>
                  <option value="reindex">Reindex</option>
                  <option value="auth_failure">Auth Failure</option>
                  <option value="permission_denied">Permission Denied</option>
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span className="text-[#94a3b8]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#1e293b] text-white px-3 py-2 rounded border border-[#334155] focus:border-[#3b82f6] outline-none"
                >
                  <option value="">All</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="denied">Denied</option>
                </select>
              </label>

              <button
                onClick={exportLogs}
                className="ml-auto bg-[#3b82f6] hover:bg-[#2563eb] px-4 py-2 rounded font-semibold transition"
              >
                Export CSV
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && summary && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#0f172a] rounded-lg p-6 border border-[#334155]">
                <div className="text-[#94a3b8] text-sm mb-2">Total Actions</div>
                <div className="text-3xl font-bold">{summary.total_actions}</div>
              </div>
              <div className="bg-[#0f172a] rounded-lg p-6 border border-[#334155]">
                <div className="text-[#94a3b8] text-sm mb-2">Success Rate</div>
                <div className="text-3xl font-bold text-green-500">
                  {summary.success_rate.toFixed(1)}%
                </div>
              </div>
              <div className="bg-[#0f172a] rounded-lg p-6 border border-[#334155]">
                <div className="text-[#94a3b8] text-sm mb-2">Failures</div>
                <div className="text-3xl font-bold text-red-500">
                  {summary.status_summary.failure}
                </div>
              </div>
              <div className="bg-[#0f172a] rounded-lg p-6 border border-[#334155]">
                <div className="text-[#94a3b8] text-sm mb-2">Denied</div>
                <div className="text-3xl font-bold text-yellow-500">
                  {summary.status_summary.denied}
                </div>
              </div>
            </div>

            {/* Actions by Type */}
            <div className="bg-[#0f172a] rounded-lg p-6 border border-[#334155]">
              <h3 className="text-xl font-bold mb-4">Actions by Type</h3>
              <div className="space-y-2">
                {Object.entries(summary.actions_by_type).map(([action, count]) => (
                  <div key={action} className="flex justify-between items-center">
                    <span className="text-[#94a3b8] capitalize">
                      {action.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-[#0f172a] rounded-lg p-6 border border-[#334155]">
              <h3 className="text-xl font-bold mb-4">Most Active Users</h3>
              <div className="space-y-2">
                {summary.top_users.slice(0, 10).map((u, i) => (
                  <div key={u.user_id} className="flex justify-between items-center">
                    <span className="text-[#94a3b8]">
                      #{i + 1} {u.user_id.substring(0, 20)}...
                    </span>
                    <span className="font-bold">{u.action_count} actions</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Failures */}
            {summary.recent_failures.length > 0 && (
              <div className="bg-[#0f172a] rounded-lg p-6 border border-red-500/50">
                <h3 className="text-xl font-bold mb-4 text-red-500">Recent Failures</h3>
                <div className="space-y-4">
                  {summary.recent_failures.slice(0, 5).map((log, i) => (
                    <div key={i} className="bg-[#1e293b] rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold capitalize">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm text-[#94a3b8]">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-[#94a3b8]">
                        User: {log.user_id} | Status: {log.status}
                      </div>
                      {log.metadata && (
                        <pre className="text-xs text-[#94a3b8] mt-2 overflow-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === "logs" && (
          <div className="bg-[#0f172a] rounded-lg border border-[#334155] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1e293b] border-b border-[#334155]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Resource</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs && logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#94a3b8]">
                        No audit logs found for the selected filters.
                        <br />
                        <span className="text-sm">
                          Try uploading a document or performing other actions to generate logs.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    logs?.map((log) => (
                      <tr key={log.id} className="border-b border-[#334155] hover:bg-[#1e293b]">
                        <td className="px-4 py-3 text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm capitalize">
                          {log.action.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-xs">
                          {log.user_id.substring(0, 15)}...
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              log.status === "success"
                                ? "bg-green-500/20 text-green-500"
                                : log.status === "failure"
                                ? "bg-red-500/20 text-red-500"
                                : "bg-yellow-500/20 text-yellow-500"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-xs">
                          {log.resource_type && log.resource_id
                            ? `${log.resource_type}: ${log.resource_id.substring(0, 10)}...`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#94a3b8]">
                          {log.ip_address || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-[#94a3b8]">Loading data...</div>
        )}
      </div>
    </div>
  );
}
