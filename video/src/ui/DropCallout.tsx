import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, Theme } from "../theme";
import { pop, settle } from "../motion";

/**
 * The pinboard drop callout from the app (`PinboardDropCalloutView`): a small bubble that
 * hangs under the targeted tab with an arrow, a round badge with the board's emoji, the
 * caption "Add to" and the board name. After the drop the caption reads "Added to" and the
 * badge turns into a check mark. It folds back into the tab when `until` is reached.
 */
export const DropCallout: React.FC<{
  theme: Theme;
  x: number; // leading edge on the canvas (tab.minX - 6)
  y: number; // top edge (tab.maxY + 3)
  arrowX: number; // arrow center, from the leading edge
  name: string;
  emoji: string;
  color: string;
  at: number;
  filedAt?: number;
  until: number;
}> = ({ theme, x, y, arrowX, name, emoji, color, at, filedAt, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame > until + 12) return null;
  const inS = pop(frame, fps, at);
  const outS = frame > until ? 1 - settle(frame, fps, until, 12) : 1;
  const s = 0.35 + 0.65 * Math.min(1, inS) * outS;
  const o = Math.min(1, inS) * outS;
  const filed = filedAt != null && frame >= filedAt;
  const check = filedAt != null ? pop(frame, fps, filedAt) : 0;
  const arrowW = 14, arrowH = 6, radius = 10;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${s})`,
        transformOrigin: "12% 0",
        opacity: o,
        filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.25))",
        zIndex: 30,
      }}
    >
      <div style={{ position: "absolute", left: arrowX - arrowW / 2, top: 0, width: 0, height: 0, borderLeft: `${arrowW / 2}px solid transparent`, borderRight: `${arrowW / 2}px solid transparent`, borderBottom: `${arrowH}px solid ${theme.surface2}` }} />
      <div
        style={{
          marginTop: arrowH,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px 6px 8px",
          background: theme.surface2,
          border: `0.5px solid ${theme.name === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
          borderRadius: radius,
          fontFamily: fonts.sans,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ width: 24, height: 24, borderRadius: 12, background: filed ? `${color}E6` : `${color}38`, display: "grid", placeItems: "center", fontSize: 13 }}>
          {filed ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `scale(${0.2 + 0.8 * Math.min(1, check)})`, opacity: Math.min(1, check) }}>
              <path d="m3 8.5 3.2 3.2L13 4.5" />
            </svg>
          ) : (
            <span>{emoji}</span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 10, fontWeight: 500, color: theme.dim }}>{filed ? "Added to" : "Add to"}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{name}</span>
        </div>
      </div>
    </div>
  );
};
