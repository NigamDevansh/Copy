import React from "react";
import { card as geo, fonts, pinboards, Theme } from "../theme";
import { Item } from "../data/items";
import { Card } from "./Card";
import { Tab } from "./Tab";
import { SearchField } from "./SearchField";

export const SHELF_WIDTH = 1920;
export const SHELF_PAD = 20;
export const SHELF_TOP_H = 54;
/** Shelf height when edge attached (top padding + tabs row + rule + cards + bottom padding). */
export const SHELF_HEIGHT = 16 + 40 + 21 + 2 + 244 + 4 + 26;
/** Card slot x inside the cards row (relative to the row). */
export const cardSlotX = (i: number) => 2 + i * (geo.width + geo.gap);
/** Card slot x on the canvas for an edge-attached, full-width shelf. */
export const cardCanvasX = (i: number) => SHELF_PAD + cardSlotX(i);
/** Card top relative to the shelf's own top edge. */
export const CARD_SHELF_TOP = 16 + 40 + 21 + 2;
/** Card top on the canvas for an edge-attached shelf at the bottom of a 1080 canvas. */
export const CARD_CANVAS_TOP = 1080 - SHELF_HEIGHT + 16 + 40 + 21 + 2;

/**
 * The Copy shelf: a glass panel with pinboard tabs, the search field, a rule and a row of cards.
 * `floating` adds a margin and rounds every corner (Shelf Style: Floating).
 * Each card can be transformed via `cardStyle(item, index)` for choreography.
 */
export const Shelf: React.FC<{
  theme: Theme;
  items: Item[];
  width?: number;
  floating?: boolean;
  activeTab?: string;
  hotTab?: { id: string; hot: number } | null;
  selected?: string | null;
  search?: Omit<React.ComponentProps<typeof SearchField>, "theme">;
  cardStyle?: (item: Item, i: number) => React.CSSProperties | undefined;
  hideCard?: (item: Item) => boolean;
  showOcrFor?: string | null;
  tabCounts?: Record<string, number>;
  style?: React.CSSProperties;
  /** Position cards absolutely at their slot so they can be re-ordered or filtered via cardStyle. */
  absolute?: boolean;
}> = ({ theme, items, width = SHELF_WIDTH, floating, activeTab = "history", hotTab, selected, search, cardStyle, hideCard, showOcrFor, tabCounts, style, absolute }) => {
  const radius = floating ? 18 : 16;
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        background: theme.shelfBg,
        backdropFilter: "blur(26px) saturate(150%)",
        WebkitBackdropFilter: "blur(26px) saturate(150%)",
        border: `1px solid ${theme.shelfBorder}`,
        borderBottom: floating ? undefined : "none",
        borderRadius: floating ? radius : `${radius}px ${radius}px 0 0`,
        boxShadow: theme.shelfShadow,
        padding: `${SHELF_PAD - 4}px ${SHELF_PAD}px ${floating ? SHELF_PAD : SHELF_PAD + 6}px`,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: SHELF_TOP_H - 14, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", gap: 7 }}>
          {pinboards.map((b) => (
            <Tab
              key={b.id}
              theme={theme}
              name={b.name}
              tint={b.tint}
              emoji={b.emoji}
              on={activeTab === b.id}
              hot={hotTab?.id === b.id ? hotTab.hot : 0}
              count={tabCounts?.[b.id] ?? null}
            />
          ))}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <SearchField theme={theme} {...(search ?? {})} />
        </div>
      </div>
      <div style={{ height: 1, background: theme.line, margin: "6px 2px 14px" }} />
      <div style={{ display: "flex", gap: geo.gap, padding: "2px 2px 4px", position: "relative", minHeight: geo.height + 6, height: absolute ? geo.height + 6 : undefined }}>
        {items.map((it, i) => {
          if (hideCard?.(it)) return null;
          const base: React.CSSProperties = absolute ? { position: "absolute", left: cardSlotX(i), top: 2 } : {};
          return (
            <Card
              key={it.id}
              item={it}
              theme={theme}
              selected={selected === it.id}
              showOcr={showOcrFor === it.id}
              style={{ ...base, ...cardStyle?.(it, i) }}
            />
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, background: "transparent", fontFamily: fonts.sans }} />
    </div>
  );
};
