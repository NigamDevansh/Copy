import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, Theme } from "../theme";
import { pop, press } from "../motion";

/**
 * A big keyboard chip, like the site's .kbd, that pops in at `at` and "presses".
 * Shown for `hold` frames, then fades.
 */
export const Kbd: React.FC<{
  theme: Theme;
  keys: string;
  at: number;
  hold?: number;
  size?: number;
  style?: React.CSSProperties;
}> = ({ theme, keys, at, hold = 40, size = 44, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at - 6) return null;
  const inS = pop(frame, fps, at - 6);
  const out = frame > at + hold ? Math.max(0, 1 - (frame - at - hold) / 8) : 1;
  const scale = inS * press(frame, at);
  const pressed = frame >= at && frame < at + 6;
  return (
    <div
      style={{
        position: "absolute",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: fonts.mono,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.02em",
        color: theme.text,
        background: pressed ? "rgba(76,157,255,0.22)" : theme.surface2,
        border: `2px solid ${pressed ? theme.accent : theme.line2}`,
        borderBottomWidth: pressed ? 3 : 6,
        borderRadius: size * 0.32,
        padding: `${size * 0.22}px ${size * 0.5}px`,
        boxShadow: pressed ? `0 0 0 8px rgba(76,157,255,0.14), 0 0 40px ${theme.glow}` : "0 18px 40px -16px rgba(0,0,0,0.6)",
        transform: `scale(${scale})`,
        opacity: out,
        ...style,
      }}
    >
      {keys}
    </div>
  );
};
