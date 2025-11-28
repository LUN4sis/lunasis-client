import { memo } from 'react';
import { Button } from '@web/components/ui/button';
import type { ButtonColorScheme, ButtonVariant } from '@web/components/ui/button';

import clsx from 'clsx';
import styles from './selection-group.module.scss';

interface SelectionGroupProps<T extends string> {
  options: Array<{
    key: T;
    display: string;
    disabled?: boolean;
  }>;

  selectedValue: T | T[];
  onSelect: (key: T) => void;
  multiple?: boolean;
  colorScheme?: ButtonColorScheme;
  variant?: ButtonVariant;
  layout: 'horizontal' | 'vertical' | 'grid';
  gridColumns?: number;
  className?: string;
  ariaLabel?: string;
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
}: SelectionGroupProps<T>) {
  // check if option is selected
  const isSelected = (key: T): boolean =>
    Array.isArray(selectedValue) ? selectedValue.includes(key) : selectedValue === key;

  return (
    <div
      className={clsx(
        styles.container,
        {
          [styles['container--horizontal']]: layout === 'horizontal',
          [styles['container--vertical']]: layout === 'vertical',
          [styles['container--grid']]: layout === 'grid',
        },
        className,
      )}
      style={layout === 'grid' ? { gridTemplateColumns: `repeat(${gridColumns}, 1fr)` } : undefined}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = isSelected(option.key);
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
            {option.display}
          </Button>
        );
      })}
    </div>
  );
}

export const SelectionGroup = memo(SelectionGroupComponent) as typeof SelectionGroupComponent;
export type { SelectionGroupProps };
