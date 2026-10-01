import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ensureFonts } from "./fonts";
import { cues, MUSIC_START, scenes, TOTAL } from "./timeline";
import { Hook } from "./scenes/Hook";
import { ShelfIntro } from "./scenes/ShelfIntro";
import { SmartSearch } from "./scenes/SmartSearch";
import { Pinboards } from "./scenes/Pinboards";
import { PasteStack } from "./scenes/PasteStack";
import { SmartCards } from "./scenes/SmartCards";
import { Appearance } from "./scenes/Appearance";
import { Closer } from "./scenes/Closer";

ensureFonts();

const Scene: React.FC<{ range: { from: number; to: number }; children: React.ReactNode; name: string }> = ({ range, children, name }) => (
  <Sequence from={range.from} durationInFrames={range.to - range.from} name={name}>
    {children}
  </Sequence>
);

export const Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const musicVolume = (f: number) => {
    const abs = f + MUSIC_START;
    const fadeIn = interpolate(abs, [MUSIC_START, MUSIC_START + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = interpolate(abs, [TOTAL - 70, TOTAL - 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return 0.42 * Math.min(fadeIn, fadeOut);
  };
  return (
    <AbsoluteFill style={{ background: "#0B0C0F" }}>
      <Scene range={scenes.hook} name="Hook"><Hook /></Scene>
      <Scene range={scenes.shelf} name="Shelf"><ShelfIntro /></Scene>
      <Scene range={scenes.search} name="Search"><SmartSearch /></Scene>
      <Scene range={scenes.pinboards} name="Pinboards"><Pinboards /></Scene>
      <Scene range={scenes.stack} name="PasteStack"><PasteStack /></Scene>
      <Scene range={scenes.cards} name="SmartCards"><SmartCards /></Scene>
      <Scene range={scenes.appearance} name="Appearance"><Appearance /></Scene>
      <Scene range={scenes.closer} name="Closer"><Closer /></Scene>

      <Sequence from={MUSIC_START} name="Music">
        <Audio src={staticFile("audio/music.mp3")} volume={musicVolume} />
      </Sequence>
      {cues.map((c, i) => (
        <Sequence key={i} from={c.frame} durationInFrames={45} name={`sfx:${c.sfx}`}>
          <Audio src={staticFile(`audio/sfx/${c.sfx}.mp3`)} volume={c.volume ?? 1} />
        </Sequence>
      ))}
      {frame < 0 ? null : null}
    </AbsoluteFill>
  );
};
