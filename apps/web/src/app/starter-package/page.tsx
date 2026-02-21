'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';

import styles from './starter-package.module.scss';

type PackageType = 'tampon' | 'pad' | 'both';

const CATEGORIES: Array<{
  key: PackageType;
  title: string;
  description: string;
  variant: 'both' | 'tampon' | 'pad';
}> = [
  {
    key: 'both',
    title: '탐폰 + 생리대',
    description: '모든 제품 리뷰하기',
    variant: 'both',
  },
  {
    key: 'tampon',
    title: '탐폰',
    description: '탐폰 제품만 리뷰하기',
    variant: 'tampon',
  },
  {
    key: 'pad',
    title: '생리대',
    description: '생리대 제품만 리뷰하기',
    variant: 'pad',
  },
];

export default function StarterReviewPage() {
  const router = useRouter();

  const handleCategorySelect = (key: PackageType) => {
    router.push(`/starter-package/ranking?type=${key}`);
  };

  return (
    <main className={styles.container} role="main">
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>스타터 패키지 리뷰</h1>
          <p className={styles.description}>받으신 제품 카테고리를 선택해주세요</p>
        </header>

        <nav className={styles.options} aria-label="제품 카테고리 선택">
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => handleCategorySelect(category.key)}
              className={clsx(styles.option, styles[`option--${category.variant}`])}
              aria-label={`${category.title}: ${category.description}`}
            >
              <div className={styles.optionContent}>
                <h2 className={styles.optionTitle}>{category.title}</h2>
                <p className={styles.optionDescription}>{category.description}</p>
              </div>
              <div className={styles.optionIndicator} aria-hidden>
                <ChevronRight />
              </div>
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
