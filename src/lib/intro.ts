/**
 * A tiny pub/sub so components can wait for the hero's first light-up before they play
 * their entrance.
 */
type Listener = () => void;

const listeners = new Set<Listener>();
export const intro = { done: false };

export function onIntroDone(cb: Listener): () => void {
  if (intro.done) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function markIntroDone() {
  if (intro.done) return;
  intro.done = true;
  listeners.forEach((l) => l());
  listeners.clear();
}
