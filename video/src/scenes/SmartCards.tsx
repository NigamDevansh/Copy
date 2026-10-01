import React from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { dark as theme, fonts } from "../theme";
import { Desktop } from "../ui/Desktop";
import { Card } from "../ui/Card";
import { brandColor, github, invoice, swiftCode } from "../data/items";
import { ease, settle, window as win } from "../motion";
import { cue, scenes } from "../timeline";

const S = scenes.cards.from;
const LEN = scenes.cards.to - scenes.cards.from;
const CUT = Math.floor(LEN / 4);

const cuts = [
  { item: swiftCode, title: "Code, highlighted.", sub: "Swift, TypeScript, JSON and more, detected on device.", menu: undefined as string | undefined, ocr: false },
  { item: brandColor, title: "Colors, as swatches.", sub: "Hex in, swatch out. Adjust it before you paste.", menu: "Adjust Color…", ocr: false },
  { item: github, title: "Links, with previews.", sub: "Title and favicon, fetched for you.", menu: undefined, ocr: false },
  { item: invoice, title: "Images, searchable.", sub: "Text inside images is recognized and indexed.", menu: undefined, ocr: true },
];
cuts.forEach((_, i) => cue(S, i * CUT, "swish", 0.55));

export const SmartCards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = Math.min(cuts.length - 1, Math.floor(frame / CUT));
  const local = frame - i * CUT;
  const c = cuts[i];
  const s = settle(local, fps, 0, 16);
  const o = win(local, 0, CUT, 6, 5);
  const drift = local / CUT; // slow push-in during the cut
  const out = 1 - ease(frame, LEN - 8, LEN);
  return (
    <Desktop theme={theme} glow={1.2}>
      <div style={{ position: "absolute", left: 300, top: 220, transform: `scale(${2.3 + 0.08 * drift}) rotate(${-6 + 4 * s}deg)`, transformOrigin: "top left", opacity: o, filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.55))" }}>
        <Card item={c.item} theme={theme} selected menu={c.menu} showOcr={c.ocr} />
      </div>
      <div style={{ position: "absolute", left: 900, top: 400, width: 900, opacity: o, transform: `translateX(${(1 - s) * 30}px)` }}>
        <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 72, letterSpacing: "-0.03em", lineHeight: 1.04, color: theme.text }}>{c.title}</div>
        <div style={{ fontFamily: fonts.sans, fontSize: 27, color: theme.dim, marginTop: 18, fontWeight: 500 }}>{c.sub}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 34 }}>
          {cuts.map((_, k) => (
            <span key={k} style={{ width: k === i ? 34 : 10, height: 10, borderRadius: 5, background: k === i ? theme.accent : theme.line2 }} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "#0B0C0F", opacity: 1 - out, pointerEvents: "none" }} />
    </Desktop>
  );
};
