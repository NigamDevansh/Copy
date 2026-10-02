import React from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { dark as theme, card as geo } from "../theme";
import { Desktop } from "../ui/Desktop";
import { Shelf, cardSlotX, cardCanvasX, CARD_CANVAS_TOP, CARD_SHELF_TOP } from "../ui/Shelf";
import { Caption } from "../ui/Caption";
import { Camera } from "../ui/Camera";
import { Cursor } from "../ui/Cursor";
import { Card } from "../ui/Card";
import { Kbd } from "../ui/Kbd";
import { boards, history } from "../data/items";
import { cursorPath, ease, pop, settle, window as win } from "../motion";
import { cue, scenes } from "../timeline";
import { DropCallout } from "../ui/DropCallout";

const S = scenes.pinboards.from;
const LEN = scenes.pinboards.to - scenes.pinboards.from;

const GRAB = 34;
const DROP = 92;
const SWITCH = 150;

const LAND = DROP - 22; // the drag reaches the Design tab: callout appears
cue(S, GRAB, "click", 0.5);
cue(S, DROP, "thud", 1);
cue(S, SWITCH, "click", 0.7);
cue(S, SWITCH + 4, "swish", 0.6);

const DRAG_ID = "sunset";
const DESIGN_TAB = { x: 222, y: 763 }; // 🎨 Design tab center on canvas

export const Pinboards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dragIndex = history.findIndex((i) => i.id === DRAG_ID);
  // Put the dragged card in the visible area: reorder so "sunset" sits at slot 5
  const items = [...history.slice(0, 5), history[dragIndex], ...history.slice(5).filter((i) => i.id !== DRAG_ID)];
  const slot = 5;
  const cardCenter = { x: cardCanvasX(slot) + geo.width / 2, y: CARD_CANVAS_TOP + geo.height / 2 };

  const cursor = cursorPath(frame, [
    { frame: 0, x: 1100, y: 560 },
    { frame: GRAB - 4, x: cardCenter.x, y: cardCenter.y + 92 },
    { frame: GRAB + 6, x: cardCenter.x, y: cardCenter.y + 92 },
    { frame: DROP - 6, x: DESIGN_TAB.x + 10, y: DESIGN_TAB.y + 6 },
    { frame: DROP + 20, x: DESIGN_TAB.x + 10, y: DESIGN_TAB.y + 6 },
    { frame: DROP + 50, x: 700, y: 560 },
  ]);
  const dragging = frame >= GRAB && frame < DROP;
  const dropped = frame >= DROP;
  const dist = Math.hypot(cursor.x - DESIGN_TAB.x, cursor.y - DESIGN_TAB.y);
  const hot = dragging ? Math.max(0, Math.min(1, 1 - (dist - 40) / 160)) : dropped ? Math.max(0, 1 - (frame - DROP) / 22) : 0;
  const dropPop = pop(frame, fps, DROP);

  // Tab switch: ⌘3 → Design board
  const sw = ease(frame, SWITCH + 2, SWITCH + 22, Easing.inOut(Easing.cubic));
  const activeTab = frame >= SWITCH + 10 ? "design" : "history";
  const designItems = [history[dragIndex], ...boards.design];

  // Camera push toward the left of the shelf
  const zoom = ease(frame, 4, 34, Easing.inOut(Easing.cubic));
  const scale = 1 + 0.32 * zoom;

  const cursorO = win(frame, 0, LEN - 40, 8, 10);
  const out = 1 - ease(frame, LEN - 8, LEN);

  return (
    <Desktop theme={theme}>
      <Camera scale={scale} ox={0} oy={1080}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          <Shelf
            theme={theme}
            items={items}
            absolute
            activeTab={activeTab}
            hotTab={{ id: "design", hot: Math.max(hot, dropped ? 0.9 * Math.max(0, 1 - (frame - DROP) / 14) * dropPop : 0) }}
            selected={frame >= GRAB - 10 && frame < DROP ? DRAG_ID : null}
            cardStyle={(it, i) => {
              const isDrag = it.id === DRAG_ID;
              const ghost = isDrag && dragging ? { opacity: 0.35 } : {};
              // Slide out the history row when switching
              const outX = -sw * 1400;
              return { left: cardSlotX(i) + outX, opacity: (1 - sw) * (ghost.opacity ?? 1) };
            }}
          />
          {/* Design board cards slide in from the right */}
          {frame >= SWITCH + 2 ? (
            <div style={{ position: "absolute", left: 20 + 2, top: CARD_SHELF_TOP, display: "flex", gap: geo.gap, transform: `translateX(${(1 - sw) * 1400}px)`, opacity: sw }}>
              {designItems.map((it, i) => (
                <Card key={it.id} item={it} theme={theme} style={{ transform: `translateY(${(1 - settle(frame, fps, SWITCH + 8 + i * 3, 16)) * 12}px)` }} />
              ))}
            </div>
          ) : null}
        </div>

        {/* The app's drop callout hangs under the targeted tab, then confirms the drop */}
        <DropCallout theme={theme} x={DESIGN_TAB.x - 50} y={DESIGN_TAB.y + 21} arrowX={50} name="Design" emoji="🎨" color="#FF375F" at={LAND} filedAt={DROP} until={DROP + 42} />

        {/* Drag image follows the cursor */}
        {dragging ? (
          <div style={{ position: "absolute", left: cursor.x - 66, top: cursor.y - 154, transform: `scale(0.72) rotate(-5deg)`, transformOrigin: "top left", opacity: 0.92, filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))", zIndex: 40 }}>
            <Card item={history[dragIndex]} theme={theme} selected />
          </div>
        ) : null}
        <Cursor x={cursor.x} y={cursor.y} opacity={cursorO} scale={1.3} pressed={dragging} />
      </Camera>

      <Caption theme={theme} text="Drag a card onto a pinboard to keep it." at={8} until={DROP + 6} size={60} x={120} y={120} width={1000} sub="Color coded, emoji tagged, always one tab away." />
      <Caption theme={theme} text="You feel it on the trackpad." at={DROP + 8} until={SWITCH - 6} size={60} x={120} y={120} width={1000} sub="A light tap as the card lands, a firmer click when it is filed." />
      <Caption theme={theme} text="Switch boards with ⌘1 to ⌘9." at={SWITCH - 2} until={LEN} size={60} x={120} y={120} width={1000} />
      <Kbd theme={theme} keys="⌘3" at={SWITCH} hold={40} size={44} style={{ left: 120, top: 220 }} />
      <div style={{ position: "absolute", inset: 0, background: "#0B0C0F", opacity: 1 - out, pointerEvents: "none" }} />
    </Desktop>
  );
};
