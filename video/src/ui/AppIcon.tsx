import React from "react";
import { apps } from "../theme";

export const AppIcon: React.FC<{ app: string; size?: number }> = ({ app, size = 14 }) => {
  const a = apps[app] ?? apps.system;
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
        flex: "none",
      }}
    />
  );
};
