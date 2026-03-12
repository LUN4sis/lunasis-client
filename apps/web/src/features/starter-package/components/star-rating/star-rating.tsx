'use client';

import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import styles from './star-rating.module.scss';

const MAX_RATING = 5;
const STEP = 0.5;
const STAR_PATH =
  'M20.03 7.75 Q21 6 21.97 7.75 L25.7 14.53 33.3 15.98 Q35.27 16.36 33.9 17.82 L28.61 23.47 L29.57 31.15 Q29.82 33.14 28.01 32.29 L21 29 L13.99 32.29 Q12.18 33.14 12.43 31.15 L13.39 23.47 L8.1 17.82 Q6.73 16.36 8.7 15.98 L16.3 14.53 Z';

function Star({ id, index, rating }: { id: string; index: number; rating: number }) {
  const isFull = rating >= index;
  const isHalf = !isFull && rating >= index - 0.5;
  const color = isFull || isHalf ? '#FACC15' : '#d9d9d9';

  return (
    <svg width="36" height="36" viewBox="2 1 38 40" fill="none" className={styles.star}>
      <path
        d={STAR_PATH}
        fill={isFull ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {isHalf && (
        <>
          <defs>
            <clipPath id={`clip-${id}-${index}`}>
              <rect x="0" y="0" width="21" height="42" />
            </clipPath>
          </defs>
          <path
            d={STAR_PATH}
            fill={color}
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            clipPath={`url(#clip-${id}-${index})`}
          />
        </>
      )}
    </svg>
  );
}

export function StarRating({
  id,
  value = 0,
  onChange,
}: {
  id: string;
  value?: number;
  onChange?: (v: number) => void;
}) {
  const [rating, setRating] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateRating = (clientX: number) => {
    if (!containerRef.current) return 0;

    const { left, width } = containerRef.current.getBoundingClientRect();
    const percent = (clientX - left) / width;
    const rawRating = Math.max(0, Math.min(MAX_RATING, percent * MAX_RATING));
    return Math.round(rawRating / STEP) * STEP;
  };

  const handlePointer = (e: ReactPointerEvent | PointerEvent) => {
    // prevent text selection while dragging
    if (e.cancelable) e.preventDefault();
    const next = calculateRating(e.clientX);
    setRating(next);
    onChange?.(next);
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    handlePointer(e);
    const onMove = (me: PointerEvent) => handlePointer(me);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const move = (delta: number) => {
      const next = Math.max(0, Math.min(MAX_RATING, rating + delta));
      setRating(next);
      onChange?.(next);
    };

    const actions: Record<string, () => void> = {
      ArrowLeft: () => move(-STEP),
      ArrowDown: () => move(-STEP),
      ArrowRight: () => move(STEP),
      ArrowUp: () => move(STEP),
      Home: () => move(-MAX_RATING),
      End: () => move(MAX_RATING),
    };

    if (actions[e.key]) {
      e.preventDefault();
      actions[e.key]();
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.starsRow}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="slider"
      aria-valuenow={rating}
      aria-valuemin={0}
      aria-valuemax={MAX_RATING}
      style={{ touchAction: 'none', cursor: 'pointer', display: 'inline-flex' }}
    >
      {Array.from({ length: MAX_RATING }, (_, i) => (
        <Star key={i} id={id} index={i + 1} rating={rating} />
      ))}
    </div>
  );
}
