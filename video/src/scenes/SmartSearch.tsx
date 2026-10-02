import React from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { dark as theme, fonts, card as geo } from "../theme";
import { Desktop } from "../ui/Desktop";
import { Shelf, cardSlotX, cardCanvasX, CARD_CANVAS_TOP } from "../ui/Shelf";
import { Caption } from "../ui/Caption";
import { Camera } from "../ui/Camera";
import { Cursor } from "../ui/Cursor";
import { history } from "../data/items";
import { cursorPath, ease, pop, settle, typed, typedEnd, window as win } from "../motion";
import { cue, scenes } from "../timeline";

const S = scenes.search.from;
const LEN = scenes.search.to - scenes.search.from;

// Beats
const CLICK = 28;
const TYPE1 = 40; // "sa"
const PICK = 78; // Enter → Safari pill
const TYPE2 = 104; // "invoice"
const TEXT2 = "invoice";
const FOUND = typedEnd(TEXT2, TYPE2, 30, 11) + 4;
const OCR = FOUND + 26;

cue(S, CLICK, "click", 0.6);
for (let i = 0; i < 2; i++) cue(S, TYPE1 + Math.round((i / 11) * 30), "key", 0.7);
cue(S, PICK, "click", 0.6);
for (let i = 0; i < TEXT2.length; i++) cue(S, TYPE2 + Math.round((i / 11) * 30), "key", 0.7);
cue(S, FOUND, "ding", 0.7);

const FIELD = { x: 1600, y: 763 }; // search field center on canvas

export const SmartSearch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t1 = typed("sa", frame, TYPE1, fps, 11);
  const t2 = typed(TEXT2, frame, TYPE2, fps, 11);
  const focused = frame >= CLICK;
  const picked = frame >= PICK;
  const stage: 0 | 1 | 2 = frame >= FOUND - 8 ? 2 : picked ? 1 : 0;

  // Which cards match at each stage
  const matches = (it: (typeof history)[number]) =>
    stage === 0 ? true : stage === 1 ? it.app === "safari" : it.id === "invoice";
  const visible = history.filter(matches);
  const stageStart = stage === 1 ? PICK : stage === 2 ? FOUND - 8 : 0;
  const morph = ease(frame, stageStart, stageStart + 18, Easing.out(Easing.cubic));

  const suggestions =
    frame >= TYPE1 + 4 && frame < PICK
      ? t1.length < 2
        ? [{ label: "Safari", app: "safari" }, { label: "Slack", app: "slack" }, { label: "Snippets", icon: "board" }]
        : [{ label: "Safari", app: "safari" }]
      : undefined;

  // Camera: push in toward the search field (anchored so the field lands mid-frame),
  // then pull back out to full frame when the result is found so the card is visible.
  // Phase 1: push in on the field (right edge anchored). Phase 2: pull out after the pill.
  // Phase 3: push in on the result at slot 0 (left edge anchored).
  const zoomIn = ease(frame, 6, 40, Easing.inOut(Easing.cubic));
  const zoomOut = ease(frame, PICK + 4, PICK + 28, Easing.inOut(Easing.cubic));
  const zoomResult = ease(frame, FOUND - 2, FOUND + 24, Easing.inOut(Easing.cubic));
  const scale = 1 + 0.5 * zoomIn - 0.5 * zoomOut + 0.5 * zoomResult;
  const ox = frame < PICK + 28 ? 1920 : 0;
  const oy = 1080;

  const cursor = cursorPath(frame, [
    { frame: 0, x: 1200, y: 520 },
    { frame: CLICK - 4, x: FIELD.x, y: FIELD.y },
    { frame: PICK + 10, x: FIELD.x, y: FIELD.y },
    { frame: PICK + 40, x: 1250, y: 640 },
  ]);
  const cursorO = win(frame, 0, FOUND + 10, 8, 10);

  const slide = history.findIndex((i) => i.id === "invoice");
  const out = 1 - ease(frame, LEN - 8, LEN);

  return (
    <Desktop theme={theme}>
      <Camera scale={scale} ox={ox} oy={oy}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          <Shelf
            theme={theme}
            items={history}
            absolute
            showOcrFor={frame >= OCR ? "invoice" : null}
            selected={frame >= FOUND ? "invoice" : null}
            search={{
              focused,
              caret: focused && (frame % 24 < 14 || frame < PICK + 2),
              typed: stage === 0 ? t1 : stage === 1 ? t2 : t2,
              pills: picked ? [{ label: "Safari", app: "safari" }] : [],
              suggestions,
              active: 0,
              width: 300,
            }}
            cardStyle={(it, i) => {
              const m = matches(it);
              const target = visible.indexOf(it);
              // previous stage position: approximate by the index in the previous visible set
              const prevVisible = history.filter((x) => (stage === 2 ? x.app === "safari" : stage === 1 ? true : true));
              const prevIndex = stage === 0 ? i : Math.max(0, prevVisible.indexOf(it));
              const fromX = cardSlotX(prevIndex);
              const toX = cardSlotX(m ? target : prevIndex);
              const x = fromX + (toX - fromX) * morph;
              const o = m ? 1 : 1 - morph;
              const s = m ? 1 : 1 - 0.1 * morph;
              return { left: x, opacity: o, transform: `scale(${s})` };
            }}
          />
        </div>
        <Cursor x={cursor.x} y={cursor.y} opacity={cursorO} scale={1.3} pressed={frame >= CLICK && frame < CLICK + 6} />
      </Camera>

      {/* OCR callout: a line from the invoice card up to a label */}
      {frame >= OCR ? (
        <div style={{ position: "absolute", left: 60, top: 440, opacity: win(frame, OCR, LEN, 10, 8), transform: `translateY(${(1 - settle(frame, fps, OCR, 18)) * 14}px)` }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: fonts.display, fontWeight: 700, fontSize: 30, color: "#05121f", background: `linear-gradient(180deg, ${theme.accent2}, ${theme.accent})`, borderRadius: 999, padding: "10px 22px", boxShadow: `0 14px 40px -10px ${theme.glow}` }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 20, background: "rgba(0,0,0,0.18)", borderRadius: 8, padding: "2px 8px" }}>OCR</span>
            Found inside the image.
          </div>
          <div style={{ marginLeft: 120, width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `16px solid ${theme.accent}` }} />
        </div>
      ) : null}

      <Caption theme={theme} text="Search by app, type, or time." at={6} until={FOUND - 4} size={64} x={120} y={120} width={900} sub="Start typing. Picks become filter pills." />
      <Caption theme={theme} text="Then search the content." at={FOUND} until={LEN} size={64} x={120} y={120} width={900} sub="Even the text inside your images, read on device." />
      <div style={{ position: "absolute", inset: 0, background: "#0B0C0F", opacity: 1 - out, pointerEvents: "none" }} />
    </Desktop>
  );
};
