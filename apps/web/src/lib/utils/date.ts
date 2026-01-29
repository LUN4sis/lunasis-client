import { SupportedLocale } from '@repo/shared/types';
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';

/**
 * DateOptions:
 * - fullDate: February 4th, 2025
 * - fullDateWithDay: February 4th, 2025, Tuesday
 * - time: 10:00 AM
 */
export type DateOptions = 'fullDate' | 'fullDateWithDay' | 'time'; // February 4th, 2025

// get date-fns locale
const getDateFnsLocale = (locale: SupportedLocale) => {
  return locale === 'ko' ? ko : enUS;
};

// get format pattern based on locale and option
const getFormatPattern = (locale: SupportedLocale, option: DateOptions): string => {
  if (locale === 'ko') {
    switch (option) {
      case 'fullDate':
        return 'yyyy년 M월 d일';
      case 'fullDateWithDay':
        return 'yyyy년 M월 d일 EEEE';
      case 'time':
        return 'HH:mm';
    }
  } else {
    switch (option) {
      case 'fullDate':
        return 'MMMM do, yyyy';
      case 'fullDateWithDay':
        return 'MMMM do, yyyy EEEE';
      case 'time':
        return 'hh:mm a';
    }
  }
};

// format date
export const formatDate = (
  date: Date | string | number,
  option: DateOptions,
  locale: SupportedLocale,
): string => {
  if (!locale) return '-';

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  // check if date is valid
  if (isNaN(dateObj.getTime())) return '-';

  // get date-fns locale from user's locale
  const dateFnsLocale = getDateFnsLocale(locale);
  const formatPattern = getFormatPattern(locale, option);

  return format(dateObj, formatPattern, { locale: dateFnsLocale });
};
