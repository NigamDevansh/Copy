import React from "react";
import { fonts, Theme } from "../theme";
import { Pill } from "./Pill";

const Mag: React.FC<{ color: string; size?: number }> = ({ color, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.8}>
    <circle cx="7" cy="7" r="5" />
    <path d="m11 11 3 3" />
  </svg>
);

export type Suggestion = { label: string; app?: string; icon?: string };

/**
 * The shelf search field ("Search or filter…"). Shows filter pills, typed text with a caret,
 * and, when `suggestions` is given, a dropdown with the `active` row highlighted.
 */
export const SearchField: React.FC<{
  theme: Theme;
  pills?: { label: string; app?: string }[];
  typed?: string;
  focused?: boolean;
  caret?: boolean;
  suggestions?: Suggestion[];
  active?: number;
  width?: number;
}> = ({ theme, pills = [], typed = "", focused, caret, suggestions, active = 0, width = 300 }) => (
  <div style={{ position: "relative", width }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontFamily: fonts.sans,
        fontSize: 14,
        color: theme.text,
        background: theme.surface,
        border: `1px solid ${focused ? theme.accentDim : theme.line}`,
        boxShadow: focused ? "0 0 0 3px rgba(76,157,255,0.14)" : undefined,
        borderRadius: 9,
        padding: "6px 10px",
        minHeight: 34,
        boxSizing: "border-box",
      }}
    >
      <Mag color={theme.mute} />
      {pills.map((p, i) => (
        <Pill key={i} theme={theme} label={p.label} app={p.app} />
      ))}
      {typed || pills.length ? (
        <span>{typed}</span>
      ) : (
        <span style={{ color: theme.mute }}>Search or filter…</span>
      )}
      {caret ? <span style={{ width: 1.5, height: 16, background: theme.accent, borderRadius: 1, marginLeft: -4 }} /> : null}
    </div>
    {suggestions && suggestions.length ? (
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          width: 240,
          background: theme.surface,
          border: `1px solid ${theme.line2}`,
          borderRadius: 10,
          padding: 4,
          boxShadow: theme.shelfShadow,
          zIndex: 5,
        }}
      >
        {suggestions.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: fonts.sans,
              fontSize: 13.5,
              color: i === active ? "#fff" : theme.text,
              background: i === active ? theme.accent : "transparent",
              padding: "6px 9px",
              borderRadius: 6,
            }}
          >
            {s.app ? <Pill theme={theme} label="" app={s.app} /> : null}
            {s.label}
          </div>
        ))}
      </div>
    ) : null}
  </div>
);
