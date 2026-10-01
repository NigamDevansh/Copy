import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { dark as theme, fonts, syntax } from "../theme";
import { Desktop } from "../ui/Desktop";
import { Window } from "../ui/Window";
import { Kbd } from "../ui/Kbd";
import { Shelf } from "../ui/Shelf";
import { Caption } from "../ui/Caption";
import { history } from "../data/items";
import { ease, settle, window as win } from "../motion";
import { cue, scenes } from "../timeline";

const S = scenes.hook.from;
// Three ⌘C beats, then ⇧⌘V at 70.
export const COPY_BEATS = [8, 28, 48];
export const SUMMON = 70;
cue(S, COPY_BEATS[0], "tick", 0.8);
cue(S, COPY_BEATS[1], "tick", 0.8);
cue(S, COPY_BEATS[2], "tick", 0.8);
cue(S, SUMMON, "whoosh", 0.9);

const Snippet: React.FC<{ at: number; frame: number }> = ({ at, frame }) => {
  const sel = ease(frame, at - 10, at - 2);
  return (
    <div style={{ padding: "18px 22px", fontFamily: fonts.mono, fontSize: 17, lineHeight: 1.7, color: theme.dim, whiteSpace: "pre" }}>
      <div><span style={{ color: syntax.key }}>func</span> paste(_ item: <span style={{ color: syntax.type }}>ClipItem</span>) {"{"}</div>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: -8, right: -8, top: 2, bottom: 2, background: "rgba(76,157,255,0.28)", borderRadius: 4, transform: `scaleX(${sel})`, transformOrigin: "left" }} />
        <span style={{ position: "relative" }}>  <span style={{ color: syntax.key }}>guard let</span> next = queue.advance() <span style={{ color: syntax.key }}>else</span> {"{ return }"}</span>
      </div>
      <div>  pasteboard.write(next.representations)</div>
      <div>{"}"}</div>
    </div>
  );
};

const Swatches: React.FC<{ at: number; frame: number }> = ({ at, frame }) => {
  const sel = ease(frame, at - 10, at - 2);
  const colors = ["#FF375F", "#FF9F0A", "#34C759", "#4C9DFF", "#BF5AF2"];
  return (
    <div style={{ padding: "22px 22px", display: "flex", gap: 14, alignItems: "flex-end" }}>
      {colors.map((c, i) => {
        const on = i === 3;
        return (
          <div key={c} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: c, boxShadow: on ? `0 0 0 ${3 * sel}px #fff, 0 0 0 ${6 * sel}px ${theme.accent}` : "none" }} />
            <div style={{ fontFamily: fonts.mono, fontSize: 12, color: on ? theme.text : theme.mute }}>{c}</div>
          </div>
        );
      })}
    </div>
  );
};

const UrlBar: React.FC<{ at: number; frame: number }> = ({ at, frame }) => {
  const sel = ease(frame, at - 10, at - 2);
  return (
    <div style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0F1116", border: `1px solid ${theme.line2}`, borderRadius: 10, padding: "10px 14px", fontFamily: fonts.sans, fontSize: 16, color: theme.text }}>
        <span style={{ width: 16, height: 16, borderRadius: 4, background: "#24292f" }} />
        <span style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: -4, right: -4, top: -2, bottom: -2, background: "rgba(76,157,255,0.28)", borderRadius: 4, transform: `scaleX(${sel})`, transformOrigin: "left" }} />
          <span style={{ position: "relative" }}>github.com/tarikbc/Copy</span>
        </span>
      </div>
      <div style={{ marginTop: 14, fontFamily: fonts.display, fontWeight: 700, fontSize: 18, color: theme.text }}>tarikbc/Copy</div>
      <div style={{ marginTop: 4, fontFamily: fonts.sans, fontSize: 14, color: theme.dim }}>A visual clipboard for macOS.</div>
    </div>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wins = [
    { title: "Xcode — ClipItem.swift", x: 150, y: 110, w: 720, h: 230, body: <Snippet at={COPY_BEATS[0]} frame={frame} /> },
    { title: "Figma — Copy brand", x: 1000, y: 80, w: 560, h: 200, body: <Swatches at={COPY_BEATS[1]} frame={frame} /> },
    { title: "Safari", x: 560, y: 390, w: 620, h: 200, body: <UrlBar at={COPY_BEATS[2]} frame={frame} /> },
  ];
  // Shelf rises on SUMMON
  const rise = settle(frame, fps, SUMMON, 26);
  const shelfY = 420 * (1 - rise);
  const dimWindows = ease(frame, SUMMON, SUMMON + 14);
  return (
    <Desktop theme={theme}>
      {wins.map((w, i) => {
        const at = COPY_BEATS[i] - 14;
        const s = settle(frame, fps, at, 16);
        const o = win(frame, at, 400, 8, 1) * (1 - 0.6 * dimWindows);
        return (
          <div key={w.title} style={{ position: "absolute", left: w.x, top: w.y, opacity: o, transform: `translateY(${(1 - s) * 24}px) scale(${0.96 + 0.04 * s})`, filter: `blur(${dimWindows * 3}px)` }}>
            <Window theme={theme} title={w.title} width={w.w} height={w.h}>
              {w.body}
            </Window>
            <Kbd theme={theme} keys="⌘C" at={COPY_BEATS[i]} hold={16} size={30} style={{ right: 18, top: 50 }} />
          </div>
        );
      })}

      <AbsoluteFill style={{ background: `rgba(11,12,15,${0.35 * dimWindows})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, transform: `translateY(${shelfY}px)` }}>
        <Shelf
          theme={theme}
          items={history}
          selected={null}
          cardStyle={(_, i) => {
            const s = settle(frame, fps, SUMMON + 6 + i * 3, 18);
            return { opacity: s, transform: `translateY(${(1 - s) * 22}px) scale(${0.97 + 0.03 * s})` };
          }}
        />
      </div>

      <Kbd theme={theme} keys="⇧⌘V" at={SUMMON} hold={34} size={52} style={{ left: "50%", top: 330, transform: "translateX(-50%)" }} />
      <Caption theme={theme} text="Everything you copy," at={SUMMON + 10} until={scenes.hook.to - 2} size={84} x={120} y={120} />
      <Caption theme={theme} text="one shortcut away." at={SUMMON + 22} until={scenes.hook.to - 2} size={84} x={120} y={215} accentWords={["one", "shortcut", "away"]} />
    </Desktop>
  );
};
