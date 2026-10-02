import React from "react";

/** The macOS arrow cursor. `x, y` is the hotspot (tip). */
export const Cursor: React.FC<{ x: number; y: number; opacity?: number; scale?: number; pressed?: boolean }> = ({
  x,
  y,
  opacity = 1,
  scale = 1.6,
  pressed,
}) => (
  <svg
    width={24 * scale}
    height={30 * scale}
    viewBox="0 0 24 30"
    style={{ position: "absolute", left: x, top: y, opacity, transform: pressed ? "scale(0.9)" : undefined, transformOrigin: "0 0", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.45))", zIndex: 50 }}
  >
    <path d="M2 2 L2 23 L7.5 18 L11 26.5 L15 24.8 L11.5 16.5 L19 16.5 Z" fill="#fff" stroke="#000" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);
