# Template

1. Put your clips in `clips/` (idle loops 3–6s, seamless; reactions one-shot).
2. In Lively Wallpaper: Add Wallpaper → select this folder's `index.html`.
3. Adjust hotspot rectangles in the script to your character's framing.
4. Wire the chat form to your dialogue/TTS backend.

The stage logic (`stage.mjs`) is generated from `../src/` — edit the
sources there and re-bundle, or import from the npm package in your own build.
