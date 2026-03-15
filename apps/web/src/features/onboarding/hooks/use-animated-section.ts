import { useEffect, useRef, useState } from 'react';

/**
 * Hook that manages enter/exit animation state for a conditionally-visible section.
 *
 * When `show` transitions from false to true: sets visible=true, exiting=false.
 * When `show` transitions from true to false: sets exiting=true, then after
 * `exitDuration` ms sets visible=false.
 */
export function useAnimatedSection(show: boolean, exitDuration = 200) {
  const [visible, setVisible] = useState(show);
  const [exiting, setExiting] = useState(false);
  const prev = useRef(show);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (show && !prev.current) {
      setExiting(false);
      setVisible(true);
    } else if (!show && prev.current) {
      setExiting(true);
      t = setTimeout(() => setVisible(false), exitDuration);
    }
    prev.current = show;
    return () => clearTimeout(t);
  }, [show, exitDuration]);

  return { visible, exiting };
}
