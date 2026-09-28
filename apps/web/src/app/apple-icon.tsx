import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// Same 7x7 "N" pixel grid as components/layout/logo.tsx, scaled up for the apple touch icon.
const N_PIXELS = [
  [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
  [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
] as const

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#BFF747", borderRadius: 40 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", display: "flex" }}>
          {N_PIXELS.map(([x, y]) => (
            <div
              key={`${x}-${y}`}
              style={{
                position: "absolute",
                left: 36 + x * 15.5,
                top: 36 + y * 15.5,
                width: 14,
                height: 14,
                borderRadius: 3,
                background: "#000",
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  )
}
