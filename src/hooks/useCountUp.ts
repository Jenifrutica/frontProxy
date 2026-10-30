import { useEffect, useRef, useState } from 'react';

/**
 * Counts from the previous value to the next one with an ease-out curve.
 * Respects prefers-reduced-motion.
 */
export function useCountUp(target: number, duration = 650): number {
  const [value, setValue] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    const from = previous.current;
    previous.current = target;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      from === target
    ) {
      setValue(target);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
