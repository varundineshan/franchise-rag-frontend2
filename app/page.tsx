"use client";
import { useState } from "react";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

type Citation = { doc: string; pages: number[]; chunk_id?: string };
type Message = { role: "user" | "ai"; content: string; citations?: Citation[]; refused?: boolean };

export default function Home() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: `Hello! I'm here to help you with your franchise operations manual. What can I help you with today?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const ask = async () => {
    if (!q.trim() || isLoading || !isSignedIn) return;
    
    const userMessage: Message = { role: "user", content: q };
    setMessages(prev => [...prev, userMessage]);
    setQ("");
    setIsLoading(true);

    try {
      const token = await getToken();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question: q,
          manual_name: "OpsManual"
        })
      });

      const data = await res.json();
      
      const aiMessage: Message = {
        role: "ai",
        content: data.answer || "I encountered an error.",
        citations: data.citations || [],
        refused: data.refused || false
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        refused: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  if (!isLoaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f4f6f9" }}>
        <div style={{ color: "#4a5568", fontSize: "1.125rem" }}>Loading...</div>
      </div>
    );
  }

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
          FranchiseOps AI
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {user?.publicMetadata?.role === "admin" && (
            <Link href="/admin" style={{ color: "#4a5568", textDecoration: "none", fontWeight: 500, fontSize: "0.95rem", padding: "0.5rem 1rem", borderRadius: "12px", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#e9ecef"; e.currentTarget.style.color = "#0056b3"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#4a5568"; }}>
              Admin Portal →
            </Link>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      {/* Chat Container */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2rem", backgroundColor: "#f4f6f9" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", maxWidth: "85%", marginLeft: msg.role === "user" ? "auto" : "0", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
            {/* Avatar */}
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.9rem", flexShrink: 0, backgroundColor: msg.role === "ai" ? "#ffffff" : "#006add", border: msg.role === "ai" ? "2px solid #0056b3" : "none", color: msg.role === "ai" ? "#0056b3" : "white" }}>
              {msg.role === "ai" ? "AI" : "U"}
            </div>

            {/* Message Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ padding: "1rem 1.5rem", borderRadius: "12px", lineHeight: "1.6", fontSize: "1rem", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", position: "relative", backgroundColor: msg.role === "ai" ? "#ffffff" : "#006add", color: msg.role === "ai" ? "#1a1f36" : "#ffffff", border: msg.role === "ai" ? "1px solid #e2e8f0" : "none", borderTopLeftRadius: msg.role === "ai" ? "2px" : "12px", borderTopRightRadius: msg.role === "user" ? "2px" : "12px" }}>
                {msg.refused && <span style={{ fontSize: "0.85rem", fontStyle: "italic", display: "block", marginBottom: "0.5rem", opacity: 0.7 }}>(Response refused)</span>}
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>

                {/* Citations */}
                {msg.role === "ai" && msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
                    <div style={{ fontWeight: 600, color: "#4a5568", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "0.75rem" }}>Sources detected</div>
                    <ul style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: 0, margin: 0 }}>
                      {msg.citations.map((cite, idx) => (
                        <li key={idx} style={{ backgroundColor: "#e9ecef", color: "#718096", padding: "0.25rem 0.5rem", borderRadius: "4px", fontFamily: "monospace", border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.borderColor = "#0056b3"; e.currentTarget.style.color = "#0056b3"; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#718096"; }}>
                          {cite.doc} p.{cite.pages.join(",")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", maxWidth: "85%" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.9rem", backgroundColor: "#ffffff", border: "2px solid #0056b3", color: "#0056b3" }}>AI</div>
            <div style={{ padding: "1rem 1.5rem", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#4a5568", fontStyle: "italic" }}>
              Thinking...
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Input Footer */}
      <footer style={{ backgroundColor: "#f4f6f9", padding: "1.5rem 2rem 2rem 2rem", position: "sticky", bottom: 0 }}>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "30px", padding: "0.5rem 0.5rem 0.5rem 1.5rem", display: "flex", alignItems: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", maxWidth: "900px", margin: "0 auto" }}>
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about the manual..."
            disabled={isLoading}
            style={{ flex: 1, border: "none", outline: "none", fontSize: "1rem", color: "#1a1f36", background: "transparent", fontFamily: "Inter, sans-serif" }}
          />
          <button
            onClick={ask}
            disabled={isLoading || !q.trim()}
            style={{ backgroundColor: "#006add", color: "white", border: "none", width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: isLoading || !q.trim() ? "not-allowed" : "pointer", transition: "background-color 0.2s", marginLeft: "0.75rem", opacity: isLoading || !q.trim() ? 0.5 : 1 }}
            onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#006add"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
