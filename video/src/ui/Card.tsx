import React from "react";
import { card as geo, fonts, syntax, Theme } from "../theme";
import { apps } from "../theme";
import { Item, CodeToken } from "../data/items";
import { AppIcon } from "./AppIcon";

const tokenColor = (t: CodeToken["t"], theme: Theme) =>
  t === "key" ? syntax.key : t === "str" ? syntax.str : t === "com" ? syntax.com : t === "num" ? syntax.num : t === "type" ? syntax.type : theme.dim;

export const CodeLines: React.FC<{ lines: CodeToken[][]; theme: Theme; size?: number }> = ({ lines, theme, size = 11.5 }) => (
  <div style={{ fontFamily: fonts.mono, fontSize: size, lineHeight: 1.55, color: theme.dim, whiteSpace: "pre", overflow: "hidden" }}>
    {lines.map((l, i) => (
      <div key={i}>
        {l.map((t, j) => (
          <span key={j} style={{ color: tokenColor(t.t, theme) }}>
            {t.v}
          </span>
        ))}
      </div>
    ))}
  </div>
);

const Star: React.FC = () => <span style={{ color: "#f5c451", fontSize: 11 }}>★</span>;

/**
 * One shelf card, 184×244 at scale 1 (Tokens.cardWidth × cardHeight), rendered by kind.
 * `selected` adds the accent ring. `scale` scales the whole card (used for the montage).
 */
export const Card: React.FC<{
  item: Item;
  theme: Theme;
  selected?: boolean;
  style?: React.CSSProperties;
  showOcr?: boolean;
  menu?: string;
}> = ({ item, theme, selected, style, showOcr, menu }) => {
  const a = apps[item.app] ?? apps.system;
  const isLight = theme.name === "light";
  return (
    <div
      style={{
        width: geo.width,
        height: geo.height,
        flex: "none",
        boxSizing: "border-box",
        background: selected
          ? `linear-gradient(180deg, rgba(76,157,255,${isLight ? 0.10 : 0.09}), ${theme.surface})`
          : theme.surface,
        border: `1px solid ${selected ? theme.accent : theme.line}`,
        boxShadow: selected ? `0 0 0 1.5px ${theme.accent}, 0 12px 34px -12px ${theme.glow}` : theme.cardShadow,
        borderRadius: geo.radius,
        padding: 11,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: theme.mute, fontFamily: fonts.sans }}>
        <AppIcon app={item.app} />
        <span style={{ color: theme.dim, fontWeight: 500 }}>{a.label}</span>
        <span style={{ marginLeft: "auto" }}>{item.time}</span>
        {item.fav ? <Star /> : null}
      </div>
      <div style={{ height: 1, background: theme.line }} />
      {item.kind === "text" ? (
        <>
          {item.title ? <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{item.title}</div> : null}
          <div style={{ fontFamily: fonts.sans, fontSize: 12, lineHeight: 1.5, color: theme.dim, whiteSpace: "pre-wrap", overflow: "hidden" }}>
            {item.body}
          </div>
        </>
      ) : null}
      {item.kind === "code" ? (
        <>
          <CodeLines lines={item.lines} theme={theme} />
          <div
            style={{
              marginTop: "auto",
              alignSelf: "flex-start",
              fontFamily: fonts.mono,
              fontSize: 9.5,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: theme.accent2,
              background: "rgba(76,157,255,0.12)",
              border: `1px solid ${theme.accentDim}`,
              borderRadius: 999,
              padding: "1px 7px",
            }}
          >
            {item.lang}
          </div>
        </>
      ) : null}
      {item.kind === "image" ? (
        <div
          style={{
            flex: 1,
            borderRadius: 7,
            border: `1px solid ${theme.line}`,
            background: `linear-gradient(160deg, ${item.from}, ${item.to})`,
            display: "grid",
            placeItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {item.label ? (
            <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>
              {item.label}
            </div>
          ) : null}
          {showOcr && item.ocr ? (
            <div
              style={{
                position: "absolute",
                left: 6,
                right: 6,
                bottom: 6,
                fontFamily: fonts.mono,
                fontSize: 8.5,
                lineHeight: 1.35,
                color: "#fff",
                background: "rgba(0,0,0,0.45)",
                border: "1px dashed rgba(255,255,255,0.6)",
                borderRadius: 4,
                padding: "3px 5px",
              }}
            >
              {item.ocr}
            </div>
          ) : null}
        </div>
      ) : null}
      {item.kind === "link" ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: theme.text }}>
            <span style={{ width: 13, height: 13, borderRadius: 3, background: item.favicon, flex: "none" }} />
            {item.host}
          </div>
          <div style={{ fontFamily: fonts.sans, fontSize: 12, lineHeight: 1.45, color: theme.dim }}>{item.title}</div>
          <div style={{ marginTop: "auto", fontFamily: fonts.mono, fontSize: 9.5, color: theme.mute, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {item.url}
          </div>
        </>
      ) : null}
      {item.kind === "file" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div
            style={{
              width: 58,
              height: 72,
              borderRadius: 6,
              background: `linear-gradient(180deg, ${theme.surface2}, ${theme.surface})`,
              border: `1px solid ${theme.line2}`,
              display: "grid",
              placeItems: "center",
              fontFamily: fonts.mono,
              fontSize: 9,
              fontWeight: 700,
              color: theme.accent2,
              letterSpacing: "0.06em",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, borderLeft: `1px solid ${theme.line2}`, borderBottom: `1px solid ${theme.line2}`, borderBottomLeftRadius: 4, background: theme.surface2 }} />
            {item.ext}
          </div>
          <div style={{ fontSize: 11.5, color: theme.text, fontWeight: 500, textAlign: "center" }}>{item.name}</div>
        </div>
      ) : null}
      {item.kind === "color" ? (
        <>
          <div style={{ flex: 1, borderRadius: 7, background: item.hex, border: `1px solid rgba(0,0,0,0.12)`, boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.08)` }} />
          <div style={{ fontFamily: fonts.mono, fontSize: 12, color: theme.text, fontWeight: 500 }}>{item.hex}</div>
        </>
      ) : null}
      {menu ? (
        <div
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 10,
            background: theme.surface2,
            border: `1px solid ${theme.line2}`,
            borderRadius: 7,
            padding: "6px 9px",
            fontSize: 11.5,
            color: theme.text,
            fontWeight: 500,
            boxShadow: theme.cardShadow,
          }}
        >
          {menu}
        </div>
      ) : null}
    </div>
  );
};
