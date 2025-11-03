import styles from './tab.module.scss';
import clsx from 'clsx';

interface TabProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tab({ tabs, activeTab, onTabChange }: TabProps) {
  return (
    <div className={styles.container}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={clsx(styles.tab, activeTab === tab.id && styles['tab--active'])}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          className={clsx(styles.tabPanel, activeTab === tab.id && styles['tabPanel--active'])}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
