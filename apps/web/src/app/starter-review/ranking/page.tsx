'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableItem } from './sortable-item';
import styles from './ranking.module.scss';

type PackageType = 'tampon' | 'pad' | 'both';

// 브랜드 데이터 타입
interface Brand {
  id: string;
  name: string;
}

// 패키지 타입별 브랜드 목록
const BRAND_DATA: Record<PackageType, Brand[]> = {
  pad: [
    { id: 'pad-1', name: '좋은느낌' },
    { id: 'pad-2', name: '화이트' },
    { id: 'pad-3', name: '순수한면' },
    { id: 'pad-4', name: '예지미인' },
    { id: 'pad-5', name: '라엘 생리대' },
  ],
  tampon: [
    { id: 'tampon-1', name: '탐팍스' },
    { id: 'tampon-2', name: '릴렛츠' },
    { id: 'tampon-3', name: '템포' },
    { id: 'tampon-4', name: '코튼라라' },
    { id: 'tampon-5', name: '나트라케어' },
  ],
  both: [
    { id: 'both-1', name: '좋은느낌' },
    { id: 'both-2', name: '화이트' },
    { id: 'both-3', name: '순수한면' },
    { id: 'both-4', name: '예지미인' },
    { id: 'both-5', name: '라엘 생리대' },
  ],
};

// 패키지 타입별 제목
const PACKAGE_TITLES: Record<PackageType, string> = {
  pad: '생리대 순위 매기기',
  tampon: '탐폰 순위 매기기',
  both: '탐폰 + 생리대 순위 매기기',
};

export default function RankingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageType = (searchParams.get('type') as PackageType) || 'pad';

  const [brands, setBrands] = useState<Brand[]>(BRAND_DATA[packageType]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBrands((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleNext = () => {
    // TODO: 순위 데이터 저장 및 다음 단계로 이동
    console.log('Final ranking:', brands);
    // router.push('/starter-review/complete');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          {'<'} 뒤로
        </button>
        <h1 className={styles.title}>{PACKAGE_TITLES[packageType]}</h1>
        <p className={styles.description}>가장 좋았던 생리대 브랜드 순서대로 드래그하세요</p>
      </header>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={brands.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className={styles.brandList}>
            {brands.map((brand, index) => (
              <SortableItem key={brand.id} id={brand.id} rank={index + 1} name={brand.name} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className={styles.footer}>
        <p className={styles.hint}>드래그하여 순위를 변경하세요</p>
        <button onClick={handleNext} className={styles.nextButton}>
          다음
        </button>
      </div>
    </section>
  );
}
