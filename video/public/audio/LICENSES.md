# Audio licenses

All audio in this folder comes from Mixkit (https://mixkit.co), downloaded on 2026-10-01.
Mixkit assets are free for commercial and personal projects and need no attribution.
The license pages are https://mixkit.co/license/#musicFree (music) and
https://mixkit.co/license/#sfxFree (sound effects). Read them once before you publish.
Each listing's structured data states `"copyrightNotice": "Mixkit Stock Music Free License"`
and `"isAccessibleForFree": true`.

## Music

| File | Title | Artist | Source | License |
|---|---|---|---|---|
| `music.mp3` | Happy Times (120 BPM, 1:40) | Alejandro Magaña (A. M.) | https://assets.mixkit.co/music/158/158.mp3 (listed at https://mixkit.co/free-stock-music/tag/happy/) | Mixkit Stock Music Free License |

Alternatives that were analyzed and fit the cut (swap the file and set `BPM` in `src/timeline.ts`):

| Mixkit id | Title | Artist | BPM |
|---|---|---|---|
| 1012 | Take this Higher (EDM, 4 s intro) | Michael Ramir C. | 125 |
| 837 | Life is a Dream (disco, 5 s intro) | Michael Ramir C. | 120 |
| 440 | Infinity (corporate, the first cut's track) | Arulo | 112 |
| 729 | Pop Track 03 | Lily J | 110 |
| 33 | Motivating Mornings | Ahjay Stelino | 121 |
| 1167 | Close Up | Michael Ramir C. | 106 |

## Sound effects

All files were trimmed to about 1 second, faded, and normalized with ffmpeg.
Source URL pattern: `https://assets.mixkit.co/active_storage/sfx/<id>/<id>-preview.mp3`.

| File | Mixkit id | Title | Used for |
|---|---|---|---|
| `sfx/tick.mp3` | 2577 | Interface device click | ⌘C beats in the hook |
| `sfx/whoosh.mp3` | 1490 | Fast whoosh transition | The shelf sliding up, the floating shelf |
| `sfx/pop.mp3` | 2356 | Dry pop up notification alert | ⏎ paste |
| `sfx/pop1.mp3`, `pop2.mp3`, `pop3.mp3` | 2356 | Dry pop up notification alert, pitched up in steps | Paste Stack ⌘V, ⌘V, ⌘V |
| `sfx/key.mp3` | 2541 | Single key press in a laptop | Typing in the search field |
| `sfx/ding.mp3` | 2867 | Confirmation tone | Search result found |
| `sfx/thud.mp3` | 3005 | Explainer video pops whoosh light pop | Card dropped on a pinboard |
| `sfx/click.mp3` | 1109 | Select click | Clicks, tab switch, card labels |
| `sfx/flip.mp3` | 168 | Fast air sweep transition | Dark to light wipe |
| `sfx/swish.mp3` | 166 | Fast small sweep transition | Smart cards montage cuts |
| `sfx/open.mp3` | 2578 | Opening software interface | Paste Stack palette opens |
| `sfx/chime.mp3` | 3218 | Positive tech alert | Closer logo |
