"use client";
import { useState, useEffect } from "react";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AnalyticsData = {
  total_queries: number;
  refusal_rate: number;
  avg_latency_ms: number;
  recent_7_days: number;
  top_questions: { question: string; count: number }[];
};

type AuditLog = {
  id: string;
  timestamp: string;
  user_id: string;
  action: string;
  resource_id: string | null;
  resource_type: string | null;
  status: string;
  metadata: any;
  ip_address: string | null;
};

export default function Analytics() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"overview" | "logs">("overview");

  useEffect(() => {
    if (isLoaded && (!isSignedIn || user?.publicMetadata?.role !== "admin")) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, user, router]);

  useEffect(() => {
    if (isSignedIn && user?.publicMetadata?.role === "admin") {
      fetchData();
    }
  }, [isSignedIn, user]);

  const fetchData = async () => {
    try {
      const token = await getToken();
      
      // Fetch analytics
      const analyticsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/analytics`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      // Fetch audit logs
      console.log("Fetching audit logs from:", `${process.env.NEXT_PUBLIC_API_BASE}/admin/audit-logs`);
      const logsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/audit-logs?limit=50`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const logsData = await logsRes.json();
      console.log("Audit logs response:", logsData);
      console.log("Number of logs:", logsData.logs?.length);
      console.log("Sample log:", logsData.logs?.[0]);
      setLogs(logsData.logs || []);
      setTotalLogs(logsData.total || 0);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f4f6f9" }}>
        <div style={{ color: "#4a5568", fontSize: "1.125rem" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f4f6f9", color: "#1a1f36", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", zIndex: 10 }}>
        <div style={{ fontWeight: 600, fontSize: "1.25rem", color: "#0056b3", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "32px", height: "32px", background: "#0056b3", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
              <path d="M12 12L2.1 12.1"/>
              <path d="M12 12l8.8-8.8"/>
            </svg>
          </div>
          <span>FranchiseOps AI</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "#718096" }}>| Analytics Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" style={{ color: "#4a5568", textDecoration: "none", fontWeight: 500, fontSize: "0.95rem", padding: "0.5rem 1rem", borderRadius: "12px", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#e9ecef"; e.currentTarget.style.color = "#0056b3"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#4a5568"; }}>
            ← Back to Chat
          </Link>
          <Link href="/admin" style={{ color: "#4a5568", textDecoration: "none", fontWeight: 500, fontSize: "0.95rem", padding: "0.5rem 1rem", borderRadius: "12px", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#e9ecef"; e.currentTarget.style.color = "#0056b3"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#4a5568"; }}>
            Admin Portal
          </Link>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      {/* Tabs */}
      <div style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "0 2rem" }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          <button
            onClick={() => setSelectedTab("overview")}
            style={{
              padding: "1rem 0",
              background: "none",
              border: "none",
              borderBottom: selectedTab === "overview" ? "2px solid #0056b3" : "2px solid transparent",
              color: selectedTab === "overview" ? "#0056b3" : "#718096",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95rem"
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab("logs")}
            style={{
              padding: "1rem 0",
              background: "none",
              border: "none",
              borderBottom: selectedTab === "logs" ? "2px solid #0056b3" : "2px solid transparent",
              color: selectedTab === "logs" ? "#0056b3" : "#718096",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95rem"
            }}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: "1400px", width: "100%", margin: "0 auto" }}>
        {selectedTab === "overview" && analytics && (
          <>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
                <div style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Queries</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0056b3" }}>{analytics.total_queries.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
                <div style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last 7 Days</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#16a34a" }}>{analytics.recent_7_days.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
                <div style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Refusal Rate</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: analytics.refusal_rate > 20 ? "#dc2626" : "#f59e0b" }}>{analytics.refusal_rate}%</div>
              </div>
              <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
                <div style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Latency</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#6366f1" }}>{Math.round(analytics.avg_latency_ms)}ms</div>
              </div>
            </div>

            {/* Top Questions */}
            <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#1a1f36" }}>Top 10 Questions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {analytics.top_questions.length > 0 ? (
                  analytics.top_questions.map((q, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <div style={{ flex: 1, color: "#1a1f36", fontSize: "0.95rem" }}>{q.question}</div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0056b3", backgroundColor: "#e6f2ff", padding: "0.25rem 0.75rem", borderRadius: "12px" }}>
                        {q.count}x
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#718096" }}>No queries yet</div>
                )}
              </div>
            </div>
          </>
        )}

        {selectedTab === "logs" && (
          <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1f36" }}>Audit Logs</h2>
              <div style={{ fontSize: "0.875rem", color: "#718096" }}>Total: {totalLogs} actions</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>Time</th>
                    <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>Action</th>
                    <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>User</th>
                    <th style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                    <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>Resource</th>
                    <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#718096" }}>
                        No audit logs found. Check console for API response.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#718096" }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#1a1f36", fontWeight: 500 }}>
                          {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#4a5568", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {log.user_id.substring(0, 15)}...
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          <span style={{ 
                            padding: "0.25rem 0.75rem", 
                            borderRadius: "12px", 
                            fontSize: "0.75rem", 
                            fontWeight: 600,
                            backgroundColor: log.status === "success" ? "#d1fae5" : log.status === "failure" ? "#fee2e2" : "#fef3c7",
                            color: log.status === "success" ? "#16a34a" : log.status === "failure" ? "#dc2626" : "#f59e0b"
                          }}>
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#4a5568" }}>
                          {log.resource_type ? `${log.resource_type}: ${log.resource_id?.substring(0, 8)}...` : "-"}
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#718096" }}>
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
      </main>
    </div>
  );
}
