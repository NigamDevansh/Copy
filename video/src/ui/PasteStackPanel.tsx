import React from "react";
import { fonts, Theme } from "../theme";

/** The Paste Stack palette: numbered rows, the next one marked. Rows < `consumed` are dimmed. */
export const PasteStackPanel: React.FC<{
  theme: Theme;
  rows: { n: number; text: string }[];
  next: number; // index of the next row
  width?: number;
  scale?: number;
  style?: React.CSSProperties;
  order?: "Newest first" | "Oldest first";
}> = ({ theme, rows, next, width = 420, scale = 1, style, order = "Oldest first" }) => (
  <div
    style={{
      width,
      boxSizing: "border-box",
      background: theme.shelfBg,
      backdropFilter: "blur(22px) saturate(150%)",
      WebkitBackdropFilter: "blur(22px) saturate(150%)",
      border: `1px solid ${theme.shelfBorder}`,
      borderRadius: 16,
      boxShadow: theme.shelfShadow,
      padding: 14,
      fontFamily: fonts.sans,
      transform: `scale(${scale})`,
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 15, fontWeight: 600, color: theme.text, padding: "2px 4px 10px" }}>
      Paste Stack
      <span style={{ fontFamily: fonts.mono, fontSize: 12, color: theme.dim, background: theme.surface2, borderRadius: 999, padding: "1px 8px" }}>
        {rows.length - next}
      </span>
      <span style={{ marginLeft: "auto", fontSize: 12, color: theme.mute, fontWeight: 500 }}>{order}</span>
    </div>
    {rows.map((r, i) => {
      const isNext = i === next;
      const done = i < next;
      return (
        <div
          key={r.n}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "9px 6px",
            borderTop: `1px solid ${theme.line}`,
            fontSize: 14,
            opacity: done ? 0.38 : 1,
            background: isNext ? "rgba(76,157,255,0.08)" : "transparent",
            borderRadius: 8,
          }}
        >
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 12,
              width: 24,
              height: 24,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              color: isNext ? "#05121f" : theme.dim,
              background: isNext ? theme.accent : theme.surface2,
              fontWeight: isNext ? 700 : 500,
              flex: "none",
            }}
          >
            {r.n}
          </span>
          <span style={{ fontFamily: fonts.mono, color: done ? theme.mute : theme.text, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", textDecoration: done ? "line-through" : undefined }}>
            {r.text}
          </span>
          {isNext ? (
            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.accent2, background: "rgba(76,157,255,0.14)", borderRadius: 999, padding: "2px 8px" }}>
              Next
            </span>
          ) : null}
        </div>
      );
    })}
  </div>
);
