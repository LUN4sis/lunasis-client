import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './ranking.module.scss';

interface SortableItemProps {
  id: string;
  rank: number;
  name: string;
}

export function SortableItem({ id, rank, name }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.brandItem}>
      <div className={styles.rankBadge}>
        <span className={styles.rankNumber}>{rank}번</span>
      </div>
      <span className={styles.brandName}>{name}</span>
      <button className={styles.dragHandle} {...attributes} {...listeners}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="8" cy="6" r="1.5" fill="currentColor" />
          <circle cx="16" cy="6" r="1.5" fill="currentColor" />
          <circle cx="8" cy="12" r="1.5" fill="currentColor" />
          <circle cx="16" cy="12" r="1.5" fill="currentColor" />
          <circle cx="8" cy="18" r="1.5" fill="currentColor" />
          <circle cx="16" cy="18" r="1.5" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
