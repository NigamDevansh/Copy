import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { dark, light, Theme } from "../theme";
import { Desktop } from "../ui/Desktop";
import { Shelf } from "../ui/Shelf";
import { Caption } from "../ui/Caption";
import { history } from "../data/items";
import { ease, settle } from "../motion";
import { cue, scenes } from "../timeline";

const S = scenes.appearance.from;
const LEN = scenes.appearance.to - scenes.appearance.from;
const FLIP = 26;
const FLOAT = 84;
cue(S, FLIP, "flip", 0.7);
cue(S, FLOAT, "whoosh", 0.5);

const Layer: React.FC<{ theme: Theme; frame: number; fps: number }> = ({ theme, frame, fps }) => {
  const f = settle(frame, fps, FLOAT, 22);
  const margin = 28 * f;
  return (
    <Desktop theme={theme}>
      <div style={{ position: "absolute", left: margin, right: margin, bottom: margin }}>
        <Shelf theme={theme} items={history} width={1920 - margin * 2} floating={f > 0.5} selected="github" style={{ borderRadius: f > 0.5 ? 18 : undefined, borderBottom: f > 0.5 ? undefined : "none", boxShadow: f > 0.5 ? `0 40px 90px -30px rgba(0,0,0,${theme.name === "dark" ? 0.8 : 0.35})` : undefined }} />
      </div>
      <Caption theme={theme} text="Light or dark." at={4} until={FLOAT - 4} size={64} x={120} y={120} width={900} sub="Follow the system, or pick one." />
      <Caption theme={theme} text="Attached to the edge, or floating." at={FLOAT - 2} until={LEN} size={64} x={120} y={120} width={1100} sub="Standard or compact cards. Your shelf, your way." />
    </Desktop>
  );
};

export const Appearance: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wipe = ease(frame, FLIP, FLIP + 22, Easing.inOut(Easing.cubic));
  const out = 1 - ease(frame, LEN - 10, LEN);
  return (
    <AbsoluteFill>
      <Layer theme={dark} frame={frame} fps={fps} />
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
        <Layer theme={light} frame={frame} fps={fps} />
      </AbsoluteFill>
      {wipe > 0 && wipe < 1 ? (
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wipe * 100}%`, width: 3, background: dark.accent, boxShadow: `0 0 30px ${dark.accent}` }} />
      ) : null}
      <div style={{ position: "absolute", inset: 0, background: "#0B0C0F", opacity: 1 - out, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
