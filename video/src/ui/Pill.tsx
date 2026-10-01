import React from "react";
import { fonts, Theme } from "../theme";
import { AppIcon } from "./AppIcon";

export const Pill: React.FC<{ theme: Theme; label: string; app?: string; icon?: React.ReactNode; scale?: number }> = ({
  theme,
  label,
  app,
  icon,
  scale = 1,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: fonts.sans,
      fontSize: 13,
      fontWeight: 500,
      whiteSpace: "nowrap",
      color: theme.text,
      background: theme.surface2,
      border: `1px solid ${theme.line2}`,
      borderRadius: 999,
      padding: "3px 10px 3px 7px",
      transform: `scale(${scale})`,
    }}
  >
    {app ? <AppIcon app={app} size={13} /> : icon}
    {label}
  </span>
);
