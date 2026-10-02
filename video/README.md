# Copy showcase video

A one minute motion-graphics demo of Copy, built with [Remotion](https://www.remotion.dev).
The app UI is rebuilt as React components. No screen recordings are used.

## Commands

```sh
npm install
npm run preview     # Remotion Studio, scrub the timeline in the browser
npm run render      # out/copy-showcase.mp4 (1920x1080, 30 fps, H.264 + AAC)
npm run poster      # out/poster.png, a thumbnail frame
npm run typecheck
```

The first render downloads a headless Chrome once.

## Layout

- `src/timeline.ts` is the single place for scene start frames and the music BPM. Scene
  boundaries snap to the beat.
- `src/scenes/*` holds one component per scene, in order: Hook, ShelfIntro, SmartSearch,
  Pinboards, PasteStack, SmartCards, Appearance, Closer. Each scene registers its own sound
  cues with `cue(sceneStart, frame, sfxName, volume)`.
- `src/ui/*` holds the rebuilt Copy UI: `Shelf`, `Card`, `Tab`, `SearchField`,
  `PasteStackPanel`, plus `Kbd` key chips, `Caption`, `Cursor`, `Window`, `Camera`.
- `src/theme.ts` ports the brand tokens from `docs/assets/css/style.css`.
- `src/data/items.ts` ports the demo cards from `Copy/App/DemoData.swift`.
- `public/audio/LICENSES.md` lists the source and license of every audio file.

## Retiming

Change a scene's `from` and `to` in `src/timeline.ts`. Inside a scene, the beat constants at
the top of the file (for example `PASTE`, `GRAB`, `DROP`, `SWITCH`) move the key moments and
their sound cues together.

## Swapping the music

Replace `public/audio/music.mp3`, set `BPM` in `src/timeline.ts`, and adjust `MUSIC_START` so
the first beat lands on the ⇧⌘V press in the hook. The alternatives in `LICENSES.md` were
analyzed for tempo and loudness.
