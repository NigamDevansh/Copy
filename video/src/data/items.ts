/**
 * Card content for the video, adapted from Copy/App/DemoData.swift so the shelf looks
 * like the app's own demo mode.
 */
export type CodeToken = { t: "key" | "str" | "com" | "num" | "type" | "plain"; v: string };

export type Item =
  | { id: string; kind: "text"; app: string; time: string; title?: string; body: string; fav?: boolean }
  | { id: string; kind: "code"; app: string; time: string; lang: string; lines: CodeToken[][]; fav?: boolean }
  | { id: string; kind: "image"; app: string; time: string; from: string; to: string; label?: string; ocr?: string; fav?: boolean }
  | { id: string; kind: "link"; app: string; time: string; url: string; host: string; title: string; favicon: string; fav?: boolean }
  | { id: string; kind: "file"; app: string; time: string; name: string; ext: string; fav?: boolean }
  | { id: string; kind: "color"; app: string; time: string; hex: string; fav?: boolean };

const k = (v: string): CodeToken => ({ t: "key", v });
const ty = (v: string): CodeToken => ({ t: "type", v });
const s = (v: string): CodeToken => ({ t: "str", v });
const c = (v: string): CodeToken => ({ t: "com", v });
const n = (v: string): CodeToken => ({ t: "num", v });
const p = (v: string): CodeToken => ({ t: "plain", v });

export const swiftCode: Item = {
  id: "swift",
  kind: "code",
  app: "xcode",
  time: "2m",
  lang: "Swift",
  fav: true,
  lines: [
    [k("func"), p(" paste(_ item: "), ty("ClipItem"), p(") {")],
    [p("  "), k("guard let"), p(" next = queue.advance()")],
    [p("    "), k("else"), p(" { "), k("return"), p(" }")],
    [p("  pasteboard.write(next)")],
    [p("  "), ty("HUD"), p(".show("), s('"Pasted"'), p(")")],
    [p("}")],
  ],
};

export const invoice: Item = {
  id: "invoice",
  kind: "image",
  app: "safari",
  time: "6m",
  from: "#29334d",
  to: "#1a1f33",
  label: "INVOICE #A-2214",
  ocr: "INVOICE #A-2214 · total due $4,820.00 · net 30",
  fav: true,
};

export const github: Item = {
  id: "github",
  kind: "link",
  app: "safari",
  time: "9m",
  url: "https://github.com/tarikbc/Copy",
  host: "github.com",
  title: "tarikbc/Copy: a visual clipboard for macOS",
  favicon: "#24292f",
  fav: true,
};

export const sketch: Item = {
  id: "sketch",
  kind: "file",
  app: "finder",
  time: "12m",
  name: "Copy-hero.sketch",
  ext: "SKETCH",
};

export const brandColor: Item = {
  id: "brand",
  kind: "color",
  app: "figma",
  time: "16m",
  hex: "#4C9DFF",
  fav: true,
};

export const tsCode: Item = {
  id: "ts",
  kind: "code",
  app: "vscode",
  time: "22m",
  lang: "TypeScript",
  lines: [
    [k("export function"), p(" useClipboard() {")],
    [p("  "), k("const"), p(" [items, set] = useState<"), ty("Item"), p("[]>([])")],
    [p("  useEffect(() => subscribe(set), [])")],
    [p("  "), k("return"), p(" items")],
    [p("}")],
  ],
};

export const checklist: Item = {
  id: "checklist",
  kind: "text",
  app: "notes",
  time: "28m",
  title: "Launch checklist",
  body: "1. Notarize + staple\n2. Update the appcast\n3. Bump the Homebrew cask\n4. Post the demo video",
};

export const figmaLink: Item = {
  id: "figma-link",
  kind: "link",
  app: "figma",
  time: "34m",
  url: "https://figma.com/file/9aB2/Copy-Marketing",
  host: "figma.com",
  title: "Copy — Marketing site (Figma)",
  favicon: "#a259ff",
};

export const standup: Item = {
  id: "standup",
  kind: "text",
  app: "slack",
  time: "45m",
  body: "Standup at 10:30 — demo the smart search and paste stack. Can someone record the video? 🎥",
};

export const manifest: Item = {
  id: "manifest",
  kind: "code",
  app: "vscode",
  time: "1h",
  lang: "JSON",
  lines: [
    [p("{")],
    [p("  "), s('"app"'), p(": "), s('"Copy"'), p(",")],
    [p("  "), s('"version"'), p(": "), s('"0.1.7"'), p(",")],
    [p("  "), s('"kinds"'), p(": ["), s('"text"'), p(", "), s('"link"'), p("…]")],
    [p("}")],
  ],
};

export const mockup: Item = {
  id: "mockup",
  kind: "image",
  app: "figma",
  time: "1h",
  from: "#4d9eff",
  to: "#8c59f2",
  label: "Shelf mock",
};

export const playlist: Item = {
  id: "playlist",
  kind: "text",
  app: "whatsapp",
  time: "2h",
  body: "Chris: sounds great, I'll put the playlist on today 🎧",
};

export const brew: Item = {
  id: "brew",
  kind: "code",
  app: "terminal",
  time: "3h",
  lang: "Shell",
  lines: [
    [p("brew install --cask \\")],
    [p("  tarikbc/tap/copy "), k("&&"), p(" \\")],
    [p("  open -a Copy")],
  ],
};

export const sunset: Item = {
  id: "sunset",
  kind: "image",
  app: "finder",
  time: "4h",
  from: "#f28c4d",
  to: "#d94d59",
};

export const address: Item = {
  id: "address",
  kind: "text",
  app: "mail",
  time: "5h",
  body: "Ship to: 742 Evergreen Terrace, Springfield, OR 97477",
};

export const pasteLink: Item = {
  id: "paste-link",
  kind: "link",
  app: "safari",
  time: "1d",
  url: "https://pasteapp.io",
  host: "pasteapp.io",
  title: "Paste — the clipboard for your Mac",
  favicon: "#f59e0b",
};

export const roadmap: Item = {
  id: "roadmap",
  kind: "text",
  app: "notes",
  time: "1d",
  body: "Q3 roadmap: sync, snippets, and a menu-bar mini shelf.",
};

export const greenColor: Item = {
  id: "green",
  kind: "color",
  app: "figma",
  time: "3w",
  hex: "#34C759",
};

/** Shelf order in History (newest first), as the demo seed produces it. */
export const history: Item[] = [
  swiftCode,
  invoice,
  github,
  sketch,
  brandColor,
  tsCode,
  checklist,
  figmaLink,
  standup,
  manifest,
  mockup,
  playlist,
  brew,
  sunset,
  address,
  pasteLink,
  roadmap,
  greenColor,
];

export const boards: Record<string, Item[]> = {
  history,
  work: [github, checklist, figmaLink],
  design: [invoice, mockup, brandColor, sketch],
  snippets: [swiftCode, tsCode, manifest, brew],
};

/** The paste stack queue (same as the demo seed). */
export const pasteStack = [
  { n: 1, text: "brew install --cask tarikbc/tap/copy" },
  { n: 2, text: "github.com/tarikbc/Copy" },
  { n: 3, text: "#4C9DFF" },
];
