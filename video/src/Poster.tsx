import React from "react";
import { Sequence } from "remotion";
import { Hook } from "./scenes/Hook";

/** Poster frame: the hook at the moment the shelf has risen and the title is in. */
export const Poster: React.FC = () => (
  <Sequence from={-110}>
    <Hook />
  </Sequence>
);
