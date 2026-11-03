# wallpaper-stage

**A stage for living desktop characters.**

[中文说明](README.zh-CN.md)

A character who lives on your desktop is a scheduling problem before it is
an art problem. Loop one long video and she feels like a screensaver;
randomize clips and she feels broken. What reads as *alive*:

- **idle = short seamless loops** (blink + breathing, 3–6s), rotated quietly
- **reactions = one-shot clips** triggered by clicks/events, then control
  hands back to idle *exactly where it left off*
- **clickable character** — which, on Lively Wallpaper, means the wallpaper
  must be **HTML**: plain video wallpapers receive no mouse events at all

`wallpaper-stage` is that logic as a tested, dependency-free core plus a
drop-in Lively template:

- 🎬 `Stage` — idle rotation, reaction interrupt/queue, anti-strobe cooldown
- 🎯 `createHotspots` — normalized (resolution-independent) click regions
  with z-order over the character
- 🖥️ `template/` — a working HTML wallpaper: video layer, hotspot layer,
  chat bar you can wire to any dialogue/TTS backend

## Usage

```js
import { Stage, createHotspots } from 'wallpaper-stage';

const stage = new Stage({
  idleClips: ['idle-blink.mp4', 'idle-breathe.mp4'],
  reactions: { pat: 'react-pat.mp4' },
});
stage.react('pat');            // interrupts idle
stage.advance();               // reaction ended → back to idle, same index
```

## Asset guidance (learned the hard way)

- Idle loops must start and end on the *same* frame state, or the seam
  reads as a glitch. Blink timing inside a loop: every 3–6s, irregular.
- Never put big motions (waves, turns) in the idle set — looped, they
  read as mechanical within a minute.
- Keep the background locked off in every clip; a drifting background
  breaks the "she is in the room with you" illusion instantly.

## Roadmap

Gaze-follow (pointer-tracked eye layer), Live2D adapter notes, Tauri
desktop-pet mode, lip-flap speaking loop helpers. See `docs/roadmap.md`.

## License

MIT
