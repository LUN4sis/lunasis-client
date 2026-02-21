'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableItem } from './sortable-item';
import styles from './ranking.module.scss';

type PackageType = 'tampon' | 'pad' | 'both';

interface Product {
  id: string;
  name: string;
  subtitle: string;
  image?: string;
}

const TAMPON_PRODUCTS: Product[] = [
  { id: 'tampon-1', name: 'Playtex', subtitle: 'SPORT tampon' },
  { id: 'tampon-2', name: 'o.b.', subtitle: 'komfort tampon' },
  { id: 'tampon-3', name: 'Playtex', subtitle: 'gentle glide tampon' },
  { id: 'tampon-4', name: 'Kotex', subtitle: '탐폰' },
  { id: 'tampon-5', name: 'Tampax', subtitle: '컴팩트 탐폰' },
];

const PAD_PRODUCTS: Product[] = [
  { id: 'pad-1', name: '화이트', subtitle: '순면 생리대' },
  { id: 'pad-2', name: '릴리안', subtitle: '데일리 생리대' },
  { id: 'pad-3', name: '좋은느낌', subtitle: '순면 생리대' },
  { id: 'pad-4', name: '라엘', subtitle: '유기농 생리대' },
  { id: 'pad-5', name: '나트라케어', subtitle: '오가닉 생리대' },
];

const SECTION_LABELS: Record<'tampon' | 'pad', string> = {
  tampon: '탐폰',
  pad: '생리대',
};

const PAGE_TITLES: Record<PackageType, string> = {
  pad: '생리대 리뷰 작성',
  tampon: '탐폰 리뷰 작성',
  both: '탐폰 + 생리대 리뷰 작성',
};

function ProductSection({
  type,
  products,
  onReorder,
}: {
  type: 'tampon' | 'pad';
  products: Product[];
  onReorder: (products: Product[]) => void;
}) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);
      onReorder(arrayMove(products, oldIndex, newIndex));
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={`${styles.sectionLabel} ${styles[`sectionLabel--${type}`]}`}>
        {SECTION_LABELS[type]}
      </h2>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className={styles.productList}>
            {products.map((product, index) => (
              <SortableItem
                key={product.id}
                id={product.id}
                rank={index + 1}
                name={product.name}
                subtitle={product.subtitle}
                image={product.image}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default function RankingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageType = (searchParams.get('type') as PackageType) || 'pad';

  const [tamponProducts, setTamponProducts] = useState<Product[]>(TAMPON_PRODUCTS);
  const [padProducts, setPadProducts] = useState<Product[]>(PAD_PRODUCTS);

  const showTampon = packageType === 'tampon' || packageType === 'both';
  const showPad = packageType === 'pad' || packageType === 'both';

  const handleNext = () => {
    console.log('tampon ranking:', tamponProducts);
    console.log('pad ranking:', padProducts);
    // router.push('/starter-package/complete');
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton} aria-label="뒤로">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 19L8 12L15 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className={styles.title}>{PAGE_TITLES[packageType]}</h1>
        <p className={styles.description}>드래그로 순위를 변경하고 리뷰를 남겨주세요</p>
      </header>

      <div className={styles.content}>
        {showTampon && (
          <ProductSection
            type="tampon"
            products={tamponProducts}
            onReorder={setTamponProducts}
          />
        )}
        {showPad && (
          <ProductSection type="pad" products={padProducts} onReorder={setPadProducts} />
        )}
      </div>

      <div className={styles.footer}>
        <button onClick={handleNext} className={styles.nextButton}>
          다음
        </button>
      </div>
    </section>
  );
}
