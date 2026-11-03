/**
 * Click hotspots over the character, in normalized coordinates (0..1)
 * so they survive any screen resolution. Higher z wins; ties go to the
 * later-defined hotspot. Invisible rectangles are fine — the character
 * herself is the affordance.
 */
export function createHotspots(defs) {
  const list = defs.map((d, i) => ({ z: 0, ...d, order: i }));
  return {
    /** x, y are normalized 0..1 pointer coordinates. Returns the hotspot or null. */
    hitTest(x, y) {
      let best = null;
      for (const h of list) {
        if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
          if (!best || h.z > best.z || (h.z === best.z && h.order > best.order)) best = h;
        }
      }
      return best;
    },
    all() { return [...list]; },
  };
}
