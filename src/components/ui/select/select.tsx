'use client';

import { useState, useMemo, useEffect } from 'react';
import styles from './select.module.scss';
import clsx from 'clsx';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import type { BirthDateSelection } from '@/features/onboarding/types/onboarding.type';

// return the last day of the month
const getLastDayOfMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

interface SelectProps {
  onChange?: (date: BirthDateSelection) => void;
  onValidityChange?: (isValid: boolean) => void;
  onSelectionChange?: (selection: BirthDateSelection) => void;
  error?: string;
  initialValue?: BirthDateSelection;
}

export const Select = ({
  onChange,
  onValidityChange,
  onSelectionChange,
  error,
  initialValue,
}: SelectProps) => {
  const [selectedYear, setSelectedYear] = useState(initialValue?.year || '');
  const [selectedMonth, setSelectedMonth] = useState(initialValue?.month || '');
  const [selectedDay, setSelectedDay] = useState(initialValue?.day || '');

  // pass the selected date to the parent component
  useEffect(() => {
    const selection = { year: selectedYear, month: selectedMonth, day: selectedDay };

    onSelectionChange?.(selection);

    if (selectedYear && selectedMonth && selectedDay) {
      onChange?.(selection);
      onValidityChange?.(true);
    } else {
      onValidityChange?.(false);
    }
  }, [selectedYear, selectedMonth, selectedDay, onChange, onValidityChange, onSelectionChange]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);
  }, []);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  }, []);

  const dayOptions = useMemo(() => {
    const year = parseInt(selectedYear, 10);
    const month = parseInt(selectedMonth, 10);
    if (year && month) {
      const daysInMonth = getLastDayOfMonth(year, month);
      return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }
    return [];
  }, [selectedYear, selectedMonth]);

  return (
    <div>
      <section className={styles.container}>
        {/* --- YYYY --- */}
        <section className={styles.selectWrapper}>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedMonth('');
              setSelectedDay('');
            }}
            className={clsx({ [styles.placeholder]: !selectedYear })}
          >
            <option value="" disabled>
              YYYY
            </option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ArrowDropDownIcon className={styles.chevronIcon} />
        </section>

        {/* --- MM --- */}
        <section className={styles.selectWrapper}>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setSelectedDay('');
            }}
            disabled={!selectedYear}
            className={clsx({ [styles.placeholder]: !selectedMonth })}
          >
            <option value="" disabled>
              MM
            </option>
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {String(month).padStart(2, '0')}
              </option>
            ))}
          </select>
          <ArrowDropDownIcon className={styles.chevronIcon} />
        </section>

        {/* --- DD --- */}
        <section className={styles.selectWrapper}>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            disabled={!selectedYear || !selectedMonth}
            className={clsx({ [styles.placeholder]: !selectedDay })}
          >
            <option value="" disabled>
              DD
            </option>
            {dayOptions.map((day) => (
              <option key={day} value={day}>
                {String(day).padStart(2, '0')}
              </option>
            ))}
          </select>
          <ArrowDropDownIcon className={styles.chevronIcon} />
        </section>
      </section>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};
