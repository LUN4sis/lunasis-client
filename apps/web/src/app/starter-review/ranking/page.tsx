'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Header } from '@web/features/products/components/header';
import { DraggableCard } from '@web/features/starter-package/components/draggable-card/draggable-card';
import { TAMPONS, SANITARY_PADS } from '@web/features/starter-package/constants/products.constant';
import styles from './ranking.module.scss';
import { Button } from '@web/components/ui/button/button';

type PackageType = 'tampon' | 'pad' | 'both';

type Product = (typeof TAMPONS | typeof SANITARY_PADS)[number];

const PACKAGE_TITLES: Record<PackageType, string> = {
  pad: '생리대 순위 매기기',
  tampon: '탐폰 순위 매기기',
  both: '탐폰 + 생리대 순위 매기기',
};

export default function RankingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageType = (searchParams.get('type') as PackageType) || 'pad';

  const [tamponItems, setTamponItems] = useState<Product[]>([...TAMPONS]);
  const [padItems, setPadItems] = useState<Product[]>([...SANITARY_PADS]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 탐폰 리스트 드래그 종료 핸들러
  const handleTamponDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTamponItems((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 생리대 리스트 드래그 종료 핸들러
  const handlePadDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPadItems((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 순위 데이터 저장 및 다음 단계로 이동
  const handleNext = () => {
    const finalRanking = {
      tampons: packageType === 'tampon' || packageType === 'both' ? tamponItems : [],
      pads: packageType === 'pad' || packageType === 'both' ? padItems : [],
    };
    console.log('Final ranking:', finalRanking);
    // TODO: 순위 데이터를 로컬 스토리지나 상태 관리에 저장
    router.push(`/starter-review/review?type=${packageType}`);
  };

  const handleBack = () => {
    router.back();
  };

  // 표시할 제품 리스트 결정
  const showTampons = packageType === 'tampon' || packageType === 'both';
  const showPads = packageType === 'pad' || packageType === 'both';

  return (
    <>
      <Header handleBackClick={handleBack} />
      <section className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>{PACKAGE_TITLES[packageType]}</h1>
            <p className={styles.description}>제품을 드래그하여 순서를 변경하세요</p>
          </div>

          <div className={styles.productLists}>
            {showTampons && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTamponDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                {packageType === 'both' && <h2 className={styles.sectionTitle}>탐폰</h2>}
                <SortableContext
                  items={tamponItems.map((item) => item.key)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.brandList}>
                    {tamponItems.map((product, index) => (
                      <DraggableCard key={product.key} product={product} rank={index + 1} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {showPads && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePadDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                {packageType === 'both' && <h2 className={styles.sectionTitle}>생리대</h2>}
                <SortableContext
                  items={padItems.map((item) => item.key)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.brandList}>
                    {padItems.map((product, index) => (
                      <DraggableCard key={product.key} product={product} rank={index + 1} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className={styles.footer}>
            <Button colorScheme="purple" className={styles.nextButton} onClick={handleNext}>
              다음
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
