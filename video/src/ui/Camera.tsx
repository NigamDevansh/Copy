import React from "react";
import { AbsoluteFill } from "remotion";

/** Scales the scene about a canvas point, like a camera push-in. */
export const Camera: React.FC<{ scale: number; ox: number; oy: number; children: React.ReactNode }> = ({ scale, ox, oy, children }) => (
  <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: `${ox}px ${oy}px` }}>{children}</AbsoluteFill>
);
