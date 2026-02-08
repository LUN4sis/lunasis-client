'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TamponIcon from '@mui/icons-material/PriorityHighRounded';
import PadIcon from '@web/assets/icons/pad-outline.svg';
import PackageIcon from '@web/assets/icons/package-outline.svg';
import { SelectionGroup } from '@web/components/ui/selection-group';

import styles from './starter-review.module.scss';

type PackageType = 'tampon' | 'pad' | 'both';

export default function StarterReviewPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);

  const handleSelect = (key: PackageType) => {
    setSelectedPackage(key);
    // 순위 매기기 페이지로 이동
    router.push(`/starter-review/ranking?type=${key}`);
  };

  const options = [
    {
      key: 'tampon' as PackageType,
      display: '탐폰만',
      subtitle: '탐폰 제품만 포함된 패키지',
      icon: <TamponIcon />,
    },
    {
      key: 'pad' as PackageType,
      display: '생리대만',
      subtitle: '생리대 제품만 포함된 패키지',
      icon: PadIcon,
    },
    {
      key: 'both' as PackageType,
      display: '탐폰 + 생리대',
      subtitle: '두 종류 모두 포함된 패키지',
      icon: PackageIcon,
    },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>패키지 선택</h1>
          <p className={styles.description}>받으신 패키지 종류를 선택해주세요</p>
        </div>

        <SelectionGroup
          options={options}
          selectedValue={selectedPackage ?? ('' as PackageType)}
          onSelect={handleSelect}
          layout="vertical"
          colorScheme="purple"
          showChevron={true}
          ariaLabel="패키지 종류 선택"
        />
      </div>
    </section>
  );
}
