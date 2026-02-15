import { Button, type ButtonColorScheme, type ButtonVariant } from '@web/components/ui/button';
import clsx from 'clsx';
import Image from 'next/image';
import { isValidElement, memo, type ReactNode } from 'react';

import styles from './selection-group.module.scss';

interface SelectionGroupProps<T extends string> {
  options: Array<{
    key: T;
    display: string;
    subtitle?: string;
    icon?: ReactNode | string;
    disabled?: boolean;
  }>;

  selectedValue: T | T[];
  onSelect: (key: T) => void;
  multiple?: boolean;
  colorScheme?: ButtonColorScheme;
  variant?: ButtonVariant;
  layout: 'horizontal' | 'vertical' | 'grid' | 'card';
  gridColumns?: number;
  className?: string;
  ariaLabel?: string;
  showChevron?: boolean;
}

function SelectionGroupComponent<T extends string>({
  options,
  selectedValue,
  onSelect,
  colorScheme = 'purple',
  variant = 'solid',
  layout = 'horizontal',
  gridColumns = 3,
  className,
  ariaLabel,
  showChevron = false,
}: SelectionGroupProps<T>) {
  // check if option is selected
  const isSelected = (key: T): boolean =>
    Array.isArray(selectedValue) ? selectedValue.includes(key) : selectedValue === key;

  // Render icon helper
  const renderIcon = (icon: ReactNode | string | undefined) => {
    if (!icon) return null;

    // String path or URL
    // 문자열 경로 또는 URL
    if (typeof icon === 'string') {
      return <Image src={icon} alt="" width={24} height={24} className={styles.cardIcon} />;
    }

    // Next.js static image import (object with src, width, height, etc.)
    // Next.js 정적 이미지 import (src, width, height 등을 가진 객체)
    if (icon && typeof icon === 'object' && 'src' in icon) {
      return (
        <Image src={icon.src as string} alt="" width={24} height={24} className={styles.cardIcon} />
      );
    }

    // If it's a React component/element, render it directly
    // React 컴포넌트/요소인 경우 직접 렌더링
    if (isValidElement(icon)) {
      return <span className={styles.cardIcon}>{icon}</span>;
    }

    // Fallback for other types
    return null;
  };

  // Render chevron icon
  const renderChevron = () => {
    if (!showChevron) return null;
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.chevron}
      >
        <path
          d="M9 18L15 12L9 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div
      className={clsx(
        styles.container,
        {
          [styles['container--horizontal']]: layout === 'horizontal',
          [styles['container--vertical']]: layout === 'vertical',
          [styles['container--grid']]: layout === 'grid',
          [styles['container--card']]: layout === 'card',
        },
        className,
      )}
      style={layout === 'grid' ? { gridTemplateColumns: `repeat(${gridColumns}, 1fr)` } : undefined}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = isSelected(option.key);

        // Card layout rendering
        if (layout === 'card') {
          return (
            <Button
              key={option.key}
              type="button"
              variant="ghost"
              colorScheme={selected ? colorScheme : 'gray'}
              onClick={() => onSelect(option.key)}
              isSelected={selected}
              disabled={option.disabled}
              className={styles.cardButton}
            >
              {option.icon && (
                <div className={styles.cardIconWrapper}>{renderIcon(option.icon)}</div>
              )}
              <div className={styles.cardContent}>
                <span className={styles.cardTitle}>{option.display}</span>
                {option.subtitle && <span className={styles.cardSubtitle}>{option.subtitle}</span>}
              </div>
              {renderChevron()}
            </Button>
          );
        }

        // Default layout rendering
        return (
          <Button
            key={option.key}
            type="button"
            variant={variant}
            colorScheme={selected ? colorScheme : 'gray'}
            onClick={() => onSelect(option.key)}
            isSelected={selected}
            disabled={option.disabled}
          >
            {option.icon && renderIcon(option.icon)}
            {option.display}
          </Button>
        );
      })}
    </div>
  );
}

export const SelectionGroup = memo(SelectionGroupComponent) as typeof SelectionGroupComponent;
export type { SelectionGroupProps };
