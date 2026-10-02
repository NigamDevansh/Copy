import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { fonts, Theme } from "../theme";
import { ease, window } from "../motion";

/**
 * Headline caption in Sora 800. Slides up 24px and fades in at `at`, fades out at `until`.
 * `accentFrom` marks the index of the first word to render in the accent color.
 */
export const Caption: React.FC<{
  theme: Theme;
  text: string;
  at: number;
  until: number;
  size?: number;
  align?: "left" | "center";
  x?: number;
  y?: number;
  sub?: string;
  accentWords?: string[];
  width?: number;
}> = ({ theme, text, at, until, size = 72, align = "left", x = 120, y = 120, sub, accentWords = [], width = 1100 }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > until + 2) return null;
  const o = window(frame, at, until, 12, 10);
  const slide = (1 - ease(frame, at, at + 16, Easing.out(Easing.cubic))) * 26;
  const words = text.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: align === "left" ? x : 0,
        right: align === "left" ? undefined : 0,
        top: y,
        width: align === "center" ? "100%" : width,
        textAlign: align,
        opacity: o,
        transform: `translateY(${slide}px)`,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: "-0.03em",
          color: theme.text,
        }}
      >
        {words.map((w, i) => (
          <span key={i} style={{ color: accentWords.includes(w.replace(/[.,]/g, "")) ? theme.accent2 : undefined }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
      {sub ? (
        <div style={{ fontFamily: fonts.sans, fontSize: size * 0.38, color: theme.dim, marginTop: size * 0.22, fontWeight: 500 }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
};
