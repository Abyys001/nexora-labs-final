"use client"

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-GB">
      <body
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          background: "#000000",
          backgroundImage: "radial-gradient(circle at 50% 0%, rgba(191,247,71,0.14), transparent 55%)",
          color: "#FFFFFF",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <div
            style={{ width: 44, height: 44, borderRadius: 12, background: "#BFF747", margin: "0 auto 20px", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 700, color: "#000" }}
          >
            N
          </div>
          <p style={{ color: "#BFF747", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>error 0x500</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 12, fontFamily: "system-ui, sans-serif" }}>Something went wrong</h1>
          <p style={{ color: "#C2C2C2", marginTop: 12, fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>Please try again in a moment. If it keeps happening, contact us and we&apos;ll look into it.</p>
          <button
            onClick={reset}
            style={{ marginTop: 24, background: "#BFF747", color: "#000", border: 0, borderRadius: 12, padding: "12px 24px", fontWeight: 600, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
