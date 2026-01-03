"use client";
import { useState } from "react";
import Link from "next/link";

export default function Admin() {
  const [file, setFile] = useState<File|null>(null);
  const [orgId, setOrgId] = useState("franchise_123");
  const [manualName, setManualName] = useState("OpsManual");
  const [version, setVersion] = useState("v1");
  const [docId, setDocId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const upload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("org_id", orgId);
      fd.append("manual_name", manualName);
      fd.append("version", version);

      console.log("Uploading to:", `${process.env.NEXT_PUBLIC_API_BASE}/admin/upload`);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/upload`, {
        method: "POST",
        body: fd,
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Upload error:", errorText);
        alert(`Upload failed (${res.status}): ${errorText}`);
        return;
      }
      
      const data = await res.json();
      console.log("Upload response:", data);
      setDocId(data.doc_id);
      alert("Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const reindex = async () => {
    if (!docId) return;
    setIsReindexing(true);
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/reindex?doc_id=${docId}`, {
        method: "POST",
      });
      alert("Successfully re-indexed!");
    } catch (error) {
      alert("Re-index failed. Please try again.");
    } finally {
      setIsReindexing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f4f6f9", color: "#1a1f36", fontFamily: "Inter, sans-serif" }}>
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
          <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "#718096" }}>| Admin Portal</span>
        </div>
        <Link href="/" style={{ color: "#4a5568", textDecoration: "none", fontWeight: 500, fontSize: "0.95rem", padding: "0.5rem 1rem", borderRadius: "12px", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#e9ecef"; e.currentTarget.style.color = "#0056b3"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#4a5568"; }}>
          ← Back to Chat
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "600px", padding: "2.5rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "2rem", color: "#1a1f36" }}>Document Ingestion</h1>

          {/* Form Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "#4a5568" }}>Franchise ID</label>
              <input
                type="text"
                value={orgId}
                onChange={e => setOrgId(e.target.value)}
                placeholder="e.g. franchise_123"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", outline: "none", transition: "all 0.2s", backgroundColor: "#f8f9fa", border: "1px solid #e2e8f0", color: "#1a1f36", fontSize: "1rem" }}
                onFocus={(e) => { e.target.style.borderColor = "#0056b3"; e.target.style.boxShadow = "0 0 0 3px rgba(0, 86, 179, 0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "#4a5568" }}>Manual Type / Name</label>
              <input
                type="text"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="e.g. OpsManual"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", outline: "none", transition: "all 0.2s", backgroundColor: "#f8f9fa", border: "1px solid #e2e8f0", color: "#1a1f36", fontSize: "1rem" }}
                onFocus={(e) => { e.target.style.borderColor = "#0056b3"; e.target.style.boxShadow = "0 0 0 3px rgba(0, 86, 179, 0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "#4a5568" }}>Version Identifier</label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="e.g. v1.2"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", outline: "none", transition: "all 0.2s", backgroundColor: "#f8f9fa", border: "1px solid #e2e8f0", color: "#1a1f36", fontSize: "1rem" }}
                onFocus={(e) => { e.target.style.borderColor = "#0056b3"; e.target.style.boxShadow = "0 0 0 3px rgba(0, 86, 179, 0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* File Drop Zone */}
          <div
            style={{
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              borderRadius: "12px",
              padding: "2rem",
              marginBottom: "1.5rem",
              border: isDragging ? "2px dashed #0056b3" : "2px dashed #cbd5e0",
              backgroundColor: isDragging ? "#e6f2ff" : "#f8f9fa"
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#0056b3"; e.currentTarget.style.backgroundColor = "#e6f2ff"; }}
            onMouseOut={(e) => { if (!isDragging) { e.currentTarget.style.borderColor = "#cbd5e0"; e.currentTarget.style.backgroundColor = "#f8f9fa"; } }}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <div style={{ color: "#718096", marginBottom: "1rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto", display: "block" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div style={{ fontSize: "0.875rem", color: "#4a5568" }}>
              <span style={{ fontWeight: 600, color: "#0056b3" }}>Click to upload</span> or drag and drop PDF here
            </div>
            {file && (
              <div style={{ marginTop: "0.75rem", fontSize: "0.813rem", fontWeight: 500, color: "#0056b3" }}>
                ✓ Selected: {file.name}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={upload}
              disabled={!file || isUploading}
              style={{
                width: "100%",
                padding: "0.875rem 1.5rem",
                borderRadius: "8px",
                fontWeight: 600,
                transition: "all 0.2s",
                border: "none",
                cursor: (!file || isUploading) ? "not-allowed" : "pointer",
                opacity: (!file || isUploading) ? 0.5 : 1,
                backgroundColor: "#006add",
                color: "white",
                fontSize: "1rem"
              }}
              onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0056b3")}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#006add"}
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </button>
            
            <button
              onClick={reindex}
              disabled={!docId || isReindexing}
              style={{
                width: "100%",
                padding: "0.875rem 1.5rem",
                borderRadius: "8px",
                fontWeight: 600,
                transition: "all 0.2s",
                cursor: (!docId || isReindexing) ? "not-allowed" : "pointer",
                opacity: (!docId || isReindexing) ? 0.5 : 1,
                backgroundColor: "transparent",
                border: "1px solid #dc2626",
                color: "#dc2626",
                fontSize: "1rem"
              }}
              onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)")}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              {isReindexing ? "Re-indexing..." : "⚠ Danger Zone: Full Re-index"}
            </button>
          </div>

          {/* Doc ID Display */}
          {docId && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "8px", backgroundColor: "#f0fdf4", border: "1px solid #86efac" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 500, marginBottom: "0.25rem", color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em" }}>Document ID</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "#15803d", fontWeight: 600 }}>{docId}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
