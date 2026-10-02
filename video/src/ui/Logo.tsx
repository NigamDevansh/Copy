import React from "react";

/** "The Duplicate" logomark: a graphite card behind a light gradient card. */
export const Logo: React.FC<{ size?: number; back?: number; front?: number; style?: React.CSSProperties }> = ({
  size = 256,
  back = 1,
  front = 1,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 256 256" style={style}>
    <defs>
      <linearGradient id="g-dup" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F6F6F4" />
        <stop offset="1" stopColor="#C9CBCF" />
      </linearGradient>
    </defs>
    <rect x="58" y="44" width="112" height="142" rx="18" fill="#7C7E85" style={{ opacity: back, transform: `translate(${(1 - back) * 20}px, ${(1 - back) * 20}px)` }} />
    <rect x="94" y="80" width="112" height="142" rx="18" fill="url(#g-dup)" style={{ opacity: front, transform: `translate(${(1 - front) * -36}px, ${(1 - front) * -36}px)` }} />
  </svg>
);
