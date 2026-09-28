import { ImageResponse } from "next/og"

export const alt = "Nexora Labs: Technology Built Around Your Business."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "radial-gradient(circle at 85% 10%, rgba(191,247,71,0.35), transparent 55%), #000000",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#BFF747", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700, color: "#000" }}>N</div>
          <div style={{ fontSize: 34, fontWeight: 600 }}>Nexora Labs</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>Technology Built Around</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#BFF747" }}>Your Business.</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#C2C2C2" }}>Custom Software · AI · Web · Mobile · Business Systems</div>
        </div>
      </div>
    ),
    size,
  )
}
