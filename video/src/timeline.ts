/**
 * Single source of truth for scene timing and sound cues (frames at 30 fps).
 * Music: "Happy Times" by Alejandro Magaña (Mixkit), 120 BPM → one beat = 15 frames, one bar = 60 frames.
 */
export const FPS = 30;
export const BPM = 120;
export const BEAT = (60 / BPM) * FPS; // 15 frames at 120 BPM
export const BAR = BEAT * 4;

/** Music starts on the ⇧⌘V press in the hook; the file has its first beat at 0.0s. */
export const MUSIC_START = 70;

/** Snap a frame offset (measured from MUSIC_START) to the nearest beat. */
const onBeat = (frames: number) => MUSIC_START + Math.round(Math.round((frames - MUSIC_START) / BEAT) * BEAT);

/** Extra frames the hook holds its title after the shelf has risen. */
const HOOK_HOLD = 90;
const H = HOOK_HOLD;

export const scenes = {
  hook: { from: 0, to: 120 + H },
  shelf: { from: 120 + H, to: onBeat(300 + H) },
  search: { from: onBeat(300 + H), to: onBeat(600 + H) },
  pinboards: { from: onBeat(600 + H), to: onBeat(840 + H) },
  stack: { from: onBeat(840 + H), to: onBeat(1140 + H) },
  cards: { from: onBeat(1140 + H), to: onBeat(1380 + H) },
  appearance: { from: onBeat(1380 + H), to: onBeat(1530 + H) },
  closer: { from: onBeat(1530 + H), to: 1740 + H },
} as const;

export const TOTAL = scenes.closer.to;

export type Cue = { frame: number; sfx: string; volume?: number };



/** Sound cues are defined inside each scene relative to its start; this collects them. */
export const cues: Cue[] = [];
export const cue = (sceneFrom: number, frame: number, sfx: string, volume = 1) => {
  cues.push({ frame: sceneFrom + frame, sfx, volume });
};
