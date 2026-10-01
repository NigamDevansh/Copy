import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { dark as theme, fonts } from "../theme";
import { Desktop } from "../ui/Desktop";
import { Logo } from "../ui/Logo";
import { ease, settle, typed, typedEnd } from "../motion";
import { cue, scenes } from "../timeline";

const S = scenes.closer.from;
const LEN = scenes.closer.to - scenes.closer.from;
const LOGO = 6;
const WORD = 22;
const LINES = [52, 64, 76];
const CMD = 104;
const CMD_TEXT = "brew install --cask tarikbc/tap/copy";
const URL = typedEnd(CMD_TEXT, CMD, 30, 22) + 14;
cue(S, WORD, "chime", 0.8);
cue(S, CMD, "click", 0.4);

export const Closer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const back = settle(frame, fps, LOGO, 20);
  const front = settle(frame, fps, LOGO + 8, 20);
  const word = settle(frame, fps, WORD, 20);
  const cmd = typed(CMD_TEXT, frame, CMD, fps, 22);
  const cmdIn = settle(frame, fps, CMD - 6, 16);
  const url = settle(frame, fps, URL, 20);
  const fadeIn = ease(frame, 0, 10);
  return (
    <Desktop theme={theme} glow={1.4}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeIn }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, transform: "translateY(-150px)" }}>
          <Logo size={190} back={back} front={front} />
          <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 120, letterSpacing: "-0.04em", color: theme.text, opacity: word, transform: `translateX(${(1 - word) * -20}px)` }}>
            Copy
          </div>
        </div>
        <div style={{ display: "flex", gap: 36, marginTop: -40, fontFamily: fonts.display, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", color: theme.text }}>
          {["Free.", "Open source.", "Private by design."].map((t, i) => {
            const s = settle(frame, fps, LINES[i], 18);
            return (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 36, opacity: s, transform: `translateY(${(1 - s) * 12}px)` }}>
                {i > 0 ? <span style={{ width: 8, height: 8, borderRadius: 4, background: theme.accent, display: "inline-block" }} /> : null}
                {t}
              </span>
            );
          })}
        </div>
        <div style={{ marginTop: 64, opacity: cmdIn, transform: `translateY(${(1 - cmdIn) * 10}px)`, display: "inline-flex", alignItems: "center", gap: 16, fontFamily: fonts.mono, fontSize: 30, color: theme.dim, background: theme.surface, border: `1px solid ${theme.line2}`, borderRadius: 14, padding: "16px 26px", minWidth: 760 }}>
          <span style={{ color: theme.mute }}>$</span>
          <span style={{ color: theme.text }}>{cmd}</span>
          {cmd.length < CMD_TEXT.length ? <span style={{ width: 2, height: 32, background: theme.accent }} /> : null}
        </div>
        <div style={{ marginTop: 30, fontFamily: fonts.mono, fontSize: 24, color: theme.accent2, letterSpacing: "0.04em", opacity: url, transform: `translateY(${(1 - url) * 8}px)` }}>
          tarikbc.github.io/Copy
        </div>
        <div style={{ marginTop: 14, fontFamily: fonts.sans, fontSize: 18, color: theme.mute, opacity: url }}>macOS 14+ · GPL-3.0 · No account, no telemetry</div>
      </AbsoluteFill>
    </Desktop>
  );
};
