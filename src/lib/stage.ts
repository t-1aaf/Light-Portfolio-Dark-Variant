/**
 * Tiny shared store between the hero (which writes it) and the aurora (which reads it every frame).
 * Plain object on purpose: nothing here should ever trigger a React render.
 *
 *  hero  0..1  progress of the pinned light sequence
 *  lit   0..1  how bright the lamp currently is (0 = off)
 */
export const stage = { hero: 0, lit: 0 };
