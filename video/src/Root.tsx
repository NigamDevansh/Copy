import React from "react";
import { Composition, Still } from "remotion";
import { Showcase } from "./Showcase";
import { Poster } from "./Poster";
import { TOTAL } from "./timeline";

export const Root: React.FC = () => (
  <>
    <Composition id="CopyShowcase" component={Showcase} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Still id="Poster" component={Poster} width={1920} height={1080} />
  </>
);
