import React from "react";
import { fonts, Theme } from "../theme";

export const Tab: React.FC<{
  theme: Theme;
  name: string;
  tint?: string | null;
  emoji?: string | null;
  on?: boolean;
  hot?: number; // 0..1 drop-target glow
  count?: number | null;
}> = ({ theme, name, tint, emoji, on, hot = 0, count }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: fonts.sans,
      fontSize: 13,
      fontWeight: 500,
      whiteSpace: "nowrap",
      color: on || hot > 0.3 ? theme.text : theme.dim,
      background: on ? "rgba(76,157,255,0.14)" : hot > 0 ? `rgba(76,157,255,${0.08 + 0.12 * hot})` : theme.surface2,
      border: `1px solid ${on ? theme.accentDim : hot > 0 ? theme.accent : theme.line}`,
      boxShadow: hot > 0 ? `0 0 0 ${4 * hot}px rgba(76,157,255,${0.18 * hot}), 0 0 ${28 * hot}px ${theme.glow}` : undefined,
      borderRadius: 999,
      padding: "5px 12px",
      transform: `scale(${1 + 0.08 * hot})`,
    }}
  >
    {emoji ? <span style={{ fontSize: 12 }}>{emoji}</span> : tint ? <span style={{ width: 8, height: 8, borderRadius: 4, background: tint }} /> : null}
    {name}
    {count != null ? (
      <span style={{ fontFamily: fonts.mono, fontSize: 10, color: theme.mute, background: theme.surface, borderRadius: 999, padding: "0 6px" }}>{count}</span>
    ) : null}
  </span>
);
