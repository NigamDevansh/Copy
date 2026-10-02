import React from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { dark as theme, fonts } from "../theme";
import { Desktop } from "../ui/Desktop";
import { Window } from "../ui/Window";
import { Kbd } from "../ui/Kbd";
import { Caption } from "../ui/Caption";
import { PasteStackPanel } from "../ui/PasteStackPanel";
import { pasteStack } from "../data/items";
import { ease, pop, settle, window as win } from "../motion";
import { cue, scenes } from "../timeline";

const S = scenes.stack.from;
const LEN = scenes.stack.to - scenes.stack.from;
const OPEN = 16;
const PASTES = [92, 150, 208];
cue(S, OPEN, "open", 0.7);
PASTES.forEach((p, i) => cue(S, p, `pop${i + 1}`, 0.9));

const DOC = { x: 110, y: 120, w: 980, h: 560 };
const PANEL = { x: 1230, y: 300, w: 560 };

export const PasteStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const docIn = settle(frame, fps, 0, 20);
  const panelIn = pop(frame, fps, OPEN);
  const next = PASTES.filter((p) => frame >= p).length;
  const out = 1 - ease(frame, LEN - 8, LEN);

  const lines = [
    { label: "Install", text: pasteStack[0].text },
    { label: "Repo", text: pasteStack[1].text },
    { label: "Brand", text: pasteStack[2].text },
  ];

  return (
    <Desktop theme={theme}>
      <div style={{ position: "absolute", left: DOC.x, top: DOC.y, opacity: docIn, transform: `translateY(${(1 - docIn) * 16}px)` }}>
        <Window theme={theme} title="Notes — Onboarding doc" width={DOC.w} height={DOC.h}>
          <div style={{ padding: "26px 34px", fontFamily: fonts.sans, fontSize: 21, lineHeight: 1.7, color: theme.text }}>
            <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 10 }}>Getting started with Copy</div>
            {lines.map((l, i) => {
              const at = PASTES[i];
              const shown = frame >= at;
              const s = settle(frame, fps, at, 14);
              const fly = ease(frame, at - 14, at, Easing.inOut(Easing.cubic));
              return (
                <div key={l.label} style={{ display: "flex", gap: 14, alignItems: "baseline", minHeight: 44 }}>
                  <span style={{ color: theme.mute, width: 90, flex: "none" }}>{l.label}</span>
                  {shown ? (
                    <span style={{ fontFamily: fonts.mono, fontSize: 19, color: theme.text, background: "rgba(76,157,255,0.12)", border: `1px solid ${theme.accentDim}`, borderRadius: 7, padding: "2px 10px", opacity: s, transform: `translateY(${(1 - s) * 8}px) scale(${0.96 + 0.04 * s})`, display: "inline-block" }}>
                      {l.text}
                    </span>
                  ) : (
                    i === next ? <span style={{ display: "inline-block", width: 2, height: 24, background: theme.accent, verticalAlign: "middle", opacity: frame % 24 < 14 ? 1 : 0.2 }} /> : null
                  )}
                  {fly > 0 && fly < 1 ? null : null}
                </div>
              );
            })}
          </div>
        </Window>
      </div>

      {frame >= OPEN - 2 ? (
        <div style={{ position: "absolute", left: PANEL.x, top: PANEL.y, transform: `scale(${0.9 + 0.1 * panelIn})`, transformOrigin: "center", opacity: Math.min(1, panelIn) }}>
          <PasteStackPanel theme={theme} rows={pasteStack} next={next} width={PANEL.w} />
        </div>
      ) : null}

      {/* Flying chips from the panel row to the doc line */}
      {lines.map((l, i) => {
        const at = PASTES[i];
        const t = ease(frame, at - 12, at + 2, Easing.inOut(Easing.cubic));
        if (frame < at - 12 || frame > at + 2) return null;
        const fromX = PANEL.x + 60, fromY = PANEL.y + 70 + i * 48;
        const toX = DOC.x + 34 + 104, toY = DOC.y + 38 + 26 + 60 + i * 44;
        return (
          <div key={l.label} style={{ position: "absolute", left: fromX + (toX - fromX) * t, top: fromY + (toY - fromY) * t, fontFamily: fonts.mono, fontSize: 17, color: theme.text, background: theme.surface2, border: `1px solid ${theme.accent}`, borderRadius: 7, padding: "3px 10px", boxShadow: `0 12px 30px -8px ${theme.glow}`, opacity: 1 - Math.max(0, t - 0.85) * 6, transform: `scale(${1 - 0.1 * t})`, zIndex: 30, whiteSpace: "nowrap" }}>
            {l.text}
          </div>
        );
      })}

      {PASTES.map((p, i) => (
        <Kbd key={p} theme={theme} keys="⌘V" at={p - 10} hold={26} size={40} style={{ left: 920, top: 300 + i * 70 }} />
      ))}
      <Kbd theme={theme} keys="⇧⌘C" at={OPEN} hold={44} size={44} style={{ left: PANEL.x + 150, top: PANEL.y - 90 }} />

      <Caption theme={theme} text="Queue it. Paste in order." at={OPEN + 20} until={LEN} size={60} x={110} y={760} width={1000} sub="Add cards to the Paste Stack, then ⌘V, ⌘V, ⌘V." />
      <div style={{ position: "absolute", inset: 0, background: "#0B0C0F", opacity: 1 - out, pointerEvents: "none" }} />
    </Desktop>
  );
};
