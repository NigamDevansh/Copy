import React from "react";
import { fonts, Theme } from "../theme";

/** A minimal macOS-style window with traffic lights and a title. */
export const Window: React.FC<{
  theme: Theme;
  title: string;
  width: number;
  height: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  chromeColor?: string;
}> = ({ theme, title, width, height, style, children }) => {
  const isLight = theme.name === "light";
  return (
    <div
      style={{
        width,
        height,
        boxSizing: "border-box",
        background: isLight ? "#FFFFFF" : "#13151B",
        border: `1px solid ${isLight ? "#D9DDE4" : "#2A2F3A"}`,
        borderRadius: 12,
        boxShadow: isLight ? "0 30px 70px -30px rgba(20,30,50,0.45)" : "0 30px 70px -30px rgba(0,0,0,0.8)",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <div
        style={{
          height: 38,
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 14px",
          background: isLight ? "#F2F3F5" : "#1A1D25",
          borderBottom: `1px solid ${isLight ? "#E3E6EB" : "#262A33"}`,
          fontFamily: fonts.sans,
          fontSize: 13,
          color: theme.dim,
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: 6, background: "#FF5F57" }} />
        <span style={{ width: 12, height: 12, borderRadius: 6, background: "#FEBC2E" }} />
        <span style={{ width: 12, height: 12, borderRadius: 6, background: "#28C840" }} />
        <span style={{ marginLeft: 10, fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ flex: 1, position: "relative" }}>{children}</div>
    </div>
  );
};
