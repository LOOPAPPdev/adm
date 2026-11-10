import { useCallback, useEffect, useState } from 'react';
import { playback } from '@/domain/model';

/** Visual step-through of a flow. Not BPMN execution; no real times. */
export function usePlayback(count: number, intervalMs = 1100) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setIdx(i => { const n = playback.next(count, i); if (n === null) { setPlaying(false); return i; } return n; }), intervalMs);
    return () => clearInterval(t);
  }, [playing, count, intervalMs]);
  useEffect(() => { if (idx > count - 1) setIdx(0); }, [count, idx]);
  return {
    idx, playing,
    play: useCallback(() => { setIdx(i => (i >= count - 1 ? 0 : i)); setPlaying(true); }, [count]),
    pause: useCallback(() => setPlaying(false), []),
    step: useCallback(() => { setPlaying(false); setIdx(i => playback.next(count, i) ?? i); }, [count]),
    reset: useCallback(() => { setPlaying(false); setIdx(0); }, [])
  };
}
