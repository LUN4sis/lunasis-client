'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './ranking.module.scss';

interface SortableItemProps {
  id: string;
  rank: number;
  name: string;
  subtitle: string;
  image?: string;
}

const BADGE_CLASSES = [styles.badge1, styles.badge2, styles.badge3];

export function SortableItem({ id, rank, name, subtitle, image }: SortableItemProps) {
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const badgeClass = BADGE_CLASSES[(rank - 1) % 3];

  return (
    <div ref={setNodeRef} style={style} className={styles.itemWrapper}>
      <div className={`${styles.rankBadge} ${badgeClass}`}>
        <span className={styles.rankNumber}>{rank}</span>
      </div>

      <div className={`${styles.cardContainer} ${expanded ? styles.cardContainerExpanded : ''}`}>
        <div className={styles.brandItem}>
          <div className={styles.productImageWrapper}>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} className={styles.productImage} />
            ) : (
              <div className={styles.productImagePlaceholder} />
            )}
          </div>

          <div className={styles.productInfo}>
            <span className={styles.brandName}>{name}</span>
            <span className={styles.productSubtitle}>{subtitle}</span>
          </div>

          <div className={styles.actions}>
            <button className={styles.dragHandle} {...attributes} {...listeners}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="4" r="1.5" fill="currentColor" />
                <circle cx="13" cy="4" r="1.5" fill="currentColor" />
                <circle cx="7" cy="10" r="1.5" fill="currentColor" />
                <circle cx="13" cy="10" r="1.5" fill="currentColor" />
                <circle cx="7" cy="16" r="1.5" fill="currentColor" />
                <circle cx="13" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </button>
            <button
              className={`${styles.chevronButton} ${expanded ? styles.chevronExpanded : ''}`}
              onClick={() => setExpanded((v) => !v)}
              aria-label="리뷰 작성"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {expanded && (
          <div className={styles.reviewSection}>
            <textarea
              className={styles.reviewInput}
              placeholder="리뷰를 작성해주세요..."
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}
