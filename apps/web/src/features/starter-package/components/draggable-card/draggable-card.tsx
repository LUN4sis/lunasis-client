import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './draggable-card.module.scss';

// Flexible product type for draggable card
interface DraggableProduct {
  key?: string;
  productId?: string;
  name: string;
  image: string;
  description?: string | string[] | readonly string[];
}

// 번호별 배지 색상 / Badge colors by rank
const RANK_COLORS = [
  '#9B59B6', // 1번: 보라색 / Purple
  '#E74C3C', // 2번: 빨간색 / Red
  '#F39C12', // 3번: 주황색 / Orange
  '#9B59B6', // 4번: 보라색 / Purple
  '#3498DB', // 5번: 파란색 / Blue
];

// 제품명에서 메인/서브 텍스트 추출 / Extract main/sub text from product name
const parseProductName = (name: string): { main: string; sub: string } => {
  // "–", "-", "—" 등 다양한 구분자로 분리 / Split by various separators
  const parts = name
    .split(/[–—-]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length >= 2) {
    return {
      main: parts[0],
      sub: parts.slice(1).join(' '),
    };
  }

  // 분리할 수 없으면 전체를 메인으로 / If can't split, use full name as main
  return {
    main: name,
    sub: '',
  };
};

export const DraggableCard = ({ product, rank }: { product: DraggableProduct; rank?: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.key || product.productId || '',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { main, sub } = parseProductName(product.name);
  const rankColor = rank ? RANK_COLORS[(rank - 1) % RANK_COLORS.length] : RANK_COLORS[0];

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // TODO: 메뉴 기능 구현 / TODO: Implement menu functionality
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.brandItem} {...attributes} {...listeners}>
      {rank && (
        <div className={styles.rankBadge} style={{ backgroundColor: rankColor }}>
          <span className={styles.rankNumber}>{rank}</span>
        </div>
      )}
      <div className={styles.productImage}>
        <img src={product.image} alt={product.name} width={100} height={100} />
      </div>
      <div className={styles.productInfo}>
        <div className={styles.mainText}>{main}</div>
        {sub && <div className={styles.subText}>{sub}</div>}
      </div>
      <button
        type="button"
        className={styles.menuButton}
        onClick={handleMenuClick}
        aria-label="제품 메뉴"
        tabIndex={0}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.menuIcon}
        >
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
    </div>
  );
};
