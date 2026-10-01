import React from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { dark as theme, fonts, card as geo } from "../theme";
import { Desktop } from "../ui/Desktop";
import { Window } from "../ui/Window";
import { Kbd } from "../ui/Kbd";
import { Shelf, cardCanvasX, CARD_CANVAS_TOP } from "../ui/Shelf";
import { Caption } from "../ui/Caption";
import { Card } from "../ui/Card";
import { history } from "../data/items";
import { ease, pop, settle, window as win } from "../motion";
import { cue, scenes } from "../timeline";

const S = scenes.shelf.from;
const LEN = scenes.shelf.to - scenes.shelf.from;
// Labels pop over cards 0..5 (code, image, link, file, color, text-ish). Then ⏎ pastes.
const LABELS: { text: string; index: number; at: number }[] = [
  { text: "Code", index: 0, at: 18 },
  { text: "Images", index: 1, at: 30 },
  { text: "Links", index: 2, at: 42 },
  { text: "Files", index: 3, at: 54 },
  { text: "Colors", index: 4, at: 66 },
  { text: "Text", index: 6, at: 78 },
];
const PASTE = 112;
LABELS.forEach((l) => cue(S, l.at, "click", 0.5));
cue(S, PASTE, "pop", 0.9);

const cardX = cardCanvasX;
const CARD_TOP = CARD_CANVAS_TOP;

export const ShelfIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const selectedId = "checklist";
  const selIndex = history.findIndex((i) => i.id === selectedId);
  // Card flight into the document
  const fly = ease(frame, PASTE + 2, PASTE + 26, Easing.inOut(Easing.cubic));
  const flying = frame >= PASTE + 2 && frame < PASTE + 30;
  const docText = ease(frame, PASTE + 22, PASTE + 30);
  const docIn = settle(frame, fps, 0, 20);
  const out = 1 - ease(frame, LEN - 10, LEN);
  const docW = 700, docH = 320, docX = 1000, docY = 130;
  return (
    <Desktop theme={theme}>
      <div style={{ position: "absolute", left: docX, top: docY, opacity: docIn * out, transform: `translateY(${(1 - docIn) * 16}px)` }}>
        <Window theme={theme} title="Notes — Release plan" width={docW} height={docH}>
          <div style={{ padding: "22px 28px", fontFamily: fonts.sans, fontSize: 19, lineHeight: 1.6, color: theme.text }}>
            <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 8 }}>Release plan</div>
            <div style={{ color: theme.dim }}>Before we tag v0.2:</div>
            <div style={{ whiteSpace: "pre-wrap", color: theme.text, opacity: docText }}>
              {"1. Notarize + staple\n2. Update the appcast\n3. Bump the Homebrew cask\n4. Post the demo video"}
            </div>
            {docText < 1 ? <span style={{ display: "inline-block", width: 2, height: 22, background: theme.accent, verticalAlign: "middle" }} /> : null}
          </div>
        </Window>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <Shelf
          theme={theme}
          items={history}
          selected={frame >= PASTE - 30 ? selectedId : null}
          cardStyle={(_, i) => {
            const l = LABELS.find((x) => x.index === i);
            if (!l) return undefined;
            const b = pop(frame, fps, l.at);
            const lift = frame >= l.at && frame < l.at + 30 ? -10 * Math.sin(Math.min(1, (frame - l.at) / 30) * Math.PI) : 0;
            return { transform: `translateY(${lift}px) scale(${1 + 0.02 * Math.min(1, b) * (lift ? 1 : 0)})` };
          }}
        />
      </div>

      {LABELS.map((l) => {
        const b = pop(frame, fps, l.at);
        if (frame < l.at) return null;
        const o = win(frame, l.at, PASTE - 20, 6, 8);
        return (
          <div
            key={l.text}
            style={{
              position: "absolute",
              left: cardX(l.index) + geo.width / 2,
              top: CARD_TOP + geo.height / 2 - 20,
              transform: `translate(-50%, ${(1 - b) * 14}px) scale(${0.6 + 0.4 * b})`,
              opacity: o,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 20,
              color: "#05121f",
              background: `linear-gradient(180deg, ${theme.accent2}, ${theme.accent})`,
              borderRadius: 999,
              padding: "6px 16px",
              boxShadow: `0 10px 30px -8px ${theme.glow}`,
              whiteSpace: "nowrap",
            }}
          >
            {l.text}
          </div>
        );
      })}

      {flying ? (
        <div
          style={{
            position: "absolute",
            left: cardX(selIndex) + (docX + 40 - cardX(selIndex)) * fly,
            top: CARD_TOP + (docY + 90 - CARD_TOP) * fly,
            transform: `scale(${1 - 0.55 * fly}) rotate(${-4 * fly}deg)`,
            transformOrigin: "top left",
            opacity: 1 - Math.max(0, fly - 0.8) * 5,
            zIndex: 20,
          }}
        >
          <Card item={history[selIndex]} theme={theme} selected />
        </div>
      ) : null}

      <Caption theme={theme} text="Text, code, images, links, files, colors." at={10} until={PASTE - 16} size={60} x={120} y={120} width={820} sub="Every copy becomes a card the moment you make it." />
      <Caption theme={theme} text="Press ⏎ to paste it back." at={PASTE - 10} until={LEN} size={56} x={120} y={120} />
      <Kbd theme={theme} keys="⏎" at={PASTE} hold={30} size={44} style={{ left: 120, top: 220 }} />
    </Desktop>
  );
};
