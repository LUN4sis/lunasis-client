import { Button } from '@/components/ui/button';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import styles from './header.module.scss';

export interface HeaderProps {
  handleBackClick: () => void;
}

export const Header = ({ handleBackClick }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <Button onClick={handleBackClick} variant="ghost" colorScheme="white">
        <ArrowBackIosNewIcon fontSize="small" color="inherit" />
      </Button>
    </header>
  );
};
