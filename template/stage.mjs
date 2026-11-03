/**
 * Clip scheduling for a desktop character.
 *
 * The model that reads as "alive" on a desktop:
 *  - idle clips are SHORT seamless loops (blink + breathing scale, 3-6s),
 *    rotated so repetition never becomes obvious
 *  - reactions are ONE-SHOT clips (wave, laugh, pout) triggered by clicks
 *    or events; they interrupt or queue, play once, and hand control back
 *    to the idle rotation exactly where it left off
 *  - big motions never live in the idle set — a looped wave looks broken
 *
 * This class is the pure decision logic; the template wires it to <video>.
 */
class Stage {
  constructor({ idleClips, reactions = {}, interruptCooldownMs = 1500, now = Date.now } = {}) {
    if (!Array.isArray(idleClips) || idleClips.length === 0) {
      throw new Error('idleClips must be a non-empty array');
    }
    this.idleClips = idleClips;
    this.reactions = reactions; // name -> clip src
    this.interruptCooldownMs = interruptCooldownMs;
    this.now = now;
    this.idleIndex = 0;
    this.mode = 'idle'; // 'idle' | 'reaction'
    this.queue = [];
    this.lastInterruptAt = -Infinity;
    this.current = idleClips[0];
  }

  /** The clip that should be on screen right now. */
  currentClip() {
    return this.current;
  }

  /** Call when the current clip ends (or its loop point is reached). */
  advance() {
    if (this.mode === 'reaction') {
      if (this.queue.length > 0) {
        this.current = this.queue.shift();
        return this.current;
      }
      this.mode = 'idle';
      this.current = this.idleClips[this.idleIndex];
      return this.current;
    }
    this.idleIndex = (this.idleIndex + 1) % this.idleClips.length;
    this.current = this.idleClips[this.idleIndex];
    return this.current;
  }

  /**
   * Trigger a reaction by name.
   * interrupt=true cuts the current clip (subject to cooldown so frantic
   * clicking can't strobe the character); otherwise it queues after the
   * current reaction. Returns true when the reaction will play.
   */
  react(name, { interrupt = true } = {}) {
    const clip = this.reactions[name];
    if (!clip) return false;
    if (this.mode === 'reaction' && !interrupt) {
      this.queue.push(clip);
      return true;
    }
    if (interrupt && this.mode === 'reaction' && this.now() - this.lastInterruptAt < this.interruptCooldownMs) {
      this.queue.push(clip);
      return true;
    }
    if (interrupt) this.lastInterruptAt = this.now();
    this.mode = 'reaction';
    this.current = clip;
    return true;
  }
}
/**
 * Click hotspots over the character, in normalized coordinates (0..1)
 * so they survive any screen resolution. Higher z wins; ties go to the
 * later-defined hotspot. Invisible rectangles are fine — the character
 * herself is the affordance.
 */
function createHotspots(defs) {
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
export { Stage, createHotspots };
