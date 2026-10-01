import React from "react";
import { AbsoluteFill } from "remotion";
import { Theme } from "../theme";

/** The "Glass Workbench" backdrop: dark gradient, faint grid, blue glow top right. */
export const Desktop: React.FC<{ theme: Theme; children?: React.ReactNode; glow?: number }> = ({
  theme,
  children,
  glow = 1,
}) => {
  const isDark = theme.name === "dark";
  return (
    <AbsoluteFill
      style={{
        background: isDark
          ? `linear-gradient(180deg, ${theme.bg2} 0%, ${theme.bg} 100%)`
          : `linear-gradient(180deg, #FAFBFC 0%, ${theme.bg} 100%)`,
        fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        color: theme.text,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${theme.line} 1px, transparent 1px), linear-gradient(90deg, ${theme.line} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: isDark ? 0.28 : 0.5,
          maskImage: "radial-gradient(1400px 900px at 60% 10%, #000 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(1400px 900px at 60% 10%, #000 0%, transparent 80%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 600px at 75% -10%, rgba(76,157,255,${0.16 * glow}), transparent 60%)`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
