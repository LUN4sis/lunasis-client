import { Button } from '@web/components/ui/button';
import styles from './header.module.scss';

export interface HeaderProps {
  handleBackClick: () => void;
  hasSearch?: boolean;
}

export const Header = ({ handleBackClick, hasSearch = false }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <Button
        onClick={handleBackClick}
        variant="ghost"
        colorScheme="gray"
        className={styles.backButton}
      >
        <svg
          className={styles.backIcon}
          viewBox="0 0 24 24"
          width={24}
          height={24}
          fill="#000000"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z" />
        </svg>
      </Button>
      {hasSearch && (
        <Button variant="ghost" colorScheme="gray" className={styles.searchButton}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      )}
    </header>
  );
};

Header.displayName = 'Header';
