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
    <div className="flex flex-col h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4" style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
            <path d="M12 12L2.1 12.1"/>
            <path d="M12 12l8.8-8.8"/>
          </svg>
          <span className="text-xl font-bold">FranchiseOps AI</span>
          <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>| Admin</span>
        </div>
        <nav>
          <Link href="/" className="text-sm font-medium transition-colors" style={{ color: "var(--text-secondary)" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>← Back to Chat</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg p-10 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}>
          <h1 className="text-2xl font-bold mb-8">Document Ingestion</h1>

          {/* Form Fields */}
          <div className="space-y-5 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Franchise ID</label>
              <input
                type="text"
                value={orgId}
                onChange={e => setOrgId(e.target.value)}
                placeholder="e.g. franchise_123"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent-color)"; e.target.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.2)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Manual Type / Name</label>
              <input
                type="text"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="e.g. OpsManual"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent-color)"; e.target.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.2)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Version Identifier</label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="e.g. v1.2"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent-color)"; e.target.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.2)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* File Drop Zone */}
          <div
            className="text-center cursor-pointer transition-all rounded-xl p-8 mb-6"
            style={{
              border: isDragging ? "2px dashed var(--accent-color)" : "2px dashed var(--border-color)",
              backgroundColor: isDragging ? "var(--bg-tertiary)" : "var(--bg-main)"
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--accent-color)"; e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"; }}
            onMouseOut={(e) => { if (!isDragging) { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.backgroundColor = "var(--bg-main)"; } }}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div style={{ color: "var(--text-secondary)" }} className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <span className="font-semibold" style={{ color: "var(--accent-color)" }}>Click to upload</span> or drag and drop PDF here
            </div>
            {file && (
              <div className="mt-3 text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                Selected: {file.name}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={upload}
              disabled={!file || isUploading}
              className="w-full px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--accent-color)", color: "white" }}
              onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "var(--accent-hover)")}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--accent-color)"}
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </button>
            
            <button
              onClick={reindex}
              disabled={!docId || isReindexing}
              className="w-full px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "transparent", border: "1px solid #991b1b", color: "var(--danger-color)" }}
              onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)")}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              {isReindexing ? "Re-indexing..." : "Danger Zone: Full Re-index"}
            </button>
          </div>

          {/* Doc ID Display */}
          {docId && (
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--border-color)" }}>
              <div className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Document ID</div>
              <div className="font-mono text-sm" style={{ color: "var(--success-color)" }}>{docId}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
